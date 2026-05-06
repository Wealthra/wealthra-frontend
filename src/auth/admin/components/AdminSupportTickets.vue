<template>
  <div class="admin-support-tickets glass-card">
    <div class="table-toolbar">
      <h2 class="table-toolbar__title">{{ t.pageTitle }}</h2>
      <div class="table-toolbar__filter">
        <UISelect
          v-model="filterStatus"
          :options="filterStatusOptions"
          @update:model-value="fetchTickets"
        />
      </div>
    </div>

    <div class="table-container">
      <div class="table-scroll">
        <table class="tickets-table">
          <thead>
            <tr>
              <th class="col-id">ID</th>
              <th class="col-user">{{ t.userIdCol }}</th>
              <th class="col-subject">{{ t.subjectCol }}</th>
              <th class="col-status">{{ t.statusCol }}</th>
              <th class="col-date">{{ t.createdCol }}</th>
              <th class="col-date">{{ t.modifiedCol }}</th>
              <th class="col-actions">{{ t.actionsCol }}</th>
            </tr>
          </thead>
          <tbody>
            <template v-if="isLoading">
              <tr v-for="i in 5" :key="i">
                <td class="col-id"><UISkeletonLoader width="40px" height="14px" border-radius="4px" /></td>
                <td class="col-user"><UISkeletonLoader width="100px" height="14px" border-radius="4px" /></td>
                <td class="col-subject"><UISkeletonLoader width="100%" height="14px" border-radius="4px" /></td>
                <td class="col-status"><UISkeletonLoader width="70px" height="22px" border-radius="20px" /></td>
                <td class="col-date"><UISkeletonLoader width="100px" height="14px" border-radius="4px" /></td>
                <td class="col-date"><UISkeletonLoader width="100px" height="14px" border-radius="4px" /></td>
                <td class="col-actions"><UISkeletonLoader width="60px" height="32px" border-radius="8px" /></td>
              </tr>
            </template>
            <template v-else>
              <tr v-for="ticket in tickets" :key="ticket.id">
                <td class="col-id" :data-label="'ID'">
                  <span class="mono">#{{ ticket.id }}</span>
                </td>
                <td class="col-user" :data-label="t.userIdCol">
                  <span class="user-id-cell mono" :title="ticket.userId">{{
                    abbreviateId(ticket.userId)
                  }}</span>
                </td>
                <td class="col-subject" :data-label="t.subjectCol">
                  <span class="subject-cell" :title="ticket.subject">{{
                    truncate(ticket.subject, 48)
                  }}</span>
                </td>
                <td class="col-status" :data-label="t.statusCol">
                  <span :class="['status-badge', statusClass(ticket.status)]">{{
                    getStatusText(ticket.status)
                  }}</span>
                </td>
                <td class="col-date date-cell" :data-label="t.createdCol">{{ formatDateTime(ticket.createdOn) }}</td>
                <td class="col-date date-cell" :data-label="t.modifiedCol">
                  {{ formatDateTime(ticket.lastModifiedOn || ticket.createdOn) }}
                </td>
                <td class="col-actions" :data-label="t.actionsCol">
                  <button type="button" class="table-action-btn" @click="openReplyModal(ticket)">
                    {{ t.reply }}
                  </button>
                </td>
              </tr>
              <tr v-if="tickets.length === 0">
                <td colspan="7" class="no-data">{{ t.noTickets }}</td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>

      <footer v-if="!isLoading" class="tickets-table-footer">
        <div class="tickets-table-footer__hint">
          <span class="tickets-table-footer__text">{{ t.listHintLine(takeLimit) }}</span>
          <span class="tickets-hint-wrap">
            <button type="button" class="tickets-hint-help" :aria-label="t.loadMoreHelp">?</button>
            <span class="tickets-hint-tooltip" aria-hidden="true">{{ t.loadMoreHelp }}</span>
          </span>
        </div>
        <button
          v-if="hasMore"
          type="button"
          class="tickets-load-more"
          :disabled="isLoadingMore"
          @click="loadMoreTickets"
        >
          <font-awesome-icon
            v-if="isLoadingMore"
            icon="spinner"
            spin
            class="tickets-load-more__icon"
          />
          {{ isLoadingMore ? t.loadingMore : t.loadMore }}
        </button>
      </footer>
    </div>

    <!-- Reply Modal -->
    <div v-if="replyModalOpen && activeTicket" class="modal-overlay" @click.self="closeReplyModal">
      <div class="modal-shell glass-card">
        <header class="reply-modal__toolbar">
          <div class="reply-modal__toolbar-start">
            <span class="reply-modal__id-chip">#{{ activeTicket.id }}</span>
            <span
              :class="[
                'reply-modal__status-pill',
                'status-badge',
                statusClass(activeTicket.status),
              ]"
            >
              {{ getStatusText(activeTicket.status) }}
            </span>
          </div>
          <button
            type="button"
            class="reply-modal__close"
            @click="closeReplyModal"
            aria-label="Close"
          >
            <font-awesome-icon icon="xmark" />
          </button>
        </header>

        <form class="reply-modal__sheet" @submit.prevent="handleReply">
          <div class="reply-modal__hero">
            <p class="reply-modal__eyebrow">{{ t.modalTitle }}</p>
            <h2 class="reply-modal__subject">{{ activeTicket.subject || '—' }}</h2>
          </div>

          <div class="reply-modal__scroll">
            <div class="reply-meta-card">
              <div class="reply-meta-card__row reply-meta-card__row--code">
                <div class="reply-field-label">
                  <font-awesome-icon icon="user" class="reply-field-label__icon" />
                  {{ t.userIdCol }}
                </div>
                <code class="reply-meta-card__uuid" :title="activeTicket.userId">{{
                  activeTicket.userId
                }}</code>
              </div>
              <div v-if="activeTicket.userEmail" class="reply-meta-card__row">
                <div class="reply-field-label">
                  <font-awesome-icon icon="envelope" class="reply-field-label__icon" />
                  Email
                </div>
                <span class="reply-meta-card__text">{{ activeTicket.userEmail }}</span>
              </div>
              <div class="reply-meta-card__dates">
                <div class="reply-date-tile">
                  <div class="reply-field-label">
                    <font-awesome-icon icon="calendar" class="reply-field-label__icon" />
                    {{ t.createdCol }}
                  </div>
                  <span class="reply-date-tile__value">{{
                    formatDateTime(activeTicket.createdOn)
                  }}</span>
                </div>
                <div class="reply-date-tile">
                  <div class="reply-field-label">
                    <font-awesome-icon icon="rotate-right" class="reply-field-label__icon" />
                    {{ t.modifiedCol }}
                  </div>
                  <span class="reply-date-tile__value">{{
                    formatDateTime(activeTicket.lastModifiedOn || activeTicket.createdOn)
                  }}</span>
                </div>
              </div>
            </div>

            <section class="reply-panel reply-panel--user">
              <div class="reply-panel__head">
                <font-awesome-icon icon="comment-dots" class="reply-panel__head-icon" />
                <span>{{ t.userMessage }}</span>
              </div>
              <div class="reply-panel__body reply-panel__body--scroll">
                {{ activeTicket.body || '—' }}
              </div>
            </section>

            <section v-if="activeTicket.adminReply" class="reply-panel reply-panel--prev">
              <div class="reply-panel__head">
                <font-awesome-icon icon="comments" class="reply-panel__head-icon" />
                <span>{{ t.previousReply }}</span>
              </div>
              <div class="reply-panel__body reply-panel__body--scroll reply-panel__body--muted">
                {{ activeTicket.adminReply }}
              </div>
            </section>

            <section class="reply-panel reply-panel--compose">
              <label class="reply-compose-label" for="admin-reply-text">{{
                t.adminReplyLabel
              }}</label>
              <textarea
                id="admin-reply-text"
                v-model="replyMessage"
                rows="5"
                required
                :placeholder="t.replyPlaceholder"
                class="reply-compose-textarea"
              />
            </section>

            <section class="reply-panel reply-panel--inline">
              <label class="reply-compose-label" for="admin-reply-status">{{
                t.updateStatus
              }}</label>
              <UISelect v-model="replyStatus" :options="replyStatusOptions" />
            </section>
          </div>

          <footer class="reply-modal__footer">
            <button type="button" class="reply-btn reply-btn--ghost" @click="closeReplyModal">
              {{ t.cancel }}
            </button>
            <button type="submit" class="reply-btn reply-btn--primary" :disabled="isSubmitting">
              <font-awesome-icon v-if="!isSubmitting" icon="paper-plane" class="reply-btn__icon" />
              <font-awesome-icon v-else icon="spinner" spin class="reply-btn__icon" />
              {{ isSubmitting ? t.sending : t.sendReply }}
            </button>
          </footer>
        </form>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, computed } from 'vue'
