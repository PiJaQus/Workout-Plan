<template>
  <transition name="fade">
    <div v-if="show" class="modal-overlay" @click.self="emitClose">
      <div class="modal-content">
        <div class="modal-header">
          <h3>
            {{ workout?.name }}
            <div class="subtitle">Muscle Groups</div>
          </h3>
          <button @click="emitClose" class="close-button"><font-awesome-icon icon="times"/></button>
        </div>
        <div class="modal-body">
          <div class="muscle-preview">
            <MuscleFigure :workout="workout"/>
            <div v-if="!(workout?.muscleGroups?.length)" class="no-muscles">
              Brak przypisanych grup mięśni
            </div>
            <div v-if="workout?.muscleGroups?.length" class="selected-muscle-tags">
              <div v-for="muscleId in workout.muscleGroups" :key="'tag-' + muscleId" class="muscle-tag">
                {{ getMuscleName(muscleId) }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { Workout } from "../../types/Workout";
import muscleGroups from "../../types/MuscleGroups.ts";
import MuscleFigure from "./MuscleFigure.vue"

const props = defineProps<{
  show: boolean,
  workout: Workout | null,
}>()

const emit = defineEmits(['close'])

const emitClose = () => emit('close')

const getMuscleName = (id: string) => {
  const m = muscleGroups.find(m => m.id === id)
  return m ? m.name : id
}
</script>

<style scoped>
.muscle-preview {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.muscle-figure {
  position: relative;
  width: 200px;
  height: 400px;
}

.base-figure {
  width: 100%;
  height: 100%;
  background-image: url('/assets/images/0.png');
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
}

.muscle-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
  opacity: 0.8;
  pointer-events: none;
}

.selected-muscle-tags {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  margin-top: 20px;
  gap: 0.5rem;
}

.muscle-tag {
  background-color: #26e07f;
  color: #fff;
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

.subtitle {
  font-size: 0.9em;
  opacity: 0.8;
  margin-top: 4px;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 2rem;
}

.modal-content {
  background-color: #ffffff;
  border-radius: 8px;
  max-width: 420px;
  width: 100%;
  padding: 1.5rem 2rem;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.modal-header h3 {
  margin: 0;
  color: #333;
}

.close-button {
  border: none;
  background: transparent;
  cursor: pointer;
  color: #666;
  font-size: 1.2rem;
}

/* pojedyncze nakładki */
.muscle-shoulders { background-image: url('/assets/images/1.png'); }
.muscle-chest     { background-image: url('/assets/images/2.png'); }
.muscle-abs2      { background-image: url('/assets/images/3.png'); }
.muscle-biceps2    { background-image: url('/assets/images/4.png'); }
.muscle-forearms  { background-image: url('/assets/images/5.png'); }
.muscle-ass       { background-image: url('/assets/images/6.png'); }
.muscle-abs       { background-image: url('/assets/images/7.png'); }
.muscle-quads     { background-image: url('/assets/images/8.png'); }
.muscle-hamstrings{ background-image: url('/assets/images/9.png'); }
</style>