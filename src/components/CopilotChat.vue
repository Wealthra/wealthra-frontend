<template>
  <div class="copilot-root">
    <!-- Floating Action Button -->
    <button
      class="copilot-fab"
      :class="{ 'copilot-fab--hidden': isOpen }"
      @click="openChat"
      title="Owlaris Copilot"
    >
      <font-awesome-icon icon="comments" class="copilot-fab__icon" />
      <span class="copilot-fab__pulse"></span>
    </button>

    <!-- Chat Window -->
    <Transition name="copilot-slide">
      <div
        v-if="isOpen"
        class="copilot-window"
        :style="{ width: windowWidth + 'px', height: windowHeight + 'px' }"
      >
        <!-- Resize Handle (Top-Left) -->
        <div
          class="copilot-resize-handle"
          @mousedown="startResize"
          @touchstart.passive="startResize"
        ></div>

        <div class="copilot-window-inner">
          <!-- Header -->
          <div class="copilot-header" @click="closeChat">
            <div class="copilot-header__left">
              <div class="copilot-header__avatar">
                <font-awesome-icon icon="robot" />
              </div>
              <div class="copilot-header__info">
                <span class="copilot-header__title">Owlaris Copilot</span>
                <span class="copilot-header__status">{{ t.online }}</span>
              </div>
            </div>
            <button class="copilot-header__close">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </button>
          </div>

          <!-- Messages Area -->
          <div class="copilot-messages" ref="messagesContainerRef">
            <div
              v-for="msg in messages"
              :key="msg.id"
              class="copilot-msg"
              :class="{
                'copilot-msg--bot': msg.sender === 'bot',
                'copilot-msg--user': msg.sender === 'user',
              }"
            >
              <!-- Avatar -->
              <div class="copilot-msg__avatar">
                <img v-if="msg.sender === 'bot'" src="../icons/owl.png" alt="Bot" />
                <div v-else class="copilot-msg__avatar-user">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                </div>
              </div>

              <!-- Content -->
              <div class="copilot-msg__body">
                <span class="copilot-msg__sender">{{
                  msg.sender === 'bot' ? 'Owlaris' : t.you
                }}</span>

                <!-- Text Message -->
                <div
                  v-if="msg.type === 'text'"
                  class="copilot-bubble"
                  :class="msg.sender === 'bot' ? 'copilot-bubble--bot' : 'copilot-bubble--user'"
                  v-html="parseMarkdown(msg.content)"
                ></div>

                <!-- Audio Message -->
                <div v-else-if="msg.type === 'audio'" class="copilot-bubble copilot-bubble--audio">
                  <button class="copilot-audio__btn" @click="toggleAudioPlayback(msg)">
                    <svg
                      v-if="!msg.isPlaying"
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <polygon points="5 3 19 12 5 21 5 3"></polygon>
                    </svg>
                    <svg v-else width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                      <rect x="6" y="4" width="4" height="16"></rect>
                      <rect x="14" y="4" width="4" height="16"></rect>
                    </svg>
                  </button>
                  <div class="copilot-audio__track">
                    <div
                      class="copilot-audio__progress"
                      :style="{ width: (msg.audioProgress || 0) + '%' }"
                    ></div>
                  </div>
                  <span class="copilot-audio__time">{{
                    formatDuration(msg.audioDuration || 0)
                  }}</span>
                </div>

                <!-- Image Message -->
                <div
                  v-else-if="msg.type === 'image'"
                  class="copilot-bubble copilot-bubble--image"
                  @click="openImageViewer(msg.content)"
                >
                  <img :src="msg.content" alt="Uploaded" />
                </div>

                <!-- Interactive Items Message -->
                <div
                  v-else-if="msg.type === 'interactive'"
                  class="copilot-bubble copilot-bubble--bot copilot-bubble--interactive"
                >
                  <p class="copilot-interactive__text" v-html="parseMarkdown(msg.content)"></p>

                  <div class="copilot-items">
                    <div class="copilot-items__header">
                      <span class="copilot-items__count"
                        >{{ msg.itemData?.length || 0 }} {{ t.itemsExtracted }}</span
                      >
                    </div>

                    <div class="copilot-items__list">
                      <div
                        v-for="(item, idx) in msg.itemData"
                        :key="item.id ?? idx"
                        class="copilot-item"
                      >
                        <!-- View Mode -->
                        <template v-if="editingItemKey !== `${msg.id}-${idx}`">
                          <div class="copilot-item__info">
                            <p class="copilot-item__name">{{ item.description }}</p>
                            <div class="copilot-item__meta">
                              <span class="copilot-item__category">{{ item.categoryName }}</span>
                              <span class="copilot-item__amount">{{
                                formatExtractedItemAmount(item.amount, item.currency)
                              }}</span>
                            </div>
                          </div>
                          <div class="copilot-item__actions-view">
                            <button
                              class="copilot-item__edit-btn"
                              @click="startEditItem(msg.id, idx, item)"
                              :title="t.edit"
                              :disabled="editingItemKey !== null"
                            >
                              <svg
                                width="12"
                                height="12"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                stroke-width="2"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                              >
                                <path
                                  d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"
                                ></path>
                                <path
                                  d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"
                                ></path>
                              </svg>
                            </button>
                            <button
                              class="copilot-item__delete-btn"
                              @click="removeItem(msg.id, idx)"
                              :title="t.remove"
                              :disabled="editingItemKey !== null"
                            >
                              <svg
                                width="12"
                                height="12"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                stroke-width="2.5"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                              >
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                              </svg>
                            </button>
                          </div>
                        </template>

                        <!-- Edit Mode -->
                        <template v-else>
                          <div class="copilot-item__edit-form">
                            <input
                              v-model="editForm.description"
                              class="copilot-item__input"
                              :placeholder="t.description"
                            />
                            <UISelect
                              v-model="editForm.categoryId"
                              class="copilot-item__select"
                              :options="
                                categories.map(cat => ({ label: cat.categoryName, value: cat.id }))
                              "
                            />
                            <div class="copilot-item__price-wrap">
                              <UISelect
                                v-model="editForm.currency"
                                :options="currencyOptions"
                                compact
                                class="copilot-item__currency-select-ui"
                              />
                              <input
                                v-model.number="editForm.amount"
                                type="number"
                                step="0.01"
                                class="copilot-item__input copilot-item__input--price"
                                :placeholder="t.amount"
                              />
                            </div>
                            <div class="copilot-item__actions">
                              <button
                                class="copilot-item__save-btn"
                                @click="saveEditItem(msg.id, idx)"
                              >
                                {{ t.save }}
                              </button>
                              <button class="copilot-item__cancel-btn" @click="cancelEditItem">
                                {{ t.cancel }}
                              </button>
                            </div>
                          </div>
                        </template>
                      </div>
                    </div>

                    <!-- Actions Group -->
                    <div
                      v-if="
                        !msg.saved &&
                        msg.itemData &&
                        msg.itemData.length > 0 &&
                        msg.uiHints?.show_confirm_buttons !== false
                      "
                      class="copilot-items__actions-group"
                    >
                      <button
                        class="copilot-items__save-all"
                        :disabled="msg.saving || editingItemKey !== null"
                        @click="handleSaveAll(msg)"
                      >
                        <template v-if="msg.saving">
                          <span class="copilot-items__spinner"></span>
                          {{ t.saving }}
                        </template>
                        <template v-else>
                          <svg
                            width="12"
                            height="12"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="2"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                          >
                            <polyline points="20 6 9 17 4 12"></polyline>
                          </svg>
                          {{ t.confirm }}
                        </template>
                      </button>

                      <button
                        class="copilot-items__reject-btn"
                        :disabled="msg.saving || editingItemKey !== null"
                        @click="handleReject(msg)"
                      >
                        {{ t.cancel }}
                      </button>
                    </div>
                    <div v-else class="copilot-items__saved-badge">
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="3"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      >
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                      {{ t.saved }}
                    </div>
                  </div>
                </div>

                <!-- Timestamp -->
                <span class="copilot-msg__time">{{ formatTime(msg.timestamp) }}</span>
              </div>
            </div>

            <!-- Typing Indicator -->
            <div v-if="isTyping" class="copilot-msg copilot-msg--bot">
              <div class="copilot-msg__avatar">
                <img src="../icons/owl.png" alt="Bot" />
              </div>
              <div class="copilot-msg__body">
                <span class="copilot-msg__sender">Owlaris</span>
                <div class="copilot-typing">
                  <span class="copilot-typing__dot" style="animation-delay: 0ms"></span>
                  <span class="copilot-typing__dot" style="animation-delay: 150ms"></span>
                  <span class="copilot-typing__dot" style="animation-delay: 300ms"></span>
                </div>
              </div>
            </div>

            <div ref="messagesEndRef"></div>
          </div>

          <!-- Input Area (Redesigned) -->
          <div class="copilot-input-area">
            <!-- Recording State -->
            <div v-if="isRecording" class="copilot-recording-box">
              <div class="copilot-recording__indicator">
                <span class="copilot-recording__dot"></span>
                <span class="copilot-recording__time">{{ formatDuration(recordingTime) }}</span>
              </div>
              <button class="copilot-recording__stop" @click="stopRecording">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                  <rect x="4" y="4" width="16" height="16" rx="2"></rect>
                </svg>
              </button>
            </div>

            <!-- Default State: Pill-shaped Chat Input Wrapper -->
            <div
              v-else
              class="copilot-input-box"
              :class="{ 'copilot-input-box--disabled': editingItemKey !== null }"
            >
              <button
                class="copilot-icon-btn"
                @click="triggerImageUpload"
                :title="t.image"
                :disabled="isOcrLimitReached || editingItemKey !== null"
              >
                <font-awesome-icon
                  icon="image"
                  :class="{ 'icon-disabled': isOcrLimitReached || editingItemKey !== null }"
                />
              </button>

              <textarea
                ref="chatInputRef"
                v-model="chatMessage"
                class="copilot-chat-input"
                :placeholder="t.typeMessagePlaceholder"
                @keydown.enter.exact.prevent="sendTextMessage"
                rows="1"
                :disabled="editingItemKey !== null"
              ></textarea>

              <button
                v-if="chatMessage.trim().length > 0"
                class="copilot-send-btn"
                @click="sendTextMessage"
                :title="t.send"
              >
                <font-awesome-icon icon="paper-plane" />
              </button>
              <button
                v-else
                class="copilot-icon-btn copilot-icon-btn--mic"
                @click="startRecording"
                :title="t.voice"
                :disabled="isSttLimitReached || editingItemKey !== null"
              >
                <font-awesome-icon
                  icon="microphone"
                  :class="{ 'icon-disabled': isSttLimitReached || editingItemKey !== null }"
                />
              </button>
            </div>

            <input
              ref="fileInputRef"
              type="file"
              accept="image/*"
              class="copilot-hidden-input"
              @change="handleImageUpload"
            />
          </div>
        </div>
      </div>
    </Transition>

    <!-- Image Viewer Modal -->
    <Transition name="fade">
      <div v-if="viewedImage" class="copilot-viewer" @click="closeImageViewer">
        <div class="copilot-viewer__overlay"></div>
        <div class="copilot-viewer__content" @click.stop>
          <img :src="viewedImage" alt="Detailed view" />
          <button class="copilot-viewer__close" @click="closeImageViewer">
            <font-awesome-icon icon="xmark" />
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script lang="ts">
import {
  computed,
  defineComponent,
  nextTick,
  onBeforeUnmount,
  onMounted,
  onUnmounted,
  ref,
  watch,
} from 'vue'
import { marked } from 'marked'
import { copilotService } from '@/services/api/copilot/copilot.service'
import { categoryService } from '@/services/api/category/category.service'
import type {
  ExtractedExpenseItem,
  BulkExpenseRequest,
  CopilotChatResponse,
} from '@/services/api/copilot/copilot.models'
import type { Category, ApiCategory } from '@/services/api/category/category.models'
import UISelect from '@/components/UISelect.vue'

