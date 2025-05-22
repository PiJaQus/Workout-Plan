<template>
  <div class="app-container">
    <!-- NAVIGATION tylko poza "/" -->
    <nav v-if="route.path !== '/'" class="custom-navbar">
      <router-link class="nav-link" to="/">Home</router-link>
      <router-link class="nav-link" to="/man">Man</router-link>
      <router-link class="nav-link" to="/woman">Woman</router-link>
    </nav>

    <router-view />
  </div>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'

const route = useRoute()
</script>

<style scoped>
.app-container {
  background-color: #000;
  color: #2ecc71;
  min-height: 100vh;
  padding-top: 80px;
  font-family: Arial, sans-serif;
}

.custom-navbar {
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  background-color: #111;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(46, 204, 113, 0.3);
  padding: 0.6rem 1.5rem;
  display: flex;
  gap: 20px;
  z-index: 1000;
}

.nav-link {
  color: #2ecc71;
  font-weight: bold;
  text-decoration: none;
  font-size: 1rem;
}

.nav-link:hover {
  color: #27ae60;
  text-decoration: underline;
}
</style>
