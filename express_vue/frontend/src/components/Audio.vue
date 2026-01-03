<template>
  <div
    @click="handleClick"
    class="w-fit h-fit hover:cursor-pointer select-none"
  >
    {{ ICONS[state] }}
    <audio ref="audioRef" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from "vue";

const props = defineProps({
  text: String,
  example_type: String,
});

const ICONS = {
  READY: "▶️",
  PLAYING: "🔊",
  LOADING: "⏳",
  ERROR: "❌",
} as const;

type AudioState = keyof typeof ICONS;
const state = ref<AudioState>("READY");

// Reactive API
const api = () => {
  switch (props.example_type) {
    case "error":
      return "/tts-stream-error";
    case "slow":
      return "/tts-stream-slow";
    default:
      return "/tts-stream";
  }
};

const audioRef = ref<HTMLAudioElement | null>(null);

function handleClick() {
  if (!audioRef.value) return;

  const audio = audioRef.value;

  if (!audioRef.value.src) {
    audioRef.value.src = api();
  }

  if (audio.paused) {
    state.value = "LOADING";
    audio.play().catch(() => {
      state.value = "ERROR";
    });
  } else {
    audio.pause();
    state.value = "READY";
  }
}

let chunkTimeout: ReturnType<typeof setTimeout> | null = null;
const CHUNK_TIMEOUT_MS = 2000;

function resetChunkTimeout() {
  if (chunkTimeout) clearTimeout(chunkTimeout);

  chunkTimeout = setTimeout(() => {
    if (!audioRef.value) return;

    console.log("No new chunk received for 3 seconds!");
    state.value = "ERROR";
    alert("Audio stream timed out!");

    // Optionally pause audio
    audioRef.value.pause();
    audioRef.value.src = "";
    audioRef.value.load();
  }, CHUNK_TIMEOUT_MS);
}

// Update this in your audio event handler
function updateState(event: Event) {
  if (!audioRef.value || !audioRef.value.src) return;

  switch (event.type) {
    case "progress":
      // A new chunk was received → reset the timeout
      resetChunkTimeout();
      break;
    case "waiting":
      state.value = "LOADING";
      break;
    case "play":
    case "playing":
      state.value = "PLAYING";
      // reset timeout when playback starts
      resetChunkTimeout();
      break;
    case "pause":
    case "ended":
      state.value = "READY";
      if (chunkTimeout) clearTimeout(chunkTimeout);
      break;
    case "error":
      state.value = "ERROR";
      if (chunkTimeout) clearTimeout(chunkTimeout);
      break;
  }
}

const events = [
  "abort",
  "canplay",
  "canplaythrough",
  "durationchange",
  "emptied",
  "ended",
  "error",
  "loadeddata",
  "loadedmetadata",
  "loadstart",
  "pause",
  "play",
  "playing",
  "progress",
  "ratechange",
  "seeked",
  "seeking",
  "stalled",
  "suspend",
  "timeupdate",
  "volumechange",
  "waiting",
];

function handleGlobalError(event: ErrorEvent) {
  console.log("Global JS error:", event.message, event.filename, event.lineno);
}

function handleUnhandledRejection(event: PromiseRejectionEvent) {
  console.log("Unhandled promise rejection:", event.reason);
}

onMounted(() => {
  const audio = audioRef.value;
  if (!audio) return;
  events.forEach((evt) => audio.addEventListener(evt, updateState));

  window.addEventListener("error", handleGlobalError);
  window.addEventListener("unhandledrejection", handleUnhandledRejection);
});

onBeforeUnmount(() => {
  const audio = audioRef.value;
  if (!audio) return;
  events.forEach((evt) => audio.removeEventListener(evt, updateState));

  window.removeEventListener("error", handleGlobalError);
  window.removeEventListener("unhandledrejection", handleUnhandledRejection);
});
</script>
