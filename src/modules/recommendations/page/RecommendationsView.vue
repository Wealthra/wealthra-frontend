<template>
  <div class="recommendations-view">
    <!-- Top Header / Filter -->
    <div class="recommendations-header">
      <div class="header-left">
        <h1 class="header-title">{{ t.title }}</h1>
        <p class="header-subtitle">{{ t.subtitle }}</p>
      </div>
      <div class="header-right">
        <div class="date-selectors">
          <div class="selector-group">
            <label>{{ t.year }}</label>
            <select v-model="selectedYear" @change="fetchRecommendations">
              <option v-for="y in years" :key="y" :value="y">{{ y }}</option>
            </select>
          </div>
          <div class="selector-group">
            <label>{{ t.month }}</label>
            <select v-model="selectedMonth" @change="fetchRecommendations">
              <option v-for="(m, idx) in months" :key="idx" :value="idx + 1">{{ m }}</option>
            </select>
          </div>
        </div>
        <button class="refresh-btn" @click="fetchRecommendations" :disabled="isLoading">
          <font-awesome-icon :icon="isLoading ? 'spinner' : 'rotate-right'" :spin="isLoading" />
          <span>{{ t.refresh }}</span>
        </button>
      </div>
    </div>

    <!-- Main Content -->
    <div v-if="isLoading && !recommendationData" class="loading-state">
      <div class="spinner"></div>
      <p>{{ t.loading }}</p>
    </div>

    <div v-else-if="recommendationData" class="recommendations-content">
      <!-- AI Summary Panel -->
      <div class="summary-panel glass-card">
        <div class="panel-header">
          <div class="ai-badge">
            <font-awesome-icon icon="robot" />
            <span>AI ANALYSIS</span>
          </div>
          <span class="analysis-date">{{ formatDate(recommendationData.analysisDate) }}</span>
        </div>
        <div class="summary-text" v-html="recommendationData.summary"></div>
      </div>

      <!-- Grid for Signals, Suggestions, Tips -->
      <div class="recommendations-grid">
        <!-- Personalized Signals -->
        <div class="grid-column">
          <div class="column-header">
            <font-awesome-icon icon="signal" class="column-icon" />
            <h3>{{ t.signals }}</h3>
          </div>
          <div class="signals-list">
            <div 
              v-for="(signal, idx) in recommendationData.signals" 
              :key="idx" 
              class="signal-card"
              :class="'signal--' + signal.type.toLowerCase()"
            >
              <div class="signal-header">
                <span class="signal-type">{{ signal.type }}</span>
                <span class="signal-impact">{{ signal.impact }}</span>
              </div>
              <h4 class="signal-title">{{ signal.title }}</h4>
              <p class="signal-desc">{{ signal.description }}</p>
            </div>
          </div>
        </div>

        <!-- Personalized Suggestions -->
        <div class="grid-column">
          <div class="column-header">
            <font-awesome-icon icon="lightbulb" class="column-icon" />
            <h3>{{ t.suggestions }}</h3>
          </div>
          <div class="suggestions-list">
            <div 
              v-for="(suggestion, idx) in recommendationData.suggestions" 
              :key="idx" 
              class="suggestion-card"
            >
              <div class="suggestion-header">
                <span class="suggestion-priority" :class="'priority--' + suggestion.priority.toLowerCase()">
                  {{ suggestion.priority }}
                </span>
                <span class="suggestion-category">{{ suggestion.category }}</span>
              </div>
              <h4 class="suggestion-title">{{ suggestion.title }}</h4>
              <p class="suggestion-desc">{{ suggestion.description }}</p>
              <button class="action-btn">{{ t.takeAction }}</button>
            </div>
          </div>
        </div>

        <!-- Personalized Tips -->
        <div class="grid-column">
          <div class="column-header">
            <font-awesome-icon icon="award" class="column-icon" />
            <h3>{{ t.tips }}</h3>
          </div>
          <div class="tips-list">
            <div 
              v-for="(tip, idx) in recommendationData.tips" 
              :key="idx" 
              class="tip-card"
            >
              <h4 class="tip-title">{{ tip.title }}</h4>
              <p class="tip-content">{{ tip.content }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="empty-state">
      <font-awesome-icon icon="box-open" class="empty-icon" />
      <h3>{{ t.noDataTitle }}</h3>
      <p>{{ t.noDataText }}</p>
      <button class="primary-btn" @click="fetchRecommendations">{{ t.generateNow }}</button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref, computed } from 'vue'