import type { PropType } from 'vue'
import { supportService } from '@/services/api/support/support.service'
import type { SupportTicket } from '@/services/api/support/support.models'
import UISelect from '@/components/UISelect.vue'
import UISkeletonLoader from '@/components/UISkeletonLoader.vue'
import { useToast } from '@/stores/useToast'

export default defineComponent({
  name: 'AdminSupportTickets',
  components: {
    UISelect,
    UISkeletonLoader,
  },
  props: {
    selectedLanguage: {
      type: String as PropType<'English' | 'Turkish'>,
      default: 'English',
    },
  },
  setup(props) {
    /** Each click increases `take` by this step (no fixed server-side 100 in UI). */
    const TAKE_STEP = 50
    const tickets = ref<SupportTicket[]>([])
    const isLoading = ref(true)
    const isLoadingMore = ref(false)
    const takeLimit = ref(TAKE_STEP)
    const hasMore = ref(false)
    const filterStatus = ref<'all' | 0 | 1 | 2>('all')

    const replyModalOpen = ref(false)
    const activeTicket = ref<SupportTicket | null>(null)
    const replyMessage = ref('')
    const replyStatus = ref<number>(1)
    const isSubmitting = ref(false)
    const toast = useToast()

    const t = computed(() => {
      const isTr = props.selectedLanguage === 'Turkish'
      return {
        userIdCol: isTr ? 'Kullanıcı ID' : 'User ID',
        subjectCol: isTr ? 'Konu' : 'Subject',
        statusCol: isTr ? 'Durum' : 'Status',
        createdCol: isTr ? 'Oluşturulma' : 'Created',
        modifiedCol: isTr ? 'Son güncelleme' : 'Last modified',
        actionsCol: isTr ? 'İşlem' : 'Action',
        reply: isTr ? 'Yanıtla' : 'Reply',
        noTickets: isTr ? 'Bilet yok.' : 'No tickets found.',
        pageTitle: isTr ? 'Destek talepleri' : 'Support Tickets',
        modalTitle: isTr ? 'Bilet' : 'Ticket',
        userMessage: isTr ? 'Kullanıcı mesajı' : 'User message',
        previousReply: isTr ? 'Önceki admin yanıtı' : 'Previous admin reply',
        adminReplyLabel: isTr ? 'Yanıtınız' : 'Your reply',
        replyPlaceholder: isTr ? 'Kullanıcıya yanıt yazın…' : 'Type your reply to the user…',
        updateStatus: isTr ? 'Durumu güncelle' : 'Update status',
        cancel: isTr ? 'İptal' : 'Cancel',
        sending: isTr ? 'Gönderiliyor…' : 'Sending…',
        sendReply: isTr ? 'Gönder' : 'Send reply',
        loadMore: isTr ? 'Daha fazla yükle' : 'Load more',
        loadingMore: isTr ? 'Yükleniyor…' : 'Loading more…',
        listHintLine: (takeVal: number) =>
          isTr
            ? `Şu an en son ${takeVal} bilete kadar gösteriliyor.`
            : `Showing the latest ${takeVal} tickets now.`,
        loadMoreHelp: isTr
          ? `Her "Daha fazla yükle" tıklamasında üst sınır +${TAKE_STEP} artar (örn. ${TAKE_STEP} → ${TAKE_STEP + TAKE_STEP}).`
          : `Each "Load more" click increases the limit by ${TAKE_STEP} (e.g. ${TAKE_STEP} → ${TAKE_STEP + TAKE_STEP}).`,
      }
    })

    const replyStatusOptions: { label: string; value: number }[] = [
      { label: 'Open', value: 0 },
      { label: 'Pending', value: 1 },
      { label: 'Closed', value: 2 },
    ]

    const filterStatusOptions: { label: string; value: 'all' | 0 | 1 | 2 }[] = [
      { label: 'All Statuses', value: 'all' },
      { label: 'Open', value: 0 },
      { label: 'Pending', value: 1 },
      { label: 'Closed', value: 2 },
    ]

    const abbreviateId = (id: string) => {
      if (!id) return '—'
      return id.length <= 14 ? id : `${id.slice(0, 8)}…${id.slice(-4)}`
    }

    const truncate = (text: string, max: number) => {
      if (!text) return '—'
      return text.length <= max ? text : `${text.slice(0, max)}…`
    }

    const formatDateTime = (iso: string) => {
      try {
        return new Date(iso).toLocaleString(
          props.selectedLanguage === 'Turkish' ? 'tr-TR' : 'en-US',
          {
            dateStyle: 'medium',
            timeStyle: 'short',
          }
        )
      } catch {
        return iso
      }
    }

    const loadTicketPage = async () => {
      const status = filterStatus.value === 'all' ? undefined : filterStatus.value
      const data = await supportService.getAdminTickets(takeLimit.value, status)
      tickets.value = data
      hasMore.value = data.length >= takeLimit.value
    }

    /** Reset batch size and reload (filter change, mount). */
    const fetchTickets = async () => {
      takeLimit.value = TAKE_STEP
      isLoading.value = true
      try {
        await loadTicketPage()
      } catch (err) {
        console.error(err)
      } finally {
        isLoading.value = false
      }
    }

    /** Increase `take` and fetch again — backend returns up to `take` rows. */
    const loadMoreTickets = async () => {
      if (isLoadingMore.value || !hasMore.value) return
      const nextTake = takeLimit.value + TAKE_STEP
      takeLimit.value = nextTake
      isLoadingMore.value = true
      try {
        await loadTicketPage()
      } catch (err) {
        takeLimit.value = nextTake - TAKE_STEP
        console.error(err)
      } finally {
        isLoadingMore.value = false
      }
    }

    /** Same `take` after reply so the list does not shrink. */
    const refreshTickets = async () => {
      isLoading.value = true
      try {
        await loadTicketPage()
      } catch (err) {
        console.error(err)
      } finally {
        isLoading.value = false
      }
    }

    const openReplyModal = (ticket: SupportTicket) => {
      activeTicket.value = ticket
      // Previous admin reply is shown in its own panel; compose is only for new text.
      replyMessage.value = ''
      replyStatus.value = [0, 1, 2].includes(ticket.status) ? ticket.status : 0
      replyModalOpen.value = true
    }

    const closeReplyModal = () => {
      replyModalOpen.value = false
      activeTicket.value = null
      replyMessage.value = ''
    }

    const handleReply = async () => {
      if (!activeTicket.value || !replyMessage.value.trim()) return
      isSubmitting.value = true
      try {
        await supportService.replyTicket(activeTicket.value.id, {
          adminReply: replyMessage.value.trim(),
          status: replyStatus.value,
        })
        closeReplyModal()
        toast.success('Reply sent successfully')
        await refreshTickets()
      } catch (err) {
        toast.error('Failed to send reply.')
      } finally {
        isSubmitting.value = false
      }
    }

    const getStatusText = (status: number): string => {
      const map: Record<number, string> = {
        0: 'Open',
        1: 'Pending',
        2: 'Closed',
      }
      return map[status] ?? `(${status})`
    }

    const statusClass = (status: number): string => {
      if (status === 0) return 'open'
      if (status === 1) return 'pending'
      if (status === 2) return 'closed'
      return 'pending'
    }

    onMounted(fetchTickets)

    return {
      tickets,
      isLoading,
      filterStatus,
      filterStatusOptions,
      fetchTickets,
      loadMoreTickets,
      takeLimit,
      hasMore,
      isLoadingMore,
      replyModalOpen,
      activeTicket,
      replyMessage,
      replyStatus,
      replyStatusOptions,
      isSubmitting,
      openReplyModal,
      closeReplyModal,
      handleReply,
      getStatusText,
      statusClass,
      abbreviateId,
      truncate,
      formatDateTime,
      t,
    }
  },
})
</script>

