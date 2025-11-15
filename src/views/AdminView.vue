<template>
  <div class="admin-view-c">
    <div class="top-bar-wrapper" :class="{ scrolled: isScrolled }">
      <div class="wealthra-logo-wrapper">
        <img src="../icons/logo.svg" alt="logo" />
      </div>
      <div class="scroll-to-section-navbar">
        <div
          class="navbar-item"
          :class="{ active: activeSection === 'dashboard' }"
          @click="scrollToSection('dashboard')"
        >
          {{ selectedLanguage == 'English' ? 'Dashboard' : 'Gösterge Paneli' }}
        </div>
        <div
          class="navbar-item"
          :class="{ active: activeSection === 'user' }"
          @click="scrollToSection('user')"
        >
          {{ selectedLanguage == 'English' ? 'User' : 'Kullanıcı' }}
        </div>

        <div
          class="navbar-item"
          :class="{ active: activeSection === 'performance' }"
          @click="scrollToSection('performance')"
        >
          {{ selectedLanguage == 'English' ? 'Performance' : 'Performans' }}
        </div>
        <div
          class="navbar-item"
          :class="{ active: activeSection === 'errorlog' }"
          @click="scrollToSection('errorlog')"
        >
          {{ selectedLanguage == 'English' ? 'Error Log' : 'Hatalar' }}
        </div>
      </div>
      <UITopBar :selectedLanguage="selectedLanguage" @update-language="handleLanguageUpdate" />
    </div>
    <div class="admin-dashboard-wrapper" id="dashboard-section">
      <div class="admin-dashboard-title">
        {{ selectedLanguage == 'English' ? 'Admin Dashboard' : 'Yönetici Paneli' }}
      </div>
      <div class="admin-dashboard-card-grid">
        <AdminDashboardCard
          :adminInformationData="adminData.totalUserCount"
          :title="selectedLanguage == 'English' ? 'Total Users' : 'Toplam Kullanıcılar'"
        />
        <AdminDashboardCard
          :adminInformationData="adminData.activeUserCount"
          :title="selectedLanguage == 'English' ? 'Active Users' : 'Aktif Kullanıcılar'"
        />
        <AdminDashboardCard
          :adminInformationData="adminData.totalTransactionCount"
          :title="selectedLanguage == 'English' ? 'Total Transactions' : 'Toplam İşlemler'"
        />
        <AdminDashboardCard
          :adminInformationData="adminData.activeGoalCount"
          :title="selectedLanguage == 'English' ? 'Active Goals' : 'Aktif Hedefler'"
        />
        <AdminDashboardCard
          :adminInformationData="adminData.lastAlertTime"
          :title="selectedLanguage == 'English' ? 'Last Alert Time' : 'Son Uyarı Zamanı'"
        />
        <AdminDashboardCard
          :adminInformationData="adminData.totalErrorCount"
          :title="selectedLanguage == 'English' ? 'System Errors' : 'Sistem Hataları'"
        />
      </div>
    </div>
    <div class="user-management-wrapper" id="user-section">
      <div class="user-management-title">
        {{ selectedLanguage == 'English' ? 'User Management' : 'Kullanıcı Yönetimi' }}
      </div>
      <div class="user-management-view">
        <AdminUserManagementTable
          :pageNumber="adminData.pageNumber"
          :pageSize="adminData.pageSize"
          :data="adminData.data"
          :hasMoreItems="adminData.hasMoreItems"
          :totalCount="adminData.totalCount"
          :totalPages="adminData.totalPages"
          :selectedLanguage="selectedLanguage"
          @deleteUser="handleDeleteUser"
          @changePage="handleChangePage"
        />
      </div>
    </div>

    <div class="system-performance-wrapper" id="performance-section">
      <div class="system-performance-title">
        {{ selectedLanguage == 'English' ? 'System Performance' : 'Sistem Performansı' }}
      </div>
      <div class="system-performance-view">
        <AdminSystemPerformance
          :totalTransactionCountLastMonth="adminData.totalTransactionCountLastMonth"
          :totalTransactionCountNow="adminData.totalTransactionCountNow"
          :totalUserCountLastMonth="adminData.totalUserCountLastMonth"
          :totalUserCountNow="adminData.totalUserCountNow"
          :averageResponseTimeMs="adminData.averageResponseTimeMs"
          :errorRate="adminData.errorRate"
          :serverUptime="adminData.serverUptime"
          :dailyActiveUserCount="adminData.dailyActiveUserCount"
          :selectedLanguage="selectedLanguage"
        />
      </div>
    </div>
    <div class="error-logs-wrapper" id="errorlog-section">
      <div class="error-logs-title">
        {{ selectedLanguage == 'English' ? 'Error Logs' : 'Hata Kayıtları' }}
      </div>
      <div class="error-logs-view">
        <AdminErrorLogsTable
          :pageNumberError="adminData.pageNumber"
          :pageSizeError="adminData.pageSize"
          :dataError="adminData.dataError"
          :page="page"
          :hasMoreItemsError="adminData.hasMoreItemsError"
          :totalCountError="adminData.totalCountError"
          :totalPagesError="adminData.totalPagesError"
          :selectedLanguage="selectedLanguage"
          @changePage="handleErrorLogsChangePage"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import UITopBar from '@/components/UITopBar.vue'
