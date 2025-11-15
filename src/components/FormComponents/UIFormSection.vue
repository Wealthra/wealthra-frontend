<template>
  <div class="ui-form-c">
    <div
      class="ui-input"
      :class="`border-state-${borderState}`"
      @focusin="borderState = true"
      @focusout="borderState = false"
    >
      <div class="ui-logo-wrapper">
        <img
          :src="`src/icons/${getIconSrc}.svg`"
          alt="icon"
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
          <img
            :src="`src/icons/eye-${showPassword ? 'on' : 'off'}.svg`"
            alt="eye"
            class="eye-icon"
            :class="`border-state-${borderState}`"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
export default {
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
    isPassword() {
      return this.icon === 'password'
    },
    inputType() {
      return this.fieldType === 'email' ? 'email' : 'text'
    },
    getIconSrc() {
      switch (this.icon) {
        case 'password':
          return 'password'
        case 'email':
          return 'email'
        case 'person':
          return 'user'
        default:
          return 'user'
      }
    },
  },
  methods: {
    updateValue(event: Event) {
      const value = (event.target as HTMLInputElement).value
      this.$emit('update:modelValue', value)
      this.$emit('update-user-data', value, this.fieldType)
    },
  },
}
</script>

<style scoped lang="scss">
.ui-form-c {
  width: 100%;

  .ui-input {
    display: flex;
    width: 100%;
    height: 2.5rem;
    background-color: var(--input-background-color);
    border: 1px solid var(--border-color);
    border-radius: var(--border-radius);

    &.border-state-true {
      border-color: var(--reverse-border-color);
      transition: border-color 0.3s ease-in-out;
    }
    .ui-logo-wrapper {
      display: flex;
      justify-content: center;
      align-items: center;
      min-width: 2.5rem;

      .ui-logo {
        padding: 0 0.4rem;
        border-right: 1px solid var(--border-color);
        height: 1.2rem;
        &.border-state-true {
          border-right: 1px solid var(--reverse-border-color);
          filter: invert(var(--filter));
          transition: all 0.3s ease-in-out;
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
        font-size: 0.9rem;
        color: var(--header-text-color);
        background-color: transparent;
        border: none;
        padding: 0 0.4rem;

        &:focus {
          outline: none;
        }
      }

      .eye-icon-wrapper {
        display: flex;
        justify-content: center;
        align-items: center;
        min-width: 2.5rem;
        cursor: pointer;

        .eye-icon {
          height: 1.2rem;
          &.border-state-true {
            filter: invert(var(--filter));
            transition: all 0.3s ease-in-out;
          }
        }
      }
    }
  }
}

@media (max-width: 768px) {
  .ui-form-c .ui-input {
    height: 2.2rem;

    .ui-logo-wrapper {
      min-width: 2.2rem;

      .ui-logo {
        height: 1rem;
      }
    }

    .ui-input-wrapper .ui-input-field {
      font-size: 0.8rem;
      padding: 0 0.2rem;
    }

    .ui-input-wrapper .eye-icon-wrapper {
      padding: 0.2rem;
      min-width: 2.2rem;

      .eye-icon {
        height: 1rem;
      }
    }
  }
}
</style>
