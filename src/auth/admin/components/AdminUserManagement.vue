<template>
  <div class="admin-user-management-container">
    <header class="header">
      <div v-if="isLoading" class="skeleton-box header__title-skeleton"></div>
      <h1 v-else class="header__title">{{ t.userList }}</h1>

      <div class="header__toolbar">
        <div class="toolbar-filters">
          <template v-if="isLoading">
            <div class="skeleton-box filter-skeleton search-skeleton"></div>
          </template>
          <template v-else>
            <div class="filter-group">
              <input
                v-model="searchQuery"
                type="text"
                class="filter-input"
                :placeholder="t.searchPlaceholder"
                @keyup.enter="handleSearch"
              />
            </div>
          </template>
        </div>
      </div>
    </header>

    <div class="table-wrap" :class="{ 'table-wrap--empty': !isLoading && users.length === 0 }">
      <div v-if="isLoading || users.length > 0" class="table" role="table">
        <div v-if="isLoading" class="table-header" role="row">
          <div v-for="i in 6" :key="i" class="col">
            <div class="skeleton-box header-skeleton"></div>
          </div>
        </div>
        <div v-else class="table-header" role="row">
          <div class="col col-user" role="columnheader">{{ t.user }}</div>
          <div class="col col-status" role="columnheader">{{ t.status }}</div>
          <div class="col col-tier" role="columnheader">{{ t.tier }}</div>
          <div class="col col-roles" role="columnheader">{{ t.roles }}</div>
          <div class="col col-last-login" role="columnheader">{{ t.lastLogin }}</div>
          <div class="col col-actions" role="columnheader">{{ t.actions }}</div>
        </div>

        <template v-if="isLoading">
          <div v-for="i in 5" :key="i" class="table-row skeleton-row" role="row">
            <div v-for="j in 6" :key="j" class="col">
              <div class="skeleton-box row-skeleton"></div>
            </div>
          </div>
        </template>
        <template v-else>
          <div
            v-for="user in users"
            :key="user.id"
            class="table-row clickable-row"
            role="row"
            @click="selectUser(user)"
          >
            <div class="col col-user">
              <span class="col-mobile-label">{{ t.user }}</span>
              <div class="user-info">
                <span class="user-name">{{ user.firstName }} {{ user.lastName }}</span>
                <span class="user-email">{{ user.email }}</span>
              </div>
            </div>
            <div class="col col-status">
              <span class="col-mobile-label">{{ t.status }}</span>
              <span
                class="status-badge"
                :class="isUserLocked(user) ? 'status-warning' : 'status-ok'"
              >
                {{ isUserLocked(user) ? t.locked : t.active }}
              </span>
            </div>
            <div class="col col-tier">
              <span class="col-mobile-label">{{ t.tier }}</span>
              <span class="col-value">T{{ user.subscriptionTier }}</span>
            </div>
            <div class="col col-roles">
              <span class="col-mobile-label">{{ t.roles }}</span>
              <div class="roles-list">
                <span v-for="role in user.roles" :key="role" class="role-tag">{{ role }}</span>
              </div>
            </div>
            <div class="col col-last-login">
              <span class="col-mobile-label">{{ t.lastLogin }}</span>
              <span class="col-value">{{
                user.lastLoginDate ? formatDate(user.lastLoginDate) : '—'
              }}</span>
            </div>
            <div class="col col-actions">
              <button class="row-action-btn" @click.stop="selectUser(user)">
                <font-awesome-icon :icon="arrowIcons.right" class="action-icon" />
              </button>
            </div>
          </div>
        </template>
      </div>

      <div v-if="!isLoading && users.length === 0" class="empty-state">
        <div class="empty-state__icon-wrap">
          <font-awesome-icon :icon="faUsersSlash" class="empty-state__icon" />
        </div>
        <h2 class="empty-state__heading">{{ t.noUsersFound }}</h2>
      </div>
    </div>

    <div v-if="isLoading" class="pagination-bar">
      <div class="pagination-results">
        <div class="skeleton-box results-skeleton"></div>
      </div>
      <div class="pagination-nav">
        <div class="skeleton-box nav-skeleton"></div>
      </div>
    </div>
    <div v-else-if="users.length > 0 && totalPages > 0" class="pagination-bar">
      <div class="pagination-results">
        <font-awesome-icon :icon="paginationIcons.results" class="pagination-results-icon" />
        <UISelect
          v-model="pageSize"
          :options="pageSizeOptions"
          compact
          class="page-size-select-premium"
          @update:model-value="handlePageSizeChange"
        />
        <span class="pagination-results-label">
          {{ selectedLanguage === 'English' ? 'of' : '/' }}
          <span class="pagination-total">{{ totalCount }}</span>
          {{ selectedLanguage === 'English' ? 'results' : 'sonuç' }}
        </span>
      </div>
      <div class="pagination-nav">
        <button
          class="pagination-btn"
          :disabled="currentPage === 1"
          @click="changePage(currentPage - 1)"
        >
          <font-awesome-icon :icon="arrowIcons.left" class="arrow-icon" />
        </button>

        <template v-for="page in displayedPages" :key="page">
          <button
            :class="['pagination-num', { active: page === currentPage }]"
            @click="changePage(page)"
          >
            {{ page }}
          </button>
        </template>

        <span v-if="showEllipsis" class="pagination-ellipsis">—</span>

        <button
          v-if="showLastPage"
          :class="['pagination-num', { active: totalPages === currentPage }]"
          @click="changePage(totalPages)"
        >
          {{ totalPages }}
        </button>

        <button
          class="pagination-btn"
          :disabled="currentPage === totalPages || totalPages === 0"
          @click="changePage(currentPage + 1)"
        >
          <font-awesome-icon :icon="arrowIcons.right" class="arrow-icon" />
        </button>
      </div>
    </div>

    <UISidePanelShell
      v-if="selectedUser"
      :isOpen="!!selectedUser"
      :title="t.userDetails"
      @close="closeDetails"
    >
      <div v-if="isDetailsLoading" class="details-loading">
        <UISkeletonLoader height="150px" border-radius="12px" class="mb-6" />
        <UISkeletonLoader height="100px" border-radius="12px" class="mb-6" />
        <UISkeletonLoader height="200px" border-radius="12px" />
      </div>
      <div v-else-if="userDetails" class="user-details-content">
        <div class="details-card main-info">
          <div class="identity-group">
            <div class="user-avatar-large">
              {{ userDetails?.firstName?.[0] }}{{ userDetails?.lastName?.[0] }}
            </div>
            <div class="identity-text">
              <h3>{{ userDetails.firstName }} {{ userDetails.lastName }}</h3>
              <p class="email-text">{{ userDetails.email }}</p>
              <div class="badges-row">
                <span class="premium-pill" :class="isCurrentlyLocked ? 'warning' : 'success'">
                  <div class="dot"></div>
                  {{ isCurrentlyLocked ? t.locked : t.active }}
                </span>
                <span class="premium-pill info">
                  {{
                    tierOptions.find(t => t.value === String(userDetails?.subscriptionTier))
                      ?.label || 'Tier ' + (userDetails?.subscriptionTier ?? '')
                  }}
                </span>
              </div>
            </div>
          </div>

          <div class="usage-quick-summary" v-if="userUsages && userUsages.length > 0">
            <div class="quick-stat">
              <span class="qs-label">OCR</span>
              <span class="qs-value">{{ userUsages[0].ocrRequestsThisMonth }}</span>
            </div>
            <div class="quick-stat">
              <span class="qs-label">STT</span>
              <span class="qs-value">{{ userUsages[0].sttRequestsThisMonth }}</span>
            </div>
            <div class="quick-stat">
              <span class="qs-label">Last Active</span>
              <span class="qs-value">{{
                userUsages[0].lastUsageActivityDate
                  ? formatDate(userUsages[0].lastUsageActivityDate)
                  : '—'
              }}</span>
            </div>
          </div>
        </div>

        <div class="extra-info-grid">
          <div class="info-item">
            <span class="label">{{ t.joined }}</span>
            <span class="value">{{ formatDate(userDetails.createdAt) }}</span>
          </div>
          <div class="info-item">
            <span class="label">{{ t.currency }}</span>
            <span class="value">{{ userDetails.preferredCurrency }}</span>
          </div>
        </div>

        <div class="details-section">
          <div class="section-title-row">
            <h4>{{ t.securityAndStatus }}</h4>
          </div>
          <div class="premium-action-list">
            <div class="action-item" :class="{ 'is-expanded': isLocking }">
              <button class="action-row-btn" @click="isLocking = !isLocking">
                <div class="icon-circle" :class="{ 'is-locked': isCurrentlyLocked }">
                  <font-awesome-icon :icon="isCurrentlyLocked ? faLockOpen : faLock" />
                </div>
                <div class="action-info">
                  <span class="action-name">{{
                    isCurrentlyLocked ? t.unlockAccount : t.lockAccount
                  }}</span>
                  <span class="action-desc">{{
                    isCurrentlyLocked ? 'Restores access immediately' : 'Temporarily suspend access'
                  }}</span>
                </div>
                <font-awesome-icon
                  :icon="arrowIcons.down"
                  class="chevron"
                  :class="{ rotated: isLocking }"
                />
              </button>

              <div v-if="isLocking" class="locking-expansion">
                <div v-if="!isCurrentlyLocked" class="lock-options">
                  <label class="compact-label">Lock Until (Optional)</label>
                  <DatePicker
                    v-model:value="lockUntilDate"
                    type="datetime"
                    format="YYYY-MM-DD HH:mm"
                    :placeholder="t.selectDate || 'Select date'"
                  />
                </div>
                <button class="confirm-action-btn" @click="toggleLock" :disabled="isLockingApi">
                  {{ isLockingApi ? '...' : isCurrentlyLocked ? 'Confirm Unlock' : 'Confirm Lock' }}
                </button>
              </div>
            </div>

            <div class="action-item" :class="{ 'is-expanded': isResetting }">
              <button class="action-row-btn" @click="isResetting = !isResetting">
                <div class="icon-circle">
                  <font-awesome-icon :icon="faKey" />
                </div>
                <div class="action-info">
                  <span class="action-name">{{ t.resetPassword }}</span>
                  <span class="action-desc">Force a new password for user</span>
                </div>
                <font-awesome-icon
                  :icon="arrowIcons.down"
                  class="chevron"
                  :class="{ rotated: isResetting }"
                />
              </button>

              <div v-if="isResetting" class="locking-expansion">
                <div class="lock-options">
                  <label class="compact-label">New Password</label>
                  <input
                    type="password"
                    v-model="newPassword"
                    class="compact-date-input"
                    placeholder="Enter new password"
                  />

                  <div class="password-requirements">
                    <div class="requirement" :class="{ met: hasUppercase }">
                      <font-awesome-icon :icon="hasUppercase ? checkIcon : xmarkIcon" />
                      <span>At least one uppercase ('A'-'Z')</span>
                    </div>
                    <div class="requirement" :class="{ met: hasDigit }">
                      <font-awesome-icon :icon="hasDigit ? checkIcon : xmarkIcon" />
                      <span>At least one digit ('0'-'9')</span>
                    </div>
                    <div class="requirement" :class="{ met: hasSpecial }">
                      <font-awesome-icon :icon="hasSpecial ? checkIcon : xmarkIcon" />
                      <span>At least one special character</span>
                    </div>
                    <div class="requirement" :class="{ met: newPassword.length >= 8 }">
                      <font-awesome-icon :icon="newPassword.length >= 8 ? checkIcon : xmarkIcon" />
                      <span>Minimum 8 characters</span>
                    </div>
                  </div>
                </div>
                <button
                  class="confirm-action-btn"
                  @click="confirmResetPassword"
                  :disabled="isResettingPassword || !isPasswordValid"
                >
                  {{ isResettingPassword ? '...' : 'Confirm New Password' }}
                </button>
              </div>
            </div>

            <button
              class="action-row-btn warning"
              :class="{ 'confirm-state': isRevokingConfirm, 'success-state': isRevoked }"
              @click="handleRevokeSessions"
            >
              <div class="icon-circle">
                <font-awesome-icon :icon="isRevoked ? checkIcon : faRightFromBracket" />
              </div>
              <div class="action-info">
                <span class="action-name">
                  {{
                    isRevokingConfirm
                      ? 'Are you sure?'
                      : isRevoked
                        ? 'Sessions Revoked!'
                        : t.revokeSessions
                  }}
                </span>
                <span class="action-desc">
                  {{
                    isRevokingConfirm
                      ? 'Click again to log out all devices'
                      : isRevoked
                        ? 'All active sessions have been killed'
                        : 'Sign out from all devices'
                  }}
                </span>
              </div>
              <font-awesome-icon
                :icon="arrowIcons.right"
                class="chevron"
                v-if="!isRevokingConfirm && !isRevoked"
              />
            </button>
          </div>
        </div>

        <div class="details-section">
          <div class="section-header-row">
            <h4>{{ t.permissionsAndPlan }}</h4>
            <div class="hierarchy-subtext">
              <font-awesome-icon :icon="faShieldHalved" class="shield-icon" />
              <span>{{ hierarchyText }}</span>
            </div>
          </div>

          <div class="input-group">
            <label>{{ t.roles }}</label>
            <div class="tier-update-row">
              <UIMultiSelect
                v-model="selectedRoles"
                :options="roleOptions"
                :placeholder="t.roles"
                class="flex-1"
              />
              <button
                class="apply-btn"
                @click="handleUpdateRoles"
                :disabled="isUpdatingRoles"
              >
                {{ isUpdatingRoles ? t.updating : t.apply }}
              </button>
              <span v-if="isRolesUpdated" class="inline-success-tag">
                <font-awesome-icon :icon="checkIcon" />
                {{ t.success }}!
              </span>
            </div>
          </div>

          <div class="input-group mt-4">
            <label>{{ t.subscriptionTier }}</label>
            <div class="tier-update-row">
              <UISelect
                v-model="selectedTier"
                :options="tierOptions"
                placeholder="Select Tier"
                class="flex-1"
              />
              <button class="apply-btn" @click="handleUpdateTier" :disabled="isUpdatingTier">
                {{ isUpdatingTier ? t.updating : t.apply }}
              </button>
              <span v-if="isTierUpdated" class="inline-success-tag">
                <font-awesome-icon :icon="checkIcon" />
                {{ t.success }}!
              </span>
            </div>
          </div>
        </div>
      </div>
    </UISidePanelShell>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted, onBeforeUnmount } from 'vue'
