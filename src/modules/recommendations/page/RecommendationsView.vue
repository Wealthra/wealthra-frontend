<template>
  <div class="recommendations-view">
    <!-- Module Container -->
    <div class="module-container">
      <!-- Module Header: Clean & Modern -->
      <div class="module-header">
        <div class="header-left">
          <div class="title-with-icon">
            <div class="icon-circle">
              <font-awesome-icon icon="shield" />
            </div>
            <div class="title-group">
              <h2 class="section-title">{{ t.signals }}</h2>
              <p class="section-subtitle">{{ t.subtitle }}</p>
            </div>
          </div>
          <span v-if="!isLoading" class="count-badge">
            {{ recommendationData?.signals.length || 0 }}
          </span>
          <UISkeletonLoader v-else width="24px" height="24px" border-radius="50%" />
        </div>

        <div class="header-right">
          <div class="date-selector-premium">
            <div class="selector-icon">
              <font-awesome-icon icon="calendar" />
            </div>

            <div class="selector-controls">
              <select
                v-model="selectedMonth"
                @change="fetchRecommendations"
                class="premium-select"
                :disabled="isLoading"
              >
                <option v-for="(m, idx) in months" :key="idx" :value="idx + 1">{{ m }}</option>
              </select>

              <span class="selector-divider"></span>

              <select
                v-model="selectedYear"
                @change="fetchRecommendations"
                class="premium-select year"
                :disabled="isLoading"
              >
                <option v-for="y in dynamicYears" :key="y" :value="y">{{ y }}</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <!-- Content Area -->
      <div v-if="isLoading" class="recommendations-grid skeleton-grid">
        <!-- Skeleton Signals -->
        <div class="grid-col-primary">
          <div v-for="i in 3" :key="'skel-sig-' + i" class="signal-card-skeleton">
            <div class="skel-top">
              <UISkeletonLoader width="40px" height="40px" border-radius="12px" />
              <div class="skel-info">
                <UISkeletonLoader width="140px" height="18px" />
                <UISkeletonLoader width="100px" height="12px" />
              </div>
            </div>
            <UISkeletonLoader height="60px" border-radius="12px" />
          </div>
        </div>

        <!-- Skeleton Insights -->
        <div class="grid-col-secondary">
          <div v-for="i in 2" :key="'skel-ins-' + i" class="side-module">
            <UISkeletonLoader width="120px" height="20px" style="margin-bottom: 20px" />
            <div v-for="j in 2" :key="'skel-item-' + j" class="skeleton-mini-card">
              <UISkeletonLoader width="100%" height="60px" border-radius="12px" />
            </div>
          </div>
        </div>
      </div>

      <div v-else-if="recommendationData" class="recommendations-grid">
        <!-- Left Column: Active Signals -->
        <div class="grid-col-primary">
          <div v-if="recommendationData.signals && recommendationData.signals.length > 0" class="signals-stack">
            <div
              v-for="(signal, idx) in recommendationData.signals"
              :key="idx"
              class="premium-signal-card"
              :style="{ '--delay': idx * 0.1 + 's' }"
            >
              <div class="card-status-line" :class="signal.severity"></div>

              <div class="card-main-content">
                <div class="signal-visual">
                  <div class="icon-box" :class="signal.severity">
                    <font-awesome-icon :icon="getSeverityIcon(signal.severity)" />
                  </div>
                </div>

                <div class="signal-details">
                  <div class="signal-title-row">
                    <h3 class="signal-reason">{{ signal.reasonCode }}</h3>
                    <div class="badge-group">
                      <span class="severity-pill" :class="signal.severity">
                        {{ t.severities[signal.severity] }}
                      </span>
                    </div>
                  </div>

                  <p class="signal-meta">
                    <span class="category">{{ signal.categoryName }}</span>
                    <span class="meta-dot">•</span>
                    <span class="source">{{ t.source }}: {{ signal.source }}</span>
                  </p>

                  <div class="evidence-container">
                    <div class="evidence-quote">
                      <p class="evidence-text">
                        <span class="evidence-lead">{{ t.evidence }}:</span>
                        {{ signal.evidence }}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Empty State for Signals -->
          <div v-else class="section-empty-state">
            <div class="empty-icon-wrap blue">
              <font-awesome-icon icon="signal" />
            </div>
            <h3 class="empty-heading">{{ t.noSignalsTitle }}</h3>
            <p class="empty-text">{{ t.noSignalsText }}</p>
          </div>
        </div>

        <!-- Right Column: Suggestions & Tips -->
        <div class="grid-col-secondary">
          <!-- Collaborative Suggestions -->
          <section class="side-module">
            <div class="module-header-small">
              <font-awesome-icon icon="users" class="accent-blue" />
              <h4>{{ t.suggestions }}</h4>
            </div>

            <div v-if="recommendationData.collaborativeSuggestions && recommendationData.collaborativeSuggestions.length > 0" class="suggestions-list">
              <div
                v-for="(suggestion, idx) in recommendationData.collaborativeSuggestions"
                :key="idx"
                class="suggestion-item-premium"
                :style="{ '--delay': (idx + 3) * 0.1 + 's' }"
              >
                <div class="suggestion-header">
                  <span class="suggestion-name">{{ suggestion.categoryName }}</span>
                  <span class="match-score">{{ Math.round(suggestion.score * 100) }}%</span>
                </div>
                <p class="suggestion-desc">{{ suggestion.evidence }}</p>
                <div class="progress-container">
                  <div class="progress-bar" :style="{ width: suggestion.score * 100 + '%' }"></div>
                </div>
              </div>
            </div>

            <!-- Empty State for Suggestions -->
            <div v-else class="section-empty-state side">
              <div class="empty-icon-wrap blue small">
                <font-awesome-icon icon="users" />
              </div>
              <h4 class="empty-heading small">{{ t.noSuggestionsTitle }}</h4>
              <p class="empty-text small">{{ t.noSuggestionsText }}</p>
            </div>
          </section>

          <!-- Semantic Tips -->
          <section class="side-module">
            <div class="module-header-small">
              <font-awesome-icon icon="lightbulb" class="accent-emerald" />
              <h4>{{ t.tips }}</h4>
            </div>

            <div v-if="recommendationData.semanticTips && recommendationData.semanticTips.length > 0" class="tips-stack">
              <div
                v-for="(tip, idx) in recommendationData.semanticTips"
                :key="idx"
                class="tip-card-premium"
                :style="{ '--delay': (idx + 5) * 0.1 + 's' }"
              >
                <div class="tip-glow-icon">
                  <font-awesome-icon icon="lightbulb" />
                </div>
                <div class="tip-content">
                  <h5 class="tip-topic">{{ tip.topic }}</h5>
                  <p class="tip-body">{{ tip.body }}</p>
                </div>
              </div>
            </div>

            <!-- Empty State for Tips -->
            <div v-else class="section-empty-state side">
              <div class="empty-icon-wrap emerald small">
                <font-awesome-icon icon="lightbulb" />
              </div>
              <h4 class="empty-heading small">{{ t.noTipsTitle }}</h4>
              <p class="empty-text small">{{ t.noTipsText }}</p>
            </div>
          </section>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="empty-state-container">
        <div class="empty-visual">
          <font-awesome-icon icon="box-open" />
        </div>
        <h3>{{ t.noDataTitle }}</h3>
        <p>{{ t.noDataText }}</p>
        <button class="cta-button-premium" @click="fetchRecommendations">
          <span>{{ t.generateNow }}</span>
          <font-awesome-icon icon="rotate-right" />
        </button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, onBeforeUnmount, ref, computed } from 'vue'
