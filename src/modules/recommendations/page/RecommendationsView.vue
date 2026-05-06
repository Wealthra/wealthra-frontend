<template>
  <div class="recommendations-view">
    <!-- Module Container -->
    <div class="module-container">
      <!-- Module Header -->
      <div class="module-header">
        <div class="header-left">
          <div class="title-with-icon">
            <div class="icon-circle">
              <font-awesome-icon icon="robot" />
            </div>
            <div class="title-group">
              <h2 class="section-title">{{ t.title }}</h2>
              <p class="section-subtitle">{{ t.subtitle }}</p>
            </div>
          </div>
        </div>

        <div class="header-right">
          <div class="date-selector-premium">
            <div class="selector-icon">
              <font-awesome-icon icon="calendar" />
            </div>

            <div class="selector-controls">
              <UISelect
                v-model="selectedMonth"
                :options="monthOptions"
                :disabled="isLoading"
                compact
                searchable
                class="premium-selector-dropdown"
              />

              <span class="selector-divider"></span>

              <UISelect
                v-model="selectedYear"
                :options="yearOptions"
                :disabled="isLoading"
                compact
                searchable
                class="premium-selector-dropdown year"
              />

            </div>
          </div>
        </div>
      </div>

      <!-- Scrollable Content Area -->
      <div class="content-wrapper">
        <!-- Content Area -->
        <div v-if="isLoading" class="recommendations-stack">
          <!-- Skeleton Section: Signals -->
          <section class="premium-section">
            <div class="section-header-carousel">
              <div class="header-left-group">
                <div class="icon-circle small skeleton-pulse"></div>
                <div class="skeleton-line h3 skeleton-pulse" style="width: 120px; margin: 0"></div>
                <div
                  class="premium-pagination-badge skeleton-pulse"
                  style="width: 45px; height: 22px; border: none"
                ></div>
              </div>
            </div>
            <div class="carousel-container">
              <div v-for="i in 3" :key="'sig-skel-' + i" class="carousel-item signal-width">
                <div class="premium-signal-card skeleton">
                  <div class="card-main-content">
                    <div class="signal-visual">
                      <div class="icon-box skeleton-pulse"></div>
                    </div>
                    <div class="signal-details">
                      <div class="signal-title-row">
                        <div class="skeleton-line h3 skeleton-pulse"></div>
                      </div>
                      <div class="skeleton-line meta skeleton-pulse"></div>
                      <div class="evidence-container">
                        <div class="skeleton-line full skeleton-pulse"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <!-- Skeleton Section: Suggestions -->
          <section class="premium-section">
            <div class="section-header-carousel">
              <div class="header-left-group">
                <div class="icon-circle small skeleton-pulse"></div>
                <div class="skeleton-line h3 skeleton-pulse" style="width: 140px; margin: 0"></div>
                <div
                  class="premium-pagination-badge skeleton-pulse"
                  style="width: 45px; height: 22px; border: none"
                ></div>
              </div>
            </div>
            <div class="carousel-container">
              <div v-for="i in 3" :key="'sug-skel-' + i" class="carousel-item full-width">
                <div class="suggestion-item-premium skeleton">
                  <div class="suggestion-header">
                    <div
                      class="skeleton-line h3 skeleton-pulse"
                      style="width: 180px; margin: 0"
                    ></div>
                    <div
                      class="skeleton-line pill skeleton-pulse"
                      style="width: 45px; height: 22px"
                    ></div>
                  </div>
                  <div style="margin: 1rem 0">
                    <div class="skeleton-line full skeleton-pulse"></div>
                  </div>
                  <div
                    class="progress-container skeleton-pulse"
                    style="
                      height: 8px;
                      border-radius: 4px;
                      background: var(--border-color);
                      opacity: 0.4;
                    "
                  ></div>
                </div>
              </div>
            </div>
          </section>

          <!-- Skeleton Section: Tips -->
          <section class="premium-section">
            <div class="section-header-carousel">
              <div class="header-left-group">
                <div class="icon-circle small skeleton-pulse"></div>
                <div class="skeleton-line h3 skeleton-pulse" style="width: 100px; margin: 0"></div>
                <div
                  class="premium-pagination-badge skeleton-pulse"
                  style="width: 45px; height: 22px; border: none"
                ></div>
              </div>
              <div class="carousel-nav-skeleton">
                <div class="nav-btn skeleton-pulse" style="border: none"></div>
                <div class="nav-btn skeleton-pulse" style="border: none"></div>
              </div>
            </div>
            <div class="carousel-container">
              <div v-for="i in 3" :key="'tip-skel-' + i" class="carousel-item full-width">
                <div class="tip-card-premium skeleton">
                  <div class="tip-glow-icon skeleton-pulse" style="border: none"></div>
                  <div class="tip-content">
                    <div
                      class="skeleton-line h3 skeleton-pulse"
                      style="width: 220px; margin-bottom: 0.6rem"
                    ></div>
                    <div class="skeleton-line full skeleton-pulse" style="width: 100%"></div>
                    <div
                      class="skeleton-line full skeleton-pulse"
                      style="width: 85%; margin-top: 4px"
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>

        <div v-else-if="recommendationData" class="recommendations-stack">
          <!-- Signals Section -->
          <section class="premium-section">
            <div class="section-header-carousel">
              <div class="header-left-group">
                <div class="icon-circle small emerald">
                  <font-awesome-icon icon="shield" />
                </div>
                <h3>{{ t.signals }}</h3>
                <div v-if="recommendationData.signals?.length" class="premium-pagination-badge">
                  <span class="current">{{ signalPage }}</span>
                  <span class="divider">/</span>
                  <span class="total">{{
                    getPages(recommendationData.signals, itemsPerPage)
                  }}</span>
                </div>
              </div>
              <div
                class="carousel-nav"
                v-if="recommendationData.signals?.length > itemsPerPage"
              >
                <button
                  class="nav-btn"
                  :disabled="signalPage === 1"
                  @click="scroll('signals', 'left')"
                >
                  <font-awesome-icon icon="chevron-left" />
                </button>
                <button
                  class="nav-btn"
                  :disabled="signalPage === getPages(recommendationData.signals, itemsPerPage)"
                  @click="scroll('signals', 'right')"
                >
                  <font-awesome-icon icon="chevron-right" />
                </button>
              </div>
            </div>

            <div
              v-if="recommendationData.signals && recommendationData.signals.length > 0"
              class="carousel-container"
              ref="signalsRef"
              @scroll="onScroll('signals')"
            >
              <div
                v-for="(signal, idx) in recommendationData.signals"
                :key="idx"
                class="carousel-item signal-width"
              >
                <div
                  class="premium-signal-card"
                  :class="signal.severity"
                  :style="{ '--delay': idx * 0.1 + 's' }"
                >
                  <div class="card-main-content">
                    <div class="signal-visual">
                      <div class="icon-box" :class="signal.severity">
                        <font-awesome-icon :icon="getSeverityIcon(signal.severity)" />
                      </div>
                    </div>

                    <div class="signal-details">
                      <div class="signal-title-row">
                        <h3 class="signal-reason">{{ formatReasonCode(signal.reasonCode) }}</h3>
                        <div class="badge-group">
                          <span class="severity-pill" :class="signal.severity">
                            {{ t.severities[signal.severity] }}
                          </span>
                        </div>
                      </div>

                      <p class="signal-meta">
                        <span class="category">{{ signal.categoryName }}</span>
                        <span class="meta-dot">•</span>
                        <span class="source"
                          >{{ t.source }}: {{ formatSource(signal.source) }}</span
                        >
                      </p>

                      <div class="evidence-container">
                        <p class="evidence-text">
                          <span class="evidence-lead">{{ t.evidence }}:</span>
                          {{ maskSensitiveText(signal.evidence) }}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Pagination Spacers -->
              <template v-if="recommendationData.signals?.length % itemsPerPage !== 0">
                <div
                  v-for="i in itemsPerPage - (recommendationData.signals.length % itemsPerPage)"
                  :key="'sig-spacer-' + i"
                  class="carousel-item signal-width spacer-item"
                ></div>
              </template>
            </div>

            <!-- Empty State for Signals -->
            <div v-else class="section-empty-state">
              <div class="empty-icon-wrap blue">
                <font-awesome-icon icon="signal" />
              </div>
              <h3 class="empty-heading">{{ t.noSignalsTitle }}</h3>
              <p class="empty-text">{{ t.noSignalsText }}</p>
            </div>
          </section>

          <!-- Suggestions Section -->
          <section class="premium-section">
            <div class="section-header-carousel">
              <div class="header-left-group">
                <div class="icon-circle small blue">
                  <font-awesome-icon icon="users" />
                </div>
                <h3>{{ t.suggestions }}</h3>
                <div
                  v-if="recommendationData.collaborativeSuggestions?.length"
                  class="premium-pagination-badge"
                >
                  <span class="current">{{ suggestionPage }}</span>
                  <span class="divider">/</span>
                  <span class="total">{{
                    recommendationData.collaborativeSuggestions.length
                  }}</span>
                </div>
              </div>
              <div
                class="carousel-nav"
                v-if="recommendationData.collaborativeSuggestions?.length > 1"
              >
                <button
                  class="nav-btn"
                  :disabled="suggestionPage === 1"
                  @click="scroll('suggestions', 'left')"
                >
                  <font-awesome-icon icon="chevron-left" />
                </button>
                <button
                  class="nav-btn"
                  :disabled="suggestionPage === recommendationData.collaborativeSuggestions.length"
                  @click="scroll('suggestions', 'right')"
                >
                  <font-awesome-icon icon="chevron-right" />
                </button>
              </div>
            </div>

            <div
              v-if="
                recommendationData.collaborativeSuggestions &&
                recommendationData.collaborativeSuggestions.length > 0
              "
              class="carousel-container"
              ref="suggestionsRef"
              @scroll="onScroll('suggestions')"
            >
              <div
                v-for="(suggestion, idx) in recommendationData.collaborativeSuggestions"
                :key="idx"
                class="suggestion-item-premium carousel-item full-width"
                :style="{ '--delay': (idx + 3) * 0.1 + 's' }"
              >
                <div class="suggestion-header">
                  <span class="suggestion-name">{{ suggestion.categoryName }}</span>
                  <span class="match-score">{{ isPrivacyMode ? '••%' : Math.round(suggestion.score * 100) + '%' }}</span>
                </div>
                <p class="suggestion-desc">{{ maskSensitiveText(suggestion.evidence) }}</p>
                <div class="progress-container">
                  <div class="progress-bar" :style="{ width: isPrivacyMode ? '0%' : (suggestion.score * 100 + '%') }"></div>
                </div>
              </div>
            </div>

            <div v-else class="section-empty-state side">
              <div class="empty-icon-wrap blue small">
                <font-awesome-icon icon="users" />
              </div>
              <h4 class="empty-heading small">{{ t.noSuggestionsTitle }}</h4>
              <p class="empty-text small">{{ t.noSuggestionsText }}</p>
            </div>
          </section>

          <!-- Tips Section -->
          <section class="premium-section">
            <div class="section-header-carousel">
              <div class="header-left-group">
                <div class="icon-circle small yellow">
                  <font-awesome-icon icon="lightbulb" />
                </div>
                <h3>{{ t.tips }}</h3>
                <div
                  v-if="recommendationData.semanticTips?.length"
                  class="premium-pagination-badge"
                >
                  <span class="current">{{ tipPage }}</span>
                  <span class="divider">/</span>
                  <span class="total">{{ recommendationData.semanticTips.length }}</span>
                </div>
              </div>
              <div class="carousel-nav" v-if="recommendationData.semanticTips?.length > 1">
                <button class="nav-btn" :disabled="tipPage === 1" @click="scroll('tips', 'left')">
                  <font-awesome-icon icon="chevron-left" />
                </button>
                <button
                  class="nav-btn"
                  :disabled="tipPage === recommendationData.semanticTips.length"
                  @click="scroll('tips', 'right')"
                >
                  <font-awesome-icon icon="chevron-right" />
                </button>
              </div>
            </div>

            <div
              v-if="recommendationData.semanticTips && recommendationData.semanticTips.length > 0"
              class="carousel-container"
              ref="tipsRef"
              @scroll="onScroll('tips')"
            >
              <div
                v-for="(tip, idx) in recommendationData.semanticTips"
                :key="idx"
                class="tip-card-premium carousel-item full-width"
                :style="{ '--delay': (idx + 5) * 0.1 + 's' }"
              >
                <div class="tip-glow-icon">
                  <font-awesome-icon icon="lightbulb" />
                </div>
                <div class="tip-content">
                  <h5 class="tip-topic">{{ tip.topic }}</h5>
                  <p class="tip-body">{{ maskSensitiveText(tip.body) }}</p>
                </div>
              </div>
            </div>

            <div v-else class="section-empty-state side">
              <div class="empty-icon-wrap emerald small">
                <font-awesome-icon icon="lightbulb" />
              </div>
              <h4 class="empty-heading small">{{ t.noTipsTitle }}</h4>
              <p class="empty-text small">{{ t.noTipsText }}</p>
            </div>
          </section>
        </div>

        <!-- Empty State (Inside Scroll Area) -->
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
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, onBeforeUnmount, ref, computed, watch, toRefs } from 'vue'
import dayjs from 'dayjs'
import { recommendationService } from '@/services/api/recommendation/recommendation.service'
import type { PersonalizedRecommendationResponse } from '@/services/api/recommendation/recommendation.models'
import UISkeletonLoader from '@/components/UISkeletonLoader.vue'
import UISelect from '@/components/UISelect.vue'
import { useCurrency } from '@/composables/useCurrency'

