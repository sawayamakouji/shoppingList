import React, { useState, useRef, useEffect } from 'react';
import Webcam from 'react-webcam';
import { Camera, Upload, Trash2, Mic, Plus, Tag, Star } from 'lucide-react';
import { supabase, type ShoppingItem } from '../lib/supabase'; // Supabase 初期化モジュール

type Priority = 'must' | 'preferred' | 'optional';

const CATEGORIES = ['食品', '日用品', '野菜・果物', '飲み物', 'その他'];

// 音声通知用関数
function speak(message: string) {
  const utterance = new SpeechSynthesisUtterance(message);
  utterance.lang = 'ja-JP';
  window.speechSynthesis.speak(utterance);
}

// 買い物リスト表示・手動追加用コンポーネント
export function ShoppingList() {
  const [items, setItems] = useState<ShoppingItem[]>([]);
  const [newItemName, setNewItemName] = useState('');
  const [selectedPriority, setSelectedPriority] = useState<Priority>('preferred');
  const [loading, setLoading] = useState(true);
  const [confirmDeleteItem, setConfirmDeleteItem] = useState<ShoppingItem | null>(null);

  useEffect(() => {
    fetchItems();
  }, []);

  async function fetchItems() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data, error } = await supabase
        .from('shopping_items')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setItems(data || []);
    } catch (error) {
      console.error('Error fetching items:', error);
    } finally {
      setLoading(false);
    }
  }

  // 手動追加ボタン用
  async function addItem() {
    if (!newItemName.trim()) return;
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) throw new Error("ユーザーが認証されていません");
      const { error } = await supabase.from('shopping_items').insert([
        {
          name: newItemName.trim(),
          priority: selectedPriority,
          category: 'その他',
          user_id: user.id,
        },
      ]);
      if (error) throw error;
      setNewItemName('');
      fetchItems();
      speak('商品を追加しました');
    } catch (error) {
      console.error('Error adding item:', error);
    }
  }

  async function toggleItemComplete(item: ShoppingItem) {
    try {
      const { error } = await supabase
        .from('shopping_items')
        .update({ completed: !item.completed })
        .eq('id', item.id);
      if (error) throw error;
      fetchItems();
    } catch (error) {
      console.error('Error updating item:', error);
    }
  }

  async function deleteItem(item: ShoppingItem) {
    try {
      const { error } = await supabase
        .from('shopping_items')
        .delete()
        .eq('id', item.id);
      if (error) throw error;
      speak('商品を削除しました');
      fetchItems();
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  }

  if (loading) {
    return <div className="text-center py-8 text-2xl">読み込み中...</div>;
  }

  return (
    <div className="space-y-6 p-6"> {/* 全体の余白も拡大 */}
      {/* 手動追加フォーム */}
      <div className="bg-white shadow rounded-lg p-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-4 sm:space-y-0">
          <div className="flex-1">
            <input
              type="text"
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              placeholder="商品名を入力"
              className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg" // text-base -> text-lg
            />
          </div>
          <button
            onClick={() => {}}
            className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100"
          >
            <Mic className="h-6 w-6" /> {/* アイコンサイズも若干アップ */}
          </button>
          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value as Priority)}
            className="px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg" // text-base -> text-lg
          >
            <option value="must">絶対買う</option>
            <option value="preferred">あったらでいい</option>
            <option value="optional">気が向いたら</option>
          </select>
          <button
            onClick={async () => await addItem()}
            className="inline-flex items-center px-4 py-3 border border-transparent text-lg font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700" // text-sm -> text-lg, pyも少し大きめ
          >
            <Plus className="h-6 w-6 mr-2" />
            追加
          </button>
        </div>
      </div>

      {/* 買い物リスト表示 */}
      <div className="bg-white shadow rounded-lg divide-y divide-gray-200">
        {CATEGORIES.map((category) => {
          const categoryItems = items.filter(item => item.category === category);
          if (categoryItems.length === 0) return null;
          return (
            <div key={category} className="p-6">
              <h3 className="text-2xl font-medium text-gray-900 mb-4">{category}</h3> {/* text-xl -> text-2xl */}
              <ul className="space-y-3">
                {categoryItems.map(item => (
                  <li key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <button
                      onClick={() => toggleItemComplete(item)}
                      className="flex items-center flex-1"
                    >
                      <span className={`flex items-center ${item.completed ? 'line-through text-gray-400' : 'text-xl'}`}>
                        {item.priority === 'must' && <Star className="h-6 w-6 text-yellow-500 mr-2" />} {/* h-5 -> h-6 */}
                        <span className="text-3xl font-bold">{item.name}</span> {/* 商品名をさらに大きく */}
                      </span>
                    </button>
                    <div className="flex items-center space-x-2">
                      <Tag className="h-6 w-6 text-gray-400" /> {/* アイコンサイズアップ */}
                      <span className="text-lg text-gray-500">
                        {item.priority === 'must'
                          ? '絶対買う'
                          : item.priority === 'preferred'
                          ? 'あったらでいい'
                          : '気が向いたら'}
                      </span>
                      {confirmDeleteItem && confirmDeleteItem.id === item.id ? (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => {
                              deleteItem(item);
                              setConfirmDeleteItem(null);
                            }}
                            className="px-2 py-1 bg-red-600 text-white rounded text-lg" // text-base -> text-lg
                          >
                            削除する
                          </button>
                          <button
                            onClick={() => setConfirmDeleteItem(null)}
                            className="px-2 py-1 bg-yellow-300 text-gray-800 rounded text-lg"
                          >
                            削除しない
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            setConfirmDeleteItem(item);
                            speak('削除しますか？');
                          }}
                          className="p-1 text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="h-6 w-6" />
                        </button>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// OCRCapture コンポーネント：タブ切替で「OCR読み取り」と「直接Gemini入力」の 2 パターンを実装
export function OCRCapture() {
  const [activeTab, setActiveTab] = useState<"ocr" | "direct">("ocr");
  const [ocrResult, setOcrResult] = useState('');
  const [geminiResult, setGeminiResult] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [videoConstraints] = useState<{ facingMode: string }>({
    facingMode: "environment", // 背面カメラ利用
  });

  const webcamRef = useRef<Webcam>(null);

  // OCR 経由の処理：画像からテキスト抽出 → Gemini API にテキスト送信
  const processOCR = async (imageSrc: string) => {
    setLoading(true);
    setErrorMessage('');
    try {
      const base64Image = imageSrc.split(',')[1];
      const visionApiKey = import.meta.env.VITE_GOOGLE_CLOUD_VISION_API_KEY;
      const visionRequestBody = {
        requests: [
          {
            image: { content: base64Image },
            features: [{ type: 'TEXT_DETECTION', maxResults: 1 }],
          },
        ],
      };

      const visionResponse = await fetch(
        `https://vision.googleapis.com/v1/images:annotate?key=${visionApiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(visionRequestBody),
        }
      );
      const visionResult = await visionResponse.json();
      const extractedText = visionResult.responses?.[0]?.fullTextAnnotation?.text || '';
      if (!extractedText) {
        throw new Error('OCR結果が空です');
      }
      setOcrResult(extractedText);
      await processGemini(extractedText);
    } catch (error) {
      console.error('OCR error:', error);
      setOcrResult('読み取りに失敗しました');
      setErrorMessage('OCR処理でエラーが発生しました。' + (error instanceof Error ? error.message : ''));
    } finally {
      setLoading(false);
    }
  };

  // Gemini API にテキスト入力（OCR 経由）の場合
  const processGemini = async (ocrText: string) => {
    setLoading(true);
    setErrorMessage('');
    try {
      const promptText = `以下のテキストから、買い物リストとして適切な商品名と数量（あれば）を抽出してください。\n\n${ocrText}`;
      const modelName = "gemini-2.0-flash";
      const geminiApiKey = import.meta.env.VITE_GOOGLE_AI_STUDIO_API_KEY;
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${geminiApiKey}`;
      const geminiRequestBody = {
        contents: [
          {
            role: "user",
            parts: [{ text: promptText }],
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

      const geminiResponse = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(geminiRequestBody),
      });
      const geminiResultJson = await geminiResponse.json();

      if (geminiResultJson.error) {
        console.error("Gemini API error:", geminiResultJson.error);
        setGeminiResult("変換に失敗しました");
        setErrorMessage(`Gemini API エラー: ${geminiResultJson.error.message || JSON.stringify(geminiResultJson.error)}`);
      } else {
        const shoppingListText = geminiResultJson.candidates?.[0]?.content?.parts?.[0]?.text || "";
        if (!shoppingListText) {
          throw new Error("Gemini APIから有効なテキストが返されませんでした");
        }
        setGeminiResult(shoppingListText);
      }
    } catch (error) {
      console.error("Gemini API error:", error);
      setGeminiResult("変換に失敗しました");
      setErrorMessage("Gemini API 呼び出し中にエラーが発生しました。" + (error instanceof Error ? error.message : ""));
    } finally {
      setLoading(false);
    }
  };

  // 直接 Gemini への入力：画像とプロンプトをマルチモーダルで送信
  const processGeminiFromImage = async (imageSrc: string) => {
    setLoading(true);
    setErrorMessage('');
    try {
      const promptText = "以下の画像から、買い物リストとして適切な商品名と数量（あれば）を抽出してください。";
      const [prefix, base64Data] = imageSrc.split(',');
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

      const geminiResponse = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(geminiRequestBody),
      });
      const geminiResultJson = await geminiResponse.json();

      if (geminiResultJson.error) {
        console.error("Gemini API error:", geminiResultJson.error);
        setGeminiResult("変換に失敗しました");
        setErrorMessage(`Gemini API エラー: ${geminiResultJson.error.message || JSON.stringify(geminiResultJson.error)}`);
      } else {
        const shoppingListText = geminiResultJson.candidates?.[0]?.content?.parts?.[0]?.text || "";
        if (!shoppingListText) {
          throw new Error("Gemini APIから有効なテキストが返されませんでした");
        }
        setGeminiResult(shoppingListText);
      }
    } catch (error) {
      console.error("Gemini API error:", error);
      setGeminiResult("変換に失敗しました");
      setErrorMessage("Gemini API 呼び出し中にエラーが発生しました。" + (error instanceof Error ? error.message : ""));
    } finally {
      setLoading(false);
    }
  };

  // カメラで撮影した画像を取得し、選択中のタブに応じた処理を実行
  const captureImage = () => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      if (imageSrc) {
        setCapturedImage(imageSrc);
        setShowCamera(false);
        if (activeTab === "ocr") {
          processOCR(imageSrc);
        } else {
          processGeminiFromImage(imageSrc);
        }
      }
    }
  };

  // 画像アップロード時の処理
  const handleUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result;
        const imageSrc = typeof result === "string" ? result : "";
        setCapturedImage(imageSrc);
        if (activeTab === "ocr") {
          processOCR(imageSrc);
        } else {
          processGeminiFromImage(imageSrc);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const addItemToShoppingList = async (itemText: string) => {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error("ユーザーが認証されていません");
      }
      const { error } = await supabase.from('shopping_items').insert([
        {
          name: itemText,
          priority: "preferred", // 固定例
          category: "その他",
          user_id: user.id,
        },
      ]);
      if (error) throw error;
      alert("買い物リストに追加しました");
    } catch (error) {
      console.error("Supabase addItem error:", error);
      alert("買い物リストへの追加に失敗しました: " + (error instanceof Error ? error.message : JSON.stringify(error)));
    }
  };

  const handleAddToShoppingList = () => {
    if (!geminiResult) return;
    const confirmed = window.confirm("この内容で買い物リストに追加しますか？");
    if (confirmed) {
      const items = geminiResult
        .split('\n')
        .map(line => line.trim())
        .filter(line => line && !line.includes("買い物リスト"));
      items.forEach(item => {
        addItemToShoppingList(item);
      });
    } else {
      alert("追加をキャンセルしました");
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* タブ切り替え UI */}
      <div className="flex justify-center space-x-4 mb-4">
        <button
          onClick={() => setActiveTab("ocr")}
          className={`px-4 py-2 border rounded ${activeTab === "ocr" ? "bg-green-600 text-white" : "bg-white text-gray-800"} text-xl`}
        >
          OCR読み取り
        </button>
        <button
          onClick={() => setActiveTab("direct")}
          className={`px-4 py-2 border rounded ${activeTab === "direct" ? "bg-green-600 text-white" : "bg-white text-gray-800"} text-xl`}
        >
          直接Gemini入力
        </button>
      </div>

      {/* 画像取得＆処理用 UI */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="text-center">
          <h2 className="text-2xl font-medium text-gray-900">
            {activeTab === "ocr" ? "OCR読み取り & 買い物リスト変換" : "画像から買い物リスト変換"}
          </h2>
          <p className="mt-1 text-xl text-gray-500">
            {activeTab === "ocr"
              ? "画像からテキストを抽出し、買い物リストとして整形します。"
              : "画像から品物っぽいモノを読み取って、買い物リストとして整形します。"}
          </p>
          <div className="mt-6">
            <button
              onClick={() => setShowCamera(true)}
              className="inline-flex items-center px-6 py-3 border border-transparent text-xl font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
            >
              <Camera className="h-6 w-6 mr-2" />
              カメラで撮影
            </button>
            <p className="mt-2 text-xl text-gray-500">または</p>
            <label className="mt-2 inline-flex items-center px-6 py-3 border border-gray-300 shadow-sm text-xl font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 cursor-pointer">
              <Upload className="h-6 w-6 mr-2" />
              画像をアップロード
              <input type="file" accept="image/*" className="hidden" /* onChange={handleUpload} */ />
            </label>
          </div>
        </div>
      </div>

      {loading && <p className="text-center text-gray-500 text-xl">処理中...</p>}

      {errorMessage && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative text-xl" role="alert">
          <strong className="font-bold">エラー:</strong>
          <span className="block sm:inline">{errorMessage}</span>
        </div>
      )}

      {geminiResult && (
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-xl font-medium text-gray-900 mb-4">買い物リスト候補</h3>
          <pre className="whitespace-pre-wrap text-gray-800 text-xl">{geminiResult}</pre>
          <button
            onClick={() => {}}
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-xl font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
          >
            この内容で追加する
          </button>
        </div>
      )}
    </div>
  );
}