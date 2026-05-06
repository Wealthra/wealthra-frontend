<template>
  <div class="tickets-content">
    <div class="tickets-table-container">
      <header class="header">
        <div v-if="isLoading" class="skeleton-box header__title-skeleton"></div>
        <h1 v-else class="header__title">{{ t('ticketsHistory') }}</h1>

        <div class="header__toolbar">
          <div class="toolbar-actions">
            <div v-if="isLoading" class="skeleton-box btn-skeleton"></div>
            <button v-else type="button" class="btn btn--primary" @click="showCreateModalOpen">
              {{ t('createTicket') }}
            </button>
          </div>
          <div class="toolbar-filters">
            <template v-if="isLoading">
              <div class="skeleton-box filter-skeleton search-skeleton"></div>
              <div class="skeleton-box filter-skeleton"></div>
            </template>
            <template v-else>
              <div class="filter-group">
                <input
                  v-model="searchQuery"
                  type="text"
                  class="filter-input"
                  :placeholder="t('searchSubject')"
                  :aria-label="t('searchSubject')"
                />
              </div>
              <div class="filter-group">
                <UISelect
                  :model-value="statusFilter || 'all-status'"
                  @update:model-value="
                    val => (statusFilter = val === 'all-status' ? '' : String(val))
                  "
                  class="filter-select"
                  compact
                  :options="[{ label: t('allStatuses'), value: 'all-status' }, ...statusOptions]"
                />
              </div>
            </template>
          </div>
        </div>
      </header>

      <div class="table-wrap" :class="{ 'table-wrap--empty': !isLoading && isTableEmpty }">
        <!-- Skeleton State -->
        <div v-if="isLoading" class="table" role="table">
          <div class="table-header" role="row">
            <div class="col col-id" role="columnheader">
              <div class="skeleton-box header-skeleton"></div>
            </div>
            <div class="col col-subject" role="columnheader">
              <div class="skeleton-box header-skeleton"></div>
            </div>
            <div class="col col-status" role="columnheader">
              <div class="skeleton-box header-skeleton"></div>
            </div>
            <div class="col col-date" role="columnheader">
              <div class="skeleton-box header-skeleton"></div>
            </div>
            <div class="col col-date" role="columnheader">
              <div class="skeleton-box header-skeleton"></div>
            </div>
            <div class="col col-actions" role="columnheader">
              <div class="skeleton-box header-skeleton"></div>
            </div>
          </div>
          <div v-for="i in 5" :key="i" class="table-row ticket-row skeleton-row" role="row">
            <div class="col col-id">
              <div class="skeleton-box col-mobile-label-skeleton"></div>
              <div class="skeleton-box row-skeleton"></div>
            </div>
            <div class="col col-subject">
              <div class="skeleton-box col-mobile-label-skeleton"></div>
              <div class="skeleton-box row-skeleton"></div>
            </div>
            <div class="col col-status">
              <div class="skeleton-box col-mobile-label-skeleton"></div>
              <div class="skeleton-box row-skeleton"></div>
            </div>
            <div class="col col-date">
              <div class="skeleton-box col-mobile-label-skeleton"></div>
              <div class="skeleton-box row-skeleton"></div>
            </div>
            <div class="col col-date">
              <div class="skeleton-box col-mobile-label-skeleton"></div>
              <div class="skeleton-box row-skeleton"></div>
            </div>
            <div class="col col-actions">
              <div class="skeleton-box action-icon-skeleton"></div>
            </div>
          </div>
        </div>

        <!-- Loaded Content -->
        <div v-else-if="filteredTickets.length > 0" class="table" role="table">
          <div class="table-header" role="row">
            <div class="col col-id" role="columnheader">ID</div>
            <div class="col col-subject" role="columnheader">{{ t('subject') }}</div>
            <div class="col col-status" role="columnheader">{{ t('status') }}</div>
            <div class="col col-date" role="columnheader">{{ t('createdOn') }}</div>
            <div class="col col-date" role="columnheader">{{ t('lastModifiedOn') }}</div>
            <div class="col col-actions" role="columnheader"></div>
          </div>

          <template v-for="ticket in filteredTickets" :key="ticket.id">
            <div
              class="table-row ticket-row"
              :class="{ expanded: expandedTicketId === ticket.id }"
              @click="toggleExpand(ticket.id)"
              role="row"
            >
              <div class="col col-id">
                <span class="col-mobile-label">ID</span>
                <span class="col-value">#{{ ticket.id }}</span>
              </div>
              <div class="col col-subject">
                <span class="col-mobile-label">{{ t('subject') }}</span>
                <span class="subject-name">{{ ticket.subject }}</span>
              </div>
              <div class="col col-status">
                <span class="col-mobile-label">{{ t('status') }}</span>
                <span class="status-badge" :class="statusClass(ticket.status)">{{
                  getStatusLabel(ticket.status)
                }}</span>
              </div>
              <div class="col col-date">
                <span class="col-mobile-label">{{ t('createdOn') }}</span>
                <span class="col-value">{{ formatDate(ticket.createdOn) }}</span>
              </div>
              <div class="col col-date">
                <span class="col-mobile-label">{{ t('lastModifiedOn') }}</span>
                <span class="col-value">{{
                  formatDate(ticket.lastModifiedOn || ticket.createdOn)
                }}</span>
              </div>
              <div class="col col-actions">
                <font-awesome-icon
                  :icon="expandedTicketId === ticket.id ? arrowIcons.up : arrowIcons.down"
                  class="expand-icon"
                />
              </div>
            </div>

            <!-- Expanded Details -->
            <div v-if="expandedTicketId === ticket.id" class="ticket-expanded-row">
              <div class="interaction-card">
                <div class="interaction-header">
                  <div class="interaction-title">
                    <font-awesome-icon icon="comment-dots" class="icon-message" />
                    <span>{{ t('ticketSummary') }}</span>
                  </div>
                </div>
                <div class="interaction-content">
                  <div class="interaction-body">
                    <p>{{ ticket.body || t('noMessageProvided') }}</p>
                  </div>
                  <div
                    class="interaction-reply"
                    v-if="ticket.adminReply || ticket.status === 3 || ticket.status === 2"
                  >
                    <div class="reply-header">
                      <font-awesome-icon icon="circle-exclamation" class="icon-alert" />
                      <span>{{ t('adminReplyHeading') }}</span>
                    </div>
                    <ul class="reply-list">
                      <li>{{ ticket.adminReply || t('noAdminReply') }}</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </template>
        </div>

        <!-- Empty State -->
        <div v-if="!isLoading && isTableEmpty" class="empty-state">
          <div class="empty-state__icon-wrap">
            <font-awesome-icon icon="headset" class="empty-state__icon" aria-hidden="true" />
          </div>
          <h2 class="empty-state__heading">{{ t('noTicketsYet') }}</h2>
          <p class="empty-state__text">{{ t('noTicketsYetText') }}</p>
        </div>
      </div>

      <!-- Create Ticket Modal -->
      <div v-if="showCreateModal" class="modal-overlay" @click.self="hideCreateModal">
        <div class="modal-content">
          <div class="modal-header">
            <h3>{{ t('createTicket') }}</h3>
            <button type="button" class="close-btn" @click="hideCreateModal" aria-label="Close">
              &times;
            </button>
          </div>
          <form @submit.prevent="submitCreate" class="modal-body">
            <div class="form-group">
              <label for="create-ticket-subject">{{ t('subject') }}</label>
              <input
                id="create-ticket-subject"
                v-model="newTicket.subject"
                type="text"
                class="modal-input"
                required
              />
            </div>
            <div class="form-group">
              <label for="create-ticket-message">{{ t('message') }}</label>
              <textarea
                id="create-ticket-message"
                v-model="newTicket.body"
                class="modal-textarea"
                rows="4"
                required
              ></textarea>
            </div>
            <div v-if="createError" class="error-message">{{ createError }}</div>
            <button type="submit" class="add-btn" :disabled="isSubmitting">
              {{ isSubmitting ? t('saving') : t('save') }}
            </button>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { supportService } from '@/services/api/support/support.service'
