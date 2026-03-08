<template>
  <UILoading
      v-if="isInitialLoading"
      :isLoading="isInitialLoading"
      :hasError="!!initialError"
      :loadingText="loadingText"
      :errorMessage="initialError || errorMessage"
      :retryText="selectedLanguage === 'English' ? 'Retry' : 'Tekrar Dene'"
      @retry="loadMe"
    />

    <template v-else>
      <div class="settings-root">
        <div class="settings-columns">
          <section class="settings-card">
            <h2>{{ profileTitle }}</h2>

            <div class="profile-layout">
              <div class="avatar-column">
                <div class="avatar-wrapper">
                  <img v-if="profileForm.avatarUrl" :src="profileForm.avatarUrl" alt="Avatar" />
                  <div v-else class="avatar-placeholder">
                    <span v-if="initials">{{ initials }}</span>
                    <font-awesome-icon v-else icon="user" />
                  </div>
                </div>

                <div class="avatar-actions">
                  <button type="button" class="secondary-btn" @click="onPickAvatar">
                    {{ avatarButtonLabel }}
                  </button>

                  <input
                    ref="avatarInput"
                    type="file"
                    accept="image/*"
                    class="hidden-input"
                    @change="onAvatarSelected"
                  />

                  <button
                    type="button"
                    class="primary-outline-btn"
                    :disabled="!avatarFile || isUploadingAvatar"
                    @click="onUploadAvatar"
                  >
                    <span v-if="isUploadingAvatar">
                      {{ selectedLanguage === 'English' ? 'Uploading...' : 'Yükleniyor...' }}
                    </span>
                    <span v-else>
                      {{ selectedLanguage === 'English' ? 'Upload avatar' : 'Avatarı yükle' }}
                    </span>
                  </button>
                </div>

                <p class="helper-text">
                  {{
                    selectedLanguage === 'English'
                      ? 'We upload your photo to a free image host and only store the URL.'
                      : 'Fotoğrafınızı ücretsiz bir görsel servisine yüklüyoruz, sadece linkini saklıyoruz.'
                  }}
                </p>

                <p v-if="avatarError" class="error-text">
                  {{ avatarError }}
                </p>
              </div>

              <div class="profile-column">
                <div class="two-column">
                  <div class="form-group">
                    <label for="firstName">
                      {{ selectedLanguage === 'English' ? 'First name' : 'Ad' }}
                    </label>
                    <input
                      id="firstName"
                      v-model="profileForm.firstName"
                      type="text"
                      autocomplete="given-name"
                    />
                    <p v-if="profileErrors.firstName" class="error-text">
                      {{ profileErrors.firstName }}
                    </p>
                  </div>

                  <div class="form-group">
                    <label for="lastName">
                      {{ selectedLanguage === 'English' ? 'Last name' : 'Soyad' }}
                    </label>
                    <input
                      id="lastName"
                      v-model="profileForm.lastName"
                      type="text"
                      autocomplete="family-name"
                    />
                    <p v-if="profileErrors.lastName" class="error-text">
                      {{ profileErrors.lastName }}
                    </p>
                  </div>
                </div>

                <div class="form-group">
                  <label for="email">Email</label>
                  <input id="email" :value="me?.email" type="email" disabled />
                </div>

                <div class="meta-row">
                  <span class="meta-label">
                    {{ selectedLanguage === 'English' ? 'Member since' : 'Kayıt tarihi' }}
                  </span>
                  <span class="meta-value">
                    {{ createdAtLabel }}
                  </span>
                </div>

                <div class="actions-row">
                  <button
                    type="button"
                    class="primary-btn"
                    :disabled="isSavingProfile"
                    @click="onSaveProfile"
                  >
                    <span v-if="isSavingProfile">
                      {{ selectedLanguage === 'English' ? 'Saving...' : 'Kaydediliyor...' }}
                    </span>
                    <span v-else>
                      {{ selectedLanguage === 'English' ? 'Save profile' : 'Profili kaydet' }}
                    </span>
                  </button>

                  <p v-if="profileSuccess" class="success-text">
                    {{
                      selectedLanguage === 'English'
                        ? 'Profile updated successfully.'
                        : 'Profil başarıyla güncellendi.'
                    }}
                  </p>

                  <p v-if="profileError" class="error-text">
                    {{ profileError }}
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section class="settings-card">
            <h2>{{ securityTitle }}</h2>

            <div class="password-layout">
              <div class="form-group">
                <label for="currentPassword">
                  {{ selectedLanguage === 'English' ? 'Current password' : 'Mevcut şifre' }}
                </label>
                <input
                  id="currentPassword"
                  v-model="passwordForm.currentPassword"
                  :type="showCurrentPassword ? 'text' : 'password'"
                  autocomplete="current-password"
                />
              </div>

              <div class="two-column">
                <div class="form-group">
                  <label for="newPassword">
                    {{ selectedLanguage === 'English' ? 'New password' : 'Yeni şifre' }}
                  </label>
                  <input
                    id="newPassword"
                    v-model="passwordForm.newPassword"
                    :type="showNewPassword ? 'text' : 'password'"
                    autocomplete="new-password"
                  />
                </div>

                <div class="form-group">
                  <label for="confirmPassword">
                    {{
                      selectedLanguage === 'English' ? 'Confirm new password' : 'Yeni şifre tekrar'
                    }}
                  </label>
                  <input
                    id="confirmPassword"
                    v-model="passwordForm.confirmPassword"
                    :type="showConfirmPassword ? 'text' : 'password'"
                    autocomplete="new-password"
                  />
                </div>
              </div>

              <ul class="helper-list">
                <li>
                  {{
                    selectedLanguage === 'English' ? 'At least 8 characters.' : 'En az 8 karakter.'
                  }}
                </li>
                <li>
                  {{
                    selectedLanguage === 'English'
                      ? 'Use letters, numbers and symbols if possible.'
                      : 'Mümkünse harf, rakam ve sembol kullan.'
                  }}
                </li>
              </ul>

              <div class="actions-row">
                <button
                  type="button"
                  class="primary-btn"
                  :disabled="isSavingPassword"
                  @click="onChangePassword"
                >
                  <span v-if="isSavingPassword">
                    {{
                      selectedLanguage === 'English'
                        ? 'Updating password...'
                        : 'Şifre güncelleniyor...'
                    }}
                  </span>
                  <span v-else>
                    {{ selectedLanguage === 'English' ? 'Update password' : 'Şifreyi güncelle' }}
                  </span>
                </button>

                <p v-if="passwordSuccess" class="success-text">
                  {{
                    selectedLanguage === 'English'
                      ? 'Password updated successfully.'
                      : 'Şifre başarıyla güncellendi.'
                  }}
                </p>

                <p v-if="passwordError" class="error-text">
                  {{ passwordError }}
                </p>
              </div>
            </div>
          </section>

          <section class="settings-card danger-zone">
            <h2>{{ dangerZoneTitle }}</h2>
            <p class="danger-zone-description">{{ dangerZoneDescription }}</p>
            <div class="actions-row">
              <button type="button" class="danger-btn" @click="openDeleteAccountModal">
                {{ deleteAccountButtonLabel }}
              </button>
            </div>
          </section>
        </div>
      </div>

      <!-- Delete account confirmation modal (GitHub-style) -->
      <div v-if="showDeleteAccountModal" class="modal-overlay" @click.self="closeDeleteAccountModal">
        <div class="modal-content delete-modal">
          <h3>{{ deleteModalTitle }}</h3>
          <p class="delete-modal-instruction">{{ deleteModalInstruction }}</p>
          <p class="delete-modal-phrase">
            <strong>{{ deleteConfirmationPhrase }}</strong>
          </p>
          <div class="form-group">
            <label for="deleteConfirmInput">{{ deleteModalLabel }}</label>
            <input
              id="deleteConfirmInput"
              v-model="deleteConfirmPhraseInput"
              type="text"
              class="delete-confirm-input"
              :placeholder="deleteConfirmationPhrase"
              autocomplete="off"
            />
          </div>
          <p v-if="deleteAccountError" class="error-text">{{ deleteAccountError }}</p>
          <div class="modal-actions">
            <button type="button" class="secondary-btn" @click="closeDeleteAccountModal">
              {{ cancelLabel }}
            </button>
            <button
              type="button"
              class="danger-btn"
              :disabled="!isDeletePhraseMatch || isDeletingAccount"
              @click="confirmDeleteAccount"
            >
              <span v-if="isDeletingAccount">{{ deletingLabel }}</span>
              <span v-else>{{ confirmDeleteLabel }}</span>
            </button>
          </div>
        </div>
      </div>
    </template>
