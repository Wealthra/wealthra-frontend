<template>
  <div class="settings-c">
    <UIHorizontalNavbar v-if="isMobile" :initialLanguage="selectedLanguage" />
    <UILeftSideBar
      :initialLanguage="selectedLanguage"
      v-else
      :selectedPage="selectedLanguage === 'English' ? 'Settings' : 'Ayarlar'"
    />

    <div class="main-content">
      <UITopBar :selectedLanguage="selectedLanguage" @updateLanguage="handleLanguageUpdate" />

      <UILoading
        v-if="isLoading || error"
        :isLoading="isLoading"
        :hasError="error"
        :loadingText="loadingText"
        :errorMessage="errorMessage"
        :retryText="selectedLanguage == 'English' ? 'Retry' : 'Tekrar Dene'"
      />

      <template v-else>
        <div class="settings-title">
          {{ selectedLanguage == 'English' ? 'Settings' : 'Ayarlar' }}
        </div>
        <div class="settings-content">
          <div class="settings-card">
            <h2>{{ selectedLanguage == 'English' ? 'Profile Settings' : 'Profil Ayarları' }}</h2>
            <div class="profile-content">
              <div class="profile-photo">
                <img v-if="userPhoto" :src="userPhoto" alt="Profile Photo" />
                <div v-else class="profile-photo-icon">
                  <font-awesome-icon icon="user" />
                </div>
                <button @click="triggerPhotoUpload" class="change-photo-btn">
                  {{ selectedLanguage == 'English' ? 'Change Photo' : 'Fotoğraf Değiştir' }}
                </button>
                <input
                  type="file"
                  ref="photoInput"
                  style="display: none"
                  accept="image/*"
                  @change="handlePhotoChange"
                />
              </div>
              <div class="profile-fields">
                <div class="form-sections">
                  <div class="profile-section">
                    <div class="form-group">
                      <label>{{ selectedLanguage == 'English' ? 'First Name' : 'Ad' }}</label>
                      <UIFormSection
                        v-model="userFirstName"
                        :description="selectedLanguage == 'English' ? 'First Name' : 'Ad'"
                        icon="person"
                        fieldType="firstName"
                        @update-user-data="updateUserData"
                      />
                    </div>
                    <div class="form-group">
                      <label>{{ selectedLanguage == 'English' ? 'Last Name' : 'Soyad' }}</label>
                      <UIFormSection
                        v-model="userLastName"
                        :description="selectedLanguage == 'English' ? 'Last Name' : 'Soyad'"
                        icon="person"
                        fieldType="lastName"
                        @update-user-data="updateUserData"
                      />
                    </div>
                    <div class="form-group">
                      <label>Email</label>
                      <UIFormSection
                        v-model="userEmail"
                        description="Email"
                        icon="email"
                        fieldType="email"
                        @update-user-data="updateUserData"
                      />
                    </div>
                  </div>

                  <div class="password-section">
                    <div class="form-group">
                      <label>{{
                        selectedLanguage == 'English' ? 'Current Password' : 'Mevcut Şifre'
                      }}</label>
                      <UIFormSection
                        v-model="currentPassword"
                        :description="
                          selectedLanguage == 'English' ? 'Current Password' : 'Mevcut Şifre'
                        "
                        icon="password"
                        fieldType="currentPassword"
                        @update-user-data="updateUserData"
                      />
                    </div>

                    <div class="form-group">
                      <label>{{
                        selectedLanguage == 'English' ? 'New Password' : 'Yeni Şifre'
                      }}</label>
                      <UIFormSection
                        v-model="newPassword"
                        :description="selectedLanguage == 'English' ? 'New Password' : 'Yeni Şifre'"
                        icon="password"
                        fieldType="newPassword"
                        @update-user-data="updateUserData"
                      />
                    </div>

                    <div class="form-group">
                      <label>{{
                        selectedLanguage == 'English' ? 'Confirm New Password' : 'Yeni Şifre Tekrar'
                      }}</label>
                      <UIFormSection
                        v-model="confirmPassword"
                        :description="
                          selectedLanguage == 'English'
                            ? 'Confirm New Password'
                            : 'Yeni Şifre Tekrar'
                        "
                        icon="password"
                        fieldType="confirmPassword"
                        @update-user-data="updateUserData"
                      />
                    </div>
                  </div>
                </div>

                <div class="buttons-row">
                  <button class="save-btn" @click="saveProfile">
                    {{ selectedLanguage == 'English' ? 'Save Profile' : 'Profili Kaydet' }}
                  </button>
                  <button class="save-btn" @click="savePassword">
                    {{ selectedLanguage == 'English' ? 'Update Password' : 'Şifreyi Güncelle' }}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <button class="cancel-btn">
            {{ selectedLanguage == 'English' ? 'Cancel Changes' : 'Değişiklikleri İptal Et' }}
          </button>
        </div>
      </template>
    </div>
  </div>