import { recommendationService } from '@/services/api/recommendation/recommendation.service'
import type { PersonalizedRecommendationResponse } from '@/services/api/recommendation/recommendation.models'
import UISkeletonLoader from '@/components/UISkeletonLoader.vue'

export default defineComponent({
  name: 'RecommendationsView',
  components: {
    UISkeletonLoader,
  },
  props: {
    selectedLanguage: {
      type: String,
      default: 'English',
    },
  },
  setup(props) {
    const selectedYear = ref(new Date().getFullYear())
    const selectedMonth = ref(new Date().getMonth() + 1)
    const isLoading = ref(false)
    const recommendationData = ref<PersonalizedRecommendationResponse | null>(null)

    const dynamicYears = computed(() => {
      const current = new Date().getFullYear()
      const yearsArr = []
      for (let i = current + 2; i >= 2020; i--) {
        yearsArr.push(i)
      }
      return yearsArr
    })

    const months = computed(() => {
      return props.selectedLanguage === 'Turkish'
        ? [
            'Ocak',
            'Şubat',
            'Mart',
            'Nisan',
            'Mayıs',
            'Haziran',
            'Temmuz',
            'Ağustos',
            'Eylül',
            'Ekim',
            'Kasım',
            'Aralık',
          ]
        : [
            'January',
            'February',
            'March',
            'April',
            'May',
            'June',
            'July',
            'August',
            'September',
            'October',
            'November',
            'December',
          ]
    })

    const t = computed(() => {
      const isTr = props.selectedLanguage === 'Turkish'
      return {
        title: isTr ? 'Sistem Analizi' : 'System Analysis',
        subtitle: isTr
          ? 'Finansal alışkanlıklarınızın derinlemesine analizi'
          : 'Deep dive into your financial habits',
        loadingText: isTr ? 'Veriler getiriliyor...' : 'Fetching data...',
        signals: isTr ? 'Aktif Sinyaller' : 'Active Signals',
        suggestions: isTr ? 'Ortak Öneriler' : 'Collaborative Suggestions',
        tips: isTr ? 'Akıllı İpuçları' : 'Smart Tips',
        source: isTr ? 'Kaynak' : 'Source',
        evidence: isTr ? 'Analiz' : 'Analysis',
        match: isTr ? 'Uyum' : 'Match',
        triggeredBy: isTr ? 'Tetikleyen' : 'Triggered by',
        noDataTitle: isTr ? 'Henüz Analiz Yok' : 'No Analysis Yet',
        noDataText: isTr
          ? 'Finansal sağlığınızı optimize etmek için yapay zeka analizini başlatın.'
          : 'Start AI analysis to optimize your financial health.',
        generateNow: isTr ? 'Analizi Başlat' : 'Start Analysis',
        details: isTr ? 'Detaylar' : 'Details',
        noSignalsTitle: isTr ? 'Sinyal Bulunamadı' : 'No Signals Found',
        noSignalsText: isTr
          ? 'Bu dönem için aktif bir finansal sinyal tespit edilmedi.'
          : 'No active financial signals detected for this period.',
        noSuggestionsTitle: isTr ? 'Öneri Yok' : 'No Suggestions',
        noSuggestionsText: isTr
          ? 'Henüz size özel bir ortak öneri oluşturulmadı.'
          : 'No personalized collaborative suggestions generated yet.',
        noTipsTitle: isTr ? 'İpucu Bulunmuyor' : 'No Tips Available',
        noTipsText: isTr
          ? 'Şu an için paylaşılacak akıllı bir ipucu bulunmamaktadır.'
          : 'There are no smart tips to share at the moment.',
        severities: {
          critical: isTr ? 'Kritik' : 'Critical',
          high: isTr ? 'Yüksek' : 'High',
          medium: isTr ? 'Orta' : 'Medium',
          low: isTr ? 'Düşük' : 'Low',
        },
      }
    })

    const getSeverityIcon = (severity: string) => {
      switch (severity) {
        case 'critical':
          return 'shield'
        case 'high':
          return 'triangle-exclamation'
        case 'medium':
          return 'circle-exclamation'
        case 'low':
          return 'circle-info'
        default:
          return 'chart-line'
      }
    }

    const setDummyData = () => {
      recommendationData.value = {
        signals: [
          {
            reasonCode: 'MONTH_OVER_MONTH_SPIKE',
            categoryName: 'Food & Dining',
            severity: 'high',
            source: 'heuristic',
            evidence: "'Food & Dining' harcaması geçen aya göre %111.5 arttı.",
          },
          {
            reasonCode: 'UNUSUAL_SUBSCRIPTION',
            categoryName: 'Services',
            severity: 'medium',
            source: 'ai_model',
            evidence: 'Yeni bir abonelik tespit edildi: "Cloud Storage Premium".',
          },
        ],
        collaborativeSuggestions: [
          {
            categoryName: 'Entertainment',
            score: 0.88,
            evidence: 'Sizinle benzer harcama alışkanlıklarına sahip kullanıcılar yıllık abonelikle %20 tasarruf etti.',
          },
          {
            categoryName: 'Transportation',
            score: 0.72,
            evidence: 'Toplu taşıma kartı kullanımı, benzer profillerde taksi masrafını %40 azalttı.',
          },
        ],
        semanticTips: [
          {
            topic: 'Haftalık Bütçe Hatırlatıcı',
            body: 'Haftalık bütçenizin %80\'ine ulaştınız. Harcamalarınızı gözden geçirmek isteyebilirsiniz.',
          },
          {
            topic: 'Tasarruf Fırsatı',
            body: 'Market alışverişlerinizi hafta içi akşam saatlerinde yapmak ortalama %5 daha ucuz.',
          },
        ],
      } as any
    }

    const fetchRecommendations = async () => {
      isLoading.value = true
      const startTime = Date.now()
      try {
        const data = await recommendationService.getPersonalized(
          selectedYear.value,
          selectedMonth.value
        )
        if (
          !data ||
          ((!data.signals || data.signals.length === 0) &&
            (!data.collaborativeSuggestions || data.collaborativeSuggestions.length === 0) &&
            (!data.semanticTips || data.semanticTips.length === 0))
        ) {
          // If no data returned, show dummy data for demo
          setDummyData()
        } else {
          recommendationData.value = data
        }
      } catch (error) {
        console.error('Error fetching recommendations:', error)
        setDummyData() // Fallback to dummy on error too
      } finally {
        const elapsed = Date.now() - startTime
        const minTime = 800
        if (elapsed < minTime) {
          setTimeout(() => {
            isLoading.value = false
          }, minTime - elapsed)
        } else {
          isLoading.value = false
        }
      }
    }

    onMounted(() => {
      fetchRecommendations()
      window.addEventListener('app:refetch', fetchRecommendations)
    })

    onBeforeUnmount(() => {
      window.removeEventListener('app:refetch', fetchRecommendations)
    })

    return {
      selectedYear,
      selectedMonth,
      isLoading,
      recommendationData,
      dynamicYears,
      months,
      t,
      fetchRecommendations,
      getSeverityIcon,
    }
  },
})
</script>

