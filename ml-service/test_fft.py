from PIL import Image
from fft_analysis import compute_fft

for path in [
    'model/test_images/df/df00204.jpg',
    'model/test_images/df/df01254.jpg',
    'model/test_images/real/real00240.jpg',
    'model/test_images/real/real00772.jpg'
]:
    img = Image.open(path)
    score, _ = compute_fft(img)
    print(f'{path}: high-frequency energy ratio = {score:.4f}')