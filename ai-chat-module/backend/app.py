from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import google.generativeai as genai
import os
from utils.patient_loader import load_patient_profile

load_dotenv()

app = Flask(__name__)
CORS(app)

# Configure Gemini API
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
model = genai.GenerativeModel("gemini-1.5-flash")

@app.route('/chat', methods=['POST'])
def chat():
    data = request.get_json()
    user_input = data.get('message', '')
    case_id = data.get('case_id', '')

    if not user_input or not case_id:
        return jsonify({'error': 'Message and case_id are required'}), 400

    patient = load_patient_profile(case_id)
    if not patient:
        return jsonify({'error': 'Invalid case ID'}), 404

    prompt = patient['prompt']
    full_convo = [prompt, user_input]

    try:
        response = model.generate_content(full_convo)
        reply = response.text.strip()
        return jsonify({'reply': reply})

    except Exception as e:
        print(f"Error: {e}")
        return jsonify({'error': 'Internal server error'}), 500

if __name__ == '__main__':
    app.run(debug=True)