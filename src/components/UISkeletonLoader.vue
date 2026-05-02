<template>
  <div 
    :class="['skeleton-loader', type]" 
    :style="{ width, height, borderRadius }"
  ></div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'UISkeletonLoader',
  props: {
    type: {
      type: String,
      default: 'rect' // 'rect', 'circle', 'text'
    },
    width: {
      type: String,
      default: '100%'
    },
    height: {
      type: String,
      default: '20px'
    },
    borderRadius: {
      type: String,
      default: '4px'
    }
  }
})
</script>

<style scoped lang="scss">
.skeleton-loader {
  background: var(--skeleton-bg);
  background: linear-gradient(
    90deg,
    var(--skeleton-bg) 25%,
    var(--skeleton-shimmer) 50%,
    var(--skeleton-bg) 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite linear;
  
  &.circle {
    border-radius: 50% !important;
  }
  
  &.text {
    height: 14px;
    margin-bottom: 8px;
    border-radius: 2px;
  }
}

@keyframes loading {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}
</style>
