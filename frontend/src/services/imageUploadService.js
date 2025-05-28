/**
 * Service for handling image uploads to ImageKit
 */

/**
 * Converts a File object to a base64 string
 * @param {File} file - The file to convert
 * @returns {Promise<string>} - A promise that resolves to the base64 string
 */
export const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      // The result is a data URL with format: data:image/jpeg;base64,/9j/4AAQSkZJRg...
      // We need to extract just the base64 part after the comma
      const base64String = event.target.result.split(',')[1];
      resolve(base64String);
    };
    
    reader.onerror = (error) => {
      reject(error);
    };
    
    reader.readAsDataURL(file);
  });
};

/**
 * Uploads an image file to ImageKit
 * @param {File} file - The image file to upload
 * @returns {Promise<Object>} - Promise resolving to the uploaded image data
 */
export const uploadImage = async (file) => {
  try {
    // Convert file to base64 string
    const base64String = await fileToBase64(file);
    
    // Prepare form data for the upload
    const formData = new FormData();
    formData.append('file', base64String);
    formData.append('fileName', file.name);
    formData.append('publicKey', import.meta.env.VITE_IMAGEKIT_PUBLIC_KEY);
    
    // Upload to ImageKit
    const response = await fetch('https://upload.imagekit.io/api/v1/files/upload', {
      method: 'POST',
      body: formData
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`ImageKit upload failed: ${errorData.message || response.statusText}`);
    }
    
    // Parse the response
    const imageData = await response.json();
    
    // Return the result
    return {
      url: imageData.url,
      thumbnailUrl: imageData.thumbnailUrl,
      name: imageData.name,
      fileId: imageData.fileId,
      size: file.size,
      mimeType: file.type,
      originalName: file.name
    };
  } catch (error) {
    console.error('Error uploading image to ImageKit:', error);
    throw error;
  }
};

/**
 * Gets the ImageKit URL for a given file path
 * @param {string} filePath - The file path in ImageKit
 * @returns {string} - The full ImageKit URL
 */
export const getImageKitUrl = (filePath) => {
  const endpoint = import.meta.env.VITE_IMAGEKIT_ENDPOINT || 'https://ik.imagekit.io/yourusername';
  return `${endpoint}/${filePath}`;
}; 