import AdminDashboardCard from '@/components/AdminComponents/AdminDashboardCard.vue'
import AdminUserManagementTable from '@/components/AdminComponents/AdminUserManagementTable.vue'
import AdminSystemPerformance from '@/components/AdminComponents/AdminSystemPerformance.vue'
import AdminErrorLogsTable from '@/components/AdminComponents/AdminErrorLogsTable.vue'

import type { AdminData } from '@/interfaces/AdminData'
import { adminService } from '@/services/admin/admin.service'

export default {
  name: 'AdminView',
  components: {
    UITopBar,
    AdminDashboardCard,
    AdminUserManagementTable,
    AdminSystemPerformance,
    AdminErrorLogsTable,
  },
  data() {
    return {
      selectedLanguage: 'English',
      adminData: {} as AdminData,
      isScrolled: false,
      activeSection: 'dashboard',
      page: 1,
    }
  },
  methods: {
    // Handle Scroll
    handleScroll() {
      this.isScrolled = window.scrollY > 10
      this.updateActiveSection()
    },

    // Scroll to section
    scrollToSection(section: string) {
      this.activeSection = section
      const element = document.getElementById(`${section}-section`)
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' })
      }
    },

    // Update active section based on scroll position
    updateActiveSection() {
      const sections = ['dashboard', 'user', 'performance', 'errorlog']

      for (const section of sections) {
        const element = document.getElementById(`${section}-section`)
        if (element) {
          const { top, bottom } = element.getBoundingClientRect()
          if (top <= 200 && bottom > 200) {
            this.activeSection = section
            break
          }
        }
      }
    },

    // Handle Language Update
    handleLanguageUpdate(language: string) {
      this.selectedLanguage = language
      localStorage.setItem('selectedLanguage', language)
    },

    // Handle Error Logs Change Page
    handleErrorLogsChangePage(pageNumber: number) {
      this.page = pageNumber
      this.fetchErrorLogsData(this.page)
    },

    // Handle Delete User
    handleDeleteUser(id: string) {
      this.deleteUser(id)
    },

    // Handle Change Page
    handleChangePage(pageNumber: number) {
      this.fetchMetricsTotalUserData(pageNumber)
    },

    // Delete User
    async deleteUser(id: string) {
      try {
        await adminService.deleteUser(id)
        await this.fetchAdminData()
      } catch (error) {
        console.error('Error deleting user:', error)
      }
    },

    // Fetch Admin Controller User Data
    async fetchMetricsUserData() {
      try {
        const data = await adminService.getMetricsUser()
        this.adminData.totalUserCount = data.totalUserCount
        this.adminData.totalErrorCount = data.totalErrorCount
        this.adminData.activeUserCount = data.activeUserCount
        this.adminData.totalTransactionCount = data.totalTransactionCount
        this.adminData.activeGoalCount = data.activeGoalCount
        this.adminData.lastAlertTime = data.lastAlertTime
      } catch (error) {
        console.error('Error fetching user data:', error)
      }
    },

    // Fetch Admin Total User Data
    async fetchMetricsTotalUserData(pageNumber: number = 1) {
      try {
        const data = await adminService.getUsers(pageNumber, 10)

        this.adminData.pageNumber = data.pageNumber
        this.adminData.pageSize = data.pageSize
        this.adminData.data = data.data
        this.adminData.hasMoreItems = data.hasMoreItems
        this.adminData.totalCount = data.totalCount
        this.adminData.totalPages = data.totalPages
      } catch (error) {
        console.error('Error fetching total user data:', error)
      }
    },

    async fetchSystemPerformanceData() {
      try {
        const data = await adminService.getSystemMetrics()
        this.adminData.totalTransactionCountLastMonth = data.totalTransactionCountLastMonth
        this.adminData.totalTransactionCountNow = data.totalTransactionCountNow
        this.adminData.totalUserCountLastMonth = data.totalUserCountLastMonth
        this.adminData.totalUserCountNow = data.totalUserCountNow
        this.adminData.averageResponseTimeMs = data.averageResponseTimeMs
        this.adminData.errorRate = data.errorRate
        // Convert serverUptime object to string format
        const uptime = data.serverUptime
        this.adminData.serverUptime = `${uptime.days}d ${uptime.hours}h ${uptime.minutes}m ${uptime.seconds}s`
        this.adminData.dailyActiveUserCount = data.dailyActiveUserCount
      } catch (error) {
        console.error('Error fetching system performance data:', error)
      }
    },

    async fetchErrorLogsData(pageNumber: number = 1) {
      try {
        const data = await adminService.getErrorLogs(pageNumber, 5)

        this.adminData.pageNumberError = data.pageNumber
        this.adminData.pageSizeError = data.pageSize
        // Map ErrorLog to match AdminData interface
        this.adminData.dataError = data.data.map((error) => ({
          id: error.id,
          message: error.message,
          source: error.stackTrace || 'Unknown',
          endpoint: 'N/A',
          timestamp: error.timestamp,
          userId: error.userId || 'N/A',
          stackTraceSummary: null,
        }))
        this.adminData.hasMoreItemsError = data.hasMoreItems
        this.adminData.totalCountError = data.totalCount
        this.adminData.totalPagesError = data.totalPages
      } catch (error) {
        console.error('Error fetching error logs:', error)
      }
    },

    // Generic function to fetch admin data
    async fetchAdminData() {
      try {
        await this.fetchMetricsUserData()
        await this.fetchMetricsTotalUserData()
        await this.fetchSystemPerformanceData()
        await this.fetchErrorLogsData()

        setTimeout(() => {
          this.fetchAdminData()
        }, 60000)
      } catch (error) {
        console.error('Error fetching admin data:', error)
      }
    },
  },
  mounted() {
    this.selectedLanguage = localStorage.getItem('selectedLanguage') || 'English'
    window.addEventListener('scroll', this.handleScroll)
    this.fetchAdminData()
  },

  beforeUnmount() {
    window.removeEventListener('scroll', this.handleScroll)
  },
}
</script>

