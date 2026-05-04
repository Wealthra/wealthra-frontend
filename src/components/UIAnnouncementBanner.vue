<template>
  <div
    v-if="isVisible && announcements.length > 0"
    class="announcement-banner-overlay"
    @click.self="closeBanner"
  >
    <div class="announcement-banner-card glass-card">
      <div class="banner-header">
        <div class="banner-title-group">
          <div class="icon-circle" :class="getSeverityClass(currentAnnouncement.severity)">
            <font-awesome-icon icon="bullhorn" class="banner-icon" />
          </div>
          <div class="title-text-group">
            <div class="header-top-row">
              <span class="severity-badge" :class="getSeverityClass(currentAnnouncement.severity)">
                {{ getSeverityLabel(currentAnnouncement.severity) }}
              </span>
              <span v-if="announcements.length > 1" class="announcement-count">
                {{ currentIndex + 1 }} / {{ announcements.length }}
              </span>
            </div>
            <h3>{{ currentAnnouncement.title }}</h3>
          </div>
        </div>
        <button class="close-btn" @click="closeBanner" aria-label="Close">
          <font-awesome-icon icon="xmark" />
        </button>
      </div>

      <div class="banner-content-wrapper">
        <transition :name="slideDirection" mode="out-in">
          <div :key="currentIndex" class="banner-body">
            <p class="announcement-text">{{ currentAnnouncement.body }}</p>

            <div class="announcement-meta">
              <div class="meta-item">
                <font-awesome-icon icon="calendar-day" class="meta-icon" />
                <span>{{ formatDate(currentAnnouncement.startsAt) }}</span>
              </div>
            </div>
          </div>
        </transition>
      </div>

      <div class="banner-footer">
        <div class="footer-left">
          <div class="slider-controls" v-if="announcements.length > 1">
            <button @click="prev" class="nav-btn" :disabled="currentIndex === 0">
              <font-awesome-icon icon="chevron-left" />
            </button>

            <div class="pagination-pill">
              <span
                v-for="(_, index) in announcements"
                :key="index"
                class="dot"
                :class="{ active: index === currentIndex }"
                @click="goTo(index)"
              ></span>
            </div>

            <button
              @click="next"
              class="nav-btn"
              :disabled="currentIndex === announcements.length - 1"
            >
              <font-awesome-icon icon="chevron-right" />
            </button>
          </div>
        </div>

        <div class="footer-right">
          <div v-if="currentAnnouncement.actionUrl" class="action-wrap">
            <a :href="currentAnnouncement.actionUrl" target="_blank" class="action-btn-premium">
              {{
                currentAnnouncement.actionText ||
                (selectedLanguage === 'Turkish' ? 'Detaylar' : 'Details')
              }}
              <font-awesome-icon icon="arrow-right" class="btn-arrow" />
            </a>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref, computed } from 'vue'
import { announcementService } from '@/services/api/announcement/announcement.service'
import type { AnnouncementDto } from '@/services/api/announcement/announcement.models'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

