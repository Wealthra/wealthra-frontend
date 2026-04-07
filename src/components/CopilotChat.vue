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
      <div v-if="isOpen" class="copilot-window">
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
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="3"
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
                  width="18"
                  height="18"
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
              >
                {{ msg.content }}
              </div>

              <!-- Audio Message -->
              <div v-else-if="msg.type === 'audio'" class="copilot-bubble copilot-bubble--audio">
                <button class="copilot-audio__btn" @click="toggleAudioPlayback(msg)">
                  <svg
                    v-if="!msg.isPlaying"
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <polygon points="5 3 19 12 5 21 5 3"></polygon>
                  </svg>
                  <svg v-else width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
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
                <p class="copilot-interactive__text">{{ msg.content }}</p>

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
                            <span class="copilot-item__amount"
                              >${{ parseFloat(String(item.amount)).toFixed(2) }}</span
                            >
                          </div>
                        </div>
                        <button
                          class="copilot-item__edit-btn"
                          @click="startEditItem(msg.id, idx, item)"
                          :title="t.edit"
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
                      </template>

                      <!-- Edit Mode -->
                      <template v-else>
                        <div class="copilot-item__edit-form">
                          <input
                            v-model="editForm.description"
                            class="copilot-item__input"
                            :placeholder="t.description"
                          />
                          <div class="copilot-item__row">
                            <select v-model="editForm.categoryId" class="copilot-item__select">
                              <option v-for="cat in categories" :key="cat.id" :value="cat.id">
                                {{ cat.categoryName }}
                              </option>
                            </select>
                            <div class="copilot-item__price-wrap">
                              <span class="copilot-item__currency">$</span>
                              <input
                                v-model.number="editForm.amount"
                                type="number"
                                step="0.01"
                                class="copilot-item__input copilot-item__input--price"
                                :placeholder="t.amount"
                              />
                            </div>
                          </div>
                          <div class="copilot-item__actions">
                            <button
                              class="copilot-item__save-btn"
                              @click="saveEditItem(msg.id, idx)"
                            >
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
                              {{ t.save }}
                            </button>
                            <button class="copilot-item__cancel-btn" @click="cancelEditItem">
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
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                              </svg>
                              {{ t.cancel }}
                            </button>
                          </div>
                        </div>
                      </template>
                    </div>
                  </div>

                  <!-- Save All Button -->
                  <button
                    v-if="!msg.saved"
                    class="copilot-items__save-all"
                    :disabled="msg.saving"
                    @click="handleSaveAll(msg)"
                  >
                    <template v-if="msg.saving">
                      <span class="copilot-items__spinner"></span>
                      {{ t.saving }}
                    </template>
                    <template v-else>
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      >
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                      {{ t.saveAll }}
                    </template>
                  </button>
                  <div v-else class="copilot-items__saved-badge">
                    <svg
                      width="14"
                      height="14"
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

        <!-- Input Area -->
        <div class="copilot-input-area">
          <!-- Recording State -->
          <div v-if="isRecording" class="copilot-recording">
            <div class="copilot-recording__indicator">
              <span class="copilot-recording__dot"></span>
              <span class="copilot-recording__time">{{ formatDuration(recordingTime) }}</span>
            </div>
            <button class="copilot-recording__stop" @click="stopRecording">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <rect x="4" y="4" width="16" height="16" rx="2"></rect>
              </svg>
            </button>
          </div>

          <!-- Default State: Voice + Image Buttons -->
          <div v-else class="copilot-actions">
            <button
              class="copilot-action-btn copilot-action-btn--voice"
              @click="startRecording"
              :title="t.voice"
            >
              <div class="copilot-action-btn__circle">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2.5"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                  <line x1="12" y1="19" x2="12" y2="23"></line>
                  <line x1="8" y1="23" x2="16" y2="23"></line>
                </svg>
              </div>
              <span class="copilot-action-btn__label">{{ t.voice }}</span>
            </button>

            <button
              class="copilot-action-btn copilot-action-btn--image"
              @click="triggerImageUpload"
              :title="t.image"
            >
              <div class="copilot-action-btn__circle">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2.5"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                  <circle cx="8.5" cy="8.5" r="1.5"></circle>
                  <polyline points="21 15 16 10 5 21"></polyline>
                </svg>
              </div>
              <span class="copilot-action-btn__label">{{ t.image }}</span>
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
import { computed, defineComponent, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { copilotService } from '@/services/api/copilot/copilot.service'
import { categoryService } from '@/services/api/category/category.service'
import type {
  ExtractedExpenseItem,
  BulkExpenseRequest,
} from '@/services/api/copilot/copilot.models'
import type { Category, ApiCategory } from '@/services/api/category/category.models'

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
}

