<template>
  <div class="muscle-figure">
    <div class="base-figure"></div>
    <div v-for="muscleId in groups"
         :key="muscleId"
         :class="['muscle-overlay', 'muscle-' + muscleId]"
         :title="getMuscleName(muscleId)"></div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import muscleGroups from "../../types/MuscleGroups.ts";

interface HasMuscles { muscleGroups?: string[] }

const props = defineProps<{
  workout?: HasMuscles | null
  muscleGroups?: string[]
}>()

const groups = computed(() => props.muscleGroups ?? props.workout?.muscleGroups ?? [])

const getMuscleName = (id: string) => {
  const m = muscleGroups.find(m => m.id === id)
  return m ? m.name : id
}
</script>

<style scoped>
/* base styles can be provided here if not in parent */
</style>