export default defineComponent({
  name: 'RecommendationsView',
  components: {
    UISkeletonLoader,
    UISelect,
  },
  props: {
    selectedLanguage: {
      type: String,
      default: 'English',
    },
  },
  setup(props) {
    const selectedYear = ref(dayjs().year())
    const selectedMonth = ref(dayjs().month() + 1)
    const isLoading = ref(true)
    const recommendationData = ref<PersonalizedRecommendationResponse | null>(null)
    const itemsPerPage = ref(3)

    const { currency, setCurrency, isPrivacyMode, maskSensitiveText } = useCurrency()

    const updateItemsPerPage = () => {
      const width = window.innerWidth
      if (width <= 640) {
        itemsPerPage.value = 1
      } else if (width <= 1024) {
        itemsPerPage.value = 2
      } else {
        itemsPerPage.value = 3
      }
    }

    const dynamicYears = computed(() => {
      const current = dayjs().year()
      const yearsArr = []
      // Going down to 1900 as a reasonable "lowest point" for date selection
      for (let i = current; i >= 1900; i--) {
        yearsArr.push(i)
      }
      return yearsArr
    })

    const monthOptions = computed(() => {
      return months.value.map((m, idx) => ({
        label: m,
        value: idx + 1,
      }))
    })

    const yearOptions = computed(() => dynamicYears.value)

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
          ? 'Seçilen dönem için aktif bir finansal sinyal tespit edilmedi.'
          : 'No active financial signals detected for the selected period.',
        noSuggestionsTitle: isTr ? 'Öneri Bulunmuyor' : 'No Suggestions',
        noSuggestionsText: isTr
          ? 'Seçilen dönem için size özel bir ortak öneri oluşturulmadı.'
          : 'No personalized collaborative suggestions generated for the selected period.',
        noTipsTitle: isTr ? 'İpucu Bulunmuyor' : 'No Tips Available',
        noTipsText: isTr
          ? 'Seçilen dönem için paylaşılacak akıllı bir ipucu bulunmamaktadır.'
          : 'There are no smart tips to share for the selected period.',
        severities: {
          critical: isTr ? 'Kritik' : 'Critical',
          high: isTr ? 'Yüksek' : 'High',
          medium: isTr ? 'Orta' : 'Medium',
          low: isTr ? 'Düşük' : 'Low',
        },
      }
    })

    const formatReasonCode = (code: string) => {
      if (!code) return ''
      return code
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ')
    }

    const formatSource = (source: string) => {
      if (!source) return ''
      return source
        .split('_')
        .map(word => {
          if (word.toLowerCase() === 'ai') return 'AI'
          return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
        })
        .join(' ')
    }


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



    const fetchRecommendations = async () => {
      isLoading.value = true
      recommendationData.value = null
      const startTime = Date.now()
      try {
        const langCode = props.selectedLanguage === 'Turkish' ? 'tr' : 'en'
        const data = await recommendationService.getPersonalized(
          selectedYear.value,
          selectedMonth.value,
          langCode,
          currency.value
        )
        recommendationData.value = data

      } catch (error) {
        console.error('Error fetching recommendations:', error)
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
      updateItemsPerPage()
      window.addEventListener('resize', updateItemsPerPage)
      fetchRecommendations()
      window.addEventListener('app:refetch', fetchRecommendations)
    })

    const { selectedLanguage: langProp } = toRefs(props)
    watch([selectedMonth, selectedYear, langProp, currency], () => {
      fetchRecommendations()
    })

    onBeforeUnmount(() => {
      window.removeEventListener('resize', updateItemsPerPage)
      window.removeEventListener('app:refetch', fetchRecommendations)
    })

    const signalsRef = ref<HTMLElement | null>(null)
    const suggestionsRef = ref<HTMLElement | null>(null)
    const tipsRef = ref<HTMLElement | null>(null)

    const signalPage = ref(1)
    const suggestionPage = ref(1)
    const tipPage = ref(1)

    const getPages = (items: any[], perPage: number) => {
      if (!items) return 0
      return Math.ceil(items.length / perPage)
    }

    const scroll = (type: 'signals' | 'suggestions' | 'tips', direction: 'left' | 'right') => {
      let el: HTMLElement | null = null
      let currentPageRef = signalPage

      if (type === 'signals') {
        el = signalsRef.value
        currentPageRef = signalPage
      } else if (type === 'suggestions') {
        el = suggestionsRef.value
        currentPageRef = suggestionPage
      } else if (type === 'tips') {
        el = tipsRef.value
        currentPageRef = tipPage
      }

      if (!el) return

      const scrollAmount = direction === 'left' ? -el.clientWidth : el.clientWidth
      el.scrollBy({ left: scrollAmount, behavior: 'smooth' })

      // Manual update in case scroll event is slow
      setTimeout(() => {
        if (el) {
          const newPage = Math.round(el.scrollLeft / el.clientWidth) + 1
          currentPageRef.value = newPage
        }
      }, 350)
    }

    const onScroll = (type: 'signals' | 'suggestions' | 'tips') => {
      let el: HTMLElement | null = null
      let currentPageRef = signalPage

      if (type === 'signals') {
        el = signalsRef.value
        currentPageRef = signalPage
      } else if (type === 'suggestions') {
        el = suggestionsRef.value
        currentPageRef = suggestionPage
      } else if (type === 'tips') {
        el = tipsRef.value
        currentPageRef = tipPage
      }

      if (el) {
        const newPage = Math.round(el.scrollLeft / el.clientWidth) + 1
        currentPageRef.value = newPage
      }
    }

    return {
      selectedYear,
      selectedMonth,
      isLoading,
      recommendationData,
      dynamicYears,
      months,
      monthOptions,
      yearOptions,
      t,
      fetchRecommendations,
      getSeverityIcon,
      formatReasonCode,
      formatSource,
      signalsRef,
      suggestionsRef,
      tipsRef,
      signalPage,
      suggestionPage,
      tipPage,
      scroll,
      onScroll,
      getPages,
      itemsPerPage,
      currency,
      setCurrency,
      isPrivacyMode,
      maskSensitiveText,
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
  background: var(--background-color-soft);
  overflow: hidden;
  animation: fadeIn 0.5s ease-out;
}

