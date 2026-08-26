from classifiers import Meso4
from tensorflow.keras.preprocessing import image
import numpy as np

classifier = Meso4()
classifier.load('weights/Meso4_DF.h5')

def predict_image(path):
    img = image.load_img(path, target_size=(256, 256))
    x = image.img_to_array(img) / 255.0
    x = np.expand_dims(x, axis=0)
    return classifier.predict(x)[0][0]

print('df00204.jpg (labeled FAKE):', predict_image('test_images/df/df00204.jpg'))
print('df01254.jpg (labeled FAKE):', predict_image('test_images/df/df01254.jpg'))
print('real00240.jpg (labeled REAL):', predict_image('test_images/real/real00240.jpg'))
print('real00772.jpg (labeled REAL):', predict_image('test_images/real/real00772.jpg'))