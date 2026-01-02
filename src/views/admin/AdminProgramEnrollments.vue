<template>
  <AdminLayout>
    <div class="p-6">
      <div class="flex items-center gap-4 mb-6">
        <RouterLink
          to="/admin/programas"
          class="text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white"
        >
          ← {{ t('common.back') }}
        </RouterLink>
        <h1 class="text-3xl font-bold text-slate-900 dark:text-white">
          {{ t('programs.admin.enrollmentsList') }}
        </h1>
      </div>

      <div class="bg-white dark:bg-surface-dark rounded-xl p-6">
        <p class="text-slate-600 dark:text-gray-400">
          Program Enrollments Management - Em construção
        </p>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup lang="ts">
import { useLocale } from '@/composables/useLocale'
import AdminLayout from '@/components/layout/admin/AdminLayout.vue'

const { t } = useLocale()
</script>
