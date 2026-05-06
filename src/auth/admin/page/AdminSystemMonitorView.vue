<template>
  <div class="dashboard-page admin-system-monitor">
    <AdminRealtimeMonitoring :selected-language="selectedLanguage" />
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, ref, onMounted, onBeforeUnmount } from 'vue'
import type { PropType } from 'vue'
import AdminRealtimeMonitoring from '../components/AdminRealtimeMonitoring.vue'
import { useToast } from '@/stores/useToast'

export default defineComponent({
  name: 'AdminSystemMonitorView',
  components: {
    AdminRealtimeMonitoring,
  },
  props: {
    selectedLanguage: {
      type: String as PropType<'English' | 'Turkish'>,
      default: 'English',
    },
  },
  setup(props) {
    const toast = useToast()

    const t = computed(() => {
      const isTr = props.selectedLanguage === 'Turkish'
      return {
        title: isTr ? 'Admin Sistem Monitör Merkezi' : 'Admin System Monitor Center',
        subtitle: isTr ? 'Sistem sağlığını ve canlı aktiviteleri buradan takip edebilirsiniz.' : 'Monitor system health and live activities from here.',
        live: isTr ? 'CANLI' : 'LIVE',
        offline: isTr ? 'ÇEVRİMDIŞI' : 'OFFLINE',
        refreshing: isTr ? 'Sistem verileri güncelleniyor...' : 'Refreshing system data...',
        refreshSuccess: isTr ? 'İzleme paneli aktif ve güncel.' : 'Monitoring dashboard is active and up to date.'
      }
    })

    const handleRefresh = () => {
      toast.info(t.value.refreshSuccess)
    }

    onMounted(() => {
      window.addEventListener('app:refetch', handleRefresh)
    })

    onBeforeUnmount(() => {
      window.removeEventListener('app:refetch', handleRefresh)
    })

    return { t }
  },
})
</script>

<style scoped lang="scss">
.admin-system-monitor {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  flex: 1;
  min-height: 0;
  height: 100%;
  overflow: hidden;
  animation: fadeIn 0.5s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

@media (max-width: 768px) {
  .admin-system-monitor {
    flex: none;
    min-height: auto;
    height: auto;
    overflow: visible;
    gap: 1rem;
  }
}
</style>