<style scoped lang="scss">
.recommendations-view {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  animation: fadeIn 0.5s ease-out;
}

/* Module Container */
.module-container {
  background: var(--background-color);
  border-radius: 16px;
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  flex: 1;
  min-height: 0;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.02);
}

/* Header Redesign */
.module-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--border-color);

  .header-left {
    display: flex;
    align-items: center;
    gap: 1rem;

    .title-with-icon {
      display: flex;
      align-items: center;
      gap: 0.85rem;

      .icon-circle {
        width: 36px;
        height: 36px;
        background: var(--background-color-soft);
        border-radius: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1rem;
        color: var(--primary-blue-color);
      }

      .section-title {
        font-size: 1.1rem;
        font-weight: 800;
        color: var(--header-text-color);
        margin: 0;
        letter-spacing: -0.02em;
      }

      .section-subtitle {
        font-size: 0.8rem;
        color: var(--normal-text-color);
        opacity: 0.6;
        margin: 0;
      }
    }

    .count-badge {
      font-size: 0.75rem;
      background: var(--primary-blue-color);
      color: white;
      padding: 2px 10px;
      border-radius: 20px;
      font-weight: 700;
    }
  }
}

/* Premium Date Selector */
.date-selector-premium {
  display: flex;
  align-items: center;
  background: var(--background-color-soft);
  padding: 0.4rem 0.85rem;
  border-radius: 10px;
  border: 1px solid var(--border-color);
  transition: all 0.2s ease;

  &:focus-within {
    border-color: var(--primary-blue-color);
    box-shadow: 0 0 0 3px rgba(133, 193, 233, 0.1);
  }

  .selector-icon {
    font-size: 0.85rem;
    color: var(--normal-text-color);
    margin-right: 0.6rem;
    opacity: 0.5;
  }

  .selector-controls {
    display: flex;
    align-items: center;

    .premium-select {
      background: transparent;
      border: none;
      color: var(--header-text-color);
      font-size: 0.85rem;
      font-weight: 600;
      cursor: pointer;
      outline: none;
      padding: 0 0.2rem;

      &.year {
        width: 60px;
      }
    }

    .selector-divider {
      width: 1px;
      height: 12px;
      background: var(--border-color);
      margin: 0 0.6rem;
    }
  }
}