import type {
  SupportTicket,
  CreateSupportTicketRequest,
} from '@/services/api/support/support.models'
import UISelect from '@/components/UISelect.vue'
import { arrowIcons } from '@/icons/fontawesome-icons'

export default defineComponent({
  name: 'TicketsView',
  components: { UISelect },
  props: {
    selectedLanguage: {
      type: String,
      default: 'English',
    },
  },
  setup(props) {
    const isLoading = ref(true)
    const isSubmitting = ref(false)
    const tickets = ref<SupportTicket[]>([])
    const statusFilter = ref('')
    const searchQuery = ref('')

    const showCreateModal = ref(false)
    const newTicket = ref<CreateSupportTicketRequest>({ subject: '', body: '' })
    const createError = ref('')

    const expandedTicketId = ref<number | null>(null)

    const texts = {
      English: {
        ticketsHistory: 'Support Tickets',
        createTicket: 'Create Ticket',
        searchSubject: 'Search by subject...',
        allStatuses: 'All Statuses',
        subject: 'Subject',
        status: 'Status',
        createdOn: 'Created On',
        lastModifiedOn: 'Last Modified',
        noTicketsYet: 'No Tickets Yet',
        noTicketsYetText: 'You have not created any support tickets yet.',
        save: 'Save',
        saving: 'Saving...',
        message: 'Message',
        noMessageProvided: 'No message provided.',
        noAdminReply: 'No admin reply yet.',
        ticketSummary: 'Ticket summary',
        adminReplyHeading: 'Admin reply',
        statusOpen: 'Open',
        statusInProgress: 'In Progress',
        statusResolved: 'Resolved',
        statusClosed: 'Closed',
        statusAdminReplied: 'Admin replied',
      },
      Turkish: {
        ticketsHistory: 'Destek Biletleri',
        createTicket: 'Bilet Oluştur',
        searchSubject: 'Konuya göre ara...',
        allStatuses: 'Tüm Durumlar',
        subject: 'Konu',
        status: 'Durum',
        createdOn: 'Oluşturulma',
        lastModifiedOn: 'Son Değişiklik',
        noTicketsYet: 'Henüz Bilet Yok',
        noTicketsYetText: 'Henüz hiç destek bileti oluşturmadınız.',
        save: 'Kaydet',
        saving: 'Kaydediliyor...',
        message: 'Mesaj',
        noMessageProvided: 'Mesaj sağlanmadı.',
        noAdminReply: 'Henüz admin yanıtı yok.',
        ticketSummary: 'Bilet özeti',
        adminReplyHeading: 'Admin yanıtı',
        statusOpen: 'Açık',
        statusInProgress: 'İşlemde',
        statusResolved: 'Çözüldü',
        statusClosed: 'Kapalı',
        statusAdminReplied: 'Yanıtlandı',
      },
    }

    const t = (key: keyof typeof texts.English) => {
      const lang = props.selectedLanguage === 'Turkish' ? 'Turkish' : 'English'
      return texts[lang][key] || key
    }

    const fetchTickets = async () => {
      isLoading.value = true
      try {
        const data = await supportService.getMyTickets()
        tickets.value = data || []
      } catch (err) {
        console.error('Error fetching tickets:', err)
      } finally {
        isLoading.value = false
      }
    }

    const statusOptions = computed(() => {
      const set = new Set<number>()
      tickets.value.forEach(t => {
        if (t.status !== undefined && t.status !== null) set.add(t.status)
      })
      return Array.from(set).map(s => ({ label: getStatusLabel(s), value: String(s) }))
    })

    const filteredTickets = computed(() => {
      let out = tickets.value
      if (statusFilter.value) {
        out = out.filter(t => String(t.status) === statusFilter.value)
      }
      const q = searchQuery.value.trim().toLowerCase()
      if (q) {
        out = out.filter(t => t.subject?.toLowerCase().includes(q))
      }
      return out
    })

    const isTableEmpty = computed(() => filteredTickets.value.length === 0)

    const statusLabelKeys: Record<number, keyof typeof texts.English> = {
      0: 'statusOpen',
      1: 'statusInProgress',
      2: 'statusResolved',
      3: 'statusClosed',
      4: 'statusAdminReplied',
    }

    const getStatusLabel = (status: number) => {
      const key = statusLabelKeys[status]
      if (key) return t(key)
      return props.selectedLanguage === 'Turkish' ? `Durum ${status}` : `Status ${status}`
    }

    const statusClass = (status: number) => {
      if (status === undefined || status === null) return ''
      if (status === 2 || status === 3) return 'status-ok'
      if (status === 1 || status === 4) return 'status-warning'
      return 'status-exceeded' // 0 = Open
    }

    const formatDate = (dateString: string) => {
      if (!dateString) return '-'
      const date = new Date(dateString)
      return date.toLocaleDateString(props.selectedLanguage === 'Turkish' ? 'tr-TR' : 'en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    }

    const toggleExpand = (id: number) => {
      if (expandedTicketId.value === id) {
        expandedTicketId.value = null
      } else {
        expandedTicketId.value = id
      }
    }

    const showCreateModalOpen = () => {
      newTicket.value = { subject: '', body: '' }
      createError.value = ''
      showCreateModal.value = true
    }

    const hideCreateModal = () => {
      showCreateModal.value = false
    }

    const submitCreate = async () => {
      if (!newTicket.value.subject || !newTicket.value.body) {
        createError.value = 'Please fill all fields.'
        return
      }
      isSubmitting.value = true
      try {
        await supportService.createTicket(newTicket.value)
        hideCreateModal()
        await fetchTickets()
      } catch (err) {
        console.error('Error creating ticket:', err)
        createError.value = 'Failed to create ticket.'
      } finally {
        isSubmitting.value = false
      }
    }

    onMounted(() => {
      fetchTickets()
      window.addEventListener('app:refetch', fetchTickets)
    })

    onBeforeUnmount(() => {
      window.removeEventListener('app:refetch', fetchTickets)
    })

    return {
      isLoading,
      isSubmitting,
      tickets,
      statusFilter,
      searchQuery,
      statusOptions,
      filteredTickets,
      isTableEmpty,
      showCreateModal,
      newTicket,
      createError,
      expandedTicketId,
      arrowIcons,
      t,
      statusClass,
      getStatusLabel,
      formatDate,
      toggleExpand,
      showCreateModalOpen,
      hideCreateModal,
      submitCreate,
    }
  },
})
</script>

<style scoped lang="scss">
.tickets-content {
  display: flex;
  flex-direction: column;
  width: 100%;
  min-height: 0;
  gap: 2rem;
  flex: 1 1 auto;
}

@media (max-width: 768px) {
  .tickets-content {
    flex: none;
    min-height: auto;
  }
}

.tickets-table-container {
  display: flex;
  flex-direction: column;
  width: 100%;
  flex: 1;
  min-height: 0;
  background-color: var(--background-color);
  border-radius: var(--border-radius);
  padding: 1.25rem 1rem;

  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.25rem;
    gap: 1rem;
  }
  .header__title {
    font-size: 1.125rem;
    font-weight: 700;
    margin: 0;
    color: var(--header-text-color);
  }

  .header__toolbar {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    flex-wrap: nowrap;
  }
  .toolbar-actions {
    display: flex;
    align-items: center;
  }

  .btn {
    padding: 0.4rem 0.75rem;
    border-radius: var(--border-radius);
    font-size: 0.75rem;
    font-weight: 600;
    cursor: pointer;
    border: 1px solid transparent;
    transition: opacity 0.15s ease;
    &:hover:not(:disabled) {
      opacity: var(--hover-opacity);
    }
  }
  .btn--primary {
    background-color: var(--primary-green-color);
    color: white;
    border-color: var(--primary-green-color);
  }

  .toolbar-filters {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .filter-input {
    min-width: 12rem;
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

  .filter-select {
    min-width: 10rem;
    :deep(.select-trigger) {
      padding: 0.35rem 0.75rem;
      border-radius: var(--border-radius);
      border: 1px solid var(--border-color);
      background-color: var(--background-color);
      color: var(--header-text-color);
      font-size: 0.75rem;
      height: auto;
      min-height: auto;
    }
  }

  .table-wrap {
    flex: 1;
    min-height: 0;
    overflow: auto;
    background-color: var(--background-color);
    padding-right: 0.75rem;
  }

  .table {
    width: 100%;
    display: flex;
    flex-direction: column;
  }

  .table-header {
    display: grid;
    grid-template-columns: 4rem minmax(0, 1fr) 7rem 7rem 7rem 3rem;
    gap: 1rem;
    padding: 0.6rem 1rem;
    border-bottom: 1px solid var(--border-color);
    font-weight: 700;
    font-size: 0.7rem;
    color: var(--normal-text-color);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .table-row {
    display: grid;
    grid-template-columns: 4rem minmax(0, 1fr) 7rem 7rem 7rem 3rem;
    gap: 1rem;
    padding: 0.7rem 1rem;
    align-items: center;
    border-bottom: 1px solid var(--border-color);
    cursor: pointer;
    transition: background-color 0.2s ease;

    &:hover {
      background-color: var(--background-color-soft);
    }

    &.expanded {
      border-bottom: none;
      background-color: var(--background-color-soft);
      @media (max-width: 1024px) {
        border-bottom-left-radius: 0;
        border-bottom-right-radius: 0;
        margin-bottom: 0;
        border-bottom: none;
      }
    }

    &:last-child {
      border-bottom: none;
    }
  }

  .col {
    min-width: 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .col-mobile-label,
  .col-mobile-label-skeleton {
    display: none;
  }

  .subject-name {
    font-weight: 600;
    color: var(--header-text-color);
    font-size: 0.8rem;
  }

  .col-value {
    font-size: 0.75rem;
    color: var(--normal-text-color);
  }

  .status-badge {
    display: inline-block;
    padding: 0.25rem 0.625rem;
    border-radius: 6px;
    font-size: 0.7rem;
    font-weight: 600;
    &.status-ok {
      background-color: rgba(92, 184, 92, 0.15);
      color: var(--primary-green-color);
    }
    &.status-warning {
      background-color: rgba(196, 160, 80, 0.18);
      color: #b8860b;
    }
    &.status-exceeded {
      background-color: rgba(217, 83, 79, 0.15);
      color: var(--primary-red-color);
    }
  }

  .expand-icon {
    color: var(--normal-text-color);
    font-size: 0.8rem;
  }

  .ticket-expanded-row {
    padding: 0 1rem 1.5rem 1rem;
    padding-top: 1rem;
    border-bottom: 1px solid var(--border-color);
  }

  /* Interaction Card styling mimicking a premium thread/conversation look */
  .interaction-card {
    background: var(--background-color);
    border: 1px solid var(--border-color);
    border-radius: 16px;
    display: flex;
    flex-direction: column;
    padding: 1.25rem;
    gap: 1.25rem;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);

    @media (max-width: 600px) {
      padding: 1rem;
      gap: 1rem;
    }

    .interaction-header {
      display: flex;
      justify-content: space-between;
      border-bottom: 1px solid var(--border-color);
      padding-bottom: 0.75rem;
      margin-bottom: -0.25rem;
    }

    .interaction-title {
      display: flex;
      align-items: center;
      gap: 0.625rem;
      font-size: 0.8125rem;
      font-weight: 700;
      color: var(--primary-green-color);

      .icon-message {
        font-size: 0.9rem;
        opacity: 0.8;
      }
    }

    .interaction-content {
      display: flex;
      gap: 1.5rem;

      @media (max-width: 900px) {
        flex-direction: column;
        gap: 1.25rem;
      }
    }

    .interaction-body {
      flex: 1;
      background: var(--background-color-soft);
      border-radius: 12px;
      padding: 1.25rem;
      border: 1px solid var(--border-color);

      p {
        margin: 0;
        font-size: 0.875rem;
        color: var(--header-text-color);
        line-height: 1.6;
        white-space: pre-wrap;
      }
    }

    .interaction-reply {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      background: rgba(92, 184, 92, 0.03);
      border-radius: 12px;
      padding: 1.25rem;
      border: 1px solid rgba(92, 184, 92, 0.2);

      .reply-header {
        display: flex;
        align-items: center;
        gap: 0.625rem;
        font-size: 0.8125rem;
        font-weight: 700;
        color: var(--primary-green-color);
      }

      .reply-list {
        margin: 0;
        padding-left: 0;
        list-style: none;
        font-size: 0.875rem;
        color: var(--header-text-color);
        line-height: 1.6;

        li {
          position: relative;
          padding-left: 1.25rem;

          &::before {
            content: '•';
            position: absolute;
            left: 0;
            color: #f5a623;
            font-weight: bold;
          }
        }
      }
    }
  }

  /* Dark mode specific fine-tuning */
  :root[data-theme='dark'] .interaction-card {
    box-shadow: 0 4px 24px rgba(0, 0, 0, 0.2);

    .interaction-reply {
      background: rgba(92, 184, 92, 0.05);
      border-color: rgba(92, 184, 92, 0.3);
    }
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
      margin-bottom: 0.75rem;
      font-size: 1.375rem;
      font-weight: 700;
      color: var(--header-text-color);
    }
    .empty-state__text {
      font-size: 1rem;
      color: var(--normal-text-color);
    }
  }

  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
  }
  .modal-content {
    background: var(--background-color);
    border-radius: var(--border-radius);
    width: 90%;
    max-width: 28rem;
    display: flex;
    flex-direction: column;

    .modal-header {
      padding: 1rem 1.25rem;
      border-bottom: 1px solid var(--border-color);
      display: flex;
      justify-content: space-between;
      align-items: center;
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
      }
    }
    .modal-body {
      padding: 1.25rem;
      display: flex;
      flex-direction: column;
      gap: 1.25rem;

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

      .modal-input,
      .modal-textarea {
        width: 100%;
        padding: 0.75rem 1rem;
        border: 1px solid var(--border-color);
        border-radius: var(--border-radius);
        background: var(--background-color);
        color: var(--header-text-color);
        font-family: var(--main-font);
        font-size: 0.9375rem;
        &:focus {
          outline: none;
          border-color: var(--primary-green-color);
          box-shadow: 0 0 0 2px rgba(92, 184, 92, 0.2);
        }
      }

      .modal-textarea {
        resize: vertical;
      }

      .error-message {
        color: #dc3545;
        font-size: 0.85rem;
        text-align: center;
        background: rgba(220, 53, 69, 0.1);
        padding: 0.5rem;
        border-radius: var(--border-radius);
      }

      .add-btn {
        width: 100%;
        padding: 0.75rem 1rem;
        border: none;
        border-radius: var(--border-radius);
        background: var(--primary-green-color);
        color: white;
        font-weight: 600;
        cursor: pointer;
      }
    }
  }
}

.skeleton-box {
  background: var(--border-color);
  border-radius: 4px;
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0% {
    opacity: 0.6;
  }
  50% {
    opacity: 0.3;
  }
  100% {
    opacity: 0.6;
  }
}

.header-skeleton {
  height: 0.75rem;
  width: 80%;
}
.row-skeleton {
  height: 1rem;
  width: 80%;
}
.action-icon-skeleton {
  width: 1.5rem;
  height: 1.5rem;
  border-radius: 4px;
}
.btn-skeleton {
  width: 100px;
  height: 2.25rem;
  border-radius: var(--border-radius);
}
.filter-skeleton {
  width: 10rem;
  height: 2.25rem;
  border-radius: var(--border-radius);
}
.search-skeleton {
  width: 12rem;
}

@media (max-width: 1200px) {
  .tickets-table-container {
    flex: none;
    min-height: auto;
    padding: 1rem;
    .header {
      flex-direction: column;
      align-items: stretch;
      gap: 0.75rem;
    }
    .header__title,
    .header__title-skeleton {
      display: none !important;
    }
    .header__toolbar {
      display: grid !important;
      grid-template-columns: repeat(2, 1fr) !important;
      gap: 0.75rem !important;
      width: 100% !important;
    }
    .toolbar-actions,
    .toolbar-filters {
      display: contents !important;
    }
    .btn,
    .btn-skeleton,
    .filter-input,
    .filter-select,
    .filter-skeleton {
      width: 100% !important;
      height: 2.75rem !important;
      min-height: 2.75rem !important;
      font-size: 0.875rem !important;
      margin: 0 !important;
      display: flex !important;
      align-items: center;
      justify-content: center;
    }

    .filter-select :deep(.select-trigger) {
      height: 2.75rem !important;
      min-height: 2.75rem !important;
      font-size: 0.875rem !important;
      border-radius: 10px;
    }

    /* The Status filter (last item) spans 2 columns */
    .filter-group:last-child,
    .filter-skeleton:last-child {
      grid-column: span 2 !important;
    }

    .filter-skeleton {
      height: 2.75rem !important;
      background-color: var(--background-color-soft) !important;
    }
    .table-wrap {
      flex: none;
      min-height: 10rem;
      overflow: visible;
      overflow-x: auto;
      -webkit-overflow-scrolling: touch;
      padding-right: 0;
    }
    .table-header {
      display: none;
    }
    .table-row.ticket-row,
    .table-row.skeleton-row {
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
        flex-shrink: 0;
        font-size: 0.75rem;
        font-weight: 600;
        color: var(--normal-text-color);
      }
      .col-mobile-label-skeleton {
        display: block;
        width: 100px;
        height: 1rem;
        border-radius: 4px;
        flex-shrink: 0;
      }
      .col-actions {
        margin-top: 0.5rem;
        padding-top: 0.75rem;
        border-top: 1px solid var(--border-color);
        width: 100%;
        display: flex;
        justify-content: flex-end;
      }
    }
  }
}
</style>
