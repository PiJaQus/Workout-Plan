<template>
  <div class="home">
    <div class="container">
      <div class="home-content">
        <div class="logo">
          <i class="fas fa-dumbbell"></i>
        </div>
        <h1 class="home-title">
          Workout <span class="highlight">Plan</span>
        </h1>
        <p class="home-subtitle">Select your profile to begin</p>

        <div class="profile-selector">
          <div
            class="profile-option"
            :class="{ 'active': selectedOption === 'Man' }"
            @click="selectOption('Man')"
          >
            <div class="profile-icon man">
              <i class="fas fa-male"></i>
            </div>
            <span>For Him</span>
          </div>

          <div
            class="profile-option"
            :class="{ 'active': selectedOption === 'Woman' }"
            @click="selectOption('Woman')"
          >
            <div class="profile-icon woman">
              <i class="fas fa-female"></i>
            </div>
            <span>For Her</span>
          </div>
        </div>

        <button
          class="start-button"
          @click="goToSelected"
          :disabled="!selectedOption"
        >
          <span>Get Started</span>
          <i class="fas fa-arrow-right"></i>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { library } from '@fortawesome/fontawesome-svg-core'
import { faMale, faFemale, faArrowRight, faDumbbell } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

// Add icons to the library
library.add(faMale, faFemale, faArrowRight, faDumbbell)

const router = useRouter()
const selectedOption = ref<string | null>(null)

function selectOption(option: string) {
  selectedOption.value = option
}

function goToSelected() {
  if (selectedOption.value) {
    router.push('/' + selectedOption.value.toLowerCase())
  }
}

// Keyboard navigation for accessibility
function handleKeyDown(event: KeyboardEvent) {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault()
    goToSelected()
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeyDown)
  return () => {
    window.removeEventListener('keydown', handleKeyDown)
  }
})
</script>

<style scoped>
:root {
  --color-bg: #121212;
  --color-surface: #1e1e1e;
  --color-surface-light: #2d2d2d;
  --color-text: #ffffff;
  --color-text-secondary: #b3b3b3;
  --color-primary: #00ff88;
  --color-primary-dark: #00cc6a;
  --color-primary-light: rgba(0, 255, 136, 0.1);
  --shadow: 0 4px 6px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.08);
  --shadow-md: 0 10px 15px -3px rgba(0, 0, 0, 0.2), 0 4px 6px -2px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.1);
  --rounded: 12px;
  --rounded-full: 9999px;
}

.home {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 2rem 1.5rem;
  background-color: var(--color-bg);
  color: var(--color-text);
  position: relative;
  overflow: hidden;
}



@keyframes pulse {
  0% { transform: scale(1); opacity: 0.5; }
  100% { transform: scale(1.1); opacity: 0.8; }
}

.container {
  width: 100%;
  max-width: 500px;
  margin: 0 auto;
  position: relative;
  z-index: 1;
}

.home-content {
  text-align: center;
  width: 100%;
  position: relative;
  z-index: 2;
}

.logo {
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, var(--color-primary), #00b3ff);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1.5rem;
  font-size: 2rem;
  color: #000;
  box-shadow: 0 4px 15px rgba(0, 255, 136, 0.3);
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-5px); }
}

.home-title {
  font-size: 3rem;
  font-weight: 800;
  margin-bottom: 0.5rem;
  color: var(--color-text);
  line-height: 1.2;
  letter-spacing: -1px;
  text-transform: uppercase;
}

.highlight {
  color: var(--color-primary);
  position: relative;
  display: inline-block;
}

.home-subtitle {
  font-size: 1.25rem;
  color: var(--color-text-secondary);
  margin-bottom: 3rem;
  line-height: 1.5;
  font-weight: 400;
}

.profile-selector {
  display: flex;
  gap: 1.5rem;
  margin: 3rem 0;
  justify-content: center;
}

.profile-option {
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  width: 140px;
  opacity: 0.7;
}

.profile-option.active {
  opacity: 1;
  transform: translateY(-5px);
}

.profile-option.active .profile-icon {
  transform: scale(1.05);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
}

.profile-option.active.man .profile-icon {
  background: linear-gradient(135deg, #00b3ff, #0066ff);
  border-color: #00b3ff;
}

.profile-option.active.woman .profile-icon {
  background: linear-gradient(135deg, #ff6b9c, #ff2e63);
  border-color: #ff6b9c;
}

.profile-icon {
  width: 100%;
  height: 140px;
  border-radius: var(--rounded);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1rem;
  font-size: 3.5rem;
  color: white;
  background: var(--color-surface);
  border: 2px solid #333;
  transition: all 0.3s ease;
}

.profile-option.man .profile-icon {
  border-color: #00b3ff33;
}

.profile-option.woman .profile-icon {
  border-color: #ff6b9c33;
}

.profile-option span {
  display: block;
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--color-text);
  transition: all 0.3s ease;
}

.start-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 1rem 2.5rem;
  font-size: 1.125rem;
  font-weight: 600;
  color: #000;
  background: var(--color-primary);
  border: none;
  border-radius: 50px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(0, 255, 136, 0.3);
  margin-top: 2rem;
  position: relative;
  overflow: hidden;
  width: 100%;
  max-width: 300px;
}

.start-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none !important;
  box-shadow: none !important;
}

.start-button:not(:disabled):hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 255, 136, 0.4);
  background: var(--color-primary);
}

.start-button:active {
  transform: translateY(0);
}

.start-button i {
  transition: transform 0.3s ease;
}

.start-button:not(:disabled):hover i {
  transform: translateX(4px);
}

/* Responsive adjustments */
@media (max-width: 640px) {
  .home-title {
    font-size: 2.5rem;
  }

  .home-subtitle {
    font-size: 1.1rem;
    margin-bottom: 2.5rem;
  }

  .profile-selector {
    flex-direction: column;
    align-items: center;
    margin: 2rem 0;
  }

  .profile-option {
    width: 100%;
    max-width: 200px;
  }

  .profile-icon {
    height: 120px;
  }

  .start-button {
    padding: 0.875rem 2rem;
    font-size: 1rem;
    width: 100%;
    max-width: 100%;
  }
}
</style>