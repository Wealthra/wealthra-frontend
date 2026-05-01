<template>
  <div class="assignment-box">
    <div class="form-row">
      <div class="input-group">
        <label>{{ t.userEmail }}</label>
        <input v-model="email" type="email" :placeholder="t.emailPlaceholder" />
      </div>
      <div class="input-group">
        <label>{{ t.selectPlan }}</label>
        <UISelect 
          v-model="selectedPlanId" 
          :options="planOptions" 
          :placeholder="t.choosePlan"
          :searchable="true"
        />
      </div>
      <button class="assign-btn" @click="handleAssign" :disabled="!isValid || isSubmitting">
        <font-awesome-icon :icon="isSubmitting ? 'spinner' : 'check'" :spin="isSubmitting" />
        <span>{{ t.assign }}</span>
      </button>
    </div>
    <p v-if="message" :class="['message', isError ? 'error' : 'success']">{{ message }}</p>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed } from 'vue'
import UISelect from '@/components/UISelect.vue'
import type { PropType } from 'vue'
import { adminPlansService } from '@/services/api/adminPlans/adminPlans.service'
import type { AdminPlan } from '@/services/api/adminPlans/adminPlans.models'

export default defineComponent({
  name: 'AdminUserAssignment',
  components: { UISelect },
  props: {
    plans: {
      type: Array as PropType<AdminPlan[]>,
      required: true
    },
    selectedLanguage: {
      type: String,
      default: 'English'
    }
  },
  emits: ['assigned'],
  setup(props, { emit }) {
    const email = ref('')
    const selectedPlanId = ref(0)
    const isSubmitting = ref(false)
    const message = ref('')
    const isError = ref(false)

    const isValid = computed(() => {
      return email.value.includes('@') && selectedPlanId.value !== 0
    })

    const planOptions = computed(() => {
      return props.plans.map(plan => ({
        label: `${plan.name} (ID: ${plan.id})`,
        value: plan.id
      }))
    })

    const t = computed(() => {
      const isTr = props.selectedLanguage === 'Turkish'
      return {
        userEmail: isTr ? 'Kullanıcı E-postası' : 'User Email',
        emailPlaceholder: isTr ? 'ornek@mail.com' : 'user@example.com',
        selectPlan: isTr ? 'Plan Seçin' : 'Select Plan',
        choosePlan: isTr ? 'Bir plan seçin...' : 'Choose a plan...',
        assign: isTr ? 'Ata' : 'Assign',
        successMsg: isTr ? 'Plan başarıyla atandı.' : 'Plan assigned successfully.',
        errorMsg: isTr ? 'Plan atanırken hata oluştu.' : 'Error assigning plan.'
      }
    })

    const handleAssign = async () => {
      isSubmitting.value = true
      message.value = ''
      try {
        await adminPlansService.assignPlanToUser({
          email: email.value,
          planId: selectedPlanId.value
        })
        isError.value = false
        message.value = t.value.successMsg
        email.value = ''
        selectedPlanId.value = 0
        emit('assigned')
      } catch (error: any) {
        isError.value = true
        message.value = error.message || t.value.errorMsg
      } finally {
        isSubmitting.value = false
      }
    }

    return {
      email,
      selectedPlanId,
      isSubmitting,
      message,
      isError,
      isValid,
      planOptions,
      t,
      handleAssign
    }
  }
})
</script>

<style scoped lang="scss">
.assignment-box {
  .form-row {
    display: flex;
    align-items: flex-end;
    gap: 16px;
    flex-wrap: wrap;
  }

  .input-group {
    flex: 1;
    min-width: 200px;
    display: flex;
    flex-direction: column;
    gap: 8px;

    label {
      font-size: 13px;
      font-weight: 500;
      color: var(--normal-text-color);
    }

    input, select {
      padding: 10px 14px;
      border-radius: 8px;
      border: 1px solid var(--border-color);
      background: var(--background-color-soft);
      color: var(--header-text-color);
      font-size: 14px;
      outline: none;

      &:focus {
        border-color: var(--primary-green-color);
        background: var(--background-color);
      }
    }
  }

  .assign-btn {
    height: 40px;
    padding: 0 32px;
    border-radius: 8px;
    border: none;
    background: var(--primary-green-color);
    color: white;
    font-weight: 500;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 8px;
    transition: all 0.2s;

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    &:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 200, 83, 0.2);
    }
  }

  .message {
    margin-top: 16px;
    font-size: 14px;
    font-weight: 500;

    &.success { color: #4caf50; }
    &.error { color: #f44336; }
  }
}
</style>
