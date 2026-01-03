<script setup lang="ts">
import Message from "./components/Message.vue";
</script>

<template>
  <div class="w-full min-h-[100vh] flex flex-col bg-slate-100 px-40 py-2 gap-2">
    <Message message="This text play mp3" position="right" example_type="" />
    <Message  message="This text play mp3 with latency" position="left" example_type="slow"/>
    <Message message="This text play mp3 little bit and error" position="right" example_type="error"/>
  </div>
</template>

<style scoped></style>
