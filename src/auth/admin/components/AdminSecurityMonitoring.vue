<template>
  <div class="admin-security-monitoring">
    <!-- Tab Navigation -->
    <div class="sec-tabs">
      <button 
        v-for="tab in tabs" 
        :key="tab.id"
        class="tab-btn"
        :class="{ active: activeSubTab === tab.id }"
        @click="activeSubTab = tab.id"
      >
        <font-awesome-icon :icon="tab.icon" />
        <span>{{ selectedLanguage === 'Turkish' ? tab.labelTr : tab.labelEn }}</span>
      </button>
    </div>

    <!-- Tab Content -->
    <div class="sec-content-wrapper">
      <!-- Access Control (IP Blocking) -->
      <div v-if="activeSubTab === 'ip-blocking'" class="sub-tab-pane glass-card">
        <AdminSecurity :selectedLanguage="selectedLanguage" />
      </div>

      <!-- System Errors (Error Logs) -->
      <div v-else-if="activeSubTab === 'error-logs'" class="sub-tab-pane glass-card">
        <AdminErrorLogs :selectedLanguage="selectedLanguage" />
      </div>

      <!-- Audit Logs -->
      <div v-else-if="activeSubTab === 'audit-logs'" class="sub-tab-pane glass-card">
        <AdminAuditLogs :selectedLanguage="selectedLanguage" />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'
import AdminSecurity from './AdminSecurity.vue'
import AdminErrorLogs from './AdminErrorLogs.vue'
import AdminAuditLogs from './AdminAuditLogs.vue'
import { faShieldHalved, faTriangleExclamation, faListCheck } from '@/icons/fontawesome-icons'

export default defineComponent({
  name: 'AdminSecurityMonitoring',
  components: {
    AdminSecurity,
    AdminErrorLogs,
    AdminAuditLogs
  },
  props: {
    selectedLanguage: {
      type: String as () => 'English' | 'Turkish',
      default: 'English'
    }
  },
  setup() {
    const activeSubTab = ref<'ip-blocking' | 'error-logs' | 'audit-logs'>('ip-blocking')

    const tabs = [
      { 
        id: 'ip-blocking', 
        labelEn: 'Access Control', 
        labelTr: 'Erişim Kontrolü',
        icon: faShieldHalved 
      },
      { 
        id: 'error-logs', 
        labelEn: 'System Errors', 
        labelTr: 'Sistem Hataları',
        icon: faTriangleExclamation 
      },
      { 
        id: 'audit-logs', 
        labelEn: 'Audit Logs', 
        labelTr: 'Denetim Günlükleri',
        icon: faListCheck 
      }
    ] as const

    return {
      activeSubTab,
      tabs
    }
  }
})
</script>

<style scoped lang="scss">
.admin-security-monitoring {
  display: flex;
  flex-direction: column;
  gap: 24px;
  flex: 1;
  min-height: 0;
}

.sec-tabs {
  display: flex;
  gap: 8px;
  background: var(--background-color-soft);
  padding: 6px;
  border-radius: 16px;
  width: fit-content;
  border: 1px solid var(--border-color);
  backdrop-filter: blur(10px);
  margin-bottom: 8px;

  .tab-btn {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 12px 24px;
    border: none;
    background: transparent;
    color: var(--normal-text-color);
    font-size: 14px;
    font-weight: 600;
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    overflow: hidden;

    svg {
      font-size: 16px;
      opacity: 0.6;
      transition: all 0.3s ease;
    }

    &:hover {
      color: var(--header-text-color);
      background: rgba(120, 120, 120, 0.08);
      
      svg {
        opacity: 1;
        transform: scale(1.1);
      }
    }

    &.active {
      background: var(--background-color);
      color: var(--primary-green-color);
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.12);
      border: 1px solid var(--border-color);

      svg {
        opacity: 1;
        color: var(--primary-green-color);
      }

      &::after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 20%;
        right: 20%;
        height: 2px;
        background: var(--primary-green-color);
        border-radius: 2px;
      }
    }
  }
}

.sec-content-wrapper {
  position: relative;
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.sub-tab-pane {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;

  &.glass-card {
    background: var(--background-color);
    border: 1px solid var(--border-color);
    border-radius: 16px;
    padding: 0; // Content will handle internal padding
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    overflow: hidden; // Clip children to border radius
  }
}

@media (max-width: 900px) {
  .sec-tabs {
    width: 100%;
    overflow-x: auto;
    overflow-y: hidden;
    padding: 6px;
    gap: 6px;
    border-radius: 12px;
    display: flex;
    -webkit-overflow-scrolling: touch;
    
    &::-webkit-scrollbar {
      display: none;
    }
    
    .tab-btn {
      flex: 0 0 auto;
      min-width: max-content;
      padding: 10px 18px;
      font-size: 13px;
      gap: 8px;
      border-radius: 10px;

      svg { font-size: 14px; }
    }
  }

  .sub-tab-pane.glass-card {
    padding: 20px;
  }
}

@media (max-width: 520px) {
  .sec-tabs {
    .tab-btn {
      padding: 8px 14px;
      font-size: 12px;
      
      span {
        display: inline-block;
      }
    }
  }
}
</style>