@media (max-width: 768px) {
  .recommendations-view {
    /* Avoid nested vertical scroll trap on touch devices. */
    flex: none;
    min-height: auto;
    overflow: visible;
  }
}

/* Module Container */
.module-container {
  display: flex;
  flex-direction: column;
  background: var(--background-color);
  border-radius: 16px;
  border: 1px solid var(--border-color);
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.04);
  height: 100%;
  overflow: hidden;
}

@media (max-width: 768px) {
  .module-container {
    height: auto;
    overflow: visible;
  }
}

/* Header Section */
.module-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid var(--border-color);
  background: var(--background-color);
  flex-shrink: 0;
  gap: 1rem;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
    padding: 1rem;
  }

  .header-left {
    display: flex;
    align-items: center;

    .title-with-icon {
      display: flex;
      align-items: center;
      gap: 1rem;

      .icon-circle {
        width: 40px;
        height: 40px;
        background: var(--background-color-soft);
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.15rem;
        color: var(--primary-blue-color);
        box-shadow: 0 2px 10px rgba(133, 193, 233, 0.15);
      }

      .title-group {
        display: flex;
        flex-direction: column;
        gap: 0.15rem;

        .title-row {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
      }

      .section-title {
        font-size: 1.2rem;
        font-weight: 800;
        color: var(--header-text-color);
        margin: 0;
        letter-spacing: -0.02em;
        line-height: 1.2;
      }

      .count-badge {
        font-size: 0.7rem;
        font-weight: 900;
        background: #10b981; /* Emerald Green for Active Signals count */
        color: white;
        padding: 2px 10px;
        border-radius: 20px;
        line-height: 1.4;
      }

      .section-subtitle {
        font-size: 0.85rem;
        color: var(--normal-text-color);
        opacity: 0.6;
        margin: 0;
      }
    }
  }

  .header-right {
    display: flex;
    align-items: center;

    @media (max-width: 768px) {
      width: auto;
      .date-selector-premium {
        width: auto;
      }
    }
  }
}

