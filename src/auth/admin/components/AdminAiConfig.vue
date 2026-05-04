<template>
  <div class="admin-ai-config">
    <!-- Header Section -->


    <!-- Stats Grid -->
    <div class="stats-grid">
      <template v-if="isLoading">
        <div v-for="i in 4" :key="'stat-skel-'+i" class="stat-card glass-card skeleton-card">
          <div class="stat-info">
            <UISkeletonLoader width="80px" height="12px" style="margin-bottom: 6px" />
            <UISkeletonLoader width="60px" height="24px" />
          </div>
        </div>
      </template>
      <template v-else-if="usage">
        <div class="stat-card glass-card">
          <div class="stat-icon-wrap prompt">
            <font-awesome-icon :icon="faTerminal" />
          </div>
          <div class="stat-info">
            <span class="stat-label">{{ t.promptTokens }}</span>
            <span class="stat-value">{{ isPrivacyMode ? '••••' : formatInt(usage.totalPromptTokens) }}</span>
          </div>
        </div>
        <div class="stat-card glass-card">
          <div class="stat-icon-wrap completion">
            <font-awesome-icon :icon="faCode" />
          </div>
          <div class="stat-info">
            <span class="stat-label">{{ t.completionTokens }}</span>
            <span class="stat-value">{{ isPrivacyMode ? '••••' : formatInt(usage.totalCompletionTokens) }}</span>
          </div>
        </div>
        <div class="stat-card glass-card">
          <div class="stat-icon-wrap total">
            <font-awesome-icon :icon="faMicrochip" />
          </div>
          <div class="stat-info">
            <span class="stat-label">{{ t.totalTokens }}</span>
            <span class="stat-value">{{ isPrivacyMode ? '••••' : formatInt(usage.totalPromptTokens + usage.totalCompletionTokens) }}</span>
          </div>
        </div>
        <div class="stat-card glass-card">
          <div class="stat-icon-wrap cost">
            <font-awesome-icon :icon="faDollarSign" />
          </div>
          <div class="stat-info">
            <span class="stat-label">{{ t.estimatedCost }}</span>
            <span class="stat-value">{{ isPrivacyMode ? '••••' : formatUsd(usage.totalEstimatedCostUsd) }}</span>
          </div>
        </div>
      </template>
    </div>

    <!-- Main Content Grid -->
    <div class="content-grid">
      <!-- Left Column: Settings -->
      <div class="settings-column">
        <div class="glass-card config-panel" :class="{ 'skeleton-panel': isLoading }">
          <div class="panel-header">
            <h2>
              <font-awesome-icon :icon="faGears" />
              {{ t.runtimeSettings }}
            </h2>
          </div>

          <div v-if="isLoading" class="settings-form">
            <div v-for="i in 2" :key="'form-skel-'+i" class="form-group">
              <UISkeletonLoader width="140px" height="16px" style="margin-bottom: 8px" />
              <UISkeletonLoader width="100%" height="48px" border-radius="14px" />
            </div>
            <div class="form-actions">
              <UISkeletonLoader width="120px" height="42px" border-radius="14px" />
            </div>
          </div>
          <form v-else-if="settings" @submit.prevent="handleSave" class="settings-form">
            <div class="form-group">
              <label for="enrichment-model">
                {{ t.enrichmentModel }}
                <font-awesome-icon :icon="faCircleInfo" class="info-icon" @mouseenter="(e: MouseEvent) => showTooltip(e, t.enrichmentTooltip)" @mouseleave="hideTooltip" />
              </label>
              <div class="input-wrapper-ui">
                <font-awesome-icon :icon="faBrain" class="input-icon-ui" />
                <UISelect 
                  id="enrichment-model"
                  v-model="settings.enrichmentModel" 
                  :options="modelOptions"
                  :placeholder="t.modelPlaceholder" 
                  searchable
                  required 
                />
              </div>
              <p class="field-desc">{{ t.enrichmentDesc }}</p>
            </div>

            <div class="form-group">
              <label for="chat-model">
                {{ t.chatModel }}
                <font-awesome-icon :icon="faCircleInfo" class="info-icon" @mouseenter="(e: MouseEvent) => showTooltip(e, t.chatTooltip)" @mouseleave="hideTooltip" />
              </label>
              <div class="input-wrapper-ui">
                <font-awesome-icon :icon="faComments" class="input-icon-ui" />
                <UISelect 
                  id="chat-model"
                  v-model="settings.defaultChatModel" 
                  :options="modelOptions"
                  :placeholder="t.modelPlaceholder" 
                  searchable
                  required 
                />
              </div>
              <p class="field-desc">{{ t.chatDesc }}</p>
            </div>

            <div class="form-actions">
              <button type="submit" class="save-btn" :disabled="isSaving || isLoading">
                <font-awesome-icon v-if="isSaving" :icon="faSpinner" spin />
                <font-awesome-icon v-else :icon="faCloudArrowUp" />
                {{ isSaving ? t.saving : t.update }}
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Right Column: Visualization & Quota -->
      <div class="visuals-column">
        <div class="glass-card chart-panel" :class="{ 'skeleton-panel': isLoading }">
          <div class="panel-header">
            <h2>
              <font-awesome-icon :icon="faChartPie" />
              {{ t.usageBreakdown }}
            </h2>
            <div v-if="!isLoading" class="period-badge">{{ t.last7Days }}</div>
          </div>
          
          <div v-if="isLoading" class="chart-container-skel">
            <UISkeletonLoader width="180px" height="180px" border-radius="50%" />
            <div class="quota-info-skel mt-6">
              <UISkeletonLoader width="100%" height="60px" border-radius="14px" />
            </div>
          </div>
          <template v-else>
            <div class="chart-container">
              <div v-if="!usage" class="no-data">
                <font-awesome-icon :icon="faArrowsRotate" />
                No usage data available
              </div>
              <DoughnutChart 
                v-else
                :data="tokenChartData" 
                :options="tokenChartOptions"
                class="token-chart"
              />
            </div>

            <div class="quota-info mt-6">
              <div class="quota-header">
                <span class="quota-label">{{ t.quotaTitle }}</span>
                <span class="quota-status success">{{ t.statusHealthy }}</span>
              </div>
              <div class="quota-bar-wrap">
                <div class="quota-bar" :style="{ width: isPrivacyMode ? '0%' : '42%' }"></div>
              </div>
              <div class="quota-footer">
                <span>{{ t.usageRate }}: {{ isPrivacyMode ? '••%' : '42%' }}</span>
                <span>{{ isPrivacyMode ? '••••' : formatInt(usage?.requestCount || 0) }} {{ t.requests }}</span>
              </div>
            </div>
          </template>
        </div>
      </div>
    </div>

    <!-- Fixed Tooltip -->
    <div
      v-if="tooltip.visible"
      class="config-tooltip"
      :style="{ left: tooltip.x + 'px', top: tooltip.y + 'px' }"
    >
      {{ tooltip.text }}
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { adminService } from '@/services/api/admin/admin.service'
import type { AdminAiSettings, AiUsageSummary, GroqModelDto } from '@/services/api/admin/admin.models'
import UISkeletonLoader from '@/components/UISkeletonLoader.vue'
import UISelect from '@/components/UISelect.vue'
import { useCurrency } from '@/composables/useCurrency'
import { Doughnut as DoughnutChart } from 'vue-chartjs'
import {
  faRobot,
  faTerminal,
  faCode,
  faMicrochip,
  faDollarSign,
  faGears,
  faCircleInfo,
  faBrain,
  faComments,
  faSpinner,
  faCloudArrowUp,
  faChartPie,
  faArrowsRotate
} from '@fortawesome/free-solid-svg-icons'
import {
  Chart as ChartJS,
  Tooltip as ChartTooltip,
  Legend,
  ArcElement,
  CategoryScale
} from 'chart.js'

