<template>
  <AppLayout>
    <div class="space-y-3 sm:space-y-4 md:space-y-6 lg:space-y-8 w-full overflow-x-hidden max-w-full">
      <!-- Hero Section -->
      <div class="relative overflow-hidden rounded-xl sm:rounded-2xl border border-slate-200 dark:border-white/5 bg-white dark:bg-[#0a040f]">
        <!-- FlickeringGrid Background -->
        <FlickeringGrid
          :squareSize="4"
          :gridGap="6"
          :flickerChance="0.3"
          color="rgb(244, 37, 244)"
          :maxOpacity="0.2"
          class="absolute inset-0 z-0 dark:block hidden"
        />
        
        <!-- Gradient Overlay -->
        <div class="absolute inset-0 bg-gradient-to-r from-white/95 via-white/80 to-white/60 dark:from-[#0a040f]/95 dark:via-[#0a040f]/80 dark:to-[#0a040f]/60 z-[1]"></div>
        
        <div class="relative z-10 flex flex-col gap-3 sm:gap-4 md:gap-6 px-3 sm:px-4 md:px-6 lg:px-12 py-6 sm:py-8 md:py-12 lg:py-16 xl:py-20 text-center md:text-left items-center md:items-start">
          <div class="flex flex-col gap-2 sm:gap-3 max-w-2xl w-full">
            <div class="inline-flex items-center gap-1 sm:gap-2 self-center md:self-start px-2 sm:px-2.5 md:px-3 py-0.5 sm:py-1 rounded-full bg-secondary/10 border border-secondary/20 backdrop-blur-sm shadow-[0_0_15px_rgba(0,243,255,0.1)]">
              <span class="material-symbols-outlined text-secondary text-base sm:text-base md:text-[18px]">verified</span>
              <span class="text-secondary text-[11px] sm:text-[10px] md:text-xs font-bold uppercase tracking-wider">{{ t('services.exclusiveForMembers') }}</span>
            </div>
            <h1 class="text-slate-900 dark:text-white text-3xl sm:text-3xl md:text-3xl lg:text-4xl xl:text-5xl font-extrabold leading-tight tracking-tight">
              {{ t('services.heroTitle1') }} <br class="hidden sm:block"/>
              <span class="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary drop-shadow-[0_0_15px_rgba(244,37,244,0.3)]">{{ t('services.heroTitle2') }}</span>
            </h1>
            <p class="text-slate-600 dark:text-gray-300 text-sm sm:text-sm md:text-base lg:text-lg font-medium leading-relaxed max-w-lg mt-2 sm:mt-2">
              {{ t('services.heroDescription') }}
            </p>
          </div>
          <div class="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-3 md:gap-4 justify-center md:justify-start mt-4 sm:mt-2 w-full sm:w-auto">
            <button class="flex items-center justify-center rounded-lg h-12 sm:h-10 md:h-12 px-6 sm:px-4 md:px-6 bg-gradient-to-r from-primary to-secondary text-black text-sm sm:text-sm md:text-base font-bold transition-all shadow-[0_0_20px_rgba(0,243,255,0.3)] hover:shadow-[0_0_40px_rgba(0,243,255,0.5)] hover:scale-105 w-full sm:w-auto" @click="exploreServices">
              {{ t('services.exploreServices') }}
            </button>
            <button 
              @click="handlePublishService"
              class="flex items-center justify-center gap-2 rounded-lg h-12 sm:h-10 md:h-12 px-6 sm:px-4 md:px-6 bg-white dark:bg-white/10 hover:bg-slate-100 dark:hover:bg-white/20 border border-primary/30 text-primary text-sm sm:text-sm md:text-base font-bold backdrop-blur-sm transition-all w-full sm:w-auto"
            >
              <span class="material-symbols-outlined text-base sm:text-base">add_circle</span>
              {{ t('services.publishService') }}
            </button>

          </div>
        </div>
      </div>

      <!-- Filters -->
      <div class="flex gap-2 sm:gap-3 overflow-x-auto p-2 sm:p-3 md:p-4 no-scrollbar pb-1">
        <button
          v-for="filter in filters"
          :key="filter.id"
          :class="[
            'flex h-9 sm:h-10 md:h-11 shrink-0 items-center justify-center gap-x-1 sm:gap-x-1.5 md:gap-x-2 rounded-full px-4 sm:px-5 md:px-6 lg:px-7 transition-all outline-none',
            activeFilter === filter.id
              ? 'bg-secondary text-black shadow-[0_0_15px_rgba(0,243,255,0.4)] hover:scale-105 font-bold'
              : 'bg-white dark:bg-surface-dark border border-slate-200 dark:border-white/10 hover:border-primary/50 hover:bg-slate-50 dark:hover:bg-white/5 text-slate-700 dark:text-gray-300 hover:text-slate-900 dark:hover:text-white group font-medium'
          ]"
          @click="activeFilter = filter.id"
        >
          <span class="text-xs sm:text-sm md:text-base whitespace-nowrap">{{ filter.label }}</span>
        </button>
      </div>

      <!-- Services Grid -->
      <div>
        <div v-if="loading" class="flex justify-center py-8 sm:py-12 md:py-16 lg:py-20">
          <div class="animate-spin rounded-full h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 border-b-2 border-primary"></div>
        </div>
        <div v-else-if="filteredServices.length === 0" class="flex flex-col items-center justify-center py-8 sm:py-12 md:py-16 lg:py-20 bg-white dark:bg-surface-card rounded-lg sm:rounded-xl md:rounded-2xl border border-slate-200 dark:border-white/5 backdrop-blur-sm px-3 sm:px-4">
          <span class="material-symbols-outlined text-slate-400 dark:text-gray-500 text-3xl sm:text-4xl md:text-5xl lg:text-[64px] mb-2 sm:mb-3 md:mb-4">search_off</span>
          <p class="text-slate-500 dark:text-gray-400 font-medium text-xs sm:text-sm md:text-base text-center">{{ t('services.noServicesFound') }}</p>
        </div>
        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
          <ServiceCard
            v-for="service in filteredServices"
            :key="service.id"
            :service="service"
            @request-service="handleRequestService"
            @edit-service="handleEditService"
          />
        </div>
      </div>

      <!-- Testimonials -->
      <div class="flex flex-col gap-3 sm:gap-4 md:gap-6 lg:gap-8 pt-3 sm:pt-4 md:pt-6 lg:pt-8">
        <div class="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-2.5 sm:pb-3 md:pb-4 gap-2">
          <h2 class="text-slate-900 dark:text-white text-base sm:text-lg md:text-xl lg:text-2xl font-bold tracking-tight truncate">{{ t('services.whatMembersSay') }}</h2>
          <a v-if="testimonials.length > 0" class="text-secondary text-[10px] sm:text-xs md:text-sm font-bold hover:underline hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer whitespace-nowrap flex-shrink-0">{{ t('common.seeAll') }}</a>
        </div>
        <div v-if="testimonials.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
          <TestimonialCard
            v-for="testimonial in testimonials"
            :key="testimonial.id"
            :testimonial="testimonial"
          />
        </div>
        <div v-else class="flex flex-col items-center justify-center py-10 bg-slate-50 dark:bg-white/5 rounded-2xl border border-dashed border-slate-200 dark:border-white/10">
          <span class="material-symbols-outlined text-slate-400 dark:text-gray-500 text-4xl mb-2">rate_review</span>
          <p class="text-slate-500 dark:text-gray-400 text-sm font-medium">{{ t('services.noTestimonials') }}</p>
        </div>
      </div>

      <!-- CTA Section -->
      <div class="bg-white dark:bg-[#0a040f] border border-slate-200 dark:border-white/10 rounded-lg sm:rounded-xl md:rounded-2xl py-4 sm:py-6 md:py-8 lg:py-12 px-3 sm:px-4 md:px-6 lg:px-12 flex flex-col md:flex-row items-center justify-between gap-3 sm:gap-4 md:gap-6 lg:gap-8">
        <div class="flex flex-col gap-1.5 sm:gap-2 text-center md:text-left w-full md:w-auto">
          <h2 class="text-slate-900 dark:text-white text-lg sm:text-xl md:text-2xl font-bold">{{ t('services.needSomethingCustom') }}</h2>
          <p class="text-slate-600 dark:text-gray-400 text-xs sm:text-sm md:text-base">{{ t('services.conciergeDescription') }}</p>
        </div>
        <button class="flex items-center gap-1.5 sm:gap-2 rounded-lg bg-transparent border border-secondary text-secondary hover:bg-secondary hover:text-black px-3 sm:px-4 md:px-6 py-2 sm:py-2.5 md:py-3 text-xs sm:text-sm md:text-base font-bold transition-all duration-300 shadow-[0_0_15px_rgba(0,243,255,0.2)] hover:shadow-[0_0_25px_rgba(0,243,255,0.5)] w-full md:w-auto justify-center" @click="contactSupport">
          <span class="material-symbols-outlined text-base sm:text-lg md:text-[20px]">chat</span>
          {{ t('services.talkToSupport') }}
        </button>
      </div>
    </div>

    <!-- Modal de Solicitação / Checkout -->
    <Modal
      v-if="selectedService"
      v-model="showRequestModal"
      :title="selectedService.preco ? t('services.contract') + ' ' + selectedService.nome : t('services.request') + ' ' + selectedService.nome"
    >
      <div class="flex flex-col gap-3 sm:gap-4">
        <!-- Descrição -->
        <p class="text-xs sm:text-sm text-slate-600 dark:text-gray-300">
          <template v-if="selectedService.preco">
            {{ t('services.contracting') }} <strong class="text-slate-900 dark:text-white">{{ selectedService.nome }}</strong>.
          </template>
          <template v-else>
            {{ t('services.requesting') }} <strong class="text-slate-900 dark:text-white">{{ selectedService.nome }}</strong>.
            {{ t('services.partnerContact') }}
          </template>
        </p>

        <!-- Preço (se existir) -->
        <div v-if="selectedService.preco" class="space-y-3">
          <!-- Breakdown de Valores -->
          <div class="p-3 sm:p-4 rounded-lg bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 space-y-2">
            <div class="flex justify-between items-center text-sm">
              <span class="text-slate-500 dark:text-gray-400">{{ t('services.serviceValue') }}</span>
              <span class="text-slate-900 dark:text-white font-medium">{{ formatPrice(selectedService.preco, selectedService.moeda) }}</span>
            </div>
            
            <div v-if="paymentMethod" class="flex justify-between items-center text-sm">
              <span class="text-slate-500 dark:text-gray-400">{{ t('services.stripeFee') }} ({{ paymentMethod === 'card' ? '3.9% + $0.30' : '~1.8%' }})</span>
              <span class="text-slate-900 dark:text-white font-medium">{{ formatPrice(calculateFee(selectedService.preco, paymentMethod), paymentMethod === 'pix' ? 'BRL' : selectedService.moeda) }}</span>
            </div>
            
            <div class="border-t border-slate-200 dark:border-white/10 pt-2 mt-2"></div>
            
            <div class="flex justify-between items-center">
              <span class="text-slate-700 dark:text-gray-300 font-bold">{{ t('services.totalToPay') }}</span>
              <span class="text-2xl font-bold text-slate-900 dark:text-white">
                {{ paymentMethod ? formatPrice(calculateTotal(selectedService.preco, paymentMethod), paymentMethod === 'pix' ? 'BRL' : selectedService.moeda) : formatPrice(selectedService.preco, selectedService.moeda) }}
              </span>
            </div>
          </div>

          <!-- Nota sobre conversão PIX -->
          <div v-if="paymentMethod === 'pix'" class="flex items-start gap-2 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
            <span class="material-symbols-outlined text-blue-400 text-base">info</span>
            <p class="text-xs text-blue-300">
              {{ t('services.pixConversion', { rate: exchangeRate.toFixed(2) }) }}
            </p>
          </div>
        </div>
        
        <!-- Benefício Membro -->
        <div v-if="selectedService.beneficio_membro" class="p-4 rounded-lg bg-secondary/10 border border-secondary/20">
          <p class="text-[10px] sm:text-xs font-bold text-secondary uppercase mb-1">{{ t('services.memberBenefit') }}</p>
          <p class="text-xs sm:text-sm text-slate-600 dark:text-gray-300 font-medium">{{ selectedService.beneficio_membro }}</p>
        </div>

        <!-- Método de Pagamento (apenas para serviços pagos) -->
        <div v-if="selectedService.preco" class="space-y-3">
          <label class="text-sm font-bold text-slate-700 dark:text-gray-300">{{ t('services.paymentMethod') }}</label>
          <div class="grid grid-cols-2 gap-3">
            <button
              @click="paymentMethod = 'card'"
              class="flex flex-col items-center gap-2 p-4 rounded-lg border transition-all"
              :class="paymentMethod === 'card' 
                ? 'border-primary bg-primary/10 text-slate-900 dark:text-white' 
                : 'border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/30 text-slate-600 dark:text-gray-400'"
            >
              <span class="material-symbols-outlined text-2xl">credit_card</span>
              <span class="text-sm font-bold">{{ t('services.card') }}</span>
              <span class="text-[10px] text-slate-500 dark:text-gray-500">{{ t('services.debitOrCredit') }}</span>
            </button>
            <button
              @click="paymentMethod = 'pix'"
              class="flex flex-col items-center gap-2 p-4 rounded-lg border transition-all"
              :class="paymentMethod === 'pix' 
                ? 'border-secondary bg-secondary/10 text-slate-900 dark:text-white' 
                : 'border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/30 text-slate-600 dark:text-gray-400'"
            >
              <span class="material-symbols-outlined text-2xl">qr_code_2</span>
              <span class="text-sm font-bold">{{ t('services.pix') }}</span>
              <span class="text-[10px] text-slate-500 dark:text-gray-500">{{ t('services.instantPayment') }}</span>
            </button>
          </div>
        </div>
        <!-- Mensagem (para serviços gratuitos) -->
        <div v-if="!selectedService.preco" class="flex flex-col gap-1.5">
          <label class="text-xs sm:text-sm font-bold text-slate-700 dark:text-gray-300">{{ t('services.additionalMessage') }}</label>
          <textarea
            v-model="requestMessage"
            rows="4"
            class="w-full rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0a040f] p-2.5 sm:p-3 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
            :placeholder="t('services.requestPlaceholder')"
          ></textarea>
        </div>

        <!-- Termos e Condições (Se houver) -->
        <div v-if="selectedService.terms_content_pt || selectedService.terms_content_en" class="space-y-3">
          <div class="flex items-start gap-3 p-4 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 group cursor-pointer" @click="acceptedTerms = !acceptedTerms">
            <div class="flex items-center justify-center pt-0.5">
              <input
                v-model="acceptedTerms"
                type="checkbox"
                class="w-5 h-5 rounded border-2 border-slate-300 dark:border-white/20 text-primary focus:ring-primary bg-white dark:bg-surface-dark transition-all cursor-pointer"
                @click.stop
              />
            </div>
            <div class="flex-1">
              <p class="text-xs font-bold text-slate-700 dark:text-gray-300 leading-normal">
                Eu li e concordo com os <button type="button" @click.stop="showTermsModal = true" class="text-primary hover:underline decoration-2 underline-offset-2">Termos e Condições</button> específicos deste serviço.
              </p>
            </div>
          </div>
        </div>

        <!-- Botão de Ação -->
        <button
          @click="selectedService.preco ? handleCheckout() : submitRequest()"
          :disabled="submitting || (selectedService.preco && !paymentMethod) || ((selectedService.terms_content_pt || selectedService.terms_content_en) && !acceptedTerms)"
          class="w-full rounded-lg bg-gradient-to-r from-primary to-secondary py-2.5 sm:py-3 text-xs sm:text-sm font-bold text-black shadow-lg shadow-primary/30 hover:shadow-primary/50 transition-all disabled:opacity-50"
        >
          <template v-if="submitting">
            <span class="flex items-center justify-center gap-2">
              <span class="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></span>
              {{ t('services.processing') }}
            </span>
          </template>
          <template v-else-if="selectedService.preco">
            {{ t('services.pay') }} {{ formatPrice(selectedService.preco, selectedService.moeda) }}
          </template>
          <template v-else>
            {{ t('services.confirmRequest') }}
          </template>
        </button>

        <!-- Segurança -->
        <p v-if="selectedService.preco" class="text-[10px] text-slate-500 dark:text-gray-500 text-center flex items-center justify-center gap-1">
          <span class="material-symbols-outlined text-[14px]">lock</span>
          {{ t('services.securePayment') }}
        </p>
      </div>
    </Modal>


    <!-- Modal Criar Serviço -->
    <Modal
      v-model="showCreateServiceModal"
      title="Publicar Novo Serviço"
    >
      <div class="flex flex-col gap-4">
        <div>
          <label class="block text-sm font-bold text-slate-700 dark:text-gray-300 mb-1.5">Nome do Serviço *</label>
          <input
            v-model="newService.nome"
            type="text"
            class="w-full rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0a040f] p-3 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:border-primary focus:ring-1 focus:ring-primary outline-none"
            placeholder="Ex: Consultoria Jurídica para Imigração"
          />
        </div>

        <div>
          <label class="block text-sm font-bold text-slate-700 dark:text-gray-300 mb-1.5">Descrição *</label>
          <textarea
            v-model="newService.descricao"
            rows="4"
            class="w-full rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0a040f] p-3 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:border-primary focus:ring-1 focus:ring-primary outline-none"
            placeholder="Descreva detalhadamente o serviço que você oferece..."
          ></textarea>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-bold text-slate-700 dark:text-gray-300 mb-1.5">Categoria *</label>
            <select
              v-model="newService.categoria"
              class="w-full rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0a040f] p-3 text-sm text-slate-900 dark:text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none"
            >
              <option value="">Selecione...</option>
              <option value="legal">Legal/Jurídico</option>
              <option value="marketing">Marketing</option>
              <option value="finance">Finanças</option>
              <option value="mentoring">Mentoria</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-bold text-slate-700 dark:text-gray-300 mb-1.5">Preço (USD) - Opcional</label>
            <input
              v-model.number="newService.preco"
              type="number"
              step="100"
              min="0"
              class="w-full rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0a040f] p-3 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:border-primary focus:ring-1 focus:ring-primary outline-none"
              placeholder="Em centavos (ex: 5000 = $50)"
            />
          </div>
        </div>

        <div>
          <label class="block text-sm font-bold text-slate-700 dark:text-gray-300 mb-1.5">Benefício para Membros</label>
          <input
            v-model="newService.beneficio_membro"
            type="text"
            class="w-full rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0a040f] p-3 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:border-primary focus:ring-1 focus:ring-primary outline-none"
            placeholder="Ex: 10% de desconto para membros premium"
          />
        </div>

        <div>
          <label class="block text-sm font-bold text-slate-700 dark:text-gray-300 mb-1.5">Termos e Condições (PT)</label>
          <textarea
            v-model="newService.terms_content_pt"
            rows="4"
            class="w-full rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0a040f] p-3 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:border-primary focus:ring-1 focus:ring-primary outline-none"
            placeholder="Defina as condições para este serviço em português..."
          ></textarea>
        </div>

        <div>
          <label class="block text-sm font-bold text-slate-700 dark:text-gray-300 mb-1.5">Terms and Conditions (EN)</label>
          <textarea
            v-model="newService.terms_content_en"
            rows="4"
            class="w-full rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0a040f] p-3 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:border-primary focus:ring-1 focus:ring-primary outline-none"
            placeholder="Define the conditions for this service in English..."
          ></textarea>
        </div>

        <div class="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-300 text-sm">
          <span class="material-symbols-outlined text-base align-middle mr-1">info</span>
          Seu serviço será enviado para aprovação e ficará visível após nossa análise.
        </div>

        <button
          @click="submitNewService"
          :disabled="creatingService || !newService.nome || !newService.descricao || !newService.categoria"
          class="w-full rounded-lg bg-gradient-to-r from-primary to-secondary py-3 text-sm font-bold text-black shadow-lg shadow-primary/30 hover:shadow-primary/50 transition-all disabled:opacity-50"
        >
          <template v-if="creatingService">
            <span class="flex items-center justify-center gap-2">
              <span class="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></span>
              Enviando...
            </span>
          </template>
          <template v-else>
            Enviar para Aprovação
          </template>
        </button>
      </div>
    </Modal>

    <!-- Modal de Termos -->
    <Modal
      v-if="selectedService"
      v-model="showTermsModal"
      title="Termos e Condições"
      size="lg"
    >
      <div class="p-2 space-y-4">
        <div class="prose dark:prose-invert max-w-none">
          <div class="text-sm text-slate-700 dark:text-gray-300 whitespace-pre-line leading-relaxed h-[60vh] overflow-y-auto pr-4 scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent">
            {{ currentLocale === 'pt-BR' ? (selectedService.terms_content_pt || selectedService.terms_content_en) : (selectedService.terms_content_en || selectedService.terms_content_pt) }}
          </div>
        </div>
        <div class="flex justify-end pt-4 border-t border-slate-100 dark:border-white/5">
          <button
            @click="showTermsModal = false"
            class="px-6 py-2 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-white font-bold hover:bg-slate-200 dark:hover:bg-white/10 transition-all"
          >
            Fechar
          </button>
        </div>
      </div>
    </Modal>
  </AppLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useSupabase } from '@/composables/useSupabase'
