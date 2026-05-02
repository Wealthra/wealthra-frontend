<template>
  <TooltipProvider :delay-duration="delayDuration">
    <TooltipRoot :open="open" @update:open="$emit('update:open', $event)">
      <TooltipTrigger as-child class="ui-tooltip-trigger">
        <span><slot></slot></span>
      </TooltipTrigger>
      <TooltipPortal>
        <TooltipContent
          class="ui-tooltip-content"
          :side="side"
          :align="align"
          :side-offset="sideOffset"
          :collision-padding="10"
        >
          <slot name="content">{{ content }}</slot>
          <TooltipArrow class="ui-tooltip-arrow" :width="10" :height="5" />
        </TooltipContent>
      </TooltipPortal>
    </TooltipRoot>
  </TooltipProvider>
</template>

<script setup lang="ts">
import {
  TooltipArrow,
  TooltipContent,
  TooltipPortal,
  TooltipProvider,
  TooltipRoot,
  TooltipTrigger,
} from 'radix-vue'

interface Props {
  content?: string
  side?: 'top' | 'right' | 'bottom' | 'left'
  align?: 'start' | 'center' | 'end'
  sideOffset?: number
  delayDuration?: number
  open?: boolean
}

withDefaults(defineProps<Props>(), {
  side: 'top',
  align: 'center',
  sideOffset: 8,
  delayDuration: 100, // Reduced delay for faster testing
})

defineEmits(['update:open'])
</script>

<style lang="scss">
/* Use global styles for portal content */
.ui-tooltip-content {
  z-index: 10001 !important; /* Higher than almost everything */
  border-radius: 6px;
  padding: 6px 10px;
  font-size: 12px;
  font-weight: 500;
  line-height: 1.2;
  color: #ffffff;
  background-color: #1a1a1a;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
  user-select: none;
  pointer-events: none;
  border: 1px solid rgba(255, 255, 255, 0.15);
  
  /* Simple fade animation */
  transition: opacity 0.2s ease, transform 0.2s ease;
  
  &[data-state='closed'] {
    opacity: 0;
  }
}

.ui-tooltip-arrow {
  fill: #1a1a1a;
}

.ui-tooltip-trigger {
  display: inline-block;
  cursor: pointer;
}
</style>

