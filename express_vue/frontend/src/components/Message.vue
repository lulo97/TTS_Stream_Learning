<template>
  <div
    :class="[
      'w-fit h-fit border border-gray-400 rounded-md px-4 py-2',
      props.position == 'right' ? ' ml-auto bg-pink-200' : 'bg-blue-200',
    ]"
  >
    <div class="flex gap-2 justify-center items-center"><Audio :text="props.message" :example_type="props.example_type" /> {{ props.message }}</div>
  </div>
</template>

<script setup lang="ts">
import Audio from "./Audio.vue";

const props = defineProps({
  message: String,
  position: String,
  example_type: String
});
</script>
