<template>
  <nav class="app-nav">
    <div class="container">
      <router-link to="/" class="nav-logo">
        <i class="fas fa-dumbbell"></i>
        <span>Workout Plan</span>
      </router-link>
      <div class="nav-links">
        <router-link to="/man" class="nav-link" :class="{ 'active': route.path.startsWith('/man') }">
          <i class="fas fa-male"></i>
          <span>For Him</span>
        </router-link>
        <router-link to="/woman" class="nav-link" :class="{ 'active': route.path.startsWith('/woman') }">
          <i class="fas fa-female"></i>
          <span>For Her</span>
        </router-link>
      </div>
    </div>
  </nav>
</template>
<script setup lang="ts">
import { useRoute } from 'vue-router';

const route = useRoute();
</script>