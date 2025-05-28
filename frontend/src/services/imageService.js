// Firebase v8 doesn't use these named imports - functionality is available on the service instances
import firebase from 'firebase/app';
import { firestore } from '../firebase/initFirebase';
import { 
  uploadItemImageFallback, 
  removeItemImageFallback, 
  setPrimaryImageFallback 
} from './imageServiceFallback';

// Static placeholder images for development/testing
const PLACEHOLDER_IMAGES = [
  'https://placehold.co/800x800?text=Placeholder+Image',
  'https://placehold.co/800x800/e6f7ff/333333?text=No+Storage',
  'https://placehold.co/800x800/fff3e0/333333?text=Sample+Item'
];

/**
 * Uploads an image file to Firestore as base64 data URL
 * Firebase Storage has been removed to avoid CORS issues
 * @param {File} file - The image file to upload
 * @param {string} itemId - The ID of the inventory item
 * @param {string} userId - The ID of the user uploading the image
 * @returns {Promise<Object>} - Object containing the image data
 */
export const uploadItemImage = async (file, itemId, userId) => {
  try {
    console.log('Using fallback image upload method (Firebase Storage disabled)');
    // Always use the fallback method since Firebase Storage has been removed
    return uploadItemImageFallback(file, itemId, userId);
  } catch (error) {
    console.error('Error uploading image:', error);
    
    // If all else fails, use a placeholder image
    const timestamp = new Date().getTime();
    const randomIndex = Math.floor(Math.random() * PLACEHOLDER_IMAGES.length);
    
    const placeholderImage = {
      url: PLACEHOLDER_IMAGES[randomIndex],
      fileName: `placeholder-${timestamp}.jpg`,
      path: `placeholder/${timestamp}`,
      contentType: 'image/jpeg',
      uploadedAt: timestamp,
      size: 0,
      isPlaceholder: true,
      isLocalFallback: true
    };
    
    // Add the placeholder to Firestore
    try {
      const itemDocRef = firestore.collection('inventory').doc(itemId);
      await itemDocRef.update({
        images: firebase.firestore.FieldValue.arrayUnion(placeholderImage)
      });
    } catch (firestoreError) {
      console.error('Failed to add placeholder image to Firestore:', firestoreError);
    }
    
    return placeholderImage;
  }
};

/**
 * Removes an image from the item document
 * @param {Object} imageData - The image data object
 * @param {string} itemId - The ID of the inventory item
 * @returns {Promise<void>}
 */
export const removeItemImage = async (imageData, itemId) => {
  try {
    // All images are now treated as fallback images
    return removeItemImageFallback(imageData, itemId);
  } catch (error) {
    console.error('Error removing image:', error);
    throw error;
  }
};

/**
 * Sets the primary image for an item
 * @param {string} itemId - The ID of the inventory item
 * @param {Object} imageData - The image data to set as primary
 * @returns {Promise<void>}
 */
export const setPrimaryImage = async (itemId, imageData) => {
  try {
    return setPrimaryImageFallback(itemId, imageData);
  } catch (error) {
    console.error('Error setting primary image:', error);
    throw error;
  }
}; 