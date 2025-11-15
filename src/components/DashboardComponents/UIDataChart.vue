<template>
  <div class="data-chart-c">
    <div class="top-section">
      <div class="chart-title">{{ title }}</div>
      <div
        class="data-information"
        v-if="tooltipVisible"
        :class="{ 'fade-in': showTooltip, 'fade-out': !showTooltip }"
        :style="{ backgroundColor: statusBarColor }"
      >
        {{ `${clickedItem.month} - ${clickedItem.amount.toLocaleString()}$` }}
      </div>
    </div>
    <div class="chart-area">
      <canvas ref="chartCanvas" :width="canvasWidth" :height="canvasHeight"></canvas>
    </div>
  </div>
</template>

<script lang="ts">
import type { ChartDataItem } from '../../interfaces/ChartData'

export default {
  name: 'DataChart',
  data() {
    return {
      canvasWidth: 400,
      canvasHeight: 200,
      barSpacing: 8,
      barWidth: 40,
      paddingBottom: 5,
      paddingTop: 5,
      paddingLeft: 40,
      paddingRight: 20,
      showTooltip: false,
      tooltipVisible: false,
      tooltipTimeout: null as number | null,
      clickedItem: {
        month: '',
        amount: 0,
      } as ChartDataItem,
      observer: null as ResizeObserver | null,
      screenSize: 'large', // Track screen size for responsive adjustments
    }
  },
  props: {
    data: {
      type: Object as () => Record<number, number>,
    },
    title: {
      type: String,
      default: 'Spendings',
    },
    color: {
      type: String,
      default: 'blue',
    },
  },
  computed: {
    chartData(): {
      month: string
      amount: number
    }[] {
      if (!this.data) return []
      return Object.entries(this.data).map(([key, value]) => ({
        month: key,
        amount: value as number,
      }))
    },
    barColor() {
      return `var(--primary-${this.color}-color)`
    },
    clickedColor() {
      return `var(--reverse-primary-${this.color}-color)`
    },
    statusBarColor() {
      return `var(--primary-${this.color}-color)`
    },
    maxValue() {
      if (this.chartData.length === 0) return 0
      return Math.max(...this.chartData.map(item => item.amount))
    },
    // Responsive properties based on screen size
    responsiveBarWidth() {
      switch (this.screenSize) {
        case 'small':
          return Math.min(25, this.barWidth)
        case 'medium':
          return Math.min(30, this.barWidth)
        default:
          return this.barWidth
      }
    },
    responsiveBarSpacing() {
      switch (this.screenSize) {
        case 'small':
          return Math.max(3, this.barSpacing - 4)
        case 'medium':
          return Math.max(5, this.barSpacing - 2)
        default:
          return this.barSpacing
      }
    },
    responsivePaddingLeft() {
      return this.screenSize === 'small' ? 30 : this.paddingLeft
    },
    responsiveGridCount() {
      return this.screenSize === 'small' ? 3 : 5
    },
  },
  methods: {
    drawChart() {
      const canvas = this.$refs.chartCanvas as HTMLCanvasElement
      if (!canvas) return

      const ctx = canvas.getContext('2d')
      if (!ctx) return

      // Clear the canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // If no data, don't draw anything
      if (this.chartData.length === 0) return

      // Draw Y axis line
      ctx.beginPath()
      ctx.strokeStyle = getComputedStyle(document.documentElement)
        .getPropertyValue('--header-text-color')
        .trim()
      ctx.lineWidth = 1
      ctx.moveTo(this.responsivePaddingLeft, this.paddingTop)
      ctx.lineTo(this.responsivePaddingLeft, canvas.height - this.paddingBottom)
      ctx.stroke()

      // Draw X axis line
      ctx.beginPath()
      ctx.moveTo(this.responsivePaddingLeft, canvas.height - this.paddingBottom)
      ctx.lineTo(canvas.width - this.paddingRight, canvas.height - this.paddingBottom)
      ctx.stroke()

      // Calculate available width for bars
      const availableWidth = canvas.width - this.responsivePaddingLeft - this.paddingRight

      // Calculate bar width based on available space and data length
      const calculatedBarWidth = Math.min(
        this.responsiveBarWidth,
        (availableWidth - (this.chartData.length - 1) * this.responsiveBarSpacing) /
          this.chartData.length
      )

      // Calculate scale for Y axis
      const availableHeight = canvas.height - this.paddingTop - this.paddingBottom
      const yScale = this.maxValue > 0 ? availableHeight / this.maxValue : 0

      // Draw grid lines for Y axis
      const gridCount = this.responsiveGridCount
      ctx.strokeStyle = 'rgba(200, 200, 200, 0.2)'
      ctx.lineWidth = 0.5

      // Responsive font size
      const fontSize = this.screenSize === 'small' ? 8 : 10
      ctx.font = `${fontSize}px Arial`

      ctx.fillStyle = getComputedStyle(document.documentElement)
        .getPropertyValue('--header-text-color')
        .trim()
      ctx.textAlign = 'right'

      for (let i = 0; i <= gridCount; i++) {
        const y = canvas.height - this.paddingBottom - (i / gridCount) * availableHeight
        const value = Math.round((i / gridCount) * this.maxValue)

        // Draw grid line
        ctx.beginPath()
        ctx.moveTo(this.responsivePaddingLeft, y)
        ctx.lineTo(canvas.width - this.paddingRight, y)
        ctx.stroke()

        // Draw value label
        ctx.fillText(value.toLocaleString(), this.responsivePaddingLeft - 5, y + 3)
      }

      // Draw bars and x-axis labels
      ctx.textAlign = 'center'
      this.chartData.forEach((item, index) => {
        const x =
          this.responsivePaddingLeft + index * (calculatedBarWidth + this.responsiveBarSpacing)
        const barHeight = item.amount * yScale
        const y = canvas.height - this.paddingBottom - barHeight

        // Draw bar
        ctx.fillStyle = this.IsClickedItemSame(item)
          ? this.getComputedColor(this.clickedColor)
          : this.getComputedColor(this.barColor)

        this.roundRect(ctx, x, y, calculatedBarWidth, barHeight, 3)

        // Draw x-axis label
        ctx.fillStyle = getComputedStyle(document.documentElement)
          .getPropertyValue('--header-text-color')
          .trim()

        // Responsive label display
        let displayText = item.month
        if (this.screenSize === 'small' && displayText.length > 3) {
          displayText = displayText.substring(0, 3)
        }

        // Adjust label font size
        ctx.font = `${fontSize}px Arial`
        ctx.fillText(
          displayText,
          x + calculatedBarWidth / 2,
          canvas.height - this.paddingBottom + 15
        )
      })
    },

    getComputedColor(cssVariable: string): string {
      // Create a temporary element to resolve CSS variables
      const tempElement = document.createElement('div')
      tempElement.style.color = cssVariable
      document.body.appendChild(tempElement)
      const color = getComputedStyle(tempElement).color
      document.body.removeChild(tempElement)
      return color
    },

    roundRect(
      ctx: CanvasRenderingContext2D,
      x: number,
      y: number,
      width: number,
      height: number,
      radius: number
    ) {
      ctx.beginPath()
      ctx.moveTo(x + radius, y)
      ctx.lineTo(x + width - radius, y)
      ctx.quadraticCurveTo(x + width, y, x + width, y + radius)
      ctx.lineTo(x + width, y + height)
      ctx.lineTo(x, y + height)
      ctx.lineTo(x, y + radius)
      ctx.quadraticCurveTo(x, y, x + radius, y)
      ctx.closePath()
      ctx.fill()
    },

    onCanvasClick(event: MouseEvent) {
      const canvas = this.$refs.chartCanvas as HTMLCanvasElement
      if (!canvas || this.chartData.length === 0) return

      const rect = canvas.getBoundingClientRect()
      const x = event.clientX - rect.left
      const y = event.clientY - rect.top

      // Calculate bar width
      const availableWidth = canvas.width - this.responsivePaddingLeft - this.paddingRight
      const calculatedBarWidth = Math.min(
        this.responsiveBarWidth,
        (availableWidth - (this.chartData.length - 1) * this.responsiveBarSpacing) /
          this.chartData.length
      )

      // Check if click is within any bar
      for (let i = 0; i < this.chartData.length; i++) {
        const barX =
          this.responsivePaddingLeft + i * (calculatedBarWidth + this.responsiveBarSpacing)
        const barHeight =
          (this.chartData[i].amount * (canvas.height - this.paddingTop - this.paddingBottom)) /
          this.maxValue
        const barY = canvas.height - this.paddingBottom - barHeight

        if (
          x >= barX &&
          x <= barX + calculatedBarWidth &&
          y >= barY &&
          y <= canvas.height - this.paddingBottom
        ) {
          this.onBarClick(this.chartData[i])
          break
        }
      }
    },

    IsClickedItemSame(item: ChartDataItem) {
      if (this.clickedItem.amount === item.amount && this.clickedItem.month === item.month) {
        return true
      }
      return false
    },

    onBarClick(item: ChartDataItem) {
      if (this.showTooltip && this.IsClickedItemSame(item)) {
        // Hide tooltip
        this.showTooltip = false

        // Clear timeout if exists
        if (this.tooltipTimeout) {
          clearTimeout(this.tooltipTimeout)
          this.tooltipTimeout = null
        }

        // Set timeout to hide tooltipVisible after fade-out animation
        this.tooltipTimeout = window.setTimeout(() => {
          this.tooltipVisible = false
          this.tooltipTimeout = null
          // Reset clickedItem to default so the bar color returns
          this.clickedItem = { month: '', amount: 0 }
          this.drawChart()
        }, 300)
      } else {
        // If clicked a different bar
        if (!this.IsClickedItemSame(item)) {
          this.showTooltip = false
          this.tooltipVisible = false
        }

        this.showTooltip = true
        this.clickedItem = item

        if (this.tooltipTimeout) {
          clearTimeout(this.tooltipTimeout)
          this.tooltipTimeout = null
        }

        this.tooltipTimeout = window.setTimeout(() => {
          this.tooltipVisible = true
          this.tooltipTimeout = null
          this.drawChart()
        }, 20)
      }
    },

    updateScreenSize() {
      const width = window.innerWidth
      if (width < 480) {
        this.screenSize = 'small'
        this.canvasHeight = 150 // Shorter height on very small screens
      } else if (width < 768) {
        this.screenSize = 'medium'
        this.canvasHeight = 180 // Medium height on medium screens
      } else {
        this.screenSize = 'large'
        this.canvasHeight = 200 // Original height on large screens
      }

      if (this.$refs.chartCanvas) {
        const canvas = this.$refs.chartCanvas as HTMLCanvasElement
        canvas.height = this.canvasHeight
      }
    },

    handleResize() {
      if (this.$refs.chartCanvas) {
        const canvas = this.$refs.chartCanvas as HTMLCanvasElement
        const container = canvas.parentElement
        if (container) {
          this.canvasWidth = container.clientWidth
          canvas.width = this.canvasWidth
          this.updateScreenSize()
          this.drawChart()
        }
      }
    },
  },
  watch: {
    data: {
      handler() {
        this.$nextTick(() => {
          this.drawChart()
        })
      },
      deep: true,
    },
  },
  mounted() {
    // Set initial screen size
    this.updateScreenSize()

    // Add event listener for canvas clicks
    const canvas = this.$refs.chartCanvas as HTMLCanvasElement
    if (canvas) {
      canvas.addEventListener('click', this.onCanvasClick)

      // Set initial width
      const container = canvas.parentElement
      if (container) {
        this.canvasWidth = container.clientWidth
        canvas.width = this.canvasWidth
        canvas.height = this.canvasHeight
      }
    }

    // Set up resize observer
    this.observer = new ResizeObserver(this.handleResize)
    if (canvas && canvas.parentElement) {
      this.observer.observe(canvas.parentElement)
    }

    // Also listen to window resize for screen size changes
    window.addEventListener('resize', this.updateScreenSize)

    // Initial draw
    this.$nextTick(() => {
      this.drawChart()
    })
  },
  beforeUnmount() {
    // Remove event listeners
    const canvas = this.$refs.chartCanvas as HTMLCanvasElement
    if (canvas) {
      canvas.removeEventListener('click', this.onCanvasClick)
    }

    window.removeEventListener('resize', this.updateScreenSize)

    // Disconnect resize observer
    if (this.observer) {
      this.observer.disconnect()
    }

    // Clear any pending timeouts
    if (this.tooltipTimeout) {
      clearTimeout(this.tooltipTimeout)
      this.tooltipTimeout = null
    }
  },
}
</script>