/* Grid Layout */
.recommendations-grid {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: 1.5rem;
  flex: 1;
  overflow-y: auto;
  min-height: 0;
  padding-right: 0.5rem;
}

.grid-col-primary {
  grid-column: span 8;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.grid-col-secondary {
  grid-column: span 4;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  min-height: 0;
}

/* Premium Signal Cards */
.signals-stack {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding-right: 0.5rem;
}

.premium-signal-card {
  position: relative;
  background: var(--background-color);
  border: 0.5px solid var(--border-color);
  border-radius: 0 14px 14px 0; /* Square left corners for status line integration */
  padding: 1.15rem;
  display: flex;
  align-items: center;
  gap: 0.85rem;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
  opacity: 0;
  animation: slideUp 0.5s ease-out forwards;
  animation-delay: var(--delay);

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.05);
    /* Removed blue border hover to keep it cleaner */
  }

  .card-status-line {
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 4px;

    &.critical {
      background: #ef4444;
    }
    &.high {
      background: #f97316;
    }
    &.medium {
      background: #eab308;
    }
    &.low {
      background: #3b82f6;
    }
  }

  .card-main-content {
    display: flex;
    gap: 1.5rem;
    flex: 1;
    align-items: flex-start;
  }

  .signal-visual {
    .icon-box {
      width: 40px;
      height: 40px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.1rem;

      &.critical {
        background: #fee2e2;
        color: #ef4444;
      }
      &.high {
        background: #ffedd5;
        color: #f97316;
      }
      &.medium {
        background: #fef9c3;
        color: #eab308;
      }
      &.low {
        background: #dbeafe;
        color: #3b82f6;
      }
    }
  }

  .signal-details {
    flex: 1;

    .signal-title-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.2rem;

      .signal-reason {
        font-size: 0.95rem;
        font-weight: 700;
        color: var(--header-text-color);
        margin: 0;
      }
    }

    .severity-pill {
      font-size: 0.6rem;
      font-weight: 800;
      padding: 1px 6px;
      border-radius: 5px;
      text-transform: uppercase;
      letter-spacing: 0.05em;

      &.critical {
        background: rgba(239, 68, 68, 0.1);
        color: #ef4444;
      }
      &.high {
        background: rgba(249, 115, 22, 0.1);
        color: #f97316;
      }
      &.medium {
        background: rgba(234, 179, 8, 0.1);
        color: #eab308;
      }
      &.low {
        background: rgba(59, 130, 246, 0.1);
        color: #3b82f6;
      }
    }

    .signal-meta {
      font-size: 0.8rem;
      color: var(--normal-text-color);
      margin: 0 0 0.85rem 0;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      opacity: 0.7;

      .meta-dot {
        font-size: 0.4rem;
        opacity: 0.5;
      }
    }

    .evidence-container {
      background: var(--background-color-soft);
      border-radius: 10px;
      padding: 0.65rem 0.85rem;

      .evidence-text {
        font-size: 0.8rem;
        line-height: 1.4;
        color: var(--header-text-color);
        margin: 0;

        .evidence-lead {
          font-weight: 700;
          color: var(--normal-text-color);
          margin-right: 4px;
        }
      }
    }
  }

  .card-actions {
    .action-circle-btn {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      border: 1px solid var(--border-color);
      background: transparent;
      color: var(--normal-text-color);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.2s ease;

      &:hover {
        background: var(--primary-blue-color);
        border-color: var(--primary-blue-color);
        color: white;
      }
    }
  }
}

