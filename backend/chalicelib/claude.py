import os
import anthropic
import json

def get_client():
    return anthropic.Anthropic(api_key=os.environ.get('ANTHROPIC_API_KEY'))

PRODUCT_TYPES = [
    "Cleanser","Toner","Essence","Serum","Moisturizer","Eye Cream",
    "Sunscreen","Exfoliant / AHA / BHA","Retinol / Retinoid","Face Oil",
    "Sheet Mask","Clay Mask","Spot Treatment","Mist / Setting Spray","Other"
]

def suggest_products(query):
    client = get_client()
    try:
        response = client.messages.create(
            model="claude-haiku-4-5",
            max_tokens=400,
            messages=[{
                "role": "user",
                "content": f'Skincare product database. User typing: "{query}". Suggest up to 6 real matching products. Respond ONLY as a JSON array, no markdown:\n[{{"name":"Full Product Name","brand":"Brand","type":"Cleanser|Toner|Essence|Serum|Moisturizer|Eye Cream|Sunscreen|Exfoliant / AHA / BHA|Retinol / Retinoid|Face Oil|Sheet Mask|Clay Mask|Spot Treatment|Mist / Setting Spray|Other"}}]\nReturn [] if nothing matches well.'
            }]
        )
        return json.loads(response.content[0].text.replace('```json', '').replace('```', '').strip())
    except Exception as e:
        print(f"DEBUG: suggest_products failed: {str(e)}")
        raise e

def analyze_routine(products):
    client = get_client()
    product_list = '\n'.join([f'- {p["name"]} ({p["type"]})' for p in products])
    
    try:
        response = client.messages.create(
            model="claude-3-5-sonnet-20241022",
            max_tokens=2000,
            messages=[{
                "role": "user",
                "content": f'''You are an expert esthetician. Analyze these skincare products:
{product_list}

Determine: skin type/concerns, optimized AM routine step order, optimized PM routine step order, usage frequency per product, and key ingredient warnings.

Respond ONLY in valid JSON, no markdown:
{{"skinProfile":{{"type":"...","concerns":["..."],"summary":"..."}},"amRoutine":[{{"step":1,"productName":"...","type":"...","tip":"...","frequency":"..."}}],"pmRoutine":[{{"step":1,"productName":"...","type":"...","tip":"...","frequency":"..."}}],"warnings":["..."],"weeklyFrequency":[{{"productName":"...","frequency":"...","note":"..."}}]}}'''
            }]
        )
        return json.loads(response.content[0].text.replace('```json', '').replace('```', '').strip())
    except Exception as e:
        print(f"DEBUG: analyze_routine failed: {str(e)}")
        raise e
