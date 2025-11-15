<template>
  <div class="admin-dashboard-card-c">
    <div class="admin-dashboard-card-title">{{ title }}</div>
    <div class="admin-dashboard-card-value">
      {{ formatDate(adminInformationData) }}
    </div>
  </div>
</template>

<script lang="ts">
export default {
  name: 'AdminDashboardCard',
  props: {
    adminInformationData: {
      type: [String, Number],
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
  },
  methods: {
    formatDate(date: string | number): string {
      if (typeof date !== 'string') {
        return String(date)
      }
      const dateObj = new Date(date)
      const options: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }
      const formattedDate = dateObj.toLocaleString('en-US', options)
      return formattedDate
    },
  },
}
</script>

<style scoped lang="scss">
.admin-dashboard-card-c {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
  width: 100%;
  height: 100%;
  border-radius: var(--border-radius);
  border: 1px solid var(--border-color);
  padding: 1rem 1.5rem;

  .admin-dashboard-card-title {
    font-size: 1.2rem;
    font-weight: bold;
    color: var(--normal-text-color);
    margin-bottom: 0.5rem;
  }

  .admin-dashboard-card-value {
    font-size: 1.5rem;
    font-weight: 600;
    color: var(--header-text-color);
  }
}
</style>
