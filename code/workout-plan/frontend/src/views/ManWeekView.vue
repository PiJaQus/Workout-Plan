<template>
  <div class="workout-page">
    <div class="container">
      <!-- Week Header -->
      <div class="week-header">
        <div class="week-title-container">
          <div class="title-wrapper">
            <h1 v-if="!isEditingWeekName && week" class="week-title" @click="startEditingWeekName">
              {{ week.custom_name || week.name }}
            </h1>

            <div v-else-if="week" class="week-edit-container">
              <div class="week-input-wrapper">
                <input
                  type="text"
                  class="week-name-input"
                  v-model="editedWeekName"
                  ref="weekNameInput"
                />
              </div>
              <div class="week-edit-buttons">
                <button class="btn btn-primary" @click="saveWeekName">
                  <font-awesome-icon icon="save" /> Save
                </button>
                <button class="btn btn-cancel" @click="cancelEdit">
                  <font-awesome-icon icon="times" /> Cancel
                </button>
              </div>
            </div>
          </div>

          <div v-if="!isEditingWeekName" class="back-button">
            <router-link to="/man" class="back-link">
              <font-awesome-icon icon="arrow-left" />
            </router-link>
          </div>
        </div>
      </div>

      <div class="content-wrapper">
        <!-- Przycisk do pokazania formularza -->
        <div v-if="!showAddWorkoutForm" class="card show-form-card">
          <button class="btn btn-primary btn-block" @click="showAddWorkoutForm = true">
            <font-awesome-icon icon="plus-circle" /> Add New Exercise
          </button>
        </div>

        <!-- Formularz dodawania nowego treningu -->
        <div v-if="showAddWorkoutForm" class="card workout-form-card">
          <h2 class="card-title">
            <font-awesome-icon icon="plus-circle" /> Add New Exercise
            <button class="icon-button close-button" @click="cancelAddWorkout">
              <font-awesome-icon icon="times" />
            </button>
          </h2>
          <div class="form-group">
            <label for="exercise-name">Exercise Name</label>
            <input
              id="exercise-name"
              v-model="newWorkout.name"
              type="text"
              class="form-control"
              placeholder="e.g., Bench Press"
            >
          </div>
          <div class="form-row">
            <div class="form-group">
              <label for="sets">Sets</label>
              <input
                id="sets"
                v-model.number="newWorkout.sets"
                type="number"
                min="1"
                class="form-control"
                placeholder="3"
              >
            </div>
            <div class="form-group">
              <label for="reps">Reps</label>
              <input
                id="reps"
                v-model="newWorkout.reps"
                type="text"
                class="form-control"
                placeholder="8-12"
              >
            </div>
          </div>
          <div class="form-group">
            <label for="notes">Notes (optional)</label>
            <textarea
              id="notes"
              v-model="newWorkout.notes"
              class="form-control"
              rows="2"
              placeholder="Any additional notes..."
            ></textarea>
          </div>
          <div class="form-buttons">
            <button class="btn btn-cancel" @click="cancelAddWorkout">
              <font-awesome-icon icon="times" /> Cancel
            </button>
            <button class="btn btn-primary" @click="addWorkout">
              <font-awesome-icon icon="plus-circle" /> Add Exercise
            </button>
          </div>
        </div>

        <!-- Odstęp między sekcjami -->
        <div class="section-spacer"></div>

        <!-- Lista ćwiczeń -->
        <div class="workouts-list">
          <h2 class="section-title">
            <font-awesome-icon icon="dumbbell" /> Your Exercises
          </h2>

          <div v-if="workouts.length === 0" class="empty-state pt-3">
            <font-awesome-icon icon="info-circle" size="2x" />
            <p>No exercises added yet. Add your first exercise to get started!</p>
          </div>

          <div v-else class="workout-items">
            <div v-for="workout in workouts" :key="workout.id" class="workout-card">
              <div class="workout-details">
                <h3 class="workout-name">{{ workout.name }}</h3>
                <div class="workout-meta">
                  <div>
                    <font-awesome-icon icon="layer-group" /> {{ workout.sets }} sets
                  </div>
                  <div>
                    <font-awesome-icon icon="repeat" /> {{ workout.reps }} reps
                  </div>
                </div>
                <p v-if="workout.notes" class="workout-notes">{{ workout.notes }}</p>
              </div>
              <div class="action-buttons">
                <button @click="editWorkout(workout)" class="icon-button edit-btn" aria-label="Edit">
                  <font-awesome-icon icon="edit" />
                </button>
                <button @click="deleteWorkout(workout.id)" class="icon-button delete-btn" aria-label="Delete">
                  <font-awesome-icon icon="trash-alt" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal edycji ćwiczenia -->
    <div v-if="editingWorkout" class="modal-overlay" @click.self="cancelEdit">
      <div class="modal-content">
        <div class="modal-header">
          <h3>
            <font-awesome-icon icon="edit" /> Edit Exercise
          </h3>
          <button class="icon-button close-button" @click="cancelEdit">
            <font-awesome-icon icon="times" />
          </button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label for="edit-exercise-name">Exercise Name</label>
            <input
              id="edit-exercise-name"
              v-model="editingWorkout.name"
              type="text"
              class="form-control"
            >
          </div>
          <div class="form-row">
            <div class="form-group">
              <label for="edit-sets">Sets</label>
              <input
                id="edit-sets"
                v-model.number="editingWorkout.sets"
                type="number"
                min="1"
                class="form-control"
              >
            </div>
            <div class="form-group">
              <label for="edit-reps">Reps</label>
              <input
                id="edit-reps"
                v-model="editingWorkout.reps"
                type="text"
                class="form-control"
              >
            </div>
          </div>
          <div class="form-group">
            <label for="edit-notes">Notes (optional)</label>
            <textarea
              id="edit-notes"
              v-model="editingWorkout.notes"
              class="form-control"
              rows="3"
            ></textarea>
          </div>
        </div>
        <div class="modal-footer">
          <button @click="saveWorkout" class="btn btn-primary">
            <font-awesome-icon icon="save" /> Save Changes
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { library } from '@fortawesome/fontawesome-svg-core'
import {
  faEdit,
  faTrashAlt,
  faPlus,
  faPlusCircle,
  faDumbbell,
  faInfoCircle,
  faSave,
  faTimes,
  faSpinner
} from '@fortawesome/free-solid-svg-icons'
import apiClient from '../api/axios'

