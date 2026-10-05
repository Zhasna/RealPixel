import numpy as np
import tensorflow as tf
from PIL import Image
import io
import base64


def find_last_conv_layer(model):
    # Walk backward through the network and grab the last convolutional layer —
    # that's the layer whose output still has spatial structure (rows/columns
    # corresponding to regions of the image), which is what Grad-CAM needs.
    # Layers after this (Flatten, Dense) collapse that spatial info, so they're useless here.
    for layer in reversed(model.layers):
        if isinstance(layer, tf.keras.layers.Conv2D):
            return layer.name
    raise ValueError("No Conv2D layer found in model")


def build_grad_model(keras_model):
    last_conv_name = find_last_conv_layer(keras_model)
    last_conv_layer = keras_model.get_layer(last_conv_name)

    # This creates a model with TWO outputs instead of one:
    # the raw feature maps from the last conv layer, AND the final prediction.
    # We need both — the feature maps to know WHERE, the prediction to know WHY.
    grad_model = tf.keras.models.Model(
        inputs=keras_model.inputs,
        outputs=[last_conv_layer.output, keras_model.output]
    )
    return grad_model


def _value_to_heat_color(t):
    # Simple "jet"-style colormap (blue -> cyan -> green -> yellow -> red)
    # without needing matplotlib. t is 0-1, returns an (H, W, 3) RGB array.
    r = np.clip(1.5 - np.abs(4 * t - 3), 0, 1)
    g = np.clip(1.5 - np.abs(4 * t - 2), 0, 1)
    b = np.clip(1.5 - np.abs(4 * t - 1), 0, 1)
    return np.stack([r, g, b], axis=-1)


def generate_gradcam(grad_model, img_array, original_resized_rgb):
    img_tensor = tf.convert_to_tensor(img_array, dtype=tf.float32)

    # GradientTape records every operation so TensorFlow can later calculate
    # "how much does the output change if this input/intermediate value changes" —
    # that's literally what a gradient is, and it's the "Grad" in Grad-CAM.
    with tf.GradientTape() as tape:
        conv_outputs, predictions = grad_model(img_tensor)
        loss = predictions[:, 0]

    # The actual gradients: how much the fake-probability would shift
    # if each pixel in the last conv layer's feature maps were different
    grads = tape.gradient(loss, conv_outputs)

    # Average the gradients across width/height for each feature channel —
    # this tells us which CHANNELS (detected patterns) mattered most overall
    pooled_grads = tf.reduce_mean(grads, axis=(0, 1, 2))

    conv_outputs = conv_outputs[0]

    # Weight each channel's feature map by how important that channel was,
    # then sum them into a single importance map
    heatmap = conv_outputs @ pooled_grads[..., tf.newaxis]
    heatmap = tf.squeeze(heatmap)

    # Only positive influence matters (negative = "this made it LESS fake"),
    # and normalize to 0-1 for visualization
    heatmap = tf.maximum(heatmap, 0)
    max_val = tf.math.reduce_max(heatmap)
    if max_val > 0:
        heatmap = heatmap / max_val
    heatmap = heatmap.numpy()

    # The heatmap is tiny (same resolution as the last conv layer, e.g. 8x8) —
    # upscale it to match the original image so it can be overlaid meaningfully
    heatmap_img = Image.fromarray((heatmap * 255).astype(np.uint8))
    heatmap_resized = heatmap_img.resize(original_resized_rgb.shape[1::-1], Image.BILINEAR)
    heatmap_norm = np.array(heatmap_resized).astype(float) / 255.0

    heat_color = (_value_to_heat_color(heatmap_norm) * 255).astype(np.uint8)

    # Blend the heatmap over the original image — 45% heatmap, 55% original,
    # so you can still clearly see the actual photo underneath the highlighting
    alpha = 0.45
    overlay = (alpha * heat_color + (1 - alpha) * original_resized_rgb).astype(np.uint8)

    overlay_img = Image.fromarray(overlay)
    buffer = io.BytesIO()
    overlay_img.save(buffer, format='PNG')
    return base64.b64encode(buffer.getvalue()).decode('utf-8')