<style scoped lang="scss">
.admin-support-tickets {
  display: flex;
  flex-direction: column;
  gap: 20px;
  flex: 1;
  min-height: 0;
  padding: 24px;
  background: var(--background-color);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.table-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}

.table-toolbar__title {
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  line-height: 1.25;
  color: var(--header-text-color);
}

.table-toolbar__filter {
  flex: 0 0 auto;
  width: clamp(200px, 24vw, 250px);
  max-width: min(250px, 100%);
}

.table-container {
  display: flex;
  flex-direction: column;
  padding: 0;
  overflow: visible;
  flex: 1;
  min-height: 0;
}

.table-scroll {
  flex: 1 1 auto;
  overflow: auto;
  -webkit-overflow-scrolling: touch;
}

.tickets-table-footer {
  position: relative;
  z-index: 2;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
  padding: 14px 18px;
  border-top: 1px solid var(--border-color);
  background: var(--background-color-soft);
}

.tickets-table-footer__hint {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: var(--normal-text-color);
  max-width: min(100%, 520px);
}

.tickets-table-footer__text {
  line-height: 1.45;
}

.tickets-hint-wrap {
  position: relative;
  display: inline-flex;
  flex-shrink: 0;
  align-items: center;
  vertical-align: middle;
}

.tickets-hint-tooltip {
  position: absolute;
  right: 0;
  bottom: calc(100% + 12px);
  z-index: 40;

  width: max-content;
  max-width: min(320px, calc(100vw - 40px));
  padding: 12px 14px;
  border-radius: 12px;
  border: 1px solid var(--border-color);
  background: var(--background-color);
  color: var(--header-text-color);
  font-size: 12px;
  font-weight: 500;
  line-height: 1.5;
  text-align: left;
  box-shadow:
    0 12px 32px rgba(0, 0, 0, 0.2),
    0 0 0 1px rgba(255, 255, 255, 0.04) inset;

  opacity: 0;
  visibility: hidden;
  pointer-events: none;
  transition:
    opacity 0.15s ease,
    visibility 0.15s ease,
    transform 0.15s ease;
  transform: translateY(4px);
}