interface ChatMessage {
  id: string
  sender: 'bot' | 'user'
  type: 'text' | 'audio' | 'image' | 'interactive'
  content: string
  timestamp: Date
  // Audio fields
  audioBlob?: Blob
  audioDuration?: number
  audioProgress?: number
  isPlaying?: boolean
  audioUrl?: string
  // Interactive fields
  itemData?: ExtractedExpenseItem[]
  saving?: boolean
  saved?: boolean
  isChatConfirmation?: boolean // New: To distinguish between AI-waiting-for-confirm vs simple extraction result
  uiHints?: {
    show_confirm_buttons?: boolean
  }
}

import { useCurrency } from '@/composables/useCurrency'

const generateId = () => Math.random().toString(36).substr(2, 9)

export default defineComponent({
  name: 'CopilotChat',
  components: {
    UISelect,
  },
  props: {
    selectedLanguage: {
      type: String,
      default: 'English',
    },
    usageData: {
      type: Object as () => any | null,
      default: null,
    },
  },
  setup(props) {
    const { currency: preferredCurrency, currencySymbol, formatCurrency, isPrivacyMode } =
      useCurrency()

    const extractedAmountSymbols: Record<string, string> = {
      USD: '$',
      EUR: '€',
      TRY: '₺',
    }

    const formatExtractedItemAmount = (amount: number, currency?: string) => {
      const normalizedCurrency = (currency || preferredCurrency.value || 'USD').toUpperCase()
      const symbol = extractedAmountSymbols[normalizedCurrency] || `${normalizedCurrency} `

      if (isPrivacyMode.value) {
        return `${symbol}••••`
      }

      return `${symbol}${amount}`
    }

    const currencyOptions = [
      { label: '$', value: 'USD' },
      { label: '€', value: 'EUR' },
      { label: '₺', value: 'TRY' },
    ]

    // ── Resizing ──
    const windowWidth = ref(Number(localStorage.getItem('copilot-width')) || 380)
    const windowHeight = ref(Number(localStorage.getItem('copilot-height')) || 600)

    const checkBounds = () => {
      // Safety check to prevent window from being larger than viewport
      const maxW = window.innerWidth - 48
      const maxH = window.innerHeight - 48

      if (windowWidth.value > maxW) windowWidth.value = Math.max(450, maxW)
      if (windowHeight.value > maxH) windowHeight.value = Math.max(400, maxH)
    }

    onMounted(() => {
      window.addEventListener('resize', checkBounds)
      checkBounds()
    })

    onUnmounted(() => {
      window.removeEventListener('resize', checkBounds)
    })
    let isResizing = false
    let startX = 0
    let startY = 0
    let startW = 0
    let startH = 0

    const startResize = (e: MouseEvent | TouchEvent) => {
      isResizing = true
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY

      startX = clientX
      startY = clientY
      startW = windowWidth.value
      startH = windowHeight.value

      document.addEventListener('mousemove', doResize)
      document.addEventListener('mouseup', stopResize)
      document.addEventListener('touchmove', doResize, { passive: false })
      document.addEventListener('touchend', stopResize)

      document.body.style.cursor = 'nwse-resize'
      document.body.style.userSelect = 'none'
    }

    const doResize = (e: MouseEvent | TouchEvent) => {
      if (!isResizing) return
      if ('touches' in e) e.preventDefault()

      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY

      // Since window is bottom-right, dragging top-left increases size
      const deltaX = startX - clientX
      const deltaY = startY - clientY

      const newW = Math.max(320, Math.min(window.innerWidth - 48, startW + deltaX))
      const newH = Math.max(400, Math.min(window.innerHeight - 100, startH + deltaY))

      windowWidth.value = newW
      windowHeight.value = newH
    }

    const stopResize = () => {
      isResizing = false
      document.removeEventListener('mousemove', doResize)
      document.removeEventListener('mouseup', stopResize)
      document.removeEventListener('touchmove', doResize)
      document.removeEventListener('touchend', stopResize)

      document.body.style.cursor = ''
      document.body.style.userSelect = ''

      localStorage.setItem('copilot-width', windowWidth.value.toString())
      localStorage.setItem('copilot-height', windowHeight.value.toString())
    }

    const isOcrLimitReached = computed(() => {
      if (!props.usageData) return false
      return (
        props.usageData.monthlyOcrLimit !== null &&
        props.usageData.ocrRequestsThisMonth >= props.usageData.monthlyOcrLimit
      )
    })

    const isSttLimitReached = computed(() => {
      if (!props.usageData) return false
      return (
        props.usageData.monthlySttLimit !== null &&
        props.usageData.sttRequestsThisMonth >= props.usageData.monthlySttLimit
      )
    })
    // ── State ──
    const isOpen = ref(false)
    const messages = ref<ChatMessage[]>([])
    const isTyping = ref(false)
    const isRecording = ref(false)
    const recordingTime = ref(0)
    const categories = ref<ApiCategory[]>([])
    const viewedImage = ref<string | null>(null)
    const chatMessage = ref('')

    const parseMarkdown = (text: string) => {
      if (!text) return ''
      return marked.parse(text, {
        breaks: true,
        gfm: true,
      })
    }

    // Editing
    const editingItemKey = ref<string | null>(null)
    const editForm = ref({
      description: '',
      categoryId: 0,
      categoryName: '',
      amount: 0,
      currency: '',
    })

    // Refs
    const messagesEndRef = ref<HTMLElement | null>(null)
    const messagesContainerRef = ref<HTMLElement | null>(null)
    const fileInputRef = ref<HTMLInputElement | null>(null)
    const chatInputRef = ref<HTMLTextAreaElement | null>(null)

    // Audio recording
    let mediaRecorder: MediaRecorder | null = null
    let audioChunks: Blob[] = []
    let recordingTimer: ReturnType<typeof setInterval> | null = null

    // Audio playback
    let currentAudio: HTMLAudioElement | null = null
    let currentPlayingMsgId: string | null = null
    let playbackTimer: ReturnType<typeof setInterval> | null = null

    // ── i18n ──
    const t = computed(() => {
      const isTr = props.selectedLanguage === 'Turkish'
      return {
        online: isTr ? 'Çevrimiçi' : 'Online',
        welcome: isTr
          ? 'Merhaba! Ben Owlaris Copilot. Sesli mesaj göndererek veya fiş fotoğrafı yükleyerek harcamalarınızı çıkarabilirim.'
          : "Hi! I'm Owlaris Copilot. Send me a voice message or upload a receipt photo to extract your expenses.",
        you: isTr ? 'Sen' : 'You',
        voice: isTr ? 'Ses' : 'Voice',
        image: isTr ? 'Görsel' : 'Image',
        edit: isTr ? 'Düzenle' : 'Edit',
        save: isTr ? 'Kaydet' : 'Save',
        cancel: isTr ? 'İptal' : 'Cancel',
        saveAll: isTr ? 'Tümünü Kaydet' : 'Save All',
        confirm: isTr ? 'Onayla' : 'Confirm',
        saving: isTr ? 'Kaydediliyor...' : 'Saving...',
        saved: isTr ? 'Kaydedildi' : 'Saved',
        description: isTr ? 'Açıklama' : 'Description',
        amount: isTr ? 'Tutar' : 'Amount',
        typeMessagePlaceholder: isTr ? 'Mesaj yazın...' : 'Type a message...',
        send: isTr ? 'Gönder' : 'Send',
        itemsExtracted: isTr ? 'Öğe Çıkarıldı' : 'Items Extracted',
        extractedMsg: isTr
          ? 'Girdinizden birden fazla öğe çıkardım. Aşağıda inceleyip düzenleyebilirsiniz:'
          : 'I extracted multiple items from your input. You can review and edit them below:',
        savedSuccess: isTr
          ? 'Tüm harcamalar başarıyla kaydedildi! ✓'
          : 'All expenses saved successfully! ✓',
        errorExtract: isTr
          ? 'Üzgünüm, girdinizden öğe çıkaramadım. Lütfen tekrar deneyin.'
          : "Sorry, I couldn't extract items from your input. Please try again.",
        errorSave: isTr
          ? 'Harcamalar kaydedilirken bir hata oluştu. Lütfen tekrar deneyin.'
          : 'An error occurred while saving expenses. Please try again.',
        analyzingAudio: isTr
          ? 'Ses kaydınız analiz ediliyor...'
          : 'Analyzing your voice recording...',
        analyzingImage: isTr ? 'Görseliniz analiz ediliyor...' : 'Analyzing your image...',
        remove: isTr ? 'Sil' : 'Remove',
      }
    })

    // ── Lifecycle ──
    onMounted(() => {
      // Add welcome message
      addMessage({
        sender: 'bot',
        type: 'text',
        content: t.value.welcome,
      })

      // Load categories
      loadCategories()
    })

    onBeforeUnmount(() => {
      if (recordingTimer) clearInterval(recordingTimer)
      if (playbackTimer) clearInterval(playbackTimer)
      if (currentAudio) {
        currentAudio.pause()
        currentAudio = null
      }
      if (mediaRecorder && mediaRecorder.state !== 'inactive') {
        mediaRecorder.stop()
      }
    })

    const loadCategories = async () => {
      try {
        categories.value = await categoryService.getCategories()
      } catch {
        // Fallback: categories will be empty, user can still see items
      }
    }

    // ── Helpers ──
    const scrollToBottom = () => {
      nextTick(() => {
        messagesEndRef.value?.scrollIntoView({ behavior: 'smooth' })
      })
    }

    watch(
      () => messages.value.length,
      () => scrollToBottom()
    )
    watch(isTyping, () => scrollToBottom())

    const addMessage = (params: Partial<ChatMessage>) => {
      const msg: ChatMessage = {
        id: generateId(),
        sender: 'bot',
        type: 'text',
        content: '',
        timestamp: new Date(),
        ...params,
      }
      messages.value.push(msg)
      return msg
    }

    const formatTime = (date: Date) =>
      date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })

    const formatDuration = (seconds: number) => {
      const m = Math.floor(seconds / 60)
        .toString()
        .padStart(2, '0')
      const s = (seconds % 60).toString().padStart(2, '0')
      return `${m}:${s}`
    }

    // ── Chat open / close ──
    const openChat = () => {
      isOpen.value = true
    }
    const closeChat = () => {
      isOpen.value = false
    }

    // ── Image Viewer ──
    const openImageViewer = (src: string) => {
      viewedImage.value = src
    }
    const closeImageViewer = () => {
      viewedImage.value = null
    }

    // ── Voice Recording ──
    const startRecording = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        mediaRecorder = new MediaRecorder(stream)
        audioChunks = []

        mediaRecorder.ondataavailable = e => {
          if (e.data.size > 0) audioChunks.push(e.data)
        }

        mediaRecorder.onstop = () => {
          const audioBlob = new Blob(audioChunks, { type: mediaRecorder?.mimeType || 'audio/webm' })
          const audioUrl = URL.createObjectURL(audioBlob)
          const duration = recordingTime.value

          // Add user audio message
          addMessage({
            sender: 'user',
            type: 'audio',
            content: audioUrl,
            audioBlob,
            audioDuration: duration,
            audioProgress: 0,
            isPlaying: false,
            audioUrl,
          })

          // Send to API
          processAudio(audioBlob)

          // Stop all tracks
          stream.getTracks().forEach(t => t.stop())
        }

        mediaRecorder.start()
        isRecording.value = true
        recordingTime.value = 0
        recordingTimer = setInterval(() => {
          recordingTime.value++
        }, 1000)
      } catch {
        // Microphone access denied or not available
        addMessage({
          sender: 'bot',
          type: 'text',
          content:
            props.selectedLanguage === 'Turkish'
              ? 'Mikrofon erişimi reddedildi. Lütfen tarayıcı ayarlarınızdan mikrofon iznini etkinleştirin.'
              : 'Microphone access denied. Please enable microphone permission in your browser settings.',
        })
      }
    }

    const stopRecording = () => {
      if (mediaRecorder && mediaRecorder.state !== 'inactive') {
        mediaRecorder.stop()
      }
      isRecording.value = false
      if (recordingTimer) {
        clearInterval(recordingTimer)
        recordingTimer = null
      }
    }

    const processAudio = async (audioBlob: Blob) => {
      isTyping.value = true

      // Add analysis message
      addMessage({
        sender: 'bot',
        type: 'text',
        content: t.value.analyzingAudio,
      })

      try {
        const ext = audioBlob.type.includes('webm')
          ? 'webm'
          : audioBlob.type.includes('ogg')
            ? 'ogg'
            : 'wav'
        const file = new File([audioBlob], `recording.${ext}`, { type: audioBlob.type })
        const items = await copilotService.extractFromAudio(file)
        isTyping.value = false

        if (items && items.length > 0) {
          // Remove analysis message
          removeLastBotTextMessage()
          addMessage({
            sender: 'bot',
            type: 'interactive',
            content: t.value.extractedMsg,
            itemData: items,
            isChatConfirmation: false,
          })
        } else {
          removeLastBotTextMessage()
          addMessage({ sender: 'bot', type: 'text', content: t.value.errorExtract })
        }
      } catch {
        isTyping.value = false
        removeLastBotTextMessage()
        addMessage({ sender: 'bot', type: 'text', content: t.value.errorExtract })
      } finally {
        window.dispatchEvent(new CustomEvent('app:refetch-usage'))
      }
    }

    // ── Image Upload ──
    const triggerImageUpload = () => {
      fileInputRef.value?.click()
    }

    const handleImageUpload = (e: Event) => {
      const target = e.target as HTMLInputElement
      const file = target.files?.[0]
      if (!file) return

      const imageUrl = URL.createObjectURL(file)

      addMessage({
        sender: 'user',
        type: 'image',
        content: imageUrl,
      })

      target.value = ''
      processImage(file)
    }

    const processImage = async (file: File) => {
      isTyping.value = true

      addMessage({
        sender: 'bot',
        type: 'text',
        content: t.value.analyzingImage,
      })

      try {
        const items = await copilotService.extractFromImage(file)
        isTyping.value = false

        if (items && items.length > 0) {
          removeLastBotTextMessage()
          addMessage({
            sender: 'bot',
            type: 'interactive',
            content: t.value.extractedMsg,
            itemData: items,
            isChatConfirmation: false,
          })
        } else {
          removeLastBotTextMessage()
          addMessage({ sender: 'bot', type: 'text', content: t.value.errorExtract })
        }
      } catch {
        isTyping.value = false
        removeLastBotTextMessage()
        addMessage({ sender: 'bot', type: 'text', content: t.value.errorExtract })
      } finally {
        window.dispatchEvent(new CustomEvent('app:refetch-usage'))
      }
    }

    const removeLastBotTextMessage = () => {
      for (let i = messages.value.length - 1; i >= 0; i--) {
        if (messages.value[i].sender === 'bot' && messages.value[i].type === 'text') {
          messages.value.splice(i, 1)
          break
        }
      }
    }

    // ── Text Messaging ──
    const sendTextMessage = async () => {
      const msgText = chatMessage.value.trim()
      if (!msgText || isTyping.value) return

      chatMessage.value = ''

      // Auto-resize reset
      if (chatInputRef.value) {
        chatInputRef.value.style.height = 'auto'
      }

      addMessage({
        sender: 'user',
        type: 'text',
        content: msgText,
      })

      isTyping.value = true

      try {
        const result = await copilotService.chat({ message: msgText })

        if (result && typeof result === 'object') {
          const res = result as CopilotChatResponse
          const resType = (res.type || '').toLowerCase()
          const itemsSource = res.payload?.batch?.items || res.payload?.items

          if (
            (resType === 'confirmation' || resType === 'interactive') &&
            Array.isArray(itemsSource)
          ) {
            const sanitize = (val: any) =>
              val === 'null' || val === 'None' || val === null || val === undefined
                ? ''
                : String(val).trim()

            const mappedItems: ExtractedExpenseItem[] = itemsSource.map((item: any) => {
              const rawCatId = sanitize(item.category_id || item.categoryId)
              const rawCatName = sanitize(item.category_name || item.categoryName)

              let catId = Number(rawCatId) || 0
              if (!catId && rawCatName) {
                const targetName = rawCatName.toLowerCase()
                const found = categories.value.find(
                  c => (c.categoryName || '').toLowerCase() === targetName
                )
                if (found) catId = found.id
              }

              // Safer amount parsing
              const rawAmount = item.amount !== undefined && item.amount !== null ? item.amount : 0
              const amountValue =
                typeof rawAmount === 'string' ? parseFloat(rawAmount) : Number(rawAmount)

              return {
                id: Math.floor(Math.random() * 1000000),
                description: sanitize(item.description) || 'Expense',
                amount: isNaN(amountValue) ? 0 : amountValue,
                currency: (
                  sanitize(item.currency) ||
                  preferredCurrency.value ||
                  'TRY'
                ).toUpperCase(),
                paymentMethod: sanitize(item.payment_method || item.paymentMethod) || 'Other',
                isRecurring: !!(item.is_recurring || item.isRecurring),
                transactionDate:
                  sanitize(item.date || item.transactionDate) || new Date().toISOString(),
                categoryId: catId || 0,
                categoryName: rawCatName || 'Uncategorized',
              }
            })

            addMessage({
              sender: 'bot',
              type: 'interactive',
              content: res.message || res.response || t.value.extractedMsg,
              itemData: mappedItems,
              uiHints: res.ui_hints,
              isChatConfirmation: true, // This is a specific AI confirmation state
            })
          } else {
            const replyText = res.message || res.response || String(result)
            addMessage({ sender: 'bot', type: 'text', content: replyText })
          }
        } else if (result) {
          addMessage({ sender: 'bot', type: 'text', content: String(result) })
        }
      } catch (err) {
        console.error('Copilot chat error:', err)
        const errorMsg = (t.value as any).errorChat || t.value.errorExtract
        addMessage({ sender: 'bot', type: 'text', content: errorMsg })
      } finally {
        isTyping.value = false
      }
    }

    watch(chatMessage, () => {
      nextTick(() => {
        if (chatInputRef.value) {
          chatInputRef.value.style.height = 'auto'
          chatInputRef.value.style.height = `${Math.min(chatInputRef.value.scrollHeight, 120)}px`
        }
      })
    })

    // ── Audio Playback ──
    const toggleAudioPlayback = (msg: ChatMessage) => {
      if (!msg.audioUrl) return

      // If already playing this message, pause
      if (currentPlayingMsgId === msg.id && currentAudio && !currentAudio.paused) {
        currentAudio.pause()
        msg.isPlaying = false
        if (playbackTimer) clearInterval(playbackTimer)
        return
      }

      // Stop any current playback
      if (currentAudio) {
        currentAudio.pause()
        if (currentPlayingMsgId) {
          const prevMsg = messages.value.find(m => m.id === currentPlayingMsgId)
          if (prevMsg) prevMsg.isPlaying = false
        }
        if (playbackTimer) clearInterval(playbackTimer)
      }

      currentAudio = new Audio(msg.audioUrl)
      currentPlayingMsgId = msg.id
      msg.isPlaying = true
      msg.audioProgress = 0

      currentAudio.play()

      playbackTimer = setInterval(() => {
        if (currentAudio && !currentAudio.paused) {
          const dur = currentAudio.duration || msg.audioDuration || 1
          msg.audioProgress = Math.min((currentAudio.currentTime / dur) * 100, 100)
        }
      }, 100)

      currentAudio.onended = () => {
        msg.isPlaying = false
        msg.audioProgress = 0
        currentPlayingMsgId = null
        if (playbackTimer) clearInterval(playbackTimer)
      }
    }

    // ── Item Editing ──
    const startEditItem = (msgId: string, idx: number, item: ExtractedExpenseItem) => {
      editingItemKey.value = `${msgId}-${idx}`
      editForm.value = {
        description: item.description,
        categoryId: item.categoryId,
        categoryName: item.categoryName,
        amount: item.amount,
        currency: item.currency,
      }
    }

    const saveEditItem = (msgId: string, idx: number) => {
      const msg = messages.value.find(m => m.id === msgId)
      if (msg?.itemData && msg.itemData[idx]) {
        msg.itemData[idx].description = editForm.value.description
        msg.itemData[idx].amount = editForm.value.amount
        msg.itemData[idx].currency = editForm.value.currency
        msg.itemData[idx].categoryId = editForm.value.categoryId
        // Update category name from the categories list
        const cat = categories.value.find(c => c.id === editForm.value.categoryId)
        if (cat) msg.itemData[idx].categoryName = cat.categoryName
      }
      editingItemKey.value = null
    }

    const cancelEditItem = () => {
      editingItemKey.value = null
    }

    const removeItem = (msgId: string, idx: number) => {
      const msg = messages.value.find(m => m.id === msgId)
      if (msg?.itemData) {
        msg.itemData.splice(idx, 1)
        // If no items left, we could potentially remove the whole interactive message or show a state
        if (msg.itemData.length === 0) {
          msg.content =
            props.selectedLanguage === 'Turkish'
              ? 'Tüm öğeler kaldırıldı.'
              : 'All items have been removed.'
        }
      }
    }

    const handleReject = async (msg: ChatMessage) => {
      msg.saving = true
      try {
        if (msg.isChatConfirmation) {
          await copilotService.chat({
            message: props.selectedLanguage === 'Turkish' ? 'Hayır' : 'No',
          })
        }

        msg.saving = false
        msg.itemData = []
        msg.type = 'text'
        msg.content =
          props.selectedLanguage === 'Turkish'
            ? 'İşlem iptal edildi.'
            : 'Operation has been cancelled.'
      } catch {
        msg.saving = false
        msg.itemData = []
        msg.type = 'text'
        msg.content =
          props.selectedLanguage === 'Turkish'
            ? 'İşlem iptal edildi.'
            : 'Operation has been cancelled.'
      }
    }

    // ── Save All ──
    const handleSaveAll = async (msg: ChatMessage) => {
      if (!msg.itemData || msg.itemData.length === 0) return
      msg.saving = true

      try {
        const payload = msg.itemData.map(item => ({
          description: item.description,
          amount: item.amount,
          currency: item.currency,
          payment_method: item.paymentMethod || 'Other',
          is_recurring: item.isRecurring || false,
          category_id: item.categoryId,
          category_name: item.categoryName,
          date: item.transactionDate || new Date().toISOString(),
        }))

        if (msg.isChatConfirmation) {
          // AI Confirmation Path: Notify AI with final data
          const response = await copilotService.chat({
            message: props.selectedLanguage === 'Turkish' ? 'Evet' : 'Yes',
            updated_batch: payload,
          })

          addMessage({
            sender: 'bot',
            type: 'text',
            content: response.message || response.response || t.value.savedSuccess,
          })
        } else {
          // Direct Save Path (OCR/STT): Call .NET API directly
          const bulkRequest: BulkExpenseRequest[] = msg.itemData.map(item => ({
            description: item.description,
            amount: item.amount,
            currency: item.currency,
            paymentMethod: item.paymentMethod || 'Other',
            isRecurring: item.isRecurring || false,
            categoryId: item.categoryId,
            transactionDate: item.transactionDate || new Date().toISOString(),
          }))

          await copilotService.bulkCreateExpenses(bulkRequest)

          addMessage({
            sender: 'bot',
            type: 'text',
            content: t.value.savedSuccess,
          })
        }

        msg.saving = false
        msg.saved = true
      } catch {
        msg.saving = false
        addMessage({
          sender: 'bot',
          type: 'text',
          content: t.value.errorSave,
        })
      }
    }

    return {
      // State
      isOpen,
      messages,
      isTyping,
      isRecording,
      recordingTime,
      categories,
      editingItemKey,
      editForm,
      currencyOptions,
      // Refs
      messagesEndRef,
      messagesContainerRef,
      fileInputRef,
      // Computed
      t,
      // Methods
      openChat,
      closeChat,
      startRecording,
      stopRecording,
      triggerImageUpload,
      handleImageUpload,
      toggleAudioPlayback,
      startEditItem,
      saveEditItem,
      cancelEditItem,
      removeItem,
      handleSaveAll,
      handleReject,
      formatTime,
      formatDuration,
      openImageViewer,
      closeImageViewer,
      viewedImage,
      chatMessage,
      chatInputRef,
      sendTextMessage,
      parseMarkdown,
      formatCurrency,
      formatExtractedItemAmount,
      currencySymbol,
      isOcrLimitReached,
      isSttLimitReached,
      // Resize
      windowWidth,
      windowHeight,
      startResize,
    }
  },
})
</script>

