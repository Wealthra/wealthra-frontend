<template>
  <div v-if="isVisible && announcement" class="announcement-banner-overlay" @click.self="closeBanner">
    <div class="announcement-banner-card glass-card">
      <div class="banner-header">
        <div class="banner-title-group">
          <font-awesome-icon icon="bullhorn" class="banner-icon" />
          <h3>{{ announcement.title }}</h3>
        </div>
        <button class="close-btn" @click="closeBanner" aria-label="Close">
          <font-awesome-icon icon="xmark" />
        </button>
      </div>
      <div class="banner-body">
        <p>{{ announcement.body }}</p>
      </div>
      <div class="banner-footer" v-if="announcement.actionUrl">
        <a :href="announcement.actionUrl" target="_blank" class="action-btn">
          {{ announcement.actionText || (selectedLanguage === 'Turkish' ? 'Detaylar' : 'Details') }}
        </a>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref } from 'vue'
import { announcementService } from '@/services/api/announcement/announcement.service'
import type { AnnouncementDto } from '@/services/api/announcement/announcement.models'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

export default defineComponent({
  name: 'UIAnnouncementBanner',
  components: {
    FontAwesomeIcon
  },
  props: {
    selectedLanguage: {
      type: String as () => 'English' | 'Turkish',
      default: 'English'
    }
  },
  setup(props) {
    const isVisible = ref(false)
    const announcement = ref<AnnouncementDto | null>(null)

    const fetchAnnouncements = async () => {
      const dismissed = sessionStorage.getItem('announcement_dismissed')
      if (dismissed) return

      try {
        const lang = props.selectedLanguage === 'Turkish' ? 'tr' : 'en'
        const data = await announcementService.getActiveAnnouncements(lang)
        
        if (data && data.length > 0) {
          announcement.value = data[0]
          isVisible.value = true
        }
      } catch (err) {
        console.error('Failed to fetch announcements:', err)
      }
    }

    const closeBanner = () => {
      isVisible.value = false
      sessionStorage.setItem('announcement_dismissed', 'true')
    }

    onMounted(() => {
      fetchAnnouncements()
    })

    return {
      isVisible,
      announcement,
      closeBanner
    }
  }
})
</script>

<style scoped lang="scss">
.announcement-banner-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(8px);
  z-index: 10000; /* Higher than modals */
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;

  .announcement-banner-card {
    width: 100%;
    max-width: 500px;
    background: var(--background-color);
    border: 1px solid var(--border-color);
    border-radius: 24px;
    padding: 2rem;
    animation: slideIn 0.5s cubic-bezier(0.16, 1, 0.3, 1);
    position: relative;

    .banner-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.25rem;

      .banner-title-group {
        display: flex;
        align-items: center;
        gap: 1rem;

        .banner-icon {
          color: var(--primary-green-color);
          font-size: 1.5rem;
        }

        h3 {
          margin: 0;
          font-size: 1.25rem;
          font-weight: 800;
          color: var(--header-text-color);
          letter-spacing: -0.02em;
        }
      }

      .close-btn {
        background: var(--background-color-soft);
        border: none;
        color: var(--normal-text-color);
        font-size: 1.15rem;
        cursor: pointer;
        width: 32px;
        height: 32px;
        border-radius: 10px;
        transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        display: flex;
        align-items: center;
        justify-content: center;

        &:hover {
          background: var(--border-color);
          color: var(--header-text-color);
        }
      }
    }

    .banner-body {
      margin-bottom: 2rem;
      p {
        margin: 0;
        color: var(--normal-text-color);
        line-height: 1.6;
        font-size: 0.95rem;
        opacity: 0.9;
      }
    }

    .banner-footer {
      display: flex;
      justify-content: flex-end;

      .action-btn {
        background: var(--primary-green-color);
        color: white;
        padding: 0.625rem 1.25rem;
        border-radius: 12px;
        text-decoration: none;
        font-weight: 700;
        font-size: 0.875rem;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

        &:hover {
          filter: brightness(1.1);
        }
      }
    }
  }
}

@keyframes slideIn {
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