/* Scrollable Content Wrapper */
.content-wrapper {
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;

  /* Custom Scrollbar */
  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  &::-webkit-scrollbar-thumb {
    background: var(--border-color);
    border-radius: 10px;
  }
}

@media (max-width: 768px) {
  .content-wrapper {
    flex: none;
    overflow-y: visible;
    -webkit-overflow-scrolling: auto;
    padding: 1rem;
  }
}

/* Premium Date Selector */
.date-selector-premium {
  display: flex;
  align-items: center;
  background: var(--background-color-soft);
  border: 1px solid var(--border-color);
  opacity: 0.9;
  border-radius: 12px;
  padding: 0 1rem;
  height: 42px;
  gap: 0.6rem;

  &:hover {
    border-color: var(--primary-color-soft);
    transition: all 0.2s ease;
  }

  .selector-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--normal-text-color);
    font-size: 1rem;
    opacity: 0.5;
    margin-top: 1px;
  }

  .selector-controls {
    display: flex;
    align-items: center;
    gap: 0.25rem;

    .premium-selector-dropdown {
      min-width: 80px;
      &.year {
        min-width: 70px;
      }

      :deep(.select-trigger) {
        background: transparent !important;
        border: none !important;
        height: 32px !important;
        padding: 0 0.5rem !important;
        font-size: 0.9rem !important;
        font-weight: 600 !important;
        color: var(--normal-text-color) !important;
        box-shadow: none !important;

        &:hover {
          background: var(--background-color-soft) !important;
          opacity: 0.8;
        }

        .select-value {
          color: var(--normal-text-color) !important;
        }
      }
    }

    .selector-divider {
      width: 1px;
      height: 14px;
      background: var(--border-color);
      margin: 0 0.25rem;
    }
  }
}

