import { defineStore } from 'pinia'
import api from '../services/api'

// Development flag to bypass API calls when backend is not available
const MOCK_MODE = true // Set to true to enable mock data without backend

// Mock inventory data for development
const mockInventoryItems = [
  {
    itemID: 1,
    title: "Vintage Camera",
    description: "A fully functional vintage film camera from the 1970s",
    cost: 25.50,
    listingPrice: 89.99,
    mainLocation: "Shelf A",
    subLocation: "Box 3",
    listingPlatformID: 1,
    listingPlatform: { platformID: 1, name: "eBay" },
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    itemID: 2,
    title: "Mechanical Keyboard",
    description: "Cherry MX Blue switches, excellent condition",
    cost: 45.00,
    listingPrice: 110.00,
    mainLocation: "Shelf B",
    subLocation: "Box 1", 
    listingPlatformID: 2,
    listingPlatform: { platformID: 2, name: "Amazon" },
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    itemID: 3,
    title: "Antique Desk Lamp",
    description: "Brass finish with green glass shade, working condition",
    cost: 12.75,
    listingPrice: 65.00,
    mainLocation: "Shelf C",
    subLocation: null,
    listingPlatformID: 1,
    listingPlatform: { platformID: 1, name: "eBay" },
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    itemID: 4,
    title: "Leather Messenger Bag",
    description: "Genuine leather, lightly used",
    cost: 35.00,
    listingPrice: 85.00,
    mainLocation: "Closet",
    subLocation: "Top Shelf",
    listingPlatformID: 3,
    listingPlatform: { platformID: 3, name: "Etsy" },
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    itemID: 5,
    title: "Vintage Record Player",
    description: "1960s turntable, fully restored and working",
    cost: 75.00,
    listingPrice: 225.00,
    mainLocation: "Garage",
    subLocation: "Storage Unit 2",
    listingPlatformID: 1,
    listingPlatform: { platformID: 1, name: "eBay" },
    createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// Mock listing platforms for development
const mockListingPlatforms = [
  { platformID: 1, name: "eBay" },
  { platformID: 2, name: "Amazon" },
  { platformID: 3, name: "Etsy" },
  { platformID: 4, name: "Facebook Marketplace" },
  { platformID: 5, name: "Mercari" }
];

export const useInventoryStore = defineStore('inventory', {
  state: () => ({
    inventoryItems: MOCK_MODE ? [...mockInventoryItems] : [],
    currentItem: null,
    loading: false,
    error: null,
    listingPlatforms: MOCK_MODE ? [...mockListingPlatforms] : []
  }),
  
  getters: {
    getItemById: (state) => (id) => {
      return state.inventoryItems.find(item => item.itemID === id)
    },
    
    platformOptions: (state) => {
      return state.listingPlatforms.map(platform => ({
        value: platform.platformID,
        label: platform.name
      }))
    }
  },
  
  actions: {
    async fetchInventoryItems() {
      this.loading = true
      this.error = null
      
      try {
        if (MOCK_MODE) {
          // Use mock data in development
          console.log('Using mock inventory data - bypassing API call')
          this.inventoryItems = [...mockInventoryItems]
          return true
        }
        
        const response = await api.get('/InventoryItems')
        this.inventoryItems = response.data
        return true
      } catch (error) {
        console.error('Failed to fetch inventory items:', error)
        this.error = error.response?.data?.message || 'Failed to load inventory'
        return false
      } finally {
        this.loading = false
      }
    },
    
    async fetchItemById(id) {
      this.loading = true
      this.error = null
      
      try {
        if (MOCK_MODE) {
          // Find the item in mock data
          console.log('Using mock inventory data - bypassing API call')
          const item = mockInventoryItems.find(item => item.itemID === id)
          if (item) {
            this.currentItem = { ...item }
            return true
          } else {
            this.error = 'Item not found'
            return false
          }
        }
        
        const response = await api.get(`/InventoryItems/${id}`)
        this.currentItem = response.data
        return true
      } catch (error) {
        console.error(`Failed to fetch item with ID ${id}:`, error)
        this.error = error.response?.data?.message || 'Failed to load item'
        return false
      } finally {
        this.loading = false
      }
    },
    
    async createItem(itemData) {
      this.loading = true
      this.error = null
      
      try {
        if (MOCK_MODE) {
          // Create a new mock item
          console.log('Using mock inventory data - bypassing API call')
          const newId = Math.max(...this.inventoryItems.map(item => item.itemID)) + 1;
          const platform = this.listingPlatforms.find(p => p.platformID === itemData.listingPlatformID);
          
          const newItem = {
            ...itemData,
            itemID: newId,
            listingPlatform: platform || null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          
          this.inventoryItems.push(newItem);
          return newItem;
        }
        
        const response = await api.post('/InventoryItems', itemData)
        this.inventoryItems.push(response.data)
        return response.data
      } catch (error) {
        console.error('Failed to create inventory item:', error)
        this.error = error.response?.data?.message || 'Failed to create item'
        return null
      } finally {
        this.loading = false
      }
    },
    
    async updateItem(id, itemData) {
      this.loading = true
      this.error = null
      
      try {
        if (MOCK_MODE) {
          // Update the mock item
          console.log('Using mock inventory data - bypassing API call')
          const index = this.inventoryItems.findIndex(item => item.itemID === id)
          
          if (index !== -1) {
            const platform = this.listingPlatforms.find(p => p.platformID === itemData.listingPlatformID);
            
            const updatedItem = {
              ...this.inventoryItems[index],
              ...itemData,
              listingPlatform: platform || null,
              updatedAt: new Date().toISOString()
            };
            
            this.inventoryItems[index] = updatedItem;
            
            if (this.currentItem && this.currentItem.itemID === id) {
              this.currentItem = { ...updatedItem };
            }
            
            return true;
          }
          
          return false;
        }
        
        await api.put(`/InventoryItems/${id}`, itemData)
        
        // Update local data
        const index = this.inventoryItems.findIndex(item => item.itemID === id)
        if (index !== -1) {
          this.inventoryItems[index] = { ...this.inventoryItems[index], ...itemData }
        }
        
        if (this.currentItem && this.currentItem.itemID === id) {
          this.currentItem = { ...this.currentItem, ...itemData }
        }
        
        return true
      } catch (error) {
        console.error(`Failed to update item with ID ${id}:`, error)
        this.error = error.response?.data?.message || 'Failed to update item'
        return false
      } finally {
        this.loading = false
      }
    },
    
    async deleteItem(id) {
      this.loading = true
      this.error = null
      
      try {
        if (MOCK_MODE) {
          // Delete from mock data
          console.log('Using mock inventory data - bypassing API call')
          this.inventoryItems = this.inventoryItems.filter(item => item.itemID !== id)
          
          if (this.currentItem && this.currentItem.itemID === id) {
            this.currentItem = null
          }
          
          return true
        }
        
        await api.delete(`/InventoryItems/${id}`)
        
        // Remove from local data
        this.inventoryItems = this.inventoryItems.filter(item => item.itemID !== id)
        
        if (this.currentItem && this.currentItem.itemID === id) {
          this.currentItem = null
        }
        
        return true
      } catch (error) {
        console.error(`Failed to delete item with ID ${id}:`, error)
        this.error = error.response?.data?.message || 'Failed to delete item'
        return false
      } finally {
        this.loading = false
      }
    },
    
    async fetchListingPlatforms() {
      try {
        if (MOCK_MODE) {
          // Use mock platforms
          console.log('Using mock platform data - bypassing API call')
          this.listingPlatforms = [...mockListingPlatforms]
          return true
        }
        
        const response = await api.get('/ListingPlatforms')
        this.listingPlatforms = response.data
        return true
      } catch (error) {
        console.error('Failed to fetch listing platforms:', error)
        return false
      }
    }
  }
}) 