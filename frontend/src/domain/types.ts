// Domain entities for InventoryXP
export interface Item {
  id: string
  sku?: string
  title: string
  qty: number
  cost?: number
  price?: number
  locationId?: string
  updatedAt: number
}

export interface Location {
  id: string
  name: string
  code?: string
  updatedAt: number
}

// Repository interface for data access
export interface Repo {
  // Item operations
  items: {
    list(): Promise<Item[]>
    get(id: string): Promise<Item | null>
    upsert(item: Omit<Item, 'id' | 'updatedAt'> & { id?: string }): Promise<Item>
    remove(id: string): Promise<boolean>
    search(query?: string): Promise<Item[]>
  }
  
  // Location operations
  locations: {
    list(): Promise<Location[]>
    upsert(location: Omit<Location, 'id' | 'updatedAt'> & { id?: string }): Promise<Location>
    remove(id: string): Promise<boolean>
  }
}