.tickets-hint-tooltip::after {
  content: '';
  position: absolute;
  top: 100%;
  right: 8px;
  width: 0;
  height: 0;
  border-left: 6px solid transparent;
  border-right: 6px solid transparent;
  border-top: 6px solid var(--border-color);
}

.tickets-hint-wrap:hover .tickets-hint-tooltip,
.tickets-hint-wrap:focus-within .tickets-hint-tooltip {
  opacity: 1;
  visibility: visible;
  pointer-events: auto;
  transform: translateY(0);
}

.tickets-hint-help {
  flex-shrink: 0;
  width: 22px;
  height: 22px;
  padding: 0;
  border-radius: 999px;
  border: 1px solid var(--border-color);
  background: var(--background-color);
  color: var(--normal-text-color);
  font-size: 12px;
  font-weight: 800;
  line-height: 1;
  cursor: help;
  transition:
    border-color 0.15s ease,
    color 0.15s ease;

  &:hover {
    border-color: var(--primary-green-color);
    color: var(--header-text-color);
  }

  &:focus-visible {
    outline: none;
    border-color: var(--primary-green-color);
    box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.22);
  }
}

.tickets-load-more {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 18px;
  border-radius: 10px;
  border: 1px solid var(--border-color);
  background: var(--background-color);
  color: var(--header-text-color);
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition:
    background 0.15s ease,
    border-color 0.15s ease;

  &:hover:not(:disabled) {
    border-color: var(--primary-green-color);
    background: rgba(34, 197, 94, 0.08);
  }

  &:disabled {
    opacity: 0.65;
    cursor: not-allowed;
  }
}

