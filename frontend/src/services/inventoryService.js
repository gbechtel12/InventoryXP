import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  getDocs,
  doc,
  serverTimestamp
} from 'firebase/firestore';
import { firestore } from '../firebase/initFirebase';

// Collection reference
const inventoryCollection = collection(firestore, 'inventory');

/**
 * Retrieves all inventory items for a specific user
 * @param {string} userId - The user ID to filter by
 * @returns {Promise<Array>} - Array of inventory items with their document IDs
 */
export const getInventoryItems = async (userId) => {
  try {
    // Create a query against the collection for the specific user
    const q = query(inventoryCollection, where('createdBy', '==', userId));
    const querySnapshot = await getDocs(q);
    
    // Map the documents to an array of objects including the document ID
    const items = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    return items;
  } catch (error) {
    console.error('Error getting inventory items:', error);
    throw error;
  }
};

/**
 * Adds a new inventory item
 * @param {Object} item - The inventory item to add
 * @param {string} userId - The ID of the user creating the item
 * @returns {Promise<Object>} - The added document reference and ID
 */
export const addInventoryItem = async (item, userId) => {
  try {
    // Add createdBy and timestamps
    const itemWithMeta = {
      ...item,
      createdBy: userId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    // Ensure all required fields exist
    const standardizedItem = {
      title: itemWithMeta.title || '',
      description: itemWithMeta.description || '',
      location: itemWithMeta.location || '',
      subLocation: itemWithMeta.subLocation || '',
      subSubLocation: itemWithMeta.subSubLocation || '',
      listedOn: itemWithMeta.listedOn || '',
      cost: Number(itemWithMeta.cost) || 0,
      listPrice: Number(itemWithMeta.listPrice) || 0,
      roi: Number(itemWithMeta.roi) || 0,
      // Image related fields
      images: itemWithMeta.images || [],
      primaryImage: itemWithMeta.primaryImage || null,
      createdBy: itemWithMeta.createdBy,
      createdAt: itemWithMeta.createdAt,
      updatedAt: itemWithMeta.updatedAt
    };
    
    const docRef = await addDoc(inventoryCollection, standardizedItem);
    
    return {
      id: docRef.id,
      ...standardizedItem
    };
  } catch (error) {
    console.error('Error adding inventory item:', error);
    throw error;
  }
};

/**
 * Updates an existing inventory item
 * @param {string} docId - The document ID to update
 * @param {Object} newData - The new data to update with
 * @returns {Promise<void>}
 */
export const updateInventoryItem = async (docId, newData) => {
  try {
    // Add updated timestamp
    const dataWithTimestamp = {
      ...newData,
      updatedAt: serverTimestamp()
    };
    
    // Get reference to the document
    const docRef = doc(firestore, 'inventory', docId);
    
    // Update the document
    await updateDoc(docRef, dataWithTimestamp);
    
    return {
      id: docId,
      ...dataWithTimestamp
    };
  } catch (error) {
    console.error('Error updating inventory item:', error);
    throw error;
  }
};

/**
 * Deletes an inventory item
 * @param {string} docId - The document ID to delete
 * @returns {Promise<void>}
 */
export const deleteInventoryItem = async (docId) => {
  try {
    // Get reference to the document
    const docRef = doc(firestore, 'inventory', docId);
    
    // Delete the document
    await deleteDoc(docRef);
    
    return { id: docId };
  } catch (error) {
    console.error('Error deleting inventory item:', error);
    throw error;
  }
};

/**
 * Calculates ROI for an inventory item
 * @param {number} cost - The cost of the item
 * @param {number} listPrice - The listing price of the item
 * @returns {number} - The calculated ROI percentage
 */
export const calculateRoi = (cost, listPrice) => {
  if (!cost || cost === 0) return 0;
  
  const profit = listPrice - cost;
  const roi = (profit / cost) * 100;
  
  return Number(roi.toFixed(2));
}; 