<style scoped lang="scss">
/* ============================
   Root & Positioning
   ============================ */
.copilot-root {
  position: fixed;
  bottom: 80px;
  right: 24px;
  z-index: 100;
  font-family: var(--main-font);
}

/* ============================
   Floating Action Button
   ============================ */
.copilot-fab {
  position: relative;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  border: none;
  cursor: pointer;
  background: var(--primary-green-color);
  box-shadow: 0 6px 24px rgba(92, 184, 92, 0.35);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
  overflow: hidden;

  &:hover {
    transform: scale(1.08);
    box-shadow: 0 8px 32px rgba(92, 184, 92, 0.45);
  }

  &.copilot-fab--hidden {
    transform: scale(0);
    opacity: 0;
    pointer-events: none;
  }

  .copilot-fab__icon {
    font-size: 24px;
    color: #fff;
    z-index: 1;
  }

  .copilot-fab__pulse {
    position: absolute;
    width: 100%;
    height: 100%;
    border-radius: 50%;
    background: var(--primary-green-color);
    animation: copilot-pulse 2s ease-in-out infinite;
    z-index: 0;
  }
}

@keyframes copilot-pulse {
  0%,
  100% {
    transform: scale(1);
    opacity: 0.4;
  }
  50% {
    transform: scale(1.3);
    opacity: 0;
  }
}

