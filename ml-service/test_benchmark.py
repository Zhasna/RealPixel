import os
import random
from PIL import Image
from classifiers import Meso4
from tensorflow.keras.preprocessing import image
import numpy as np

# ---- CONFIG ----
DATASET_ROOT = r"C:\Users\Hasna\Desktop\deepfake-detector\ml-service\dataset\1000_videos\test"
SAMPLE_SIZE_PER_CLASS = 200  # how many images to test from each class
# -----------------

classifier = Meso4()
classifier.load('model/weights/Meso4_DF.h5')


def predict_image(path):
    img = Image.open(path).convert('RGB').resize((256, 256))
    x = image.img_to_array(img) / 255.0
    x = np.expand_dims(x, axis=0)
    raw_score = classifier.predict(x)[0][0]
    fake_probability = 1 - raw_score
    return fake_probability


def load_sample(folder, label, n):
    all_files = os.listdir(folder)
    sample = random.sample(all_files, min(n, len(all_files)))
    return [(os.path.join(folder, f), label) for f in sample]


random.seed(42)  # reproducible sample — same images every run

real_folder = os.path.join(DATASET_ROOT, 'real')
fake_folder = os.path.join(DATASET_ROOT, 'fake')

samples = load_sample(real_folder, 0, SAMPLE_SIZE_PER_CLASS) + \
          load_sample(fake_folder, 1, SAMPLE_SIZE_PER_CLASS)

random.shuffle(samples)

true_positive = 0
true_negative = 0
false_positive = 0
false_negative = 0

print(f"Running benchmark on {len(samples)} images...")

scores = []
labels = []

for i, (path, true_label) in enumerate(samples):
    try:
        fake_prob = predict_image(path)
        scores.append(float(fake_prob))
        labels.append(true_label)
        predicted_label = 1 if fake_prob > 0.5 else 0

        if predicted_label == 1 and true_label == 1:
            true_positive += 1
        elif predicted_label == 0 and true_label == 0:
            true_negative += 1
        elif predicted_label == 1 and true_label == 0:
            false_positive += 1
        elif predicted_label == 0 and true_label == 1:
            false_negative += 1

        if (i + 1) % 50 == 0:
            print(f"  {i + 1}/{len(samples)} processed...")

    except Exception as e:
        print(f"  Skipped {path}: {e}")

total = true_positive + true_negative + false_positive + false_negative
accuracy = (true_positive + true_negative) / total
precision = true_positive / (true_positive + false_positive) if (true_positive + false_positive) > 0 else 0
recall = true_positive / (true_positive + false_negative) if (true_positive + false_negative) > 0 else 0
f1 = 2 * (precision * recall) / (precision + recall) if (precision + recall) > 0 else 0

print("\n--- Benchmark Results ---")
print(f"Total images tested: {total}")
print(f"True Positives (correctly flagged fake):  {true_positive}")
print(f"True Negatives (correctly flagged real):  {true_negative}")
print(f"False Positives (real flagged as fake):   {false_positive}")
print(f"False Negatives (fake flagged as real):   {false_negative}")
print(f"\nAccuracy:  {accuracy:.4f}")
print(f"Precision: {precision:.4f}")
print(f"Recall:    {recall:.4f}")
print(f"F1 Score:  {f1:.4f}")

import numpy as np

scores = np.array(scores)
labels = np.array(labels)

def auc_score(y, s):
    pos, neg = s[y == 1], s[y == 0]
    greater = (pos[:, None] > neg[None, :]).sum()
    ties = (pos[:, None] == neg[None, :]).sum()
    return (greater + 0.5 * ties) / (len(pos) * len(neg))

def metrics(y, s, t):
    pred = (s > t).astype(int)
    tp = ((pred == 1) & (y == 1)).sum()
    tn = ((pred == 0) & (y == 0)).sum()
    fp = ((pred == 1) & (y == 0)).sum()
    fn = ((pred == 0) & (y == 1)).sum()
    acc = (tp + tn) / len(y)
    prec = tp / (tp + fp) if (tp + fp) else 0
    rec = tp / (tp + fn) if (tp + fn) else 0
    f1 = 2 * prec * rec / (prec + rec) if (prec + rec) else 0
    return acc, prec, rec, f1

print(f"\nROC-AUC (threshold-free): {auc_score(labels, scores):.4f}")

# Tune threshold on the first half, report on the held-out second half
half = len(labels) // 2
tune_y, tune_s = labels[:half], scores[:half]
test_y, test_s = labels[half:], scores[half:]

best_t, best_acc = 0.5, -1
for t in np.arange(0.05, 0.96, 0.05):
    acc = metrics(tune_y, tune_s, t)[0]
    if acc > best_acc:
        best_t, best_acc = t, acc

print(f"\nThreshold chosen on first half: {best_t:.2f}")
a, p, r, f = metrics(test_y, test_s, best_t)
print(f"Held-out half @ {best_t:.2f}: acc={a:.4f} prec={p:.4f} rec={r:.4f} f1={f:.4f}")
a, p, r, f = metrics(test_y, test_s, 0.5)
print(f"Held-out half @ 0.50: acc={a:.4f} prec={p:.4f} rec={r:.4f} f1={f:.4f}")