ChartJS.register(ChartTooltip, Legend, ArcElement, CategoryScale)

export default defineComponent({
  name: 'AdminAiConfig',
  components: { UISkeletonLoader, DoughnutChart, UISelect },
  props: {
    selectedLanguage: {
      type: String,
      default: 'English'
    }
  },
  setup(props) {
    const { isPrivacyMode } = useCurrency()
    const settings = ref<AdminAiSettings>({
      enrichmentModel: '',
      defaultChatModel: ''
    })
    const usage = ref<AiUsageSummary | null>(null)
    const groqModels = ref<GroqModelDto[]>([])
    const isLoading = ref(true)
    const isSaving = ref(false)
    const tooltip = ref({ visible: false, text: '', x: 0, y: 0 })

    const t = computed(() => {
      const isTr = props.selectedLanguage === 'Turkish'
      return {

        refresh: isTr ? 'Yenile' : 'Refresh',
        promptTokens: isTr ? 'İstem Jetonları' : 'Prompt Tokens',
        completionTokens: isTr ? 'Tamamlama Jetonları' : 'Completion Tokens',
        totalTokens: isTr ? 'Toplam Jeton' : 'Total Tokens',
        estimatedCost: isTr ? 'Tahmini Maliyet' : 'Estimated Cost',
        runtimeSettings: isTr ? 'Çalışma Zamanı Ayarları' : 'Runtime Settings',
        enrichmentModel: isTr ? 'Veri Zenginleştirme Modeli' : 'Enrichment Model',
        chatModel: isTr ? 'Varsayılan Sohbet Modeli' : 'Default Chat Model',
        modelPlaceholder: isTr ? 'örn. gpt-4o' : 'e.g. gpt-4o',
        enrichmentDesc: isTr ? 'Veri ayıklama ve sınıflandırma görevleri için kullanılan model.' : 'Used for data extraction and classification tasks.',
        chatDesc: isTr ? 'Kullanıcı sohbetleri ve Copilot için birincil model.' : 'Primary model for user conversations and Copilot.',
        enrichmentTooltip: isTr ? 'Fatura tarama ve işlem kategorize etme gibi arka plan görevleri.' : 'Background tasks like receipt scanning and transaction categorization.',
        chatTooltip: isTr ? 'Kullanıcıların doğrudan etkileşime girdiği asistan modeli.' : 'The assistant model users interact with directly.',
        update: isTr ? 'Ayarları Güncelle' : 'Update Settings',
        saving: isTr ? 'Kaydediliyor...' : 'Saving...',
        usageBreakdown: isTr ? 'Jeton Dağılımı' : 'Token Breakdown',
        last7Days: isTr ? 'Son 7 Gün' : 'Last 7 Days',
        quotaTitle: isTr ? 'Sistem Kotası' : 'System Quota',
        statusHealthy: isTr ? 'Sağlıklı' : 'Healthy',
        usageRate: isTr ? 'Kullanım Oranı' : 'Usage Rate',
        requests: isTr ? 'istek' : 'requests',
        promptLabel: isTr ? 'İstem' : 'Prompt',
        completionLabel: isTr ? 'Tamamlama' : 'Completion'
      }
    })

    const locale = computed(() => (props.selectedLanguage === 'Turkish' ? 'tr-TR' : 'en-US'))

    const formatInt = (n: number) =>
      new Intl.NumberFormat(locale.value, { maximumFractionDigits: 0 }).format(n ?? 0)

    const modelOptions = computed(() => {
      return groqModels.value.map((m: GroqModelDto) => ({
        label: isPrivacyMode.value
          ? `${m.id} (•••)`
          : `${m.id} (${m.contextWindow ? formatInt(m.contextWindow) : '?'})`,
        value: m.id,
      }))
    })

    const formatUsd = (amount: number) => {
      try {
        return new Intl.NumberFormat(locale.value, {
          style: 'currency',
          currency: 'USD',
          maximumFractionDigits: 4,
        }).format(amount ?? 0)
      } catch {
        return `$${amount ?? 0}`
      }
    }

    const fetchAll = async () => {
      isLoading.value = true
      try {
        const [s, u, g] = await Promise.all([
          adminService.getAiSettings(),
          adminService.getAiUsage(7),
          adminService.getGroqModels()
        ])
        settings.value = s
        usage.value = u
        groqModels.value = g.models || []
      } catch (err) {
        console.error('Failed to fetch AI data:', err)
      } finally {
        isLoading.value = false
      }
    }

    const handleSave = async () => {
      isSaving.value = true
      try {
        await adminService.updateAiSettings(settings.value)
      } catch (err) {
        console.error('Failed to save AI settings:', err)
      } finally {
        isSaving.value = false
      }
    }

    const showTooltip = (event: MouseEvent, text: string) => {
      const el = event.currentTarget as HTMLElement
      const rect = el.getBoundingClientRect()
      tooltip.value = {
        visible: true,
        text,
        x: rect.left + rect.width / 2,
        y: rect.top - 10,
      }
    }

    const hideTooltip = () => {
      tooltip.value.visible = false
    }

    const tokenChartData = computed(() => {
      if (!usage.value) return { labels: [], datasets: [] }
      return {
        labels: [t.value.promptLabel, t.value.completionLabel],
        datasets: [{
          data: isPrivacyMode.value ? [0, 100] : [usage.value.totalPromptTokens, usage.value.totalCompletionTokens],
          backgroundColor: isPrivacyMode.value ? ['#334155', '#334155'] : ['#10b981', '#3b82f6'],
          hoverOffset: 4,
          borderWidth: 0
        }]
      }
    })

    const tokenChartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom' as const,
          labels: {
            color: '#94a3b8',
            usePointStyle: true,
            padding: 20
          }
        }
      },
      cutout: '70%'
    }

    const handleGlobalRefetch = () => fetchAll()

    onMounted(() => {
      fetchAll()
      window.addEventListener('app:refetch', handleGlobalRefetch)
    })

    onBeforeUnmount(() => {
      window.removeEventListener('app:refetch', handleGlobalRefetch)
    })

    return {
      settings,
      usage,
      groqModels,
      modelOptions,
      isLoading,
      isSaving,
      t,
      tooltip,
      tokenChartData,
      tokenChartOptions,
      formatInt,
      formatUsd,
      fetchAll,
      handleSave,
      showTooltip,
      hideTooltip,
      isPrivacyMode,
      faRobot,
      faTerminal,
      faCode,
      faMicrochip,
      faDollarSign,
      faGears,
      faCircleInfo,
      faBrain,
      faComments,
      faSpinner,
      faCloudArrowUp,
      faChartPie,
      faArrowsRotate
    }
  }
})
</script>

