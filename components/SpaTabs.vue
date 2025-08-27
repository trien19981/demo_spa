<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref } from 'vue'

type TabKey = 'A' | 'B' | 'C'

defineOptions({ name: 'SpaTabs' })

const DEFAULT_TAB: TabKey = 'A'
const activeTab = ref<TabKey>(DEFAULT_TAB)

const normalizeHash = (hash: string | undefined | null): TabKey => {
  const key = (hash || '').replace('#', '').toUpperCase()
  if (key === 'A' || key === 'B' || key === 'C') return key
  return DEFAULT_TAB
}

const applyHashToState = () => {
  if (typeof window === 'undefined') return
  activeTab.value = normalizeHash(window.location.hash)
}

const setTab = (key: TabKey) => {
  if (typeof window === 'undefined') return
  activeTab.value = key
  window.location.hash = `#${key}`
}

const onHashChange = () => applyHashToState()

onMounted(() => {
  applyHashToState()
  if (typeof window !== 'undefined' && !window.location.hash) {
    setTab(DEFAULT_TAB)
  }
  window.addEventListener('hashchange', onHashChange)
})

onBeforeUnmount(() => {
  window.removeEventListener('hashchange', onHashChange)
})
</script>

<template>
  <div class="min-h-screen bg-white">
    <div class="max-w-6xl mx-auto px-4 py-6">
      <h1 class="text-4xl font-extrabold mb-8">Sample SPA Design</h1>

      <div class="border border-gray-300 rounded-md overflow-hidden">
        <div class="flex">
          <!-- Left nav (vertical tabs) -->
          <nav class="w-48 border-r border-gray-300">
            <button
              class="block w-full text-left p-4 border-b border-gray-300 hover:bg-gray-50"
              :class="{ 'bg-gray-100 font-semibold': activeTab === 'A' }"
              @click="setTab('A')"
            >
              TAB A
            </button>
            <button
              class="block w-full text-left p-4 border-b border-gray-300 hover:bg-gray-50"
              :class="{ 'bg-gray-100 font-semibold': activeTab === 'B' }"
              @click="setTab('B')"
            >
              TAB B
            </button>
            <button
              class="block w-full text-left p-4 hover:bg-gray-50"
              :class="{ 'bg-gray-100 font-semibold': activeTab === 'C' }"
              @click="setTab('C')"
            >
              TAB C
            </button>
          </nav>

          <!-- Main content -->
          <section class="flex-1 p-6">
            <div class="border border-gray-400 rounded-md h-[420px] flex items-center justify-center">
              <p v-if="activeTab === 'A'" class="text-2xl">Recommend A by PS</p>
              <p v-else-if="activeTab === 'B'" class="text-2xl">Recommend B by PS</p>
              <p v-else class="text-2xl text-gray-500">Select a recommendation</p>
            </div>
          </section>
        </div>
      </div>

      <!-- URL hint -->
      <div class="text-sm text-gray-500 mt-3">
        <span>URL: BASE_URL/sample/spa#{{ activeTab }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
</style>


