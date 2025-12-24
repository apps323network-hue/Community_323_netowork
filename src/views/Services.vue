<template>
  <div class="relative flex min-h-screen w-full flex-col group/design-root bg-background-light font-display text-slate-900 antialiased overflow-x-hidden selection:bg-secondary selection:text-black">
    <!-- Header Light Only -->
    <header class="lg:sticky lg:top-0 z-50 w-full border-b border-slate-200 bg-white/90 backdrop-blur-md">
      <div class="layout-container flex h-full grow flex-col">
        <div class="px-4 md:px-10 lg:px-40 flex flex-1 justify-center py-3">
          <div class="layout-content-container flex w-full max-w-[960px] flex-1 items-center justify-between">
            <div class="flex items-center gap-4">
              <div class="text-primary size-8 drop-shadow-[0_0_8px_rgba(244,37,244,0.4)]">
                <svg class="w-full h-full" fill="currentColor" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                  <path clip-rule="evenodd" d="M39.475 21.6262C40.358 21.4363 40.6863 21.5589 40.7581 21.5934C40.7876 21.655 40.8547 21.857 40.8082 22.3336C40.7408 23.0255 40.4502 24.0046 39.8572 25.2301C38.6799 27.6631 36.5085 30.6631 33.5858 33.5858C30.6631 36.5085 27.6632 38.6799 25.2301 39.8572C24.0046 40.4502 23.0255 40.7407 22.3336 40.8082C21.8571 40.8547 21.6551 40.7875 21.5934 40.7581C21.5589 40.6863 21.4363 40.358 21.6262 39.475C21.8562 38.4054 22.4689 36.9657 23.5038 35.2817C24.7575 33.2417 26.5497 30.9744 28.7621 28.762C30.9744 26.5497 33.2417 24.7574 35.2817 23.5037C36.9657 22.4689 38.4054 21.8562 39.475 21.6262ZM4.41189 29.2403L18.7597 43.5881C19.8813 44.7097 21.4027 44.9179 22.7217 44.7893C24.0585 44.659 25.5148 44.1631 26.9723 43.4579C29.9052 42.0387 33.2618 39.5667 36.4142 36.4142C39.5667 33.2618 42.0387 29.9052 43.4579 26.9723C44.1631 25.5148 44.659 24.0585 44.7893 22.7217C44.9179 21.4027 44.7097 19.8813 43.5881 18.7597L29.2403 4.41187C27.8527 3.02428 25.8765 3.02573 24.2861 3.36776C22.6081 3.72863 20.7334 4.58419 18.8396 5.74801C16.4978 7.18716 13.9881 9.18353 11.5858 11.5858C9.18354 13.988 7.18717 16.4978 5.74802 18.8396C4.58421 20.7334 3.72865 22.6081 3.36778 24.2861C3.02574 25.8765 3.02429 27.8527 4.41189 29.2403Z" fill="currentColor" fill-rule="evenodd"></path>
                </svg>
              </div>
              <h2 class="text-slate-900 text-lg font-bold leading-tight tracking-[-0.015em] hidden sm:block">323 Network</h2>
            </div>
            <div class="hidden md:flex items-center gap-6">
              <RouterLink to="/" class="text-slate-600 hover:text-primary transition-colors text-sm font-medium leading-normal">Home</RouterLink>
              <RouterLink to="/" class="text-slate-600 hover:text-primary transition-colors text-sm font-medium leading-normal">Home</RouterLink>
              <RouterLink to="/servicos" class="text-primary font-bold text-sm leading-normal relative after:content-[''] after:absolute after:-bottom-5 after:left-0 after:w-full after:h-0.5 after:bg-primary after:shadow-[0_0_10px_rgba(244,37,244,0.5)]">Serviços</RouterLink>
              <RouterLink to="/vagas" class="text-slate-600 hover:text-primary transition-colors text-sm font-medium leading-normal">Vagas</RouterLink>
            </div>
            <div class="flex items-center gap-4">
              <button class="hidden sm:flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-9 px-4 bg-white border border-secondary-dark text-secondary-dark hover:bg-secondary hover:text-black transition-all duration-300 text-sm font-bold leading-normal tracking-[0.015em] shadow-sm hover:shadow-[0_0_20px_rgba(0,243,255,0.4)]">
                <span class="truncate">Membro VIP</span>
              </button>
              <div class="bg-center bg-no-repeat bg-cover rounded-full size-9 border-2 border-primary shadow-[0_0_5px_rgba(244,37,244,0.3)]" style='background-image: url("https://lh3.googleusercontent.com/aida-public/AB6AXuBqDcp55CSGuNPfNUqt0imJA3z03iYT-ohrQuMeAmrxe3VfzPe4UAokDjIvSZfgMv8QEUvnxa9yLvyx6Q638yF4KcRTI0LEEhI1DI_CD2xaF5LqcqJABJ1_FhJVQVWRu-WfkMWYG7_1mWC41I6B2gEMzGppM27h8Sx2g_Xee-LfgDZFPan3s6BgqqnPkIriQQQGQEeCW7ZqZ4EqGW_9Qr2mM19LUdcQsfHxCUVIbOLDxyutwEdazkDIj9I6AM5ke3ce5dT9srvi5aaT");'></div>
            </div>
          </div>
        </div>
      </div>
    </header>

    <main class="flex flex-col items-center w-full">
      <!-- Hero Section -->
      <div class="w-full px-4 md:px-10 lg:px-40 py-8 md:py-12">
        <div class="mx-auto max-w-[960px] relative overflow-hidden rounded-2xl border border-slate-200 shadow-lg shadow-slate-200/50">
          <div class="absolute inset-0 bg-cover bg-center z-0" style='background-image: linear-gradient(to right, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.75) 100%), url("https://lh3.googleusercontent.com/aida-public/AB6AXuALfXL1KTlc_1eSX81JItIX5qshZk2hpi-9nqP0N2E00hURq_KtHJFfdx0E9VDYim_MzvsfNn3GHutoZA884R1TGD0PBAk2Tjz_UKAVLX1TSbJXR1g_fYFLgdCKqCojHSwjnIX1CG8w3HQPj8XvVJLuKXkMDbkwPk1FhR-xJ1D-Xk-wTV1gdIGI0OlWvXd09ClVIuZs6FJCTj9B3KpnSRhTmaQWkuI1-89s1KS_wJgsJgR5p_UFp_9MLJ3BqReHx-KUHbyjGIbORsas");'></div>
          <div class="relative z-10 flex flex-col gap-6 px-6 py-16 md:px-12 md:py-20 text-center md:text-left items-center md:items-start">
            <div class="flex flex-col gap-3 max-w-2xl">
              <div class="inline-flex items-center gap-2 self-center md:self-start px-3 py-1 rounded-full bg-white border border-primary/20 shadow-md shadow-primary/10">
                <span class="material-symbols-outlined text-primary text-[18px]">verified</span>
                <span class="text-primary text-xs font-bold uppercase tracking-wider">Exclusivo para Membros</span>
              </div>
              <h1 class="text-slate-900 text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight tracking-tight">
                Eleve sua Carreira <br/>
                <span class="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary drop-shadow-sm">nos Estados Unidos</span>
              </h1>
              <p class="text-slate-600 text-base md:text-lg font-medium leading-relaxed max-w-lg mt-2">
                Acesse uma rede de serviços premium: burocracia simplificada, estratégias de marketing e conexões de alto nível para acelerar seu sucesso.
              </p>
            </div>
            <div class="flex flex-wrap gap-4 justify-center md:justify-start mt-2">
              <button class="flex items-center justify-center rounded-lg h-12 px-6 bg-gradient-to-r from-primary to-secondary text-white text-base font-bold transition-all shadow-[0_0_15px_rgba(0,243,255,0.3)] hover:shadow-[0_0_25px_rgba(0,243,255,0.5)] hover:scale-105 hover:text-black" @click="exploreServices">
                Explorar Serviços
              </button>
              <button class="flex items-center justify-center rounded-lg h-12 px-6 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-base font-medium transition-colors hover:text-primary" @click="howItWorks">
                Como funciona
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Filters -->
      <div class="w-full px-4 md:px-10 lg:px-40 pb-8">
        <div class="mx-auto max-w-[960px]">
          <div class="flex gap-3 overflow-x-auto pb-4 no-scrollbar">
            <button
              v-for="filter in filters"
              :key="filter.id"
              :class="[
                'flex h-10 shrink-0 items-center justify-center gap-x-2 rounded-full px-5 transition-all',
                activeFilter === filter.id
                  ? 'bg-primary text-white shadow-[0_0_15px_rgba(244,37,244,0.4)] hover:scale-105'
                  : 'bg-white border border-slate-200 hover:border-secondary hover:text-secondary-dark hover:bg-slate-50 text-slate-600 shadow-sm'
              ]"
              @click="activeFilter = filter.id"
            >
              <span class="text-sm font-medium">{{ filter.label }}</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Services Grid -->
      <div class="w-full px-4 md:px-10 lg:px-40 pb-16">
        <div class="mx-auto max-w-[960px]">
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <ServiceCard
              v-for="service in filteredServices"
              :key="service.id"
              :service="service"
            />
          </div>
        </div>
      </div>

      <!-- Testimonials -->
      <div class="w-full px-4 md:px-10 lg:px-40 pb-20">
        <div class="mx-auto max-w-[960px] flex flex-col gap-8">
          <div class="flex items-center justify-between border-b border-slate-200 pb-4">
            <h2 class="text-slate-900 text-2xl font-bold tracking-tight">O que nossos membros dizem</h2>
            <a class="text-primary text-sm font-bold hover:underline hover:text-primary-hover transition-colors" href="#">Ver todos</a>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <TestimonialCard
              v-for="testimonial in testimonials"
              :key="testimonial.id"
              :testimonial="testimonial"
            />
          </div>
        </div>
      </div>

      <!-- CTA Section -->
      <div class="w-full bg-slate-50 border-t border-slate-200 py-16 px-4 md:px-10 lg:px-40">
        <div class="mx-auto max-w-[960px] flex flex-col md:flex-row items-center justify-between gap-8">
          <div class="flex flex-col gap-2 text-center md:text-left">
            <h2 class="text-slate-900 text-2xl font-bold">Precisa de algo personalizado?</h2>
            <p class="text-slate-600">Nossa equipe de concierge pode ajudar você a encontrar exatamente o que precisa.</p>
          </div>
          <button class="flex items-center gap-2 rounded-lg bg-white border border-secondary-dark text-secondary-dark hover:bg-secondary hover:text-black px-6 py-3 font-bold transition-all duration-300 shadow-sm hover:shadow-[0_0_20px_rgba(0,243,255,0.4)]" @click="contactSupport">
            <span class="material-symbols-outlined text-[20px]">chat</span>
            Falar com Suporte
          </button>
        </div>
      </div>
    </main>

    <!-- Footer Light Only -->
    <footer class="w-full bg-white py-8 px-4 md:px-10 lg:px-40 border-t border-slate-200">
      <div class="mx-auto max-w-[960px] flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-500">
        <p>© 2024 323 Network. Todos os direitos reservados.</p>
        <div class="flex gap-4">
          <a class="hover:text-primary transition-colors" href="#">Termos</a>
          <a class="hover:text-primary transition-colors" href="#">Privacidade</a>
          <a class="hover:text-primary transition-colors" href="#">Contato</a>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { RouterLink } from 'vue-router'
