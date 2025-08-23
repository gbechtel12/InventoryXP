# Repository Pattern Implementation

This document describes the new Repository pattern implementation in InventoryXP frontend.

## Overview

The Repository pattern has been introduced to provide a clean separation between data access logic and business logic. Components and Pinia stores no longer call Axios or Firebase directly, but instead use a repository interface.

## Architecture

### Domain Layer (`src/domain/`)

- **`types.ts`**: Defines the core entities (`Item`, `Location`) and the `Repo` interface
- **`repo.ts`**: Provides dependency injection symbols and the `useRepo()` composable

### Data Layer (`src/data/`)

- **`CloudRepo.ts`**: Implements the repository using Firebase/Firestore (production implementation)

### Mock Layer (`src/mocks/`)

- **`MockRepo.ts`**: In-memory implementation for testing and development

## Usage

### Switching Between Repositories

To switch between mock and cloud repositories, set the environment variable:

```bash
# Use mock repository (in-memory data)
VITE_REPO=mock

# Use cloud repository (Firebase) - default behavior
VITE_REPO=cloud
# or leave unset
```

### In Components and Stores

```javascript
import { useRepo } from '../domain/repo'

export default {
  setup() {
    const repo = useRepo()
    
    // Use repository methods
    const items = await repo.items.list()
    const item = await repo.items.get('item-id')
    const newItem = await repo.items.upsert({ title: 'New Item', qty: 5 })
    await repo.items.remove('item-id')
    
    const locations = await repo.locations.list()
  }
}
```

## Benefits

1. **Separation of Concerns**: Data access logic is isolated from business logic
2. **Testability**: Easy to mock the repository for unit tests
3. **Flexibility**: Can switch between different data sources (mock, Firebase, API, etc.)
4. **Maintainability**: Changes to data access don't affect components or stores
5. **Type Safety**: Full TypeScript support with proper interfaces

## Migration Notes

- All existing UI behavior is preserved
- Store names and component props remain unchanged
- The repository handles data transformation between domain models and existing component expectations
- Backward compatibility is maintained through data transformation layers

## Testing

Run tests with:

```bash
npm test
```

The test suite verifies that stores correctly call repository methods and handle responses appropriately.
