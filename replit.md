# HANGER Clothing Store

A responsive, frontend-only HANGER menswear storefront with a persistent cart and WhatsApp ordering for customers in Bangladesh.

## Run & Operate

- Run the managed `artifacts/hanger-storefront: web` workflow to preview the store.
- `pnpm --filter @workspace/hanger-storefront run typecheck` — check the storefront TypeScript.
- The storefront has no required environment secrets, backend, or database.

## Stack

- pnpm workspace, React, Vite, TypeScript, and Tailwind CSS
- Client-side cart persistence with `localStorage`
- WhatsApp `wa.me` links for quick-buy and checkout order messages

## Where things live

- `artifacts/hanger-storefront/src/config.js` — brand, contact, address, and delivery settings
- `artifacts/hanger-storefront/src/data/products.js` — the four product records
- `artifacts/hanger-storefront/src/components/` — reusable checkout field
- `artifacts/hanger-storefront/src/App.tsx` — storefront, cart, filters, and checkout behavior
- `artifacts/hanger-storefront/src/index.css` — storefront styling
- `artifacts/hanger-storefront/public/` — supplied HANGER logo and product photos

## Architecture decisions

- Cart lines are keyed by both product and size so different sizes remain separate items.
- Checkout sends order details to HANGER through WhatsApp; it does not process payments or persist orders on a server.
- Brand, delivery, catalog, and cart behavior stay in the browser.

## Product

Customers can browse and filter HANGER shirts and polos, choose a size, build a cart, select a delivery area, and prepare a validated WhatsApp order.

## User preferences

- Keep the scope to the storefront features listed in the supplied brief. The user explicitly excluded a backend, database, login, and payment gateway, and requested no extra features.

## Gotchas

- Checkout requires a size on each product before add-to-cart or quick-buy.
- WhatsApp is the order handoff; COD is only a selected payment preference and is not processed by this app.

## Pointers

- See the `pnpm-workspace` skill for workspace structure and TypeScript setup.
