<template>
  <div class="goals-categories-component-c">
    <div class="goals-categories-header-title">
      {{ selectedLanguage === 'English' ? 'Active Goals' : 'Aktif Hedefler' }}
    </div>
    <div class="goals-categories-data-table">
      <table class="goals-table">
        <thead>
          <tr>
            <th>{{ selectedLanguage === 'English' ? 'Name' : 'İsim' }}</th>
            <th>{{ selectedLanguage === 'English' ? 'Target Amount' : 'Hedef Miktar' }}</th>
            <th>{{ selectedLanguage === 'English' ? 'Initial Amount' : 'Başlangıç Miktar' }}</th>
            <th>{{ selectedLanguage === 'English' ? 'Deadline' : 'Son Tarih' }}</th>
            <th></th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(goalCategory, index) in goalCategoriesData"
            :key="index"
            class="goals-categories-data-item"
          >
            <td class="goals-categories-data-item-name">
              {{ goalCategory.name }}
            </td>
            <td class="goals-categories-data-item-target-amount">
              {{ formatAmount(goalCategory.targetAmount) }}
            </td>
            <td class="goals-categories-data-item-initial-amount">
              {{ formatAmount(goalCategory.initialAmount) }}
            </td>

            <td class="goals-categories-data-item-deadline">
              {{ formatDate(goalCategory.deadline) }}
            </td>
            <td class="goals-categories-data-item-delete">
              <button class="icon-button" @click="handleGoalCategoryDelete(goalCategory.id)">
                <font-awesome-icon :icon="actionIcons.delete" />
              </button>
            </td>
            <td class="goals-categories-data-item-edit">
              <button class="icon-button" @click="openEditModal(goalCategory)">
                <font-awesome-icon :icon="actionIcons.edit" />
              </button>
            </td>
          </tr>
          <tr v-if="!goalCategoriesData || goalCategoriesData.length === 0">
            <td colspan="6" class="no-data">
              <div class="no-data-text">
                {{
                  selectedLanguage === 'English'
                    ? '🎯 No goals available 🎯'
                    : '🎯 Hedef bulunmamaktadır 🎯'
                }}
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div v-if="isEditModalOpen" class="edit-modal">
      <div class="edit-modal-content">
        <div class="edit-modal-header">
          <h2>{{ selectedLanguage === 'English' ? 'Edit Goal' : 'Hedefi Düzenle' }}</h2>
          <button class="close-button" @click="closeEditModal">×</button>
        </div>
        <div class="edit-modal-body">
          <div class="form-group">
            <label>{{ selectedLanguage === 'English' ? 'Name' : 'İsim' }}</label>
            <input type="text" v-model="editModalData.name" />
          </div>
          <div class="form-group">
            <label>{{ selectedLanguage === 'English' ? 'Target Amount' : 'Hedef Miktar' }}</label>
            <input type="number" v-model.number="editModalData.targetAmount" />
          </div>
          <div class="form-group">
            <label>{{
              selectedLanguage === 'English' ? 'Initial Amount' : 'Başlangıç Miktar'
            }}</label>
            <input type="number" v-model.number="editModalData.initialAmount" />
          </div>
          <div class="form-group">
            <label>{{ selectedLanguage === 'English' ? 'Deadline' : 'Son Tarih' }}</label>
            <div class="datepicker-wrapper">
              <Datepicker
                v-model:value="editModalData.deadline"
                :language="selectedLanguage === 'English' ? 'en' : 'tr'"
                :placeholder="selectedLanguage === 'English' ? 'Select date' : 'Tarih Seçin'"
                :disabled-date="disablePastDates"
              />
            </div>
          </div>
        </div>
        <div class="edit-modal-footer">
          <button @click="closeEditModal">
            {{ selectedLanguage === 'English' ? 'Cancel' : 'İptal' }}
          </button>
          <button @click="saveEditModal">
            {{ selectedLanguage === 'English' ? 'Save' : 'Kaydet' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Datepicker from 'vue-datepicker-next'
import { actionIcons } from '@/icons/fontawesome-icons'

export default {
  name: 'GoalsCategoriesComponent',
  data() {
    return {
      isEditModalOpen: false,
      editModalData: {
        id: 0,
        name: '',
        targetAmount: 0,
        initialAmount: 0,
        deadline: '',
      },
      actionIcons,
    }
  },
  components: {
    Datepicker,
  },
  props: {
    goalCategoriesData: {
      type: Array as () => Array<{
        id: number
        name: string
        targetAmount: number
        initialAmount: number
        deadline: string
      }>,
      default: () => [],
    },
    selectedLanguage: {
      type: String,
      default: 'English',
    },
  },

  methods: {
    formatDate(date: string) {
      return date.split('T')[0].split('-').join('.')
    },

    formatAmount(amount: number) {
      return amount.toLocaleString('en-US', {
        style: 'currency',
        currency: 'USD',
      })
    },

    disablePastDates(date: Date) {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      return date < today
    },

    openEditModal(goalCategory: {
      id: number
      name: string
      targetAmount: number
      initialAmount: number
      deadline: string
    }) {
      // Copy the selected goal's data to the modal
      this.editModalData = {
        id: goalCategory.id,
        name: goalCategory.name,
        targetAmount: goalCategory.targetAmount,
        initialAmount: goalCategory.initialAmount,
        deadline: goalCategory.deadline,
      }
      this.isEditModalOpen = true
    },

    closeEditModal() {
      this.isEditModalOpen = false
      this.editModalData = {
        id: 0,
        name: '',
        targetAmount: 0,
        initialAmount: 0,
        deadline: '',
      }
    },

    saveEditModal() {
      const date = new Date(this.editModalData.deadline)
      const dateFormatted = `${date.getFullYear()}-${('0' + (date.getMonth() + 1)).slice(
        -2
      )}-${('0' + date.getDate()).slice(-2)}`

      this.editModalData.deadline = dateFormatted
      this.$emit('handleUpdateGoalCategoryItem', { ...this.editModalData })
      this.closeEditModal()
    },

    handleGoalCategoryDelete(goalCategoryId: number) {
      this.$emit('handleDeleteGoalCategoryItem', goalCategoryId)
    },
  },
}
</script>

<style scoped lang="scss">
.goals-categories-component-c {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-start;
  width: 100%;
  height: 80%;
  background-color: var(--background-color-soft);
  border-radius: var(--border-radius);
  border: 1px solid var(--border-color);
  padding: 2rem;

  .goals-categories-header-title {
    display: flex;
    width: 100%;
    justify-content: flex-start;
    align-items: center;
    font-size: 1.5rem;
    font-weight: bold;
    margin-bottom: 1rem;
    color: var(--header-text-color);
  }

  .goals-categories-data-table {
    width: 100%;
    height: 100%;
    overflow-y: auto;
    -ms-overflow-style: none;
    scrollbar-width: none;

    &::-webkit-scrollbar {
      display: none;
    }

    .goals-table {
      width: 100%;
      border-collapse: collapse;

      th {
        text-align: left;
        padding: 1rem;
        border-bottom: 1px solid var(--border-color);
        color: var(--normal-text-color);
        font-size: 0.9rem;
        font-weight: 500;
      }

      td {
        padding: 1rem;
        border-bottom: 1px solid var(--border-color-light);
        color: var(--normal-text-color);
      }

      tr:last-child td {
        border-bottom: none;
      }

      .goals-categories-data-item {
        &-name {
          font-size: 1rem;
          color: var(--header-text-color);
        }

        &-target-amount,
        &-initial-amount {
          font-size: 1rem;
          color: var(--normal-text-color);
        }

        &-deadline {
          font-size: 1rem;
          color: var(--normal-text-color);
        }

        &-delete,
        &-edit {
          text-align: center;

          img {
            width: 1.5rem;
            height: 1.5rem;
            cursor: pointer;

            &:hover {
              scale: 1.1;
              transition: transform 0.2s ease-in-out;
            }
          }
        }
      }

      .no-data {
        text-align: center;
        padding: 1rem;
        color: var(--normal-text-color);
        background-color: var(--background-color-soft);
        border-radius: var(--border-radius);

        .no-data-text {
          display: flex;
          justify-content: center;
          align-items: center;
          color: var(--normal-text-color);
          font-size: 1.2rem;
        }
      }
    }
  }

  .edit-modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;

    &-content {
      background-color: var(--background-color);
      padding: 2rem;
      border-radius: var(--border-radius);
      width: 600px;
      max-width: 90%;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }

    &-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;

      h2 {
        color: var(--header-text-color);
        margin: 0;
        font-size: 1.5rem;
      }

      .close-button {
        background: none;
        border: none;
        font-size: 1.5rem;
        cursor: pointer;
        color: var(--normal-text-color);
      }
    }

    &-body {
      margin-bottom: 1.5rem;

      .form-group {
        margin-bottom: 1rem;

        label {
          display: block;
          margin-bottom: 0.5rem;
          color: var(--normal-text-color);
        }

        input {
          width: 100%;
          padding: 0.75rem;
          border: 1px solid var(--border-color);
          border-radius: var(--border-radius);
          background-color: var(--background-color-soft);
          color: var(--normal-text-color);
          font-size: 1rem;
        }
      }
      .datepicker-wrapper {
        display: flex;
        justify-content: center;
        align-items: center;
        width: 100%;
        height: 100%;

        :deep(.mx-input) {
          width: 100%;
          height: 44px;
          padding: 0.75rem;
          border-radius: var(--border-radius);
          border: 1px solid var(--border-color);
          font-size: 1rem;
          background-color: var(--background-color-soft);
          color: var(--normal-text-color);
        }

        :deep(.mx-datepicker) {
          width: 100%;
        }
      }
    }

    &-footer {
      display: flex;
      justify-content: flex-end;
      gap: 1rem;

      button {
        padding: 0.75rem 1.5rem;
        border: none;
        border-radius: var(--border-radius);
        cursor: pointer;
        font-size: 1rem;
        transition:
          transform 0.2s ease,
          opacity 0.2s ease;

        &:first-child {
          background-color: var(--background-color-soft);
          color: var(--normal-text-color);
          border: 1px solid var(--border-color);
        }

        &:last-child {
          background-color: var(--background-color-soft);
          color: var(--normal-text-color);
          border: 1px solid var(--border-color);
        }

        &:hover {
          background-color: var(--primary-green-color);
          color: white;
        }
      }
    }
  }
}
@media (max-width: 768px) {
  .goals-categories-component-c {
    padding: 1rem;

    .goals-categories-header-title {
      font-size: 1.2rem;
    }

    .goals-categories-data-table {
      .goals-table {
        th,
        td {
          font-size: 0.8rem;
        }
      }
    }

    .edit-modal-content {
      width: 90%;
    }
  }
}
</style>
