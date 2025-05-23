import { doc, updateDoc, arrayUnion, arrayRemove, getDoc } from 'firebase/firestore';
import { firestore } from '../firebase/initFirebase';

/**
 * Resizes an image to limit its dimensions and file size
 * @param {File} file - The image file to resize
 * @param {number} maxWidth - Maximum width in pixels
 * @param {number} maxHeight - Maximum height in pixels
 * @param {number} quality - JPEG quality (0-1)
 * @returns {Promise<Blob>} - Resized image as Blob
 */
const resizeImage = (file, maxWidth = 800, maxHeight = 800, quality = 0.7) => {
  return new Promise((resolve, reject) => {
    // Create a FileReader to read the file
    const reader = new FileReader();
    
    // Set up FileReader onload handler
    reader.onload = (readerEvent) => {
      // Create an image object
      const img = new Image();
      
      // Set up image onload handler
      img.onload = () => {
        // Calculate new dimensions while maintaining aspect ratio
        let width = img.width;
        let height = img.height;
        
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round(height * (maxWidth / width));
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round(width * (maxHeight / height));
            height = maxHeight;
          }
        }
        
        // Create a canvas element
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        
        // Draw resized image on canvas
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        
        // Convert canvas to blob
        canvas.toBlob((blob) => {
          if (blob) {
            resolve(blob);
          } else {
            // Fallback if toBlob is not supported
            try {
              const dataUrl = canvas.toDataURL('image/jpeg', quality);
              const byteString = atob(dataUrl.split(',')[1]);
              const ab = new ArrayBuffer(byteString.length);
              const ia = new Uint8Array(ab);
              
              for (let i = 0; i < byteString.length; i++) {
                ia[i] = byteString.charCodeAt(i);
              }
              
              resolve(new Blob([ab], { type: 'image/jpeg' }));
            } catch (e) {
              reject(e);
            }
          }
        }, 'image/jpeg', quality);
      };
      
      // Handle image load error
      img.onerror = (error) => {
        reject(error);
      };
      
      // Load image from FileReader result
      img.src = readerEvent.target.result;
    };
    
    // Handle FileReader error
    reader.onerror = (error) => {
      reject(error);
    };
    
    // Read the file as a data URL
    reader.readAsDataURL(file);
  });
};

// For local development or when Storage CORS fails, we'll store metadata in Firestore
// and encode a smaller version of the image directly
export const uploadItemImageFallback = async (file, itemId, userId) => {
  try {
    // First resize the image to a reasonable size
    const resizedImageBlob = await resizeImage(file);
    
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = async (event) => {
        try {
          // Create a base64 data URL from the resized image
          const dataUrl = event.target.result;
          
          // Create timestamp for unique identification
          const timestamp = new Date().getTime();
          
          // Create image metadata object
          const imageData = {
            url: dataUrl,
            fileName: `${timestamp}_${file.name}`,
            path: `local_fallback/${userId}/${itemId}/${timestamp}_${file.name}`,
            contentType: 'image/jpeg', // We convert to JPEG during resize
            uploadedAt: timestamp,
            size: resizedImageBlob.size,
            isLocalFallback: true, // Flag to identify fallback images
            dimensions: {
              width: 800, // Max width from resize function
              height: 800 // Max height from resize function
            }
          };
          
          // Update the item document in Firestore with just this image
          const itemDocRef = doc(firestore, 'inventory', itemId);
          
          // Instead of using arrayUnion which might cause nested array issues,
          // Get current images array, append the new image, and update
          const docSnap = await getDoc(itemDocRef);
          let currentImages = [];
          
          if (docSnap.exists()) {
            const data = docSnap.data();
            if (data.images && Array.isArray(data.images)) {
              currentImages = [...data.images];
            }
          }
          
          currentImages.push(imageData);
          
          await updateDoc(itemDocRef, {
            images: currentImages
          });
          
          resolve(imageData);
        } catch (error) {
          console.error('Error in fallback image upload:', error);
          reject(error);
        }
      };
      
      reader.onerror = (error) => {
        console.error('FileReader error:', error);
        reject(error);
      };
      
      // Read the resized image as a data URL (base64)
      reader.readAsDataURL(resizedImageBlob);
    });
  } catch (error) {
    console.error('Error in fallback image upload setup:', error);
    throw error;
  }
};

export const removeItemImageFallback = async (imageData, itemId) => {
  try {
    // For fallback images, we just remove from Firestore - no Storage deletion needed
    const itemDocRef = doc(firestore, 'inventory', itemId);
    
    // Get the current images array
    const docSnap = await getDoc(itemDocRef);
    if (!docSnap.exists()) {
      throw new Error('Item document not found');
    }
    
    const data = docSnap.data();
    const currentImages = data.images || [];
    
    // Filter out the image to remove
    const updatedImages = currentImages.filter(img => 
      img.path !== imageData.path
    );
    
    // Update document with new array
    await updateDoc(itemDocRef, {
      images: updatedImages
    });
    
    return { success: true, id: itemId, path: imageData.path };
  } catch (error) {
    console.error('Error removing fallback image:', error);
    throw error;
  }
};

export const setPrimaryImageFallback = async (itemId, imageData) => {
  try {
    const itemDocRef = doc(firestore, 'inventory', itemId);
    await updateDoc(itemDocRef, {
      primaryImage: imageData
    });
    
    return { success: true, id: itemId };
  } catch (error) {
    console.error('Error setting primary fallback image:', error);
    throw error;
  }
}; 