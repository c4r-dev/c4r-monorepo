// Common color palette for highlighted regions
export const HIGHLIGHT_COLORS = [
  "#FFE6E6", "#E6F3FF", "#E6FFE6", "#FFFFE6", "#F0E6FF",
  "#FFE6F0", "#E6FFF0", "#FFF0E6", "#F0FFE6", "#E6F0FF"
];

// Generate a distinct color for highlighted regions
export const generateColor = (index) => {
  return HIGHLIGHT_COLORS[index % HIGHLIGHT_COLORS.length];
};

// Phase constants for activity-1
export const PHASES = {
  IDENTIFICATION: 'identification',
  MODIFICATION: 'modification',
  VALIDATION: 'validation',
  COMPLETION: 'completion'
};

// Function to load the initial code from file
export const loadInitialCode = async () => {
  // Return only the code inside the function, without the function definition and main call
  return `import numpy as np
import matplotlib.pyplot as plt
from pynwb import NWBHDF5IO
from scipy.ndimage import zoom, gaussian_filter

f = NWBHDF5IO('sub-11-YAaLR_ophys.nwb', "r")

fd = f.read()
d = np.transpose(fd.acquisition['NeuroPALImageRaw'].data[:], (1, 0, 2, 3))
d = d[:, :, :, fd.acquisition['NeuroPALImageRaw'].RGBW_channels[:3]]
f.close()

d = np.max(d, np.argsort(d.shape)[1])
d = zoom((d - np.min(d)) / (np.max(d) - np.min(d)), (1, 0.80, 1))
a = gaussian_filter(d, 0.02)

plt.imshow(a)
plt.show()`;
};

// Example solution code for Phase 4
export const EXAMPLE_SOLUTION = 
    `import numpy as np
import matplotlib.pyplot as plt
from pynwb import NWBHDF5IO
from scipy.ndimage import zoom, gaussian_filter


target_file = 'sub-11-YAaLR_ophys.nwb'
io_obj = NWBHDF5IO(target_file, mode="r")

nwb_file = io_obj.read()
raw_data = nwb_file.acquisition['NeuroPALImageRaw'].data[:]
rgb_channel_indices = nwb_file.acquisition['NeuroPALImageRaw'].RGBW_channels[:3]
io_obj.close()

default_indices = (1, 0, 2, 3)
rotated_image = np.transpose(raw_data, default_indices)
rgb_image = rotated_image[:, :, :, rgb_channel_indices]

image_dimensions = np.array(rgb_image.shape)
z_index = np.argsort(image_dimensions)[1]
maximum_intensity_projection = np.max(rgb_image, axis=z_index)

min_pixel_value = np.min(maximum_intensity_projection)
max_pixel_value = np.max(maximum_intensity_projection)
normalized_image = (maximum_intensity_projection - min_pixel_value) / (max_pixel_value - min_pixel_value)

downsample_factor = (1, 0.75, 1)
downsampled_image = zoom(normalized_image, zoom=downsample_factor)

smooth_factor = 0.02
smoothed_image = gaussian_filter(downsampled_image, sigma=smooth_factor)

plt.imshow(smoothed_image)
plt.title(f'Processed {target_file} Image')
plt.show()





`;

// Activity instructions for each phase
export const INSTRUCTIONS = {
  [PHASES.IDENTIFICATION]: `Below is a python script that loads a NWB (Neurodata Without Borders) microscopy file, performs a number of preprocessing steps, and then visualizes the result. Unfortunately, the code is poorly written and could be difficult to understand. Select any code segments that you think could use reworking.`,
  
  [PHASES.MODIFICATION]: `Next, let's look at the lines you identified as problematic and see if we can fix them by applying some of the guidelines we covered in the lesson. You can hover over specific subsections of the script to view an explanation of what they accomplish.
Once you're finished, click the button in the bottom right to execute the script and ensure it runs correctly.`,
  
  [PHASES.VALIDATION]: `Compare your improved code with the original version. Consider how your changes have enhanced the code's clarity and efficiency. Answer all three questions below with "YES" to proceed to see the example solution.`,
  
  [PHASES.COMPLETION]: `Finally, let's take a moment to review the script and make sure that it meets some basic standards of readability.`
};

// Helper to get line number from cursor position
export const getLineFromPosition = (position, value) => {
  const textBeforePosition = value.substring(0, position);
  return textBeforePosition.split('\n').length;
};

// Helper to extract content from highlighted regions
export const getRegionContent = (region, value) => {
  if (!value || !region) return '';
  const lines = value.split('\n');
  return lines.slice(region.startLine - 1, region.endLine).join('\n');
};

// Helper to validate that at least two regions are identified
export const hasMinimumRegions = (regions) => {
  return regions && regions.length >= 2;
}; 