from PIL import Image, ImageChops, ImageEnhance
import numpy as np
import io
import base64

def compute_ela(image: Image.Image, quality=90):
    buffer = io.BytesIO()
    image.convert('RGB').save(buffer, 'JPEG', quality=quality)
    buffer.seek(0)
    resaved = Image.open(buffer)

    diff = ImageChops.difference(image.convert('RGB'), resaved)

    diff_array = np.array(diff).astype(float)
    max_diff = diff_array.max() if diff_array.max() > 0 else 1
    scale = 255.0 / max_diff
    amplified = np.clip(diff_array * scale, 0, 255).astype(np.uint8)

    heatmap_image = Image.fromarray(amplified)

    buffer2 = io.BytesIO()
    heatmap_image.save(buffer2, format='PNG')
    heatmap_base64 = base64.b64encode(buffer2.getvalue()).decode('utf-8')

    raw_score = float(np.mean(diff_array)) / 255.0

    return raw_score, heatmap_base64