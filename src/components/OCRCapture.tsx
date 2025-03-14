import React, { useState, useRef, useEffect } from 'react';
import Webcam from 'react-webcam';
import { Camera, Upload, Trash2, Mic, Plus, Tag, Star } from 'lucide-react';
import { supabase, type ShoppingItem } from '../lib/supabase'; // Supabase 初期化モジュール

type Priority = 'must' | 'preferred' | 'optional';

const CATEGORIES = ['食品', '日用品', '野菜・果物', '飲み物', 'その他'];

function speak(message: string) {
  const utterance = new SpeechSynthesisUtterance(message);
  utterance.lang = 'ja-JP';
  window.speechSynthesis.speak(utterance);
}

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

  // 手動追加ボタン用：認証済みユーザー情報を取得してテーブルに挿入する
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
    return <div className="text-center py-8">読み込み中...</div>;
  }

  return (
    <div className="space-y-6">
      {/* 手動追加フォーム */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-4 sm:space-y-0">
          <div className="flex-1">
            <input
              type="text"
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              placeholder="商品名を入力"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            onClick={() => {}}
            className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100"
          >
            <Mic className="h-6 w-6" />
          </button>
          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value as Priority)}
            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="must">絶対買う</option>
            <option value="preferred">あったらでいい</option>
            <option value="optional">気が向いたら</option>
          </select>
          <button
            onClick={async () => await addItem()}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-5 w-5 mr-2" />
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
              <h3 className="text-xl font-medium text-gray-900 mb-4">{category}</h3>
              <ul className="space-y-3">
                {categoryItems.map(item => (
                  <li key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <button
                      onClick={() => toggleItemComplete(item)}
                      className="flex items-center flex-1"
                    >
                      <span className={`flex items-center ${item.completed ? 'line-through text-gray-400' : ''}`}>
                        {item.priority === 'must' && <Star className="h-5 w-5 text-yellow-500 mr-2" />}
                        {item.name}
                      </span>
                    </button>
                    <div className="flex items-center space-x-2">
                      <Tag className="h-5 w-5 text-gray-400" />
                      <span className="text-sm text-gray-500">
                        {item.priority === 'must' ? '絶対買う'
                          : item.priority === 'preferred' ? 'あったらでいい'
                          : '気が向いたら'}
                      </span>
                      {confirmDeleteItem && confirmDeleteItem.id === item.id ? (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => {
                              deleteItem(item);
                              setConfirmDeleteItem(null);
                            }}
                            className="px-2 py-1 bg-red-600 text-white rounded"
                          >
                            削除する
                          </button>
                          <button
                            onClick={() => setConfirmDeleteItem(null)}
                            className="px-2 py-1 bg-yellow-300 text-gray-800 rounded"
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
                          <Trash2 className="h-5 w-5" />
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

export function OCRCapture() {
  const [showCamera, setShowCamera] = useState(false);
  const [ocrResult, setOcrResult] = useState('');
  const [geminiResult, setGeminiResult] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [videoConstraints, setVideoConstraints] = useState<{ facingMode: string }>({
    facingMode: "user", // デフォルトはフロントカメラ
  });

  const webcamRef = useRef<Webcam>(null);
  // 📌 デバイスに応じてカメラを自動設定
  useEffect(() => {
    async function setCameraMode() {
      try {
        // 一時的にカメラを開いてデバイス情報を取得
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        const devices = await navigator.mediaDevices.enumerateDevices();
        stream.getTracks().forEach(track => track.stop()); // カメラを閉じる

        // 背面カメラがあるか確認
        const hasBackCamera = devices.some(
          (device) => device.kind === "videoinput" && device.label.toLowerCase().includes("back")
        );

        // 背面カメラがあるなら `environment` を設定
        setVideoConstraints({
          facingMode: hasBackCamera ? "environment" : "user",
        });
      } catch (error) {
        console.error("カメラデバイスの取得に失敗しました:", error);
        setVideoConstraints({ facingMode: "user" }); // エラー時はフロントカメラを使用
      }
    }    setCameraMode();
  }, []);
  // OCR処理：Google Cloud Vision API を使って画像からテキスト抽出し、Gemini 連携を実施
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

  // Gemini API 呼び出し：Gemini 2.0 Flash を利用して買い物リスト形式に変換する
  const processGemini = async (ocrText: string) => {
    setLoading(true);
    setErrorMessage('');
    try {
      const promptText = `以下のテキストから、買い物リストとして適切な商品名と数量（あれば）を箇条書きにしてください。\n\n${ocrText}`;
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

  // カメラで撮影した画像を取得し、OCR処理へ渡す
  const captureImage = () => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      if (imageSrc) {
        setCapturedImage(imageSrc);
        setShowCamera(false);
        processOCR(imageSrc);
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
        processOCR(imageSrc);
      };
      reader.readAsDataURL(file);
    }
  };

  // Supabase に買い物リストアイテムを追加する関数
  const addItemToShoppingList = async (itemText: string) => {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error("ユーザーが認証されていません");
      }
      const { error } = await supabase.from('shopping_items').insert([
        {
          name: itemText,
          priority: "preferred", // 例として 'preferred'
          category: "その他",    // 固定で 'その他'
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

 // 「買い物リストに追加」ボタン押下時の処理
const handleAddToShoppingList = () => {
  if (!geminiResult) return;
  const confirmed = window.confirm("この内容で買い物リストに追加しますか？");
  if (confirmed) {
    // 各行をトリムしたあと、"買い物リスト" や "買物リスト" という見出しを除外する
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
    <div className="space-y-6">
      {/* OCR & Gemini 変換用 UI */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="text-center">
          <h2 className="text-lg font-medium text-gray-900">
            メモ・レシート読み取り & 買い物リスト変換
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            画像からテキストを抽出し、買い物リストとして整形します。
          </p>
          <div className="mt-6">
            <button
              onClick={() => setShowCamera(true)}
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              <Camera className="h-6 w-6 mr-2" />
              カメラで撮影
            </button>
            <p className="mt-2 text-sm text-gray-500">または</p>
            <label className="mt-2 inline-flex items-center px-6 py-3 border border-gray-300 shadow-sm text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 cursor-pointer">
              <Upload className="h-6 w-6 mr-2" />
              画像をアップロード
              <input type="file" accept="image/*" className="hidden" onChange={handleUpload} />
            </label>
          </div>
        </div>
      </div>

      {/* Webカメラ UI */}
      {showCamera && (
        <div className="bg-white shadow rounded-lg p-6 text-center">
          <Webcam audio={false} ref={webcamRef} screenshotFormat="image/jpeg" className="mx-auto" />
          <div className="mt-4 space-x-2">
            <button onClick={captureImage} className="px-4 py-2 bg-blue-600 text-white rounded-md">
              撮影
            </button>
            <button onClick={() => setShowCamera(false)} className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md">
              キャンセル
            </button>
          </div>
        </div>
      )}

      {/* ローディングインジケーター */}
      {loading && <p className="text-center text-gray-500">処理中...</p>}

      {/* エラー表示 */}
      {errorMessage && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">エラー:</strong>
          <span className="block sm:inline">{errorMessage}</span>
        </div>
      )}

      {/* OCR結果の表示 */}
      {ocrResult && (
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">OCR結果</h3>
          <pre className="whitespace-pre-wrap text-gray-800">{ocrResult}</pre>
        </div>
      )}

      {/* Gemini 変換結果（買い物リスト候補）の表示 */}
      {geminiResult && (
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">買い物リスト候補</h3>
          <pre className="whitespace-pre-wrap text-gray-800">{geminiResult}</pre>
          <button
            onClick={handleAddToShoppingList}
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
          >
            この内容で追加する
          </button>
        </div>
      )}
    </div>
  );
}