</template>

<script lang="ts">
import { defineComponent, ref, computed, toRef } from 'vue'
import { useRouter } from 'vue-router'
import UILoading from '@/components/UILoading.vue'
import { accountService } from '@/services/api/account/account.service'
import type { AccountProfileResponse } from '@/services/api/account/account.models'
import { uploadAvatar } from '@/services/external/imageHost.service'
import { clearAuth } from '@/utils/auth'

export default defineComponent({
  name: 'SettingsView',
  props: {
    selectedLanguage: {
      type: String as () => 'English' | 'Turkish',
      default: 'English',
    },
  },
  components: {
    UILoading,
  },
  setup(props) {
    const router = useRouter()
    const selectedLanguage = toRef(props, 'selectedLanguage')

    const me = ref<AccountProfileResponse | null>(null)

    const profileForm = ref({
      firstName: '',
      lastName: '',
      avatarUrl: '',
    })

    const passwordForm = ref({
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    })

    const isInitialLoading = ref(false)
    const initialError = ref<string | null>(null)

    const isSavingProfile = ref(false)
    const profileError = ref<string | null>(null)
    const profileSuccess = ref(false)

    const isUploadingAvatar = ref(false)
    const avatarFile = ref<File | null>(null)
    const avatarError = ref<string | null>(null)

    const isSavingPassword = ref(false)
    const passwordError = ref<string | null>(null)
    const passwordSuccess = ref(false)

    const profileErrors = ref<{ firstName?: string; lastName?: string }>({})

    const showCurrentPassword = ref(false)
    const showNewPassword = ref(false)
    const showConfirmPassword = ref(false)

    const avatarInput = ref<HTMLInputElement | null>(null)

    const showDeleteAccountModal = ref(false)
    const deleteConfirmPhraseInput = ref('')
    const isDeletingAccount = ref(false)
    const deleteAccountError = ref<string | null>(null)

    const loadingText = computed(() =>
      selectedLanguage.value === 'English' ? 'Loading your profile...' : 'Profiliniz yükleniyor...'
    )

    const errorMessage = computed(() =>
      selectedLanguage.value === 'English'
        ? 'Failed to load profile. Please try again.'
        : 'Profil yüklenemedi. Lütfen tekrar deneyin.'
    )

    const profileTitle = computed(() =>
      selectedLanguage.value === 'English' ? 'Profile' : 'Profil'
    )

    const securityTitle = computed(() =>
      selectedLanguage.value === 'English' ? 'Security' : 'Güvenlik'
    )

    const avatarButtonLabel = computed(() =>
      selectedLanguage.value === 'English' ? 'Choose image' : 'Görsel seç'
    )

    const initials = computed(() => {
      if (!me.value) return ''
      const first = me.value.firstName?.charAt(0) ?? ''
      const last = me.value.lastName?.charAt(0) ?? ''
      return (first + last).toUpperCase()
    })

    const createdAtLabel = computed(() => {
      if (!me.value?.createdAt) return '-'
      const date = new Date(me.value.createdAt)
      return date.toLocaleDateString(selectedLanguage.value === 'English' ? 'en-GB' : 'tr-TR', {
        year: 'numeric',
        month: 'short',
        day: '2-digit',
      })
    })

    const deleteConfirmationPhrase = computed(() =>
      me.value?.email ? `I want to delete user ${me.value.email}` : ''
    )

    const isDeletePhraseMatch = computed(
      () =>
        deleteConfirmationPhrase.value.length > 0 &&
        deleteConfirmPhraseInput.value.trim() === deleteConfirmationPhrase.value
    )

    const dangerZoneTitle = computed(() =>
      selectedLanguage.value === 'English' ? 'Danger zone' : 'Tehlikeli bölge'
    )

    const dangerZoneDescription = computed(() =>
      selectedLanguage.value === 'English'
        ? 'Once you delete your account, there is no going back. Please be certain.'
        : 'Hesabınızı sildikten sonra geri alınamaz. Lütfen emin olun.'
    )

    const deleteAccountButtonLabel = computed(() =>
      selectedLanguage.value === 'English' ? 'Delete account' : 'Hesabı sil'
    )

    const deleteModalTitle = computed(() =>
      selectedLanguage.value === 'English' ? 'Delete account' : 'Hesabı sil'
    )

    const deleteModalInstruction = computed(() =>
      selectedLanguage.value === 'English'
        ? 'This action cannot be undone. Type the following to confirm:'
        : 'Bu işlem geri alınamaz. Onaylamak için aşağıdaki ifadeyi yazın:'
    )

    const deleteModalLabel = computed(() =>
      selectedLanguage.value === 'English' ? 'Type the phrase above' : 'Yukarıdaki ifadeyi yazın'
    )

    const confirmDeleteLabel = computed(() =>
      selectedLanguage.value === 'English' ? 'Delete my account' : 'Hesabımı sil'
    )

    const cancelLabel = computed(() =>
      selectedLanguage.value === 'English' ? 'Cancel' : 'İptal'
    )

    const deletingLabel = computed(() =>
      selectedLanguage.value === 'English' ? 'Deleting...' : 'Siliniyor...'
    )

    const openDeleteAccountModal = () => {
      deleteConfirmPhraseInput.value = ''
      deleteAccountError.value = null
      showDeleteAccountModal.value = true
    }

    const closeDeleteAccountModal = () => {
      showDeleteAccountModal.value = false
      deleteConfirmPhraseInput.value = ''
      deleteAccountError.value = null
    }

    const confirmDeleteAccount = async () => {
      if (!isDeletePhraseMatch.value || isDeletingAccount.value) return

      isDeletingAccount.value = true
      deleteAccountError.value = null

      try {
        await accountService.deleteMe()
        clearAuth()
        router.push('/')
      } catch (err: unknown) {
        // eslint-disable-next-line no-console
        console.error('deleteMe failed', err)
        deleteAccountError.value =
          selectedLanguage.value === 'English'
            ? 'Could not delete account. Please try again.'
            : 'Hesap silinemedi. Lütfen tekrar deneyin.'
      } finally {
        isDeletingAccount.value = false
      }
    }

    const loadMe = async () => {
      isInitialLoading.value = true
      initialError.value = null

      try {
        const data = await accountService.getMe()
        me.value = data
        profileForm.value.firstName = data.firstName
        profileForm.value.lastName = data.lastName
        profileForm.value.avatarUrl = data.avatarUrl || ''
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('Failed to load /Account/me', err)
        initialError.value =
          selectedLanguage.value === 'English'
            ? 'Could not load your profile.'
            : 'Profiliniz yüklenemedi.'
      } finally {
        isInitialLoading.value = false
      }
    }

    const validateProfile = () => {
      profileErrors.value = {}
      if (!profileForm.value.firstName.trim()) {
        profileErrors.value.firstName =
          selectedLanguage.value === 'English' ? 'First name is required.' : 'Ad zorunludur.'
      }
      if (!profileForm.value.lastName.trim()) {
        profileErrors.value.lastName =
          selectedLanguage.value === 'English' ? 'Last name is required.' : 'Soyad zorunludur.'
      }
      return Object.keys(profileErrors.value).length === 0
    }

    const onSaveProfile = async () => {
      if (!validateProfile()) return

      isSavingProfile.value = true
      profileError.value = null
      profileSuccess.value = false

      try {
        await accountService.updateProfile({
          firstName: profileForm.value.firstName.trim(),
          lastName: profileForm.value.lastName.trim(),
          avatarUrl: profileForm.value.avatarUrl,
        })

        profileSuccess.value = true
        await loadMe()
      } catch (err: unknown) {
        // eslint-disable-next-line no-console
        console.error('updateProfile failed', err)
        profileError.value =
          selectedLanguage.value === 'English'
            ? 'Could not update profile.'
            : 'Profil güncellenemedi.'
      } finally {
        isSavingProfile.value = false
      }
    }

    const onPickAvatar = () => {
      avatarInput.value?.click()
    }

    const onAvatarSelected = (event: Event) => {
      const target = event.target as HTMLInputElement
      const file = target.files?.[0]
      if (!file) return

      if (!file.type.startsWith('image/')) {
        avatarError.value =
          selectedLanguage.value === 'English'
            ? 'Please choose an image file.'
            : 'Lütfen bir görsel dosyası seçin.'
        return
      }

      const maxSizeMb = 5
      if (file.size > maxSizeMb * 1024 * 1024) {
        avatarError.value =
          selectedLanguage.value === 'English'
            ? `Image must be smaller than ${maxSizeMb} MB.`
            : `Görsel ${maxSizeMb} MB\'dan küçük olmalı.`
        return
      }

      avatarError.value = null
      avatarFile.value = file

      const previewUrl = URL.createObjectURL(file)
      profileForm.value.avatarUrl = previewUrl
    }

    const onUploadAvatar = async () => {
      if (!avatarFile.value) return

      isUploadingAvatar.value = true
      avatarError.value = null

      try {
        const url = await uploadAvatar(avatarFile.value)
        profileForm.value.avatarUrl = url
        avatarFile.value = null
      } catch (err: unknown) {
        // eslint-disable-next-line no-console
        console.error('Avatar upload failed', err)
        avatarError.value =
          selectedLanguage.value === 'English'
            ? 'Avatar upload failed. Please try again.'
            : 'Avatar yüklenemedi. Lütfen tekrar deneyin.'
      } finally {
        isUploadingAvatar.value = false
      }
    }

    const validatePassword = () => {
      passwordError.value = null

      if (!passwordForm.value.currentPassword || !passwordForm.value.newPassword) {
        passwordError.value =
          selectedLanguage.value === 'English'
            ? 'Current and new password are required.'
            : 'Mevcut ve yeni şifre zorunludur.'
        return false
      }

      if (passwordForm.value.newPassword.length < 8) {
        passwordError.value =
          selectedLanguage.value === 'English'
            ? 'New password must be at least 8 characters.'
            : 'Yeni şifre en az 8 karakter olmalı.'
        return false
      }

      if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
        passwordError.value =
          selectedLanguage.value === 'English'
            ? 'New passwords do not match.'
            : 'Yeni şifreler eşleşmiyor.'
        return false
      }

      return true
    }

    const onChangePassword = async () => {
      if (!validatePassword()) return

      isSavingPassword.value = true
      passwordSuccess.value = false

      try {
        await accountService.changePassword({
          currentPassword: passwordForm.value.currentPassword,
          newPassword: passwordForm.value.newPassword,
        })

        passwordSuccess.value = true
        passwordForm.value.currentPassword = ''
        passwordForm.value.newPassword = ''
        passwordForm.value.confirmPassword = ''
      } catch (err: unknown) {
        // eslint-disable-next-line no-console
        console.error('changePassword failed', err)
        passwordError.value =
          selectedLanguage.value === 'English'
            ? 'Could not update password.'
            : 'Şifre güncellenemedi.'
      } finally {
        isSavingPassword.value = false
      }
    }

    loadMe()

    return {
      selectedLanguage,
      loadingText,
      errorMessage,
      profileTitle,
      securityTitle,
      avatarButtonLabel,
      initials,
      createdAtLabel,

      me,
      profileForm,
      passwordForm,

      isInitialLoading,
      initialError,

      isSavingProfile,
      profileError,
      profileSuccess,
      profileErrors,

      isUploadingAvatar,
      avatarFile,
      avatarError,

      isSavingPassword,
      passwordError,
      passwordSuccess,

      showCurrentPassword,
      showNewPassword,
      showConfirmPassword,

      avatarInput,

      showDeleteAccountModal,
      deleteConfirmPhraseInput,
      isDeletingAccount,
      deleteAccountError,
      deleteConfirmationPhrase,
      isDeletePhraseMatch,
      dangerZoneTitle,
      dangerZoneDescription,
      deleteAccountButtonLabel,
      deleteModalTitle,
      deleteModalInstruction,
      deleteModalLabel,
      confirmDeleteLabel,
      cancelLabel,
      deletingLabel,

      loadMe,
      onSaveProfile,
      onPickAvatar,
      onAvatarSelected,
      onUploadAvatar,
      onChangePassword,
      openDeleteAccountModal,
      closeDeleteAccountModal,
      confirmDeleteAccount,
    }
  },
})
</script>