import DatePicker from 'vue-datepicker-next'
import 'vue-datepicker-next/index.css'
import { adminService } from '@/services/api/admin/admin.service'
import { accountService } from '@/services/api/account/account.service'
import type { AdminUser, AdminUserDetails } from '@/services/api/admin/admin.models'
import type { AccountUserUsageResponse } from '@/services/api/account/account.models'
import { getUserRoles, getUserId } from '@/utils/auth'
import UISkeletonLoader from '@/components/UISkeletonLoader.vue'
import UISidePanelShell from '@/components/UISidePanelShell.vue'
import UISelect from '@/components/UISelect.vue'
import UIMultiSelect from '@/components/UIMultiSelect.vue'
import { arrowIcons, paginationIcons } from '@/icons/fontawesome-icons'
import {
  faUsersSlash,
  faLockOpen,
  faLock,
  faKey,
  faRightFromBracket,
  faCheck,
  faXmark,
  faShieldHalved,
} from '@fortawesome/free-solid-svg-icons'

export default defineComponent({
  name: 'AdminUserManagement',
  components: {
    UISkeletonLoader,
    UISidePanelShell,
    UISelect,
    UIMultiSelect,
    DatePicker,
  },
  props: {
    selectedLanguage: {
      type: String,
      default: 'English',
    },
  },
  setup(props) {
    const users = ref<AdminUser[]>([])
    const isLoading = ref(true)
    const searchQuery = ref('')
    const currentPage = ref(1)
    const totalPages = ref(1)
    const totalCount = ref(0)
    const pageSize = ref(20)
    const pageSizeOptions = [
      { label: '5', value: '5' },
      { label: '10', value: '10' },
      { label: '20', value: '20' },
      { label: '50', value: '50' },
      { label: '100', value: '100' },
    ]

    const selectedUser = ref<AdminUser | null>(null)
    const userDetails = ref<AdminUserDetails | null>(null)
    const isDetailsLoading = ref(false)
    const userUsages = ref<AccountUserUsageResponse[]>([])

    const isResetting = ref(false)
    const isResettingPassword = ref(false)
    const newPassword = ref('')
    const isRevokingConfirm = ref(false)
    const isRevoked = ref(false)
    let revokeTimer: any = null

    const hasUppercase = computed(() => /[A-Z]/.test(newPassword.value))
    const hasSpecial = computed(() => /[^A-Za-z0-9]/.test(newPassword.value))
    const hasDigit = computed(() => /[0-9]/.test(newPassword.value))
    const isPasswordValid = computed(
      () =>
        hasUppercase.value && hasSpecial.value && hasDigit.value && newPassword.value.length >= 8
    )

    // Explicitly define icons for return to avoid potential scope issues
    const checkIcon = faCheck
    const xmarkIcon = faXmark

    const lockUntilDate = ref<Date | null>(new Date())
    const selectedTier = ref('')
    const isUpdatingTier = ref(false)
    const isTierUpdated = ref(false)
    const isLocking = ref(false)
    const isLockingApi = ref(false)

    const isCurrentlyLocked = computed(() => {
      if (!userDetails.value) return false
      return (
        userDetails.value.lockoutEnabled &&
        userDetails.value.lockoutEnd &&
        new Date(userDetails.value.lockoutEnd) > new Date()
      )
    })
    
    const selectedRoles = ref<string[]>([])
    const isUpdatingRoles = ref(false)
    const isRolesUpdated = ref(false)

    const currentUserId = getUserId()
    const currentUserRoles = getUserRoles()
    const isSuperAdmin = computed(() => currentUserRoles.includes('SuperAdmin'))

    const allRoles = ref(['SuperAdmin', 'Admin', 'Support', 'Finance', 'Moderator', 'Basic'])
    const tierOptions = ref([
      { label: 'Free', value: '1' },
      { label: 'Basic', value: '2' },
      { label: 'Limitless', value: '3' },
    ])

    const fetchLookupData = async () => {
      try {
        const lookup = await adminService.getLookupData()
        if (lookup.roles) allRoles.value = lookup.roles
        if (lookup.subscriptionTiers) {
          tierOptions.value = lookup.subscriptionTiers.map(t => ({
            label: t.name,
            value: String(t.id),
          }))
        }
      } catch (error) {
        console.error('Failed to fetch lookup data:', error)
      }
    }

    const canManageRole = (roleName: string) => {
      // Only SuperAdmin can manage Admin and SuperAdmin roles
      if (roleName === 'SuperAdmin' || roleName === 'Admin') {
        return isSuperAdmin.value
      }
      return true
    }

    const getHighestRole = (roles: string[]) => {
      if (roles.includes('SuperAdmin')) return 'SuperAdmin'
      if (roles.includes('Admin')) return 'Admin'
      if (roles.includes('Support')) return 'Support'
      if (roles.includes('Finance')) return 'Finance'
      if (roles.includes('Moderator')) return 'Moderator'
      if (roles.includes('Basic')) return 'Basic'
      return null
    }

    const isProtectedRole = (roleName: string) => {
      // Self-demotion protection: cannot remove your HIGHEST role
      if (userDetails.value?.id === currentUserId) {
        const highest = getHighestRole(userDetails.value.roles)
        return roleName === highest
      }
      return false
    }

    const roleOptions = computed(() => {
      return allRoles.value.map(role => ({
        label: role,
        value: role,
        disabled: !canManageRole(role) || isProtectedRole(role),
      }))
    })

    const hierarchyText = computed(() => {
      const isTr = props.selectedLanguage === 'Turkish'
      if (isSuperAdmin.value) {
        return isTr
          ? 'SuperAdmin olarak Admin ve altındaki tüm rolleri yönetebilirsiniz.'
          : 'As SuperAdmin, you can manage Admin and all roles below.'
      }
      return isTr
        ? 'Admin olarak sadece Support, Finance, Moderator ve Basic rollerini yönetebilirsiniz.'
        : 'As Admin, you can only manage Support, Finance, Moderator, and Basic roles.'
    })

    const t = computed(() => {
      const isTr = props.selectedLanguage === 'Turkish'
      return {
        userManagement: isTr ? 'Kullanıcı Yönetimi' : 'User Management',
        userList: isTr ? 'Kullanıcı Listesi' : 'User List',
        searchPlaceholder: isTr ? 'Email veya isim ile ara...' : 'Search by email or name...',
        search: isTr ? 'Ara' : 'Search',
        user: isTr ? 'Kullanıcı' : 'User',
        status: isTr ? 'Durum' : 'Status',
        tier: isTr ? 'Katman' : 'Tier',
        roles: isTr ? 'Roller' : 'Roles',
        lastLogin: isTr ? 'Son Giriş' : 'Last Login',
        actions: isTr ? 'İşlemler' : 'Actions',
        noUsersFound: isTr ? 'Kullanıcı bulunamadı' : 'No users found',
        active: isTr ? 'Aktif' : 'Active',
        locked: isTr ? 'Kilitli' : 'Locked',
        manage: isTr ? 'Yönet' : 'Manage',
        page: isTr ? 'Sayfa' : 'Page',
        userDetails: isTr ? 'Kullanıcı Detayları' : 'User Details',
        securityAndStatus: isTr ? 'Güvenlik ve Durum' : 'Security & Status',
        lockAccount: isTr ? 'Hesabı Kilitle' : 'Lock Account',
        unlockAccount: isTr ? 'Kilidi Aç' : 'Unlock Account',
        resetPassword: isTr ? 'Şifre Sıfırla' : 'Reset Password',
        revokeSessions: isTr ? 'Oturumları Sonlandır' : 'Revoke Sessions',
        permissionsAndPlan: isTr ? 'Yetkiler ve Plan' : 'Permissions & Plan',
        subscriptionTier: isTr ? 'Abonelik Katmanı' : 'Subscription Tier',
        apply: isTr ? 'Uygula' : 'Apply',
        updating: isTr ? 'Güncelleniyor...' : 'Updating...',
        usageActivity: isTr ? 'Kullanım Aktivitesi' : 'Usage Activity',
        lastActivity: isTr ? 'Son Aktivite' : 'Last Activity',
        noUsageData: isTr ? 'Kullanım verisi bulunamadı' : 'No usage data found',
        resetPasswordTitle: isTr ? 'Şifreyi Sıfırla' : 'Reset Password',
        enterNewPasswordFor: isTr ? 'İçin yeni şifre girin:' : 'Enter new password for:',
        newPasswordPlaceholder: isTr ? 'Yeni şifre' : 'New password',
        cancel: isTr ? 'İptal' : 'Cancel',
        resetting: isTr ? 'Sıfırlanıyor...' : 'Resetting...',
        success: isTr ? 'Başarılı' : 'Success',
        error: isTr ? 'Hata' : 'Error',
        joined: isTr ? 'Kayıt' : 'Joined',
        currency: isTr ? 'Para Birimi' : 'Currency',
        resultsPerPage: isTr ? 'Sonuçlar:' : 'Results per page:',
        selectDate: isTr ? 'Tarih seçin' : 'Select date',
      }
    })

    const fetchUsers = async () => {
      isLoading.value = true
      try {
        const response = await adminService.getUsers(
          currentPage.value,
          pageSize.value,
          searchQuery.value
        )
        users.value = response.items
        totalPages.value = response.totalPages
        totalCount.value = response.totalCount
      } catch (error) {
        console.error('Error fetching users:', error)
      } finally {
        isLoading.value = false
      }
    }

    const handleSearch = () => {
      currentPage.value = 1
      fetchUsers()
    }

    const changePage = (page: number) => {
      if (page >= 1 && page <= totalPages.value) {
        currentPage.value = page
        fetchUsers()
      }
    }

    const handlePageSizeChange = (val: string | number) => {
      pageSize.value = Number(val)
      currentPage.value = 1
      fetchUsers()
    }

    const displayedPages = computed(() => {
      const maxVisiblePages = 5
      const halfVisible = Math.floor(maxVisiblePages / 2)
      let startPage = Math.max(1, currentPage.value - halfVisible)
      const endPage = Math.min(startPage + maxVisiblePages - 1, totalPages.value)
      if (totalPages.value - endPage < halfVisible) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1)
      }
      const pages = []
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i)
      }
      return pages
    })

    const showEllipsis = computed(() => {
      return (
        displayedPages.value.length > 0 &&
        displayedPages.value[displayedPages.value.length - 1] < totalPages.value - 1
      )
    })

    const showLastPage = computed(() => {
      return (
        displayedPages.value.length > 0 &&
        displayedPages.value[displayedPages.value.length - 1] < totalPages.value
      )
    })

    const selectUser = async (user: AdminUser) => {
      selectedUser.value = user
      isDetailsLoading.value = true
      try {
        const [details, usages] = await Promise.all([
          adminService.getUserDetails(user.id),
          accountService.getAdminUsages(user.email),
        ])
        userDetails.value = details
        userUsages.value = usages
        selectedTier.value = String(details.subscriptionTier)
        selectedRoles.value = [...details.roles]
      } catch (error) {
        console.error('Error fetching user details:', error)
      } finally {
        isDetailsLoading.value = false
      }
    }

    const closeDetails = () => {
      selectedUser.value = null
      userDetails.value = null
      userUsages.value = []
      isLocking.value = false
      lockUntilDate.value = new Date()
      isResetting.value = false
      newPassword.value = ''
      isRevokingConfirm.value = false
      if (revokeTimer) clearTimeout(revokeTimer)
    }

    const toggleLock = async () => {
      if (!userDetails.value) return
      const locked = isCurrentlyLocked.value
      isLockingApi.value = true
      try {
        await adminService.lockUser(
          userDetails.value.id,
          !locked,
          !locked && lockUntilDate.value ? lockUntilDate.value.toISOString() : undefined
        )
        const updated = await adminService.getUserDetails(userDetails.value.id)
        userDetails.value = updated
        isLocking.value = false
        lockUntilDate.value = new Date()
        fetchUsers()
      } catch (error) {
        alert('Failed to toggle lock')
      } finally {
        isLockingApi.value = false
      }
    }

    const handleRevokeSessions = async () => {
      if (!userDetails.value) return

      if (!isRevokingConfirm.value) {
        isRevokingConfirm.value = true
        revokeTimer = setTimeout(() => {
          isRevokingConfirm.value = false
        }, 3000)
        return
      }

      if (revokeTimer) clearTimeout(revokeTimer)
      isRevokingConfirm.value = false

      try {
        await adminService.revokeSessions(userDetails.value.id)
        isRevoked.value = true
        setTimeout(() => {
          isRevoked.value = false
        }, 3000)
      } catch (error) {
        alert('Failed to revoke sessions')
      }
    }

    const confirmResetPassword = async () => {
      if (!userDetails.value || !newPassword.value) return
      isResettingPassword.value = true
      try {
        await adminService.setPassword(userDetails.value.id, newPassword.value)
        alert('Password reset successfully')
        isResetting.value = false
        newPassword.value = ''
      } catch (error: any) {
        const errorMsg = error.message || 'Failed to reset password'
        alert(`Error: ${errorMsg}. Please ensure the password meets all requirements.`)
      } finally {
        isResettingPassword.value = false
      }
    }

    const handleUpdateRoles = async () => {
      if (!userDetails.value) return
      isUpdatingRoles.value = true
      try {
        await adminService.updateRoles(userDetails.value.id, selectedRoles.value)
        userDetails.value.roles = [...selectedRoles.value]
        isRolesUpdated.value = true
        fetchUsers()
        setTimeout(() => {
          isRolesUpdated.value = false
        }, 3000)
      } catch (error) {
        console.error('Failed to update roles:', error)
      } finally {
        isUpdatingRoles.value = false
      }
    }

    const handleUpdateTier = async () => {
      if (!userDetails.value || !selectedTier.value) return
      isUpdatingTier.value = true
      try {
        await accountService.updateTier({
          email: userDetails.value.email,
          newTier: parseInt(selectedTier.value),
        })
        userDetails.value.subscriptionTier = parseInt(selectedTier.value)
        isTierUpdated.value = true
        setTimeout(() => {
          isTierUpdated.value = false
        }, 3000)
        fetchUsers()
      } catch (error) {
        alert('Failed to update tier')
      } finally {
        isUpdatingTier.value = false
      }
    }

    const formatDate = (dateStr: string) => {
      return new Date(dateStr).toLocaleDateString(
        props.selectedLanguage === 'Turkish' ? 'tr-TR' : 'en-US',
        {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }
      )
    }

    onMounted(() => {
      fetchUsers()
      fetchLookupData()
      window.addEventListener('app:refetch', fetchUsers)
    })

    onBeforeUnmount(() => {
      window.removeEventListener('app:refetch', fetchUsers)
    })

    const isUserLocked = (u: any) => {
      if (!u) return false
      return u.lockoutEnabled && u.lockoutEnd && new Date(u.lockoutEnd) > new Date()
    }

    return {
      users,
      isLoading,
      searchQuery,
      currentPage,
      totalPages,
      totalCount,
      pageSize,
      pageSizeOptions,
      displayedPages,
      showEllipsis,
      showLastPage,
      selectedUser,
      userDetails,
      isDetailsLoading,
      userUsages,
      newPassword,
      isResettingPassword,
      selectedTier,
      isUpdatingTier,
      allRoles,
      tierOptions,
      t,
      handleSearch,
      changePage,
      handlePageSizeChange,
      selectUser,
      closeDetails,
      toggleLock,
      handleRevokeSessions,
      confirmResetPassword,
      handleUpdateRoles,
      handleUpdateTier,
      formatDate,
      arrowIcons,
      paginationIcons,
      faUsersSlash,
      faLockOpen,
      faLock,
      faKey,
      faRightFromBracket,
      faShieldHalved,
      isLocking,
      isLockingApi,
      lockUntilDate,
      isCurrentlyLocked,
      isUserLocked,
      isResetting,
      hasUppercase,
      hasSpecial,
      isPasswordValid,
      hasDigit,
      checkIcon,
      xmarkIcon,
      isRevokingConfirm,
      isRevoked,
      canManageRole,
      isProtectedRole,
      isTierUpdated,
      selectedRoles,
      isUpdatingRoles,
      isRolesUpdated,
      roleOptions,
      hierarchyText,
    }
  },
})
</script>

