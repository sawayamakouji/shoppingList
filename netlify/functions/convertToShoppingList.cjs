// netlify/functions/convertToShoppingList.js
const fetch = require('node-fetch');

exports.handler = async (event, context) => {
  try {
    // フロントエンドから送られてくるOCRテキストを取得
    const { ocrText } = JSON.parse(event.body);
    
    // Gemini API用のプロンプトを作成（例）
    const prompt = `以下のテキストから、買い物リストとして適切な項目（商品名と数量があれば）を箇条書きにしてください。\n\n${ocrText}`;
    
    // Gemini API のエンドポイント・APIキー（Netlifyの環境変数から取得）
    const geminiApiKey = process.env.GOOGLE_AI_STUDIO_API_KEY;
    const apiUrl = `https://gemini.googleapis.com/v1/complete?key=${geminiApiKey}`;
    
    // リクエストボディ（実際のパラメータは公式ドキュメントに沿って調整）
    const requestBody = {
      prompt: prompt,
      // 他のパラメータ（候補数、トークン数、温度など）も必要に応じて設定
      candidate_count: 1,
      max_output_tokens: 100,
    };
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody)
    });
    
    const result = await response.json();
    
    // ここでは、result.completion に変換後のテキストが返ると仮定
    const shoppingListText = result.completion || '';
    
    return {
      statusCode: 200,
      body: JSON.stringify({ shoppingList: shoppingListText }),
    };
  } catch (error) {
    console.error('Error in Gemini conversion:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal Server Error' }),
    };
  }
};