<style lang="scss" scoped>
.data-chart-c {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  background-color: var(--background-color);
  width: 100%;
  height: auto;
  min-height: 150px;

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
  @keyframes fadeOut {
    from {
      opacity: 1;
    }
    to {
      opacity: 0;
    }
  }

  .top-section {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
    width: 100%;
    flex-wrap: wrap;
    gap: 0.5rem;

    .chart-title {
      font-weight: 500;
      font-size: 1.2rem;
      color: var(--header-text-color);
    }

    .data-information {
      padding: 0.4rem;
      font-size: 0.7rem;
      border-radius: var(--border-radius);
      color: white;

      &.fade-in {
        animation: fadeIn 0.3s ease;
      }
      &.fade-out {
        animation: fadeOut 0.3s ease;
      }
    }
  }

  .chart-area {
    position: relative;
    width: 100%;
    height: auto;

    canvas {
      display: block;
      width: 100%;
    }
  }

  @media (max-width: 768px) {
    padding: 0.5rem;

    .top-section {
      align-items: flex-start;
      margin-bottom: 0.7rem;

      .chart-title {
        font-size: 1rem;
        margin-bottom: 0.3rem;
      }

      .data-information {
        font-size: 0.65rem;
        padding: 0.5rem;
      }
    }
  }

  @media (max-width: 480px) {
    padding: 0.3rem;

    .top-section {
      margin-bottom: 0.5rem;

      .chart-title {
        font-size: 0.9rem;
      }
    }
  }
}
</style>
