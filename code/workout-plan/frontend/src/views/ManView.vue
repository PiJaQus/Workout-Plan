<template>
  <div class="man-view">
    <div class="header">
      <h1>Man's Workout Plan</h1>
      <p class="subtitle">Select a week to view or edit your training plan</p>
    </div>

    <div class="content">
      <div class="week-navigation">
        <div class="actions">
          <button class="action-button add-button" @click="openAddWeekDialog">
            <i class="fas fa-plus"></i> Add Week
          </button>
          <button
              class="action-button delete-button"
              @click="showDeletePopup = true"
              :disabled="weeks.length === 0"
          >
            <i class="fas fa-trash"></i> Delete Week
          </button>
        </div>

        <div class="week-grid" ref="weekGrid">
          <router-link
              v-for="week in weeks"
              :key="week.id"
              :to="`/man/week/${week.id}`"
              class="week-card"
              :class="{ 'active': $route.params.id === week.id.toString() }"
          >
            <div class="week-number">
              {{ week.name.replace('Week ', '') }}
            </div>
            <div class="week-name">
              {{ week.custom_name || `Week ${week.name.replace('Week ', '')}` }}
            </div>
            <div class="week-hover">
              <i class="fas fa-arrow-right"></i>
            </div>
          </router-link>
        </div>
      </div>
    </div>

    <!-- Add Week Dialog -->
    <div v-if="showAddModal" class="popup-overlay" @click.self="closeAddWeekDialog">
      <div class="popup">
        <h3>Add New Week</h3>
        <div class="form-group">
          <label for="weekName">Week Name (optional)</label>
          <input
              id="weekName"
              v-model="newWeekName"
              type="text"
              class="form-input"
              placeholder="E.g., Strength Training Week"
              @keyup.enter="confirmAddWeek"
          >
          <p class="hint">Leave empty to use default name: Week {{ nextWeekNumber }}</p>
        </div>
        <div class="popup-actions">
          <button class="btn btn-secondary" @click="closeAddWeekDialog">
            Cancel
          </button>
          <button class="btn btn-primary" @click="confirmAddWeek">
            Add Week
          </button>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Popup -->
    <div v-if="showDeletePopup" class="popup-overlay" @click.self="showDeletePopup = false">
      <div class="popup">
        <h3>Delete Week</h3>
        <p>Select a week to delete:</p>
        <select v-model="selectedWeekToDelete" class="select-box">
          <option v-for="week in weeks" :key="week.id" :value="week.id">
            {{ week.custom_name || week.name }}
          </option>
        </select>
        <div class="popup-actions">
          <button class="btn btn-secondary" @click="showDeletePopup = false">
            Cancel
          </button>
          <button
              class="btn btn-danger"
              @click="deleteWeek"
              :disabled="!selectedWeekToDelete"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import apiClient from '../api/axios'
import { useRoute } from 'vue-router'

interface WeekSelection {
  name: string;
  id: number;
  custom_name?: string;
}

const route = useRoute()
const weeks = ref<WeekSelection[]>([])
const showDeletePopup = ref(false)
const selectedWeekToDelete = ref<number | null>(null)
const showAddModal = ref(false)
const newWeekName = ref('')

// Computed property to get the next week number
const nextWeekNumber = computed(() => {
  const weekNumbers = weeks.value
    .map(w => parseInt(w.name.replace('Week ', '')) || 0)
  return weekNumbers.length > 0 ? Math.max(...weekNumbers) + 1 : 1
})

// Fetch weeks from backend
const fetchWeeks = async () => {
  try {
    const response = await apiClient.get('/weeks', {
      params: { gender: 'man' }
    })

    weeks.value = response.data.map((week: any) => ({
      name: week.name,
      id: week.id,
      custom_name: week.custom_name
    })).sort((a: WeekSelection, b: WeekSelection) => {
      const numA = parseInt(a.name.replace('Week ', ''))
      const numB = parseInt(b.name.replace('Week ', ''))
      return numA - numB
    })
  } catch (error) {
    console.error('Error fetching weeks:', error)
  }
}

// Open add week modal
const openAddWeekDialog = () => {
  newWeekName.value = ''
  showAddModal.value = true
}

