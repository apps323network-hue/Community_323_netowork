<template>
  <div 
    class="rich-text-editor-container" 
    :class="{ 'is-focused': isFocused }"
    :style="{ height: typeof props.maxHeight === 'number' ? `${props.maxHeight}px` : (props.maxHeight === '100%' ? '100%' : 'auto'), maxHeight: typeof props.maxHeight === 'number' ? `${props.maxHeight}px` : (props.maxHeight && props.maxHeight !== '100%' ? props.maxHeight : 'none') }"
  >
    <editor-content ref="editorContentRef" :editor="editor" class="editor-content-area" />
    
    <div v-if="editor" class="editor-toolbar flex items-center gap-1 p-2 border-t border-slate-200 dark:border-gray-800 bg-slate-50/50 dark:bg-surface-lighter/50 rounded-b-2xl">
      <button 
        type="button"
        @click="editor.chain().focus().toggleBold().run()"
        :disabled="!editor.can().chain().focus().toggleBold().run()"
        :class="{ 'is-active': editor.isActive('bold') }"
        class="toolbar-btn"
        :title="t('common.editor.bold')"
      >
        <span class="material-icons-outlined text-xl">format_bold</span>
      </button>
      
      <button 
        type="button"
        @click="editor.chain().focus().toggleItalic().run()"
        :disabled="!editor.can().chain().focus().toggleItalic().run()"
        :class="{ 'is-active': editor.isActive('italic') }"
        class="toolbar-btn"
        :title="t('common.editor.italic')"
      >
        <span class="material-icons-outlined text-xl">format_italic</span>
      </button>

      <div class="h-4 w-[1px] bg-slate-200 dark:bg-gray-700 mx-1"></div>

      <button 
        type="button"
        @click="editor.chain().focus().toggleBulletList().run()"
        :class="{ 'is-active': editor.isActive('bulletList') }"
        class="toolbar-btn"
        :title="t('common.editor.bulletList')"
      >
        <span class="material-icons-outlined text-xl">format_list_bulleted</span>
      </button>

      <button 
        type="button"
        @click="editor.chain().focus().toggleOrderedList().run()"
        :class="{ 'is-active': editor.isActive('orderedList') }"
        class="toolbar-btn"
        :title="t('common.editor.orderedList')"
      >
        <span class="material-icons-outlined text-xl">format_list_numbered</span>
      </button>
      
      <div class="ml-auto text-[10px] text-gray-400 font-medium px-2">
        {{ characterCount }} / 3000
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onBeforeUnmount, watch } from 'vue'
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
import { Editor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import { Extension, textInputRule } from '@tiptap/core'

const EmoteExtension = Extension.create({
  name: 'emotes',
  addInputRules() {
    return [
      textInputRule({
        find: /\b(br|BR)\s$/,
        replace: '🇧🇷 '
      }),
      textInputRule({
        find: /\b(us|US)\s$/,
        replace: '🇺🇸 '
      }),
    ]
  },
})

const props = defineProps<{
  modelValue: string
  placeholder?: string
  maxHeight?: string | number
}>()

const emit = defineEmits(['update:modelValue', 'focus', 'blur'])

const isFocused = ref(false)
const characterCount = ref(0)
const editorContentRef = ref<any>(null)

// Função para scroll automático ao cursor
function scrollToCursor() {
  requestAnimationFrame(() => {
    const selection = window.getSelection()
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0)
      
      // Criar um span temporário para marcar a posição do cursor
      const tempSpan = document.createElement('span')
      tempSpan.style.cssText = 'position: relative; display: inline-block;'
      
      try {
        range.insertNode(tempSpan)
        tempSpan.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
        tempSpan.remove()
      } catch (e) {
        // fallback se não conseguir inserir o span
        if (editorContentRef.value?.$el) {
          const el = editorContentRef.value.$el
          el.scrollTop = el.scrollHeight
        }
      }
    }
  })
}

const editor = new Editor({
  content: props.modelValue,
  extensions: [
    StarterKit,
    Placeholder.configure({
      placeholder: props.placeholder || 'O que você quer compartilhar?',
    }),
    EmoteExtension,
  ],
  editorProps: {
    attributes: {
      class: 'prose prose-sm dark:prose-invert focus:outline-none max-w-none min-h-[120px] px-5 py-4 text-gray-900 dark:text-white',
    },
    scrollThreshold: 100,
    scrollMargin: 100,
  },
  onUpdate: ({ editor }) => {
    const html = editor.getHTML()
    // if empty Tiptap returns <p></p>
    const isReallyEmpty = editor.getText().trim() === ''
    emit('update:modelValue', isReallyEmpty ? '' : html)
    characterCount.value = editor.getText().length
    
    // Scroll automático para manter cursor visível
    scrollToCursor()
  },
  onFocus: () => {
    isFocused.value = true
    emit('focus')
  },
  onBlur: () => {
    isFocused.value = false
    emit('blur')
  },
})

characterCount.value = editor.getText().length

watch(() => props.modelValue, (value) => {
  const isSame = editor.getHTML() === value
  if (!isSame) {
    editor.commands.setContent(value)
  }
})

onBeforeUnmount(() => {
  editor.destroy()
})

const clearContent = () => {
  editor.commands.clearContent()
}

defineExpose({
  clearContent
})
</script>

<style scoped>
.rich-text-editor-container {
  @apply w-full bg-slate-50 dark:bg-surface-lighter border border-slate-200 dark:border-gray-700/50 rounded-2xl transition-all overflow-hidden flex flex-col;
}

.rich-text-editor-container.is-focused {
  @apply ring-2 ring-primary border-transparent shadow-lg bg-white dark:bg-surface-dark;
}

.editor-content-area {
  @apply flex-grow;
  overflow-y: auto;
  overflow-x: hidden;
  min-height: 0;
}

.toolbar-btn {
  @apply p-1.5 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-slate-200 dark:hover:bg-gray-700 hover:text-primary dark:hover:text-secondary transition-all flex items-center justify-center;
}

.toolbar-btn.is-active {
  @apply bg-primary/10 dark:bg-secondary/10 text-primary dark:text-secondary;
}

:deep(.tiptap p.is-editor-empty:first-child::before) {
  @apply text-gray-400 dark:text-gray-500 float-left h-0 pointer-events-none;
  content: attr(data-placeholder);
}

:deep(.tiptap ul) {
  @apply list-disc pl-5 my-2;
}

:deep(.tiptap ol) {
  @apply list-decimal pl-5 my-2;
}

:deep(.tiptap p) {
  @apply my-1;
}

:deep(.tiptap strong) {
  @apply font-bold text-black dark:text-white;
}

:deep(.tiptap em) {
  @apply italic;
}
</style>
