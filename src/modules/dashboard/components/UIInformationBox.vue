<template>
  <div class="kpi-card">
    <div class="kpi-card__main">
      <div class="kpi-card__label">{{ title }}</div>
      <div class="kpi-card__value">{{ valuePrefix }}{{ currentAmount.toLocaleString() }}</div>
      <div
        v-if="showTrend"
        class="kpi-card__trend-badge"
        :class="{ 'kpi-card__trend-badge--negative': isNegative }"
      >
        <font-awesome-icon
          :icon="isNegative ? trendIcons.negative : trendIcons.positive"
          class="kpi-card__trend-icon"
          aria-hidden="true"
        />
        <span class="kpi-card__trend-value">{{ animatedPercentage }}%</span>
      </div>
    </div>
    <div v-if="resolvedKpiIcon" class="kpi-card__icon-wrap" :style="{ color: resolvedIconColor }">
      <font-awesome-icon :icon="resolvedKpiIcon" class="kpi-card__icon" aria-hidden="true" />
    </div>
  </div>
</template>

<script lang="ts">
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core'
import { defineComponent } from 'vue'
import { kpiIconMap, trendIcons } from '@/icons/fontawesome-icons'

export default defineComponent({
  name: 'InformationBoxCard',
  props: {
    currentAmount: {
      type: Number,
      required: true,
      default: 0,
    },
    lastAmount: {
      type: Number,
      required: true,
      default: 0,
    },
    title: {
      type: String,
      required: true,
      default: 'Total Net Worth',
    },
    color: {
      type: String,
      default: 'blue',
    },
    type: {
      type: String,
      default: 'spending',
    },
    icon: {
      type: String,
      default: '',
    },
    iconColor: {
      type: String,
      default: '',
    },
    /** When false, hides the trend percentage badge */
    showTrend: {
      type: Boolean,
      default: true,
    },
    /** Prefix shown before the amount (e.g. '$' for currency, '' for plain number) */
    valuePrefix: {
      type: String,
      default: '$',
    },
  },
  data() {
    return {
      isNegative: false,
      trendIcons,
    }
  },
  computed: {
    accentColor(): string {
      return `var(--primary-${this.color}-color)`
    },
    resolvedIconColor(): string {
      if (this.iconColor) return this.iconColor
      return this.accentColor
    },
    /** Resolve prop string (e.g. 'fas fa-wallet') to IconDefinition from fontawesome-icons */
    resolvedKpiIcon(): IconDefinition | null {
      if (!this.icon || typeof this.icon !== 'string') return null
      const key = this.icon.trim().split(/\s+/).pop() ?? ''
      return kpiIconMap[key] ?? kpiIconMap[key.replace(/^fa-/, '')] ?? null
    },
    percentage(): string {
      const value = this.calculatePercentage()
      this.adjustPercentage()
      return (value < 0 ? -value : value).toFixed(1)
    },
    animatedPercentage(): string {
      const value = this.calculatePercentage()
      this.adjustPercentage()
      return (value < 0 ? -value : value).toFixed(1)
    },
  },
  methods: {
    calculatePercentage(): number {
      if (this.lastAmount === 0 && this.currentAmount === 0) return 0
      if (this.lastAmount === 0) return 100
      return (this.currentAmount / this.lastAmount) * 100 - 100
    },
    adjustPercentage(): void {
      if (this.type === 'spending') {
        this.isNegative = this.currentAmount - this.lastAmount >= 0
      } else {
        this.isNegative = this.currentAmount - this.lastAmount < 0
      }
    },
  },
})
</script>

<style scoped lang="scss">
.kpi-card {
  --kpi-trend-up: var(--primary-green-color);
  --kpi-trend-down: var(--primary-red-color);
  --kpi-badge-up-bg: rgba(92, 184, 92, 0.15);
  --kpi-badge-down-bg: rgba(239, 100, 100, 0.15);

  display: flex;
  flex-direction: row;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  width: 100%;
  min-width: 0;
  padding: 1rem 1.25rem;
  border-radius: var(--border-radius);
  font-family: var(--main-font);
  background: var(--background-color);
  box-shadow: none;
  transition: box-shadow 0.2s ease;

  &:hover {
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
  }

  .kpi-card__main {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
  }

  .kpi-card__icon-wrap {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 2.75rem;
    height: 2.75rem;
    border-radius: 10px;
    background: var(--background-color-soft);
  }

  .kpi-card__icon {
    font-size: 1.25rem;
    color: inherit;
  }

  .kpi-card__label {
    font-size: 0.8125rem;
    font-weight: 500;
    color: var(--normal-text-color);
    letter-spacing: 0.01em;
    margin-bottom: 0.25rem;
  }

  .kpi-card__value {
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--header-text-color);
    line-height: 1.25;
    margin-bottom: 0.5rem;
    letter-spacing: -0.02em;
  }

  .kpi-card__trend-badge {
    display: inline-flex;
    align-items: center;
    gap: 0.375rem;
    width: fit-content;
    padding: 0.25rem 0.5rem;
    border-radius: 9999px;
    font-size: 0.8125rem;
    font-weight: 600;
    background: var(--kpi-badge-up-bg);
    color: var(--kpi-trend-up);

    &--negative {
      background: var(--kpi-badge-down-bg);
      color: var(--kpi-trend-down);
    }
  }

  .kpi-card__trend-icon {
    font-size: 0.75rem;
    opacity: 0.9;
    color: inherit;
  }

  .kpi-card__trend-value {
    line-height: 1.2;
  }

  @media (max-width: 768px) {
    padding: 0.875rem 1rem;
    gap: 0.75rem;

    .kpi-card__icon-wrap {
      width: 2.25rem;
      height: 2.25rem;
    }

    .kpi-card__icon {
      font-size: 1rem;
    }

    .kpi-card__label {
      font-size: 0.75rem;
    }

    .kpi-card__value {
      font-size: 1.25rem;
    }

    .kpi-card__trend-badge {
      font-size: 0.75rem;
      padding: 0.2rem 0.4rem;
    }
  }
}
</style>
