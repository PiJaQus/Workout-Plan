<template>
  <div>
    <div class="form-group">
      <label :for="`${idPrefix}-exercise-name`">Exercise Name</label>
      <input :id="`${idPrefix}-exercise-name`"
             v-model="workout.name"
             type="text"
             class="form-control"
             placeholder="e.g., Bench Press"/>
    </div>

    <div class="form-row">
      <div class="form-group">
        <label :for="`${idPrefix}-sets`">Sets</label>
        <input :id="`${idPrefix}-sets`"
               v-model.number="workout.sets"
               type="number"
               min="1"
               class="form-control"
               placeholder="3"/>
      </div>
      <div class="form-group">
        <label :for="`${idPrefix}-reps`">Reps</label>
        <input :id="`${idPrefix}-reps`"
               v-model="workout.reps"
               type="text"
               class="form-control"
               placeholder="8-12"/>
      </div>
    </div>

    <div class="form-group">
      <label :for="`${idPrefix}-notes`">Notes (optional)</label>
      <textarea :id="`${idPrefix}-notes`"
                v-model="workout.notes"
                class="form-control"
                placeholder="Any additional notes..."></textarea>
    </div>
  </div>
</template>

<script setup lang="ts">
type Workout = {
  name: string
  sets: number | null
  reps: string
  notes: string
}

const props = defineProps<{
  workout: Workout          // obiekt powiązany z v-model
  idPrefix?: string         // aby input id były unikalne
}>()

// domyślne wartości
const idPrefix = props.idPrefix ?? 'exercise'
</script>