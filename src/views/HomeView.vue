<script setup lang="ts">
import HeroSection from '@/components/sections/HeroSection.vue'
import FeaturesSection from '@/components/sections/FeaturesSection.vue'
import UseCasesSection from '@/components/sections/UseCasesSection.vue'
import HowItWorksSection from '@/components/sections/HowItWorksSection.vue'
import BenefitsSection from '@/components/sections/BenefitsSection.vue'
import CtaFooterSection from '@/components/sections/CtaFooterSection.vue'
</script>

<template>
  <main class="home">
    <HeroSection />
    <FeaturesSection />
    <UseCasesSection />
    <HowItWorksSection />
    <BenefitsSection />
    <CtaFooterSection />
  </main>
</template>

<style scoped>
.home {
  display: block;
}
</style>
