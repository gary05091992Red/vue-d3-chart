<template>
  <div :style="`width:${width}%`">
    <div :id="id" class="positiveNegativeLine chartBase" />
    <slot name="legend" />
  </div>
</template>

<script>
import * as d3 from 'd3'
import mixinCharts from '@/components/Charts_modular/charts/mixins/mixinCharts'

export default {
  name: 'PositiveNegativeLine',
  mixins: [mixinCharts],

  props: {
    data: {
      type: Object,
      default() {
        return {
          name: [{ value: 0, time: new Date() }],
          name2: [{ value: 0, time: new Date() }],
        }
      },
    },

    padding: {
      type: Object,
      default() {
        return {}
      },
    },

    axis: {
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

    keys: {
      type: Array,
      default() {
        return []
      },
    },

    colors: {
      type: Array,
      default() {
        return []
      },
    },

    width: {
      type: Number,
      default() {
        return 100
      },
    },
  },

  data() {
    return {
      id: '',
      option: {
        padding: {
          top: 20,
          right: 10,
          bottom: 110,
          left: 0,
        },

        axis: {
          fontSize: 14,
          padding: 14,
          fontFamily: 'inherit',
          textAnchorX: 'middle',
          textAnchorY: 'end',
          fill: '#a09fa0',
          stroke: 'currentColor',
          strokeWidth: 1,
          opacity: 0.3,
          xAxisTimeFormat: '%Y / %m',
          axisType: 'segment', // every / segment
          ticks: 6,
          tickSize: 0,
        },

        tooltips: {
          open: true,
          top: 8,
          left: 8,
          right: 8,
          bottom: 0,
          fontSize: 12,
          textMargin: 5,
          minHeight: 72,
          minWidth: 168,
          dotRadius: 4,
          layoutMode: 'valueInTextMargin', // standards  valueInTextMargin
          showDate: true,
          dateMarginBottom: 16,
        },

        keys: [],
        colors: ['#00c756', '#ff0206'],
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
    setXAxis(allData, x, focus, height, width) {
      const vm = this
      const { id, data, option } = vm
      const { axis } = option
      const maxTime = d3.extent(allData, d => {
        return new Date(d.time)
      })[0]
      const minTime = d3.extent(allData, d => {
        return new Date(d.time)
      })[1]
      const middleTime = x.invert((x(minTime) + x(maxTime)) / 2)
      const {
        axisType,
        tickSize,
        xAxisTimeFormat,
        ticks,
        fontSize,
        fontFamily,
        textAnchorX,
        fill,
        stroke,
        strokeWidth,
        opacity,
      } = axis
      const axisTypeSegment = axisType === 'segment'
      const axisTypeEvery = axisType === 'every'
      const allValue = []
      allData.map(d => {
        allValue.push(new Date(d.time))
        return d
      })
      const xAxis = d3
        .axisBottom(x)
        .tickPadding(axis.padding)
        .tickSize(tickSize)
        .tickFormat(d3.timeFormat(xAxisTimeFormat))
      if (axisTypeSegment) {
        xAxis.ticks(ticks)
      }
      if (axisTypeEvery) {
        xAxis.ticks(data.length).tickValues(allValue)
      }
      if (vm.isSmallDevice()) {
        xAxis.tickValues([minTime, middleTime, maxTime])
      }
      focus
        .append('g')
        .attr('transform', `translate(0,${height})`)
        .call(xAxis)
        .attr('font-size', fontSize)
        .attr('font-family', fontFamily)
        .attr('text-anchor', textAnchorX)
        .attr('color', fill)
        .attr('fill', fill)
        .attr('class', 'axis axis--x')
        .append('line')
        .style('clip-path', `url(#${id}clip)`)
        .attr('x1', 0)
        .attr('y1', 0)
        .attr('x2', width)
        .attr('y2', 0)
        .attr('stroke', stroke)
        .attr('stroke-width', strokeWidth)
        .attr('opacity', opacity)
    },

    setYAxis(y, focus, height, width) {
      const vm = this
      const { id, option } = vm
      const { axis } = option
      const yAxis = d3.axisLeft(y).tickSizeInner(-width)
      const {
        fontSize,
        fontFamily,
        textAnchorY,
        fill,
        stroke,
        strokeWidth,
        opacity,
      } = axis
      focus
        .append('g')
        .attr('class', 'axis axis--y')
        .call(yAxis)
        .attr('font-size', fontSize)
        .attr('font-family', fontFamily)
        .attr('text-anchor', textAnchorY)
        .attr('color', fill)
        .attr('fill', fill)
        .append('line')
        .style('clip-path', `url(#${id}clip)`)
        .attr('x1', 0)
        .attr('y1', 0)
        .attr('x2', 0)
        .attr('y2', height)
        .attr('stroke', stroke)
        .attr('stroke-width', strokeWidth)
        .attr('opacity', opacity)

      focus.selectAll('.domain').attr('opacity', 0)
      const minorGridLineSetting = {
        stroke: '#BDBDBD',
        opacity: 0.3,
      }
      focus
        .select('.axis--y')
        .selectAll('.tick')
        .selectAll('line')
        .style('stroke', minorGridLineSetting.stroke)
        .style('opacity', minorGridLineSetting.opacity)
      // 畫0軸線 start
      focus
        .select('.axis--y')
        .append('line')
        .attr('class', 'domain')
        .style('clip-path', `url(#${id}clip)`)
        .attr('x1', 0)
        .attr('y1', y(0))
        .attr('x2', width)
        .attr('y2', y(0))
        .style('stroke', '#000000')
        .attr('stroke', `currentColor`)
      // 畫0軸線 end
      focus
        .select('.axis--y')
        .selectAll('text')
        .each(function replaceText() {
          const thisText = d3.select(this).text()
          d3.select(this).text(`${thisText}%`)
          if (Number(thisText) === 0) {
            d3.select(this).style('fill', '#000000')
          }
        })
    },

    // used in mixin
    // eslint-disable-next-line
    setOption() {
      const { option, keys, colors } = this
      const settooltips = this.tooltips
      const setpadding = this.padding
      const setaxis = this.axis
      option.tooltips = Object.assign(option.tooltips, settooltips)
      option.padding = Object.assign(option.padding, setpadding)
      option.axis = Object.assign(option.axis, setaxis)
      if (Array.isArray(keys) && keys.length !== 0) {
        option.keys = keys
      }
      if (Array.isArray(colors) && colors.length !== 0) {
        option.colors = colors
      }
    },

    // used in mixin
    // eslint-disable-next-line
    draw() {
      const vm = this
      const { id, data, option } = vm
      const { tooltips, padding, colors, keys } = option
      const showElTransitionTime = 0.1
      const allKey = Object.keys(data)
      const keyLen = allKey.length
      let allData = []
      for (let i = 0; i < keyLen; i += 1) {
        const key = allKey[i]
        allData = allData.concat(data[key])
      }
      /// ///////////////////*版面配置 start*/////////////////////////////
      const svg = d3
        .select(`#${id}`)
        .append('svg')
        .attr('width', document.querySelector(`#${id}`).offsetWidth)
        .attr('height', document.querySelector(`#${id}`).offsetHeight)
      /// ///////////////////*獲取padding 調整值 start*/////////////////////////////
      const maxValue = d3.max(allData, d => {
        return d.value
      })
      svg
        .append('text')
        .text(maxValue)
        .attr('class', 'getElWidth')
      const getElWidth = document
        .querySelector(`#${id}`)
        .querySelector('.getElWidth')
        .getBoundingClientRect().width
      svg.select('.getElWidth').remove()
      /// ///////////////////*獲取padding 調整值 end*/////////////////////////////
      let width
      let height
      let focus
      ;(function IIFE() {
        const { top, right, left, bottom } = padding
        const leftAdjustment = getElWidth > left ? getElWidth : left // 是否需要使用調整值
        width = +svg.attr('width') - leftAdjustment - right
        height = +svg.attr('height') - top - bottom
        focus = svg
          .append('g')
          .attr('class', 'focus')
          .attr('transform', `translate(${leftAdjustment},${top})`)
      })()
      /// ///////////////////*版面配置 end*/////////////////////////////
      /// ///////////////////*定義超出範圍隱藏的邊界 start*/////////////////////////////
      const translateTuning = -1
      focus
        .append('defs')
        .append('clipPath')
        .attr('transform', `translate(${translateTuning},${translateTuning})`)
        .attr('id', `${id}clip`)
        .append('rect')
        .attr('width', width + padding.right)
        .attr('height', height)
      /// ///////////////////*定義超出範圍隱藏的邊界 end*/////////////////////////////
      /// ///////////////////*定義全域比例尺 start */////////////////////////////
      const x = d3.scaleTime().range([0, width])
      const y = d3.scaleLinear().range([height, 0])
      const Ymin =
        d3.min(allData, d => {
          return d.value
        }) * 1.2
      const Ymax =
        d3.max(allData, d => {
          return d.value
        }) * 1.2
      x.domain(
        d3.extent(allData, d => {
          return new Date(d.time)
        }),
      )
      y.domain([Ymin, Ymax])
      /// ///////////////////*定義全域比例尺 end */////////////////////////////
      /// ///////////////////* 定義坐標軸 X start */////////////////////////////
      vm.setXAxis(allData, x, focus, height, width)
      /// ///////////////////* 定義坐標軸 X end */////////////////////////////
      /// ///////////////////* 定義坐標軸 Y start */////////////////////////////
      vm.setYAxis(y, focus, height, width)
      /// ///////////////////* 定義坐標軸 Y end */////////////////////////////
      /// ///////////////////* 數據呈現 製作資料元素及事件感應區 start */////////////////////////////

      const min = d3.min(allData, d => {
        return d.value
      })
      const alpha = d3.curveCatmullRom.alpha(0.5)
      const line = d3
        .line()
        .curve(alpha)
        .x(d => {
          return x(new Date(d.time))
        })
        .y(d => {
          return y(d.value)
        })

      const lineInitl = d3
        .line()
        .curve(alpha)
        .x(d => {
          return x(new Date(d.time))
        })
        .y(() => {
          return y(0)
        })

      focus
        .append('defs')
        .append('clipPath')
        .attr('transform', `translate(${-1},${-1})`)
        .attr('id', 'clip2')
        .append('rect')
        .attr('width', width)
        .attr('height', y(0))
      focus
        .append('defs')
        .append('clipPath')
        .attr('transform', `translate(${-1},${y(0)})`)
        .attr('id', 'clip3')
        .append('rect')
        .attr('width', width)
        .attr('height', height)
      // ======================================製作元素start================================================
      // 可以根據要呈現的效果不同更換不同元素 比如 換成 bar 或 area / line / circle 等等..

      const dataGroup = data[allKey[0]]

      focus
        .append('path')
        .datum(dataGroup)
        .attr('class', `lineInlineChart`)
      focus
        .append('path')
        .datum(dataGroup)
        .attr('class', `lineInlineChart2`)
      focus
        .selectAll(`.lineInlineChart`)
        .style('clip-path', 'url(#clip2)')
        .style('fill', 'transparent')
        .style('stroke', colors[0])
        .attr('d', lineInitl)
        .transition()
        .duration(500)
        .attr('d', line)
      focus
        .selectAll(`.lineInlineChart2`)
        .style('clip-path', 'url(#clip3)')
        .style('fill', 'transparent')
        .style('stroke', colors[1])
        .attr('d', lineInitl)
        .transition()
        .duration(500)
        .attr('d', line)

      // ======================================製作元素end================================================
      // 數據呈現 以下準備製作資料元素及事件感應區

      const dataElements = []
      const tooltipsModel = {}
      function makeTooltipModel() {
        allKey.map(key => {
          tooltipsModel[key] = '-'
          return tooltipsModel
        })
        tooltipsModel.time = '-'
      }
      makeTooltipModel()

      for (let i = 0; i < keyLen; i += 1) {
        const key = allKey[i]
        const subData = data[key]
        const subDataLen = subData.length
        for (let j = 0; j < subDataLen; j += 1) {
          if (i === 0) {
            const tooltipsModelCopy = JSON.parse(JSON.stringify(tooltipsModel))
            tooltipsModelCopy[key] = subData[j].value
            tooltipsModelCopy.time = subData[j].time
            dataElements.push(tooltipsModelCopy)
          }
          if (i !== 0) {
            const subEl = subData[j]
            const subElTime = subEl.time
            const isSameDate = element => element.time === subElTime // 找出兩組資料相同時間戳
            const index = dataElements.findIndex(isSameDate)
            const sameDateObj = dataElements[index]
            sameDateObj[key] = subEl.value
          }
        }
      }
      focus.append('g').attr('class', 'dataElements')
      focus
        .select('.dataElements')
        .selectAll('.subGroup')
        .data(dataElements)
        .enter()
        .append('g')
        .each(function createElememtsAndSensor(d) {
          const dataElementsLen = dataElements.length
          const rectWidth = width / dataElementsLen
          // ======================================製作元素start================================================
          // 可以根據要呈現的效果不同更換不同元素 比如 換成 bar 或 area / line / circle 等等..
          const Ypoint = []
          for (let j = 0; j < keyLen; j += 1) {
            const key = allKey[j]
            Ypoint.push(d[key])
          }
          d3.select(this)
            .append('line')
            .style('opacity', 0)
            .style('transition', `${showElTransitionTime}s ease`)
            .style('transition-property', `opacity`)
            .style('clip-path', `url(#${id}clip)`)
            .attr('x1', x(new Date(d.time)))
            .attr('y1', y(d3.max(Ypoint)))
            .attr('x2', x(new Date(d.time)))
            .attr('y2', y(min * 1.2))
            .attr('stroke', `#2d1341`)
          for (let j = 0; j < keyLen; j += 1) {
            const key = allKey[j]
            d3.select(this)
              .append('circle')
              .style('opacity', 0)
              .style('transition', `${showElTransitionTime}s ease`)
              .style('transition-property', `opacity`)
              .style('clip-path', `url(#${id}clip)`)
              .attr('fill', `#2d1341`)
              .attr('stroke', `${j === 0 ? '' : `rgba(74, 74, 74, 0.09)`}`)
              .attr('cx', x(new Date(d.time)))
              .attr('cy', y(d[key]))
              .attr('r', 8)
          }
          // ======================================製作元素end================================================
          /// ///////////////////* 製作tooltips sensor start */////////////////////////////
          d3.select(this)
            .append('rect')
            .attr('class', 'hoverZone')
            .style('clip-path', `url(#${id}clip)`)
            .attr('width', rectWidth / 2)
            .attr('x', x(new Date(d.time)) - rectWidth / 4)
            .attr('height', height)
            .style('fill', 'transparent')
          /// ///////////////////* 製作tooltips sensor end */////////////////////////////
        })
      /// ///////////////////* 數據呈現 製作資料元素及事件感應區 end */////////////////////////////
      /// ///////////////////* 製作tooltips start */////////////////////////////
      if (tooltips.open) {
        const {
          layoutMode,
          showDate,
          dateMarginBottom,
          textMargin,
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
          .style('clip-path', `url(#${id}clip)`)
          .attr('class', 'tooltips-rect')
          .attr('fill', '#272727')
          .attr('opacity', 0.6)
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
        let tooltipsHeight = fontSize * 2 + textMargin + top + bottom
        tooltipsHeight = tooltipsHeight < minHeight ? minHeight : tooltipsHeight

        tooltipsRect.attr('height', tooltipsHeight)
        const tooltipsDotRadius = dotRadius

        for (let i = 0; i < keyLen; i += 1) {
          let key = allKey[i]
          const textColor = '#ffffff'
          const nameClass = 'tooltipsName'
          const timeClass = 'tooltipsTime'
          const valueClass = 'tooltipsValue'
          const dotClass = 'tooltipsDot'
          const dotCY = top - fontSize / 4
          const margin = i !== 0 ? textMargin * i : 0
          const fontStack = fontSize * (i + 1)
          const paddinMarginStack = top + margin
          let valueInTextMarginModePosition = 0
          if (keys.length !== 0 && keys[i]) {
            key = keys[i]
          }
          let DateTextHeight = 0
          if (showDate && i === 0) {
            eltooltips
              .append('text')
              .attr('class', timeClass)
              .attr('font-size', fontSize)
              .attr('x', left)
              .attr('y', fontStack + paddinMarginStack)
              .attr('fill', textColor)
              .text('-/-/-')
          }
          if (showDate) {
            DateTextHeight =
              (fontSize + textMargin) * (i + 1) + dateMarginBottom
          }
          if (layoutMode === 'valueInTextMargin') {
            valueInTextMarginModePosition = textMargin / 2 + fontSize
          }
          eltooltips
            .append('circle')
            .attr('class', dotClass)
            .attr('fill', `#2d1341`)
            .attr('r', tooltipsDotRadius)
            .attr('cx', 0 + left + tooltipsDotRadius * 2)
            .attr('cy', fontStack + dotCY + margin + DateTextHeight)
          eltooltips
            .append('text')
            .attr('class', nameClass)
            .attr('font-size', fontSize)
            .attr('x', 0 + left + tooltipsDotRadius * 2 * 2)
            .attr('y', fontStack + paddinMarginStack + DateTextHeight)
            .attr('fill', textColor)
            .text(key)
          eltooltips
            .append('text')
            .attr('class', valueClass)
            .attr('font-size', fontSize)
            .attr('x', 0 + minWidth - right)
            .attr(
              'y',
              fontStack +
                paddinMarginStack +
                valueInTextMarginModePosition +
                DateTextHeight,
            )
            .attr('fill', textColor)
            .attr('text-anchor', 'end')
            .text('')
        }

        svg.selectAll('.hoverZone').on('mousemove', function trigger(event) {
          // d3.event ^5.15.0
          // event ^6.1.1
          const e = event
          const thisData = d3.select(this).data()[0]
          const thisEl = document.querySelector(`#${id}`)
          const thisToolTips = thisEl.querySelector(`.tooltips`)
          const thisToolTipsWidth = thisToolTips.getBoundingClientRect().width
          const elWidth = thisEl.getBoundingClientRect().width
          const elheight = thisEl.getBoundingClientRect().height
          const elLeft = thisEl.getBoundingClientRect().left // 元素到左側距離
          const hoverPointPosition = x(new Date(d3.select(this).data()[0].time))
          const isOverHalf = hoverPointPosition > elWidth / 2
          const ttpadding = left + right
          const tooltipsTime = svg.select('.tooltipsTime')
          const date = new Date(thisData.time)
          const formateDate = d3.timeFormat('%d')
          const formateYear = d3.timeFormat('%Y')
          const formateMonth = d3.timeFormat('%m')
          const dateStr = `${formateDate(date)} / ${formateMonth(
            date,
          )}  ${formateYear(date)}`
          tooltipsTime.text(dateStr)
          const p = Math.max(0, d3.precisionFixed(0.01))
          const f = d3.format(`.${p}%`)
          function getX() {
            return (
              e.x -
              elLeft -
              2 * ttpadding -
              (isOverHalf ? thisToolTipsWidth + 2 * ttpadding : 0)
            )
          }
          eltooltips.attr('transform', `translate(${getX()},${elheight / 4})`)

          // 寫入新值
          eltooltips.selectAll('.tooltipsValue').each(function setValue(d, i) {
            const key = allKey[i]
            d3.select(this).text(f(thisData[key] / 100))
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
              const autoWidth =
                valueFontsLength + nameFontsLength + dot + ttpadding
              if (minWidth >= autoWidth) {
                svg.selectAll('.tooltipsValue').attr('x', 0 + minWidth - right)
                return minWidth
              }
              svg
                .selectAll('.tooltipsValue')
                .attr('x', 0 + autoWidth - right + textMargin)
              return autoWidth + textMargin
            })
          // 高度重新調整
          eltooltips
            .select('.tooltips-rect')
            .attr('height', function getTooltipWidth() {
              const elId = document.getElementById(id)
              const eltooltipsName = elId.querySelector(`.tooltipsName`)
              const eltooltipsTime = elId.querySelector(`.tooltipsTime`)
              const nameTextHeight = eltooltipsName.getBoundingClientRect()
                .height
              const timeTextHeight = eltooltipsTime.getBoundingClientRect()
                .height
              const tooltipsTopBottom = bottom + top
              let DateTextHeight = 0
              const scale = keyLen * 1.5
              let valueInTextMarginAdjustment = 0
              if (showDate) {
                DateTextHeight =
                  timeTextHeight + textMargin + fontSize + dateMarginBottom
              }
              if (layoutMode === 'valueInTextMargin') {
                valueInTextMarginAdjustment = textMargin
              }
              const allMargin = scale * textMargin
              const allnameTextHeight = (scale + 1) * nameTextHeight
              const autoHeight =
                allMargin +
                tooltipsTopBottom +
                allnameTextHeight +
                DateTextHeight +
                valueInTextMarginAdjustment
              if (autoHeight >= minHeight) {
                return autoHeight
              }
              return minHeight
            })
          // 顯示元素

          const circles = d3.select(this.parentNode).selectAll('circle')
          const hoverLine = d3.select(this.parentNode).select('line')
          eltooltips.style('opacity', 1)
          circles.style('opacity', 1)
          hoverLine.style('opacity', 1)
        })
        svg.selectAll('.hoverZone').on('mouseleave', function trigger() {
          const circles = d3.select(this.parentNode).selectAll('circle')
          const hoverLine = d3.select(this.parentNode).select('line')
          eltooltips.style('opacity', 0)
          circles.style('opacity', 0)
          hoverLine.style('opacity', 0)
        })
      }
      /// ///////////////////* 製作tooltips end */////////////////////////////
    },
  },
}
</script>