import { useSubscriptionsStore } from '@/stores/subscriptions'
import { useAuthStore } from '@/stores/auth'
import { useSSO } from '@/composables/useSSO'
import AppLayout from '@/components/layout/AppLayout.vue'
import ServiceCard from '@/components/features/services/ServiceCard.vue'
import TestimonialCard from '@/components/features/services/TestimonialCard.vue'
import Modal from '@/components/ui/Modal.vue'
import FlickeringGrid from '@/components/ui/FlickeringGrid.vue'
import { toast } from 'vue-sonner'
import { fetchExchangeRate, calculatePixAmount } from '@/lib/exchange'

const router = useRouter()

const { supabase } = useSupabase()
const { t } = useI18n()
const subscriptionsStore = useSubscriptionsStore()
const authStore = useAuthStore()

const loading = ref(true)
const services = ref<any[]>([])
const activeFilter = ref('all')

const showRequestModal = ref(false)
const showCreateServiceModal = ref(false)
const selectedService = ref<any>(null)
const requestMessage = ref('')
const submitting = ref(false)
const creatingService = ref(false)
const editingServiceId = ref<string | null>(null)
const paymentMethod = ref<'card' | 'pix' | null>(null)
const exchangeRate = ref(5.90)
const acceptedTerms = ref(false)
const showTermsModal = ref(false)
const { locale: currentLocale } = useI18n()