import ServiceCard from '@/components/features/services/ServiceCard.vue'
import TestimonialCard from '@/components/features/services/TestimonialCard.vue'

const activeFilter = ref('all')

const filters = [
  { id: 'all', label: 'Todos' },
  { id: 'legal', label: 'Legal & Burocracia' },
  { id: 'marketing', label: 'Marketing & Brand' },
  { id: 'finance', label: 'Finanças' },
  { id: 'mentoring', label: 'Mentoria' },
]

const services = [
  {
    id: 1,
    title: 'Abertura de Empresa (LLC/Corp)',
    description: 'Assessoria completa para registrar seu negócio nos EUA de forma legal, rápida e sem burocracia excessiva.',
    icon: 'domain',
    category: 'legal',
    badge: null,
  },
  {
    id: 2,
    title: 'Conta Bancária Jurídica',
    description: 'Abra sua conta Business nos principais bancos americanos sem precisar viajar. 100% digital.',
    icon: 'account_balance',
    category: 'finance',
    badge: { text: 'Popular', variant: 'primary' } as const,
  },
  {
    id: 3,
    title: 'Mentoria de Vistos',
    description: 'Consultoria especializada com advogados de imigração para análise de perfil e estratégia de visto (O1, EB2).',
    icon: 'badge',
    category: 'mentoring',
    badge: null,
  },
  {
    id: 4,
    title: 'Social Media Growth',
    description: 'Planos de gestão de redes sociais focados no mercado americano para expandir sua audiência.',
    icon: 'campaign',
    category: 'marketing',
    badge: null,
  },
  {
    id: 5,
    title: 'Personal Branding',
    description: 'Construção de autoridade e imagem pessoal para profissionais que desejam se destacar nos EUA.',
    icon: 'fingerprint',
    category: 'marketing',
    badge: null,
  },
  {
    id: 6,
    title: 'Networking VIP',
    description: 'Acesso a jantares exclusivos, meetups e grupos de mastermind com empresários de sucesso.',
    icon: 'hub',
    category: 'mentoring',
    badge: { text: 'Novo', variant: 'secondary' } as const,
  },
]

