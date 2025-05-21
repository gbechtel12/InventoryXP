# InventoryXP Frontend

A Vue.js frontend for the InventoryXP inventory management system, designed for resellers who list products on eBay, Poshmark, Etsy, and other platforms.

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

2. Set up Firebase Authentication:
   - Create a Firebase project at [https://firebase.google.com/](https://firebase.google.com/)
   - Enable Email/Password authentication in the Firebase console
   - Create a web app in your Firebase project
   - Copy the Firebase configuration
   - Create a `.env.local` file based on `.env.example` and fill in your Firebase credentials

3. Start the development server:
```sh
npm run dev
```

4. Build for production:
```sh
npm run build
```

## Deployment

The application is configured for easy deployment to static hosting platforms like Vercel, Netlify, or GitHub Pages.

### Vercel Deployment

1. Create an account on Vercel if you don't have one
2. Install the Vercel CLI: `npm i -g vercel`
3. Run `vercel` in the project root and follow the prompts
4. Set up environment variables in the Vercel dashboard

### Netlify Deployment

1. Create an account on Netlify if you don't have one
2. Create a `netlify.toml` file in the project root:
```toml
[build]
  publish = "dist"
  command = "npm run build"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```
3. Deploy through the Netlify UI or CLI
4. Set up environment variables in the Netlify dashboard

## Firebase Authentication Setup

This application uses Firebase for authentication. To set up:

1. Create a project in the [Firebase Console](https://console.firebase.google.com/)
2. Enable Email/Password sign-in method in Authentication → Sign-in method
3. Register a web app in your Firebase project
4. Copy your Firebase configuration (apiKey, authDomain, etc.)
5. Add these values to your environment variables (`.env.local`)

## Technologies Used

- [Vue 3](https://vuejs.org/) - Progressive JavaScript framework
- [Vue Router](https://router.vuejs.org/) - Official router for Vue.js
- [Pinia](https://pinia.vuejs.org/) - State management
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [Firebase](https://firebase.google.com/) - Authentication
- [Axios](https://axios-http.com/) - HTTP client
- [Vite](https://vitejs.dev/) - Frontend build tool

## Features

- User authentication with Firebase (login/register)
- Inventory management (CRUD operations)
- Multiple marketplace integration
- Responsive design with Tailwind CSS
- State management with Pinia
- API integration with the InventoryXP backend 