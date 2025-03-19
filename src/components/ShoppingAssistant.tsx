import React, { useState, useRef, useEffect } from "react";
import Webcam from "react-webcam";
import { Smile, Frown, Search, Camera, Upload } from "lucide-react";
import { supabase } from "../lib/supabase";

export default function ShoppingAssistant() {
  const [image, setImage] = useState(null);
  const [recognizedItem, setRecognizedItem] = useState("まだ何も判定してないで");
  const [shoppingList, setShoppingList] = useState([]);
  const [voiceResponse, setVoiceResponse] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasCamera, setHasCamera] = useState(true); // カメラ利用可否 state
  const webcamRef = useRef(null);
  const [errorMessage, setErrorMessage] = useState(""); // エラーメッセージ用state

  const videoConstraints = {
    facingMode: "environment", // 背面カメラ利用
  };

  useEffect(() => {
    fetchShoppingList();
    // カメラへのアクセスを試みる
    const getVideo = async () => {
      try {
        await navigator.mediaDevices.getUserMedia({ video: videoConstraints });
        setHasCamera(true);
      } catch (err) {
        console.error("カメラへのアクセスエラー:", err);
        setHasCamera(false);
        setErrorMessage(`カメラへのアクセスに失敗しました: ${err.message}`);
      }
    };
    getVideo();
  }, []);

  const fetchShoppingList = async () => {
    setIsLoading(true);
    setErrorMessage("");
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data, error } = await supabase
        .from("shopping_items")
        .select("name");
      if (error) {
        throw new Error(`買い物リストの取得に失敗しました: ${error.message}`);
      }
      setShoppingList(data.map(item => item.name));
    } catch (error) {
      console.error("買い物リストの取得エラー", error);
      setErrorMessage(`買い物リストの取得に失敗しました: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = (event) => {
    setErrorMessage("");
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result;
        const imageSrc = typeof result === "string" ? result : "";
        setImage(imageSrc);
        recognizeItem(imageSrc);
      };
      reader.onerror = (error) => {
        console.error("ファイル読み込みエラー:", error);
        setErrorMessage(`ファイル読み込みエラー: ${error.message}`);
      };
      reader.readAsDataURL(file);
    }
  };

  const recognizeItem = async (imageSource) => {
    setIsLoading(true);
    setErrorMessage("");
    try {
      const apiKey = import.meta.env.VITE_GOOGLE_CLOUD_VISION_API_KEY;
      const response = await fetch(
        `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            requests: [{
              image: { content: imageSource.split(',')[1] },
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
      // Gemini API 呼び出しに画像データを渡す
      generateVoiceResponse(`これは${detectedItem}ですか？`, imageSource);
    } catch (error) {
      console.error("画像認識エラー", error);
      setRecognizedItem("認識に失敗したで");
      setVoiceResponse("申し訳ありません。認識に失敗しました。");
      speak("申し訳ありません。認識に失敗しました。");
      setErrorMessage(`画像認識エラー: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Gemini API を直接呼び出して、マルチモーダルリクエストを送る処理
  const generateVoiceResponse = async (command, imageSource) => {
    setIsLoading(true);
    setErrorMessage("");
    try {
      // プロンプトに必要な情報を作成
      const promptText = `あなたは買い物アシスタントです。ユーザーの買い物リストは ${shoppingList.join(
        ", "
      )} です。ユーザーがアップロードした画像から ${recognizedItem} を認識しました。ユーザーの質問は ${command} です。日本語で簡潔に答えてください。`;
      const [prefix, base64Data] = imageSource.split(",");
      const mimeTypeMatch = prefix.match(/data:(.*?);base64/);
      const mimeType = mimeTypeMatch ? mimeTypeMatch[1] : "image/jpeg";
      const modelName = "gemini-2.0-flash";
      const geminiApiKey = import.meta.env.VITE_GOOGLE_AI_STUDIO_API_KEY;
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${geminiApiKey}`;

      const geminiRequestBody = {
        contents: [
          {
            role: "user",
            parts: [{ text: promptText }],
          },
          {
            role: "user",
            parts: [{ inlineData: { data: base64Data, mimeType: mimeType } }],
          },
        ],
        generationConfig: {
          temperature: 0.5,
          topK: 64,
          topP: 0.95,
          maxOutputTokens: 100,
          responseMimeType: "text/plain",
        },
      };

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(geminiRequestBody),
      });
      const data = await response.json();

      if (data.error) {
        throw new Error(
          `Gemini API エラー: ${data.error.message || JSON.stringify(data.error)}`
        );
      }

      const aiResponse =
        data.candidates?.[0]?.content?.parts?.[0]?.text || "わからへんわ…";
      setVoiceResponse(aiResponse);
      speak(aiResponse);
    } catch (error) {
      console.error("Gemini API エラー", error);
      setVoiceResponse("エラーが発生したで");
      speak("エラーが発生したで");
      setErrorMessage(`Gemini API エラー: ${error.message}`);
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
    if (!("webkitSpeechRecognition" in window)) {
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
      generateVoiceResponse(transcript, image);
    };
    recognition.start();
  };

  const askIfInShoppingList = () => {
    generateVoiceResponse(`買い物リストに${recognizedItem}はありますか？`, image);
  };

  const captureImage = () => {
    setErrorMessage("");
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      if (imageSrc) {
        setImage(imageSrc);
        recognizeItem(imageSrc);
      }
    }
  };

  return (
    <div className="p-4 text-center">
      <h1 className="text-xl font-bold mb-4">買い物アシスタント</h1>
      {hasCamera ? (
        <div className="mb-4">
          <Webcam
            audio={false}
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            videoConstraints={videoConstraints}
            className="w-64 h-64 object-cover mx-auto"
          />
          <button
            onClick={captureImage}
            disabled={isLoading}
            className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-md"
          >
            写真を撮る
          </button>
        </div>
      ) : (
        <p className="text-red-500">カメラへのアクセスを許可してください。</p>
      )}
      <div className="mb-4">
        <input
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          disabled={isLoading}
          style={{ display: "none" }}
          id="fileInput"
        />
        <label
          htmlFor="fileInput"
          className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
        >
          <Upload className="h-5 w-5 mr-2" />
          ファイルから選択
        </label>
      </div>
      {image && (
        <div className="mb-4">
          <img
            src={image}
            alt="商品"
            className="w-64 h-64 object-cover mx-auto"
          />
        </div>
      )}
      <div className="mb-4">
        <p className="text-lg">判定結果: {recognizedItem}</p>
        <p className="text-lg text-blue-600">{voiceResponse}</p>
        {isLoading && <p>Loading...</p>}
        {errorMessage && (
          <p className="text-red-500">{errorMessage}</p>
        )}
      </div>
      <div className="flex justify-center gap-4">
        <button
          onClick={startListening}
          disabled={isLoading}
          className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
        >
          <Search className="h-5 w-5 mr-2" />
          音声で聞く
        </button>
        <button
          onClick={askIfInShoppingList}
          disabled={isLoading}
          className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
        >
          買い物リストにありますか？
        </button>
      </div>
    </div>
  );
}