/* Side Modules */
.side-module {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  
  .module-header-small {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    margin-bottom: 1rem;

    font-size: 0.8rem;
    font-weight: 700;
    color: var(--header-text-color);

    h4 {
      margin: 0;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .accent-blue {
      color: var(--primary-blue-color);
    }
    .accent-emerald {
      color: #10b981;
    }
  }
}

/* Suggestions Premium */
.suggestions-list {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding-right: 4px;
}

.suggestion-item-premium {
  background: var(--background-color-soft);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 1rem;
  opacity: 0;
  animation: slideUp 0.5s ease-out forwards;
  animation-delay: var(--delay);
  transition: all 0.2s ease;

  &:hover {
    border-color: var(--primary-blue-color);
    transform: translateX(4px);
  }

  .suggestion-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.4rem;

    .suggestion-name {
      font-size: 0.85rem;
      font-weight: 700;
      color: var(--header-text-color);
    }

    .match-score {
      font-size: 0.65rem;
      font-weight: 800;
      color: var(--primary-blue-color);
      background: rgba(133, 193, 233, 0.1);
      padding: 1px 5px;
      border-radius: 5px;
    }
  }

  .suggestion-desc {
    font-size: 0.75rem;
    color: var(--normal-text-color);
    line-height: 1.4;
    margin-bottom: 0.85rem;
  }

  .progress-container {
    height: 4px;
    background: var(--background-color-soft);
    border-radius: 10px;
    overflow: hidden;

    .progress-bar {
      height: 100%;
      background: linear-gradient(90deg, var(--primary-blue-color), #6a82fb);
      border-radius: 10px;
    }
  }
}

/* Tips Premium */
.tips-stack {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding-right: 4px;
}

.tip-card-premium {
  display: flex;
  gap: 0.85rem;
  background: var(--background-color-soft);
  border-radius: 14px;
  padding: 1rem;
  border: 1px solid var(--border-color);
  opacity: 0;
  animation: slideUp 0.5s ease-out forwards;
  animation-delay: var(--delay);
  transition: all 0.2s ease;

  &:hover {
    border-color: #10b981;
    transform: translateX(4px);
  }

  .tip-glow-icon {
    width: 32px;
    height: 32px;
    background: var(--background-color);
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #10b981;
    font-size: 0.9rem;
    box-shadow: 0 4px 10px rgba(16, 185, 129, 0.1);
    flex-shrink: 0;
  }

  .tip-topic {
    font-size: 0.85rem;
    font-weight: 700;
    color: #064e3b;
    margin: 0 0 0.2rem 0;
  }

  .tip-body {
    font-size: 0.75rem;
    color: #065f46;
    line-height: 1.4;
    margin: 0;
  }
}

/* Main Module Empty State */
.empty-state-container {
  padding: 5rem 2rem;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;

  .empty-visual {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 5.5rem;
    height: 5.5rem;
    border-radius: 50%;
    background-color: var(--background-color-soft);
    color: var(--border-color);
    font-size: 2.5rem;
    margin-bottom: 1.5rem;
    border: 1px dashed var(--border-color);
  }

  h3 {
    font-size: 1.375rem;
    font-weight: 700;
    color: var(--header-text-color);
    margin-bottom: 0.75rem;
  }
  p {
    font-size: 1rem;
    color: var(--normal-text-color);
    opacity: 0.7;
    max-width: 320px;
    margin-bottom: 2rem;
    line-height: 1.5;
  }
}

/* Section Empty States (Copy of Income Style) */
.section-empty-state {
  flex: 1;
  min-height: 20rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 100%;
  text-align: center;
  padding: 2rem;
  background: var(--background-color-soft);
  border-radius: 16px;
  border: 1px dashed var(--border-color);

  &.side {
    min-height: 12rem;
    padding: 1.5rem 1rem;
    border-radius: 14px;
  }

  .empty-icon-wrap {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 4.5rem;
    height: 4.5rem;
    border-radius: 50%;
    margin-bottom: 1.25rem;
    font-size: 2rem;

    &.blue {
      background-color: rgba(133, 193, 233, 0.12);
      color: var(--primary-blue-color);
    }
    &.emerald {
      background-color: rgba(16, 185, 129, 0.12);
      color: #10b981;
    }

    &.small {
      width: 3.5rem;
      height: 3.5rem;
      font-size: 1.5rem;
      margin-bottom: 1rem;
    }
  }

  .empty-heading {
    margin: 0 0 0.5rem;
    font-size: 1.15rem;
    font-weight: 700;
    color: var(--header-text-color);

    &.small {
      font-size: 0.95rem;
      margin-bottom: 0.35rem;
    }
  }

  .empty-text {
    margin: 0;
    font-size: 0.85rem;
    font-weight: 400;
    color: var(--normal-text-color);
    max-width: 18rem;
    line-height: 1.5;

    &.small {
      font-size: 0.75rem;
      max-width: 14rem;
    }
  }
}

.cta-button-premium {
  background: var(--header-text-color);
  color: white;
  border: none;
  padding: 12px 32px;
  border-radius: 12px;
  font-weight: 700;
  font-size: 1rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
    filter: brightness(1.2);
  }
}

/* Animations */
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Skeleton Loading Helpers */
.signal-card-skeleton {
  background: var(--background-color);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  padding: 1.5rem;
  margin-bottom: 1.25rem;
  .skel-top {
    display: flex;
    gap: 1rem;
    margin-bottom: 1rem;
    .skel-info {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }
  }
}

.skeleton-mini-card {
  height: 100px;
  background: var(--background-color-soft);
  border-radius: 14px;
  margin-bottom: 0.75rem;
}

@media (max-width: 1200px) {
  .recommendations-grid {
    grid-template-columns: 1fr;
  }
  .grid-col-primary,
  .grid-col-secondary {
    grid-column: span 12;
  }
}
</style>