/* Recommendations Stack */
.recommendations-stack {
  display: flex;
  flex-direction: column;
  gap: 2.5rem;
}

.premium-section {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

/* Carousel Header */
.section-header-carousel {
  display: flex;
  justify-content: space-between;
  align-items: center;

  .header-left-group {
    display: flex;
    align-items: center;
    gap: 0.85rem;

    .icon-circle.small {
      width: 32px;
      height: 32px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--background-color-soft);
      font-size: 0.95rem;
      &.emerald {
        background: rgba(16, 185, 129, 0.12);
        color: #10b981;
      }
      &.blue {
        background: rgba(133, 193, 233, 0.15);
        color: var(--primary-blue-color);
      }
      &.yellow {
        background: rgba(245, 158, 11, 0.15);
        color: #f59e0b;
      }
    }

    h3 {
      font-size: 1.1rem;
      font-weight: 800;
      color: var(--header-text-color);
      margin: 0;
      letter-spacing: -0.01em;
    }

    .premium-pagination-badge {
      display: flex;
      align-items: center;
      gap: 0.25rem;
      font-size: 0.75rem;
      font-weight: 800;
      color: var(--normal-text-color);
      background: var(--background-color-soft);
      padding: 3px 12px;
      border-radius: 20px;
      line-height: 1;

      .current {
        color: var(--header-text-color);
      }
      .divider {
        opacity: 0.3;
        font-weight: 400;
      }
      .total {
        opacity: 0.5;
      }
    }
  }

  .carousel-nav {
    display: flex;
    gap: 0.6rem;

    .nav-btn {
      width: 34px;
      height: 34px;
      border-radius: 10px;
      border: 1px solid var(--border-color);
      background: var(--background-color);
      color: var(--header-text-color);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      font-size: 0.85rem;

      &:hover:not(:disabled) {
        background: var(--background-color-soft);
        border-color: var(--primary-blue-color);
        color: var(--primary-blue-color);
        transition: all 0.2s ease;
      }

      &:disabled {
        opacity: 0.3;
        cursor: not-allowed;
        background: var(--background-color-soft);
      }
    }
  }
}

