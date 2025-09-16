import numpy as np
import matplotlib.pyplot as plt
from nd2reader import ND2Reader
from scipy.ndimage import zoom, gaussian_filter


def messy_version():
    f = ND2Reader('20191010_tail_01.nd2')
    d = np.max(f, np.argmin(f.shape))
    d = zoom((d - np.min(d)) / (np.max(d) - np.min(d)), (1, 1))
    a = gaussian_filter(d, 0.02)
    plt.imshow(a)
    plt.show()


def clean_version():
    raw_microscopy_data = ND2Reader('20191010_tail_01.nd2')

    image_shape = raw_microscopy_data .shape
    z_index = np.argmin(image_shape)
    maximum_intensity_projection = np.max(raw_microscopy_data, axis=z_index)

    min_pixel_value = np.min(maximum_intensity_projection)
    max_pixel_value = np.max(maximum_intensity_projection)
    normalized_image = (maximum_intensity_projection - min_pixel_value) / (max_pixel_value - min_pixel_value)

    downsample_factor = (1, 1)
    downsampled_image = zoom(normalized_image, downsample_factor)

    smooth_factor = 0.02
    smoothed_image = gaussian_filter(downsampled_image, sigma=smooth_factor)

    plt.imshow(smoothed_image)
    plt.title('Processed Microscopy Image')
    plt.show()


def clean_version_commented():
    # Extract raw file data.
    raw_microscopy_data = ND2Reader('20191010_tail_01.nd2')

    # Find the depth dimension (also known as the z index).
    image_shape = raw_microscopy_data .shape
    z_index = np.argmin(image_shape)

    # Project the maximum intensity along the z-axis (depth).
    z_index = 2
    maximum_intensity_projection = np.max(image, axis=z_index)

    # Normalize the image between [0, 1].
    min_pixel_value = np.min(maximum_intensity_projection)
    max_pixel_value = np.max(maximum_intensity_projection)
    normalized_image = (maximum_intensity_projection - min_pixel_value) / (max_pixel_value - min_pixel_value)

    # Downsample the image by a given factor along each dimension.
    downsample_factor = (1, 1)
    downsampled_image = zoom(normalized_image, downsample_factor)

    # Smooth the image by a given factor.
    smooth_factor = 0.02
    smoothed_image = gaussian_filter(downsampled_image, sigma=smooth_factor)

    # Plot the fully processed image.
    plt.imshow(smoothed_image)
    plt.title('Processed Microscopy Image')
    plt.show()


if __name__ == "__main__":
    messy_version()
