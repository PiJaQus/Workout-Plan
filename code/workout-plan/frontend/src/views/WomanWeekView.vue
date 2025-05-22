<template>
  <div class="container text-center mt-5">
    <div class="home-container">
      <div class="week-header">
        <h2 v-if="week">
          {{ week.custom_name || `Week ${week.name}` }}
          <button class="edit-button" @click="startEditing">✏️</button>
        </h2>
        <input 
          v-else-if="isEditing" 
          v-model="editedWeekName" 
          @keyup.enter="saveWeekName"
          @blur="saveWeekName"
          class="week-name-input"
          ref="nameInput"
        />
        <h2 v-else>Loading...</h2>
      </div>

      <div class="workout-form-container">
        <h3>Add New Workout</h3>
        <div class="workout-form">
          <input 
            v-model="newWorkout.name" 
            placeholder="Exercise name" 
            class="form-input"
          />
          <div class="form-row">
            <input 
              v-model.number="newWorkout.sets" 
              type="number" 
              min="1" 
              placeholder="Sets" 
              class="form-input small"
            />
            <input 
              v-model="newWorkout.reps" 
              placeholder="Reps (e.g., 8-12)" 
              class="form-input small"
            />
          </div>
          <textarea 
            v-model="newWorkout.notes" 
            placeholder="Notes (optional)" 
            class="form-textarea"
          ></textarea>
          <button @click="addWorkout" class="add-button">Add Workout</button>
        </div>
      </div>

      <div class="workouts-list">
        <h3>Workouts</h3>
        <div v-if="workouts.length === 0" class="no-workouts">
          No workouts added yet. Add your first workout above!
        </div>
        <div v-else>
          <div v-for="workout in workouts" :key="workout.id" class="workout-item">
            <div class="workout-header">
              <h4>{{ workout.name }}</h4>
              <div class="workout-actions">
                <button @click="editWorkout(workout)" class="icon-button">✏️</button>
                <button @click="deleteWorkout(workout.id)" class="icon-button delete">🗑️</button>
              </div>
            </div>
            <div class="workout-details">
              <span>{{ workout.sets }} sets × {{ workout.reps }}</span>
              <p v-if="workout.notes" class="workout-notes">{{ workout.notes }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Edit Workout Modal -->
      <div v-if="editingWorkout" class="modal-overlay">
        <div class="modal-content">
          <h3>Edit Workout</h3>
          <input 
            v-model="editingWorkout.name" 
            placeholder="Exercise name" 
            class="form-input"
          />
          <div class="form-row">
            <input 
              v-model.number="editingWorkout.sets" 
              type="number" 
              min="1" 
              placeholder="Sets" 
              class="form-input small"
            />
            <input 
              v-model="editingWorkout.reps" 
              placeholder="Reps (e.g., 8-12)" 
              class="form-input small"
            />
          </div>
          <textarea 
            v-model="editingWorkout.notes" 
            placeholder="Notes (optional)" 
            class="form-textarea"
          ></textarea>
          <div class="modal-buttons">
            <button @click="cancelEdit" class="cancel-button">Cancel</button>
            <button @click="saveWorkout" class="save-button">Save Changes</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import apiClient from '../api/axios';

interface RouteParams {
  id: string;
}

interface Workout {
  id?: number;
  week_id: number;
  name: string;
  sets: number;
  reps: string;
  notes: string;
}

const route = useRoute();
const weekId = ref<string>(route.params.id as string);

const week = ref<{ id?: number; name: string; custom_name?: string } | null>(null);
const workouts = ref<Workout[]>([]);
const isEditing = ref(false);
const editedWeekName = ref('');
const nameInput = ref<HTMLInputElement | null>(null);

const newWorkout = ref<Omit<Workout, 'week_id'>>({
  name: '',
  sets: 3,
  reps: '8-12',
  notes: ''
});

const editingWorkout = ref<Workout | null>(null);

// Fetch week details
const fetchWeek = async () => {
  try {
    const response = await apiClient.get(`/weeks/${weekId.value}`);
    week.value = response.data;
    editedWeekName.value = week.value.custom_name || week.value.name;
  } catch (error) {
    console.error('Error fetching week:', error);
  }
};

// Fetch workouts for the week
const fetchWorkouts = async () => {
  try {
    const response = await apiClient.get(`/weeks/${weekId.value}/workouts`);
    workouts.value = response.data;
  } catch (error) {
    console.error('Error fetching workouts:', error);
  }
};

// Start editing week name
const startEditing = () => {
  isEditing.value = true;
  nextTick(() => {
    if (nameInput.value) {
      nameInput.value.focus();
      nameInput.value.select();
    }
  });
};

// Save week name
const saveWeekName = async () => {
  if (!week.value) return;
  
  try {
    await apiClient.put(`/weeks/${week.value.id}`, {
      customName: editedWeekName.value
    });
    week.value.custom_name = editedWeekName.value;
    isEditing.value = false;
  } catch (error) {
    console.error('Error updating week name:', error);
  }
};

// Add a new workout
const addWorkout = async () => {
  if (!newWorkout.value.name.trim()) return;
  
  try {
    await apiClient.post(`/weeks/${weekId.value}/workouts`, newWorkout.value);
    newWorkout.value = { name: '', sets: 3, reps: '8-12', notes: '' };
    await fetchWorkouts();
  } catch (error) {
    console.error('Error adding workout:', error);
  }
};

// Start editing a workout
const editWorkout = (workout: Workout) => {
  editingWorkout.value = { ...workout };
};

// Save edited workout
const saveWorkout = async () => {
  if (!editingWorkout.value) return;
  
  try {
    await apiClient.put(`/workouts/${editingWorkout.value.id}`, editingWorkout.value);
    editingWorkout.value = null;
    await fetchWorkouts();
  } catch (error) {
    console.error('Error updating workout:', error);
  }
};

// Delete a workout
const deleteWorkout = async (id: number) => {
  if (!confirm('Are you sure you want to delete this workout?')) return;
  
  try {
    await apiClient.delete(`/workouts/${id}`);
    await fetchWorkouts();
  } catch (error) {
    console.error('Error deleting workout:', error);
  }
};

// Cancel editing
const cancelEdit = () => {
  editingWorkout.value = null;
};

// Watch for route changes
watch(() => route.params.id, (newId) => {
  if (newId) {
    weekId.value = newId as string;
    fetchWeek();
    fetchWorkouts();
  }
});

// Initial fetch
onMounted(() => {
  fetchWeek();
  fetchWorkouts();
});
</script>

<style scoped>
.home-container {
  background: #000;
  color: #1dd267;
  padding: 2rem;
  border-radius: 10px;
  max-width: 800px;
  margin: 0 auto;
}

.week-header {
  margin-bottom: 2rem;
  position: relative;
}

.week-header h2 {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.edit-button {
  background: none;
  border: none;
  color: #1dd267;
  cursor: pointer;
  font-size: 1rem;
  opacity: 0.7;
  transition: opacity 0.2s;
}

.edit-button:hover {
  opacity: 1;
}

.week-name-input {
  background: #111;
  border: 2px solid #1dd267;
  color: #1dd267;
  font-size: 1.5rem;
  padding: 0.5rem;
  border-radius: 5px;
  width: 100%;
  max-width: 400px;
  text-align: center;
}

.workout-form-container {
  background: #111;
  border: 2px solid #1dd267;
  border-radius: 10px;
  padding: 1.5rem;
  margin-bottom: 2rem;
}

.workout-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-row {
  display: flex;
  gap: 1rem;
}

.form-input, .form-textarea {
  background: #000;
  border: 1px solid #333;
  color: #1dd267;
  padding: 0.75rem;
  border-radius: 5px;
  font-size: 1rem;
  width: 100%;
}

.form-input.small {
  width: auto;
  flex: 1;
}

.form-textarea {
  min-height: 100px;
  resize: vertical;
}

.add-button {
  background: #1dd267;
  color: #000;
  border: none;
  padding: 0.75rem;
  border-radius: 5px;
  font-weight: bold;
  cursor: pointer;
  transition: background 0.2s;
}

.add-button:hover {
  background: #0f0;
}

.workouts-list {
  text-align: left;
}

.workout-item {
  background: #111;
  border: 1px solid #1dd267;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1rem;
}

.workout-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.workout-header h4 {
  margin: 0;
  font-size: 1.2rem;
}

.workout-actions {
  display: flex;
  gap: 0.5rem;
}

.icon-button {
  background: none;
  border: none;
  color: #1dd267;
  cursor: pointer;
  font-size: 1rem;
  opacity: 0.7;
  transition: opacity 0.2s;
  padding: 0.25rem;
}

.icon-button:hover {
  opacity: 1;
}

.icon-button.delete {
  color: #ff4d4d;
}

.workout-details {
  color: #aaa;
  font-size: 0.9rem;
}

.workout-notes {
  margin: 0.5rem 0 0;
  font-style: italic;
  color: #888;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: #111;
  border: 2px solid #1dd267;
  border-radius: 10px;
  padding: 2rem;
  width: 90%;
  max-width: 500px;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.modal-content h3 {
  margin-top: 0;
  color: #1dd267;
}

.modal-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1rem;
}

.cancel-button, .save-button {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 5px;
  font-weight: bold;
  cursor: pointer;
}

.cancel-button {
  background: #444;
  color: #fff;
}

.save-button {
  background: #1dd267;
  color: #000;
}

.save-button:hover {
  background: #0f0;
}

.no-workouts {
  color: #888;
  font-style: italic;
  text-align: center;
  padding: 2rem;
  background: #111;
  border: 1px solid #1dd267;
  border-radius: 8px;
}

/* Responsive styles */
@media (max-width: 600px) {
  .form-row {
    flex-direction: column;
    gap: 1rem;
  }
  
  .form-input.small {
    width: 100%;
  }
  
  .home-container {
    padding: 1rem;
  }
}
</style>
