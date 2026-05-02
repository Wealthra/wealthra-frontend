<template>
  <div class="goals-add-category-c">
    <div class="goals-add-header-title">
      {{ selectedLanguage === 'English' ? 'Create Goal' : 'Hedef Oluştur' }}
    </div>
    <div class="goals-add-category-content">
      <div class="goals-add-category-input">
        <input type="text" :placeholder="placeholders.name" v-model="goalName" />

        <div class="datepicker-wrapper">
          <Datepicker
            v-model:value="deadline"
            :placeholder="placeholders.deadline"
            :disabled-date="disablePastDates"
          />
        </div>

        <input type="number" :placeholder="placeholders.target" v-model="targetAmount" />
        <input type="number" :placeholder="placeholders.deposit" v-model="initialDeposit" />
      </div>
      <div class="goals-add-category-button">
        <button @click="handleAddNewGoalCategory">
          {{ selectedLanguage === 'English' ? 'Save' : 'Kaydet' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Datepicker from 'vue-datepicker-next'
import 'vue-datepicker-next/index.css'
import { useToast } from '@/stores/useToast'

export default {
  name: 'GoalsAddCategoryComponent',
  components: {
    Datepicker,
  },
  setup() {
    const toast = useToast()
    return { toast }
  },
  data() {
    return {
      goalName: '',
      initialDeposit: null,
      targetAmount: null,
      deadline: '',
    }
  },
  props: {
    selectedLanguage: {
      type: String,
      default: 'English',
    },
  },
  computed: {
    placeholders() {
      return this.selectedLanguage === 'English'
        ? {
            name: 'Enter goal name',
            deadline: 'Select deadline date',
            target: 'Enter target amount',
            deposit: 'Enter deposit amount',
          }
        : {
            name: 'Hedef adını girin',
            deadline: 'Son tarih seçin',
            target: 'Hedef tutarı girin',
            deposit: 'Başlangıç tutarını girin',
          }
    },
  },
  methods: {
    disablePastDates(date: Date) {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      return date < today
    },
    handleAddNewGoalCategory() {
      if (this.goalName && this.targetAmount && this.deadline && this.initialDeposit) {
        const formattedDate = new Date(this.deadline)

        const formattedDeadline = `${formattedDate.getFullYear()}-${(
          '0' +
          (formattedDate.getMonth() + 1)
        ).slice(-2)}-${('0' + formattedDate.getDate()).slice(-2)}`

        const newGoalCategory = {
          name: this.goalName,
          targetAmount: this.targetAmount,
          deadline: formattedDeadline,
          initialDeposit: this.initialDeposit,
        }
        this.$emit('handleAddNewGoalCategory', newGoalCategory)
        this.resetForm()
      } else {
        this.toast.warning(
          this.selectedLanguage === 'English'
            ? 'Please fill in all fields'
            : 'Lütfen tüm alanları doldurun'
        )
      }
    },
    resetForm() {
      this.goalName = ''
      this.targetAmount = null
      this.deadline = ''
      this.initialDeposit = null
    },
  },
}
</script>

<style scoped lang="scss">
.goals-add-category-c {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
  width: 100%;
  height: 80%;
  background-color: var(--background-color-soft);
  border-radius: var(--border-radius);
  border: 1px solid var(--border-color);
  padding: 2rem;

  .goals-add-header-title {
    display: flex;
    width: 100%;
    justify-content: flex-start;
    font-size: 1.5rem;
    font-weight: bold;
    margin-bottom: 1rem;
    color: var(--header-text-color);
  }

  .goals-add-category-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    gap: 1rem;

    .goals-add-category-input {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      width: 100%;

      .datepicker-wrapper {
        display: flex;
        justify-content: center;
        align-items: center;
        width: 100%;

        :deep(.mx-input) {
          width: 100%;
          height: 3rem;
          padding: 0.5rem;
          border-radius: var(--border-radius);
          border: 1px solid var(--border-color);
          font-size: 1rem;
          background-color: var(--background-color);
          color: var(--normal-text-color);
        }

        :deep(.mx-datepicker) {
          width: 100%;
        }
      }

      input {
        width: 100%;
        height: 3rem;
        padding: 0.5rem;
        border-radius: var(--border-radius);
        background-color: var(--background-color);
        color: var(--normal-text-color);

        border: 1px solid var(--border-color);
        font-size: 1rem;
      }
    }

    .goals-add-category-button {
      display: flex;
      justify-content: center;
      align-items: center;
      width: 100%;
      padding: 1rem;
      button {
        width: 100%;
        height: 2.5rem;
        font-size: 1.2rem;
        font-weight: bold;
        background-color: var(--primary-green-color);
        color: white;
        border-radius: var(--border-radius);
        border: none;
        cursor: pointer;

        &:hover {
          background-color: var(--reverse-primary-green-color);
        }
      }
    }
  }
}
@media (max-width: 768px) {
  .goals-add-category-c {
    padding: 1rem;

    .goals-add-header-title {
      font-size: 1.2rem;
    }

    .goals-add-category-content {
      .goals-add-category-input {
        gap: 0.5rem;

        input {
          height: 2.5rem;
          font-size: 0.9rem;
        }
      }

      .goals-add-category-button {
        button {
          height: 2rem;
          font-size: 1rem;
        }
      }
    }
  }
}
</style>