<style scoped lang="scss">
.admin-user-management-container {
  display: flex;
  flex-direction: column;
  width: 100%;
  flex: 1;
  min-height: 0;
  background-color: var(--background-color);
  border-radius: var(--border-radius);
  padding: 1.25rem 1rem;

  .header {
    flex-shrink: 0;
    margin-bottom: 1.25rem;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    flex-wrap: wrap;
  }

  .header__title {
    font-size: 1.125rem;
    font-weight: 700;
    margin: 0;
    color: var(--header-text-color);
  }

  .header__toolbar {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: flex-end;
    gap: 0.75rem;
  }

  .header__title-skeleton {
    width: 200px;
    height: 1.5rem;
    border-radius: 4px;
    @media (max-width: 1024px) {
      display: none;
    }
  }

  .toolbar-filters {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .filter-input {
    min-width: 15rem;
    padding: 0.5rem 0.75rem;
    border-radius: var(--border-radius);
    border: 1px solid var(--border-color);
    background-color: var(--background-color);
    color: var(--header-text-color);
    font-size: 0.75rem;
    &:focus {
      outline: none;
      border-color: var(--primary-green-color);
      box-shadow: 0 0 0 2px rgba(92, 184, 92, 0.2);
    }
  }

  .filter-skeleton {
    width: 15rem;
    height: 2.25rem;
    border-radius: var(--border-radius);
  }

  .table-wrap {
    flex: 1;
    min-height: 0;
    overflow: auto;
    &.table-wrap--empty {
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }

  .table {
    width: 100%;
    display: flex;
    flex-direction: column;
  }

  .table-header {
    display: grid;
    grid-template-columns: minmax(0, 2.5fr) 100px 80px minmax(0, 1.5fr) 150px 48px;
    gap: 1rem;
    padding: 0.6rem 1rem;
    border-bottom: 1px solid var(--border-color);
    font-weight: 600;
    font-size: 0.7rem;
    color: var(--normal-text-color);
    text-transform: uppercase;
    letter-spacing: 0.05em;

    .header-skeleton {
      width: 80%;
      height: 0.75rem;
      border-radius: 4px;
    }
  }

  .table-row {
    display: grid;
    grid-template-columns: minmax(0, 2.5fr) 100px 80px minmax(0, 1.5fr) 150px 48px;
    gap: 1rem;
    padding: 0.7rem 1rem;
    align-items: center;
    border-bottom: 1px solid var(--border-color);
    transition: background 0.2s;

    &.clickable-row {
      cursor: pointer;
      &:hover {
        background: var(--background-color-soft);
      }
    }
  }

  .col {
    min-width: 0;
    display: flex;
    align-items: center;
  }

  .user-info {
    display: flex;
    flex-direction: column;
    min-width: 0;
    .user-name {
      font-weight: 600;
      color: var(--header-text-color);
      font-size: 0.8rem;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .user-email {
      font-size: 0.7rem;
      color: var(--normal-text-color);
      opacity: 0.7;
    }
  }

  .status-badge {
    display: inline-block;
    padding: 0.25rem 0.5rem;
    border-radius: var(--border-radius);
    font-size: 0.7rem;
    font-weight: 600;
    &.status-ok {
      background-color: rgba(92, 184, 92, 0.15);
      color: var(--primary-green-color);
    }
    &.status-warning {
      background-color: rgba(239, 68, 68, 0.15);
      color: #ef4444;
    }
  }

  .col-value {
    font-size: 0.75rem;
    color: var(--normal-text-color);
  }

  .roles-list {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
  }

  .role-tag {
    font-size: 10px;
    background: var(--primary-green-color);
    color: white;
    padding: 1px 6px;
    border-radius: 4px;
  }

  .row-action-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 2rem;
    height: 2rem;
    padding: 0;
    border: none;
    border-radius: 6px;
    background: transparent;
    color: var(--normal-text-color);
    cursor: pointer;
    .action-icon {
      font-size: 0.75rem;
    }
    &:hover {
      background-color: var(--background-color-soft);
    }
  }

  .pagination-bar {
    flex-shrink: 0;
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    padding: 1rem 0 0;
    margin-top: 0.5rem;
    border-top: 1px solid var(--border-color);

    .pagination-results {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.75rem;
      color: var(--normal-text-color);
      white-space: nowrap;
    }
    .pagination-results-icon {
      color: var(--header-text-color);
      font-size: 0.875rem;
    }
    .page-size-select-premium {
      :deep(.select-trigger) {
        padding: 0;
        border: none;
        background: transparent;
        height: auto;
        min-width: 0;
        font-size: 0.75rem;
        font-weight: 700;
        color: var(--header-text-color);
        gap: 0.25rem;
        &:hover {
          background: transparent;
          color: var(--primary-green-color);
        }
        .select-icon {
          font-size: 0.65rem;
        }
      }
    }
    .pagination-nav {
      display: flex;
      align-items: center;
      gap: 0.25rem;
    }
    .pagination-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 1.75rem;
      height: 1.75rem;
      border: 1px solid var(--primary-green-color);
      border-radius: var(--border-radius);
      background-color: var(--primary-green-color);
      color: white;
      cursor: pointer;
      &:disabled {
        opacity: 0.4;
        cursor: not-allowed;
      }
      .arrow-icon {
        font-size: 0.65rem;
      }
    }
    .pagination-num {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 1.75rem;
      height: 1.75rem;
      padding: 0 0.4rem;
      border: 1px solid var(--border-color);
      border-radius: var(--border-radius);
      background-color: var(--background-color);
      color: var(--header-text-color);
      font-size: 0.75rem;
      font-weight: 500;
      cursor: pointer;
      &.active {
        background-color: var(--primary-green-color);
        border-color: var(--primary-green-color);
        color: white;
      }
    }
    .pagination-ellipsis {
      padding: 0 0.25rem;
      font-size: 0.75rem;
      color: var(--normal-text-color);
    }
  }

  .results-skeleton {
    width: 120px;
    height: 1.25rem;
    border-radius: 4px;
  }
  .nav-skeleton {
    width: 180px;
    height: 1.75rem;
    border-radius: var(--border-radius);
  }
  .row-skeleton {
    width: 80%;
    height: 1rem;
    border-radius: 4px;
  }

  .empty-state {
    flex: 1;
    min-height: 16rem;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    text-align: center;
    padding: 3rem 2rem;
  }
  .empty-state__icon-wrap {
    width: 5.5rem;
    height: 5.5rem;
    border-radius: var(--border-radius);
    background-color: rgba(92, 184, 92, 0.12);
    color: var(--primary-green-color);
    margin-bottom: 1.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .empty-state__icon {
    font-size: 2.5rem;
  }
  .empty-state__heading {
    margin: 0;
    font-size: 1.375rem;
    font-weight: 700;
    color: var(--header-text-color);
  }

  .col-mobile-label {
    display: none;
  }
}

@media (max-width: 1024px) {
  .admin-user-management-container {
    padding: 1rem;
    .header {
      flex-direction: column;
      align-items: stretch;
      gap: 0.75rem;
    }
    .header__title {
      display: none;
    }
    .header__toolbar {
      flex-direction: column;
      align-items: stretch;
      gap: 0.75rem;
    }
    .filter-input,
    .filter-skeleton {
      width: 100%;
      min-width: 0;
    }
    .table-header {
      display: none !important;
    }
    .table-row {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: 0.5rem;
      padding: 1rem;
      border: 1px solid var(--border-color);
      border-radius: var(--border-radius);
      margin-bottom: 0.75rem;
      .col {
        display: flex;
        align-items: flex-start;
        gap: 0.5rem;
        width: 100%;
      }
      .col-mobile-label {
        display: inline;
        min-width: 6rem;
        font-size: 0.75rem;
        font-weight: 600;
        color: var(--normal-text-color);
      }
      .col-actions {
        margin-top: 0.5rem;
        padding-top: 0.75rem;
        border-top: 1px solid var(--border-color);
        width: 100%;
        justify-content: flex-start;
      }
    }
  }
}

/* Modal Styles (Matches Goals exactly) */
.modal-overlay {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}
.modal-content {
  background-color: var(--background-color);
  border-radius: var(--border-radius);
  width: 90%;
  max-width: 28rem;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  .modal-header {
    flex-shrink: 0;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 1.25rem;
    border-bottom: 1px solid var(--border-color);
    h3 {
      margin: 0;
      font-size: 1.25rem;
      color: var(--header-text-color);
    }
    .close-btn {
      background: none;
      border: none;
      font-size: 1.5rem;
      cursor: pointer;
      color: var(--normal-text-color);
      padding: 0.25rem;
      line-height: 1;
    }
  }
  .modal-body {
    display: flex;
    flex-direction: column;
    padding: 1.25rem;
    gap: 1.25rem;
    overflow-y: auto;
  }
  .form-group {
    display: flex;
    flex-direction: column;
    gap: 0.375rem;
    label {
      font-size: 0.75rem;
      font-weight: 600;
      color: var(--normal-text-color);
    }
  }
  .modal-input {
    width: 100%;
    height: 2.75rem;
    padding: 0.75rem 1rem;
    border: 1px solid var(--border-color);
    border-radius: var(--border-radius);
    background-color: var(--background-color);
    color: var(--header-text-color);
    font-size: 0.9375rem;
  }
  .add-btn {
    width: 100%;
    padding: 0.75rem 1rem;
    border: none;
    border-radius: var(--border-radius);
    background-color: var(--primary-green-color);
    color: white;
    font-weight: 600;
    font-size: 0.9375rem;
    cursor: pointer;
  }
  .cancel-btn {
    padding: 0.75rem 1rem;
    border: 1px solid var(--border-color);
    border-radius: var(--border-radius);
    background: transparent;
    color: var(--header-text-color);
    font-weight: 600;
    cursor: pointer;
  }
}

/* Side Panel Deta/* Side Panel Details - Minimalistic Refactor */
.user-details-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding-bottom: 2rem;
}

.main-info {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  text-align: left;
  padding: 24px;
  border-radius: 20px;
  background: var(--background-color-soft);
  border: 1px solid var(--border-color);

  .identity-group {
    display: flex;
    align-items: center;
    gap: 16px;
  }
  .identity-text {
    display: flex;
    flex-direction: column;
  }

  .user-avatar-large {
    width: 64px;
    height: 64px;
    border-radius: 12px;
    background: var(--primary-green-color);
    color: white;
    font-size: 1.5rem;
    font-weight: 700;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 8px 16px rgba(92, 184, 92, 0.2);
    flex-shrink: 0;
  }

  h3 {
    margin: 0;
    font-size: 1.1rem;
    font-weight: 700;
    color: var(--header-text-color);
  }
  .email-text {
    margin: 2px 0 10px;
    color: var(--normal-text-color);
    opacity: 0.5;
    font-size: 0.75rem;
  }
  .badges-row {
    display: flex;
    gap: 8px;
    justify-content: flex-start;
    align-items: center;
  }

  .premium-pill {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 4px 10px;
    border-radius: 100px;
    font-size: 0.6rem;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    background: var(--background-color);
    border: 1px solid var(--border-color);
    color: var(--normal-text-color);
    .dot {
      width: 5px;
      height: 5px;
      border-radius: 50%;
      background: #ccc;
    }
    &.success {
      color: var(--primary-green-color);
      border-color: rgba(92, 184, 92, 0.2);
      background: rgba(92, 184, 92, 0.05);
      .dot {
        background: var(--primary-green-color);
      }
    }
    &.warning {
      color: #ef4444;
      border-color: rgba(239, 68, 68, 0.2);
      background: rgba(239, 68, 68, 0.05);
      .dot {
        background: #ef4444;
      }
    }
    &.info {
      color: var(--primary-green-color);
      border-color: var(--border-color);
    }
  }

  .usage-quick-summary {
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    gap: 1.25rem;
    padding-top: 1.25rem;
    border-top: 1px solid var(--border-color);

    .quick-stat {
      display: flex;
      flex-direction: column;
      gap: 1px;
      .qs-label {
        font-size: 0.55rem;
        font-weight: 800;
        text-transform: uppercase;
        color: var(--normal-text-color);
        opacity: 0.4;
      }
      .qs-value {
        font-size: 0.75rem;
        font-weight: 700;
        color: var(--header-text-color);
      }
    }
  }
}

.extra-info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;

  .info-item {
    background: var(--background-color-soft);
    padding: 12px;
    border-radius: 12px;
    display: flex;
    flex-direction: column;
    gap: 4px;
    border: 1px solid var(--border-color);
    .label {
      font-size: 0.65rem;
      font-weight: 600;
      color: var(--normal-text-color);
      opacity: 0.5;
      text-transform: uppercase;
    }
    .value {
      font-size: 0.8125rem;
      font-weight: 600;
      color: var(--header-text-color);
    }
  }
}

