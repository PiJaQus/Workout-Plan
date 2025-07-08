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
                <input type="text" class="week-name-input" v-model="editedWeekName" ref="weekNameInput"/>
              </div>
              <div class="week-edit-buttons">
                <button class="btn btn-primary" @click="saveWeekName">
                  <font-awesome-icon icon="save"/>
                  Save
                </button>
                <button class="btn btn-cancel" @click="cancelEdit">
                  <font-awesome-icon icon="times"/>
                  Cancel
                </button>
              </div>
            </div>
          </div>
          <div v-if="!isEditingWeekName" class="back-button">
            <button @click="startEditingWeekName" class="edit-link">
              <font-awesome-icon icon="pen-to-square"/>
            </button>
          </div>
          <div v-if="!isEditingWeekName" class="back-button">
            <router-link to="/man" class="back-link">
              <font-awesome-icon icon="arrow-left"/>
            </router-link>
          </div>
        </div>
      </div>
      <!-- End Header -->

      <div class="content-wrapper">
        <!-- Przycisk do pokazania formularza -->
        <div v-if="!showAddWorkoutForm" class="card show-form-card">
          <button class="btn btn-primary btn-block" @click="showAddWorkoutForm = true">
            <font-awesome-icon icon="plus-circle"/>
            Add New Exercise
          </button>
        </div>
        <!-- koniec do pokazania formularza -->

        <!-- Formularz dodawania nowego treningu -->
        <div v-if="showAddWorkoutForm" class="card workout-form-card">
          <h2 class="card-title">
            <font-awesome-icon icon="plus-circle"/>
            Add New Exercise
            <button class="icon-button close-button" @click="cancelAddWorkout">
              <font-awesome-icon icon="times"/>
            </button>
          </h2>
          <ExerciseContent :workout="newWorkout" idPrefix="new" />
          <div class="form-group">
            <label>Muscle Groups</label>
            <div class="muscle-figure-container">
              <div class="muscle-figure">
                <div class="base-figure"></div>
                <div v-for="muscleId in newWorkout.muscleGroups" :key="'overlay-' + muscleId"
                     :class="['muscle-overlay', 'muscle-' + muscleId]" :title="getMuscleName(muscleId)"></div>
              </div>
            </div>
            <div class="muscle-selector">
              <div class="muscle-diagram">
                <div class="muscle-option" v-for="muscle in muscleGroups" :key="muscle.id"
                     :class="{ 'selected': isMuscleSelected(muscle.id) }" @click="toggleMuscle(muscle.id)"
                     :title="muscle.name">
                  <img :src="getMuscleImage(muscle.id)" :alt="muscle.name" class="muscle-image"/>
                </div>
              </div>
              <div class="selected-muscles">
                <span v-for="muscleId in newWorkout.muscleGroups" :key="muscleId"
                      class="muscle-tag">{{ getMuscleName(muscleId) }}</span>
              </div>
            </div>
          </div>
          <div class="form-buttons">
            <button class="btn btn-cancel" @click="cancelAddWorkout">
              <font-awesome-icon icon="times"/>
              Cancel
            </button>
            <button class="btn btn-primary" @click="addWorkout">
              <font-awesome-icon icon="plus-circle"/>
              Add Exercise
            </button>
          </div>
        </div>
        <!-- Odstęp między sekcjami -->
        <div class="section-spacer"></div>
        
        <ExerciseView :workouts="workouts"
                      @delete-workout="handleDelete"
                      @edit-workout="startEditWorkout"
                      @show-muscle-group="openMuscleModal"
                      foo="true"/>


      </div>
    </div>

    <!-- Modal edycji ćwiczenia -->
    <div v-if="editingWorkout" class="modal-overlay" @click.self="cancelEdit">
      <div class="modal-content">
        <div class="modal-header">
          <h3>
            <font-awesome-icon icon="edit"/>
            Edit Exercise
          </h3>
          <button class="icon-button close-button" @click="cancelEdit">
            <font-awesome-icon icon="times"/>
          </button>
        </div>
        <div class="modal-body">
          <ExerciseContent :workout="editingWorkout" idPrefix="edit"/>
        </div>
        <div class="modal-footer">
          <button @click="saveWorkout" class="btn btn-primary">
            <font-awesome-icon icon="save"/>
            Save Changes
          </button>
        </div>
      </div>
    </div>
    <!-- Koniec modalu edycji ćwiczenia -->

    <MuscleGroupView :show="showMuscleModal" @close="closeMuscleModal" :workout="selectedWorkout"></MuscleGroupView>

  </div>