<style scoped lang="scss">
.admin-ai-config {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  gap: 1.5rem;
  animation: fadeIn 0.4s ease-out;

  @media (max-width: 1024px) {
    flex: none;
    min-height: auto;
  }
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}



/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.25rem;
  flex-shrink: 0;

  @media (max-width: 1200px) { grid-template-columns: repeat(2, 1fr); }
  @media (max-width: 600px) { grid-template-columns: 1fr; }
}

.skeleton-card {
  min-height: 104px;
  background: var(--input-background-color) !important;
}

.skeleton-panel {
  background: var(--input-background-color) !important;
  .panel-header { border-bottom: none; }
}

.skeleton-stats {
  display: contents;
}

.stat-card {
  padding: 1.25rem;
  display: flex;
  align-items: center;
  gap: 16px;

  .stat-icon-wrap {
    width: 48px;
    height: 48px;
    border-radius: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.25rem;

    &.prompt { background: rgba(16, 185, 129, 0.1); color: #10b981; }
    &.completion { background: rgba(59, 130, 246, 0.1); color: #3b82f6; }
    &.total { background: rgba(139, 92, 246, 0.1); color: #8b5cf6; }
    &.cost { background: rgba(245, 158, 11, 0.1); color: #f59e0b; }
  }

  .stat-info {
    display: flex;
    flex-direction: column;
    gap: 2px;

    .stat-label {
      font-size: 0.75rem;
      font-weight: 600;
      color: var(--normal-text-color);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .stat-value {
      font-size: 1.25rem;
      font-weight: 800;
      color: var(--header-text-color);
    }
  }
}

/* Content Grid */
.content-grid {
  display: grid;
  grid-template-columns: 1.5fr 1fr;
  gap: 1.5rem;
  flex: 1;
  min-height: 0;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
    flex: none;
    min-height: auto;
  }
}

.settings-column, .visuals-column {
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.config-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.chart-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;

  @media (max-width: 1024px) {
    flex: none;
    min-height: 400px;
  }
}

.glass-card {
  background: var(--input-background-color);
  border: 1px solid var(--border-color);
  border-radius: 20px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.04);
}

.panel-header {
  padding: 1.5rem 1.5rem 0.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-shrink: 0;

  h2 {
    font-size: 1.1rem;
    font-weight: 700;
    margin: 0;
    color: var(--header-text-color);
    display: flex;
    align-items: center;
    gap: 10px;

    svg {
      color: var(--primary-green-color);
      font-size: 0.9rem;
    }
  }

  .period-badge {
    padding: 4px 10px;
    background: var(--input-background-color);
    border: 1px solid var(--border-color);
    border-radius: 20px;
    font-size: 0.7rem;
    font-weight: 600;
    color: var(--normal-text-color);
  }
}

/* Form Styles */
.settings-form {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  flex: 1;
  overflow-y: auto;

  @media (max-width: 1024px) {
    overflow-y: visible;
    flex: none;
  }
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;

  label {
    font-size: 0.9rem;
    font-weight: 600;
    color: var(--header-text-color);
    display: flex;
    align-items: center;
    gap: 6px;

    .info-icon {
      font-size: 0.8rem;
      opacity: 0.4;
      cursor: help;
      &:hover { opacity: 1; color: var(--primary-green-color); }
    }
  }

  .input-wrapper-ui {
    position: relative;
    display: flex;
    align-items: center;
    width: 100%;

    .input-icon-ui {
      position: absolute;
      left: 14px;
      font-size: 0.9rem;
      color: var(--normal-text-color);
      opacity: 0.5;
      z-index: 2;
    }

    :deep(.ui-select) {
      .select-trigger {
        padding-left: 40px;
        height: 48px;
        border-radius: 14px;
        background: var(--background-color-soft);
        border: 1px solid var(--border-color);

        &:focus {
          background: var(--background-color);
          box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.08);
        }
      }
    }
  }

  .input-wrapper {
    position: relative;
    display: flex;
    align-items: center;

    .input-icon {
      position: absolute;
      left: 14px;
      font-size: 1rem;
      color: var(--normal-text-color);
      opacity: 0.5;
    }

    input {
      width: 100%;
      padding: 12px 16px 12px 42px;
      border-radius: 14px;
      border: 1px solid var(--border-color);
      background: var(--background-color-soft);
      color: var(--header-text-color);
      font-size: 0.95rem;
      transition: all 0.2s;

      &:focus {
        border-color: var(--primary-green-color);
        background: var(--background-color);
        box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.08);
        outline: none;
      }
    }
  }

  .field-desc {
    margin: 0;
    font-size: 0.75rem;
    color: var(--normal-text-color);
    opacity: 0.7;
  }
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 0.5rem;

  .save-btn {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 12px 28px;
    background: var(--primary-green-color);
    color: white;
    border: none;
    box-shadow: none;
    border-radius: 14px;
    font-weight: 700;
    font-size: 0.9rem;
    cursor: pointer;
    transition: all 0.2s;

    &:hover:not(:disabled) {
      filter: brightness(1.05);
    }

    &:active:not(:disabled) {
      transform: translateY(0);
    }

    &:disabled {
      opacity: 0.7;
      cursor: not-allowed;
    }
  }
}

/* Chart Panel */
.chart-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.chart-container, .chart-container-skel {
  flex: 1;
  padding: 1rem 1.5rem;
  min-height: 250px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.quota-info, .quota-info-skel {
  padding: 0 1.5rem 1.5rem;
  flex-shrink: 0;
  width: 100%;
  
  .quota-header {
    display: flex;
    justify-content: space-between;
    margin-bottom: 10px;

    .quota-label { font-size: 0.85rem; font-weight: 700; color: var(--header-text-color); }
    .quota-status { 
      font-size: 0.7rem; 
      font-weight: 800; 
      text-transform: uppercase;
      &.success { color: #10b981; }
    }
  }

  .quota-bar-wrap {
    height: 8px;
    background: var(--background-color-soft);
    border-radius: 4px;
    overflow: hidden;
    margin-bottom: 8px;

    .quota-bar {
      height: 100%;
      background: linear-gradient(90deg, #10b981, #3b82f6);
      border-radius: 4px;
    }
  }

  .quota-footer {
    display: flex;
    justify-content: space-between;
    font-size: 0.75rem;
    font-weight: 600;
    color: var(--normal-text-color);
    opacity: 0.8;
  }
}

/* Tooltip */
.config-tooltip {
  position: fixed;
  transform: translateX(-50%) translateY(-100%);
  padding: 10px 14px;
  background: var(--background-color);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  color: var(--header-text-color);
  font-size: 0.75rem;
  font-weight: 500;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  pointer-events: none;
  max-width: 200px;
  text-align: center;

  &::after {
    content: '';
    position: absolute;
    top: 100%;
    left: 50%;
    transform: translateX(-50%);
    border: 6px solid transparent;
    border-top-color: var(--border-color);
  }
}

.mx-auto { margin-left: auto; margin-right: auto; }
.mt-6 { margin-top: 1.5rem; }
</style>