.details-section {
  .section-header-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 12px;
    gap: 12px;
    flex-wrap: wrap;
  }
  .hierarchy-subtext {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 6px 10px;
    background: rgba(92, 184, 92, 0.08);
    border: 1px solid rgba(92, 184, 92, 0.15);
    border-radius: 8px;
    font-size: 0.75rem;
    color: var(--primary-green-color);
    font-weight: 500;
    line-height: 1.2;
    max-width: 100%;

    .shield-icon {
      font-size: 0.85rem;
      opacity: 0.8;
    }
  }
  .section-title-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16px;
  }
  h4 {
    margin: 0;
    font-size: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: var(--normal-text-color);
    opacity: 0.6;
    font-weight: 800;
  }
}

.premium-action-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.action-row-btn {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px;
  border-radius: 12px;
  border: 1px solid transparent;
  background: var(--background-color-soft);
  cursor: pointer;
  transition:
    background 0.2s,
    border-color 0.2s,
    box-shadow 0.2s;
  text-align: left;
  z-index: 2;

  .icon-circle {
    width: 40px;
    height: 40px;
    border-radius: 10px;
    background: rgba(92, 184, 92, 0.1);
    color: var(--primary-green-color);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.1rem;
    flex-shrink: 0;
    transition: all 0.2s;
    &.is-locked {
      background: rgba(239, 68, 68, 0.1);
      color: #ef4444;
    }
  }

  .action-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 2px;
    .action-name {
      font-size: 0.875rem;
      font-weight: 600;
      color: var(--header-text-color);
    }
    .action-desc {
      font-size: 0.75rem;
      color: var(--normal-text-color);
      opacity: 0.6;
    }
  }

  .chevron {
    font-size: 0.75rem;
    color: var(--normal-text-color);
    opacity: 0.3;
    transition: transform 0.3s;
    &.rotated {
      transform: rotate(180deg);
    }
  }

  &:hover {
    background: var(--background-color);
    border-color: var(--border-color);
    .chevron {
      opacity: 0.6;
    }
  }

  &.warning {
    &:hover {
      border-color: rgba(239, 68, 68, 0.2);
    }
    .icon-circle {
      background: rgba(239, 68, 68, 0.1);
      color: #ef4444;
    }
  }

  &.confirm-state {
    background: rgba(239, 68, 68, 0.05);
    border-color: rgba(239, 68, 68, 0.3);
    .action-name {
      color: #ef4444;
    }
  }

  &.success-state {
    background: rgba(92, 184, 92, 0.05);
    border-color: rgba(92, 184, 92, 0.3);
    .action-name {
      color: var(--primary-green-color);
    }
    .icon-circle {
      background: rgba(92, 184, 92, 0.1);
      color: var(--primary-green-color);
    }
  }
}