const newService = ref({
  nome: '',
  descricao: '',
  categoria: '',
  preco: null as number | null,
  beneficio_membro: '',
  terms_content_pt: '',
  terms_content_en: ''
})

const filters = computed(() => {
  const baseFilters = [
    { id: 'all', label: t('navigation.allCategories') },
    { id: 'legal', label: t('services.filterLegal') },
    { id: 'marketing', label: t('services.filterMarketing') },
    { id: 'finance', label: t('services.filterFinance') },
    { id: 'mentoring', label: t('services.filterMentoring') },
  ]
  
  if (subscriptionsStore.hasActiveSubscription) {
    baseFilters.push({ id: 'mine', label: 'Meus Serviços' })
  }
  
  return baseFilters
})

const testimonials = computed<any[]>(() => [])

function formatPrice(cents: number, currency: string = 'USD'): string {
  const amount = cents / 100
  if (currency === 'BRL') {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(amount)
  }
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)
}

// Taxas Stripe (conforme GUIA_RAPIDO_STRIPE.md)
const CARD_FEE_PERCENTAGE = 0.039 // 3.9%
const CARD_FEE_FIXED = 30 // $0.30 em centavos


function calculateFee(basePriceCents: number, method: 'card' | 'pix'): number {
  if (method === 'card') {
    // Taxa cartão: 3.9% + $0.30
    return Math.round((basePriceCents * CARD_FEE_PERCENTAGE) + CARD_FEE_FIXED)
  } else {
    // PIX: converter para BRL e aplicar taxa com margem
    const usdAmount = basePriceCents / 100
    const grossAmountBRL = calculatePixAmount(usdAmount, exchangeRate.value)
    const baseAmountBRL = usdAmount * exchangeRate.value // Valor base sem margem
    const feeAmountBRL = grossAmountBRL - baseAmountBRL
    return Math.round(feeAmountBRL * 100) // em centavos de BRL
  }
}

