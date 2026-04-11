<template>
  <div class="landing-pricing-container">
    <div class="pricing-header">
      <h2>{{ headerText }}</h2>
      <p>{{ subtext }}</p>
    </div>
    
    <div class="pricing-cards">
      <!-- Free Tier / Basic -->
      <div class="pricing-card">
        <h3 class="tier-name">{{ freeTierTitle }}</h3>
        <div class="tier-price">
          <span class="currency">$</span>
          <span class="amount">0</span>
          <span class="period">/mo</span>
        </div>
        <ul class="tier-features">
          <li><font-awesome-icon icon="check" class="icon-check" /> {{ featureFree1 }}</li>
          <li><font-awesome-icon icon="check" class="icon-check" /> {{ featureFree2 }}</li>
          <li><font-awesome-icon icon="check" class="icon-check" /> {{ featureFree3 }}</li>
          <li class="unavailable"><font-awesome-icon icon="times" class="icon-times" /> {{ featurePremium1 }}</li>
        </ul>
        <router-link to="/signup" class="pricing-btn">{{ getStartedText }}</router-link>
      </div>

      <!-- Premium Tier -->
      <div class="pricing-card premium-card">
        <div class="popular-badge">{{ popularBadgeText }}</div>
        <h3 class="tier-name">{{ premiumTierTitle }}</h3>
        <div class="tier-price">
          <span class="currency">$</span>
          <span class="amount">9.99</span>
          <span class="period">/mo</span>
        </div>
        <ul class="tier-features">
          <li><font-awesome-icon icon="check" class="icon-check" /> {{ featurePremiumAI }}</li>
          <li><font-awesome-icon icon="check" class="icon-check" /> {{ featurePremiumScan }}</li>
          <li><font-awesome-icon icon="check" class="icon-check" /> {{ featurePremiumReports }}</li>
          <li><font-awesome-icon icon="check" class="icon-check" /> {{ featurePremiumSupport }}</li>
        </ul>
        <router-link to="/signup" class="pricing-btn premium-btn">{{ upgradeText }}</router-link>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue'

export default defineComponent({
  name: 'UILandingPricing',
  props: {
    selectedLanguage: {
      type: String,
      default: 'English',
    },
  },
  setup(props) {
    const isTr = computed(() => props.selectedLanguage === 'Turkish')

    return {
      headerText: computed(() => isTr.value ? 'İhtiyacınıza Uygun Planlar' : 'Plans that fit your needs'),
      subtext: computed(() => isTr.value ? 'Finansal yolculuğunuzda yanınızdayız. Limitsiz özellikler için Premium\'a geçin.' : 'We are with you on your financial journey. Upgrade to Premium for unhindered features.'),
      
      freeTierTitle: computed(() => isTr.value ? 'Temel' : 'Basic'),
      premiumTierTitle: computed(() => 'Premium'),
      
      getStartedText: computed(() => isTr.value ? 'Hemen Başla' : 'Get Started'),
      upgradeText: computed(() => isTr.value ? 'Premium\'a Geç' : 'Upgrade to Premium'),
      popularBadgeText: computed(() => isTr.value ? 'En Popüler' : 'Most Popular'),

      featureFree1: computed(() => isTr.value ? 'Temel bütçe takibi' : 'Basic budget tracking'),
      featureFree2: computed(() => isTr.value ? 'Aylık 10 Fiş Tarama' : '10 Receipt Scans /mo'),
      featureFree3: computed(() => isTr.value ? 'Aylık 20 AI Sorusu' : '20 AI Prompts /mo'),
      featurePremium1: computed(() => isTr.value ? 'Sınırsız Analiz' : 'Unlimited Analytics'),

      featurePremiumAI: computed(() => isTr.value ? 'Sınırsız AI Copilot' : 'Unlimited AI Copilot'),
      featurePremiumScan: computed(() => isTr.value ? 'Kusursuz Fiş Tarama' : 'Flawless Receipt Scanning'),
      featurePremiumReports: computed(() => isTr.value ? 'Genişletilmiş Analiz' : 'Extended Analytics'),
      featurePremiumSupport: computed(() => isTr.value ? 'Öncelikli Destek' : 'Priority Support'),
    }
  }
})
</script>

<style scoped>
.landing-pricing-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  max-width: 1000px;
  margin: 3rem auto;
  gap: 2.5rem;
}

.pricing-header {
  text-align: center;
  color: var(--header-text-color);
}
.pricing-header h2 {
  font-size: 2.2rem;
  margin-bottom: 0.5rem;
}
.pricing-header p {
  color: var(--normal-text-color);
  font-size: 1.1rem;
}

.pricing-cards {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  width: 100%;
  padding: 0 1rem;
}

@media (min-width: 768px) {
  .pricing-cards {
    flex-direction: row;
    justify-content: center;
  }
}

.pricing-card {
  flex: 1;
  max-width: 400px;
  background-color: var(--background-color-soft);
  border: 1px solid var(--border-color);
  border-radius: 24px;
  padding: 2.5rem 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}
.pricing-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 16px 32px rgba(0,0,0,0.1);
}

.premium-card {
  border: 2px solid var(--primary-green-color);
  background-color: var(--background-color);
}

.popular-badge {
  position: absolute;
  top: -12px;
  background-color: var(--primary-green-color);
  color: #fff;
  padding: 0.3rem 1rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: bold;
}

.tier-name {
  font-size: 1.4rem;
  color: var(--header-text-color);
  margin-bottom: 1rem;
}

.tier-price {
  margin-bottom: 2rem;
  color: var(--header-text-color);
}
.tier-price .currency {
  font-size: 1.5rem;
  vertical-align: top;
}
.tier-price .amount {
  font-size: 3rem;
  font-weight: 800;
}
.tier-price .period {
  color: var(--normal-text-color);
}

.tier-features {
  list-style: none;
  padding: 0;
  width: 100%;
  margin-bottom: 2.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.tier-features li {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 1rem;
  color: var(--header-text-color);
}

.tier-features li.unavailable {
  color: var(--normal-text-color);
  opacity: 0.6;
}

.icon-check {
  color: var(--primary-green-color);
}
.icon-times {
  color: var(--normal-text-color);
}

.pricing-btn {
  width: 100%;
  padding: 0.8rem;
  border-radius: 999px;
  text-align: center;
  text-decoration: none;
  font-weight: 700;
  font-size: 1rem;
  color: var(--header-text-color);
  background: var(--background-color);
  border: 1px solid var(--border-color);
  transition: all 0.3s ease;
}
.pricing-btn:hover {
  background: var(--border-color);
}

.premium-btn {
  background: var(--primary-green-color);
  color: #fff;
  border: none;
}
.premium-btn:hover {
  background: var(--reverse-primary-green-color);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(92,184,92,0.3);
}
</style>