export default defineComponent({
  name: 'UIAnnouncementBanner',
  components: {
    FontAwesomeIcon,
  },
  props: {
    selectedLanguage: {
      type: String as () => 'English' | 'Turkish',
      default: 'English',
    },
  },
  setup(props) {
    const isVisible = ref(false)
    const announcements = ref<AnnouncementDto[]>([])
    const currentIndex = ref(0)
    const slideDirection = ref('slide-right')

    const currentAnnouncement = computed(() => {
      const ann = announcements.value[currentIndex.value]
      if (!ann)
        return { title: '', body: '', severity: 0, startsAt: '', actionUrl: '', actionText: '' }

      const isTr = props.selectedLanguage === 'Turkish'
      return {
        title: isTr ? ann.titleTr : ann.titleEn,
        body: isTr ? ann.bodyTr : ann.bodyEn,
        severity: ann.severity,
        startsAt: ann.startsAt,
        actionUrl: ann.actionUrl,
        actionText: ann.actionText,
      }
    })

    const fetchAnnouncements = async () => {
      const dismissed = sessionStorage.getItem('announcement_dismissed')
      if (dismissed) return

      try {
        const data = await announcementService.getActiveAnnouncements()
        if (data && data.length > 0) {
          announcements.value = data
          isVisible.value = true
        }
      } catch (err) {
        console.error('Failed to fetch announcements:', err)
      }
    }

    const next = () => {
      if (currentIndex.value < announcements.value.length - 1) {
        slideDirection.value = 'slide-left'
        currentIndex.value++
      }
    }

    const prev = () => {
      if (currentIndex.value > 0) {
        slideDirection.value = 'slide-right'
        currentIndex.value--
      }
    }

    const goTo = (index: number) => {
      slideDirection.value = index > currentIndex.value ? 'slide-left' : 'slide-right'
      currentIndex.value = index
    }

    const closeBanner = () => {
      isVisible.value = false
      sessionStorage.setItem('announcement_dismissed', 'true')
    }

    const getSeverityLabel = (severity: number) => {
      const isTr = props.selectedLanguage === 'Turkish'
      switch (severity) {
        case 0:
          return isTr ? 'Düşük' : 'Low'
        case 1:
          return isTr ? 'Orta' : 'Medium'
        case 2:
          return isTr ? 'Yüksek' : 'High'
        case 3:
          return isTr ? 'Kritik' : 'Critical'
        default:
          return 'Info'
      }
    }

    const getSeverityClass = (severity: number) => {
      switch (severity) {
        case 0:
          return 'low'
        case 1:
          return 'medium'
        case 2:
          return 'high'
        case 3:
          return 'critical'
        default:
          return 'low'
      }
    }

    const formatDate = (dateStr: string) => {
      if (!dateStr) return ''
      return new Date(dateStr).toLocaleDateString(
        props.selectedLanguage === 'Turkish' ? 'tr-TR' : 'en-US',
        {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }
      )
    }

    onMounted(() => {
      fetchAnnouncements()
    })

    return {
      isVisible,
      announcements,
      currentIndex,
      currentAnnouncement,
      slideDirection,
      closeBanner,
      next,
      prev,
      goTo,
      getSeverityLabel,
      getSeverityClass,
      formatDate,
    }
  },
})
</script>