.tickets-load-more__icon {
  font-size: 14px;
}

.tickets-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;

  th,
  td {
    padding: 14px 16px;
    text-align: left;
    border-bottom: 1px solid var(--border-color);
  }

  th {
    position: sticky;
    top: 0;
    z-index: 1;
    background: var(--background-color-soft);
    font-size: 11px;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: var(--normal-text-color);
    white-space: nowrap;
    box-shadow: 0 1px 0 var(--border-color);
  }

  tbody tr:hover {
    background: rgba(0, 0, 0, 0.02);
  }

  .mono {
    font-family: ui-monospace, monospace;
    font-size: 13px;
  }

  .user-id-cell {
    display: inline-block;
    max-width: 140px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    vertical-align: bottom;
  }

  .subject-cell {
    display: inline-block;
    max-width: min(320px, 36vw);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    color: var(--header-text-color);
    font-weight: 500;
  }

  .date-cell {
    font-size: 13px;
    color: var(--normal-text-color);
    white-space: nowrap;
  }

  .status-badge {
    display: inline-block;
    padding: 4px 10px;
    border-radius: 999px;
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    color: #fff;

    &.open {
      background: #3b82f6;
    }
    &.pending {
      background: #f59e0b;
    }
    &.closed {
      background: #10b981;
    }
  }

  .table-action-btn {
    background: var(--primary-green-color);
    color: #fff;
    border: none;
    padding: 8px 14px;
    border-radius: 8px;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;

    &:hover {
      filter: brightness(1.05);
    }
  }

  .no-data {
    text-align: center;
    padding: 32px !important;
    color: var(--normal-text-color);
  }
}

