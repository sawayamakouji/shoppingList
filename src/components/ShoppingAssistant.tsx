import React, { useState, useRef, useEffect } from "react";
import { Smile, Frown, Search } from "lucide-react";
import { supabase } from "../lib/supabase";

export default function ShoppingAssistant() {
  const [image, setImage] = useState(null);
  const [recognizedItem, setRecognizedItem] = useState("まだ何も判定してないで");
  const [shoppingList, setShoppingList] = useState([]);
  const fileInputRef = useRef(null);
  const [voiceResponse, setVoiceResponse] = useState("");
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);
  const [reactionIcon, setReactionIcon] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const videoRef = useRef(null);  // video要素への参照
  const canvasRef = useRef(null); // canvas要素への参照
  const [hasCamera, setHasCamera] = useState(false);

  useEffect(() => {
    fetchShoppingList();
    // カメラへのアクセスを試みる
    const getVideo = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } }); // 背面カメラを指定
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setHasCamera(true);
        }
      } catch (err) {
        console.error("カメラへのアクセスエラー:", err);
        setHasCamera(false);
      }
    };

    getVideo();
  }, []);

  const fetchShoppingList = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data, error } = await supabase
        .from("shopping_items")
        .select("name");
      if (error) throw error;
      setShoppingList(data.map(item => item.name));
    } catch (error) {
      console.error("買い物リストの取得エラー", error);
    }
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setImage(URL.createObjectURL(file));
      recognizeItem(file);
    }
  };

  const recognizeItem = async (imageSource) => {
    setIsLoading(true);
    try {
      const apiKey = import.meta.env.VITE_GOOGLE_CLOUD_VISION_API_KEY;
      const response = await fetch(
        `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            requests: [{
              image: { content: imageSource }, // base64
              features: [{ type: "LABEL_DETECTION", maxResults: 1 }],
            }],
          }),
        }
      );
      const data = await response.json();

      if (!data || !data.responses || data.responses.length === 0) {
        throw new Error("画像認識の結果がありませんでした。");
      }

      const detectedItem = data.responses?.[0]?.labelAnnotations?.[0]?.description || "不明";
      setRecognizedItem(`${detectedItem}（たぶんやで！）`);
      generateVoiceResponse(`これは${detectedItem}ですか？`);
    } catch (error) {
      console.error("画像認識エラー", error);
      setRecognizedItem("認識に失敗したで");
      setVoiceResponse("申し訳ありません。認識に失敗しました。");
      speak("申し訳ありません。認識に失敗しました。");
    } finally {
      setIsLoading(false);
    }
  };

  const toBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  const generateVoiceResponse = async (command) => {
    setIsLoading(true);
    try {
      const apiKey = import.meta.env.VITE_GOOGLE_AI_STUDIO_API_KEY;
      const prompt = `あなたは買い物アシスタントです。ユーザーの買い物リストは ${shoppingList.join(", ")} です。ユーザーがアップロードした画像から ${recognizedItem} を認識しました。ユーザーの質問は ${command} です。日本語で簡潔に答えてください。`;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ role: "user", parts: [{ text: prompt }] }],
          }),
        }
      );

      const data = await response.json();

      if (!data || !data.candidates || data.candidates.length === 0) {
        throw new Error("AIからの応答がありませんでした。");
      }

      const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || "わからへんわ…";
      setVoiceResponse(aiResponse);
      speak(aiResponse);
    } catch (error) {
      console.error("Gemini API エラー", error);
      setVoiceResponse("エラーが発生したで");
      speak("エラーが発生したで");
    } finally {
      setIsLoading(false);
    }
  };

  const speak = (message) => {
    const utterance = new SpeechSynthesisUtterance(message);
    utterance.lang = "ja-JP";
    window.speechSynthesis.speak(utterance);
  };

  const startListening = () => {
    if (!('webkitSpeechRecognition' in window)) {
      alert("このブラウザは音声認識をサポートしていません。");
      return;
    }
    const recognition = new webkitSpeechRecognition();
    recognition.lang = "ja-JP";
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      generateVoiceResponse(transcript);
    };
    recognition.start();
    recognitionRef.current = recognition;
  };

  const askIfInShoppingList = () => {
    generateVoiceResponse(`買い物リストに${recognizedItem}はありますか？`);
  };

  const takePicture = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      const imageBase64 = canvas.toDataURL('image/jpeg').split(',')[1]; // Base64データ部分のみ抽出
      setImage(`data:image/jpeg;base64,${imageBase64}`); //プレビュー表示用
      recognizeItem(imageBase64); // Base64データを渡す
    }
  };

  return (
    <div className="p-4 text-center">
      <h1 className="text-xl font-bold mb-4">買い物アシスタント</h1>
      {hasCamera ? (
        <>
          <video ref={videoRef} autoPlay playsInline className="w-64 h-64 object-cover mx-auto"></video>
          <button onClick={takePicture} disabled={isLoading}>写真を撮る</button>
          <canvas ref={canvasRef} style={{ display: 'none' }}></canvas> {/* canvasは非表示 */}
        </>
      ) : (
        <p>カメラへのアクセスを許可してください。</p>
      )}
      <div className="mb-4">
        <input type="file" ref={fileInputRef} onChange={handleImageUpload} disabled={isLoading} style={{display: 'none'}}/>
        <button onClick={() => fileInputRef.current.click()} disabled={isLoading}>ファイルから選択</button> {/* ファイル選択ボタン */}
      </div>
      {image && (
        <div className="mb-4">
          <img src={image} alt="商品" className="w-64 h-64 object-cover mx-auto" />
        </div>
      )}
      <div className="mb-4">
        <p className="text-lg">判定結果: {recognizedItem}</p>
        <p className="text-lg text-blue-600">{voiceResponse}</p>
        {isLoading && <p>Loading...</p>}
      </div>
      <div className="flex justify-center gap-4">
        <button onClick={startListening} disabled={isLoading}>
          <Search className="w-5 h-5 mr-2" />
          {isListening ? "音声認識中…" : "音声で聞く"}
        </button>
        <button onClick={askIfInShoppingList} disabled={isLoading}>
          買い物リストにありますか？
        </button>
      </div>
    </div>
  );
}