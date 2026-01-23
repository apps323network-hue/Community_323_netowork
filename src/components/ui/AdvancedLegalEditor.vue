<template>
  <div 
    class="advanced-legal-editor flex flex-col border border-slate-200 dark:border-white/10 rounded-2xl overflow-hidden bg-white dark:bg-slate-900 transition-all shadow-sm h-[calc(100vh-250px)] min-h-[600px]"
    :class="{ 'ring-2 ring-primary/30 border-primary/50': isFocused }"
  >
    <!-- Premium Sticky Toolbar (Google Docs Style - Fixed to component top) -->
    <div class="sticky top-0 z-30 border-b border-slate-200 dark:border-white/10 bg-slate-50/95 dark:bg-slate-800/95 p-2 flex flex-wrap items-center gap-1 shadow-sm">
      <!-- Logic for View Toggle -->
      <div class="flex items-center bg-slate-200/50 dark:bg-white/10 p-1 rounded-xl mr-2">
        <button 
          @click="viewMode = 'visual'"
          :class="viewMode === 'visual' ? 'bg-white dark:bg-slate-700 shadow-sm text-primary' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'"
          class="px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2"
        >
          <span class="material-symbols-outlined text-sm">edit</span>
          Visual
        </button>
        <button 
          @click="viewMode = 'code'"
          :class="viewMode === 'code' ? 'bg-white dark:bg-slate-700 shadow-sm text-primary' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'"
          class="px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2"
        >
          <span class="material-symbols-outlined text-sm">code</span>
          Código
        </button>
      </div>

      <template v-if="viewMode === 'visual' && editor">
        <!-- Text Styles -->
        <div class="flex items-center gap-0.5 px-1 border-r border-slate-200 dark:border-white/10 mr-1">
          <ToolbarButton 
            icon="format_bold" 
            title="Bold" 
            @click="editor.chain().focus().toggleBold().run()"
            :active="editor.isActive('bold')" 
          />
          <ToolbarButton 
            icon="format_italic" 
            title="Italic" 
            @click="editor.chain().focus().toggleItalic().run()"
            :active="editor.isActive('italic')" 
          />
          <ToolbarButton 
            icon="format_underlined" 
            title="Underline" 
            @click="editor.chain().focus().toggleUnderline().run()"
            :active="editor.isActive('underline')" 
          />
          <ToolbarButton 
            icon="format_strikethrough" 
            title="Strike" 
            @click="editor.chain().focus().toggleStrike().run()"
            :active="editor.isActive('strike')" 
          />
        </div>

        <!-- Highlighting & Color -->
        <div class="flex items-center gap-0.5 px-1 border-r border-slate-200 dark:border-white/10 mr-1">
          <ToolbarButton 
            icon="border_color" 
            title="Yellow Highlight" 
            @click="editor.chain().focus().toggleHighlight({ color: '#fef08a' }).run()"
            :active="editor.isActive('highlight', { color: '#fef08a' })" 
          />
          <ToolbarButton 
            icon="format_color_text" 
            title="Primary Color" 
            @click="editor.chain().focus().setColor('#0090ff').run()"
            :active="editor.isActive('textStyle', { color: '#0090ff' })" 
          />
          <ToolbarButton 
            icon="format_clear" 
            title="Clear Formatting" 
            @click="editor.chain().focus().unsetAllMarks().clearNodes().run()"
          />
        </div>

        <!-- Headings -->
        <div class="flex items-center gap-0.5 px-1 border-r border-slate-200 dark:border-white/10 mr-1">
          <ToolbarButton 
            icon="format_h1" 
            title="Heading 1" 
            @click="editor.chain().focus().toggleHeading({ level: 1 }).run()"
            :active="editor.isActive('heading', { level: 1 })" 
          />
          <ToolbarButton 
            icon="format_h2" 
            title="Heading 2" 
            @click="editor.chain().focus().toggleHeading({ level: 2 }).run()"
            :active="editor.isActive('heading', { level: 2 })" 
          />
          <ToolbarButton 
            icon="format_h3" 
            title="Heading 3" 
            @click="editor.chain().focus().toggleHeading({ level: 3 }).run()"
            :active="editor.isActive('heading', { level: 3 })" 
          />
        </div>

        <!-- Alignments -->
        <div class="flex items-center gap-0.5 px-1 border-r border-slate-200 dark:border-white/10 mr-1">
          <ToolbarButton 
            icon="format_align_left" 
            title="Align Left" 
            @click="editor.chain().focus().setTextAlign('left').run()"
            :active="editor.isActive({ textAlign: 'left' })" 
          />
          <ToolbarButton 
            icon="format_align_center" 
            title="Center" 
            @click="editor.chain().focus().setTextAlign('center').run()"
            :active="editor.isActive({ textAlign: 'center' })" 
          />
          <ToolbarButton 
            icon="format_align_right" 
            title="Align Right" 
            @click="editor.chain().focus().setTextAlign('right').run()"
            :active="editor.isActive({ textAlign: 'right' })" 
          />
          <ToolbarButton 
            icon="format_align_justify" 
            title="Justify" 
            @click="editor.chain().focus().setTextAlign('justify').run()"
            :active="editor.isActive({ textAlign: 'justify' })" 
          />
        </div>

        <!-- Lists & Structure -->
        <div class="flex items-center gap-0.5 px-1">
          <ToolbarButton 
            icon="format_list_bulleted" 
            title="Bulleted List" 
            @click="editor.chain().focus().toggleBulletList().run()"
            :active="editor.isActive('bulletList')" 
          />
          <ToolbarButton 
            icon="format_list_numbered" 
            title="Numbered List" 
            @click="editor.chain().focus().toggleOrderedList().run()"
            :active="editor.isActive('orderedList')" 
          />
          <ToolbarButton 
            icon="format_quote" 
            title="Quote" 
            @click="editor.chain().focus().toggleBlockquote().run()"
            :active="editor.isActive('blockquote')" 
          />
          <ToolbarButton 
            icon="horizontal_rule" 
            title="Horizontal Line" 
            @click="editor.chain().focus().setHorizontalRule().run()"
          />
          <ToolbarButton 
            icon="link" 
            title="Add Link" 
            @click="setLink"
            :active="editor.isActive('link')" 
          />
        </div>

        <!-- Table Controls -->
        <div class="flex items-center gap-0.5 px-1 border-l border-slate-200 dark:border-white/10 ml-1">
          <ToolbarButton 
            icon="grid_on" 
            title="Insert Table" 
            @click="editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()" 
          />
          <template v-if="editor.isActive('table')">
            <ToolbarButton icon="add_row_above" title="Row Above" @click="editor.chain().focus().addRowBefore().run()" />
            <ToolbarButton icon="add_row_below" title="Row Below" @click="editor.chain().focus().addRowAfter().run()" />
            <ToolbarButton icon="delete_sweep" title="Remove Table" @click="editor.chain().focus().deleteTable().run()" />
          </template>
        </div>
      </template>

      <!-- History Operations -->
      <div class="ml-auto flex items-center gap-1">
         <ToolbarButton 
          icon="undo" 
          title="Undo" 
          @click="editor?.chain().focus().undo().run()" 
          :disabled="!editor?.can().undo()"
        />
        <ToolbarButton 
          icon="redo" 
          title="Redo" 
          @click="editor?.chain().focus().redo().run()" 
          :disabled="!editor?.can().redo()"
        />
      </div>
    </div>

    <!-- Content Area (Scrollable like Google Docs) -->
    <div class="relative flex-1 flex flex-col overflow-y-auto custom-scrollbar">
      <!-- Visual Editor View -->
      <div 
        v-show="viewMode === 'visual'"
        class="flex-1 bg-slate-100 dark:bg-slate-900"
      >
        <!-- Document Paper -->
        <div class="max-w-[900px] mx-auto my-12 p-8 md:p-20 bg-white dark:bg-slate-950 border border-slate-200 dark:border-primary/30 shadow-[0_20px_50px_rgba(0,0,0,0.5)] min-h-[1000px] relative">
          <editor-content :editor="editor" class="legal-prose-editor" />
        </div>
      </div>

      <!-- Code Editor View -->
      <div 
        v-if="viewMode === 'code'"
        class="flex-1 overflow-hidden flex flex-col bg-slate-900"
      >
        <textarea
          v-model="rawHtml"
          class="flex-1 w-full p-8 bg-transparent text-cyan-400 font-mono text-sm border-none focus:ring-0 resize-none outline-none custom-scrollbar"
          placeholder="Enter your legal HTML here..."
          spellcheck="false"
        ></textarea>
      </div>
    </div>

    <!-- Status Bar / Anti-Truncation -->
    <div class="border-t border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 p-3 flex flex-wrap items-center justify-between gap-4">
      <div class="flex items-center gap-6">
        <div class="flex items-center gap-2">
          <div 
            class="w-2 h-2 rounded-full" 
            :class="isTruncated ? 'bg-red-500 animate-pulse' : 'bg-green-500'"
          ></div>
          <span class="text-[10px] font-black uppercase tracking-widest" :class="isTruncated ? 'text-red-500' : 'text-slate-400'">
            {{ isTruncated ? 'Warning: Possible Truncation' : 'Integrity: OK' }}
          </span>
        </div>
        
        <div class="flex items-center gap-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
           <span>Size: <span class="text-slate-600 dark:text-white">{{ currentLengthFormatted }} KB</span></span>
           <span>Words: <span class="text-slate-600 dark:text-white">{{ wordCount }}</span></span>
        </div>
      </div>

      <div class="flex items-center gap-3">
        <button 
          v-if="hasOriginal"
          @click="restoreOriginal"
          class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-500/10 text-orange-500 hover:bg-orange-500 hover:text-white transition-all text-[10px] font-black uppercase tracking-widest"
        >
          <span class="material-symbols-outlined text-sm">history</span>
          Restore Original
        </button>
        <div class="px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-white/5 text-[10px] font-black text-slate-400 uppercase tracking-widest border border-slate-200 dark:border-white/5">
          Tiptap Document Core
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch, computed } from 'vue'
import { Editor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import { Underline } from '@tiptap/extension-underline'
import { TextAlign } from '@tiptap/extension-text-align'
import { Link } from '@tiptap/extension-link'
import { Table } from '@tiptap/extension-table'
import { TableRow } from '@tiptap/extension-table-row'
import { TableCell } from '@tiptap/extension-table-cell'
import { TableHeader } from '@tiptap/extension-table-header'
import { Placeholder } from '@tiptap/extension-placeholder'
import { Highlight } from '@tiptap/extension-highlight'
import { TextStyle } from '@tiptap/extension-text-style'
import { Color } from '@tiptap/extension-color'
import ToolbarButton from './editor/ToolbarButton.vue'
import DOMPurify from 'dompurify'

const props = defineProps<{
  modelValue: string
  placeholder?: string
}>()

const emit = defineEmits(['update:modelValue'])

const viewMode = ref<'visual' | 'code'>('visual')
const isFocused = ref(false)
const originalHtml = ref('')
const rawHtml = ref('')

// Configurable Editor
const editor = new Editor({
  content: props.modelValue,
  extensions: [
    StarterKit.configure({
      heading: {
        levels: [1, 2, 3],
      },
    }),
    Underline,
    TextAlign.configure({
      types: ['heading', 'paragraph'],
    }),
    Link.configure({
      openOnClick: false,
      HTMLAttributes: {
        class: 'text-primary underline cursor-pointer',
      },
    }),
    Table.configure({
      resizable: true,
      HTMLAttributes: {
        class: 'border-collapse table-fixed w-full my-4 border border-slate-200 dark:border-white/10',
      },
    }),
    TableRow,
    TableHeader,
    TableCell,
    Highlight.configure({ multicolor: true }),
    TextStyle,
    Color,
    Placeholder.configure({
      placeholder: props.placeholder || 'Comece a escrever...',
    }),
  ],
  editorProps: {
    attributes: {
      class: 'legal-editor-content tiptap ProseMirror focus:outline-none min-h-[800px]',
    },
  },
  onUpdate: ({ editor }) => {
    const html = editor.getHTML()
    rawHtml.value = html
    emit('update:modelValue', html)
  },
  onFocus: () => (isFocused.value = true),
  onBlur: () => (isFocused.value = false),
})

// Sync Raw HTML with Editor when switching back
watch(viewMode, (newMode) => {
  if (newMode === 'visual' && editor) {
    const sanitized = DOMPurify.sanitize(rawHtml.value)
    editor.commands.setContent(sanitized)
  }
})

// Truncation Logic
const currentLength = computed(() => rawHtml.value.length)
const currentLengthFormatted = computed(() => (currentLength.value / 1024).toFixed(2))
const wordCount = computed(() => {
  if (!rawHtml.value) return 0
  return rawHtml.value.replace(/<[^>]*>/g, ' ').split(/\s+/).filter(Boolean).length
})

const isTruncated = computed(() => {
  if (!originalHtml.value || currentLength.value === 0) return false
  // Detect if content lost more than 60% of size without meaningful edits
  return currentLength.value < (originalHtml.value.length * 0.4)
})

const hasOriginal = computed(() => 
  !!originalHtml.value && originalHtml.value !== rawHtml.value
)

function restoreOriginal() {
  if (confirm('Deseja restaurar o conteúdo original?')) {
    rawHtml.value = originalHtml.value
    if (editor) {
      editor.commands.setContent(originalHtml.value)
    }
  }
}

function setLink() {
  const previousUrl = editor.getAttributes('link').href
  let url = window.prompt('URL do Link:', previousUrl)
  
  if (url === null) return
  
  // Remove aspas que o usuário possa ter colado/digitado por engano
  url = url.trim().replace(/^["'](.+)["']$/, '$1')

  if (url === '') {
    editor.chain().focus().extendMarkRange('link').unsetLink().run()
    return
  }
  
  editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
}

// Lifecycle
onMounted(() => {
  if (props.modelValue) {
    originalHtml.value = props.modelValue
    rawHtml.value = props.modelValue
  }
})

onBeforeUnmount(() => {
  editor.destroy()
})

watch(() => props.modelValue, (newVal) => {
  if (newVal !== rawHtml.value) {
    rawHtml.value = newVal
    if (!originalHtml.value && newVal) {
      originalHtml.value = newVal
    }
    if (editor && editor.getHTML() !== newVal) {
       editor.commands.setContent(newVal)
    }
  }
})
</script>

<style>
/* Global high-contrast overrides for Legal Editor in Dark Mode */
.dark .legal-prose-editor .legal-editor-content,
.dark .legal-prose-editor .tiptap,
.dark .legal-prose-editor .ProseMirror,
.dark .legal-prose-editor .ProseMirror * {
  color: #ffffff !important;
}

.dark .legal-prose-editor h1,
.dark .legal-prose-editor h2,
.dark .legal-prose-editor h3,
.dark .legal-prose-editor h4,
.dark .legal-prose-editor p,
.dark .legal-prose-editor li,
.dark .legal-prose-editor span {
  color: #ffffff !important;
}
</style>

<style scoped>
.legal-prose-editor :deep(.legal-editor-content),
.legal-prose-editor :deep(.tiptap),
.legal-prose-editor :deep(.ProseMirror) {
  min-height: 800px;
  outline: none !important;
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
  font-size: 1.15rem;
  line-height: 1.85;
  color: #0f172a;
}

.legal-prose-editor :deep(h1), 
.legal-prose-editor :deep(h2), 
.legal-prose-editor :deep(h3) {
  font-weight: 900; /* font-black */
  color: #0f172a;
  margin-top: 2.5rem;
  margin-bottom: 1.25rem;
  letter-spacing: -0.025em; /* tracking-tight */
  text-transform: uppercase;
}

.legal-prose-editor :deep(h1) { font-size: 1.875rem; } /* text-3xl */
.legal-prose-editor :deep(h2) { 
  font-size: 1.25rem; /* text-xl */
  border-bottom: 1px solid rgba(15, 23, 42, 0.1); 
  padding-bottom: 0.5rem; 
}
.dark :deep(.legal-prose-editor h2) {
  border-bottom-color: rgba(255, 255, 255, 0.1);
}
.legal-prose-editor :deep(h3) { font-size: 1.125rem; } /* text-lg */

.legal-prose-editor :deep(p) {
  margin-bottom: 1.5rem;
  color: inherit !important;
}

.dark :deep(.legal-prose-editor p) {
  color: #f8fafc !important;
}

.legal-prose-editor :deep(ul), 
.legal-prose-editor :deep(ol) {
  margin-bottom: 1.5rem;
  margin-left: 1.5rem;
}

.legal-prose-editor :deep(ul) { list-style-type: disc; }
.legal-prose-editor :deep(ol) { list-style-type: decimal; }

.legal-prose-editor :deep(blockquote) {
  border-left: 4px solid rgba(var(--primary-rgb), 0.3);
  background-color: rgba(var(--primary-rgb), 0.05);
  padding: 1rem 1rem 1rem 1.5rem;
  font-style: italic;
  margin: 1.5rem 0;
  border-radius: 0 0.75rem 0.75rem 0;
}

.legal-prose-editor :deep(table) {
  border-collapse: collapse;
  table-layout: fixed;
  width: 100%;
  margin: 1.5rem 0;
  font-family: sans-serif;
  font-size: 0.875rem;
}

.legal-prose-editor :deep(td), 
.legal-prose-editor :deep(th) {
  border: 1px solid #e2e8f0; /* border-slate-200 */
  padding: 0.75rem;
  position: relative;
}

.dark :deep(.legal-prose-editor td),
.dark :deep(.legal-prose-editor th) {
  border-color: rgba(255, 255, 255, 0.1);
}

.legal-prose-editor :deep(th) {
  background-color: #f8fafc; /* bg-slate-50 */
  font-weight: 900;
  text-align: left;
}

.dark :deep(.legal-prose-editor th) {
  background-color: rgba(255, 255, 255, 0.05);
}

.custom-scrollbar::-webkit-scrollbar {
  width: 8px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #e2e8f0;
  border-radius: 9999px;
}
.dark .custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(var(--primary-rgb), 0.2);
}
</style>
