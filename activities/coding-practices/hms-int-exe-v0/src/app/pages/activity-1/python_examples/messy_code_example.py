import numpy as np
import matplotlib.pyplot as plt
from nd2reader import ND2Reader
from scipy.ndimage import zoom, gaussian_filter


def my_function():
    f = ND2Reader('20191010_tail_01.nd2')
    d = np.max(f, np.argmin(f.shape))
    d = zoom((d - np.min(d)) / (np.max(d) - np.min(d)), (1, 1))
    a = gaussian_filter(d, 0.02)
    plt.imshow(a)
    plt.show()


if __name__ == "__main__":
    my_function()


