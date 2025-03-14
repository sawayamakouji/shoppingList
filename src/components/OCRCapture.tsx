import React, { useState, useRef } from 'react';
import Webcam from 'react-webcam';
import { Camera, Upload, RefreshCw } from 'lucide-react';

export function OCRCapture() {
  const [showCamera, setShowCamera] = useState(false);
  const [ocrResult, setOcrResult] = useState('');
  const [geminiResult, setGeminiResult] = useState('');
  const [errorMessage, setErrorMessage] = useState(''); // エラー情報用の state
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const webcamRef = useRef<Webcam>(null);

  // OCR処理：Google Cloud Vision API を使って画像からテキストを抽出し、その後 Gemini API へ連携
  const processOCR = async (imageSrc: string) => {
    setLoading(true);
    setErrorMessage('');
    try {
      const base64Image = imageSrc.split(',')[1];
      const visionApiKey = import.meta.env.VITE_GOOGLE_CLOUD_VISION_API_KEY;
      const requestBody = {
        requests: [
          {
            image: { content: base64Image },
            features: [{ type: 'TEXT_DETECTION', maxResults: 1 }],
          },
        ],
      };

      const response = await fetch(
        `https://vision.googleapis.com/v1/images:annotate?key=${visionApiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestBody),
        }
      );
      const result = await response.json();
      const extractedText =
        result.responses?.[0]?.fullTextAnnotation?.text || '';
      setOcrResult(extractedText);
      if (extractedText) {
        await processGemini(extractedText);
      }
    } catch (error) {
      console.error('OCR error:', error);
      setOcrResult('読み取りに失敗しました');
      setErrorMessage('OCR処理でエラーが発生しました。' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Gemini API 呼び出し：OCRテキストを買い物リスト形式に変換する
  const processGemini = async (ocrText: string) => {
    setLoading(true);
    setErrorMessage('');
    try {
      const prompt = `以下のテキストから、買い物リストとして適切な商品名と数量（あれば）を箇条書きにしてください。\n\n${ocrText}`;
      const geminiApiKey = import.meta.env.VITE_GOOGLE_AI_STUDIO_API_KEY;
      const apiUrl = `https://gemini.googleapis.com/v1/complete?key=${geminiApiKey}`;
      const requestBody = {
        prompt: prompt,
        candidate_count: 1,
        max_output_tokens: 100,
        temperature: 0.5,
      };

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });
      const result = await response.json();

      // エラーが含まれている場合は、エラーメッセージを表示
      if (result.error) {
        console.error('Gemini API error:', result.error);
        setGeminiResult('変換に失敗しました');
        setErrorMessage(
          `Gemini API エラー: ${result.error.message || result.error}`
        );
      } else {
        const shoppingListText = result.completion || '';
        setGeminiResult(shoppingListText);
      }
    } catch (error) {
      console.error('Gemini API error:', error);
      setGeminiResult('変換に失敗しました');
      setErrorMessage(
        'Gemini API 呼び出し中にエラーが発生しました。' + error.message
      );
    } finally {
      setLoading(false);
    }
  };

  // カメラで撮影した画像を取得して OCR 処理へ渡す
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
        const imageSrc = typeof result === 'string' ? result : '';
        setCapturedImage(imageSrc);
        processOCR(imageSrc);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-6">
      {/* OCR & Gemini 変換用のUI */}
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
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleUpload}
              />
            </label>
          </div>
        </div>
      </div>

      {/* Webカメラ UI */}
      {showCamera && (
        <div className="bg-white shadow rounded-lg p-6 text-center">
          <Webcam
            audio={false}
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            className="mx-auto"
          />
          <div className="mt-4 space-x-2">
            <button
              onClick={captureImage}
              className="px-4 py-2 bg-blue-600 text-white rounded-md"
            >
              撮影
            </button>
            <button
              onClick={() => setShowCamera(false)}
              className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md"
            >
              キャンセル
            </button>
          </div>
        </div>
      )}

      {/* ローディングインジケーター */}
      {loading && <p className="text-center text-gray-500">処理中...</p>}

      {/* エラー表示（ある場合） */}
      {errorMessage && (
        <div
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
          role="alert"
        >
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
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            買い物リスト候補
          </h3>
          <pre className="whitespace-pre-wrap text-gray-800">
            {geminiResult}
          </pre>
        </div>
      )}
    </div>
  );
}