@media (max-width: 1024px) {
  .table-toolbar {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }

  .table-toolbar__filter {
    width: 100%;
    max-width: none;
  }

  .tickets-table {
    thead {
      display: none;
    }

    tbody tr {
      display: grid;
      grid-template-columns: 1fr;
      gap: 12px;
      padding: 16px;
      background: var(--background-color-soft);
      border: 1px solid var(--border-color);
      border-radius: 12px;
      margin-bottom: 16px;
      position: relative;

      &:hover {
        background: var(--background-color-soft);
      }
    }

    td {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px 0 !important;
      border-bottom: 1px solid rgba(255, 255, 255, 0.05) !important;
      text-align: right;
      width: 100%;
      box-sizing: border-box;

      &:last-child {
        border-bottom: none !important;
        margin-top: 8px;
        padding-top: 16px !important;
        border-top: 1px solid var(--border-color) !important;
      }

      &::before {
        content: attr(data-label);
        font-size: 11px;
        font-weight: 800;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: var(--normal-text-color);
        opacity: 0.6;
        text-align: left;
        margin-right: 16px;
      }

      &.col-id {
        display: flex;
        justify-content: flex-start;
        border-bottom: 1px solid var(--border-color) !important;
        padding-bottom: 12px !important;
        margin-bottom: 4px;
        
        &::before { display: none; }
        .mono {
          background: var(--primary-green-color);
          color: white;
          padding: 4px 12px;
          border-radius: 8px;
          font-size: 12px;
          font-weight: 800;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
        }
      }

      &.col-user, &.col-subject, &.col-status, &.col-date, &.col-actions {
        width: 100%;
      }

      .user-id-cell, .subject-cell {
        max-width: 180px;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      &.col-actions {
        justify-content: center;
        &::before { display: none; }
        .table-action-btn {
          width: 100%;
          padding: 12px;
        }
      }
    }
  }

  .table-container {
    flex: 1;
    min-height: 0;
    padding: 0 !important;
    overflow-x: hidden !important;
  }
  
  .table-scroll {
    overflow-y: auto;
  }
  
  .tickets-table {
    display: block;
    width: 100%;
  }

  .tickets-table tbody {
    display: block;
    width: 100%;
  }

  .tickets-table-footer {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
    text-align: center;

    .tickets-table-footer__hint {
      justify-content: center;
    }

    .tickets-load-more {
      width: 100%;
      justify-content: center;
    }
  }
}

@media (max-width: 600px) {
  .modal-shell {
    max-height: 100vh;
    max-height: 100dvh;
    border-radius: 0;
  }
  
  .reply-meta-card__dates {
    flex-direction: column;
    gap: 12px;
  }
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.55);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  backdrop-filter: blur(8px);
  padding: 20px;
}