const generateId = () => Math.random().toString(36).substr(2, 9)

export default defineComponent({
  name: 'CopilotChat',
  props: {
    selectedLanguage: {
      type: String,
      default: 'English',
    },
  },
  setup(props) {
    // ── State ──
    const isOpen = ref(false)
    const messages = ref<ChatMessage[]>([])
    const isTyping = ref(false)
    const isRecording = ref(false)
    const recordingTime = ref(0)
    const categories = ref<ApiCategory[]>([])
    const viewedImage = ref<string | null>(null)

    // Editing
    const editingItemKey = ref<string | null>(null)
    const editForm = ref({
      description: '',
      categoryId: 0,
      categoryName: '',
      amount: 0,
    })

    // Refs
    const messagesEndRef = ref<HTMLElement | null>(null)
    const messagesContainerRef = ref<HTMLElement | null>(null)
    const fileInputRef = ref<HTMLInputElement | null>(null)

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
        saving: isTr ? 'Kaydediliyor...' : 'Saving...',
        saved: isTr ? 'Kaydedildi' : 'Saved',
        description: isTr ? 'Açıklama' : 'Description',
        amount: isTr ? 'Tutar' : 'Amount',
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
        categories.value = await categoryService.apiGetCategories()
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
          })
        } else {
          removeLastBotTextMessage()
          addMessage({ sender: 'bot', type: 'text', content: t.value.errorExtract })
        }
      } catch {
        isTyping.value = false
        removeLastBotTextMessage()
        addMessage({ sender: 'bot', type: 'text', content: t.value.errorExtract })
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
          })
        } else {
          removeLastBotTextMessage()
          addMessage({ sender: 'bot', type: 'text', content: t.value.errorExtract })
        }
      } catch {
        isTyping.value = false
        removeLastBotTextMessage()
        addMessage({ sender: 'bot', type: 'text', content: t.value.errorExtract })
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
      }
    }

    const saveEditItem = (msgId: string, idx: number) => {
      const msg = messages.value.find(m => m.id === msgId)
      if (msg?.itemData && msg.itemData[idx]) {
        msg.itemData[idx].description = editForm.value.description
        msg.itemData[idx].amount = editForm.value.amount
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

    // ── Save All ──
    const handleSaveAll = async (msg: ChatMessage) => {
      if (!msg.itemData || msg.itemData.length === 0) return
      msg.saving = true

      try {
        const payload: BulkExpenseRequest[] = msg.itemData.map(item => ({
          description: item.description,
          amount: item.amount,
          paymentMethod: item.paymentMethod || 'Other',
          isRecurring: item.isRecurring || false,
          categoryId: item.categoryId,
          transactionDate: item.transactionDate || new Date().toISOString(),
        }))

        await copilotService.bulkCreateExpenses(payload)
        msg.saving = false
        msg.saved = true

        addMessage({
          sender: 'bot',
          type: 'text',
          content: t.value.savedSuccess,
        })
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
      handleSaveAll,
      formatTime,
      formatDuration,
      openImageViewer,
      closeImageViewer,
      viewedImage,
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
  bottom: 24px;
  right: 24px;
  z-index: 9000;
  font-family: var(--main-font);
}

/* ============================
   Floating Action Button
   ============================ */
.copilot-fab {
  position: relative;
  width: 60px;
  height: 60px;
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
    font-size: 28px;
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
  width: 450px;
  height: 700px;
  background: var(--background-color);
  border-radius: 16px;
  box-shadow: 0 12px 48px rgba(0, 0, 0, 0.15);
  border: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  overflow: hidden;
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
  padding: 14px 16px;
  background: var(--primary-green-color);
  cursor: pointer;
  flex-shrink: 0;

  .copilot-header__left {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .copilot-header__avatar {
    width: 34px;
    height: 34px;
    border-radius: 50%;
    overflow: hidden;
    background: rgba(255, 255, 255, 0.2);
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    font-size: 16px;
  }

  .copilot-header__info {
    display: flex;
    flex-direction: column;
  }

  .copilot-header__title {
    font-weight: 600;
    font-size: 15px;
    color: #fff;
    line-height: 1.2;
  }

  .copilot-header__status {
    font-size: 11px;
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
  gap: 20px;
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
  width: 32px;
  height: 32px;
  border-radius: 50%;
  overflow: hidden;
  margin-top: 2px;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .copilot-msg__avatar-bot {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    background: var(--primary-green-color);
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    font-size: 14px;
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
  max-width: 80%;
}

.copilot-msg__sender {
  font-size: 11px;
  font-weight: 600;
  color: var(--normal-text-color);
  margin-bottom: 3px;
}

.copilot-msg__time {
  font-size: 10px;
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
  font-size: 14px;
  line-height: 1.5;
  border-radius: 14px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
  word-break: break-word;

  &.copilot-bubble--bot {
    background: var(--background-color-soft);
    color: var(--header-text-color);
    border-top-left-radius: 4px;
  }

  &.copilot-bubble--user {
    background: var(--primary-green-color);
    color: #fff;
    border-top-right-radius: 4px;
  }

  &.copilot-bubble--audio {
    display: flex;
    align-items: center;
    gap: 10px;
    background: var(--primary-green-color);
    color: #fff;
    border-top-right-radius: 4px;
    min-width: 180px;
    padding: 10px 14px;
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
      max-height: 180px;
      border-radius: 10px;
      object-fit: cover;
      display: block;
    }
  }

  &.copilot-bubble--interactive {
    padding: 12px 14px;
    max-width: none;
    width: 100%;
  }
}

/* ============================
   Audio Player (in bubble)
   ============================ */
.copilot-audio__btn {
  width: 30px;
  height: 30px;
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
  height: 5px;
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
  font-size: 11px;
  font-weight: 600;
  white-space: nowrap;
}

/* ============================
   Typing Indicator
   ============================ */
.copilot-typing {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 12px 16px;
  background: var(--background-color-soft);
  border-radius: 14px;
  border-top-left-radius: 4px;
  height: 42px;
}

.copilot-typing__dot {
  width: 7px;
  height: 7px;
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
    transform: translateY(-6px);
  }
}

/* ============================
   Interactive Items
   ============================ */
.copilot-interactive__text {
  margin: 0 0 10px 0;
  font-size: 14px;
  line-height: 1.5;
}

.copilot-items {
  background: var(--background-color);
  border: 1px solid var(--border-color);
  border-radius: 10px;
  overflow: hidden;
}

.copilot-items__header {
  padding: 8px 12px;
  background: var(--background-color-soft);
  border-bottom: 1px solid var(--border-color);
}

.copilot-items__count {
  font-size: 11px;
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
  font-size: 13px;
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
  font-size: 11px;
  color: var(--normal-text-color);
}

.copilot-item__amount {
  font-size: 13px;
  font-weight: 700;
  color: var(--header-text-color);
  flex-shrink: 0;
}

.copilot-item__edit-btn {
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
    color: var(--primary-green-color);
    background: var(--hover-color);
  }
}

/* Edit Form */
.copilot-item__edit-form {
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
}

.copilot-item__input {
  width: 100%;
  padding: 6px 10px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  font-size: 13px;
  background: var(--background-color);
  color: var(--header-text-color);
  font-family: var(--main-font);
  outline: none;
  transition: border-color 0.2s;

  &:focus {
    border-color: var(--primary-green-color);
  }

  &.copilot-item__input--price {
    padding-left: 20px;
  }
}

.copilot-item__select {
  flex: 1;
  padding: 6px 10px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  font-size: 13px;
  background: var(--background-color);
  color: var(--header-text-color);
  font-family: var(--main-font);
  outline: none;
  cursor: pointer;
  transition: border-color 0.2s;
  min-width: 0;

  &:focus {
    border-color: var(--primary-green-color);
  }
}

.copilot-item__row {
  display: flex;
  gap: 8px;
}

.copilot-item__price-wrap {
  position: relative;
  flex: 1;

  .copilot-item__currency {
    position: absolute;
    left: 8px;
    top: 50%;
    transform: translateY(-50%);
    font-size: 13px;
    color: var(--normal-text-color);
    pointer-events: none;
  }
}

.copilot-item__actions {
  display: flex;
  gap: 6px;
}

.copilot-item__save-btn,
.copilot-item__cancel-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 6px 0;
  border: none;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  font-family: var(--main-font);
  transition: opacity 0.15s;

  &:hover {
    opacity: 0.85;
  }
}

.copilot-item__save-btn {
  background: var(--primary-green-color);
  color: #fff;
}

.copilot-item__cancel-btn {
  background: var(--hover-color);
  color: var(--header-text-color);
}

/* Save All Button */
.copilot-items__save-all {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 10px 0;
  border: none;
  border-top: 1px solid var(--border-color);
  background: var(--primary-green-color);
  color: #fff;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  font-family: var(--main-font);
  transition: opacity 0.15s;

  &:hover:not(:disabled) {
    opacity: 0.9;
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
}

.copilot-items__spinner {
  width: 14px;
  height: 14px;
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
  padding: 10px 0;
  border-top: 1px solid var(--border-color);
  color: var(--primary-green-color);
  font-size: 13px;
  font-weight: 600;
}

/* ============================
   Input Area
   ============================ */
.copilot-input-area {
  padding: 16px;
  border-top: 1px solid var(--border-color);
  background: var(--background-color);
  flex-shrink: 0;
}

.copilot-hidden-input {
  display: none;
}

/* Default Actions */
.copilot-actions {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 32px;
}

.copilot-action-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;

  .copilot-action-btn__circle {
    width: 56px;
    height: 56px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid var(--border-color);
    background: var(--background-color-soft);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);

    &:hover {
      transition: all 0.25s ease;
      transform: scale(1.05);
    }
  }

  .copilot-action-btn__label {
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.8px;
    color: var(--normal-text-color);
  }

  &.copilot-action-btn--voice {
    .copilot-action-btn__circle {
      color: var(--primary-green-color);
    }
    &:hover .copilot-action-btn__circle {
      background: var(--primary-green-color);
      color: #fff;
      border-color: transparent;
      transform: scale(1.05);
      box-shadow: 0 4px 16px rgba(92, 184, 92, 0.3);
    }
  }

  &.copilot-action-btn--image {
    .copilot-action-btn__circle {
      color: var(--primary-blue-color);
    }
    &:hover .copilot-action-btn__circle {
      background: var(--primary-blue-color);
      color: #fff;
      border-color: transparent;
      transform: scale(1.05);
      box-shadow: 0 4px 16px rgba(133, 193, 233, 0.3);
    }
  }
}

/* Recording State */
.copilot-recording {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: var(--notification-alert-color-soft);
  border: 1px solid var(--notification-alert-color);
  border-radius: 999px;
  padding: 8px 12px 8px 16px;
}

.copilot-recording__indicator {
  display: flex;
  align-items: center;
  gap: 10px;
}

.copilot-recording__dot {
  width: 10px;
  height: 10px;
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
  font-size: 14px;
  font-weight: 600;
  color: var(--notification-alert-color-text);
  font-variant-numeric: tabular-nums;
  min-width: 40px;
}

.copilot-recording__stop {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: none;
  background: var(--notification-alert-color-text);
  color: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: opacity 0.15s;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

  &:hover {
    opacity: 0.85;
  }
}

/* ============================
   Responsive
   ============================ */
@media (max-width: 480px) {
  .copilot-window {
    width: calc(100vw - 16px);
    height: calc(100vh - 80px);
    bottom: 8px;
    right: 8px;
    border-radius: 12px;
  }

  .copilot-root {
    bottom: 16px;
    right: 16px;
  }
}
/* Image Viewer Modal */
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
</style>
