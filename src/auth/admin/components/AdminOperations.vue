<template>
  <div class="admin-operations">
    <!-- Tab Navigation -->
    <div class="ops-tabs">
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
    <div class="ops-content-wrapper">
      <!-- Financial Settings (FX) -->
      <div v-if="activeSubTab === 'fx'" class="sub-tab-pane">
        <AdminFxControls :selectedLanguage="selectedLanguage" />
      </div>

      <!-- Announcements -->
      <div v-else-if="activeSubTab === 'announcements'" class="sub-tab-pane">
        <AdminAnnouncements :selectedLanguage="selectedLanguage" />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'
import AdminFxControls from './AdminFxControls.vue'
import AdminAnnouncements from './AdminAnnouncements.vue'

export default defineComponent({
  name: 'AdminOperations',
  components: {
    AdminFxControls,
    AdminAnnouncements
  },
  props: {
    selectedLanguage: {
      type: String as () => 'English' | 'Turkish',
      default: 'English'
    }
  },
  setup() {
    const activeSubTab = ref<'fx' | 'announcements'>('fx')

    const tabs = [
      { 
        id: 'fx', 
        labelEn: 'Financial Settings (FX)', 
        labelTr: 'Finansal Ayarlar (FX)',
        icon: 'money-bill-trend-up' 
      },
      { 
        id: 'announcements', 
        labelEn: 'Announcements', 
        labelTr: 'Duyurular',
        icon: 'bullhorn' 
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
.admin-operations {
  display: flex;
  flex-direction: column;
  gap: 24px;
  flex: 1;
  min-height: 0;
}

.ops-tabs {
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

.ops-content-wrapper {
  position: relative;
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.sub-tab-pane {
  display: flex;
  flex-direction: column;
  gap: 24px;
  flex: 1;
  min-height: 0;

  .pane-header {
    margin-bottom: 8px;
    padding-left: 4px;

    h2 {
      font-size: 28px;
      font-weight: 800;
      margin: 0;
      color: var(--header-text-color);
      letter-spacing: -0.03em;
      background: linear-gradient(135deg, var(--header-text-color) 0%, var(--normal-text-color) 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    p {
      margin: 6px 0 0;
      font-size: 15px;
      color: var(--normal-text-color);
      opacity: 0.8;
    }
  }
}


@media (max-width: 768px) {
  .ops-tabs {
    width: 100%;
    overflow-x: auto;
    
    .tab-btn {
      flex: 1;
      white-space: nowrap;
      padding: 10px 14px;
      font-size: 13px;
    }
  }
}
</style>
