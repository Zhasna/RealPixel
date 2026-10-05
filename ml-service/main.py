from fastapi import FastAPI, UploadFile, File
from classifiers import Meso4
from tensorflow.keras.preprocessing import image
import numpy as np
import io
from PIL import Image
from ela import compute_ela
from fft_analysis import compute_fft
from grad_cam import build_grad_model, generate_gradcam

app = FastAPI()

classifier = Meso4()
classifier.load('model/weights/Meso4_DF.h5')
grad_model = build_grad_model(classifier.model)

@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    contents = await file.read()
    img = Image.open(io.BytesIO(contents)).convert('RGB')

    resized = img.resize((256, 256))
    x = image.img_to_array(resized) / 255.0
    x = np.expand_dims(x, axis=0)

    raw_score = float(classifier.predict(x)[0][0])
    fake_probability = 1 - raw_score

    ela_score, ela_heatmap = compute_ela(img)
    fft_score, fft_heatmap = compute_fft(img)
    gradcam_heatmap = generate_gradcam(grad_model, x, np.array(resized))

    return {
        "fake_probability": fake_probability,
        "ela_score": ela_score,
        "ela_heatmap": ela_heatmap,
        "fft_score": fft_score,
        "fft_heatmap": fft_heatmap,
        "gradcam_heatmap": gradcam_heatmap
    }