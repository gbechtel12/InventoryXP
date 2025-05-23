import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from '../firebase/initFirebase';
import { updateDoc, doc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { firestore } from '../firebase/initFirebase';
import { 
  uploadItemImageFallback, 
  removeItemImageFallback, 
  setPrimaryImageFallback 
} from './imageServiceFallback';

/**
 * Uploads an image file to Firebase Storage and adds its URL to the item document
 * Falls back to local storage method if Firebase Storage fails
 * @param {File} file - The image file to upload
 * @param {string} itemId - The ID of the inventory item
 * @param {string} userId - The ID of the user uploading the image
 * @returns {Promise<Object>} - Object containing the download URL and metadata
 */
export const uploadItemImage = async (file, itemId, userId) => {
  try {
    // Create a unique filename using timestamp and original file name
    const timestamp = new Date().getTime();
    const fileName = `${timestamp}_${file.name}`;
    
    // Create a storage reference for this specific file
    const storageRef = ref(storage, `inventory/${userId}/${itemId}/${fileName}`);
    
    // Try direct upload to Firebase Storage
    try {
      // Upload the file
      const snapshot = await uploadBytes(storageRef, file);
      
      // Get the download URL
      const downloadURL = await getDownloadURL(snapshot.ref);
      
      // Create image metadata object
      const imageData = {
        url: downloadURL,
        fileName: fileName,
        path: snapshot.ref.fullPath,
        contentType: file.type,
        uploadedAt: timestamp,
        size: file.size
      };
      
      // Update the item document in Firestore to add this image URL to the images array
      const itemDocRef = doc(firestore, 'inventory', itemId);
      await updateDoc(itemDocRef, {
        images: arrayUnion(imageData)
      });
      
      return imageData;
    } catch (storageError) {
      console.warn('Firebase Storage upload failed, falling back to local method:', storageError);
      // If Firebase Storage upload fails (e.g., CORS issues), use the fallback method
      return uploadItemImageFallback(file, itemId, userId);
    }
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
};

/**
 * Removes an image from Firebase Storage and the item document
 * @param {Object} imageData - The image data object with url and path
 * @param {string} itemId - The ID of the inventory item
 * @returns {Promise<void>}
 */
export const removeItemImage = async (imageData, itemId) => {
  try {
    // Check if this is a fallback image
    if (imageData.isLocalFallback) {
      return removeItemImageFallback(imageData, itemId);
    }
    
    // Regular Firebase Storage image
    try {
      // Create a reference to the file to delete
      const imageRef = ref(storage, imageData.path);
      
      // Delete the file from Storage
      await deleteObject(imageRef);
      
      // Remove the image from the item document
      const itemDocRef = doc(firestore, 'inventory', itemId);
      await updateDoc(itemDocRef, {
        images: arrayRemove(imageData)
      });
      
      return { success: true, id: itemId, path: imageData.path };
    } catch (storageError) {
      console.warn('Firebase Storage delete failed, using Firestore-only removal:', storageError);
      // If Firebase Storage delete fails, just remove from Firestore
      const itemDocRef = doc(firestore, 'inventory', itemId);
      await updateDoc(itemDocRef, {
        images: arrayRemove(imageData)
      });
      
      return { success: true, id: itemId, path: imageData.path };
    }
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
    // The setPrimaryImage operation is the same for both regular and fallback images
    return setPrimaryImageFallback(itemId, imageData);
  } catch (error) {
    console.error('Error setting primary image:', error);
    throw error;
  }
}; 