.carousel-nav-skeleton {
  display: flex;
  gap: 0.6rem;

  .nav-btn {
    width: 36px;
    height: 36px;
    border-radius: 12px;
    background: var(--background-color-soft);
    border: none;
    pointer-events: none;
  }
}

/* Carousel Container */
.carousel-container {
  display: flex;
  gap: 1.25rem;
  overflow-x: auto;
  scroll-behavior: smooth;
  scroll-snap-type: x mandatory;
  padding: 0.5rem;
  margin: -0.5rem;

  scrollbar-width: none;
  -ms-overflow-style: none;
  &::-webkit-scrollbar {
    display: none;
  }
}

.carousel-item {
  flex-shrink: 0;
  scroll-snap-align: start;
  display: flex;

  &.spacer-item {
    pointer-events: none;
    visibility: hidden;
  }
}

.signal-width {
  width: calc((100% - 2.5rem) / 3);
}
.full-width {
  width: 100%;
}

@media (max-width: 1024px) {
  .signal-width {
    width: calc((100% - 1.25rem) / 2);
  }
}
@media (max-width: 640px) {
  .signal-width {
    width: 100%;
  }
}

.premium-signal-card {
  position: relative;
  background: var(--background-color);
  border: 1px solid var(--border-color);
  border-radius: 18px;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  overflow: hidden;
  opacity: 0;
  animation: slideUp 0.5s ease-out forwards;
  animation-delay: var(--delay);
  height: 100%;
  width: 100%;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 35px rgba(0, 0, 0, 0.05);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

    &.critical {
      border-color: #ef4444;
    }
    &.high {
      border-color: #f97316;
    }
    &.medium {
      border-color: #eab308;
    }
    &.low {
      border-color: #3b82f6;
    }
  }

  .card-main-content {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
    flex: 1;

    .signal-visual {
      margin-bottom: 0.75rem;
      .icon-box {
        width: 48px;
        height: 48px;
        border-radius: 14px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.4rem;
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
      display: flex;
      flex-direction: column;
      gap: 0.85rem;

      .signal-title-row {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        gap: 0.75rem;
        min-height: 3.2rem; /* Ensure space for 2-line titles */

        .signal-reason {
          font-size: 1.1rem;
          font-weight: 800;
          color: var(--header-text-color);
          margin: 0;
          line-height: 1.3;
        }

        .severity-pill {
          font-size: 0.65rem;
          font-weight: 900;
          padding: 3px 10px;
          border-radius: 20px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          &.critical {
            background: rgba(239, 68, 68, 0.12);
            color: #ef4444;
          }
          &.high {
            background: rgba(249, 115, 22, 0.12);
            color: #f97316;
          }
          &.medium {
            background: rgba(234, 179, 8, 0.12);
            color: #eab308;
          }
          &.low {
            background: rgba(59, 130, 246, 0.12);
            color: #3b82f6;
          }
        }
      }

      .signal-meta {
        font-size: 0.85rem;
        color: var(--normal-text-color);
        margin: 0;
        display: flex;
        align-items: center;
        gap: 0.6rem;
        opacity: 0.6;
        .meta-dot {
          font-size: 0.4rem;
        }
      }

      .evidence-container {
        background: var(--background-color-soft);
        border-radius: 12px;
        padding: 1.25rem 1.5rem;
        flex-grow: 1;
        display: flex;
        align-items: center;
        .evidence-text {
          font-size: 0.95rem;
          line-height: 1.6;
          color: var(--header-text-color);
          margin: 0;
          .evidence-lead {
            font-weight: 800;
            color: var(--normal-text-color);
            margin-right: 10px;
          }
        }
      }
    }
  }
}