/* ============================
   Chat Window
   ============================ */
.copilot-window {
  position: fixed;
  bottom: 24px;
  right: 24px;
  background: transparent; /* Background moved to inner */
  display: flex;
  flex-direction: column;
  overflow: visible;
  z-index: var(--z-copilot, 1000);
}

.copilot-window-inner {
  width: 100%;
  height: 100%;
  background: var(--background-color);
  border-radius: 24px;
  box-shadow: 0 12px 48px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  overflow: hidden; /* Restores the rounded corners */
  border: 1px solid var(--border-color);
  backdrop-filter: blur(20px);
}

.copilot-resize-handle {
  position: absolute;
  top: -8px;
  left: -8px;
  width: 32px;
  height: 32px;
  cursor: nwse-resize;
  z-index: 1001;
  display: flex;
  align-items: center;
  justify-content: center;

  &::after {
    content: '';
    width: 12px;
    height: 12px;
    border-top: 3px solid var(--primary-green-color);
    border-left: 3px solid var(--primary-green-color);
    border-top-left-radius: 4px;
    opacity: 0;
    transition: all 0.2s;
  }

  &:hover::after {
    opacity: 0.6;
    transform: scale(1.1);
  }
}

/* Slide transition */
.copilot-slide-enter-active {
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}
.copilot-slide-leave-active {
  transition: all 0.25s ease-in;
}
.copilot-slide-enter-from,
.copilot-slide-leave-to {
  opacity: 0;
  transform: translateY(20px) scale(0.95);
}