// Close add week modal
const closeAddWeekDialog = () => {
  showAddModal.value = false
  newWeekName.value = ''
}

// Confirm adding a new week with optional custom name
const confirmAddWeek = async () => {
  if (!newWeekName.value.trim()) {
    newWeekName.value = ''
  }

  try {
    // Sprawdź, czy tydzień już istnieje
    const weekExists = weeks.value.some(week =>
        week.name === `Week ${nextWeekNumber.value}`
    );

    // Jeśli istnieje, zwiększ numer
    let weekNum = nextWeekNumber.value;
    while (weeks.value.some(week => week.name === `Week ${weekNum}`)) {
      weekNum++;
    }

    const response = await apiClient.post('/weeks', {
      gender: 'man',
      name: `Week ${weekNum}`,
      customName: newWeekName.value.trim() || null
    });

    const week = response.data
    weeks.value.push({
      name: week.name,
      id: week.id,
      custom_name: week.custom_name
    });

    // Sort weeks after adding
    weeks.value.sort((a, b) => {
      const numA = parseInt(a.name.replace('Week ', ''))
      const numB = parseInt(b.name.replace('Week ', ''))
      return numA - numB
    });

    closeAddWeekDialog()
  } catch (error) {
    console.error('Error adding week:', error)
  }
}

// Delete week
const deleteWeek = async () => {
  if (!selectedWeekToDelete.value) return

  try {
    await apiClient.delete(`/weeks/${selectedWeekToDelete.value}`)
    weeks.value = weeks.value.filter(w => w.id !== selectedWeekToDelete.value)
    showDeletePopup.value = false
    selectedWeekToDelete.value = null
  } catch (err) {
    console.error('Error deleting week:', err)
  }
}

// Load weeks on mount
onMounted(fetchWeeks)
</script>

<style scoped>
.man-view {
  padding: 1rem 1rem 2rem;
  max-width: 1200px;
  margin: 0 auto;
  min-height: calc(100vh - 64px);
  display: flex;
  flex-direction: column;
  background: #ffffff;
}

.header {
  text-align: center;
  margin-bottom: 1.5rem;
  position: sticky;
  top: 0;
  background: #ffffff;
  padding: 1.5rem 0;
  z-index: 100;
  border-bottom: 1px solid #e0e0e0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.header h1 {
  font-size: 2.2rem;
  margin-bottom: 0.5rem;
  font-weight: 700;
  color: #111111;
}

.subtitle {
  color: #666666;
  font-size: 1.1rem;
  margin: 0;
  font-weight: 400;
}

.content {
  background: #ffffff;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  flex: 1;
  display: flex;
  flex-direction: column;
  border: 1px solid #e0e0e0;
}

.actions {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  justify-content: flex-start;
}

.action-button {
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.7rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.95rem;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  position: relative;
  overflow: hidden;
}

.action-button i {
  font-size: 0.9rem;
  transition: transform 0.2s ease;
}

.action-button:hover i {
  transform: translateX(2px);
}

.add-button {
  background: #26e07f;
  color: #ffffff;
  border: 1px solid #20c06c;
}

.add-button:hover {
  background: #20c06c;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(38, 224, 127, 0.3);
}

.delete-button {
  background: #ffffff;
  color: #ff6b6b;
  border: 1px solid #ff6b6b;
}

.delete-button:hover {
  background: #fff8f8;
  color: #ff8c8c;
  border-color: #ff8c8c;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(255, 80, 80, 0.2);
}

.delete-button:disabled {
  background: #f5f5f5;
  color: #999;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
  border-color: #ccc;
}

.week-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 0.75rem;
  padding: 0.5rem;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: #26e07f #f0f0f0;
  flex: 1;
  max-height: calc(100vh - 300px);
  min-height: 200px;
}

.week-grid::-webkit-scrollbar {
  width: 8px;
}

.week-grid::-webkit-scrollbar-track {
  background: #f0f0f0;
  border-radius: 4px;
}

.week-grid::-webkit-scrollbar-thumb {
  background-color: #26e07f;
  border-radius: 4px;
}