<style scoped lang="scss">
.settings-root {
  width: 100%;
  flex: 1;
  min-height: 0;
  padding: var(--spacing-md);
  box-sizing: border-box;
}

.settings-columns {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 2rem;
}

.settings-card {
  background-color: var(--background-color);
  border-radius: var(--border-radius);
  padding: 1.5rem 1.25rem;
  border: none;
  box-shadow: none;

  h2 {
    font-size: 1.1rem;
    font-weight: 600;
    margin-bottom: var(--spacing-sm);
    color: var(--header-text-color);
  }
}

.profile-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: var(--spacing-md);
}

.avatar-column {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.avatar-actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--spacing-xs, 0.5rem);
}

.avatar-wrapper {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  overflow: hidden;
  border: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--background-color-soft);

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.avatar-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 1.4rem;
  color: var(--primary-green-color);
}

.profile-column {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.two-column {
  display: flex;
  gap: var(--spacing-sm);
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  flex: 1;

  label {
    font-size: 0.8rem;
    color: var(--header-text-color);
  }

  input {
    border-radius: 6px;
    border: 1px solid var(--border-color);
    background-color: var(--background-color-soft);
    color: var(--header-text-color);
    padding: 0.5rem 0.6rem;
    font-size: 0.85rem;
    outline: none;

    &:focus {
      border-color: var(--primary-green-color);
    }

    &:disabled {
      opacity: 0.7;
      cursor: not-allowed;
    }

    &::placeholder {
      color: var(--header-text-color);
      opacity: 1;
    }
  }
}

.hidden-input {
  display: none;
}

.helper-text {
  font-size: 0.75rem;
  color: var(--header-text-color);
}

.helper-list {
  margin: 0;
  margin-top: 0.5rem;
  padding-left: 1.2rem;
  font-size: 0.75rem;
  color: var(--header-text-color);
}

.meta-row {
  display: flex;
  gap: 0.25rem;
  font-size: 0.75rem;
  color: var(--header-text-color);
}

.meta-label {
  font-weight: 500;
}

.meta-value {
  opacity: 0.9;
}

.actions-row {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  margin-top: var(--spacing-sm);
  flex-wrap: wrap;
}

.primary-btn {
  padding: 0.4rem 1.2rem;
  background-color: var(--primary-green-color);
  color: var(--text-color-reverse);
  border: none;
  border-radius: 999px;
  cursor: pointer;
  font-size: 0.8rem;
  font-weight: 500;

  &:disabled {
    opacity: 0.7;
    cursor: default;
  }
}

.primary-outline-btn {
  padding: 0.3rem 1rem;
  border-radius: 999px;
  border: 1px solid var(--primary-green-color);
  background: transparent;
  color: var(--primary-green-color);
  font-size: 0.75rem;
  cursor: pointer;

  &:disabled {
    opacity: 0.7;
    cursor: default;
  }
}

.secondary-btn {
  padding: 0.3rem 1rem;
  border-radius: 999px;
  border: 1px dashed var(--border-color);
  background: transparent;
  color: var(--header-text-color);
  font-size: 0.75rem;
  cursor: pointer;
}

.danger-zone {
  background-color: rgba(192, 57, 43, 0.06);
}

.danger-zone-description {
  font-size: 0.8rem;
  color: var(--header-text-color);
  margin: 0 0 var(--spacing-sm) 0;
}

.danger-btn {
  padding: 0.4rem 1.2rem;
  border-radius: 999px;
  border: 1px solid var(--primary-red-color, #c0392b);
  background: transparent;
  color: var(--primary-red-color, #c0392b);
  font-size: 0.8rem;
  font-weight: 500;
  cursor: pointer;
}

.danger-btn:hover:not(:disabled) {
  background-color: rgba(192, 57, 43, 0.1);
}

.danger-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-content.delete-modal {
  background-color: var(--background-color);
  border-radius: var(--border-radius);
  padding: var(--spacing-md);
  max-width: 28rem;
  width: 100%;
  border: 1px solid var(--border-color);
  box-shadow: var(--card-shadow);
}

.modal-content.delete-modal h3 {
  margin: 0 0 0.75rem 0;
  font-size: 1.1rem;
  color: var(--header-text-color);
}

.delete-modal-instruction {
  font-size: 0.85rem;
  color: var(--header-text-color);
  margin: 0 0 0.5rem 0;
}

.delete-modal-phrase {
  font-size: 0.9rem;
  margin: 0 0 1rem 0;
  padding: 0.75rem;
  background-color: var(--background-color-soft);
  border-radius: 6px;
  word-break: break-all;
  color: var(--header-text-color);
}

.delete-confirm-input {
  width: 100%;
  padding: 0.5rem 0.6rem;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  font-size: 0.85rem;
  margin-top: 0.25rem;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 1.25rem;
}

.error-text {
  font-size: 0.75rem;
  color: var(--primary-red-color);
}

.success-text {
  font-size: 0.75rem;
  color: var(--primary-green-color);
}

.password-layout {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

@media (max-width: 1024px) {
  .settings-root {
    padding: var(--spacing-sm);
  }

  .settings-card {
    padding: var(--spacing-sm);
  }

  .profile-layout {
    gap: var(--spacing-sm);
  }
}

@media (min-width: 960px) {
  .settings-columns {
    grid-template-columns: minmax(0, 1fr);
  }
}

@media (max-width: 768px) {
  .settings-columns {
    gap: var(--spacing-sm);
  }

  .avatar-column {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-xs, 0.5rem);
  }

  .avatar-wrapper {
    width: 64px;
    height: 64px;
  }

  .two-column {
    flex-direction: column;
  }
}
</style>
