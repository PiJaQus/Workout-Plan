<template>
  <div>
    <h2>Ping z backendu:</h2>
    <p>{{ message }}</p>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

const message = ref('Ładowanie...')

onMounted(async () => {
  try {
    const response = await axios.get('http://localhost:3000/api/ping')
    message.value = response.data.message
  } catch (error) {
    message.value = 'err 😢'
    console.error(error)
  }
})
</script>