function calculateTotal(basePriceCents: number, method: 'card' | 'pix'): number {
  if (method === 'card') {
    // Total em USD
    return basePriceCents + calculateFee(basePriceCents, method)
  } else {
    // Total em BRL
    const usdAmount = basePriceCents / 100
    const grossAmountBRL = calculatePixAmount(usdAmount, exchangeRate.value)
    return Math.round(grossAmountBRL * 100) // em centavos de BRL
  }
}

async function fetchServices() {
  try {
    loading.value = true
    
    let query = supabase
      .from('services')
      .select('*')
    
    if (activeFilter.value === 'all') {
      query = query.eq('ativo', true).eq('status', 'approved')
    } else if (activeFilter.value === 'mine') {
      if (!authStore.user) return
      query = query.eq('created_by', authStore.user.id)
    } else {
      query = query.eq('categoria', activeFilter.value).eq('ativo', true).eq('status', 'approved')
    }

    const { data, error: fetchError } = await query.order('destaque', { ascending: false })

    if (fetchError) throw fetchError
    
    // Filter out user-created "Tradução de Documentos" service in production (only show on localhost)
    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    
    services.value = (data || []).filter((service: any) => {
      // Hide user-created translation service in production
      // Check by name since it's a user-created service
      const isTranslationService = 
        service.nome_pt?.toLowerCase().includes('tradução de documentos') ||
        service.nome_en?.toLowerCase().includes('document translation')
      
      if (isTranslationService && service.is_user_service && !isLocalhost) {
        return false
      }
      return true
    })
  } catch (error) {
    console.error('Error fetching services:', error)
  } finally {
    loading.value = false
  }
}

