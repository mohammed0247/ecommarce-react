# FreshCart

A responsive e-commerce storefront built with Next.js App Router, TypeScript, and Tailwind CSS. Product, category, brand, authentication, cart, wishlist, order, and checkout requests use the documented Route e-commerce API.

## Run locally

```powershell
npm install
Copy-Item .env.example .env.local
npm run dev
```

Set `NEXT_PUBLIC_API_URL` in `.env.local` to the API's `/api/v1` base URL. The app defaults to `https://ecommerce.routemisr.com/api/v1`. Cart and cash-order services use the documented `/api/v2` endpoints derived from that base URL.

## Available scripts

- `npm run dev` — start the development server.
- `npm run lint` — run ESLint.
- `npm run build` — type-check and create the production build.

Online checkout creates a real provider checkout session and redirects to the returned URL. The return page does not claim payment success; check the order service for the confirmed order status.
# ecommerce
