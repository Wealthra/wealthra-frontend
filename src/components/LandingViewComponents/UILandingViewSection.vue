<template>
  <!-- Main container with conditional class for reversed layout -->
  <div :class="['content-section', { reverse }]">
    <!-- Left/right side: Text content area -->
    <div class="text-wrapper">
      <!-- Header section with regular and colored text -->
      <div class="header-wrapper">
        <div class="header">{{ header }}</div>
        <div class="colored-header" :style="{ color: coloredHeaderColor }">
          {{ coloredHeader }}
        </div>
      </div>
      <!-- Descriptive paragraph text -->
      <div class="subtext">{{ subtext }}</div>
    </div>
    <!-- Left/right side: SVG icon display area -->
    <div class="icon-wrapper">
      <img
        src="../../icons/landing-page-photo-1.jpg"
        alt="landing-page-photo"
        class="landing-page-photo"
        v-if="icon === 'photo-1'"
      />
      <img
        src="../../icons/landing-page-photo-2.jpg"
        alt="landing-page-photo"
        class="landing-page-photo"
        v-else-if="icon === 'photo-2'"
      />
      <img
        src="../../icons/landing-page-photo-3.jpg"
        alt="landing-page-photo"
        class="landing-page-photo"
        v-else-if="icon === 'photo-3'"
      />
    </div>
  </div>
</template>

<script lang="ts">
export default {
  name: 'ContentSection',
  props: {
    header: String, // Main heading text

    coloredHeader: String, // Secondary heading with custom color

    subtext: String, // Descriptive paragraph text

    icon: { type: String, required: true }, // SVG icon identifier (required)

    coloredHeaderColor: String, // Custom color for the secondary heading

    reverse: { type: Boolean, default: false }, // Controls layout direction (false = text left, icon right; true = icon left, text right)
  },
}
</script>

<style scoped lang="scss">
.content-section {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 100%;
  gap: 3rem;
  padding: 0 1rem;

  @media (min-width: 768px) {
    flex-direction: row;
    justify-content: space-between;
    gap: 3rem;
    padding: 0rem;
    &.reverse {
      flex-direction: row-reverse;
    }
  }

  @media (min-width: 1024px) {
    justify-content: space-between;
    gap: 4rem;
    padding: 0rem;
  }

  .text-wrapper {
    display: flex;
    flex-direction: column;
    width: 100%;
    max-width: 100%;
    align-items: center;
    text-align: center;

    @media (min-width: 768px) {
      max-width: 450px;
      align-items: flex-start;
      text-align: left;
    }

    @media (min-width: 1024px) {
      max-width: 600px;
    }

    .header-wrapper {
      width: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;

      @media (min-width: 768px) {
        align-items: flex-start;
      }

      .header {
        font-weight: bold;
        font-size: 32px;
        color: var(--header-text-color);
        line-height: 1.2;
        text-align: center;

        @media (min-width: 768px) {
          font-size: 48px;
          text-align: left;
        }

        @media (min-width: 1024px) {
          font-size: 64px;
        }
      }

      .colored-header {
        font-weight: 700;
        font-size: 32px;
        line-height: 1.2;
        text-align: center;

        @media (min-width: 768px) {
          font-size: 48px;
          text-align: left;
        }

        @media (min-width: 1024px) {
          font-size: 64px;
        }
      }
    }

    .subtext {
      font-weight: 400;
      font-size: 16px;
      color: var(--normal-text-color);
      margin-top: 1rem;
      width: 100%;
      line-height: 1.4;
      text-align: center;

      @media (min-width: 768px) {
        font-size: 18px;
        margin-top: 1.25rem;
        text-align: left;
      }

      @media (min-width: 1024px) {
        font-size: 20px;
        margin-top: 1.5rem;
      }
    }
  }

  .icon-wrapper {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    max-width: 300px;

    .landing-page-photo {
      width: 100%;
      border-radius: 15px;
      opacity: var(--opacity);
    }

    @media (min-width: 768px) {
      width: 40%;
      max-width: none;
    }
  }
}
</style>
