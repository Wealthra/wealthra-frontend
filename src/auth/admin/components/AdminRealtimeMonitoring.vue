<template>
  <div class="admin-realtime-monitoring">
    <!-- Snapshot Summary Bar -->
    <div class="snapshot-grid">
      <template v-if="isLoading">
        <div v-for="i in 5" :key="'skel-stat-'+i" class="snapshot-card glass-card skeleton-card">
          <UISkeletonLoader width="44px" height="44px" border-radius="12px" />
          <div class="info">
            <UISkeletonLoader width="80px" height="10px" style="margin-bottom: 6px" />
            <UISkeletonLoader width="50px" height="20px" />
          </div>
        </div>
      </template>
      <template v-else>
        <!-- Total Users -->
        <div class="snapshot-card glass-card">
          <div class="icon-wrap users">
            <font-awesome-icon icon="users" />
          </div>
          <div class="info">
            <span class="label">{{ t.totalUsers }}</span>
            <span class="value">{{ isPrivacyMode ? '••••' : (snapshot?.totalUsers ?? '0') }}</span>
          </div>
        </div>

        <!-- Active Plans -->
        <div class="snapshot-card glass-card">
          <div class="icon-wrap active">
            <font-awesome-icon icon="chart-pie" />
          </div>
          <div class="info">
            <span class="label">{{ t.activePlans }}</span>
            <span class="value">{{ isPrivacyMode ? '••••' : (snapshot?.activePlans ?? '0') }}</span>
          </div>
        </div>

        <!-- OCR Requests -->
        <div class="snapshot-card glass-card">
          <div class="icon-wrap load">
            <font-awesome-icon icon="file-invoice" />
          </div>
          <div class="info">
            <span class="label">{{ t.monthlyOcr }}</span>
            <span class="value">{{ isPrivacyMode ? '••••' : (snapshot?.totalOcrRequestsThisMonth ?? '0') }}</span>
          </div>
        </div>

        <!-- STT Requests -->
        <div class="snapshot-card glass-card">
          <div class="icon-wrap status online">
            <font-awesome-icon icon="microphone" />
          </div>
          <div class="info">
            <span class="label">{{ t.monthlyStt }}</span>
            <span class="value">{{ isPrivacyMode ? '••••' : (snapshot?.totalSttRequestsThisMonth ?? '0') }}</span>
          </div>
        </div>

        <!-- Hub Status -->
        <div class="snapshot-card glass-card hub-card">
          <div class="icon-wrap status" :class="{ online: isConnected }">
            <font-awesome-icon icon="bolt" />
            <div v-if="isConnected" class="live-pulse"></div>
          </div>
          <div class="info">
            <span class="label">{{ t.hubStatus }}</span>
            <span class="value" :class="isConnected ? 'status-online' : 'status-offline'">
              {{ isConnected ? t.connected : t.disconnected }}
            </span>
          </div>
        </div>
      </template>
    </div>

    <!-- Live Activity Feed -->
    <div class="activity-feed-container glass-card">
      <div class="feed-header">
        <div class="header-title">
          <font-awesome-icon icon="list-check" />
          <h2>{{ t.liveActivity }}</h2>
        </div>
        <div class="header-actions">
          <div class="feed-badge" v-if="activities.length > 0 && !isLoading">
            {{ activities.length }} {{ t.recentEvents }}
          </div>
        </div>
      </div>

      <div class="feed-list" ref="feedListRef">
        <template v-if="isLoading">
          <div v-for="i in 5" :key="'skel-act-'+i" class="activity-item skeleton-item">
            <UISkeletonLoader width="75px" height="14px" />
            <UISkeletonLoader width="36px" height="36px" border-radius="10px" />
            <div class="activity-content">
              <UISkeletonLoader width="100px" height="10px" style="margin-bottom: 6px" />
              <UISkeletonLoader width="250px" height="14px" />
            </div>
          </div>
        </template>
        <template v-else>
          <TransitionGroup name="list">
            <div v-for="(activity, index) in activities" :key="activity.timestamp + index" class="activity-item">
              <div class="activity-time">{{ formatTime(activity.timestamp) }}</div>
              <div class="activity-icon-wrap" :class="activity.activityType.toLowerCase()">
                <font-awesome-icon :icon="getActivityIcon(activity.activityType)" />
              </div>
              <div class="activity-content">
                <div class="activity-type">{{ formatActivityType(activity.activityType) }}</div>
                <div class="activity-message">{{ activity.message }}</div>
              </div>
            </div>
          </TransitionGroup>

          <div v-if="activities.length === 0" class="empty-feed">
            <font-awesome-icon icon="signal" class="empty-icon-pulse" />
            <p>{{ t.waitingForEvents }}</p>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, onBeforeUnmount, computed } from 'vue'
