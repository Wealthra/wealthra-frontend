<template>
  <div class="admin-support-tickets">
    <div class="filters">
      <UISelect 
        v-model="filterStatus" 
        :options="[
          { label: 'All Statuses', value: 'all' },
          { label: 'Open', value: 'Open' },
          { label: 'Pending', value: 'Pending' },
          { label: 'Closed', value: 'Closed' }
        ]"
        @update:model-value="fetchTickets" 
      />
    </div>

    <div v-if="isLoading" class="loading">Loading tickets...</div>
    <div v-else-if="tickets.length === 0" class="no-data glass-card">No tickets found.</div>
    <div v-else class="tickets-list">
      <div v-for="ticket in tickets" :key="ticket.id" class="ticket-card glass-card">
        <div class="ticket-header">
          <span class="ticket-id">#{{ ticket.id }}</span>
          <span :class="['status-badge', ticket.status.toLowerCase()]">{{ ticket.status }}</span>
          <span class="date">{{ new Date(ticket.createdAt).toLocaleString() }}</span>
        </div>
        <div class="ticket-body">
          <div class="user">{{ ticket.userEmail }}</div>
          <h4 class="subject">{{ ticket.subject }}</h4>
        </div>
        <div class="ticket-footer">
          <button class="reply-btn" @click="openReplyModal(ticket)">Reply / Update</button>
        </div>
      </div>
    </div>

    <!-- Reply Modal -->
    <div v-if="replyModalOpen" class="modal-overlay" @click.self="closeReplyModal">
      <div class="modal-content glass-card">
        <div class="modal-header">
          <h3>Ticket #{{ activeTicket?.id }}</h3>
          <button class="close-btn" @click="closeReplyModal">&times;</button>
        </div>
        <form @submit.prevent="handleReply" class="modal-body">
          <div class="info">
            <strong>User:</strong> {{ activeTicket?.userEmail }} <br/>
            <strong>Subject:</strong> {{ activeTicket?.subject }}
          </div>
          <div class="form-group">
            <label>Reply Message</label>
            <textarea v-model="replyMessage" rows="4" required placeholder="Type your reply to the user..."></textarea>
          </div>
          <div class="form-group">
            <label>Update Status</label>
            <UISelect 
              v-model="replyStatus" 
              :options="['Open', 'Pending', 'Closed']"
            />
          </div>
          <div class="modal-footer">
            <button type="button" class="cancel-btn" @click="closeReplyModal">Cancel</button>
            <button type="submit" class="save-btn" :disabled="isSubmitting">
              {{ isSubmitting ? 'Sending...' : 'Send Reply' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue'
import { adminService } from '@/services/api/admin/admin.service'
import type { SupportTicket } from '@/services/api/admin/admin.models'
import UISelect from '@/components/UISelect.vue'

export default defineComponent({
  name: 'AdminSupportTickets',
  components: {
    UISelect
  },
  setup() {
    const tickets = ref<SupportTicket[]>([])
    const isLoading = ref(true)
    const filterStatus = ref('Open')

    const replyModalOpen = ref(false)
    const activeTicket = ref<SupportTicket | null>(null)
    const replyMessage = ref('')
    const replyStatus = ref('Pending')
    const isSubmitting = ref(false)

    const fetchTickets = async () => {
      isLoading.value = true
      try {
        const status = filterStatus.value === 'all' ? undefined : (filterStatus.value || undefined)
        tickets.value = await adminService.getTickets(status)
      } catch (err) {
        console.error(err)
      } finally {
        isLoading.value = false
      }
    }

    const openReplyModal = (ticket: SupportTicket) => {
      activeTicket.value = ticket
      replyMessage.value = ''
      replyStatus.value = ticket.status
      replyModalOpen.value = true
    }

    const closeReplyModal = () => {
      replyModalOpen.value = false
      activeTicket.value = null
    }

    const handleReply = async () => {
      if (!activeTicket.value || !replyMessage.value) return
      isSubmitting.value = true
      try {
        await adminService.replyTicket(activeTicket.value.id, replyMessage.value, replyStatus.value)
        closeReplyModal()
        await fetchTickets()
      } catch (err) {
        alert('Failed to send reply.')
      } finally {
        isSubmitting.value = false
      }
    }

    onMounted(fetchTickets)

    return {
      tickets,
      isLoading,
      filterStatus,
      fetchTickets,
      replyModalOpen,
      activeTicket,
      replyMessage,
      replyStatus,
      isSubmitting,
      openReplyModal,
      closeReplyModal,
      handleReply
    }
  }
})
</script>

<style scoped lang="scss">
.filters {
  margin-bottom: 24px;
  select {
    padding: 10px 16px;
    border-radius: 8px;
    border: 1px solid var(--border-color);
    background: var(--background-color-soft);
    color: var(--header-text-color);
  }
}

.tickets-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.ticket-card {
  padding: 20px;

  .ticket-header {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 12px;

    .ticket-id { font-weight: bold; color: var(--normal-text-color); }
    .date { margin-left: auto; font-size: 12px; color: var(--normal-text-color); }
    
    .status-badge {
      padding: 4px 8px;
      border-radius: 12px;
      font-size: 11px;
      font-weight: bold;
      text-transform: uppercase;
      color: white;

      &.open { background: #3b82f6; }
      &.pending { background: #f59e0b; }
      &.closed { background: #10b981; }
    }
  }

  .ticket-body {
    margin-bottom: 16px;
    .user { font-size: 13px; color: var(--primary-green-color); margin-bottom: 4px; }
    .subject { margin: 0; font-size: 16px; }
  }

  .ticket-footer {
    display: flex;
    justify-content: flex-end;
    .reply-btn {
      background: var(--primary-green-color);
      color: white;
      border: none;
      padding: 8px 16px;
      border-radius: 6px;
      cursor: pointer;
      font-weight: 600;
    }
  }
}

.modal-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  backdrop-filter: blur(4px);
}

.modal-content {
  width: 100%;
  max-width: 500px;
  background: var(--background-color);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid var(--border-color);
  h3 { margin: 0; }
  .close-btn { background: none; border: none; font-size: 24px; cursor: pointer; color: var(--normal-text-color); }
}

.modal-body {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;

  .info {
    background: var(--background-color-soft);
    padding: 12px;
    border-radius: 8px;
    font-size: 14px;
    line-height: 1.5;
  }

  .form-group {
    display: flex;
    flex-direction: column;
    gap: 8px;
    label { font-weight: 600; font-size: 14px; }
    textarea, select {
      padding: 10px;
      border-radius: 8px;
      border: 1px solid var(--border-color);
      background: var(--background-color-soft);
      color: var(--header-text-color);
    }
  }
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 8px;

  button {
    padding: 10px 20px;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
  }
  .cancel-btn {
    background: transparent;
    border: 1px solid var(--border-color);
    color: var(--header-text-color);
  }
  .save-btn {
    background: var(--primary-green-color);
    border: none;
    color: white;
  }
}

.loading, .no-data {
  text-align: center;
  padding: 40px;
  color: var(--normal-text-color);
}
</style>
