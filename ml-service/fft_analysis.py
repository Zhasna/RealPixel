from PIL import Image
import numpy as np
import io
import base64

def compute_fft(image: Image.Image):
    # Convert to grayscale — frequency artifacts from GAN upsampling show up
    # in luminance patterns, we don't need color channels for this
    gray = np.array(image.convert('L')).astype(float)

    # The actual Fast Fourier Transform — converts the image from
    # "pixel brightness at each position" into "how much of each frequency pattern is present"
    f = np.fft.fft2(gray)

    # fftshift moves the zero-frequency (average brightness) component to the center
    # of the array, which is the conventional way to visualize/analyze this —
    # otherwise it ends up split across the four corners, which is harder to reason about
    f_shifted = np.fft.fftshift(f)

    # Convert to magnitude (how strong each frequency is) and use a log scale,
    # since raw FFT values span an enormous range and would be unreadable otherwise
    magnitude = np.abs(f_shifted)
    magnitude_log = np.log1p(magnitude)

    # Normalize to 0-255 for visualization as an image later
    normalized = (magnitude_log / magnitude_log.max() * 255).astype(np.uint8)

    # A single summary score: GAN artifacts tend to show up as unusually
    # strong energy in the HIGH frequency range (the outer edges of this spectrum).
    # We measure what fraction of total energy sits in the outer region vs center.
    h, w = magnitude.shape
    center_h, center_w = h // 2, w // 2
    radius = min(h, w) // 4

    y, x = np.ogrid[:h, :w]
    dist_from_center = np.sqrt((y - center_h)**2 + (x - center_w)**2)

    high_freq_mask = dist_from_center > radius
    high_freq_energy = magnitude[high_freq_mask].sum()
    total_energy = magnitude.sum()

    high_freq_ratio = float(high_freq_energy / total_energy)

    # Convert the normalized magnitude array into an actual viewable image
    fft_image = Image.fromarray(normalized)

    buffer = io.BytesIO()
    fft_image.save(buffer, format='PNG')
    fft_base64 = base64.b64encode(buffer.getvalue()).decode('utf-8')

    return high_freq_ratio, fft_base64