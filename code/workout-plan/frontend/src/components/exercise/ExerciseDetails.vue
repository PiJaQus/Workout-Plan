<template>
  <div class="workout-details">
    <h3 class="workout-name">{{ workout.name }}</h3>
    <div class="workout-meta">
      <div>
        <font-awesome-icon icon="layer-group"/>
        {{ workout.sets }} sets
      </div>
      <div>
        <font-awesome-icon icon="repeat"/>
        {{ workout.reps }} reps
      </div>
    </div>
    <p v-if="workout.notes" class="workout-notes">{{ workout.notes }}</p>
  </div>
</template>
<script setup lang="ts">
import {Workout} from "../../types/Workout.ts";

defineProps<{
  workout: Workout,
}>()
</script>
<style scoped>
.workout-notes {
  margin: 0.5rem 0 0;
  font-size: 0.9rem;
  color: #666;
  font-style: italic;
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
</style>