from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
from PIL import Image
import tensorflow as tf
import io

app = Flask(__name__)
CORS(app, origins=["*"])

model = tf.keras.models.load_model("final_model.h5")
label_map = {0: "Real", 1: "Fake"}

@app.route('/multi_predict', methods=['POST'])
def multi_predict():
    if 'files' not in request.files:
        return jsonify({"error": "No files part in request"}), 400

    files = request.files.getlist('files')
    results = []

    for file in files:
        try:
            image = Image.open(io.BytesIO(file.read())).convert("RGB")
            image = image.resize((256, 256))
            image = np.array(image).astype("float32") / 255.0
            image = np.expand_dims(image, axis=0)

            prediction = model.predict(image)[0]
            predicted_class = int(np.argmax(prediction))
            confidence = float(np.max(prediction))
            label = label_map.get(predicted_class, "Unknown")

            results.append({
                "filename": file.filename,
                "label": label,
                "confidence": confidence
            })

        except Exception as e:
            results.append({
                "filename": file.filename,
                "label": "Error",
                "error": str(e)
            })

    return jsonify(results)

@app.route('/favicon.ico')
def favicon():
    return '', 204

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
