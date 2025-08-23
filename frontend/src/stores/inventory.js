import { defineStore } from 'pinia'
import { useRepo } from '../domain/repo'

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
        const repo = useRepo()
        const items = await repo.items.list()
        
        // Transform items to match existing format for backward compatibility
        const transformedItems = items.map(item => ({
          id: item.id,
          itemID: item.id, // Keep both for backward compatibility
          name: item.title, // Map title to name for existing components
          title: item.title,
          sku: item.sku,
          qty: item.qty,
          quantity: item.qty, // Keep both for backward compatibility
          cost: item.cost,
          price: item.price,
          locationId: item.locationId,
          location: '', // These will be populated when location management is implemented
          subLocation: '',
          subSubLocation: '',
          createdAt: new Date(item.updatedAt).toISOString(),
          updatedAt: new Date(item.updatedAt).toISOString()
        }))
        
        this.inventoryItems = transformedItems
        console.log('Fetched inventory items via repository:', transformedItems.length)
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
        
        // Otherwise fetch from repository
        const repo = useRepo()
        const item = await repo.items.get(id)
        
        if (item) {
          // Transform item to match existing format
          this.currentItem = {
            id: item.id,
            itemID: item.id,
            name: item.title,
            title: item.title,
            sku: item.sku,
            qty: item.qty,
            quantity: item.qty,
            cost: item.cost,
            price: item.price,
            locationId: item.locationId,
            location: '',
            subLocation: '',
            subSubLocation: '',
            createdAt: new Date(item.updatedAt).toISOString(),
            updatedAt: new Date(item.updatedAt).toISOString()
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
        const repo = useRepo()
        
        // Transform itemData to match domain model
        const domainItem = {
          sku: itemData.sku,
          title: itemData.title || itemData.name,
          qty: itemData.qty || itemData.quantity || 0,
          cost: itemData.cost,
          price: itemData.price,
          locationId: itemData.locationId
        }
        
        const newItem = await repo.items.upsert(domainItem)
        
        // Transform back to existing format for backward compatibility
        const transformedItem = {
          id: newItem.id,
          itemID: newItem.id,
          name: newItem.title,
          title: newItem.title,
          sku: newItem.sku,
          qty: newItem.qty,
          quantity: newItem.qty,
          cost: newItem.cost,
          price: newItem.price,
          locationId: newItem.locationId,
          location: itemData.location || '',
          subLocation: itemData.subLocation || '',
          subSubLocation: itemData.subSubLocation || '',
          createdAt: new Date(newItem.updatedAt).toISOString(),
          updatedAt: new Date(newItem.updatedAt).toISOString()
        }
        
        // Add to local state
        this.inventoryItems.push(transformedItem)
        
        console.log('Item created via repository:', newItem.id)
        return transformedItem
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
        const repo = useRepo()
        
        // Transform itemData to match domain model
        const domainItem = {
          id,
          sku: itemData.sku,
          title: itemData.title || itemData.name,
          qty: itemData.qty || itemData.quantity || 0,
          cost: itemData.cost,
          price: itemData.price,
          locationId: itemData.locationId
        }
        
        await repo.items.upsert(domainItem)
        
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
        
        console.log('Item updated via repository:', id)
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
        const repo = useRepo()
        await repo.items.remove(id)
        
        // Remove from local data
        this.inventoryItems = this.inventoryItems.filter(item => 
          item.id !== id && item.itemID !== id
        )
        
        // Clear current item if it's being viewed
        if (this.currentItem && (this.currentItem.id === id || this.currentItem.itemID === id)) {
          this.currentItem = null
        }
        
        console.log('Item deleted via repository:', id)
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
        // In the future, this could be fetched from the repository as well
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