watch(activeFilter, () => {
  fetchServices()
})

const filteredServices = computed(() => {
  if (activeFilter.value === 'all') return services.value
  return services.value.filter(s => s.categoria === activeFilter.value)
})

async function handleRequestService(service: any) {
  // Se for serviço externo com SSO habilitado, redirecionar com token
  if (service.is_external && service.sso_enabled) {
    try {
      const { generateSSOUrl } = useSSO()
      const ssoUrl = await generateSSOUrl(service)
      window.open(ssoUrl, '_blank')
      return
    } catch (error: any) {
      console.error('Erro ao gerar URL SSO:', error)
      toast.error(error.message || 'Erro ao redirecionar para o serviço')
    }
  }

  // Se for um serviço externo sem preço, abrir o link externo diretamente
  if (service.is_external && !service.preco && service.external_url) {
    window.open(service.external_url, '_blank')
    return
  }

  // Comportamento padrão: abrir modal de solicitação
  selectedService.value = service
  paymentMethod.value = null
  requestMessage.value = ''
  acceptedTerms.value = false
  showRequestModal.value = true
}

async function handleCheckout() {
  if (!selectedService.value || !paymentMethod.value) return

  try {
    submitting.value = true
    
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session) {
      toast.error(t('services.mustBeLoggedInToContract'))
      return
    }

    const { data, error } = await supabase.functions.invoke('create-service-checkout', {
      body: {
        service_id: selectedService.value.id,
        payment_method: paymentMethod.value,
        exchange_rate: exchangeRate.value,
        mensagem: requestMessage.value,
        accepted_terms: acceptedTerms.value
      }
    })

    if (error) throw error

    if (data?.checkout_url) {
      window.location.href = data.checkout_url
    } else {
      throw new Error('URL de checkout não retornada')
    }
  } catch (error: any) {
    console.error('Erro ao iniciar checkout:', error)
    toast.error(error.message || t('services.checkoutError'))
  } finally {
    submitting.value = false
  }
}