// Dodaj ikony do biblioteki
library.add(faEdit, faTrashAlt, faPlus, faPlusCircle, faDumbbell, faInfoCircle, faSave, faTimes, faSpinner)

interface Workout {
  id: number;
  name: string;
  sets: number;
  reps: string;
  notes: string;
  week_id: number;
}

const route = useRoute()
const weekId = ref<string>(route.params.id as string)
const week = ref<{ id?: number; name: string; custom_name?: string } | null>(null)
const workouts = ref<Workout[]>([])
const newWorkout = ref({
  name: '',
  sets: 3,
  reps: '8-12',
  notes: '',
  week_id: 0
})

const editingWorkout = ref<Workout | null>(null)
const isEditingWeekName = ref(false)
const editedWeekName = ref('')
const weekNameInput = ref<HTMLInputElement | null>(null)
const showAddWorkoutForm = ref(false)

// Fetch week details
const fetchWeek = async () => {
  try {
    const response = await apiClient.get(`/weeks/${weekId.value}`)
    week.value = response.data
    if (week.value) {
      editedWeekName.value = week.value.custom_name || week.value.name
    }
  } catch (error) {
    console.error('Error fetching week:', error)
  }
}

// Fetch workouts for the week
const fetchWorkouts = async () => {
  try {
    console.log('Fetching workouts for week ID:', weekId.value);
    const response = await apiClient.get(`/weeks/${weekId.value}/workouts`);
    console.log('Fetched workouts:', response.data);
    workouts.value = response.data;
  } catch (error) {
    console.error('Error fetching workouts:', error)
  }
}

// Start editing week name
const startEditingWeekName = () => {
  isEditingWeekName.value = true
  nextTick(() => {
    if (weekNameInput.value) {
      weekNameInput.value.focus()
      weekNameInput.value.select()
    }
  })
}

