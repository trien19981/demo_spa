<script setup lang="ts">


defineOptions({ name: 'IndexPage' })
const goToSample = () => {
  if (typeof window !== 'undefined') {
    window.location.href = '/sample/spa#A'
  }
}
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
    <div class="text-center">
      <h1 class="text-6xl font-bold text-gray-800 mb-6">Chào mừng!</h1>
      <p class="text-xl text-gray-600 mb-8">Đây là trang chủ của dự án Nuxt 3</p>
      <button
        class="inline-flex items-center rounded-md bg-blue-600 text-white px-6 py-3 text-lg hover:bg-blue-700 transition-colors"
        @click="goToSample"
      >
        Chuyển tới trang Sample
      </button>
    </div>
  </div>
</template>