import {
  faUsers,
  faSignal,
  faServer,
  faBolt,
  faListCheck,
  faUserLock,
  faUserPlus,
  faKey,
  faTrashCan,
  faTriangleExclamation,
  faShieldHalved,
  faUserSlash,
  faArrowsRotate,
  faChartPie,
  faFileInvoice,
  faMicrophone
} from '@fortawesome/free-solid-svg-icons'
import { library } from '@fortawesome/fontawesome-svg-core'
import { useCurrency } from '@/composables/useCurrency'
import UISkeletonLoader from '@/components/UISkeletonLoader.vue'

// Register specific icons needed for activity
library.add(faUserLock, faUserPlus, faKey, faTrashCan, faTriangleExclamation, faShieldHalved, faUserSlash, faArrowsRotate, faChartPie, faFileInvoice, faMicrophone)

interface SnapshotData {
  totalUsers: number
  activePlans: number
  totalOcrRequestsThisMonth: number
  totalSttRequestsThisMonth: number
}

interface ActivityLog {
  activityType: string
  message: string
  timestamp: string
  payload?: any
}

export default defineComponent({
  name: 'AdminRealtimeMonitoring',
  components: { UISkeletonLoader },
  props: {
    selectedLanguage: {
      type: String,
      default: 'English'
    }
  },
  setup(props) {
    const { isPrivacyMode } = useCurrency()
    const snapshot = ref<SnapshotData | null>(null)
    const activities = ref<ActivityLog[]>([])
    const isConnected = ref(true)
    const isLoading = ref(true)
    const feedListRef = ref<HTMLElement | null>(null)

    const t = computed(() => {
      const isTr = props.selectedLanguage === 'Turkish'
      return {
        totalUsers: isTr ? 'Toplam Kullanıcı' : 'Total Users',
        activePlans: isTr ? 'Aktif Planlar' : 'Active Plans',
        monthlyOcr: isTr ? 'Aylık OCR' : 'Monthly OCR',
        monthlyStt: isTr ? 'Aylık STT' : 'Monthly STT',
        hubStatus: isTr ? 'Hub Durumu' : 'Hub Status',
        connected: isTr ? 'Bağlı' : 'Connected',
        disconnected: isTr ? 'Bağlantı Kesildi' : 'Disconnected',
        liveActivity: isTr ? 'Canlı Aktivite Akışı' : 'Live Activity Feed',
        recentEvents: isTr ? 'olay' : 'events',
        waitingForEvents: isTr ? 'Yeni olaylar bekleniyor...' : 'Waiting for new events...',
        live: isTr ? 'CANLI' : 'LIVE',
      }
    })

    const onSnapshot = (e: any) => {
      snapshot.value = e.detail.snapshot
      isLoading.value = false
    }

    const onActivity = (e: any) => {
      const newActivity = e.detail as ActivityLog
      activities.value.unshift(newActivity)
      if (activities.value.length > 50) {
        activities.value.pop()
      }
      isLoading.value = false
    }

    const formatTime = (ts: string) => {
      const date = new Date(ts)
      return date.toLocaleTimeString(props.selectedLanguage === 'Turkish' ? 'tr-TR' : 'en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      })
    }

    const formatActivityType = (type: string) => {
      return type.replace(/([A-Z])/g, ' $1').trim()
    }

    const getActivityIcon = (type: string) => {
      const t = type.toLowerCase()
      if (t.includes('lock')) return faUserLock
      if (t.includes('unlock')) return faShieldHalved
      if (t.includes('create') || t.includes('signup')) return faUserPlus
      if (t.includes('password') || t.includes('reset')) return faKey
      if (t.includes('delete')) return faTrashCan
      if (t.includes('disable')) return faUserSlash
      if (t.includes('sync') || t.includes('update')) return faArrowsRotate
      return faTriangleExclamation
    }

    onMounted(() => {
      window.addEventListener('admin-snapshot', onSnapshot)
      window.addEventListener('admin-activity', onActivity)
      
      // If we don't get a snapshot within 3 seconds, stop skeleton to show "waiting"
      setTimeout(() => {
        if (isLoading.value && activities.value.length === 0 && !snapshot.value) {
          isLoading.value = false
        }
      }, 3000)
    })

    onBeforeUnmount(() => {
      window.removeEventListener('admin-snapshot', onSnapshot)
      window.removeEventListener('admin-activity', onActivity)
    })

    return {
      t,
      snapshot,
      activities,
      isConnected,
      isLoading,
      feedListRef,
      formatTime,
      formatActivityType,
      getActivityIcon,
      isPrivacyMode
    }
  }
})
</script>

<style scoped lang="scss">
.admin-realtime-monitoring {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  width: 100%;
  flex: 1;
  min-height: 0;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.snapshot-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 1.25rem;
  flex-shrink: 0;

  @media (max-width: 1400px) {
    grid-template-columns: repeat(3, 1fr);
  }

  @media (max-width: 900px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
}

.snapshot-card {
  padding: 1.25rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  background: var(--input-background-color);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
  }

  .icon-wrap {
    width: 44px;
    height: 44px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.1rem;

    &.users { background: rgba(16, 185, 129, 0.1); color: #10b981; }
    &.active { background: rgba(59, 130, 246, 0.1); color: #3b82f6; }
    &.load { background: rgba(245, 158, 11, 0.1); color: #f59e0b; }
    &.status { 
      background: rgba(100, 116, 139, 0.1); color: #64748b; 
      position: relative;
      &.online { background: rgba(16, 185, 129, 0.1); color: #10b981; }
    }
  }

  .live-pulse {
    position: absolute;
    top: 0;
    right: 0;
    width: 10px;
    height: 10px;
    background: #10b981;
    border-radius: 50%;
    border: 2px solid var(--input-background-color);
    animation: pulse 2s infinite;
  }

  .info {
    display: flex;
    flex-direction: column;
    gap: 2px;

    .label {
      font-size: 0.7rem;
      font-weight: 600;
      color: var(--normal-text-color);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .value {
      font-size: 1.1rem;
      font-weight: 800;
      color: var(--header-text-color);

      &.status-online { color: #10b981; }
      &.status-offline { color: #ef4444; }
    }
  }
}

.activity-feed-container {
  display: flex;
  flex-direction: column;
  background: var(--input-background-color);
  border: 1px solid var(--border-color);
  border-radius: 20px;
  overflow: hidden;
  flex: 1;
  min-height: 0;
}

.feed-header {
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid var(--border-color);
  display: flex;
  justify-content: space-between;
  align-items: center;

  .header-title {
    display: flex;
    align-items: center;
    gap: 12px;

    svg {
      color: var(--primary-green-color);
      font-size: 1rem;
    }

    h2 {
      font-size: 1.1rem;
      font-weight: 700;
      margin: 0;
      color: var(--header-text-color);
    }
  }

  .feed-badge {
    padding: 4px 10px;
    background: var(--background-color-soft);
    border: 1px solid var(--border-color);
    border-radius: 20px;
    font-size: 0.7rem;
    font-weight: 700;
    color: var(--normal-text-color);
  }
}

.feed-list {
  flex: 1;
  overflow-y: auto;
  padding: 0.5rem;
  display: flex;
  flex-direction: column;

  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-thumb {
    background: var(--border-color);
    border-radius: 10px;
  }
}

.activity-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1rem;
  border-bottom: 1px solid rgba(120, 120, 120, 0.05);
  transition: background 0.2s;

  &:hover {
    background: rgba(120, 120, 120, 0.03);
  }

  &:last-child {
    border-bottom: none;
  }

  .activity-time {
    font-size: 0.75rem;
    font-weight: 600;
    color: var(--normal-text-color);
    opacity: 0.5;
    min-width: 75px;
  }

  .activity-icon-wrap {
    width: 36px;
    height: 36px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.9rem;
    flex-shrink: 0;

    background: rgba(148, 163, 184, 0.1);
    color: #94a3b8;

    &.userlocked { background: rgba(239, 68, 68, 0.1); color: #ef4444; }
    &.signup, &.usercreated { background: rgba(16, 185, 129, 0.1); color: #10b981; }
    &.passwordreset { background: rgba(245, 158, 11, 0.1); color: #f59e0b; }
  }

  .activity-content {
    display: flex;
    flex-direction: column;
    gap: 2px;

    .activity-type {
      font-size: 0.7rem;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--normal-text-color);
      opacity: 0.7;
    }

    .activity-message {
      font-size: 0.9rem;
      font-weight: 500;
      color: var(--header-text-color);
    }
  }
}

.empty-feed {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  opacity: 0.5;

  .empty-icon-pulse {
    font-size: 2rem;
    color: var(--primary-green-color);
    animation: iconPulse 2s infinite ease-in-out;
  }

  p {
    font-size: 0.9rem;
    font-weight: 600;
  }
}

/* Transitions & Animations */
@keyframes pulse {
  0% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7); }
  70% { box-shadow: 0 0 0 6px rgba(16, 185, 129, 0); }
  100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
}

@keyframes iconPulse {
  0%, 100% { transform: scale(1); opacity: 0.5; }
  50% { transform: scale(1.2); opacity: 1; }
}
.list-enter-active,
.list-leave-active {
  transition: all 0.4s ease;
}
.list-enter-from {
  opacity: 0;
  transform: translateX(-20px);
}
.list-leave-to {
  opacity: 0;
  transform: translateX(20px);
}
</style>
