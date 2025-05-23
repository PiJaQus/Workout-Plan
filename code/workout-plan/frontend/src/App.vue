<template>
  <div class="app">
    <!-- Nawigacja - pokazuj tylko poza stroną główną -->
    <nav v-if="route.path !== '/'" class="app-nav">
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

    <main class="app-main">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>
  </div>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router';
import { onMounted } from 'vue';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faDumbbell, faMale, faFemale } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

// Dodaj ikony do biblioteki
library.add(faDumbbell, faMale, faFemale);

const route = useRoute();

// Dodaj klasę do body dla lepszego stylowania
onMounted(() => {
  document.body.classList.add('app-loaded');

  return () => {
    document.body.classList.remove('app-loaded');
  };
});
</script>

<style scoped>
.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: var(--color-background);
  color: var(--color-text);
}

.app-nav {
  background-color: var(--color-surface);
  box-shadow: var(--shadow);
  position: sticky;
  top: 0;
  z-index: 1000;
  border-bottom: 1px solid var(--color-border);
}

.app-nav .container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 4rem;
  padding: 0 var(--spacing-4);
}

.nav-logo {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--color-primary);
  text-decoration: none;
  transition: color var(--transition);
}

.nav-logo:hover {
  color: var(--color-primary-dark);
}

.nav-logo i {
  font-size: 1.5rem;
}

.nav-links {
  display: flex;
  gap: 1rem;
  height: 100%;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0 1rem;
  color: var(--color-text-secondary);
  text-decoration: none;
  font-weight: 500;
  height: 100%;
  position: relative;
  transition: all var(--transition);
  border-bottom: 3px solid transparent;
}

.nav-link:hover {
  color: var(--color-text);
  background-color: var(--color-surface-light);
}

.nav-link.active {
  color: var(--color-primary);
  border-bottom-color: var(--color-primary);
}

.nav-link i {
  font-size: 1.1rem;
}

.app-main {
  flex: 1;
  padding: var(--spacing-6) 0;
}

/* Responsywność nawigacji */
@media (max-width: 768px) {
  .app-nav .container {
    height: auto;
    flex-direction: column;
    padding: 1rem;
    gap: 1rem;
  }

  .nav-links {
    width: 100%;
    justify-content: center;
  }

  .nav-link {
    padding: 0.5rem 0.75rem;
    border-radius: var(--rounded);
    border-bottom: none !important;
  }

  .nav-link.active {
    background-color: var(--color-primary);
    color: #000;
  }

  .app-main {
    padding: var(--spacing-4) 0;
  }
}

/* Animacje */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