<style scoped lang="scss">
.announcement-banner-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.45);
  backdrop-filter: blur(12px);
  z-index: 10000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;

  .announcement-banner-card {
    width: 100%;
    max-width: 600px;
    background: var(--background-color);
    border: 1px solid var(--border-color);
    border-radius: 36px;
    padding: 2.75rem;
    box-shadow: 0 40px 80px -20px rgba(0, 0, 0, 0.6);
    position: relative;
    overflow: hidden;
    animation: bannerPop 0.7s cubic-bezier(0.16, 1, 0.3, 1);
    background-image: radial-gradient(
      circle at top right,
      rgba(34, 197, 94, 0.03),
      transparent 40%
    );

    .banner-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 2.25rem;

      .banner-title-group {
        display: flex;
        align-items: center;
        gap: 1.75rem;

        .icon-circle {
          width: 60px;
          height: 60px;
          border-radius: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          box-shadow: 0 8px 16px -4px rgba(0, 0, 0, 0.1);

          &.low {
            background: rgba(16, 185, 129, 0.18);
            color: #10b981;
          }
          &.medium {
            background: rgba(59, 130, 246, 0.18);
            color: #3b82f6;
          }
          &.high {
            background: rgba(245, 158, 11, 0.18);
            color: #f59e0b;
          }
          &.critical {
            background: rgba(239, 68, 68, 0.18);
            color: #ef4444;
          }

          .banner-icon {
            font-size: 1.75rem;
          }
        }

        .title-text-group {
          display: flex;
          flex-direction: column;
          gap: 6px;

          .header-top-row {
            display: flex;
            align-items: center;
            gap: 12px;
          }

          .severity-badge {
            font-size: 0.6rem;
            font-weight: 900;
            text-transform: uppercase;
            letter-spacing: 0.08em;
            padding: 4px 10px;
            border-radius: 8px;

            &.low {
              background: rgba(16, 185, 129, 0.12);
              color: #10b981;
            }
            &.medium {
              background: rgba(59, 130, 246, 0.12);
              color: #3b82f6;
            }
            &.high {
              background: rgba(245, 158, 11, 0.12);
              color: #f59e0b;
            }
            &.critical {
              background: rgba(239, 68, 68, 0.12);
              color: #ef4444;
            }
          }

          h3 {
            margin: 0;
            font-size: 1.75rem;
            font-weight: 800;
            color: var(--header-text-color);
            letter-spacing: -0.04em;
            line-height: 1.1;
          }

          .announcement-count {
            font-size: 0.7rem;
            font-weight: 700;
            color: var(--normal-text-color);
            opacity: 0.4;
            letter-spacing: 0.05em;
          }
        }
      }

      .close-btn {
        background: var(--background-color-soft);
        border: none;
        color: var(--normal-text-color);
        width: 44px;
        height: 44px;
        border-radius: 16px;
        cursor: pointer;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        display: flex;
        align-items: center;
        justify-content: center;
        margin-top: 2px;

        &:hover {
          background: var(--border-color);
          color: var(--header-text-color);
        }
      }
    }

    .banner-content-wrapper {
      position: relative;
      min-height: 110px;
      margin-bottom: 3rem;
    }

    .banner-body {
      .announcement-text {
        margin: 0 0 1.75rem 0;
        color: var(--header-text-color);
        line-height: 1.6;
        font-size: 1.25rem;
        font-weight: 500;
        opacity: 0.95;
      }

      .announcement-meta {
        display: flex;
        gap: 20px;

        .meta-item {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.8rem;
          color: var(--normal-text-color);
          opacity: 0.5;
          font-weight: 700;

          .meta-icon {
            font-size: 0.9rem;
          }
        }
      }
    }

    .banner-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 1.5rem;
      padding-top: 1.5rem;
      border-top: 1px solid var(--border-color);

      .footer-left {
        display: flex;
        align-items: center;
      }

      .slider-controls {
        display: flex;
        align-items: center;
        gap: 0.75rem;

        .nav-btn {
          width: 40px;
          height: 40px;
          border-radius: 14px;
          border: 1px solid var(--border-color);
          background: var(--background-color-soft);
          color: var(--normal-text-color);
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.9rem;

          &:hover:not(:disabled) {
            background: var(--border-color);
            border-color: var(--header-text-color);
            color: var(--header-text-color);
            transform: scale(1.05);
          }

          &:disabled {
            opacity: 0.2;
            cursor: not-allowed;
            background: transparent;
          }
        }

        .pagination-pill {
          display: flex;
          align-items: center;
          gap: 8px;
          background: var(--background-color-soft);
          padding: 6px 14px;
          border-radius: 20px;
          border: 1px solid var(--border-color);

          .dot {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: var(--border-color);
            cursor: pointer;
            transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);

            &:hover {
              background: var(--normal-text-color);
            }
            &.active {
              background: var(--primary-green-color);
              width: 24px;
              border-radius: 12px;
              box-shadow: 0 0 10px rgba(34, 197, 94, 0.3);
            }
          }
        }
      }

      .action-btn-premium {
        display: inline-flex;
        align-items: center;
        gap: 12px;
        background: var(--primary-green-color);
        color: white;
        padding: 0.875rem 1.85rem;
        border-radius: 18px;
        text-decoration: none;
        font-weight: 800;
        font-size: 0.95rem;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        box-shadow: 0 10px 25px rgba(34, 197, 94, 0.25);

        .btn-arrow {
          font-size: 0.85rem;
          transition: transform 0.3s;
        }

        &:hover {
          transform: translateY(-3px);
          box-shadow: 0 15px 35px rgba(34, 197, 94, 0.4);
          filter: brightness(1.05);

          .btn-arrow {
            transform: translateX(6px);
          }
        }
      }
    }
  }
}

/* Animations */
@keyframes bannerPop {
  0% {
    opacity: 0;
    transform: scale(0.96) translateY(60px);
  }
  100% {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

/* Slide Transitions */
.slide-left-enter-active,
.slide-left-leave-active,
.slide-right-enter-active,
.slide-right-leave-active {
  transition: all 0.45s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-left-enter-from {
  opacity: 0;
  transform: translateX(40px) scale(0.98);
}
.slide-left-leave-to {
  opacity: 0;
  transform: translateX(-40px) scale(0.98);
}

.slide-right-enter-from {
  opacity: 0;
  transform: translateX(-40px) scale(0.98);
}
.slide-right-leave-to {
  opacity: 0;
  transform: translateX(40px) scale(0.98);
}
</style>