.modal-shell {
  width: 100%;
  max-width: 600px;
  max-height: min(92vh, 880px);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  min-height: 0;
  border-radius: 20px;
  border: 1px solid var(--border-color);
  box-shadow:
    0 24px 48px -12px rgba(0, 0, 0, 0.35),
    0 0 0 1px rgba(255, 255, 255, 0.04) inset;
  background: var(--background-color);
}

.reply-modal__toolbar {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 18px 10px;
  border-bottom: 1px solid var(--border-color);
  background: linear-gradient(180deg, var(--background-color-soft) 0%, transparent 100%);
}

.reply-modal__sheet {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.reply-modal__toolbar-start {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.reply-modal__id-chip {
  font-family: ui-monospace, monospace;
  font-size: 13px;
  font-weight: 700;
  color: var(--header-text-color);
  padding: 6px 12px;
  border-radius: 10px;
  background: var(--background-color-soft);
  border: 1px solid var(--border-color);
}

.reply-modal__status-pill {
  font-size: 11px !important;
  letter-spacing: 0.04em;
}

/* Status colours on modal (table styles are scoped under .tickets-table) */
.modal-shell .status-badge {
  display: inline-block;
  padding: 5px 12px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  color: #fff;

  &.open {
    background: #3b82f6;
  }
  &.pending {
    background: #f59e0b;
  }
  &.closed {
    background: #10b981;
  }
}

.reply-modal__close {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 12px;
  background: var(--background-color-soft);
  color: var(--normal-text-color);
  cursor: pointer;
  transition:
    background 0.15s ease,
    color 0.15s ease;

  &:hover {
    background: var(--border-color);
    color: var(--header-text-color);
  }
}

.reply-modal__hero {
  flex-shrink: 0;
  padding: 18px 22px 16px;
  border-bottom: 1px solid var(--border-color);
}

.reply-modal__eyebrow {
  margin: 0 0 6px;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--primary-green-color);
  opacity: 0.95;
}

.reply-modal__subject {
  margin: 0;
  font-size: 1.35rem;
  font-weight: 800;
  line-height: 1.3;
  letter-spacing: -0.02em;
  color: var(--header-text-color);
}

.reply-modal__scroll {
  flex: 1;
  min-height: 0;
  overflow-x: hidden;
  overflow-y: auto;
  overscroll-behavior: contain;
  -webkit-overflow-scrolling: touch;
  padding: 18px 22px;
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.reply-field-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--normal-text-color);
  margin-bottom: 6px;
}

.reply-field-label__icon {
  opacity: 0.7;
  font-size: 12px;
}

.reply-meta-card {
  padding: 16px;
  border-radius: 14px;
  background: var(--background-color-soft);
  border: 1px solid var(--border-color);
}

.reply-meta-card__row {
  margin-bottom: 14px;

  &:last-child {
    margin-bottom: 0;
  }

  &--code {
    margin-bottom: 16px;
  }
}

.reply-meta-card__uuid {
  display: block;
  width: 100%;
  margin: 0;
  padding: 10px 12px;
  font-size: 12px;
  line-height: 1.45;
  word-break: break-all;
  border-radius: 10px;
  background: var(--background-color);
  border: 1px solid var(--border-color);
  color: var(--header-text-color);
}