</template>
<script setup lang="ts">

import {ref, onMounted, watch, nextTick} from 'vue'
import {Workout} from '../types/Workout'
import {useRoute} from 'vue-router'
import {library} from '@fortawesome/fontawesome-svg-core'
import {
  faEdit,
  faTrashAlt,
  faPlus,
  faPlusCircle,
  faDumbbell,
  faInfoCircle,
  faSave,
  faTimes,
  faSpinner,
} from '@fortawesome/free-solid-svg-icons'
import apiClient from '../api/axios'
import ExerciseView from "../components/ExerciseView.vue";
import MuscleGroupView from "../components/muscleGroup/MuscleGroupView.vue";
import muscleGroups from "../types/MuscleGroups.ts";
import ExerciseContent from '../components/exercise/ExerciseContent.vue'

// Dodaj ikony do biblioteki
library.add(faEdit, faTrashAlt, faPlus, faPlusCircle, faDumbbell, faInfoCircle, faSave, faTimes, faSpinner)


const showMuscleModal = ref(false)
const selectedWorkout = ref<Workout | null>(null)
const route = useRoute()
const weekId = ref<string>(route.params.id as string)
const week = ref<{ id?: number; name: string; custom_name?: string } | null>(null)
const workouts = ref<Workout[]>([])
const newWorkout = ref({
  name: '',
  sets: 3,
  reps: '8-12',
  notes: '',
  week_id: 0,
  muscleGroups: [] as string[]
})

const editingWorkout = ref<Workout | null>(null)
const isEditingWeekName = ref(false)
const editedWeekName = ref('')
const weekNameInput = ref<HTMLInputElement | null>(null)
const showAddWorkoutForm = ref(false)


const closeMuscleModal = () => {
  showMuscleModal.value = false
  selectedWorkout.value = null
}
const props = defineProps<{ id: string }>();
const isMuscleSelected = (muscleId: string) => {
  return newWorkout.value.muscleGroups?.includes(muscleId) || false
}
const toggleMuscle = (muscleId: string) => {
  if (!newWorkout.value.muscleGroups) {
    newWorkout.value.muscleGroups = []
  }

  const index = newWorkout.value.muscleGroups.indexOf(muscleId)
  if (index === -1) {
    newWorkout.value.muscleGroups.push(muscleId)
  } else {
    newWorkout.value.muscleGroups.splice(index, 1)
  }

}

const getMuscleName = (muscleId: string) => {
  const muscle = muscleGroups.find(m => m.id === muscleId)
  return muscle ? muscle.name : muscleId
}
const getMuscleImage = (muscleId: string) => {
  return `/assets/images/${muscleId}.png`
}

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
  try {
    const workoutData = {
      name: newWorkout.value.name,
      sets: newWorkout.value.sets,
      reps: newWorkout.value.reps,
      notes: newWorkout.value.notes,
      muscleGroups: newWorkout.value.muscleGroups || []
    };

    const response = await apiClient.post(`/weeks/${weekId.value}/workouts`, workoutData);
    workouts.value.push(response.data);
    resetWorkoutForm();
    showAddWorkoutForm.value = false;
  } catch (error) {
    console.error('Error adding workout:', error);
  }
};

const resetWorkoutForm = () => {
  newWorkout.value = {
    name: '',
    sets: 3,
    reps: '8-12',
    notes: '',
    muscleGroups: []
  };
};

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
    notes: '',
    week_id: 0,
    muscleGroups: []
  }
}

// Start editing a workout


// Save edited workout
const saveWorkout = async () => {
  if (!editingWorkout.value) return;

  try {
    const workoutData = {
      name: editingWorkout.value.name,
      sets: editingWorkout.value.sets,
      reps: editingWorkout.value.reps,
      notes: editingWorkout.value.notes,
      muscleGroups: editingWorkout.value.muscleGroups || []
    };

    const response = await apiClient.put(`/workouts/${editingWorkout.value.id}`, workoutData);
    const index = workouts.value.findIndex(w => w.id === editingWorkout.value?.id);
    if (index !== -1) {
      workouts.value[index] = response.data;
    }
    editingWorkout.value = null; // Prawidłowe zamknięcie modala
  } catch (error) {
    console.error('Error saving workout:', error);
    // Opcjonalnie: pokaż użytkownikowi komunikat o błędzie
  }
};

// Delete a workout


