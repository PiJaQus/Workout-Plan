<template>
  <exercise-details :workout="workout"></exercise-details>
  <exercise-actions
      :workout="workout"
      @delete-workout="$emit('delete-workout', $event)"
      @edit-workout="$emit('edit-workout', $event)"
      @show-muscle-group="$emit('show-muscle-group', $event)"
  ></exercise-actions>
</template>
<script setup lang="ts">
import ExerciseDetails from "./ExerciseDetails.vue";
import ExerciseActions from "./ExerciseActions.vue";
import {Workout} from "../../types/Workout.ts";

defineProps<{
  workout: Workout,
}>()
defineEmits([
  'delete-workout',
  'edit-workout',
  'show-muscle-group'
])
</script>