/* Suggestions & Tips */
.suggestion-item-premium,
.tip-card-premium {
  background: var(--background-color-soft);
  border: 1px solid var(--border-color);
  border-radius: 20px;
  padding: 1.75rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  height: 100%;
  width: 100%;

  &:hover {
    border-color: var(--primary-blue-color);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.05);
    transition: all 0.3s ease;
  }
}

.suggestion-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  .suggestion-name {
    font-size: 1.2rem;
    font-weight: 800;
    color: var(--header-text-color);
  }
  .match-score {
    font-size: 0.8rem;
    font-weight: 900;
    color: var(--primary-blue-color);
    background: rgba(133, 193, 233, 0.15);
    padding: 4px 12px;
    border-radius: 20px;
  }
}

.suggestion-desc,
.tip-body {
  font-size: 0.95rem;
  color: var(--normal-text-color);
  line-height: 1.7;
  margin: 0;
}

.progress-container {
  height: 8px;
  background: var(--border-color);
  border-radius: 10px;
  overflow: hidden;
  .progress-bar {
    height: 100%;
    background: linear-gradient(90deg, var(--primary-blue-color), #6a82fb);
  }
}

.tip-card-premium {
  flex-direction: row;
  align-items: flex-start;
  gap: 1.5rem;
  &:hover {
    border-color: #f59e0b;
  }
  .tip-glow-icon {
    width: 52px;
    height: 52px;
    background: white;
    border-radius: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #f59e0b;
    font-size: 1.4rem;
    flex-shrink: 0;
  }
  .tip-content {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    .tip-topic {
      font-size: 1.15rem;
      font-weight: 800;
      color: var(--header-text-color);
      margin: 0;
    }
  }
}

/* Empty States */
.section-empty-state {
  background: var(--background-color-soft);
  border: 1px dashed var(--border-color);
  border-radius: 16px;
  padding: 4rem 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.25rem;
  text-align: center;
  .empty-icon-wrap {
    font-size: 3rem;
    color: var(--border-color);
    opacity: 0.5;
  }
  .empty-heading {
    font-size: 1.25rem;
    font-weight: 800;
    color: var(--header-text-color);
    margin: 0;
  }
  .empty-text {
    font-size: 0.95rem;
    color: var(--normal-text-color);
    opacity: 0.7;
    max-width: 400px;
    line-height: 1.6;
  }
}

/* Skeleton */
.skeleton-pulse {
  background: linear-gradient(
    90deg,
    var(--background-color-soft) 25%,
    var(--border-color) 37%,
    var(--background-color-soft) 63%
  );
  background-size: 400% 100%;
  animation: skeleton-loading 1.4s ease infinite;
}

@keyframes skeleton-loading {
  0% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0 50%;
  }
}

