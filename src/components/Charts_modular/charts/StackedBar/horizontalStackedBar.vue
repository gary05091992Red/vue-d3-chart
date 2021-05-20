<template>
  <div :id="id" class="horizontalStackedBar" />
</template>

<script>
import * as d3 from 'd3'
import mixinCharts from '@/components/Charts_modular/charts/mixins/mixinCharts'

export default {
  name: 'HorizontalStackedBar',
  mixins: [mixinCharts],

  props: {
    data: {
      type: Array,
      default() {
        return [
          {
            value: 20.118,
            name: '2015-06-09T17:05:00',
          },
        ]
      },
    },

    padding: {
      type: Object,
      default() {
        return {}
      },
    },

    tooltips: {
      type: Object,
      default() {
        return {}
      },
    },
  },

  data() {
    return {
      id: '',
      option: {
        padding: {
          top: 20,
          right: 15,
          bottom: 0,
          left: 15,
        },

        tooltips: {
          open: true,
          top: 8,
          left: 8,
          right: 8,
          bottom: 8,
          fontSize: 12,
          minHeight: 0,
          minWidth: 0,
          dotRadius: 4,
        },
      },
    }
  },

  mounted() {
    this.id = this.makeid()
    this.$nextTick(() => {
      this.throttle(this.init, true)
    })
  },

  methods: {
    // used in mixin
    // eslint-disable-next-line
    setOption() {
      const { option } = this
      const settooltips = this.tooltips
      const setpadding = this.padding
      option.tooltips = Object.assign(option.tooltips, settooltips)
      option.padding = Object.assign(option.padding, setpadding)
    },

    // used in mixin
    // eslint-disable-next-line
    draw() {
      const vm = this
      const { id, data, option } = vm
      const { padding, tooltips } = option
      const showElTransitionTime = 0.1
      // 加總元素去除負數 end
      /// ///////////////////*版面配置*/////////////////////////////
      const svg = d3
        .select(`#${id}`)
        .append('svg')
        .attr('width', document.querySelector(`#${id}`).offsetWidth)
        .attr('height', document.querySelector(`#${id}`).offsetHeight)

      let width
      let height
      let focus
      ;(function IIFE() {
        const { top, right, left, bottom } = padding
        width = +svg.attr('width') - left - right
        height = +svg.attr('height') - top - bottom
        focus = svg
          .append('g')
          .attr('class', 'focus')
          .attr('transform', `translate(${left},${top})`)
      })()

      /// ///////////////////*定義超出範圍隱藏的邊界*/////////////////////////////
      const translateTuning = 0
      focus
        .append('defs')
        .append('clipPath')
        .attr('transform', `translate(${translateTuning},${translateTuning})`)
        .attr('id', `${id}clip`)
        .append('rect')
        .attr('width', width)
        .attr('height', height)

      /// ///////////////////*定義全域比例尺 定義坐標軸*/////////////////////////////
      const y = d3.scaleLinear().range([0, height])
      const x = d3.scaleLinear().range([0, width])

      x.domain([
        0,
        d3.max(data, d => {
          return d.value
        }),
      ])
      y.domain([0, height])

      // 數據呈現 以下準備製作資料元素及事件感應區

      const sum = this.SumDataMapReduce(data)
      focus.append('g').attr('class', 'dataElements')
      focus
        .select('.dataElements')
        .selectAll('.subGroup')
        .data(data)
        .enter()
        .append('g')
        .each(function createElememtsAndSensor(d, i) {
          // ======================================製作元素start================================================
          // 可以根據要呈現的效果不同更換不同元素 比如 換成 bar 或 area / line / circle 等等..
          const { top, bottom } = tooltips // standards  valueInTextMargin
          const tooltipHeight = height + bottom + top
          const widthSumArr = []
          let widthSum = 0
          if (i !== 0) {
            for (let j = 0; i - 1 >= j; j += 1) {
              const previousWidth = (data[j].value / sum) * width
              widthSumArr.push(previousWidth)
            }
            widthSum = widthSumArr.reduce((a, b) => a + b)
          }
          // The top-left corner is ⟨x,y⟩.
          function rightRoundedRect(px, py, pwidth, pheight, radius) {
            return `M${px},${py}h${pwidth - radius}a${radius},${radius} 0 0 1 ${radius},${radius}v${pheight - 2 * radius}a${radius},${radius} 0 0 1 ${-radius},${radius}h${radius - pwidth}z`
          }
          const leftRoundedRect = (px, py, pwidth, pheight, radius) => {
            return `M${px + radius},${py}h${pwidth -
              radius}v${pheight}h${radius -
              pwidth}a${radius},${radius} 0 0 1 ${-radius},${-radius}v${2 *
              radius -
              pheight}a${radius},${radius} 0 0 1 ${radius},${-radius}z`
          }
          const thisWtdth = (d.value / sum) * width
          const radius = height / 2
          const isFirst = i === 0
          const isLast = data.length - 1 === i
          let pathD = ''
          let hoverZonePathD = ''
          if (isFirst) {
            pathD = leftRoundedRect(0, 0, thisWtdth, height, radius)
          }
          if (isLast) {
            pathD = rightRoundedRect(widthSum, 0, thisWtdth, height, radius)
          }
          if (!isFirst && !isLast) {
            pathD = rightRoundedRect(widthSum, 0, thisWtdth, height, 0)
          }
          if (isFirst) {
            hoverZonePathD = leftRoundedRect(0, 0, thisWtdth, tooltipHeight, 0)
          }
          if (isLast) {
            hoverZonePathD = rightRoundedRect(
              widthSum,
              0,
              thisWtdth,
              tooltipHeight,
              0,
            )
          }
          if (!isFirst && !isLast) {
            hoverZonePathD = rightRoundedRect(
              widthSum,
              0,
              thisWtdth,
              tooltipHeight,
              0,
            )
          }
          svg
            .select(`#${id}clip`)
            .select('rect')
            .attr('rx', radius)
          d3.select(this)
            .append('path')
            .attr('class', 'stackedbBar')
            .style('clip-path', `url(#${id}clip)`)
            .style('fill', d.color)
            .attr('d', pathD)
          // ======================================製作元素end================================================
          // 製作tooltips sensor start
          d3.select(this)
            .append('path')
            .attr('class', 'hoverZone')
            .style('fill', 'transparent')
            .attr('d', hoverZonePathD)

          // 製作tooltips sensor end
        })
      // 以下準備製作 tooltips
      if (tooltips.open) {
        const {
          top,
          left,
          bottom,
          right,
          minWidth,
          minHeight,
          dotRadius,
          fontSize,
        } = tooltips // standards  valueInTextMargin
        focus
          .append('g')
          .attr('class', 'tooltips')
          .style('opacity', 0)
          .style('transition', `${showElTransitionTime}s ease`)
          .style('transition-property', `opacity`)
          .attr('transform', `translate(0,0)`)
          .style('pointer-events', 'none')
          .append('rect')
          .attr('class', 'tooltips-rect')
          .attr('fill', '#ebedee')
          .attr('opacity', 1)
          .attr('width', minWidth)
          .attr('height', minHeight)
          .attr('x', 0)
          .attr('y', 0)
          .attr('rx', 4)
          .attr('ry', 4)
        const eltooltips = svg.select('.tooltips')
        const tooltipsRect = eltooltips.select('rect')
        eltooltips
          .style('opacity', 0)
          .style('transition', `${showElTransitionTime}s ease`)
          .style('transition-property', `opacity`)
        let tooltipsHeight = fontSize * 2 + top + bottom
        tooltipsHeight = tooltipsHeight < minHeight ? minHeight : tooltipsHeight

        tooltipsRect.attr('height', tooltipsHeight)
        const tooltipsDotRadius = dotRadius

        const textColor = '#414042'
        const nameClass = 'tooltipsName'
        const valueClass = 'tooltipsValue'
        const dotClass = 'tooltipsDot'
        const dotCY = top - fontSize / 4
        const margin = 0
        const circleColor = ''
        const fontStack = fontSize
        const paddinMarginStack = top + margin
        eltooltips
          .append('circle')
          .attr('class', dotClass)
          .attr('fill', circleColor)
          .attr('r', tooltipsDotRadius)
          .attr('cx', 0 + left + tooltipsDotRadius * 2)
          .attr('cy', fontStack + dotCY + margin)
        eltooltips
          .append('text')
          .attr('class', nameClass)
          .attr('font-size', 12)
          .attr('x', 0 + left + tooltipsDotRadius * 2 * 2)
          .attr('y', fontStack + paddinMarginStack)
          .attr('fill', textColor)
          .text('')
        eltooltips
          .append('text')
          .attr('class', valueClass)
          .attr('font-size', 12)
          .attr('x', 0 + minWidth - right)
          .attr('y', fontStack + paddinMarginStack)
          .attr('fill', textColor)
          .attr('text-anchor', 'end')
          .text('')

        svg.selectAll('.hoverZone').on('mousemove', function trigger(event) {
          // d3.event ^5.15.0
          // event ^6.1.1
          const e = event
          const thisEl = document.querySelector(`#${id}`)
          const thisToolTips = thisEl.querySelector(`.tooltips`)
          const thisToolTipsWidth = thisToolTips.getBoundingClientRect().width
          const elWidth = thisEl.getBoundingClientRect().width
          const elLeft = thisEl.getBoundingClientRect().left // 元素到左側距離
          const hoverPointPosition = e.x - elLeft
          const isOverHalf = hoverPointPosition > (elWidth - right - left) / 2

          const ttpadding = left + right
          const getData = d3.select(this).data()[0]
          function getX() {
            return (
              e.x -
              elLeft -
              (isOverHalf ? thisToolTipsWidth + 2 * ttpadding : 0)
            )
          }
          eltooltips.attr(
            'transform',
            `translate(${getX()},${0 - padding.top})`,
          )

          // 寫入新值
          eltooltips.selectAll('.tooltipsValue').each(function setValue() {
            const { value } = getData
            d3.select(this).text(`${vm.gotPercent(value)} %`)
          })
          eltooltips.selectAll('.tooltipsName').each(function setValue() {
            const { name } = getData
            d3.select(this).text(name)
          })
          eltooltips
            .selectAll('.tooltipsDot')
            .style('fill', function setColor() {
              const { color } = getData
              return color
            })
          // 寬度重新調整
          eltooltips
            .select('.tooltips-rect')
            .attr('width', function getTooltipWidth() {
              const elId = document.getElementById(id)
              const alltooltipsName = elId.querySelectorAll(`.tooltipsName`)
              const alltooltipsValue = elId.querySelectorAll(`.tooltipsValue`)
              const nameFontsLength = d3.max(alltooltipsName, d => {
                return d.getBoundingClientRect().width
              })
              const valueFontsLength = d3.max(alltooltipsValue, d => {
                return d.getBoundingClientRect().width
              })
              const dot = tooltipsDotRadius * 2
              const textValueMargin = 15
              const autoWidth =
                valueFontsLength +
                nameFontsLength +
                dot * 2 +
                ttpadding +
                textValueMargin
              if (minWidth >= autoWidth) {
                svg.selectAll('.tooltipsValue').attr('x', 0 + minWidth - right)
                return minWidth
              }
              svg.selectAll('.tooltipsValue').attr('x', 0 + autoWidth - right)
              return autoWidth
            })
          // 高度重新調整
          eltooltips
            .select('.tooltips-rect')
            .attr('height', function getTooltipWidth() {
              const elId = document.getElementById(id)
              const eltooltipsName = elId.querySelector(`.tooltipsName`)
              const nameTextHeight = eltooltipsName.getBoundingClientRect()
                .height
              const tooltipsTopBottom = bottom + top
              const autoHeight = tooltipsTopBottom + nameTextHeight
              if (autoHeight >= minHeight) {
                return autoHeight
              }
              return minHeight
            })
          // 顯示元素

          eltooltips.style('opacity', 1)
        })
        svg.selectAll('.hoverZone').on('mouseleave', function trigger() {
          eltooltips.style('opacity', 0)
        })
      }
    },
  },
}
</script>