async function submitRequest() {
  if (!selectedService.value) return

  try {
    submitting.value = true
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      toast.error(t('services.mustBeLoggedInToRequest'))
      return
    }

    const { error } = await supabase
      .from('service_requests')
      .insert({
        service_id: selectedService.value.id,
        user_id: user.id,
        mensagem: requestMessage.value,
        status: 'pendente'
      })

    // Gravar aceitação de termos se houver e o usuário aceitou
    if (acceptedTerms.value && (selectedService.value.terms_content_pt || selectedService.value.terms_content_en)) {
      await supabase
        .from('item_terms_acceptance')
        .insert({
          user_id: user.id,
          item_type: 'service',
          item_id: selectedService.value.id,
          terms_snapshot_pt: selectedService.value.terms_content_pt,
          terms_snapshot_en: selectedService.value.terms_content_en,
          ip_address: 'client-side', // Fallback
          user_agent: navigator.userAgent
        })
    }

    if (error) throw error

    toast.success(t('services.requestSuccess'))
    showRequestModal.value = false
    requestMessage.value = ''
  } catch (error) {
    console.error('Erro ao enviar solicitação:', error)
    toast.error(t('services.requestError'))
  } finally {
    submitting.value = false
  }
}

onMounted(async () => {
  fetchServices()
  // Buscar taxa de câmbio real
  const rate = await fetchExchangeRate()
  exchangeRate.value = rate
})

