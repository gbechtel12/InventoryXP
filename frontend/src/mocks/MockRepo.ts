import type { Repo, Item, Location } from '../domain/types'

export class MockRepo implements Repo {
  private items: Item[] = [
    {
      id: '1',
      sku: 'MOCK-001',
      title: 'Sample Item 1',
      qty: 10,
      cost: 15.99,
      price: 29.99,
      locationId: 'loc1',
      updatedAt: Date.now()
    },
    {
      id: '2',
      sku: 'MOCK-002',
      title: 'Sample Item 2',
      qty: 5,
      cost: 8.50,
      price: 19.99,
      locationId: 'loc2',
      updatedAt: Date.now()
    }
  ]

  private locations: Location[] = [
    {
      id: 'loc1',
      name: 'Warehouse A',
      code: 'WH-A',
      updatedAt: Date.now()
    },
    {
      id: 'loc2',
      name: 'Warehouse B',
      code: 'WH-B',
      updatedAt: Date.now()
    }
  ]

  items = {
    async list(): Promise<Item[]> {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 100))
      return [...this.items]
    },

    async get(id: string): Promise<Item | null> {
      await new Promise(resolve => setTimeout(resolve, 50))
      return this.items.find(item => item.id === id) || null
    },

    async upsert(itemData: Omit<Item, 'id' | 'updatedAt'> & { id?: string }): Promise<Item> {
      await new Promise(resolve => setTimeout(resolve, 150))
      
      if (itemData.id) {
        // Update existing item
        const index = this.items.findIndex(item => item.id === itemData.id)
        if (index !== -1) {
          this.items[index] = {
            ...this.items[index],
            ...itemData,
            updatedAt: Date.now()
          }
          return this.items[index]
        }
      }
      
      // Create new item
      const newItem: Item = {
        ...itemData,
        id: itemData.id || `mock_${Date.now()}`,
        updatedAt: Date.now()
      } as Item
      
      this.items.push(newItem)
      return newItem
    },

    async remove(id: string): Promise<boolean> {
      await new Promise(resolve => setTimeout(resolve, 100))
      const index = this.items.findIndex(item => item.id === id)
      if (index !== -1) {
        this.items.splice(index, 1)
        return true
      }
      return false
    },

    async search(query?: string): Promise<Item[]> {
      await new Promise(resolve => setTimeout(resolve, 80))
      
      if (!query) {
        return [...this.items]
      }
      
      const searchTerm = query.toLowerCase()
      return this.items.filter(item => 
        item.title.toLowerCase().includes(searchTerm) ||
        (item.sku && item.sku.toLowerCase().includes(searchTerm))
      )
    }
  }

  locations = {
    async list(): Promise<Location[]> {
      await new Promise(resolve => setTimeout(resolve, 100))
      return [...this.locations]
    },

    async upsert(locationData: Omit<Location, 'id' | 'updatedAt'> & { id?: string }): Promise<Location> {
      await new Promise(resolve => setTimeout(resolve, 150))
      
      if (locationData.id) {
        // Update existing location
        const index = this.locations.findIndex(loc => loc.id === locationData.id)
        if (index !== -1) {
          this.locations[index] = {
            ...this.locations[index],
            ...locationData,
            updatedAt: Date.now()
          }
          return this.locations[index]
        }
      }
      
      // Create new location
      const newLocation: Location = {
        ...locationData,
        id: locationData.id || `loc_${Date.now()}`,
        updatedAt: Date.now()
      } as Location
      
      this.locations.push(newLocation)
      return newLocation
    },

    async remove(id: string): Promise<boolean> {
      await new Promise(resolve => setTimeout(resolve, 100))
      const index = this.locations.findIndex(loc => loc.id === id)
      if (index !== -1) {
        this.locations.splice(index, 1)
        return true
      }
      return false
    }
  }
}