import { recommendationService } from '@/services/api/recommendation/recommendation.service'
import type { PersonalizedRecommendationResponse } from '@/services/api/recommendation/recommendation.models'

export default defineComponent({
  name: 'RecommendationsView',
  props: {
    selectedLanguage: {
      type: String,
      default: 'English'
    }
  },
  setup(props) {
    const selectedYear = ref(new Date().getFullYear())
    const selectedMonth = ref(new Date().getMonth() + 1)
    const isLoading = ref(false)
    const recommendationData = ref<PersonalizedRecommendationResponse | null>(null)

    const years = [2024, 2025, 2026]
    const months = computed(() => {
      return props.selectedLanguage === 'Turkish'
        ? ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık']
        : ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
    })

    const t = computed(() => {
      const isTr = props.selectedLanguage === 'Turkish'
      return {
        title: isTr ? 'AI Finansal Öneriler' : 'AI Financial Recommendations',
        subtitle: isTr ? 'Finansal sağlığınızı iyileştirmek için kişiselleştirilmiş içgörüler.' : 'Personalized insights to improve your financial health.',
        year: isTr ? 'Yıl' : 'Year',
        month: isTr ? 'Ay' : 'Month',
        refresh: isTr ? 'Yenile' : 'Refresh',
        loading: isTr ? 'Analiz ediliyor...' : 'Analyzing...',
        signals: isTr ? 'Sinyaller' : 'Signals',
        suggestions: isTr ? 'Öneriler' : 'Suggestions',
        tips: isTr ? 'İpuçları' : 'Tips',
        takeAction: isTr ? 'Harekete Geç' : 'Take Action',
        noDataTitle: isTr ? 'Henüz Öneri Yok' : 'No Recommendations Yet',
        noDataText: isTr ? 'Verilerinizi analiz etmek ve size özel öneriler sunmak için butona tıklayın.' : 'Click the button to analyze your data and get personalized suggestions.',
        generateNow: isTr ? 'Şimdi Oluştur' : 'Generate Now'
      }
    })

    const fetchRecommendations = async () => {
      isLoading.value = true
      try {
        recommendationData.value = await recommendationService.getPersonalized(selectedYear.value, selectedMonth.value)
      } catch (error) {
        console.error('Error fetching recommendations:', error)
      } finally {
        isLoading.value = false
      }
    }

    const formatDate = (dateStr: string) => {
      if (!dateStr) return ''
      const date = new Date(dateStr)
      return date.toLocaleDateString(props.selectedLanguage === 'Turkish' ? 'tr-TR' : 'en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    }

    onMounted(() => {
      fetchRecommendations()
    })

    return {
      selectedYear,
      selectedMonth,
      isLoading,
      recommendationData,
      years,
      months,
      t,
      fetchRecommendations,
      formatDate
    }
  }
})
</script>

<style scoped lang="scss">
.recommendations-view {
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding-bottom: 40px;
}

.recommendations-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;

  .header-title {
    font-size: 28px;
    font-weight: 700;
    color: var(--header-text-color);
    margin: 0;
  }

  .header-subtitle {
    font-size: 16px;
    color: var(--normal-text-color);
    margin: 4px 0 0 0;
  }

  .header-right {
    display: flex;
    align-items: flex-end;
    gap: 16px;
  }
}

.date-selectors {
  display: flex;
  gap: 12px;

  .selector-group {
    display: flex;
    flex-direction: column;
    gap: 4px;

    label {
      font-size: 12px;
      font-weight: 600;
      color: var(--normal-text-color);
      text-transform: uppercase;
    }

    select {
      padding: 8px 12px;
      border-radius: 8px;
      border: 1px solid var(--border-color);
      background: var(--background-color);
      color: var(--header-text-color);
      font-size: 14px;
      outline: none;

      &:focus {
        border-color: var(--primary-green-color);
      }
    }
  }
}

.refresh-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  border-radius: 8px;
  border: none;
  background: var(--primary-green-color);
  color: white;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s;

  &:hover:not(:disabled) {
    opacity: 0.9;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
}

.glass-card {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 24px;
}

.summary-panel {
  .panel-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;

    .ai-badge {
      display: flex;
      align-items: center;
      gap: 8px;
      background: linear-gradient(135deg, #00c853, #b2ff59);
      color: #000;
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 800;
    }

    .analysis-date {
      font-size: 12px;
      color: var(--normal-text-color);
    }
  }

  .summary-text {
    font-size: 18px;
    line-height: 1.6;
    color: var(--header-text-color);
  }
}

.recommendations-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
}