.reply-meta-card__text {
  font-size: 14px;
  color: var(--header-text-color);
  font-weight: 500;
}

.reply-meta-card__dates {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px dashed var(--border-color);
}

.reply-date-tile {
  padding: 12px;
  border-radius: 12px;
  background: var(--background-color);
  border: 1px solid var(--border-color);
}

.reply-date-tile__value {
  display: block;
  margin-top: 4px;
  font-size: 13px;
  font-weight: 600;
  color: var(--header-text-color);
}

.reply-panel {
  border-radius: 14px;
  overflow: visible;
  border: 1px solid var(--border-color);
  background: var(--background-color-soft);

  &--user {
    border-left: 4px solid var(--primary-green-color);
  }

  &--prev {
    border-left: 4px solid #f59e0b;
    background: rgba(245, 158, 11, 0.06);
  }

  &--compose {
    border: 2px solid var(--border-color);
    background: var(--background-color);
    padding: 16px;
  }

  &--inline {
    padding: 14px 16px;
    border-style: dashed;
  }
}

.reply-panel__head {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--header-text-color);
  border-bottom: 1px solid var(--border-color);
  background: rgba(0, 0, 0, 0.03);
}

.reply-panel__head-icon {
  color: var(--primary-green-color);
  font-size: 14px;
}

.reply-panel--prev .reply-panel__head-icon {
  color: #f59e0b;
}

.reply-panel__body {
  padding: 14px 16px;
  font-size: 14px;
  line-height: 1.6;
  color: var(--header-text-color);
  white-space: pre-wrap;
  word-break: break-word;

  &--scroll {
    min-height: 72px;
    max-height: min(240px, 38vh);
    overflow-x: hidden;
    overflow-y: auto;
    overscroll-behavior: contain;
  }

  &--muted {
    opacity: 0.92;
  }
}

.reply-compose-label {
  display: block;
  margin-bottom: 10px;
  font-size: 13px;
  font-weight: 700;
  color: var(--header-text-color);
}

.reply-compose-textarea {
  width: 100%;
  box-sizing: border-box;
  padding: 14px 16px;
  border-radius: 12px;
  border: 1px solid var(--border-color);
  background: var(--background-color-soft);
  color: var(--header-text-color);
  font-family: inherit;
  font-size: 15px;
  line-height: 1.55;
  resize: vertical;
  min-height: 120px;
  transition:
    border-color 0.15s ease,
    box-shadow 0.15s ease;

  &:focus {
    outline: none;
    border-color: var(--primary-green-color);
    box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.15);
  }

  &::placeholder {
    color: var(--normal-text-color);
    opacity: 0.55;
  }
}

.reply-modal__footer {
  flex-shrink: 0;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 22px 18px;
  border-top: 1px solid var(--border-color);
  background: var(--background-color);
  box-shadow: 0 -8px 24px -12px rgba(0, 0, 0, 0.12);
}

.reply-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition:
    filter 0.15s ease,
    opacity 0.15s ease;

  &__icon {
    font-size: 14px;
  }

  &--ghost {
    background: transparent;
    border: 1px solid var(--border-color);
    color: var(--header-text-color);

    &:hover {
      background: var(--background-color-soft);
    }
  }

  &--primary {
    border: none;
    background: var(--primary-green-color);
    color: #fff;

    &:hover:not(:disabled) {
      filter: brightness(1.06);
    }

    &:disabled {
      opacity: 0.55;
      cursor: not-allowed;
    }
  }
}

@media (max-width: 900px) {
  .tickets-table {
    .col-subject .subject-cell {
      max-width: 180px;
    }
  }
}

@media (max-width: 520px) {
  .reply-meta-card__dates {
    grid-template-columns: 1fr;
  }

  .reply-modal__subject {
    font-size: 1.15rem;
  }

  .reply-modal__footer {
    flex-direction: column-reverse;

    .reply-btn {
      width: 100%;
      justify-content: center;
    }
  }
}
</style>