/* ============================
   Header
   ============================ */
.copilot-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: var(--primary-green-color);
  cursor: pointer;
  flex-shrink: 0;
  border-top-left-radius: 24px;
  border-top-right-radius: 24px;

  .copilot-header__left {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .copilot-header__avatar {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    overflow: hidden;
    background: rgba(255, 255, 255, 0.2);
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    font-size: 14px;
  }

  .copilot-header__info {
    display: flex;
    flex-direction: column;
  }

  .copilot-header__title {
    font-weight: 600;
    font-size: 14px;
    color: #fff;
    line-height: 1.2;
  }

  .copilot-header__status {
    font-size: 10px;
    color: rgba(255, 255, 255, 0.8);
    line-height: 1.3;
  }

  .copilot-header__close {
    background: none;
    border: none;
    color: #fff;
    cursor: pointer;
    padding: 4px;
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background 0.2s;

    &:hover {
      background: rgba(255, 255, 255, 0.15);
    }
  }
}

/* ============================
   Messages Area
   ============================ */
.copilot-messages {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  background: var(--background-color);
}

.copilot-msg {
  display: flex;
  gap: 8px;

  &.copilot-msg--user {
    flex-direction: row-reverse;

    .copilot-msg__body {
      align-items: flex-end;
    }
  }
}

