# InventoryXP API

A subscription-based inventory management system designed for gamers, eBay sellers, and other inventory management needs.

## Overview

InventoryXP API is built with .NET Core Web API, Entity Framework Core, and SQL Server (running in Docker). It provides a secure backend for managing user accounts, inventory items, and marketplace information with JWT authentication.

## Prerequisites

- [.NET 9.0 SDK](https://dotnet.microsoft.com/download)
- [Docker](https://www.docker.com/products/docker-desktop)
- [SQL Server container](https://hub.docker.com/_/microsoft-mssql-server)
- Entity Framework Core Tools (installed below)
- Postman (optional, for API testing)

## Setup Instructions

### 1. Install Required Tools

If you don't have the Entity Framework Core tools installed, run:

```bash
dotnet tool install --global dotnet-ef
```

### 2. Clone the Repository

```bash
git clone <repository-url>
cd InventoryXP
```

### 3. Set Up SQL Server in Docker

```bash
docker run -e "ACCEPT_EULA=Y" -e "MSSQL_SA_PASSWORD=NewStrong!Passw0rd" -p 1433:1433 -d mcr.microsoft.com/mssql/server:2022-latest
```

### 4. Restore Dependencies

```bash
cd backend/InventoryXP.API
dotnet restore
```

### 5. Apply Database Migrations

```bash
dotnet ef migrations add InitialCreate
dotnet ef database update
```

### 6. Run the API

```bash
dotnet run
```

The API will be available at:
- http://localhost:5247/swagger - Swagger UI

## Project Structure

```
InventoryXP.API/                  // Root of the .NET Core API project
├── Controllers/                  // API controllers
│   ├── AuthController.cs         // Authentication endpoints
│   ├── InventoryItemsController.cs // Inventory management
│   ├── ListingPlatformsController.cs // Marketplace platforms
│   ├── LocationsController.cs    // Optional hierarchical locations
│   └── UsersController.cs        // User management
├── Data/                         // Data access layer
│   ├── InventoryXpContext.cs     // EF Core DbContext
│   └── Migrations/               // EF Core migrations (auto-generated)
├── Models/                       // Domain models
│   ├── Auth/                     // Authentication models
│   │   ├── LoginRequest.cs       // Login request DTO
│   │   ├── LoginResponse.cs      // Login response with JWT
│   │   └── RegisterRequest.cs    // Registration request DTO
│   ├── InventoryItem.cs          // Inventory item model
│   ├── ListingPlatform.cs        // Marketplace platform model
│   ├── Location.cs               // Optional hierarchical location model
│   └── User.cs                   // User account model
├── Services/                     // Business logic services
│   └── AuthService.cs            // Authentication service
├── Properties/                   // Project properties
├── appsettings.json              // Configuration settings
├── Program.cs                    // Application entry point and configuration
└── InventoryXP.API.csproj        // Project file
```

## API Endpoints

### Authentication

- **POST /api/Auth/register** - Register a new user
- **POST /api/Auth/login** - Login and get JWT token

### Users

- **GET /api/Users/current** - Get current user profile
- **GET /api/Users/{id}** - Get user by ID (own profile only)
- **PUT /api/Users/{id}** - Update user (own profile only)
- **DELETE /api/Users/{id}** - Delete user (own profile only)

### Inventory Items

- **GET /api/InventoryItems** - Get all items for current user
- **GET /api/InventoryItems/{id}** - Get item by ID (if owned)
- **POST /api/InventoryItems** - Create a new inventory item
- **PUT /api/InventoryItems/{id}** - Update an item (if owned)
- **DELETE /api/InventoryItems/{id}** - Delete an item (if owned)

### Listing Platforms

- **GET /api/ListingPlatforms** - Get all listing platforms
- **GET /api/ListingPlatforms/{id}** - Get platform by ID

### Locations (Optional)

- **GET /api/Locations** - Get all locations
- **GET /api/Locations/rootlocations** - Get root locations
- **GET /api/Locations/children/{parentId}** - Get child locations

## Authentication

The API uses JWT Bearer authentication. After logging in, include the JWT token in the Authorization header of subsequent requests:

```
Authorization: Bearer {your-token}
```

## Package Dependencies

The project uses the following NuGet packages:

- Microsoft.AspNetCore.Authentication.JwtBearer (9.0.4)
- Microsoft.AspNetCore.OpenApi (9.0.4)
- Microsoft.EntityFrameworkCore.Design (9.0.4)
- Microsoft.EntityFrameworkCore.SqlServer (9.0.4)
- Swashbuckle.AspNetCore (6.5.0)
- System.IdentityModel.Tokens.Jwt (7.4.0)

## Development Notes

- In the demo version, password hashing is simulated. In production, implement proper password hashing.
- For security, change the JWT secret key in appsettings.json before deployment.
- The database connection string in appsettings.json may need to be adjusted based on your environment.

## Technologies Used

- .NET 9.0
- Entity Framework Core 9.0
- SQL Server
- JWT Authentication
- Swagger/OpenAPI for documentation 