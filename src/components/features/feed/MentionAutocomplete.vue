<template>
  <div class="relative">
    <textarea
      ref="textareaRef"
      v-model="localValue"
      :rows="rows"
      :placeholder="placeholder"
      :class="[inputClasses, rows === 1 ? 'overflow-hidden' : '']"
      :style="rows === 1 ? { height: 'auto', minHeight: '2.5rem', maxHeight: '2.5rem' } : {}"
      @input="handleInput"
      @keydown="handleKeydown"
      @focus="handleFocus"
      @blur="handleBlur"
    ></textarea>

    <!-- Autocomplete Dropdown -->
    <Transition
      enter-active-class="transition-all duration-200"
      enter-from-class="opacity-0 scale-95 translate-y-2"
      enter-to-class="opacity-100 scale-100 translate-y-0"
      leave-active-class="transition-all duration-200"
      leave-from-class="opacity-100 scale-100 translate-y-0"
      leave-to-class="opacity-0 scale-95 translate-y-2"
    >
      <div
        v-if="showDropdown && filteredUsers.length > 0"
        class="absolute z-50 top-full left-0 mt-1 w-full min-w-[280px] bg-white dark:bg-surface-dark border border-slate-200 dark:border-white/10 rounded-lg shadow-xl max-h-60 overflow-y-auto"
        style="max-width: 100%;"
      >
        <div
          v-for="(user, index) in filteredUsers"
          :key="user.id"
          class="px-4 py-3 hover:bg-slate-50 dark:hover:bg-surface-lighter cursor-pointer transition-colors flex items-center gap-3"
          :class="{ 'bg-slate-50 dark:bg-surface-lighter': index === selectedIndex }"
          @click="selectUser(user)"
          @mouseenter="selectedIndex = index"
        >
          <Avatar
            :src="user.avatar_url"
            :name="user.nome"
            size="sm"
          />
          <div class="flex-1 min-w-0">
            <p class="font-medium text-sm text-slate-900 dark:text-white truncate">
              {{ user.nome }}
            </p>
            <p class="text-xs text-slate-500 dark:text-slate-400 truncate">
              {{ user.email }}
            </p>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick, onMounted } from 'vue'
import { useMentions } from '@/composables/useMentions'
import Avatar from '@/components/ui/Avatar.vue'

// Simple debounce function
function debounce<T extends (...args: any[]) => any>(func: T, wait: number): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null
      func(...args)
    }
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

interface Props {
  modelValue: string
  placeholder?: string
  rows?: number
  inputClasses?: string
}

interface Emits {
  (e: 'update:modelValue', value: string): void
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: '',
  rows: 4,
  inputClasses: 'w-full rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0a040f] p-3 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-secondary focus:ring-1 focus:ring-secondary focus:shadow-[0_0_15px_rgba(0,243,255,0.3)] outline-none transition-all resize-none',
})

const emit = defineEmits<Emits>()

const { searchUsers } = useMentions()
const textareaRef = ref<HTMLTextAreaElement | null>(null)
const localValue = ref(props.modelValue)
const showDropdown = ref(false)
const filteredUsers = ref<any[]>([])
const selectedIndex = ref(0)
const currentMention = ref<{ start: number; query: string } | null>(null)

// Debounced search function
const debouncedSearch = debounce(async (query: string) => {
  if (query.length < 2) {
    filteredUsers.value = []
    return
  }

  const users = await searchUsers(query, 5)
  filteredUsers.value = users
  selectedIndex.value = 0
}, 300)

watch(() => props.modelValue, (newVal) => {
  localValue.value = newVal
})

watch(localValue, (newVal) => {
  emit('update:modelValue', newVal)
})

function handleInput(event: Event) {
  const target = event.target as HTMLTextAreaElement
  const value = target.value
  const cursorPosition = target.selectionStart

  // Find @ mention before cursor
  const textBeforeCursor = value.substring(0, cursorPosition)
  const mentionMatch = textBeforeCursor.match(/@(\w*)$/)

  if (mentionMatch) {
    const query = mentionMatch[1]
    currentMention.value = {
      start: cursorPosition - query.length - 1,
      query,
    }
    
    showDropdown.value = true
    debouncedSearch(query)
  } else {
    showDropdown.value = false
    currentMention.value = null
    filteredUsers.value = []
  }
}


function handleKeydown(event: KeyboardEvent) {
  if (!showDropdown.value || filteredUsers.value.length === 0) return

  if (event.key === 'ArrowDown') {
    event.preventDefault()
    selectedIndex.value = (selectedIndex.value + 1) % filteredUsers.value.length
  } else if (event.key === 'ArrowUp') {
    event.preventDefault()
    selectedIndex.value = selectedIndex.value === 0 
      ? filteredUsers.value.length - 1 
      : selectedIndex.value - 1
  } else if (event.key === 'Enter' || event.key === 'Tab') {
    event.preventDefault()
    if (filteredUsers.value[selectedIndex.value]) {
      selectUser(filteredUsers.value[selectedIndex.value])
    }
  } else if (event.key === 'Escape') {
    showDropdown.value = false
  }
}

function handleFocus() {
  // Check if there's a mention at cursor position
  if (textareaRef.value) {
    const cursorPosition = textareaRef.value.selectionStart
    const textBeforeCursor = localValue.value.substring(0, cursorPosition)
    const mentionMatch = textBeforeCursor.match(/@(\w*)$/)
    
    if (mentionMatch) {
      const query = mentionMatch[1]
      currentMention.value = {
        start: cursorPosition - query.length - 1,
        query,
      }
      showDropdown.value = true
      debouncedSearch(query)
    }
  }
}

function handleBlur() {
  // Delay hiding dropdown to allow click on user item
  setTimeout(() => {
    showDropdown.value = false
  }, 200)
}

function selectUser(user: any) {
  if (!currentMention.value || !textareaRef.value) return

  const textarea = textareaRef.value
  const value = localValue.value
  const start = currentMention.value.start
  const end = textarea.selectionStart

  // Replace @query with @username
  const newValue = 
    value.substring(0, start) + 
    `@${user.nome} ` + 
    value.substring(end)

  localValue.value = newValue
  emit('update:modelValue', newValue)

  showDropdown.value = false
  currentMention.value = null
  filteredUsers.value = []

  // Set cursor position after the mention
  nextTick(() => {
    const newCursorPos = start + user.nome.length + 2 // @ + name + space
    textarea.setSelectionRange(newCursorPos, newCursorPos)
    textarea.focus()
  })
}

onMounted(() => {
  localValue.value = props.modelValue
})
</script>

<style scoped>
/* Custom scrollbar for dropdown */
div::-webkit-scrollbar {
  width: 6px;
}

div::-webkit-scrollbar-track {
  background: transparent;
}

div::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}

.dark div::-webkit-scrollbar-thumb {
  background: #475569;
}
</style>