</template>

<script lang="ts">
import UILeftSideBar from '../../../components/UILeftSideBar.vue'
import UITopBar from '../../../components/UITopBar.vue'
import UILoading from '../../../components/UILoading.vue'
import UIFormSection from '../../../shared/UIFormSection.vue'
import UIHorizontalNavbar from '@/components/UIHorizontalNavbar.vue'

import { getUserId } from '../../../utils/auth'
import { accountService } from '@/services/api/account/account.service'

export default {
  name: 'SettingsView',
  components: {
    UILeftSideBar,
    UITopBar,
    UILoading,
    UIFormSection,
    UIHorizontalNavbar,
  },
  data() {
    return {
      selectedLanguage: localStorage.getItem('selectedLanguage') || 'English',
      isLoading: false,
      error: false,
      hasError: false,
      isMobile: window.innerWidth <= 768,
      windowWidth: window.innerWidth,

      // User profile data
      userPhoto: null as string | null,
      userPhotoFile: null as File | null,
      userFirstName: '',
      userLastName: '',
      userEmail: '',

      // Security data
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',

      // Password visibility toggle
      visibleCurrentPassword: false,
      visibleNewPassword: false,
      visibleConfirmPassword: false,
    }
  },
  computed: {
    selectedPage() {
      return this.selectedLanguage == 'English' ? 'Settings' : 'Ayarlar'
    },
    loadingText() {
      return this.selectedLanguage == 'English'
        ? 'Loading your profile data...'
        : 'Profil verileriniz yükleniyor...'
    },
    errorMessage() {
      return this.selectedLanguage == 'English'
        ? 'Failed to load profile data. Please try again.'
        : 'Profil verileri yüklenemedi. Lütfen tekrar deneyin.'
    },
  },
  methods: {
    handleLanguageUpdate(language: string) {
      this.selectedLanguage = language
      localStorage.setItem('selectedLanguage', language)
    },

    handleResize() {
      this.windowWidth = window.innerWidth
      this.isMobile = this.windowWidth <= 768
    },

    triggerPhotoUpload() {
      ;(this.$refs.photoInput as HTMLInputElement).click()
    },
    handlePhotoChange(event: Event) {
      const file = (event.target as HTMLInputElement).files?.[0]
      if (file) {
        this.userPhotoFile = file

        const reader = new FileReader()
        reader.onload = e => {
          this.userPhoto = e.target?.result as string
        }
        reader.readAsDataURL(file)
      }
    },
    updateUserData(value: string, fieldType: string) {
      if (fieldType === 'firstName') {
        this.userFirstName = value
      } else if (fieldType === 'lastName') {
        this.userLastName = value
      } else if (fieldType === 'email') {
        this.userEmail = value
      } else if (fieldType === 'currentPassword') {
        this.currentPassword = value
      } else if (fieldType === 'newPassword') {
        this.newPassword = value
      } else if (fieldType === 'confirmPassword') {
        this.confirmPassword = value
      }
    },
    async saveProfile() {
      this.isLoading = true

      const userId = getUserId()

      if (!userId) {
        this.error = true
        this.isLoading = false
        return
      }

      // Update user data except photo
      try {
        await accountService.updateUser(userId, {
          firstName: this.userFirstName,
          lastName: this.userLastName,
          email: this.userEmail,
        })
      } catch (error) {
        console.error('Error updating user data:', error)
        this.error = true
      } finally {
        this.isLoading = false
      }

      // Update user photo if a new one is selected
      if (this.userPhotoFile != null) {
        try {
          await accountService.uploadProfileImage(userId, this.userPhotoFile)
        } catch (error) {
          console.error('Error uploading profile image:', error)
          this.error = true
        } finally {
          this.isLoading = false
        }
      }
    },
    async savePassword() {
      this.isLoading = true

      const userId = getUserId()

      if (!userId) {
        this.error = true
        this.isLoading = false
        return
      }

      try {
        await accountService.updatePassword(userId, {
          currentPassword: this.currentPassword,
          newPassword: this.newPassword,
          confirmPassword: this.confirmPassword,
        })
      } catch {
        this.error = true
      } finally {
        this.isLoading = false
      }
    },
    handleStorageChange(event: StorageEvent) {
      if (event.key === 'selectedLanguage' && event.newValue) {
        this.selectedLanguage = event.newValue
      }
    },
    async loadUserData() {
      const userId = getUserId()

      // Check if userId is available
      if (!userId) {
        this.error = true
        return
      }

      this.isLoading = true

      // Load user data
      try {
        const data = await accountService.getUserInfo(userId)
        this.userFirstName = data.firstName
        this.userLastName = data.lastName
        this.userEmail = data.email
      } catch (error) {
        console.error('Error loading user data:', error)
        this.error = true
      } finally {
        this.isLoading = false
      }

      // Load user photo if available
      try {
        const photoBlob = await accountService.getProfileImage(userId)
        this.userPhoto = URL.createObjectURL(photoBlob)
      } catch (error) {
        console.error('Error loading user photo:', error)
      }
    },
  },
  mounted() {
    // Listen for storage events to detect language changes from other components
    window.addEventListener('storage', this.handleStorageChange)

    // Listen for window resize events
    window.addEventListener('resize', this.handleResize)

    // Load user data when component mounts
    this.loadUserData()
  },
  beforeUnmount() {
    window.removeEventListener('storage', this.handleStorageChange)
    window.removeEventListener('resize', this.handleResize)
  },

  watch: {},
}
</script>

