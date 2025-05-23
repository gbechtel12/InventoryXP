import { defineStore } from 'pinia'
import api from '../services/api'
// Firebase v8 doesn't use these named imports - functionality is available on the service instances
import { firestore } from '../firebase/initFirebase'

// Development flag to bypass API calls when backend is not available
const MOCK_MODE = false // Disable mock data to use real Firebase data

export const useInventoryStore = defineStore('inventory', {
  state: () => ({
    inventoryItems: [],
    currentItem: null,
    loading: false,
    error: null,
    listingPlatforms: []
  }),
  
  getters: {
    getItemById: (state) => (id) => {
      return state.inventoryItems.find(item => item.id === id || item.itemID === id)
    },
    
    platformOptions: (state) => {
      return state.listingPlatforms.map(platform => ({
        value: platform.id || platform.platformID,
        label: platform.name
      }))
    }
  },
  
  actions: {
    async fetchInventoryItems() {
      this.loading = true
      this.error = null
      
      try {
        // Get items from Firestore
        const inventoryCollectionRef = firestore.collection('inventory')
        const querySnapshot = await inventoryCollectionRef.get()
        
        const items = []
        querySnapshot.forEach((doc) => {
          items.push({
            id: doc.id,
            ...doc.data()
          })
        })
        
        // Set items to state
        this.inventoryItems = items
        console.log('Fetched inventory items from Firestore:', items.length)
        return true
      } catch (error) {
        console.error('Failed to fetch inventory items:', error)
        this.error = error.message || 'Failed to load inventory'
        return false
      } finally {
        this.loading = false
      }
    },
    
    async fetchItemById(id) {
      this.loading = true
      this.error = null
      
      try {
        // Item may already be in state
        const existingItem = this.getItemById(id)
        if (existingItem) {
          this.currentItem = { ...existingItem }
          return true
        }
        
        // Otherwise fetch from Firestore
        const docRef = firestore.collection('inventory').doc(id)
        const docSnap = await docRef.get()
        
        if (docSnap.exists) {
          this.currentItem = {
            id: docSnap.id,
            ...docSnap.data()
          }
          return true
        } else {
          this.error = 'Item not found'
          return false
        }
      } catch (error) {
        console.error(`Failed to fetch item with ID ${id}:`, error)
        this.error = error.message || 'Failed to load item'
        return false
      } finally {
        this.loading = false
      }
    },
    
    async createItem(itemData) {
      this.loading = true
      this.error = null
      
      try {
        // Add to Firestore
        const inventoryCollectionRef = firestore.collection('inventory')
        const docRef = await inventoryCollectionRef.add({
          ...itemData,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        })
        
        // Create item with ID and timestamps
        const newItem = {
          id: docRef.id,
          ...itemData,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
        
        // Add to local state
        this.inventoryItems.push(newItem)
        
        console.log('Item created in Firestore:', docRef.id)
        return newItem
      } catch (error) {
        console.error('Failed to create inventory item:', error)
        this.error = error.message || 'Failed to create item'
        return null
      } finally {
        this.loading = false
      }
    },
    
    async updateItem(id, itemData) {
      this.loading = true
      this.error = null
      
      try {
        // Update in Firestore
        const docRef = firestore.collection('inventory').doc(id)
        await docRef.update({
          ...itemData,
          updatedAt: new Date().toISOString()
        })
        
        // Update local data
        const index = this.inventoryItems.findIndex(item => item.id === id || item.itemID === id)
        if (index !== -1) {
          this.inventoryItems[index] = { 
            ...this.inventoryItems[index], 
            ...itemData,
            updatedAt: new Date().toISOString()
          }
        }
        
        // Update current item if it's being viewed
        if (this.currentItem && (this.currentItem.id === id || this.currentItem.itemID === id)) {
          this.currentItem = { 
            ...this.currentItem, 
            ...itemData,
            updatedAt: new Date().toISOString()
          }
        }
        
        console.log('Item updated in Firestore:', id)
        return true
      } catch (error) {
        console.error(`Failed to update item with ID ${id}:`, error)
        this.error = error.message || 'Failed to update item'
        return false
      } finally {
        this.loading = false
      }
    },
    
    async deleteItem(id) {
      this.loading = true
      this.error = null
      
      try {
        // Delete from Firestore
        const docRef = firestore.collection('inventory').doc(id)
        await docRef.delete()
        
        // Remove from local data
        this.inventoryItems = this.inventoryItems.filter(item => 
          item.id !== id && item.itemID !== id
        )
        
        // Clear current item if it's being viewed
        if (this.currentItem && (this.currentItem.id === id || this.currentItem.itemID === id)) {
          this.currentItem = null
        }
        
        console.log('Item deleted from Firestore:', id)
        return true
      } catch (error) {
        console.error(`Failed to delete item with ID ${id}:`, error)
        this.error = error.message || 'Failed to delete item'
        return false
      } finally {
        this.loading = false
      }
    },
    
    async fetchListingPlatforms() {
      try {
        // For now, we'll use a simple preset list of platforms
        // In the future, this could be fetched from Firestore as well
        this.listingPlatforms = [
          { id: 1, name: "eBay" },
          { id: 2, name: "Amazon" },
          { id: 3, name: "Etsy" },
          { id: 4, name: "Facebook Marketplace" },
          { id: 5, name: "Mercari" }
        ]
        
        return true
      } catch (error) {
        console.error('Failed to fetch listing platforms:', error)
        return false
      }
    }
  }
}) 