import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useInventoryStore } from '../inventory'

// Mock the repository
const mockRepo = {
  items: {
    list: vi.fn(),
    get: vi.fn(),
    upsert: vi.fn(),
    remove: vi.fn(),
    search: vi.fn()
  },
  locations: {
    list: vi.fn(),
    upsert: vi.fn(),
    remove: vi.fn()
  }
}

// Mock the useRepo composable
vi.mock('../../domain/repo', () => ({
  useRepo: () => mockRepo
}))

describe('Inventory Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  describe('fetchInventoryItems', () => {
    it('should call repo.items.list() and transform the response', async () => {
      const store = useInventoryStore()
      
      // Mock repository response
      const mockItems = [
        {
          id: '1',
          sku: 'TEST-001',
          title: 'Test Item',
          qty: 5,
          cost: 10,
          price: 20,
          locationId: 'loc1',
          updatedAt: Date.now()
        }
      ]
      
      mockRepo.items.list.mockResolvedValue(mockItems)
      
      // Call the action
      const result = await store.fetchInventoryItems()
      
      // Verify repository was called
      expect(mockRepo.items.list).toHaveBeenCalledTimes(1)
      
      // Verify result
      expect(result).toBe(true)
      expect(store.inventoryItems).toHaveLength(1)
      expect(store.inventoryItems[0]).toMatchObject({
        id: '1',
        itemID: '1',
        name: 'Test Item',
        title: 'Test Item',
        sku: 'TEST-001',
        qty: 5,
        quantity: 5,
        cost: 10,
        price: 20,
        locationId: 'loc1'
      })
    })

    it('should handle errors from repository', async () => {
      const store = useInventoryStore()
      
      // Mock repository error
      mockRepo.items.list.mockRejectedValue(new Error('Repository error'))
      
      // Call the action
      const result = await store.fetchInventoryItems()
      
      // Verify result
      expect(result).toBe(false)
      expect(store.error).toBe('Repository error')
    })
  })

  describe('createItem', () => {
    it('should call repo.items.upsert() with transformed data', async () => {
      const store = useInventoryStore()
      
      // Mock repository response
      const mockNewItem = {
        id: 'new-id',
        sku: 'NEW-001',
        title: 'New Item',
        qty: 10,
        cost: 15,
        price: 30,
        locationId: 'loc1',
        updatedAt: Date.now()
      }
      
      mockRepo.items.upsert.mockResolvedValue(mockNewItem)
      
      // Call the action
      const itemData = {
        title: 'New Item',
        name: 'New Item',
        sku: 'NEW-001',
        qty: 10,
        quantity: 10,
        cost: 15,
        price: 30,
        location: 'Warehouse A',
        subLocation: 'Shelf 1'
      }
      
      const result = await store.createItem(itemData)
      
      // Verify repository was called with correct data
      expect(mockRepo.items.upsert).toHaveBeenCalledTimes(1)
      expect(mockRepo.items.upsert).toHaveBeenCalledWith({
        sku: 'NEW-001',
        title: 'New Item',
        qty: 10,
        cost: 15,
        price: 30,
        locationId: undefined
      })
      
      // Verify result
      expect(result).toMatchObject({
        id: 'new-id',
        itemID: 'new-id',
        name: 'New Item',
        title: 'New Item',
        sku: 'NEW-001',
        qty: 10,
        quantity: 10,
        cost: 15,
        price: 30
      })
    })
  })

  describe('updateItem', () => {
    it('should call repo.items.upsert() with id and transformed data', async () => {
      const store = useInventoryStore()
      
      // Mock repository response
      mockRepo.items.upsert.mockResolvedValue({ id: '1', updatedAt: Date.now() })
      
      // Call the action
      const itemData = {
        title: 'Updated Item',
        name: 'Updated Item',
        qty: 15,
        quantity: 15,
        cost: 20,
        price: 40
      }
      
      const result = await store.updateItem('1', itemData)
      
      // Verify repository was called with correct data
      expect(mockRepo.items.upsert).toHaveBeenCalledTimes(1)
      expect(mockRepo.items.upsert).toHaveBeenCalledWith({
        id: '1',
        title: 'Updated Item',
        qty: 15,
        cost: 20,
        price: 40,
        locationId: undefined
      })
      
      // Verify result
      expect(result).toBe(true)
    })
  })

  describe('deleteItem', () => {
    it('should call repo.items.remove() with the correct id', async () => {
      const store = useInventoryStore()
      
      // Mock repository response
      mockRepo.items.remove.mockResolvedValue(true)
      
      // Call the action
      const result = await store.deleteItem('1')
      
      // Verify repository was called
      expect(mockRepo.items.remove).toHaveBeenCalledTimes(1)
      expect(mockRepo.items.remove).toHaveBeenCalledWith('1')
      
      // Verify result
      expect(result).toBe(true)
    })
  })
})
