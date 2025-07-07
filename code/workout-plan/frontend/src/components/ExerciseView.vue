<template>
  <div class="workouts-list">
    <h2 class="section-title">
      <font-awesome-icon icon="dumbbell"/>
      Your Exercises
    </h2>

    <div v-if="workouts.length === 0" class="empty-state pt-3">
      <font-awesome-icon icon="info-circle" size="2x"/>
      <p>No exercises added yet. Add your first exercise to get started!</p>
    </div>
    <div v-else class="workout-items">
      <div v-for="workout in workouts" :key="workout.id" class="workout-card">
        <exercise-card :workout="workout"
                        @delete-workout="$emit('delete-workout', $event)"
                        @edit-workout="$emit('edit-workout', $event)"
                        @show-muscle-group="$emit('show-muscle-group', $event)"/>
      </div>
    </div>
  </div>
  <!-- Koniec sekcji z ćwiczeniami -->
</template>
<script setup lang="ts">

import {Workout} from '../types/workout'

import ExerciseCard from "./exercise/ExerciseCard.vue";

const props = defineProps<{
  workouts: Workout[],
  foo: string
}>()

const emit = defineEmits(['delete-workout','edit-workout','show-muscle-group'])
</script>
<style scoped>
.workout-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  margin-top: 1rem;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}
</style>