<template>
  <div class="horizontal-navbar-c">
    <div class="navbar">
      <div class="navbar-item-list">
        <div
          v-for="(page, index) in leftBarContent"
          :key="index"
          class="navbar-item"
          @click="routeToPage(page)"
        >
          <font-awesome-icon :icon="leftSidebarIconMap[page]" />
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { leftSidebarIconMap } from '../icons/fontawesome-icons'

export default defineComponent({
  name: 'UIHorizontalNavbar',

  data() {
    return {
      leftBarContent: [
        'Dashboard',
        'Income',
        'Expenses',
        'Budget',
        'Goals',
        'Analytics',
        'Settings',
      ] as Array<keyof typeof leftSidebarIconMap>,
      leftSidebarIconMap,
    }
  },

  methods: {
    routeToPage(page: string) {
      this.$router.push(page.toLowerCase())
    },
  },
})
</script>
<style scoped lang="scss">
.horizontal-navbar-c {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  border-bottom: 1px solid var(--border-color);

  .navbar {
    display: flex;
    justify-content: space-evenly;
    align-items: center;
    width: 100%;
    height: 100%;

    .navbar-item-list {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 16px;
      width: 100%;
      padding: 1rem 0;

      .navbar-item {
        cursor: pointer;
        transition: background-color 0.3s;
        display: flex;
        flex-direction: column;
        align-items: center;
        border-radius: 4px;

        img {
          width: 24px;
          height: 24px;
        }

        .item-label {
          font-size: 12px;
          margin-top: 4px;
        }
      }
    }
  }
}

@media (max-width: 768px) {
  .horizontal-navbar-c {
    height: auto;
    padding: 5px 0;

    .navbar-item-list {
      flex-wrap: wrap;
    }
  }
}
</style>
