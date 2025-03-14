// netlify/functions/geminiOCR.js
const fetch = require('node-fetch'); // node-fetchが必要なら

exports.handler = async (event, context) => {
  // クライアントからPOSTリクエストで画像データを受け取る想定
  const { image } = JSON.parse(event.body);
  const apiKey = process.env.GEMINI_API_KEY; // Netlifyの環境変数から取得

  // node用の FormData が必要な場合はform-dataパッケージを使う
  const FormData = require('form-data');
  const formData = new FormData();
  formData.append('file', image);
  formData.append('apiKey', apiKey);

  try {
    const response = await fetch('https://api.gemini.com/ocr', {
      method: 'POST',
      body: formData,
    });
    const data = await response.json();

    return {
      statusCode: 200,
      body: JSON.stringify(data),
    };
  } catch (error) {
    console.error('OCRエラー:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'OCR処理中にエラーが発生しました' }),
    };
  }
};