<style scoped lang="scss">
.admin-view-c {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  gap: 2rem;

  .top-bar-wrapper {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    padding: 1rem;
    transition: all 0.3s ease-in-out;

    &.scrolled {
      background-color: var(--background-color);
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      z-index: 1000;
      padding: 1.5rem;
      transition: all 0.3s ease-in-out;
    }

    .wealthra-logo-wrapper {
      display: flex;
      width: 100%;
      height: 100%;

      img {
        width: 200px;
        height: auto;
      }
    }

    .scroll-to-section-navbar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 100%;
      height: 100%;
      gap: 2rem;
      border: 1px solid var(--border-color);
      border-radius: var(--border-radius);
      padding: 0.5rem 1rem;

      .navbar-item {
        cursor: pointer;
        color: var(--header-text-color);
        width: 100%;
        font-size: 0.9rem;
        text-align: center;
        transition: all 0.3s ease;
        padding: 0.5rem;
        border-radius: var(--border-radius);

        &.active {
          background-color: var(--background-color-soft);
          color: var(--header-text-color);
        }

        &:hover {
          background-color: var(--background-color-soft);
        }
      }
    }
  }
  .admin-dashboard-wrapper {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    padding: 2rem;
    gap: 2rem;
    margin-top: 8rem;

    .admin-dashboard-title {
      display: flex;
      justify-content: flex-start;
      align-items: center;
      width: 100%;
      font-size: 1.8rem;
      font-weight: bold;
      color: var(--header-text-color);
    }

    .admin-dashboard-card-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(800px, 1fr));
      gap: 3rem;
      width: 100%;
    }
  }
  .user-management-wrapper {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    padding: 2rem;
    gap: 2rem;

    .user-management-title {
      display: flex;
      justify-content: flex-start;
      align-items: center;
      width: 100%;
      font-size: 1.8rem;
      font-weight: bold;
      color: var(--header-text-color);
    }
    .user-management-view {
      display: flex;
      justify-content: center;
      align-items: center;
      width: 100%;
      height: 100%;
    }
  }

  .system-performance-wrapper {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    padding: 2rem;
    gap: 2rem;

    .system-performance-title {
      display: flex;
      justify-content: flex-start;
      align-items: center;
      width: 100%;
      font-size: 1.8rem;
      font-weight: bold;
      color: var(--header-text-color);
    }
    .system-performance-view {
      display: flex;
      justify-content: center;
      align-items: center;
      width: 100%;
      height: 100%;
    }
  }
  .error-logs-wrapper {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    padding: 2rem;
    gap: 2rem;

    .error-logs-title {
      display: flex;
      justify-content: flex-start;
      align-items: center;
      width: 100%;
      font-size: 1.8rem;
      font-weight: bold;
      color: var(--header-text-color);
    }
    .error-logs-view {
      display: flex;
      justify-content: center;
      align-items: center;
      width: 100%;
      height: 100%;
    }
  }
}

@media (max-width: 768px) {
  .admin-view-c {
    gap: 1rem;

    .top-bar-wrapper {
      padding: 1rem;

      &.scrolled {
        padding: 1rem;
      }

      .wealthra-logo-wrapper {
        justify-content: center;
        img {
          width: 150px;
        }
      }

      .scroll-to-section-navbar {
        display: none;
      }
    }

    .admin-dashboard-wrapper {
      padding: 1rem;
      gap: 1rem;

      .admin-dashboard-title {
        font-size: 1.5rem;
      }

      .admin-dashboard-card-grid {
        grid-template-columns: 1fr;
        gap: 1.5rem;
      }
    }

    .user-management-wrapper,
    .system-performance-wrapper,
    .error-logs-wrapper {
      padding: 1rem;
      gap: 1rem;

      .user-management-title,
      .system-performance-title,
      .error-logs-title {
        font-size: 1.5rem;
      }

      .user-management-view,
      .system-performance-view,
      .error-logs-view {
        width: 100%;
        overflow-x: auto;
      }
    }
  }
}
</style>