// Watch for route changes
watch(() => route.params.id, (newId) => {
  if (newId) {
    weekId.value = newId as string
    fetchWeek()
    fetchWorkouts()
  }
}, {immediate: true})

// Fetch data on component mount
onMounted(() => {
  fetchWorkouts()
  fetchWeek()
})

// ---------- event handlers for child components ----------
const handleDelete = async (id: number) => {
  if (!confirm('Are you sure you want to delete this workout?')) return;
  try {
    await apiClient.delete(`/workouts/${id}`)
    const idx = workouts.value.findIndex(w => w.id === id)
    if (idx !== -1) workouts.value.splice(idx, 1)
  } catch (e) {
    console.error(e)
  }
}

const startEditWorkout = (workout: Workout) => {
  editingWorkout.value = {...workout}
}

const openMuscleModal = (workout: Workout) => {
  selectedWorkout.value = {...workout}
  showMuscleModal.value = true
}
</script>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

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

.back-link,
.edit-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #222;
  color: #26e07f;
  text-decoration: none;
  border: none;
  cursor: pointer;
  transition: all 0.3s;
  min-height: 44px; /* Łatwiejsze dotykanie na telefonach */
}

.back-link:hover,
.edit-link:hover {
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


.workout-meta div {
  display: flex;
  align-items: center;
}

.workout-meta svg {
  margin-right: 0.3rem;
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
  padding: 2rem;
}

.modal-content {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  width: 100%;
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

.modal-header .subtitle {
  font-size: 0.9em;
  opacity: 0.8;
  margin-top: 4px;
  margin-left: 2rem;
  font-weight: normal;
  display: block;
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

.muscle-selector {
  margin-top: 1rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 1rem;
  background-color: #fff;
}

.muscle-diagram {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
  gap: 1rem;
  margin-bottom: 1rem;
}

.muscle-option {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 0.5rem;
  border: 2px solid #eee;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.muscle-option img {
  width: 100%;
  height: 100%;
  object-fit: contain;

}

.muscle-option.selected {
  border-color: #26e07f;
  background-color: #e8f8f0;
  box-shadow: 0 0 0 2px rgba(38, 224, 127, 0.3);
}

.muscle-image {
  width: 40px;
  height: 40px;
  margin-bottom: 0.5rem;
}

.selected-muscles {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 1rem;
}

.selected-muscle-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: center;
  margin-top: 20px;
}

.muscle-tag {
  background-color: #26e07f;
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8rem;
  display: inline-flex;
  align-items: center;
}

.no-muscles {
  color: #888;
  font-style: italic;
  margin-top: 20px;
}

.muscle-figure-container {
  margin-top: 2rem;
  display: flex;
  justify-content: center;
  padding: 1rem;
  background-color: #f8f9fa;
  border-radius: 8px;
}

.muscle-figure {
  align-items: center;
  position: relative;
  width: 200px; /* Adjust based on your figure size */
  height: 400px; /* Adjust based on your figure size */
}

.base-figure {
  width: 100%;
  height: 100%;
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
  /* base figure image */
  background-image: url('/assets/images/0.png');
}

.muscle-overlay {
  position: absolute;
  pointer-events: none;
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
  opacity: 0.8;
  transition: opacity 0.2s;
}


.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  justify-content: center;
  justify-items: center;
  align-items: center;
  z-index: 1000;
  padding: 2rem;
}

.muscle-chest {
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: url('/assets/images/2.png');
}

.muscle-abs2 {
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: url('/assets/images/3.png');
}

.muscle-shoulders {
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: url('/assets/images/1.png');
}

.muscle-biceps {
  top: 0;
  left: 1%;
  width: 100%;
  height: 100%;
  background-image: url('/assets/images/4.png');
}

.muscle-forearms {
  top: 0;
  left: 1%;
  width: 100%;
  height: 100%;
  background-image: url('/assets/images/5.png');
}

.muscle-ass {
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: url('/assets/images/6.png');
}

.muscle-abs {
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: url('/assets/images/7.png');
}

.muscle-quads {
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: url('/assets/images/8.png');
}

.muscle-hamstrings {
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: url('/assets/images/9.png');
}


@media (max-width: 600px) {
  .modal-content {
    width: 95%;
  }

  .muscle-figure {
    width: 180px;
    height: 360px;
  }
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

  .muscle-preview {
    justify-items: center;
  }

  .week-edit-buttons {
    flex-direction: column;
  }

  .week-edit-buttons .btn {
    width: 100%;
  }
}
</style>