const testimonials = [
  {
    id: 1,
    name: 'Lucas Mendes',
    role: 'Designer em Miami',
    text: '"A assessoria para abrir minha LLC foi impecável. Em 2 semanas eu já estava operando legalmente na Flórida."',
    rating: 5,
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBO24-XBsP9AET_Zoxh55Al2A4HE394bA4m6COh7fGQfHMWdgIduV4sVvSGNOl_A9rBqlRwbjZjV12c1PlTPLN6Cs68GmxPLZygFsEU_9Ly1cRBN3rVvhU1xTiTGPlmXOmCgulIbTXHxWTx8WsYCLtIaoHC_qQsPtrkdqP0QjJdF659TAnNiNuVSmUQRo2q3GfVwwAMt2-b7SuC6_jvBDb7am8vvQUcjoSMvih6o6VBloKc-bWsE3Ehv4544sdqRxwi2tX6llLQ4R6E',
  },
  {
    id: 2,
    name: 'Amanda Silva',
    role: 'Empresária em NY',
    text: '"O networking VIP abriu portas que eu levaria anos para conseguir sozinho. Vale cada centavo."',
    rating: 5,
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC8JNXXmjSNkQBM0ShrNkMuhbFapyunKnp5iog6Cespr491sxMBOHfaqWPMIgaoVjTOuIgM6N9dBnDHBRhthE9wKpVnlKtfOttOuxx3gCWR2qivGh_sbbSyHtZ0QVuUdhg7LR3UAFs0Iac07Eg_Pj71a5ZDT7geVCP-iNlTxga6Wga-FlgkTQwsIWcnrPcbyg5RP6q_NVJC5RyqMYuQPnwtEDl3XsZKIjaa9TPu_DwQaKgW6WRKbtMPTUp1ag8Li5s6zFVa8DnMV3Pj',
  },
  {
    id: 3,
    name: 'Beatriz Costa',
    role: 'Arquiteta em Austin',
    text: '"Consegui organizar minha estratégia de visto com a mentoria. Me senti muito mais segura para aplicar."',
    rating: 4.5,
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBD84VTYXVbWMLV2e4lp5Gy-9R7O0crdlSUAC3KUzBjV_AXjFW_wnzpbP32ePIceAuNPJKAzcjTU4zZX3J_6oyFwEgoI-8F7yLVRSEzdeQvxO8r7fDR9FaIqZoIC_0e6XNyGezPqiSZ91SQe4MPZMG2BmIqcIEIUf9Rx4I8oEpQGVgpTDSDo-sR7ssTdg3VCYY6UsZEAvjJ3evCIQXjZncoRQ6GGQJeRLsqEeVG9Xs7omLkuwUgXaFZ7__-0AtBYN4Y7hJ_X4eXFxdp',
  },
]

const filteredServices = computed(() => {
  if (activeFilter.value === 'all') return services
  return services.filter(s => s.category === activeFilter.value)
})

function exploreServices() {
  // TODO: Implementar
}

function howItWorks() {
  // TODO: Implementar
}

function contactSupport() {
  // TODO: Implementar
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