// Save week name
const saveWeekName = async () => {
  if (!week.value || !editedWeekName.value.trim()) return;

  try {
    console.log('Zapisywanie nazwy tygodnia:', editedWeekName.value.trim());

    // Dane do wysłania - używamy klucza customName zamiast custom_name
    const weekData = {
      customName: editedWeekName.value.trim()
    };

    console.log('Dane wysyłane do serwera:', weekData);
    const response = await apiClient.put(`/weeks/${weekId.value}`, weekData);

    console.log('Odpowiedź serwera:', response.data);
    if (response.data) {
      // Aktualizujemy dane tygodnia z odpowiedzi serwera
      week.value = response.data;
      isEditingWeekName.value = false;
    }
  } catch (error) {
    console.error('Error updating week name:', error);
  }
};

// Cancel editing week name
const cancelEdit = () => {
  // Anuluj edycję nazwy tygodnia
  isEditingWeekName.value = false;
  if (week.value) {
    editedWeekName.value = week.value.custom_name || '';
  }

  // Anuluj edycję ćwiczenia (zamknij modal)
  editingWorkout.value = null;
};

// Add a new workout
const addWorkout = async () => {
  if (!newWorkout.value.name.trim()) return

  try {
    const response = await apiClient.post(`/weeks/${weekId.value}/workouts`, {
      name: newWorkout.value.name.trim(),
      sets: newWorkout.value.sets,
      reps: newWorkout.value.reps,
      notes: newWorkout.value.notes
    })

    workouts.value.push(response.data)
    resetNewWorkoutForm()
    showAddWorkoutForm.value = false // Ukryj formularz po dodaniu
  } catch (error) {
    console.error('Error adding workout:', error)
  }
}

// Cancel adding new workout
const cancelAddWorkout = () => {
  resetNewWorkoutForm()
  showAddWorkoutForm.value = false
}

// Reset new workout form
const resetNewWorkoutForm = () => {
  newWorkout.value = {
    name: '',
    sets: 3,
    reps: '8-12',
    notes: ''
  }
}

// Start editing a workout
const editWorkout = (workout: Workout) => {
  editingWorkout.value = { ...workout }
}

// Save edited workout
const saveWorkout = async () => {
  if (!editingWorkout.value) return

  try {
    const response = await apiClient.put(`/workouts/${editingWorkout.value.id}`, {
      ...editingWorkout.value
    })

    // Aktualizacja ćwiczenia w lokalnej tablicy
    const index = workouts.value.findIndex(w => w.id === editingWorkout.value?.id)
    if (index !== -1) {
      workouts.value[index] = { ...response.data }
    }
    editingWorkout.value = null
  } catch (error) {
    console.error('Error updating workout:', error)
  }
}

// Delete a workout
const deleteWorkout = async (id: number) => {
  if (!confirm('Are you sure you want to delete this workout?')) return

  try {
    const response = await apiClient.delete(`/workouts/${id}`)

    if (response.ok) {
      workouts.value = workouts.value.filter(w => w.id !== id)
    }
  } catch (error) {
    console.error('Error deleting workout:', error)
  }
}

// Watch for route changes
watch(() => route.params.id, (newId) => {
  if (newId) {
    weekId.value = newId as string
    fetchWeek()
    fetchWorkouts()
  }
}, { immediate: true })

// Fetch data on component mount
onMounted(() => {
  fetchWeek()
  fetchWorkouts()
})
</script>

<style scoped>
.workout-page {
  padding: 1rem;
  min-height: 100vh;
  background-color: #f5f5f5;
}

.container {
  max-width: 800px;
  margin: 0 auto;
}

.week-header {
  margin-bottom: 2rem;
}

.week-title-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.back-button {
  margin-left: 1rem;
}

.back-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #222;
  color: #26e07f;
  text-decoration: none;
  transition: all 0.3s;
}

.back-link:hover {
  background-color: #333;
}

.title-wrapper {
  flex: 1;
}

.week-title {
  display: flex;
  align-items: center;
  margin: 0;
  font-size: 1.8rem;
  font-weight: 600;
  cursor: pointer;
}

.week-name-input {
  flex: 1;
  margin-right: 1rem;
  padding: 0.5rem;
  font-size: 1.5rem;
  background-color: #ffffff !important;
  border: 1px solid #ccc !important;
  border-radius: 4px;
}

