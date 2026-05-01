<template>
  <div class="ui-form-c">
    <div
      class="ui-input"
      :class="`border-state-${borderState}`"
      @focusin="borderState = true"
      @focusout="borderState = false"
    >
      <div class="ui-logo-wrapper">
        <font-awesome-icon
          :icon="inputIcon"
          class="ui-logo"
          :class="`border-state-${borderState}`"
        />
      </div>
      <div class="ui-input-wrapper" :class="`border-state-${borderState}`">
        <input
          :type="isPassword ? (showPassword ? 'text' : 'password') : inputType"
          :value="modelValue"
          @input="updateValue($event)"
          :placeholder="description"
          class="ui-input-field"
          required
        />
        <div v-if="isPassword" class="eye-icon-wrapper" @click="showPassword = !showPassword">
          <font-awesome-icon
            :icon="passwordEyeIcon"
            class="eye-icon"
            :class="`border-state-${borderState}`"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { inputIconMap, passwordEyeIcons } from '../icons/fontawesome-icons'

export default defineComponent({
  name: 'UIFormSection',
  props: {
    modelValue: { type: String, default: '' },
    description: { type: String, default: '' },
    icon: { type: String, default: '' },
    fieldType: { type: String, default: '' },
  },
  data() {
    return {
      showPassword: false,
      borderState: false,
    }
  },
  computed: {
    isPassword(): boolean {
      return this.icon === 'password'
    },
    inputType(): string {
      return this.fieldType === 'email' ? 'email' : 'text'
    },
    inputIcon() {
      const key =
        this.icon === 'person' ? 'user' : (this.icon as keyof typeof inputIconMap | undefined)
      return inputIconMap[key ?? 'user']
    },
    passwordEyeIcon() {
      return this.showPassword ? passwordEyeIcons.visible : passwordEyeIcons.hidden
    },
  },
  methods: {
    updateValue(event: Event) {
      const value = (event.target as HTMLInputElement).value
      this.$emit('update:modelValue', value)
      this.$emit('update-user-data', value, this.fieldType)
    },
  },
})
</script>

<style scoped lang="scss">
.ui-form-c {
  width: 100%;

  .ui-input {
    display: flex;
    width: 100%;
    height: 2.2rem;
    background-color: var(--input-background-color);
    border: 1.5px solid var(--border-color);
    border-radius: 10px;
    transition: all 0.2s ease;

    &:hover {
      border-color: var(--reverse-border-color);
    }

    &.border-state-true {
      border-color: var(--primary-blue-color);
      box-shadow: 0 0 0 3px rgba(var(--primary-blue-rgb), 0.1);
    }

    .ui-logo-wrapper {
      display: flex;
      justify-content: center;
      align-items: center;
      min-width: 2.2rem;

      .ui-logo {
        height: 0.9rem;
        opacity: 0.6;
        transition: all 0.2s ease;

        &.border-state-true {
          opacity: 1;
          color: var(--primary-blue-color);
        }
      }
    }

    .ui-input-wrapper {
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 100%;

      .ui-input-field {
        width: 100%;
        height: 100%;
        font-size: 0.85rem;
        color: var(--header-text-color);
        background-color: transparent;
        border: none;
        padding: 0 0.2rem;

        &::placeholder {
          font-size: 0.8rem;
          opacity: 0.5;
        }

        &:focus {
          outline: none;
        }
      }

      .eye-icon-wrapper {
        display: flex;
        justify-content: center;
        align-items: center;
        min-width: 2.2rem;
        cursor: pointer;

        .eye-icon {
          height: 0.9rem;
          opacity: 0.6;
          transition: all 0.2s ease;

          &:hover {
            opacity: 1;
          }

          &.border-state-true {
            opacity: 1;
            color: var(--primary-blue-color);
          }
        }
      }
    }
  }
}

@media (max-width: 768px) {
  .ui-form-c .ui-input {
    height: 2rem;

    .ui-logo-wrapper {
      min-width: 2rem;

      .ui-logo {
        height: 0.8rem;
      }
    }

    .ui-input-wrapper .ui-input-field {
      font-size: 0.8rem;
    }

    .ui-input-wrapper .eye-icon-wrapper {
      min-width: 2rem;

      .eye-icon {
        height: 0.8rem;
      }
    }
  }
}
</style>