.week-card {
  background: #ffffff;
  border-radius: 10px;
  padding: 1.25rem 0.5rem;
  text-align: center;
  color: #333333;
  text-decoration: none;
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;
  border: 1px solid #e0e0e0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100px;
  aspect-ratio: 1.5;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.week-card:hover {
  transform: translateY(-3px);
  border-color: #26e07f;
  box-shadow: 0 4px 16px rgba(38, 224, 127, 0.2);
}

.week-card.active {
  border-color: #26e07f;
  background: #f8fff8;
  box-shadow: 0 0 0 2px rgba(38, 224, 127, 0.2);
}

.week-number {
  font-size: 1.75rem;
  font-weight: 800;
  color: #26e07f;
  line-height: 1;
  margin-bottom: 0.25rem;
}

.week-name {
  font-size: 0.85rem;
  color: #666666;
  margin-top: 0.5rem;
  line-height: 1.3;
  max-width: 100%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  padding: 0 0.5rem;
}

.week-hover {
  position: absolute;
  top: 50%;
  right: -30px;
  transform: translateY(-50%);
  width: 26px;
  height: 26px;
  background: #26e07f;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  opacity: 0;
  transition: all 0.2s ease;
  font-size: 0.7rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.week-card:hover .week-hover {
  right: 8px;
  opacity: 1;
}

/* Popup Styles */
.popup-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(5px);
}

.popup {
  background: #ffffff;
  border: 1px solid #e0e0e0;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  padding: 2rem;
  width: 90%;
  max-width: 400px;
  border-radius: 12px;
}

.popup h3 {
  margin-top: 0;
  color: #111111;
  font-size: 1.5rem;
  margin-bottom: 1rem;
}

.popup p {
  color: #666666;
  margin-bottom: 1.5rem;
}

.select-box {
  width: 100%;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  border: 1px solid #cccccc;
  background: #ffffff;
  color: #333333;
  font-size: 1rem;
  margin-bottom: 1.5rem;
  outline: none;
  transition: border-color 0.2s;
}

.select-box:focus {
  border-color: #26e07f;
  box-shadow: 0 0 0 2px rgba(38, 224, 127, 0.2);
}

.popup-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1.5rem;
}

.btn {
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
  font-size: 0.95rem;
}

.btn-secondary {
  background: #f0f0f0;
  color: #333333;
  border: 1px solid #cccccc;
}

.btn-secondary:hover {
  background: #e0e0e0;
}

.btn-danger {
  background: #fff0f0;
  color: #ff6b6b;
  border: 1px solid #ff6b6b;
}

.btn-danger:hover {
  background: #fff5f5;
  color: #ff8c8c;
  border-color: #ff8c8c;
}

.btn-danger:disabled {
  background: #f5f5f5;
  color: #999;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
  border-color: #ccc;
}

.btn-primary {
  background: #26e07f;
  color: #ffffff;
  border: 1px solid #20c06c;
}

.btn-primary:hover {
  background: #20c06c;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(38, 224, 127, 0.3);
}

.popup input[type="text"] {
  width: 100%;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  border: 1px solid #cccccc;
  background: #ffffff;
  color: #333333;
  font-size: 1rem;
  margin-bottom: 1.5rem;
  outline: none;
  transition: border-color 0.2s;
}

.popup input[type="text"]:focus {
  border-color: #26e07f;
  box-shadow: 0 0 0 2px rgba(38, 224, 127, 0.2);
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: #666666;
  font-size: 0.9rem;
}

.hint {
  color: #888;
  font-size: 0.8rem;
  margin-top: 0.5rem;
}

/* Responsive Design */
@media (max-width: 768px) {
  .week-grid {
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    gap: 0.6rem;
    padding: 0.25rem;
  }

  .week-card {
    padding: 0.75rem 0.25rem;
    min-height: 70px;
  }

  .week-number {
    font-size: 1.5rem;
  }

  .week-name {
    font-size: 0.75rem;
  }
}

@media (max-width: 480px) {
  .week-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 0.5rem;
  }

  .week-card {
    min-height: 60px;
  }

  .actions {
    flex-direction: column;
  }

  .action-button {
    width: 100%;
  }
}
</style>
