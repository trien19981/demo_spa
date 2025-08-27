## Salesforce Interactions (Personalization) – Nuxt 3 Integration Flow

This guide explains how to integrate Salesforce Interactions (formerly Interaction Studio/Evergage) into a Nuxt 3 project and how to operate it in a Single Page Application (SPA) flow like the `sample/spa` page in this repo.

### 1) Prerequisites
- Salesforce Personalization account with permissions to create Campaigns, Templates, and a Beacon.
- Your Beacon script (or a way to load the SDK that exposes `window.SalesforceInteractions`).
- A Nuxt 3 project (new or existing).

### 2) Create a Nuxt 3 project (if starting from scratch)
```bash
npm create nuxt@latest my-app
cd my-app
npm install
npm run dev
```

### 3) Base configuration in Nuxt
- Beacon/SDK must load on the client only. With SPA, you need to call `reinit()` after in-app navigations so PS rescans the DOM.
- Add the beacon via a client-only plugin or via `useHead` in `app/app.vue`.

Example (using `useHead`):
```ts
// app/app.vue (script setup)
useHead({
  script: [
    { src: 'https://<your-beacon-domain>/path/to/beacon.js', defer: true }
  ]
})
```

Or create a client plugin (e.g. `app/plugins/salesforce-interactions.client.ts`) and load the script there.

### 4) Define zones for PS rendering
Create containers with `data-zone` attributes where PS should render recommendations/campaign content:
```html
<div data-zone="ps-recommend-a" />
<div data-zone="ps-recommend-b" />
<div data-zone="ps-recommend-c" />
```

In this repo, zones are placed inside the bordered recommendation box in `app/components/SpaTabs.vue` so products appear inside the frame.

### 5) SPA navigation and `reinit()`
With SPA, the page doesn’t reload on navigation. After each relevant internal navigation, call `window.SalesforceInteractions.reinit()` to let PS rescan the DOM.

Snippet from `SpaTabs.vue`:
```ts
const reinitSalesforceInteractions = () => {
  if (typeof window === 'undefined') return
  // @ts-expect-error injected by the beacon/PS
  const SI = window.SalesforceInteractions
  if (SI && typeof SI.reinit === 'function') {
    try { SI.reinit() } catch {}
  }
}

const setTab = (key) => {
  activeTab.value = key
  window.location.hash = `#${key}`
  reinitSalesforceInteractions()
}
```

Also reinit on `hashchange` or route change:
```ts
window.addEventListener('hashchange', () => {
  reinitSalesforceInteractions()
})
```

### 6) Map zones to Campaigns/Templates in Salesforce
1. Create a Campaign in Personalization.
2. Create a Template/Content and configure it to render into the desired selectors (e.g., `[data-zone="ps-recommend-a"]`).
3. Set targeting, audience rules, and experiments as needed.
4. Publish the campaign.

When the page loads and `reinit()` runs, PS scans the DOM and renders content into the configured zones.

### 7) Testing and verification
- Ensure `window.SalesforceInteractions` is available in the console.
- Check the Network tab to confirm the beacon/SDK loads successfully.
- Switch between tabs/routes and confirm the recommendations render inside the box.

### 8) Notes on SSR, security, and performance
- Load the beacon/SDK on the client only (avoid SSR).
- Use `defer`/`async` to avoid blocking rendering.
- Wrap the recommendation area with `overflow: auto` to prevent layout jumps with many items.

### 9) Error handling and fallbacks
- Guard `SI.reinit()` with a `try/catch` so the UI isn’t broken if the SDK has a transient error.
- Provide default placeholders before PS content loads.

### 10) Quick checklist (from a brand-new project)
1. Create a Nuxt 3 app and run dev.
2. Load the beacon/SDK via `useHead` or a client plugin.
3. Add `data-zone` containers where content should render.
4. Call `reinit()` after SPA navigations/tab changes.
5. Create and publish Campaigns/Templates mapped to those zones.
6. Test and verify content renders in the expected place.

See `app/components/SpaTabs.vue` for a working example.


