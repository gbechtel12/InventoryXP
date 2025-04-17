# InventoryXP Frontend

A Vue.js frontend for the InventoryXP inventory management system.

## Project Structure

```
frontend/
├── public/               # Static assets served as-is
├── src/
│   ├── assets/           # Images, fonts, etc.
│   ├── components/       # Reusable UI components
│   ├── layouts/          # Global layouts
│   ├── views/            # Page views
│   ├── router/           # Vue Router configuration
│   ├── services/         # API services
│   ├── stores/           # Pinia stores
│   ├── App.vue           # Root component
│   └── main.js           # Entry point
├── tailwind.config.js    # Tailwind CSS configuration
├── postcss.config.js     # PostCSS configuration
├── package.json          # Project dependencies and scripts
└── vite.config.js        # Vite configuration
```

## Setup

1. Install dependencies:
```sh
npm install
```

2. Start the development server:
```sh
npm run dev
```

3. Build for production:
```sh
npm run build
```

## Technologies Used

- [Vue 3](https://vuejs.org/) - Progressive JavaScript framework
- [Vue Router](https://router.vuejs.org/) - Official router for Vue.js
- [Pinia](https://pinia.vuejs.org/) - State management
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [Axios](https://axios-http.com/) - HTTP client
- [Vite](https://vitejs.dev/) - Frontend build tool

## Features

- User authentication (login/register)
- Inventory management (CRUD operations)
- Responsive design with Tailwind CSS
- State management with Pinia
- API integration with the InventoryXP backend 