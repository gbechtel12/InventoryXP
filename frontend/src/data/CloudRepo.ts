import type { Repo, Item, Location } from '../domain/types'
import api from '../services/api'
import { firestore } from '../firebase/initFirebase'

export class CloudRepo implements Repo {
  items = {
    async list(): Promise<Item[]> {
      try {
        const inventoryCollectionRef = firestore.collection('inventory')
        const querySnapshot = await inventoryCollectionRef.get()
        
        const items: Item[] = []
        querySnapshot.forEach((doc) => {
          const data = doc.data()
          items.push({
            id: doc.id,
            sku: data.sku,
            title: data.title || data.name || '',
            qty: data.qty || data.quantity || 0,
            cost: data.cost,
            price: data.price,
            locationId: data.locationId,
            updatedAt: data.updatedAt ? new Date(data.updatedAt).getTime() : Date.now()
          })
        })
        
        return items
      } catch (error) {
        console.error('Failed to fetch inventory items:', error)
        throw error
      }
    },

    async get(id: string): Promise<Item | null> {
      try {
        const docRef = firestore.collection('inventory').doc(id)
        const docSnap = await docRef.get()
        
        if (docSnap.exists) {
          const data = docSnap.data()!
          return {
            id: docSnap.id,
            sku: data.sku,
            title: data.title || data.name || '',
            qty: data.qty || data.quantity || 0,
            cost: data.cost,
            price: data.price,
            locationId: data.locationId,
            updatedAt: data.updatedAt ? new Date(data.updatedAt).getTime() : Date.now()
          }
        }
        
        return null
      } catch (error) {
        console.error(`Failed to fetch item with ID ${id}:`, error)
        throw error
      }
    },

    async upsert(itemData: Omit<Item, 'id' | 'updatedAt'> & { id?: string }): Promise<Item> {
      try {
        const inventoryCollectionRef = firestore.collection('inventory')
        const now = new Date().toISOString()
        
        if (itemData.id) {
          // Update existing item
          const docRef = inventoryCollectionRef.doc(itemData.id)
          await docRef.update({
            ...itemData,
            updatedAt: now
          })
          
          return {
            ...itemData,
            id: itemData.id,
            updatedAt: new Date(now).getTime()
          } as Item
        } else {
          // Create new item
          const docRef = await inventoryCollectionRef.add({
            ...itemData,
            createdAt: now,
            updatedAt: now
          })
          
          return {
            ...itemData,
            id: docRef.id,
            updatedAt: new Date(now).getTime()
          } as Item
        }
      } catch (error) {
        console.error('Failed to upsert inventory item:', error)
        throw error
      }
    },

    async remove(id: string): Promise<boolean> {
      try {
        const docRef = firestore.collection('inventory').doc(id)
        await docRef.delete()
        return true
      } catch (error) {
        console.error(`Failed to delete item with ID ${id}:`, error)
        throw error
      }
    },

    async search(query?: string): Promise<Item[]> {
      try {
        if (!query) {
          return this.list()
        }
        
        const inventoryCollectionRef = firestore.collection('inventory')
        const querySnapshot = await inventoryCollectionRef.get()
        
        const items: Item[] = []
        querySnapshot.forEach((doc) => {
          const data = doc.data()
          const searchableText = [
            data.title || data.name || '',
            data.sku || '',
            data.location || '',
            data.subLocation || ''
          ].join(' ').toLowerCase()
          
          if (searchableText.includes(query.toLowerCase())) {
            items.push({
              id: doc.id,
              sku: data.sku,
              title: data.title || data.name || '',
              qty: data.qty || data.quantity || 0,
              cost: data.cost,
              price: data.price,
              locationId: data.locationId,
              updatedAt: data.updatedAt ? new Date(data.updatedAt).getTime() : Date.now()
            })
          }
        })
        
        return items
      } catch (error) {
        console.error('Failed to search inventory items:', error)
        throw error
      }
    }
  }

  locations = {
    async list(): Promise<Location[]> {
      try {
        // For now, return empty array as locations aren't fully implemented yet
        // This can be expanded when location management is added
        return []
      } catch (error) {
        console.error('Failed to fetch locations:', error)
        throw error
      }
    },

    async upsert(locationData: Omit<Location, 'id' | 'updatedAt'> & { id?: string }): Promise<Location> {
      try {
        // Stub implementation - can be expanded when location management is added
        const now = Date.now()
        const id = locationData.id || `loc_${Date.now()}`
        
        return {
          ...locationData,
          id,
          updatedAt: now
        } as Location
      } catch (error) {
        console.error('Failed to upsert location:', error)
        throw error
      }
    },

    async remove(id: string): Promise<boolean> {
      try {
        // Stub implementation - can be expanded when location management is added
        return true
      } catch (error) {
        console.error(`Failed to delete location with ID ${id}:`, error)
        throw error
      }
    }
  }
}
