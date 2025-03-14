import os
import json
import requests

def handler(event, context):
    try:
        body = json.loads(event.get("body", "{}"))
        ocr_text = body.get("ocrText", "")
        
        # Gemini API 用のプロンプト作成
        prompt = f"以下のテキストから、買い物リスト項目として適切な分を（商品名と数量があれば）を箇条書きにしてください。買物リスト などの分はいりません   出力例 商品名 個数など（記載あれば）\n\n{ocr_text}"
        
        gemini_api_key = os.environ.get("GOOGLE_AI_STUDIO_API_KEY")
        api_url = f"https://gemini.googleapis.com/v1/complete?key={gemini_api_key}"
        
        request_body = {
            "prompt": prompt,
            "candidate_count": 1,
            "max_output_tokens": 100,
            "temperature": 0.5
        }
        
        headers = {"Content-Type": "application/json"}
        response = requests.post(api_url, headers=headers, json=request_body)
        result = response.json()
        
        if "error" in result:
            print("Gemini API error:", result["error"])
            return {
                "statusCode": 400,
                "body": json.dumps({"error": result["error"].get("message", "Unknown error")})
            }
        
        shopping_list_text = result.get("completion", "")
        return {
            "statusCode": 200,
            "body": json.dumps({"shoppingList": shopping_list_text})
        }
        
    except Exception as e:
        print("Error in convertToShoppingList:", str(e))
        return {
            "statusCode": 500,
            "body": json.dumps({"error": "Internal Server Error: " + str(e)})
        }