.grid-column {
  display: flex;
  flex-direction: column;
  gap: 16px;

  .column-header {
    display: flex;
    align-items: center;
    gap: 12px;
    
    .column-icon {
      font-size: 20px;
      color: var(--primary-green-color);
    }

    h3 {
      font-size: 18px;
      font-weight: 700;
      color: var(--header-text-color);
      margin: 0;
    }
  }
}

.signals-list, .suggestions-list, .tips-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.signal-card, .suggestion-card, .tip-card {
  background: var(--background-color);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 16px;
  transition: transform 0.2s;

  &:hover {
    transform: translateY(-4px);
    border-color: var(--primary-green-color);
  }
}

.signal-card {
  &.signal--positive { border-left: 4px solid #4caf50; }
  &.signal--negative { border-left: 4px solid #f44336; }
  &.signal--neutral { border-left: 4px solid #ffeb3b; }

  .signal-header {
    display: flex;
    justify-content: space-between;
    margin-bottom: 8px;

    .signal-type {
      font-size: 10px;
      font-weight: 800;
      text-transform: uppercase;
      padding: 2px 6px;
      border-radius: 4px;
      background: var(--hover-color);
    }

    .signal-impact {
      font-size: 11px;
      color: var(--normal-text-color);
    }
  }
}

.suggestion-card {
  .suggestion-header {
    display: flex;
    justify-content: space-between;
    margin-bottom: 8px;

    .suggestion-priority {
      font-size: 10px;
      font-weight: 800;
      text-transform: uppercase;
      padding: 2px 6px;
      border-radius: 4px;
      
      &.priority--high { background: rgba(244, 67, 54, 0.1); color: #f44336; }
      &.priority--medium { background: rgba(255, 193, 7, 0.1); color: #ffc107; }
      &.priority--low { background: rgba(76, 175, 80, 0.1); color: #4caf50; }
    }

    .suggestion-category {
      font-size: 11px;
      color: var(--normal-text-color);
    }
  }

  .action-btn {
    margin-top: 12px;
    width: 100%;
    padding: 8px;
    border-radius: 6px;
    border: 1px solid var(--primary-green-color);
    background: transparent;
    color: var(--primary-green-color);
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
      background: var(--primary-green-color);
      color: white;
    }
  }
}

.tip-card {
  .tip-title {
    margin-top: 0;
    color: var(--primary-green-color);
  }
}

.signal-title, .suggestion-title, .tip-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--header-text-color);
  margin: 0 0 8px 0;
}

.signal-desc, .suggestion-desc, .tip-content {
  font-size: 13px;
  line-height: 1.5;
  color: var(--normal-text-color);
  margin: 0;
}

.loading-state, .empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 0;
  text-align: center;

  .spinner {
    width: 40px;
    height: 40px;
    border: 4px solid var(--border-color);
    border-top-color: var(--primary-green-color);
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: 16px;
  }

  .empty-icon {
    font-size: 64px;
    color: var(--border-color);
    margin-bottom: 24px;
  }

  h3 {
    font-size: 24px;
    color: var(--header-text-color);
    margin-bottom: 8px;
  }

  p {
    font-size: 16px;
    color: var(--normal-text-color);
    max-width: 400px;
    margin-bottom: 32px;
  }
}

.primary-btn {
  padding: 12px 32px;
  border-radius: 8px;
  border: none;
  background: var(--primary-green-color);
  color: white;
  font-weight: 600;
  cursor: pointer;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@media (max-width: 1024px) {
  .recommendations-grid {
    grid-template-columns: 1fr;
  }
}
</style>