.skeleton-line {
  height: 12px;
  border-radius: 6px;
  background: var(--border-color);
  opacity: 0.6;
  &.h3 {
    height: 18px;
    width: 70%;
  }
  &.meta {
    height: 12px;
    width: 40%;
  }
  &.pill {
    height: 24px;
    width: 60px;
    border-radius: 20px;
  }
  &.full {
    height: 12px;
    width: 100%;
    margin-top: 4px;
  }
}

.premium-signal-card.skeleton,
.suggestion-item-premium.skeleton,
.tip-card-premium.skeleton {
  pointer-events: none;
  border-color: var(--border-color);
  animation: none !important;
  opacity: 1 !important;
  transform: none !important;
  width: 100%;
  height: 100%;

  .icon-box,
  .tip-glow-icon,
  .icon-circle.skeleton-pulse {
    background: var(--border-color) !important;
    border: none;
    opacity: 0.5;
  }

  .evidence-container {
    background: var(--background-color-soft) !important;
    border: none;
  }

  .progress-container {
    background: var(--background-color-soft) !important;
  }
}

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

.cta-button-premium {
  background: var(--header-text-color);
  color: white;
  border: none;
  padding: 14px 36px;
  border-radius: 14px;
  font-weight: 800;
  font-size: 1.05rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  cursor: pointer;
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
    filter: brightness(1.1);
    transition: all 0.3s ease;
  }
}
</style>
