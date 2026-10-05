from classifiers import Meso4
from tensorflow.keras.preprocessing import image
from PIL import Image
import numpy as np
import base64
from grad_cam import build_grad_model, generate_gradcam

classifier = Meso4()
classifier.load('model/weights/Meso4_DF.h5')

grad_model = build_grad_model(classifier.model)

img_path = 'model/test_images/df/df00204.jpg'
img = Image.open(img_path).convert('RGB').resize((256, 256))

x = image.img_to_array(img) / 255.0
x = np.expand_dims(x, axis=0)

original_array = np.array(img)

overlay_base64 = generate_gradcam(grad_model, x, original_array)

# Save it to an actual file so we can look at it directly
with open('gradcam_test_output.png', 'wb') as f:
    f.write(base64.b64decode(overlay_base64))

print("Saved gradcam_test_output.png — open it to check the result")