function exploreServices() {
  const el = document.querySelector('.grid')
  el?.scrollIntoView({ behavior: 'smooth' })
}



async function handlePublishService() {
  // Check if user is logged in
  if (!authStore.user) {
    toast.error('Faça login para publicar um serviço')
    router.push('/login?redirect=/servicos')
    return
  }

  // Check subscription status
  await subscriptionsStore.fetchSubscription()
  if (!subscriptionsStore.hasActiveSubscription) {
    router.push('/subscription')
    return
  }

  editingServiceId.value = null
  newService.value = {
    nome: '',
    descricao: '',
    categoria: '',
    preco: null,
    beneficio_membro: '',
    terms_content_pt: '',
    terms_content_en: ''
  }
  showCreateServiceModal.value = true
}

async function handleEditService(service: any) {
  editingServiceId.value = service.id
  newService.value = {
    nome: service.nome_pt,
    descricao: service.descricao_pt,
    categoria: service.categoria,
    preco: service.preco ? service.preco / 100 : null,
    beneficio_membro: service.beneficio_membro_pt,
    terms_content_pt: service.terms_content_pt || '',
    terms_content_en: service.terms_content_en || ''
  }
  showCreateServiceModal.value = true
}

async function submitNewService() {
  if (!authStore.user) return
  
  try {
    creatingService.value = true

    if (editingServiceId.value) {
      const { error } = await supabase
        .from('services')
        .update({
          nome_pt: newService.value.nome,
          nome_en: newService.value.nome,
          descricao_pt: newService.value.descricao,
          descricao_en: newService.value.descricao,
          categoria: newService.value.categoria,
          preco: newService.value.preco ? Math.round(newService.value.preco * 100) : null,
          beneficio_membro_pt: newService.value.beneficio_membro || null,
          beneficio_membro_en: newService.value.beneficio_membro || null,
          terms_content_pt: newService.value.terms_content_pt || null,
          terms_content_en: newService.value.terms_content_en || null,
          status: 'pending', // Volta para análise após editar
          rejection_reason: null // Limpa o motivo da recusa anterior
        })
        .eq('id', editingServiceId.value)

      if (error) throw error
      toast.success('Serviço atualizado e enviado para nova análise!')
    } else {
      const { error } = await supabase
        .from('services')
        .insert({
          nome_pt: newService.value.nome,
          nome_en: newService.value.nome,
          descricao_pt: newService.value.descricao,
          descricao_en: newService.value.descricao,
          categoria: newService.value.categoria,
          preco: newService.value.preco ? Math.round(newService.value.preco * 100) : null,
          beneficio_membro_pt: newService.value.beneficio_membro || null,
          beneficio_membro_en: newService.value.beneficio_membro || null,
          terms_content_pt: newService.value.terms_content_pt || null,
          terms_content_en: newService.value.terms_content_en || null,
          moeda: 'USD',
          ativo: false,
          status: 'pending',
          destaque: false,
          created_by: authStore.user.id,
          is_user_service: true
        })

      if (error) throw error
      toast.success('Serviço enviado para aprovação!')
    }

    toast.success('Serviço enviado para aprovação!')
    showCreateServiceModal.value = false
    
    // Reset form
    newService.value = {
      nome: '',
      descricao: '',
      categoria: '',
      preco: null,
      beneficio_membro: '',
      terms_content_pt: '',
      terms_content_en: ''
    }
  } catch (error: any) {
    console.error('Erro ao criar serviço:', error)
    toast.error(error.message || 'Erro ao criar serviço')
  } finally {
    creatingService.value = false
  }
}

function contactSupport() {
  router.push('/contact-us')
}
</script>

<style scoped>
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