.edit-icon {
  margin-left: 0.5rem;
  font-size: 1.2rem;
  color: #666;
}

.week-edit-container {
  display: flex;
  flex-direction: column;
  width: 100%;
  gap: 0.5rem;
}

.week-input-wrapper {
  position: relative;
  width: 100%;
}

.week-name-input {
  width: 100%;
  padding: 0.5rem;
  font-size: 1.5rem;
  background-color: #222;
  color: black;
  border: 2px solid #26e07f;
  border-radius: 4px;
}

.week-edit-buttons {
  display: flex;
  gap: 0.5rem;
}

@media (max-width: 768px) {
  .week-edit-buttons {
    flex-direction: column;
  }

  .week-edit-buttons .btn {
    width: 100%;
  }
}

.content-wrapper {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.card {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
}

.card-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 0;
  margin-bottom: 1.5rem;
  font-size: 1.5rem;
  font-weight: 600;
  color: #333;
}

.card-title svg {
  margin-right: 0.5rem;
  color: #28a745;
}

.show-form-card {
  padding: 1rem;
}

.form-group {
  margin-bottom: 1rem;
}

.form-row {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
}

.form-row .form-group {
  flex: 1;
  margin-bottom: 0;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #333;
}

.form-control {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 1rem;
}

.form-buttons {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  margin-top: 1rem;
}

.btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  font-weight: 500;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
  min-height: 44px; /* Łatwiejsze dotykanie na telefonach */
}

.btn svg {
  margin-right: 0.5rem;
}

.btn-primary {
  background-color: #26e07f;
  color: #0c0c0c;
}

.btn-primary:hover {
  background-color: #20c06c;
}

.btn-cancel {
  background-color: #333;
  color: #ffffff;
  border: 1px solid #444;
}

.btn-cancel:hover {
  background-color: #444;
}

.btn-outline {
  background-color: transparent;
  border: 1px solid #ccc;
  color: #ccc;
}

.btn-outline:hover {
  background-color: #333;
  color: white;
}

.btn-block {
  width: 100%;
}

.close-button {
  border: none;
  background: transparent;
  font-size: 1.2rem;
  cursor: pointer;
  color: #666;
  padding: 0.2rem;
  border-radius: 4px;
  transition: all 0.3s;
}

.close-button:hover {
  color: #333;
  background-color: #f5f5f5;
}

.workout-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.workout-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  margin-top:1rem;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.workout-details {
  flex: 1;
}

.workout-name {
  margin: 0 0 0.5rem;
  font-size: 1.2rem;
  font-weight: 600;
  color: #333;
}

.workout-meta {
  display: flex;
  gap: 1.5rem;
  font-size: 0.9rem;
  color: #666;
}

.workout-meta div {
  display: flex;
  align-items: center;
}

.workout-meta svg {
  margin-right: 0.3rem;
}

.workout-notes {
  margin: 0.5rem 0 0;
  font-size: 0.9rem;
  color: #666;
  font-style: italic;
}

.action-buttons {
  display: flex;
  gap: 0.5rem;
}

.icon-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 4px;
  border: none;
  background-color: transparent;
  color: #666;
  cursor: pointer;
  transition: all 0.3s;
}

.icon-button:hover {
  background-color: #f5f5f5;
  color: #333;
}

.edit-btn:hover {
  color: #28a745;
}

.delete-btn:hover {
  color: #dc3545;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  padding: 1.5rem;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
  color: #333;
  display: flex;
  align-items: center;
}

.modal-header h3 svg {
  margin-right: 0.5rem;
  color: #28a745;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1.5rem;
}

.section-spacer {
  height: 2rem;
}

/* Media queries dla telefonów */
@media (max-width: 768px) {
  .container {
    padding: 0 0.5rem;
  }

  .card {
    padding: 1rem;
  }

  .form-buttons {
    flex-direction: column;
  }

  .btn {
    width: 100%;
  }

  .workout-meta {
    flex-direction: column;
    gap: 0.5rem;
  }

  .week-title {
    font-size: 1.5rem;
  }

  .section-title {
    font-size: 1.5rem;
  }
}
</style>