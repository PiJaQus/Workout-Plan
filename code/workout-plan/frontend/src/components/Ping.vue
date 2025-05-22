<template>
  <div>
    <h2>Ping z backendu:</h2>
    <p>{{ message }}</p>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import apiClient from '../api/axios'

const message = ref('Ładowanie...')

onMounted(async () => {
  try {
    const response = await apiClient.get('/ping')
    message.value = response.data.message
  } catch (error) {
    message.value = 'err 😢'
    console.error(error)
  }
})
</script>
