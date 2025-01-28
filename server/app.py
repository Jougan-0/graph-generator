from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import json

app = Flask(__name__)
CORS(app)

modelUsed = "lumolabs/Lumo-8B-Instruct"

def fetch_model_response(code, model):
    url = "https://sheer-walliw-lumolabs-6b447c84.koyeb.app/api/generate"
    payload = {
        "prompt": (
            "Analyze the provided code and provide the flow in the EXACT format given below and max words of label is 15:\n"
            "Key1 -> Key2: label\n\n"
            "Key2 -> Key3: label\n\n"
            "For example:\n"
            "Token Name -> Symbol: defines\n\n"
            "Symbol -> Value: defines\n\n"
            "Here is the code:\n"
            f"{code}"
        ),
        "model": model,
        "stream": True
    }

    response = requests.post(url, json=payload, stream=True)
    return response

def clean_text(text):
    """Remove ** before or after a word and any leading '-'."""
    return text.strip().replace("**", "").lstrip("-").strip("`").strip("'")

def parse_streamed_response(response):
    key_points = []
    relationships = []
    full_summary = ""
    current_line = ""

    for line in response.iter_lines():
        if line:
            try:
                data = json.loads(line.decode("utf-8"))
                if data.get("done"):
                    break

                current_line += data.get("response", "")
                if current_line.endswith("\n"):
                    full_summary += current_line.strip() + " "

                    if "->" in current_line and ":" in current_line:  # Detect relationships
                        try:
                            parts = current_line.strip().split("->")
                            if len(parts) == 2:
                                from_part = clean_text(parts[0].strip())
                                to_and_label = parts[1].strip().split(":")
                                if len(to_and_label) == 2:
                                    to_part = clean_text(to_and_label[0].strip())
                                    label = clean_text(to_and_label[1].strip())
                                    relationships.append({
                                        "from": from_part,
                                        "to": to_part,
                                        "label": label
                                    })

                        except Exception as e:
                            print(f"Error parsing relationship: {e}")
                    else:
                        short_point = " ".join(current_line.strip().split()[:4])
                        if short_point and short_point not in key_points:
                            key_points.append(short_point)

                    current_line = ""
            except json.JSONDecodeError:
                continue

    return key_points, relationships, full_summary.strip()

@app.route("/generate-graph", methods=["POST"])
def generate_graph():
    data = request.json
    code = data.get("code")
    model = data.get("model")

    if model == "80Bmodel":
        model = "lumolabs/Lumo-8B-Instruct"
    elif model == "7Bmodel":
        model = "lumolabs/Lumo-70B-Instruct"
    else:
        model = "lumolabs/Lumo-DeepSeek-R1-8B"

    response = fetch_model_response(code, model)
    key_points, relationships, summary = parse_streamed_response(response)

    if not key_points:
        return jsonify({"error": "No key points extracted."}), 500

    return jsonify({"relationships": relationships, "summary": summary})

if __name__ == "__main__":
    app.run(debug=True)