.copilot-msg__avatar {
  flex-shrink: 0;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  overflow: hidden;
  margin-top: 2px;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .copilot-msg__avatar-user {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    background: var(--primary-blue-color);
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
  }
}

.copilot-msg__body {
  display: flex;
  flex-direction: column;
  max-width: 82%;
}

.copilot-msg__sender {
  font-size: 10px;
  font-weight: 600;
  color: var(--normal-text-color);
  margin-bottom: 3px;
}

.copilot-msg__time {
  font-size: 9px;
  color: var(--normal-text-color);
  margin-top: 4px;
  padding: 0 2px;
  font-weight: 500;
}

/* ============================
   Bubbles
   ============================ */
.copilot-bubble {
  padding: 10px 14px;
  font-size: 13px;
  line-height: 1.5;
  border-radius: 14px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  word-break: break-word;

  & p {
    margin: 0 0 0.5rem 0;
    &:last-child {
      margin-bottom: 0;
    }
  }

  ul,
  ol {
    margin: 0.5rem 0;
    padding-left: 1.25rem;
    li {
      margin-bottom: 0.25rem;
      &:last-child {
        margin-bottom: 0;
      }
    }
  }

  code {
    background: rgba(0, 0, 0, 0.05);
    padding: 0.2rem 0.4rem;
    border-radius: 4px;
    font-family: 'Fira Code', monospace;
    font-size: 0.85em;
  }

  pre {
    background: rgba(0, 0, 0, 0.05);
    padding: 0.75rem;
    border-radius: 8px;
    overflow-x: auto;
    margin: 0.5rem 0;
    code {
      background: none;
      padding: 0;
    }
  }

  strong {
    font-weight: 700;
  }
  em {
    font-style: italic;
  }

  a {
    color: var(--primary-green-color);
    text-decoration: underline;
    &:hover {
      filter: brightness(1.1);
    }
  }

  &--bot {
    background: var(--background-color-soft);
    color: var(--header-text-color);
    border-top-left-radius: 4px;
    border: 1px solid var(--border-color);

    code,
    pre {
      background: rgba(0, 0, 0, 0.03);
    }
  }

  &--user {
    background: var(--primary-green-color);
    color: #fff;
    border-top-right-radius: 4px;
    box-shadow: 0 4px 12px rgba(34, 197, 94, 0.2);

    code,
    pre {
      background: rgba(255, 255, 255, 0.15);
      color: #fff;
    }
    a {
      color: #fff;
    }
  }

  &.copilot-bubble--audio {
    display: flex;
    align-items: center;
    gap: 8px;
    background: var(--primary-green-color);
    color: #fff;
    border-top-right-radius: 4px;
    min-width: 160px;
    padding: 8px 12px;
  }

  &.copilot-bubble--image {
    padding: 4px;
    background: var(--primary-green-color);
    border-top-right-radius: 4px;
    cursor: pointer;
    transition: transform 0.2s ease;

    &:hover {
      transform: scale(1.02);
      filter: brightness(1.05);
    }

    img {
      max-width: 100%;
      max-height: 160px;
      border-radius: 10px;
      object-fit: cover;
      display: block;
    }
  }

  &.copilot-bubble--interactive {
    padding: 12px;
    max-width: none;
    width: 100%;
  }
}

