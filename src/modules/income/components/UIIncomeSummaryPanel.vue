<template>
  <UISidePanelShell :is-open="isOpen" :title="t('periodSummary')" :aria-label="t('periodSummary')" @close="$emit('close')">
    <template #header>
      <div class="panel-header-inner">
        <div class="header-title-row">
          <font-awesome-icon icon="chart-line" class="header-icon" />
          <h2>{{ t('periodSummary') }}</h2>
        </div>
        <UISelect
          class="period-ui-select"
          :model-value="localPeriod"
          :options="periodOptions"
          :label="t('summaryPeriodLabel')"
          compact
          @update:model-value="onPeriodSelect"
        />
      </div>
    </template>

    <div v-if="loading" class="summary-skeleton">
      <div v-for="i in 3" :key="i" class="skeleton-card">
        <UISkeletonLoader height="120px" border-radius="16px" />
      </div>
    </div>

    <div v-else-if="items.length > 0" class="summary-list">
      <div v-for="(row, idx) in items" :key="idx" class="summary-card glass-card">
        <div class="summary-card-head">
          <span class="period-label-text">{{ row.period }}</span>
        </div>
        <div class="amount-row">
          <div>
            <span class="lbl">{{ t('totalForPeriod') }}</span>
            <span class="val">{{ formatCurrency(row.totalAmount) }}</span>
          </div>
          <div class="text-right">
            <span class="lbl">{{ t('transactionCount') }}</span>
            <span class="val">{{ row.incomeCount }}</span>
          </div>
        </div>
        <div v-if="categoryEntries(row).length" class="breakdown">
          <div class="breakdown-title">{{ t('summaryByCategory') }}</div>
          <ul class="breakdown-list">
            <li v-for="[name, amt] in categoryEntries(row)" :key="name">
              <span>{{ name }}</span>
              <span>{{ formatCurrency(amt) }}</span>
            </li>
          </ul>
        </div>
      </div>
    </div>

    <div v-else class="empty-state">
      <font-awesome-icon icon="folder-open" class="empty-icon" />
      <p>{{ t('noSummaryData') }}</p>
    </div>
  </UISidePanelShell>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import UISidePanelShell from '@/components/UISidePanelShell.vue'
import UISkeletonLoader from '@/components/UISkeletonLoader.vue'
import UISelect from '@/components/UISelect.vue'
import { incomeTexts } from '@/data/incomeTexts'
import { useCurrency } from '@/composables/useCurrency'
import type { IncomeSummaryItem } from '@/services/api/income/income.models'

export default defineComponent({
  name: 'UIIncomeSummaryPanel',
  components: { UISidePanelShell, UISkeletonLoader, FontAwesomeIcon, UISelect },
  props: {
    isOpen: { type: Boolean, default: false },
    loading: { type: Boolean, default: false },
    items: {
      type: Array as () => IncomeSummaryItem[],
      default: () => [],
    },
    selectedLanguage: {
      type: String as () => 'English' | 'Turkish',
      default: 'English',
    },
    period: {
      type: String,
      default: 'Monthly',
    },
  },
  emits: ['close', 'update:period'],
  setup() {
    const { formatCurrency } = useCurrency()
    return { formatCurrency }
  },
  data() {
    return {
      localPeriod: this.period,
    }
  },
  watch: {
    period(v: string) {
      this.localPeriod = v
    },
  },
  computed: {
    periodOptions() {
      return [
        { label: this.t('periodWeekly'), value: 'Weekly' },
        { label: this.t('periodMonthly'), value: 'Monthly' },
        { label: this.t('periodYearly'), value: 'Yearly' },
      ]
    },
  },
  methods: {
    t(key: keyof typeof incomeTexts.English) {
      const texts = incomeTexts[this.selectedLanguage]
      return (texts as Record<string, string>)[key] ?? key
    },
    categoryEntries(row: IncomeSummaryItem): [string, number][] {
      const rec = row.categoryBreakdown ?? {}
      return Object.entries(rec).sort((a, b) => b[1] - a[1])
    },
    onPeriodSelect(value: string | number) {
      this.localPeriod = String(value)
      this.$emit('update:period', this.localPeriod)
    },
  },
})
</script>

<style scoped lang="scss">
.panel-header-inner {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  width: 100%;
}

.header-title-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;

  .header-icon {
    color: var(--primary-green-color);
    font-size: 1.25rem;
  }

  h2 {
    font-size: 1.25rem;
    font-weight: 800;
    color: var(--header-text-color);
    margin: 0;
  }
}

.period-ui-select {
  width: 100%;
}

.summary-skeleton {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.summary-list {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.summary-card {
  padding: 1.25rem;
  border: 1px solid var(--border-color);
  border-radius: 16px;
}

.summary-card-head {
  margin-bottom: 0.75rem;
}

.period-label-text {
  font-weight: 700;
  color: var(--header-text-color);
}

.amount-row {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1rem;

  .lbl {
    display: block;
    font-size: 0.7rem;
    text-transform: uppercase;
    color: var(--header-text-color);
    opacity: 0.8;
    font-weight: 700;
  }

  .val {
    font-weight: 800;
    font-size: 1rem;
    color: var(--header-text-color);
  }

  .text-right {
    text-align: right;
  }
}

.breakdown-title {
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  color: var(--header-text-color);
  opacity: 0.85;
  margin-bottom: 0.5rem;
}

.breakdown-list {
  list-style: none;
  padding: 0;
  margin: 0;

  li {
    display: flex;
    justify-content: space-between;
    padding: 0.35rem 0;
    font-size: 0.9rem;
    border-bottom: 1px solid var(--border-color);

    &:last-child {
      border-bottom: none;
    }
  }
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 3rem;
  color: var(--normal-text-color);

  .empty-icon {
    font-size: 3rem;
    opacity: 0.35;
    margin-bottom: 1rem;
  }

  p {
    opacity: 0.7;
    font-size: 0.9rem;
  }
}
</style>
