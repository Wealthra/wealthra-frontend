<template>
  <div class="left-bar-c" :class="{ 'left-bar-c-expanded': sidebarOpen }">
    <div class="left-bar-c__top-wrapper">
      <div class="logo-wrapper">
        <img src="../icons/icon-small.svg" alt="logo" v-if="!sidebarOpen" />
        <img src="../icons/logo.svg" alt="logo" v-else />
      </div>
      <div class="close-icon-wrapper" @click="toggleSidebar" v-if="sidebarOpen">
        <font-awesome-icon
          :icon="arrowIcons.right"
          class="arrow-icon"
          :class="{ 'arrow--rotated': sidebarOpen }"
        />
      </div>
    </div>

    <div v-if="sidebarOpen" class="nav-items">
      <div
        v-for="(item, index) in leftBarContent[selectedLanguage].slice(0, 6)"
        :key="index"
        class="nav-item"
        :class="{ 'nav-item--active': item === selectedPage }"
        @click="routeToPage(item)"
      >
        <div class="nav-icon">
          <font-awesome-icon :icon="leftSidebarIconMap[computedItem(index)]" />
        </div>
        <span>{{ item }}</span>
      </div>
    </div>

    <div class="open-icon-wrapper" v-if="!sidebarOpen">
      <font-awesome-icon
        :icon="arrowIcons.right"
        class="arrow-icon"
        :class="{ 'arrow--rotated': sidebarOpen }"
        @click="toggleSidebar"
      />
    </div>

    <div v-if="sidebarOpen" class="settings-wrapper">
      <div
        class="settings-item"
        @click="routeToSettings()"
        :class="{ 'nav-item--active': 'Settings' === selectedPage || 'Ayarlar' === selectedPage }"
      >
        <div class="settings-icon">
          <font-awesome-icon :icon="leftSidebarIconMap.Settings" />
        </div>
        <span>{{ leftBarContent[selectedLanguage][6] }}</span>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { arrowIcons, leftSidebarIconMap } from '../icons/fontawesome-icons'

export default defineComponent({
  name: 'UILeftSideBar',
  props: {
    initialLanguage: {
      type: String,
      default: 'English',
    },

    selectedPage: {
      type: String,
      default: 'Dashboard',
    },
  },
  data() {
    return {
      selectedLanguage: this.getStoredLanguage() as 'English' | 'Turkish',
      sidebarOpen: false,
      leftBarContent: {
        English: ['Dashboard', 'Income', 'Expenses', 'Budget', 'Goals', 'Analytics', 'Settings'],
        Turkish: [
          'Kontrol Paneli',
          'Gelir',
          'Giderler',
          'Bütçe',
          'Hedefler',
          'Analizler',
          'Ayarlar',
        ],
      },
      leftSidebarIconMap,
      arrowIcons,
    }
  },
  watch: {
    initialLanguage(newVal) {
      this.selectedLanguage = newVal as 'English' | 'Turkish'
      this.saveLanguagePreference(this.selectedLanguage)
    },
  },
  methods: {
    getStoredLanguage(): 'English' | 'Turkish' {
      const storedLanguage = localStorage.getItem('selectedLanguage')
      return storedLanguage === 'English' || storedLanguage === 'Turkish'
        ? storedLanguage
        : (this.initialLanguage as 'English' | 'Turkish')
    },
    saveLanguagePreference(language: string) {
      localStorage.setItem('selectedLanguage', language)
    },
    toggleSidebar() {
      this.sidebarOpen = !this.sidebarOpen
      localStorage.setItem('sidebarOpen', this.sidebarOpen.toString())
    },
    computedItem(index: number) {
      return this.leftBarContent['English'][index]
    },
    routeToPage(item: string) {
      if (this.selectedLanguage === 'Turkish') {
        item = this.leftBarContent['English'][this.leftContentTurkishIndex(item)]
      }
      this.$router.push(item.toLowerCase())
    },
    routeToSettings() {
      this.$router.push('settings')
    },
    leftContentTurkishIndex(item: string) {
      return this.leftBarContent['Turkish'].indexOf(item)
    },
  },
  mounted() {
    this.sidebarOpen = localStorage.getItem('sidebarOpen') === 'true'
  },
})
</script>

<style scoped lang="scss">
.left-bar-c {
  display: flex;
  flex-direction: column;
  align-items: center;
  border-right: var(--border-color) solid 1px;
  padding: 0.5rem 0;
  width: 5%;
  height: 100%;
  position: sticky;
  top: 0;
  overflow: hidden;

  &-expanded {
    width: 15%;
    align-items: flex-start;
    padding: 0.5rem;
  }

  &__top-wrapper {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.5rem;
    margin-bottom: 0.5rem;
  }

  .logo-wrapper {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;

    img {
      width: 90%;
      height: auto;
      opacity: var(--opacity);
      object-fit: contain;
    }
  }

  .close-icon-wrapper,
  .open-icon-wrapper {
    display: flex;
    align-items: center;
    justify-content: center;

    img {
      margin-top: 0.3rem;
      opacity: var(--opacity);
      width: 1.4rem;
      height: 1.4rem;
      cursor: pointer;
    }
  }

  .close-icon-wrapper {
    margin-left: 1rem;
  }

  .arrow--rotated {
    transform: rotate(180deg);
  }

  .open-icon-wrapper {
    width: 100%;
    height: 100%;
    margin-top: auto;
    padding: 0.3rem;
  }

  .nav-items {
    display: flex;
    flex-direction: column;
    width: 100%;
    gap: 1rem;
    margin-bottom: auto;
    margin-top: 0.5rem;
  }

  .nav-item {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    gap: 0.6rem;
    padding: 0.5rem;
    cursor: pointer;
    color: var(--normal-text-color);
    font-size: 0.9rem;
    border-bottom: 1px solid var(--border-color);

    &:hover {
      background-color: var(--hover-color);
      transition: background-color 0.2s;
    }

    &--active {
      background-color: var(--active-color);
      color: var(--header-text-color);
      font-weight: 500;
      border-radius: 0.4rem;
      border-bottom: 1px solid transparent;
    }

    .nav-icon {
      width: 1.4rem;
      height: 1.4rem;
      display: flex;
      align-items: center;
      justify-content: center;

      img {
        width: 100%;
        height: 100%;
        opacity: var(--opacity);
      }
    }
  }

  .settings-wrapper {
    width: 100%;
    margin-top: 0.5rem;
    padding-top: 0.5rem;
    border-top: 1px solid var(--border-color);

    .settings-item {
      display: flex;
      align-items: center;
      justify-content: flex-start;
      gap: 0.6rem;
      padding: 0.5rem;
      border-radius: 0.4rem;
      cursor: pointer;
      color: var(--normal-text-color);
      font-size: 0.9rem;
      border-bottom: 1px solid transparent;

      &:hover {
        background-color: var(--hover-color);
        transition: all 0.3s ease;
      }

      &.nav-item--active {
        background-color: var(--active-color);
        color: var(--header-text-color);
        font-weight: 500;
      }

      .settings-icon {
        width: 1.4rem;
        height: 1.4rem;
        display: flex;
        align-items: center;
        justify-content: center;

        img {
          width: 100%;
          height: 100%;
          opacity: var(--opacity);
        }
      }
    }
  }
}
@media (max-width: 768px) {
}
</style>