/* ============================
   Audio Player (in bubble)
   ============================ */
.copilot-audio__btn {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  border: none;
  background: rgba(255, 255, 255, 0.2);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  flex-shrink: 0;
  transition: background 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.3);
  }
}

.copilot-audio__track {
  flex: 1;
  height: 4px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 999px;
  overflow: hidden;
}

.copilot-audio__progress {
  height: 100%;
  background: #fff;
  transition: width 0.1s linear;
  border-radius: 999px;
}

.copilot-audio__time {
  font-size: 10px;
  font-weight: 600;
  white-space: nowrap;
}

/* ============================
   Typing Indicator
   ============================ */
.copilot-typing {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 10px 14px;
  background: var(--background-color-soft);
  border-radius: 14px;
  border-top-left-radius: 4px;
  height: 36px;
}

.copilot-typing__dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--normal-text-color);
  animation: copilot-bounce 1.2s ease-in-out infinite;
}

@keyframes copilot-bounce {
  0%,
  60%,
  100% {
    transform: translateY(0);
  }
  30% {
    transform: translateY(-5px);
  }
}

/* ============================
   Interactive Items
   ============================ */
.copilot-interactive__text {
  margin: 0 0 10px 0;
  font-size: 13px;
  line-height: 1.4;
}

.copilot-items {
  background: var(--background-color);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  overflow: hidden;
}

.copilot-items__header {
  padding: 8px 12px;
  background: var(--background-color-soft);
  border-bottom: 1px solid var(--border-color);
}

.copilot-items__count {
  font-size: 10px;
  font-weight: 700;
  color: var(--primary-green-color);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.copilot-items__list {
  overflow-y: auto;
}

.copilot-item {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 10px 12px;
  gap: 8px;
  border-bottom: 1px solid var(--border-color);
  transition: background 0.15s;

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background: var(--background-color-soft);
  }
}

.copilot-item__info {
  flex: 1;
  min-width: 0;
}

.copilot-item__name {
  font-size: 12px;
  font-weight: 600;
  color: var(--header-text-color);
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.copilot-item__meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 2px;
}

.copilot-item__category {
  font-size: 10px;
  color: var(--normal-text-color);
}

.copilot-item__amount {
  font-size: 12px;
  font-weight: 700;
  color: var(--header-text-color);
  flex-shrink: 0;
}

.copilot-item__actions-view {
  display: flex;
  gap: 4px;
  flex-shrink: 0;
}

.copilot-item__edit-btn,
.copilot-item__delete-btn {
  flex-shrink: 0;
  background: var(--background-color-soft);
  border: none;
  border-radius: 6px;
  padding: 6px;
  cursor: pointer;
  color: var(--normal-text-color);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s;

  &:hover {
    background: var(--hover-color);
  }
}

.copilot-item__edit-btn:hover {
  color: var(--primary-green-color);
}

.copilot-item__delete-btn:hover {
  color: #ef4444;
}

/* Edit Form */
.copilot-item__edit-form {
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
  padding: 4px 0;
  animation: slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.copilot-item__input {
  width: 100%;
  height: 42px; /* Explicit height for all inputs */
  padding: 0 12px;
  border: 1px solid var(--border-color);
  border-radius: 12px;
  font-size: 13px;
  background: var(--background-color-soft);
  color: var(--header-text-color);
  font-family: var(--main-font);
  outline: none;
  box-sizing: border-box;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);

  &:focus {
    border-color: var(--primary-green-color);
    background: var(--background-color);
    box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.1);
  }

  &.copilot-item__input--price {
    font-weight: 700;
  }
}

.copilot-item__select {
  flex: 1;
  min-width: 0;

  /* UISelect handles its own border and padding internally */
  :deep(.select-trigger) {
    background: var(--background-color-soft);
    height: 42px; /* Matching the height of other inputs */

    &:focus {
      background: var(--background-color);
    }
  }
}

/* Removed .copilot-item__row as we are stacking items now */

.copilot-item__actions {
  display: flex;
  gap: 6px;
  margin-top: 4px;
}

.copilot-item__save-btn,
.copilot-item__cancel-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px 0;
  border: none;
  border-radius: 12px;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  font-family: var(--main-font);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  &:hover {
    transform: translateY(-2px);
  }

  &:active {
    transform: translateY(0);
  }
}

.copilot-item__save-btn {
  background: var(--primary-green-color);
  color: #fff;
  box-shadow: 0 4px 12px rgba(34, 197, 94, 0.2);

  &:hover {
    box-shadow: 0 6px 16px rgba(34, 197, 94, 0.3);
    filter: brightness(1.05);
  }
}

.copilot-item__cancel-btn {
  background: var(--background-color-soft);
  color: var(--normal-text-color);
  border: 1px solid var(--border-color);

  &:hover {
    background: var(--border-color);
    color: var(--header-text-color);
  }
}

.copilot-items__actions-group {
  display: flex;
  border-top: 1px solid var(--border-color);
}

