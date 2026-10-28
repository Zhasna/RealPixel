# RealPixel

RealPixel is a web app that checks whether an image shows signs of AI manipulation. You upload a JPG, PNG or WebP image, and it returns a verdict (authentic or manipulated), a manipulation score, and three visual explanations: an Error Level Analysis (ELA) heatmap, a frequency-domain (FFT) heatmap, and a Grad-CAM heatmap showing which regions influenced the model.

**Live demo:** `[real-pixel.vercel.app](https://real-pixel.vercel.app/)`
**Demo video:** `<link, if you record one>`

> The free-tier backend sleeps when idle. The first request after a quiet period can take a minute or more while the services wake up.

## How it works

The project has three services.

| Part | Folder | Stack | Hosted on |
|------|--------|-------|-----------|
| Client | `client/` | React, Vite, Axios | Vercel |
| API server | `server/` | Node.js, Express, Mongoose, Multer | Render |
| ML service | `ml-service/` | FastAPI, TensorFlow/Keras, Pillow, NumPy | Azure Container Apps |

Scan data and user accounts are stored in MongoDB Atlas.

A scan follows this path: the browser uploads the image to the Express server, which validates the file type and size and forwards it to the ML service's `/predict` endpoint. The ML service runs the Meso4 classifier and computes the ELA, FFT and Grad-CAM outputs. Express applies the decision threshold, saves the result (if the user is logged in), and returns it to the client.

## Features

- Image upload with client-side and server-side validation (JPG, PNG, WebP, up to 10 MB)
- Manipulation verdict using a 0.35 threshold on the model output
- ELA, FFT and Grad-CAM heatmaps for each scan
- Optional accounts: scanning works without logging in, and logged-in users get a saved scan history
- History page where scans can be reopened, given a short note (200 characters), or deleted
- Readable error messages for corrupted files, oversized files and an unavailable ML service

## Model

The classifier is **Meso4**, from the MesoNet project by Afchar et al., using the pretrained `Meso4_DF.h5` weights. The ML service resizes each image to 256x256 for the model and caps very large photos at 2048 px before running ELA and FFT.

## Limitations

- Meso4 was trained on face crops. It still returns a score for other kinds of images, but that score is not meaningful, so results are most useful on clear photos of a single face.
- The output is a manipulation score, not a calibrated probability. The 0.35 threshold was tuned on a held-out split (see the project report for the benchmark).
- This is a demo built for learning and a course project. It should not be used as the sole evidence in any real decision about whether an image is genuine.

## Project structure

```
deepfake-detector/
  client/          React + Vite frontend
  server/          Express API (auth, scan routes, MongoDB models)
  ml-service/      FastAPI service, Dockerfile, model weights
    model/weights/ Meso4_DF.h5 and other MesoNet weights
```

## Running locally

You need Node.js, Python 3.13 (the version used here), and a MongoDB connection string.

**1. ML service**

```
cd ml-service
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --port 8000
```

Check `http://localhost:8000/docs` to confirm it started. It can also be run with Docker:

```
docker build -t realpixel-ml .
docker run -p 8000:8000 realpixel-ml
```

**2. API server**

```
cd server
npm install
node server.js
```

Create `server/.env` with:

```
MONGO_URI=<your MongoDB connection string>
JWT_SECRET=<a long random string>
ML_SERVICE_URL=http://localhost:8000
```

**3. Client**

```
cd client
npm install
npm run dev
```

The client calls `http://localhost:5000` by default. To point it elsewhere, set `VITE_API_URL` before building (see `client/src/config.js`).

## API reference

Express server:

| Method | Route | Purpose |
|--------|-------|---------|
| POST | `/api/auth/register` | Create an account |
| POST | `/api/auth/login` | Log in and receive a token |
| POST | `/api/scan` | Upload an image and get a result (token optional) |
| GET | `/api/scan` | List the logged-in user's scans |
| PATCH | `/api/scan/:id` | Edit the note on a scan |
| DELETE | `/api/scan/:id` | Delete a scan |

ML service:

| Method | Route | Purpose |
|--------|-------|---------|
| GET | `/health` | Wake-up and status check |
| POST | `/predict` | Return the fake probability, ELA/FFT scores and heatmaps |

## Deployment

The client is deployed on Vercel with the root directory set to `client` and one environment variable, `VITE_API_URL`, pointing at the Express server. A `vercel.json` rewrite lets refreshes on routes like `/history` work. The Express server runs on Render with `MONGO_URI`, `JWT_SECRET` and `ML_SERVICE_URL` set as environment variables. The ML service is built from `ml-service/Dockerfile`, pushed to a container registry, and run on Azure Container Apps with 2 GiB of memory, scaling between 0 and 1 replicas.

## Acknowledgements

The Meso4 architecture and pretrained weights come from [MesoNet](https://github.com/DariusAf/MesoNet) by Darius Afchar, Vincent Nozick, Junichi Yamagishi and Isao Echizen, used under its original license.

## Author

`Hasna Fahima Zahir Hussain`, B.Tech Information Technology
