const logger = require('../../../../../../../../packages/logging/logger.js');
import hljs from 'highlight.js';

// Common color palette for functions
export const FUNCTION_COLORS = [
  "#FFE6E6", "#E6F3FF", "#E6FFE6", "#FFFFE6", "#F0E6FF",
  "#FFE6F0", "#E6FFF0", "#FFF0E6", "#F0FFE6", "#E6F0FF"
];

// Generate a distinct color for functions
export const generateColor = (index) => {
  return FUNCTION_COLORS[index % FUNCTION_COLORS.length];
};

// Extract function content from the original code value
export const getFunctionContent = (func, value) => {
  if (!value || !func) return '';
  const lines = value.split('\n');
  return lines.slice(func.startLine - 1, func.endLine).join('\n');
};

// Get syntax highlighted function content
export const getHighlightedFunctionContent = (func, value) => {
  const content = getFunctionContent(func, value);
  if (!content.trim()) return '';
  
  try {
    const result = hljs.highlight(content, { language: 'python' });
    return result.value;
  } catch (error) {
    logger.app.warn('Syntax highlighting failed:', error);
    return content; // Fallback to plain text
  }
};

// Mock variables for variable picker - in real implementation, 
// these would come from code analysis
export const MOCK_VARIABLES = [
  'raw_images', 'processed_images', 'x', 'y', 'img1', 'img2', 'img3', 
  'normalized_image', 'downsampled_image', 'smoothed_image', 'fig', 'axes'
];

// Default code template for the editor
export const DEFAULT_CODE = `# Example code with numpy and matplotlib
import numpy as np
import matplotlib.pyplot as plt

# Generate sample data since we may not have access to actual microscopy files
def generate_sample_microscopy_data():
    """Generate mock microscopy data for demonstration"""
    # Create sample images that simulate microscopy data
    raw_images = []
    
    # Image 1: Circular structure
    x, y = np.meshgrid(np.linspace(-1, 1, 100), np.linspace(-1, 1, 100))
    img1 = np.exp(-(x**2 + y**2) * 2) + 0.1 * np.random.random((100, 100))
    raw_images.append(img1)
    
    # Image 2: Linear structure
    img2 = np.exp(-((x-0.3)**2 + y**2) * 5) + np.exp(-((x+0.3)**2 + y**2) * 5) + 0.1 * np.random.random((100, 100))
    raw_images.append(img2)
    
    # Image 3: Complex structure
    img3 = np.sin(5*x) * np.cos(5*y) * np.exp(-(x**2 + y**2)) + 0.2 * np.random.random((100, 100))
    raw_images.append(img3)
    
    return raw_images

# Generate mock data
raw_images = generate_sample_microscopy_data()
processed_images = []

# Process each image
for i, raw_image in enumerate(raw_images):
    # Normalize the image data to the range [0, 1]
    normalized_image = (raw_image - np.min(raw_image)) / (np.max(raw_image) - np.min(raw_image))
    
    # Apply some basic processing (smoothing)
    from scipy.ndimage import gaussian_filter, zoom
    
    # Downsample and smooth
    downsampling_factor = 0.7
    gaussian_sigma = 1.5
    
    downsampled_image = zoom(normalized_image, (downsampling_factor, downsampling_factor))
    smoothed_image = gaussian_filter(downsampled_image, sigma=gaussian_sigma)
    
    processed_images.append(smoothed_image)

# Create visualization
fig, axes = plt.subplots(3, 2, figsize=(10, 12))

for i in range(3):
    # Plot raw image
    axes[i, 0].imshow(raw_images[i], cmap='gray')
    axes[i, 0].set_title(f'Raw Image {i + 1}')
    axes[i, 0].axis('off')
    
    # Plot processed image
    axes[i, 1].imshow(processed_images[i], cmap='gray')
    axes[i, 1].set_title(f'Processed Image {i + 1}')
    axes[i, 1].axis('off')

plt.tight_layout()
plt.show()
print("Image processing completed successfully!")`;

// Phase constants
export const PHASES = {
  CREATION: 'creation',
  REVIEW: 'review',
  GENERATED: 'generated'
};

// Common validation functions
export const validateFunctionName = (name) => {
  if (!name || typeof name !== 'string') return false;
  const trimmedName = name.trim();
  return trimmedName.length > 0 && trimmedName.length <= 50;
};

export const validateFunctionInputs = (inputs) => {
  if (!inputs || !Array.isArray(inputs)) return true; // Inputs are optional
  return inputs.every(input => typeof input === 'string' && input.trim().length > 0);
};

export const validateFunctionOutput = (output) => {
  if (!output || typeof output !== 'string') return true; // Output is optional
  return output.trim().length > 0;
};

// Helper to format function name for code generation
export const formatFunctionName = (name) => {
  return name.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
};

// Helper to check if all questions are answered in function review
export const allQuestionsAnswered = (functions, functionAnswers) => {
  return functions.every(func => {
    const answers = functionAnswers[func.id];
    return answers && 
      answers.singlePurpose && 
      answers.worksAsIs && 
      answers.sideEffects;
  });
};

// Helper to get line number from cursor position
export const getLineFromPosition = (position, value) => {
  const textBeforePosition = value.substring(0, position);
  return textBeforePosition.split('\n').length;
}; 