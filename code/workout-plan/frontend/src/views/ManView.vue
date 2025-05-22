<template>
  <div class="container text-center mt-5">
    <h1>Man's Workout Plan 💪</h1>
    <p>This section is for men who want to improve their fitness.</p>

    <div class="home-container test">
      <div class="week-selector-header">
        <button class="add-week-button" type="button" @click="addWeek">+ Add Week</button>
        <button class="delete-week-button" @click="showDeletePopup = true" type="button">- Delete Week</button>
      </div>

      <div class="week-grid">
        <router-link
            class="week-button"
            v-for="week in weeks"
            :key="week.id"
            :to="`/man/week/${week.id}`"
        >
          {{ week.custom_name || week.name }}
        </router-link>
      </div>


      <div v-if="showDeletePopup" class="popup-overlay">
        <div class="popup">
          <h2>Select Week to Delete</h2>

          <select v-model="selectedWeekToDelete" class="select-box">
            <option v-for="(week) in weeks" :key="week.id" :value="week.id">
              {{ week.name }}
            </option>
          </select>

          <div class="popup-buttons">
            <button @click="showDeletePopup = false" class="cancel-button">Back</button>
            <button @click="deleteWeek" class="confirm-button">Delete</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import apiClient from '../api/axios'

interface WeekSelection {
  name: string;
  id: number;
  custom_name?: string;
}

const weeks = ref<WeekSelection[]>([])
const showDeletePopup = ref(false)
const selectedWeekToDelete = ref<number | null>(null)

// Fetch weeks from backend
const fetchWeeks = async () => {
  try {
    const response = await apiClient.get('/weeks', {
      params: {
        gender: 'man'
      }
    })
    
    // Clear existing weeks
    weeks.value = []
    
    // Add weeks from the server and sort them by week number
    response.data.forEach((weekFromDb) => {
      const week: WeekSelection = {
        name: weekFromDb.name,
        id: weekFromDb.id,
        custom_name: weekFromDb.custom_name
      }
      weeks.value.push(week)
    })
    
    // Sort weeks by their number
    weeks.value.sort((a, b) => {
      const numA = parseInt(a.name.replace('Week ', ''))
      const numB = parseInt(b.name.replace('Week ', ''))
      return numA - numB
    })
  } catch (error) {
    console.error('Error fetching weeks:', error)
  }
}

// Add week
const addWeek = async () => {
  try {
    // Find the highest week number currently in the list
    const weekNumbers = weeks.value
      .map(w => {
        const match = w.name.match(/Week (\d+)/)
        return match ? parseInt(match[1]) : 0
      })
    
    const maxWeekNumber = weekNumbers.length > 0 ? Math.max(...weekNumbers) : 0
    const newWeekNumber = maxWeekNumber + 1
    const newName = `Week ${newWeekNumber}`

    const response = await apiClient.post('/weeks', {
      gender: 'man',
      name: newName,
      customName: null
    })

    const weekFromDb = response.data
    const week: WeekSelection = {
      name: weekFromDb.name,
      id: weekFromDb.id,
      custom_name: weekFromDb.custom_name
    }

    weeks.value.push(week)
    weeks.value.sort((a, b) => {
      const numA = parseInt(a.name.replace('Week ', ''))
      const numB = parseInt(b.name.replace('Week ', ''))
      return numA - numB
    })
  } catch (error) {
    console.error('Error adding week:', error)
  }
}

// Delete week
const deleteWeek = async () => {
  try {
    const idToDelete = selectedWeekToDelete.value
    if (!idToDelete) return

    const idx = weeks.value.findIndex(w => w.id === idToDelete)
    if (idx === -1) {
      console.error('Week-ID nicht gefunden:', idToDelete)
      return
    }

    const response = await apiClient.delete(`/weeks/${idToDelete}`)

    if (response.status === 204) {
      weeks.value.splice(idx, 1)
    }

    selectedWeekToDelete.value = null
    showDeletePopup.value = false

  } catch (err) {
    console.error(' deleteWeek ERROR:', err)
  }
}


// Load weeks on mount
onMounted(() => {
  console.log("OnMounted")
  fetchWeeks()
})
</script>


<style scoped>
.home-container {
  background: #000;
  color: #1dd267;
  height: auto;
  padding: 3rem 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 2rem;
}

.week-selector-header {
  width: 100%;
  display: flex;
  justify-content: flex-end;
  padding-right: 2rem;
}

.add-week-button {
  background: #1dd267;
  color: #000;
  font-weight: bold;
  border: none;
  border-radius: 10px;
  padding: 0.5rem 1rem;
  cursor: pointer;
  transition: background 0.3s, color 0.3s;
  outline: none;
  user-select: none;
}

.add-week-button:hover {
  background: #0f0;
  color: #000;
}

.week-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  border: 3px solid #1dd267;
  border-radius: 15px;
  padding: 2rem;
  background-color: #111;
  width: 100%;
  max-width: 600px;
}

.week-button {
  background: transparent;
  border: 2px solid #1dd267;
  color: #1dd267;
  font-size: 1.2rem;
  padding: 0.75rem 1.5rem;
  border-radius: 10px;
  cursor: pointer;
  transition: background 0.3s, color 0.3s;
  width: 100%;
  text-align: center;
  text-decoration: none;
}


.week-button:hover {
  background: #1dd267;
  color: #000;
}

.delete-week-button {
  background: #ff4d4d;
  color: white;
  border: none;
  border-radius: 10px;
  padding: 0.5rem 1rem;
  margin-left: 1rem;
  cursor: pointer;
  transition: background 0.3s;
}

.delete-week-button:hover {
  background: #e60000;
}

.popup-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.popup {
  background: #222;
  padding: 2rem;
  border-radius: 15px;
  color: #1dd267;
  text-align: center;
  width: 80%;
  max-width: 400px;
}

.select-box {
  width: 100%;
  padding: 0.5rem;
  font-size: 1rem;
  margin-top: 1rem;
  border-radius: 10px;
  border: 2px solid #1dd267;
  background: #000;
  color: #1dd267;
}

.popup-buttons {
  display: flex;
  justify-content: space-between;
  margin-top: 1.5rem;
}

.confirm-button,
.cancel-button,
.back-button {
  background: transparent;
  color: #1dd267;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  margin-top: 1rem;
  transition: color 0.2s;
}

.confirm-button:hover {
  background: #17b757;
}

.cancel-button:hover,
.back-button:hover {
  color: #21f375;
}

@media (max-width: 500px) {
  .week-button {
    font-size: 1rem;
    padding: 0.5rem 1rem;
  }

  .add-week-button {
    font-size: 0.9rem;
    padding: 0.4rem 0.8rem;
  }
}
</style>
