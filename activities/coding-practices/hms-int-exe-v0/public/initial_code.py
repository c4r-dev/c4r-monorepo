import numpy as np
import matplotlib.pyplot as plt
from nd2reader import ND2Reader
from scipy.ndimage import zoom, gaussian_filter
from tifffile import imread
import os


def messy_version():
    fp = ['20191010_tail_01.nd2', '20240523_Vang-1_37.tif']

    i = {'raw': [], 'proc': []}
    for x in range(len(fp)):
        if fp[x].endswith('.nd2'):
            f = ND2Reader(fp[x])
            i['raw'] += [f[0]]
            d = zoom((i['raw'][len(i['raw'])] - np.min(i['raw'][len(i['raw'])])) / (np.max(i['raw'][len(i['raw'])]) - np.min(i['raw'][len(i['raw'])])), (0.5, 0.5))
            i['proc'] += [np.transpose(gaussian_filter(d, 1))]
        elif fp[x].endswith('.tiff') or fp[x].endswith('.tif'):
            i['raw'] += [imread(fp[x])]
            d = zoom((i['raw'][len(i['raw'])] - np.min(i['raw'][len(i['raw'])])) / (np.max(i['raw'][len(i['raw'])]) - np.min(i['raw'][len(i['raw'])])), (0.3, 0.3))
            i['proc'] += [np.transpose(gaussian_filter(d, 2))]
        else:
            raise ValueError(f"Unsupported file format: {fp[x]}")

    fig, axes = plt.subplots(len(fp), 2, figsize=(12, 6 * len(fp)))
    for n in range(len(fp)):
        axes[i, 0].imshow(i['raw'][n], cmap='gray')
        axes[i, 1].imshow(i['proc'][n], cmap='gray')
        axes[i, 0].axis('off')
        axes[i, 1].axis('off')

    plt.show() 