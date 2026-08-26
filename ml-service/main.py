from fastapi import FastAPI, UploadFile, File
from classifiers import Meso4
from tensorflow.keras.preprocessing import image
import numpy as np
import io
from PIL import Image

app = FastAPI()

# Load the model ONCE when the server starts — not on every request.
# Loading weights is slow-ish; we don't want to redo it for every image.
classifier = Meso4()
classifier.load('model/weights/Meso4_DF.h5')

@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    # Read the uploaded image bytes and convert to the format the model expects
    contents = await file.read()
    img = Image.open(io.BytesIO(contents)).convert('RGB')
    img = img.resize((256, 256))
    x = image.img_to_array(img) / 255.0
    x = np.expand_dims(x, axis=0)

    # Run prediction — remember: for this weight file, low = fake, high = real
    raw_score = float(classifier.predict(x)[0][0])
    fake_probability = 1 - raw_score  # flip so higher = more likely fake

    return {"fake_probability": fake_probability}