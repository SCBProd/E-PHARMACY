# E-Pharmacy

Responsive E-Pharmacy storefront built from the supplied Figma design and project requirements.

## Technologies

- Client: React, TypeScript, Vite, React Router, Formik, Yup, and Recharts.
- API: Node.js, Express, and MongoDB with Mongoose.
- Design: [Figma](https://www.figma.com/design/pwRXd2xSEHFLUWNbWYxTVT/E-PHARMACY--clients---Copy-).
- Requirements: the supplied E-Pharmacy client technical specification and the project criteria for responsive UI, validated forms, statistics, and deployment.

## Start locally

Requirements: Node.js 20 or newer. MongoDB is optional for browsing the seeded storefront; it is required for account registration, saved carts, and checkout.

1. Install dependencies from the repository root, then in `client` and `server`:

   ```powershell
   npm install
   cd client; npm install
   cd ../server; npm install
   ```

2. Copy `server/.env.example` to `server/.env`. Set `MONGODB_URI` to a running MongoDB database and replace `JWT_SECRET` with a long random value.
3. Start the client and API from the repository root:

   ```powershell
   npm run dev
   ```

   The client runs at `http://localhost:5173`; the API runs at `http://localhost:4000`.

The API inserts the storefront seed data into empty collections when it connects. To seed the supplied administrative records as well, run `npm run seed` once. The seed command only fills empty collections; it does not overwrite existing records. The customer and order examples in `server/data` are anonymized. If you have the original local datasets, put them in `server/private-data/customers.json` and `server/private-data/orders.json`; that directory is ignored by Git, and the seed command uses those files on your computer without including them in a repository.

## Deploy to Vercel

The root `vercel.json` configures two Vercel Services: the Vite client and the Express API. Select **Services** as the Vercel project's framework. The client receives `/`; requests under `/api/` are routed to the server, which keeps its existing `/api/...` routes. The client uses same-origin `/api` requests, so a service binding is not needed. Set `MONGODB_URI` to a hosted MongoDB connection string (for example, MongoDB Atlas) and a strong `JWT_SECRET` in the Vercel project's environment variables before deploying. MongoDB Compass is a desktop client; a local `mongodb://127.0.0.1:27017/...` address works only on your computer and cannot be reached by Vercel. After configuring the variables, redeploy and check `/api/health` for `database: "connected"`.

## Project layout

- `client/src/App.tsx` — typed routes, pages, validated forms, cart, and API integration.
- `client/src/main.tsx` — TypeScript client entry point.
- `client/src/types.ts` — shared TypeScript domain and context types.
- `client/tsconfig.json` — client TypeScript configuration.
- `client/src/styles.css` — responsive Figma-based styling.
- `client/public/assets/figma` — locally saved Figma-exported assets.
- `client/src/data` — client fallback data for products, stores, and reviews.
- `server/src` — Express API, Mongoose models, and seed loader.
- `server/data` — public example JSON datasets, including anonymized orders and customers.
- `server/private-data` — optional local-only original customer and order datasets; excluded from Git.
- `docs/design-spec.md` — screen-by-screen visual specification from the supplied Figma frames.