/* Save All / Confirm Button */
.copilot-items__save-all {
  flex: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 10px 0;
  border: none;
  background: var(--primary-green-color);
  color: #fff;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  font-family: var(--main-font);
  transition: all 0.2s;

  &:hover:not(:disabled) {
    filter: brightness(1.1);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
}

.copilot-items__reject-btn {
  flex: 1;
  background: var(--background-color-soft);
  color: var(--normal-text-color);
  border: none;
  border-left: 1px solid var(--border-color);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  font-family: var(--main-font);
  transition: all 0.2s;

  &:hover:not(:disabled) {
    background: var(--border-color);
    color: var(--header-text-color);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

.copilot-items__spinner {
  width: 12px;
  height: 12px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: copilot-spin 0.6s linear infinite;
}

@keyframes copilot-spin {
  to {
    transform: rotate(360deg);
  }
}

.copilot-items__saved-badge {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 8px 0;
  border-top: 1px solid var(--border-color);
  color: var(--primary-green-color);
  font-size: 12px;
  font-weight: 600;
}

/* ============================
   Redesigned Input Area
   ============================ */
.copilot-input-area {
  padding: 12px 16px;
  background: var(--background-color);
  border-top: 1px solid var(--border-color);
  flex-shrink: 0;
}

.copilot-hidden-input {
  display: none;
}

.copilot-item__price-wrap {
  display: flex;
  align-items: center;
  background: var(--background-color-soft);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  height: 42px;
  transition: all 0.2s;
  overflow: hidden;

  &:focus-within {
    border-color: var(--primary-green-color);
    background: var(--background-color);
    box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.1);
  }

  .copilot-item__input--price {
    background: transparent !important;
    border: none !important;
    height: 100% !important;
    padding-left: 8px !important;
    border-radius: 0 !important;
    box-shadow: none !important;
  }
}

.copilot-item__currency-select-ui {
  width: auto !important;
  flex-shrink: 0;

  :deep(.select-trigger) {
    background: transparent !important;
    border: none !important;
    border-right: 1px solid var(--border-color) !important;
    border-radius: 0 !important;
    padding: 0 10px 0 12px !important;
    height: 28px !important;
    color: var(--primary-green-color) !important;
    font-weight: 800 !important;
    font-size: 18px !important;
    box-shadow: none !important;
    gap: 4px !important;

    &:hover {
      background: var(--background-color-soft) !important;
    }

    .select-icon {
      font-size: 8px;
      opacity: 0.3;
      transition: opacity 0.2s;
    }

    &:hover .select-icon {
      opacity: 0.8;
    }
  }
}

/* Pill-shaped Input Container */
.copilot-input-box {
  display: flex;
  align-items: flex-end;
  gap: 6px;
  background: var(--background-color);
  border: 1px solid var(--border-color);
  border-radius: 24px;
  padding: 6px 8px;
  transition: all 0.2s ease;

  &--disabled {
    opacity: 0.6;
    cursor: not-allowed;
    background: var(--background-color-soft);

    * {
      pointer-events: none;
    }
  }

  &:focus-within:not(&--disabled) {
    border-color: var(--primary-green-color);
    box-shadow: 0 0 0 3px rgba(92, 184, 92, 0.12);
  }
}

/* Icon Buttons (Inside Input) */
.copilot-icon-btn {
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: none;
  background: transparent;
  color: var(--normal-text-color);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-bottom: 2px; /* Bottom align with text */

  &:hover {
    background: var(--background-color-soft);
    color: var(--header-text-color);
  }

  &--mic:hover {
    color: var(--primary-green-color);
    background: rgba(92, 184, 92, 0.1);
  }
}

/* Send Button */
.copilot-send-btn {
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: none;
  background: var(--primary-green-color);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  margin-bottom: 2px;
  box-shadow: 0 2px 8px rgba(92, 184, 92, 0.25);

  &:hover {
    transform: scale(1.05);
    box-shadow: 0 4px 12px rgba(92, 184, 92, 0.4);
  }
}

/* Textarea Input */
.copilot-chat-input {
  flex: 1;
  border: none;
  background: transparent;
  resize: none;
  padding: 8px 4px; /* Matches 32px button padding perfectly */
  font-family: inherit;
  font-size: 13px;
  color: var(--header-text-color);
  outline: none;
  max-height: 100px;
  overflow-y: auto;
  line-height: 1.4;
  scrollbar-width: none; /* Firefox */
}

.copilot-chat-input::placeholder {
  color: var(--normal-text-color);
  opacity: 0.7;
}

.copilot-chat-input::-webkit-scrollbar {
  display: none;
}

/* Modern Recording State Pill */
.copilot-recording-box {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: rgba(220, 53, 69, 0.05);
  border: 1px solid var(--notification-alert-color);
  border-radius: 24px;
  padding: 6px 8px 6px 16px;
}

.copilot-recording__indicator {
  display: flex;
  align-items: center;
  gap: 10px;
}

.copilot-recording__dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--notification-alert-color-text);
  animation: copilot-pulse-dot 1s ease-in-out infinite;
}

@keyframes copilot-pulse-dot {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.3;
  }
}

.copilot-recording__time {
  font-size: 13px;
  font-weight: 600;
  color: var(--notification-alert-color-text);
  font-variant-numeric: tabular-nums;
  min-width: 40px;
}

.copilot-recording__stop {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: none;
  background: var(--notification-alert-color-text);
  color: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: opacity 0.15s;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);

  &:hover {
    opacity: 0.85;
  }
}

/* ============================
   Image Viewer Modal
   ============================ */
.copilot-viewer {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;

  &__overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.85);
    backdrop-filter: blur(4px);
  }

  &__content {
    position: relative;
    max-width: 90%;
    max-height: 90%;
    display: flex;
    align-items: center;
    justify-content: center;
    animation: zoomIn 0.3s ease-out;

    img {
      max-width: 100%;
      max-height: 90vh;
      object-fit: contain;
      border-radius: 8px;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
    }
  }

  &__close {
    position: absolute;
    top: -40px;
    right: -20px;
    background: none;
    border: none;
    color: #fff;
    font-size: 24px;
    cursor: pointer;
    padding: 10px;
    transition: transform 0.2s ease;

    &:hover {
      transform: scale(1.1);
    }
  }
}

@keyframes zoomIn {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* ============================
   Responsive
   ============================ */
@media (max-width: 768px) {
  .copilot-window {
    width: 100vw !important;
    height: 100vh !important;
    height: 100dvh !important;
    max-height: 100vh;
    max-height: 100dvh;
    bottom: 0;
    right: 0;
    border-radius: 0;
    z-index: 10000;
    background: var(--background-color);

    .copilot-window-inner {
      border-radius: 0;
      border: none;
      box-shadow: none;
    }
  }

  .copilot-resize-handle {
    display: none;
  }

  .copilot-root {
    bottom: 20px;
    right: 20px;
  }

  .copilot-header {
    padding: max(16px, env(safe-area-inset-top)) 20px 16px 20px;
    height: auto;
    min-height: 70px;
    border-radius: 0 !important;
  }

  .copilot-input-area {
    padding: 16px;
    padding-bottom: calc(16px + env(safe-area-inset-bottom));
  }
}
.copilot-icon-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.icon-disabled {
  color: var(--normal-text-color) !important;
}
</style>
