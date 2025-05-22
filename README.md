# InventoryXP

A subscription-based inventory management system designed for resellers who list products on eBay, Poshmark, Etsy, and other marketplace platforms.

![InventoryXP Logo](frontend/public/favicon.ico)

## Project Goals

InventoryXP aims to solve common inventory management challenges faced by online resellers:

- **Centralized Inventory Management**: Track all inventory items in one place, regardless of which platforms they're listed on
- **Location Tracking**: Easily locate physical items in your warehouse or storage space
- **Cost & Profitability Analysis**: Track purchase costs, listing prices, and fees to calculate profit margins
- **Multi-platform Integration**: Support for major selling platforms like eBay, Etsy, Amazon, and Poshmark
- **Subscription Model**: Provide different tiers of service based on inventory volume and feature needs

## Tech Stack

### Frontend
- **Framework**: Vue.js 3 with Composition API
- **Build Tool**: Vite
- **State Management**: Pinia
- **Styling**: TailwindCSS
- **Authentication**: Firebase Auth
- **HTTP Client**: Axios
- **Routing**: Vue Router

### Backend
- **Framework**: .NET Core Web API
- **Database**: SQL Server (in Docker)
- **ORM**: Entity Framework Core
- **Authentication**: JWT Bearer Tokens
- **API Documentation**: Swagger/OpenAPI

## How to Run Locally

### Prerequisites
- Node.js 16+ and npm
- .NET 9.0 SDK
- Docker (for SQL Server)
- Git

### Backend Setup

1. Start SQL Server in Docker:
```bash
docker run -e "ACCEPT_EULA=Y" -e "MSSQL_SA_PASSWORD=NewStrong!Passw0rd" -p 1433:1433 -d mcr.microsoft.com/mssql/server:2022-latest
```

2. Clone the repository:
```bash
git clone https://github.com/gbechtel12/InventoryXP.git
cd InventoryXP
```

3. Set up the backend:
```bash
cd backend/InventoryXP.API
dotnet restore
dotnet ef database update
dotnet run
```

The backend API will be available at: http://localhost:5247/swagger

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env.local` file for Firebase configuration:
```
# API Configuration
VITE_API_URL=http://localhost:5247/api

# Firebase Config (optional - will use mock auth if not provided)
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
```

4. Start the development server:
```bash
npm run dev
```

The frontend will be available at: http://localhost:3000

## Deployment Instructions

### Backend Deployment

The backend can be deployed to any environment that supports .NET applications:

#### Azure App Service
1. Create an Azure SQL Database
2. Update connection strings in `appsettings.json`
3. Deploy via Visual Studio or Azure CLI
4. Configure environment variables

#### Docker Deployment
1. Build the Docker image:
```bash
docker build -t inventoryxp-api ./backend
```

2. Run the container:
```bash
docker run -p 5247:80 -e "ConnectionStrings__DefaultConnection=your_connection_string" inventoryxp-api
```

### Frontend Deployment

#### Netlify Deployment

1. Create an account on Netlify
2. Connect to your GitHub repository
3. Configure build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
4. Set environment variables in the Netlify dashboard

#### Vercel Deployment

1. Create an account on Vercel
2. Install the Vercel CLI: `npm i -g vercel`
3. Run `vercel` in the frontend directory
4. Set environment variables in the Vercel dashboard

## Development Workflow

### Branching Strategy

We follow a simplified Git Flow approach:

- **main**: Production code only. All code in this branch should be deployable.
- **develop**: Main development branch. Features are merged here after review.
- **feature/x**: Feature branches for new development, branched from develop.
- **bugfix/x**: Bug fix branches, branched from develop.
- **release/x.x.x**: Release preparation branches.
- **hotfix/x**: Emergency fixes to production, branched from main.

### Branch Naming Convention

- Feature branches: `feature/add-item-scanning`
- Bug fixes: `bugfix/fix-login-validation`
- Releases: `release/1.2.0`
- Hotfixes: `hotfix/fix-critical-security-issue`

### Pull Request Process

1. Create a feature/bugfix branch from develop
2. Make changes and commit with descriptive messages
3. Push branch and create a Pull Request to develop
4. Request review from at least one team member
5. Address review comments
6. Merge when approved and tests pass

## GitHub Issues and Project Management

We use GitHub Issues for tracking bugs, features, and tasks:

### Issue Templates

- **Bug Report**: For reporting issues with existing functionality
- **Feature Request**: For requesting new features
- **Task**: For internal development tasks

### Issue Labels

- `bug`: Something isn't working as expected
- `enhancement`: New feature or request
- `documentation`: Documentation improvements
- `good first issue`: Good for newcomers
- `help wanted`: Extra attention is needed
- `priority: high/medium/low`: Priority level

### Project Board

We use GitHub Projects to organize our work:

- **To Do**: Issues that are ready to be worked on
- **In Progress**: Currently being worked on
- **Review**: Ready for code review
- **Done**: Completed issues

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add some amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 