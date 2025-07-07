<template>
  <div class="action-buttons">
    <button class="icon-button" aria-label="MuscleImage">
      <font-awesome-icon icon="image" />
    </button>
    <button class="icon-button" aria-label="Sort">
      <font-awesome-icon icon="sort" />
    </button>
    <button @click="$emit('delete-workout', workout.id)" class="icon-button delete-btn" aria-label="Delete">
      <font-awesome-icon icon="trash-alt" />
    </button>
    <button @click="$emit('show-muscle-group', workout)" class="icon-button muscle-btn" aria-label="Show muscle groups">
      <font-awesome-icon icon="person" />
    </button>
    <button @click="$emit('edit-workout', workout)" class="icon-button edit-btn" aria-label="Edit">
      <font-awesome-icon icon="edit" />
    </button>
  </div>
</template>

<script setup lang="ts">
import { Workout } from "../../types/Workout";

const props = defineProps<{ workout: Workout }>();

const emit = defineEmits([
  'delete-workout',
  'edit-workout',
  'show-muscle-group'
]);
</script>

<style scoped>
.action-buttons {
  display: grid;
  gap: 0.5rem;
  grid-template-columns: repeat(3, 1fr);
  justify-items: center;
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
</style>