<style scoped lang="scss">
.settings-c {
  display: flex;
  flex-direction: row;
  width: 100%;
  height: 100vh;

  .main-content {
    display: flex;
    flex-direction: column;
    width: 100%;
    padding: 0.5rem;
    background-color: var(--background-color) s;

    .settings-title {
      font-size: 1.5rem;
      font-weight: bold;
      margin-left: 1.5rem;
      margin-bottom: 1rem;
      color: var(--header-text-color);
    }

    .settings-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      width: 100%;
      padding: 0 1.5rem;

      .settings-card {
        width: 100%;
        margin-bottom: 1rem;
        padding: 1rem 2rem;
        border-radius: var(--border-radius);
        border: 1px solid var(--border-color);
        background-color: var(--background-color);

        h2 {
          font-size: 1.2rem;
          font-weight: 600;
          margin-bottom: 0.75rem;
          color: var(--header-text-color);
        }

        .profile-content {
          display: flex;
          .profile-photo {
            display: flex;
            flex-direction: column;
            align-items: center;
            margin-right: 1.5rem;
            color: var(--header-text-color);
            gap: 0.5rem;

            img,
            .profile-photo-icon {
              width: 70px;
              height: 70px;
              border-radius: 50%;
              border: 1px solid var(--border-color);
            }

            img {
              object-fit: cover;
            }

            .profile-photo-icon {
              display: flex;
              align-items: center;
              justify-content: center;
              background-color: var(--background-color-soft);
              font-size: 2rem;
            }

            .change-photo-btn {
              margin-top: 0.3rem;
              padding: 0.5rem;
              font-size: 0.7rem;
              background: none;
              border: none;
              background-color: var(--background-color-soft);
              cursor: pointer;
              border-radius: 5px;
              color: var(--text-color);

              &:hover {
                background-color: var(--background-color-reverse);
                color: var(--reverse-header-text-color);
                transition: background-color 0.3s ease;
              }
            }
          }

          .profile-fields {
            flex: 1;

            .form-sections {
              display: flex;
              width: 100%;
              align-items: center;
              justify-content: space-between;

              .profile-section,
              .password-section {
                flex: 1;
              }

              .profile-section {
                border-right: 1px solid var(--border-color);
                padding-right: 1.5rem;
              }

              .password-section {
                padding-left: 1.5rem;
              }
            }

            .buttons-row {
              display: flex;
              justify-content: space-between;
              margin-top: 1rem;
            }
          }
        }
      }

      .form-group {
        margin-bottom: 0.75rem;

        label {
          display: block;
          margin-bottom: 0.2rem;
          font-size: 0.8rem;
          color: var(--header-text-color);
        }

        .password-field {
          position: relative;

          input {
            width: 100%;
            padding-right: 2rem;
          }

          .password-toggle {
            position: absolute;
            right: 0.4rem;
            top: 50%;
            transform: translateY(-50%);
            background: none;
            border: none;
            cursor: pointer;

            img {
              width: 16px;
              height: 16px;
              opacity: var(--opacity);
            }
          }
        }
      }

      .save-btn {
        padding: 0.4rem 1.2rem;
        background-color: var(--primary-green-color);
        color: var(--background-color);
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 0.8rem;
        color: var(--text-color-reverse);

        &:hover {
          background-color: var(--reverse-primary-green-color);
          transition: background-color 0.3s ease;
        }
      }

      .cancel-btn {
        padding: 0.4rem 1.2rem;
        background-color: var(--primary-red-color);
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 0.8rem;
        margin-top: 0.75rem;
        align-self: flex-end;
        &:hover {
          background-color: var(--reverse-primary-red-color);
          transition: background-color 0.3s ease;
        }
      }
    }
  }
}

@media (max-width: 768px) {
  .settings-c {
    flex-direction: column;
    .main-content {
      padding: 0.5rem;
      .settings-title {
        margin-left: 0;
      }
      .settings-content {
        padding: 0;
        .settings-card {
          padding: 1rem;
          h2 {
            font-size: 1.2rem;
          }
          .profile-content {
            flex-direction: column;
            align-items: center;
            gap: 1rem;
            .profile-photo {
              margin-right: 0;
            }
          }
        }
      }
    }
  }
}
</style>
