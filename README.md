# ratio73

A multilingual Korean skincare storefront mockup. The range philosophy is 70% trusted core products and 30% social discoveries, starting with Centellian24 Madeca Cream Time Reverse Season 7, 50 mL.

## Preview

- English, Korean and Simplified Chinese; language and currency are independent.
- AUD and USD sample price books (A$24 / US$16), not live exchange rates or confirmed selling prices.
- Responsive landing page, photo enlargement, prominently linked Madeca Cream product story, source-backed proof points, full expandable INCI ingredients, editable preview bag, planned Club 73 membership, newsletter and price-match form demonstrations.
- Club 73 is proposed as a free Korean skincare community focused on product discovery, recommendations, updates and potential member benefits. Customer suggestions may inform future assortment decisions, but there is no commitment to member voting or purchase decisions. Membership, submissions and benefits are not operational in this preview.
- Only language, currency and sample bag quantity persist in browser local storage.
- No real orders, payments, newsletter subscriptions, price-match submissions or loyalty accounts are created.
- Search indexing is disabled while this is a mockup.

## Run

Node.js 20 or later. No application dependencies or installation required.

```sh
npm run dev
npm run check
npm run build
```

Local preview: http://localhost:4173. Optional local build output: `public/`. Cloudflare serves the same static files directly from `src/`, so dashboard deployments also work when the build command is blank.

## Publish on Cloudflare Workers

In Workers & Pages, create a Worker connected to `samlim-415/ratio73`:

| Setting | Value |
| --- | --- |
| Worker name | `ratio73` |
| Production branch | `main` |
| Root directory | `/` |
| Build command | Leave blank (not required for this static site) |
| Deploy command | `npx wrangler@4 deploy` |
| Assets directory | `./src` (already configured; present in Git) |

Enable the Worker’s `workers.dev` route under Settings → Domains & Routes. Cloudflare assigns the actual URL using the account’s configured subdomain. Do not treat an anticipated hostname as a verified deployment. No app-specific secrets or environment variables are needed for this static preview. Future GitHub pushes can deploy automatically when Workers Builds is connected.

## Before opening for real orders

Confirm selling prices, country-specific inventory/fulfilment, taxes and shipping; connect commerce and payment services; connect newsletter consent and email delivery; confirm how Club 73 community updates, optional suggestions and possible member benefits will work, plus price-match terms; add business/contact, privacy and returns information; review translations; replace preview-only wording and remove `noindex` only when ready. Use approved supplier product assets before commercial launch.

## Files

- `src/index.html`: page structure and English content.
- `src/styles.css`: responsive brand system and layouts.
- `src/app.js`: translations, sample prices and client-only interactions.
- `scripts/build.mjs`: copies only public source assets into `public/`.
- `wrangler.jsonc`: Cloudflare static assets configuration.

## Product sources and claim limits

Checked 10 October 2026:

- Manufacturer brand history (Dongkook founded 1968): https://madeca.com/pages/about-centellian-24
- Dongkook Pharmaceutical, Madeca Cream launch in 2015 and manufacturer-reported 91 million+ **cumulative units across the Madeca Cream range through February 2026** (not specifically Season 7): https://www.dkpharm.co.kr/boards/view.php?btype=news&idx=1082
- Olive Young Global, **4.7/5 across 451 reviews of the listed 50 mL item**, checked 10 Oct 2026: https://global.oliveyoung.com/product/detail?prdtNo=GA240121561
- Official product details, INCI ingredients, usage and retinol/fragrant essential oils: https://centellian24.com/products/centellian24-madeca-cream-time-reverse-season-7-50ml
- Product photograph source: https://www.ulta.com/p/madeca-cream-time-reverse-pimprod2058852?sku=2657775
- Photograph file: https://media.ulta.com/i/ulta/2657775?fmt=auto&h=1400&w=1400

The Madeca Cream figures are company-reported, not independently audited here. Olive Young ratings and review totals may change. **No claim is made that Season 7 itself sold 91 million units or that this listing holds a particular Olive Young ranking.** Before commercial launch, revalidate evidence and formulation against the stock/market actually sold, obtain supplier-approved product images, and assess cosmetic ingredient information and regulatory wording.

The unaltered product photograph is used for this design mockup; no reproduction licence has been established. Product trademarks and photographs belong to their owners. No authorised-dealer status is claimed.
