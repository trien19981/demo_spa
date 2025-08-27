// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  app: {
    head: {
      script: [
        {
          id: 'sf-interactions-beacon',
          src: process.env.SI_BEACON_SRC || '//cdn.evgnet.com/beacon/adlay/spa/scripts/evergage.min.js',
          type: 'text/javascript',
          defer: true
        }
      ]
    }
  },

  runtimeConfig: {
    secretKey: process.env.NUXT_SECRET_KEY,
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE || '/api',
      siDatasetId: process.env.SI_DATASET_ID || '',
      siCookieDomain: process.env.SI_COOKIE_DOMAIN || '',
      siBeaconSrc: process.env.SI_BEACON_SRC || ''
    }
  },

  css: ['assets/css/tailwind.css'],

  modules: [
    '@nuxt/content',
    '@nuxt/eslint',
    '@nuxt/image',
    '@nuxt/scripts',
    '@nuxt/test-utils',
    '@nuxt/ui',
    '@pinia/nuxt'
  ]
})