.action-item.is-expanded {
  .action-row-btn {
    background: var(--background-color);
    border-color: var(--border-color);
    border-bottom-left-radius: 0;
    border-bottom-right-radius: 0;
    border-bottom-color: transparent;
  }
}

.locking-expansion {
  padding: 16px;
  background: var(--background-color);
  border: 1px solid var(--border-color);
  border-top: none;
  border-radius: 0 0 12px 12px;
  margin-top: -1px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
  position: relative;
  z-index: 1;
  animation: slideDownFade 0.25s ease-out;

  @keyframes slideDownFade {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .lock-options {
    display: flex;
    flex-direction: column;
    gap: 8px;
    .compact-label {
      font-size: 0.65rem;
      font-weight: 800;
      text-transform: uppercase;
      color: var(--normal-text-color);
      opacity: 0.5;
      letter-spacing: 0.05em;
    }
    .compact-date-input {
      width: 100%;
      padding: 10px 14px;
      border-radius: 10px;
      border: 1px solid var(--border-color);
      background: var(--background-color-soft);
      color: var(--header-text-color);
      font-size: 0.9rem;
      transition: all 0.2s;
      &:focus {
        border-color: var(--primary-green-color);
        outline: none;
        background: var(--background-color);
      }
    }
  }

  .confirm-action-btn {
    width: 100%;
    padding: 12px;
    border-radius: 10px;
    border: none;
    background: var(--primary-green-color);
    color: white;
    font-weight: 700;
    font-size: 0.9rem;
    cursor: pointer;
    transition: all 0.2s;
    &:hover {
      opacity: 0.9;
      transform: translateY(-1px);
    }
    &:active {
      transform: translateY(0);
    }
    &:disabled {
      background: #ccc;
      opacity: 0.5;
      cursor: not-allowed;
      transform: none;
      color: #666;
    }
  }

  .password-requirements {
    display: flex;
    flex-direction: column;
    gap: 6px;
    margin-top: 4px;
    .requirement {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 11px;
      color: #ef4444;
      opacity: 0.8;
      font-weight: 600;
      svg {
        font-size: 10px;
      }
      &.met {
        color: var(--primary-green-color);
        opacity: 1;
      }
    }
  }
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
  label {
    font-size: 0.7rem;
    font-weight: 800;
    text-transform: uppercase;
    color: var(--normal-text-color);
    opacity: 0.5;
    letter-spacing: 0.05em;
  }
}

.role-selector {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.role-checkbox {
  display: flex;
  align-items: center;
  gap: 8px;
  background: var(--background-color-soft);
  padding: 6px 12px;
  border-radius: 10px;
  border: 1px solid transparent;
  cursor: pointer;
  transition: all 0.2s;
  input {
    cursor: pointer;
  }
  label {
    font-size: 13px;
    cursor: pointer;
    color: var(--header-text-color);
    font-weight: 500;
  }
  &:hover:not(.is-disabled) {
    border-color: var(--border-color);
  }

  &.is-disabled {
    opacity: 0.5;
    cursor: not-allowed;
    input,
    label {
      cursor: not-allowed;
    }
  }
}

.tier-update-row {
  display: flex;
  gap: 8px;
  .apply-btn {
    padding: 0 16px;
    background: var(--primary-green-color);
    color: white;
    border: none;
    border-radius: 10px;
    font-weight: 600;
    font-size: 13px;
    cursor: pointer;
    transition: opacity 0.2s;
    &:hover {
      opacity: 0.9;
    }
    &:disabled {
      opacity: 0.5;
    }
  }
  .inline-success-tag {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 11px;
    font-weight: 700;
    color: var(--primary-green-color);
    animation: fadeIn 0.3s ease;
  }
}
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.mb-4 {
  margin-bottom: 1rem;
}
.mb-6 {
  margin-bottom: 1.5rem;
}
.mt-4 {
  margin-top: 1rem;
}
.mt-6 {
  margin-top: 1.5rem;
}
.flex-1 {
  flex: 1;
}
.gap-3 {
  gap: 0.75rem;
}
.flex {
  display: flex;
}

/* DatePicker Overrides */
:deep(.mx-datepicker) {
  width: 100%;
}

:deep(.mx-input) {
  height: 42px;
  padding: 0 1rem;
  border-radius: 10px;
  border: 1px solid var(--border-color);
  background: var(--background-color-soft);
  color: var(--header-text-color);
  box-shadow: none;
  font-size: 0.85rem;
  font-family: var(--main-font);

  &:focus {
    border-color: var(--primary-green-color);
    background: var(--background-color);
    box-shadow: 0 0 0 2px rgba(92, 184, 92, 0.1);
  }

  &::placeholder {
    color: var(--normal-text-color);
    opacity: 0.5;
  }
}

:deep(.mx-icon-calendar),
:deep(.mx-icon-clear) {
  color: var(--normal-text-color);
  font-size: 14px;
}
</style>
