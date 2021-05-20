<template>
  <div>
    <div :id="id" class="Pie chartBase" />
    <slot name="legend" />
  </div>
</template>

<script>
import * as d3 from 'd3'
import mixinCharts from '@/components/Charts_modular/charts/mixins/mixinCharts'
// import chroma from 'chroma-js'

export default {
  name: 'Pie',
  mixins: [mixinCharts],
  props: {
    data: {
      type: Array,
      default() {
        return []
      },
    },

    tooltips: {
      type: Object,
      default() {
        return {}
      },
    },

    ringScale: {
      type: Number,
      default: 0,
    },

    scale: {
      type: Number,
      default: 0.7,
    },

    labelFontSize: {
      type: Number,
      default: 12,
    },

    labelBreak: {
      type: Boolean,
      default: true,
    },

    strokeWidth: {
      type: Number,
      default: 3,
    },

    initAnimation: {
      type: Boolean,
      default: true,
    },

    // use it in mixin
    // eslint-disable-next-line
    animationName: {
      type: String,
      default: 'pieAnimation',
    },

    initAnimationDuration: {
      type: Number,
      default: 1000,
    },

    reInitPending: {
      type: Number,
      default: 300,
    },

    stroke: {
      type: String,
      default: '#fefefe',
    },

    needCornerRadius: {
      type: Boolean,
      default: false,
    },

    ascending: {
      type: Boolean,
      default: false,
    },

    arcStyle: {
      type: String,
      default: 'standard', // standard cornerRadiusOverlapDonut
    },

    centerInfoDisplay: {
      type: Boolean,
      default: true,
    },

    centerInfoOption: {
      type: Object,
      default() {
        return {}
      },
    },

    linearGradient: {
      type: Object,
      default() {
        return {}
      },
    },

    labelsDisplay: {
      type: Boolean,
      default: true,
    },
  },

  data: () => ({
    // eslint-disable-next-line
    type: 'pie',
    id: '',
    option: {
      tooltips: {
        open: true,
        top: 16,
        left: 16,
        right: 16,
        bottom: 16,
        fontSize: 12,
        textMargin: 5,
        minHeight: 72,
        minWidth: 168,
      },

      centerInfoOption: {
        circleScale: 0.8,
        circleBackground: '#0b001c',
        fontSize: 12,
        color: '#ffffff',
        text: 'text here !',
      },

      linearGradient: {
        open: false, // Boolean
        startFrom: 60, // 0~100
        endFrom: 100, // 0~100
      },
    },

    dataSorted: [],
    focusArc: '',
    hoverArc: '',
    acrFn: {},
    pieFn: {},
  }),

  mounted() {
    this.preprocessingPie()
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
      const setlinearGradient = this.linearGradient
      const setcenterInfoOption = this.centerInfoOption
      option.tooltips = Object.assign(option.tooltips, settooltips)
      option.linearGradient = Object.assign(
        option.linearGradient,
        setlinearGradient,
      )
      option.centerInfoOption = Object.assign(
        option.centerInfoOption,
        setcenterInfoOption,
      )
    },

    cornerRadiusDonut(svg) {
      const vm = this
      const {
        data,
        acrFn,
        ascending,
        pieFn,
        initAnimation,
        initAnimationDuration,
        option,
      } = vm
      const { length } = data
      for (let i = 0; i < length + 1; i += 1) {
        const lastIndex = length - 1
        const reverseIndex = lastIndex - i
        const isLastArc = i === length
        const g = svg
          .append('g')
          .attr('class', 'arcGroupForStyle')
          .selectAll('.arc2')
          .data(pieFn(data))
          .enter()
          .append('g')
          .attr('class', 'arc2')
          .style('pointer-events', 'none')
        g.append('path')
          .attr('d', acrFn)
          .attr('class', 'arcPath2')
          .attr('opacity', '1')
          .style('cursor', 'pointer')
          .style('fill', function setColor(d) {
            const { open } = option.linearGradient
            const comparisonOfIndex = isLastArc ? lastIndex : reverseIndex
            const conditionInMatch = d.index === comparisonOfIndex
            const linearGradientFill = conditionInMatch
              ? `url(#${vm.id}linearGradientIndex${d.index})`
              : 'transparent'
            const colorFill = conditionInMatch ? d.data.color : 'transparent'
            return open ? linearGradientFill : colorFill
          })
          .each(function getArc() {
            // 基本樣式動畫
            d3.select(this)
              .transition()
              .duration(initAnimation ? initAnimationDuration : 0) // 關閉動畫此值為0
              .attrTween('d', function setInterpolate(d) {
                const copyd = JSON.parse(JSON.stringify(d))
                let { endAngle } = copyd
                const adjustment = 0.2
                if (isLastArc) {
                  copyd.startAngle = ascending
                    ? (copyd.startAngle -= adjustment)
                    : (copyd.startAngle += adjustment)
                }
                copyd.endAngle = ascending
                  ? (endAngle -= adjustment)
                  : (endAngle += adjustment)
                const interpolate = d3.interpolate(
                  {
                    startAngle: 0,
                    endAngle: 0,
                  },
                  copyd,
                )
                return function triggerInterpolate(t) {
                  return acrFn(interpolate(t))
                }
              })
          })
      }
    },

    // used in mixin
    // eslint-disable-next-line
    draw() {
      const vm = this
      const {
        initAnimationDuration,
        needCornerRadius,
        ringScale,
        scale,
        ascending,
        labelFontSize,
        labelBreak,
        cornerRadiusDonut,
        initAnimation,
        arcStyle,
        centerInfoDisplay,
        labelsDisplay,
        option,
      } = vm // 進場動畫持續時間 結束後掛載事件的延遲時間

      if (!document.querySelector(`#${vm.id}`)) {
        return
      }
      const width = document.querySelector(`#${vm.id}`).offsetWidth
      const height = document.querySelector(`#${vm.id}`).offsetHeight
      let textAnchorScale = 1.1
      let totalScale = scale
      if (vm.isSmallDevice()) {
        totalScale = 0.5
        textAnchorScale = 1.3
      }
      const radius =
        width >= height ? (height * totalScale) / 2 : (width * totalScale) / 2 // 半徑
      const data = vm.dataSorted
      if (data.length === 0) {
        console.log('data length is 0')
        return
      }
      if (width === 0) {
        console.log('Please,Set width property of value in wrapper element')
        return
      }
      if (height === 0) {
        console.log('Please,Set height property of value in wrapper element')
        return
      }
      const innerRadius = radius * ringScale
      const outerRadius = radius
      const arc = d3
        .arc() // 圓弧初始
        .innerRadius(innerRadius) // 小圈半徑
        .outerRadius(outerRadius)
        .cornerRadius(needCornerRadius ? radius : 0) // 大圈半徑
      vm.acrFn = arc // methods 使用
      const arc2 = d3
        .arc() // 圓弧初始
        .innerRadius(innerRadius * textAnchorScale) // 小圈半徑
        .outerRadius(outerRadius * textAnchorScale)
        .cornerRadius(needCornerRadius ? radius : 0) // 大圈半徑
      const pie = d3
        .pie()
        .sort(null)
        .value(function setValue(d) {
          return d.value
        })
        // .startAngle(0).endAngle(-Math.PI*2);//設定pie總弧度 逆時針
        .startAngle(0)
        .endAngle(ascending ? -Math.PI * 2 : Math.PI * 2) // 設定pie總弧度 順時針
      vm.pieFn = pie // methods 使用
      const el = d3.select(`#${vm.id}`)
      const svg = el
        .append('svg')
        .attr('class', 'svg')
        .attr('width', width)
        .attr('height', height)
        .append('g')
        .attr('class', 'group')
        .attr('transform', `translate(${width / 2},${height / 2})`)
      svg
        .append('rect')
        .attr('class', 'mouseLeaveSensor')
        .attr('width', width * 2)
        .attr('height', height * 2)
        .attr('x', -width)
        .attr('y', -height)
        .attr('fill', 'transparent')
      const g = svg
        .append('g')
        .attr('class', 'arcGroup')
        .selectAll('.arc')
        .data(pie(data))
        .enter()
        .append('g')
        .attr('class', 'arc')
      //  arcGroupForStyle

      // 製作文字定位點 start製作文字定位點 start製作文字定位點 start製作文字定位點 start
      function getDistance(a, b) {
        const xd = Math.floor(a.x - b.x)
        const yd = Math.floor(a.y - b.y)
        const d = Math.floor(Math.sqrt(xd * xd + yd * yd))
        return d
      }
      function setLabelAndCoordinate(arr, isLeft, textSpace, coordinateData) {
        const ringScalIsLess = ringScale < scale
        const calcFn = ringScalIsLess ? scale : 0.5
        const origniScale = 1
        const doubleScale = 2 * (ringScale ? calcFn : 1)
        const anchorScale = 2.3 * (ringScale ? calcFn : 1)
        for (let i = 0; i < arr.length; i += 1) {
          const element = arr[i]
          if (element) {
            const bindingData = {
              name: element.data.name,
              value: element.data.value,
              color: element.data.color,
              index: i,
            }
            const allDist = []
            const couldUse = []
            textSpace.forEach(item => {
              allDist.push(getDistance(item, element))
              if (element.x <= 0 && item.x <= 0) {
                couldUse.push(getDistance(item, element))
              }
              if (element.x > 0 && item.x > 0) {
                couldUse.push(getDistance(item, element))
              }
            })

            const couldUseMin = Math.min(...couldUse)

            const spaceIndex = allDist.indexOf(couldUseMin)
            const thisTextSpace = textSpace[spaceIndex]
            thisTextSpace.textSpace = bindingData
            el.selectAll('.arc').each(function setLabel(d, j) {
              const condition = isLeft
                ? coordinateData.length - 1 - i === j
                : i === j
              if (condition) {
                d3.select(this)
                  .append('text')
                  .attr('class', 'arcText')
                  .attr('opacity', '1')
                  .text(
                    `${bindingData.name} ${
                      labelBreak ? '' : `${vm.gotPercent(bindingData.value)}%`
                    } `,
                  )
                  .attr(
                    'x',
                    thisTextSpace.x >= 0
                      ? thisTextSpace.x + 10
                      : thisTextSpace.x - 10,
                  )
                  .attr('y', thisTextSpace.y - (labelBreak ? labelFontSize : 0))
                  .attr('text-anchor', thisTextSpace.textAnchor)
                  .attr('font-size', labelFontSize)
                if (labelBreak) {
                  d3.select(this)
                    .append('text')
                    .attr('class', 'arcText')
                    .attr('opacity', '1')
                    .text(`${vm.gotPercent(bindingData.value)} %`)
                    .attr(
                      'x',
                      thisTextSpace.x >= 0
                        ? thisTextSpace.x + 10
                        : thisTextSpace.x - 10,
                    )
                    .attr('y', thisTextSpace.y + labelFontSize / 2)
                    .attr('text-anchor', thisTextSpace.textAnchor)
                    .attr('font-size', labelFontSize)
                }
                d3.select(this)
                  .append('path')
                  .attr('stroke', bindingData.color)
                  .attr('fill', 'transparent')
                  .attr('class', 'connectionLine')
                  .style('stroke-width', '1px')
                  .attr('opacity', '1')
                  .style('pointer-events', 'none')
                  .attr('d', function setCoordinates(d2) {
                    const x0 = arc.centroid(d2)[0] * origniScale
                    const y0 = arc.centroid(d2)[1] * origniScale
                    const x1 = arc.centroid(d2)[0] * doubleScale
                    const y1 = arc.centroid(d2)[1] * doubleScale
                    const x2 = arc.centroid(d2)[0] * anchorScale
                    const y2 = arc.centroid(d2)[1] * anchorScale
                    const x3 = textSpace[spaceIndex]
                      ? textSpace[spaceIndex].x
                      : x2
                    const y3 = textSpace[spaceIndex]
                      ? textSpace[spaceIndex].y
                      : y2

                    const path = d3.path()
                    path.moveTo(x0, y0)
                    path.lineTo(x1, y1)
                    path.quadraticCurveTo(x2, y2, x3, y3 - labelFontSize / 2)
                    return path.toString()
                  })
              }
            })

            textSpace.splice(spaceIndex, 1)
          }
        }
      }
      if (labelsDisplay) {
        let anchorData = []
        // 先求要放幾個文字
        const anchorQuantity =
          Math.floor(
            (textAnchorScale * 2 * radius) /
              (labelFontSize * (labelBreak ? 2 : 1)),
          ) * 2

        for (let i = 1; i <= anchorQuantity; i += 1) {
          anchorData.push({ index: i, color: '#000000', value: 1 })
        }
        anchorData = anchorData.sort(function sortFn(a, b) {
          return b - a
        })

        const gTextAnchor = svg
          .append('g')
          .attr('class', 'textAnchorGroup')
          .attr('style', 'pointer-events: none')
          .selectAll('.textAnchor')
          .data(pie(anchorData))
          .enter()
          .append('g')
          .attr('class', 'textAnchor')
        gTextAnchor
          .append('path')
          .attr('d', arc2)
          .attr('class', 'textAnchorPath')
          .attr('opacity', 0)
          .style('fill', function setColor(d) {
            return d.data.color
          })
          .style('stroke', function setStroke() {
            return vm.stroke
          })
          .style('stroke-width', function setStrokeWidth() {
            return vm.strokeWidth
          })
        const allArc = el.selectAll('.arc')
        const allTextAnchor = el.selectAll('.textAnchor')
        const ringScalIsLess = ringScale < scale
        const calcFn = ringScalIsLess ? scale : 0.5
        const coordinateData = []
        const textSpace = []
        const anchorScale = 2.3 * (ringScale ? calcFn : 1)
        allArc.each(d => {
          const x = arc.centroid(d)[0] * anchorScale
          const y = arc.centroid(d)[1] * anchorScale
          const copy = JSON.parse(JSON.stringify(d))
          copy.x = x
          copy.y = y
          copy.raw = data[d.index]
          coordinateData.push(copy)
        })
        allTextAnchor.each(d => {
          const x = arc2.centroid(d)[0] * anchorScale
          const y = arc2.centroid(d)[1] * anchorScale
          const copy = JSON.parse(JSON.stringify(d))
          copy.x = x
          copy.y = y
          copy.textSpace = {}
          copy.textAnchor = x <= 0 ? 'end' : 'start'
          textSpace.push(copy)
        })
        coordinateData.sort(function sortFn(a, b) {
          return ascending ? a.index - b.index : b.index - a.index
        })

        // const textSpaceIsEnough = textSpace.length >= coordinateData.length
        const dataPutInLeftSpace = []
        const dataPutInRightSpace = []
        for (let i = 0; i < coordinateData.length; i += 1) {
          const element = coordinateData[i]
          if (element.x < 0) {
            dataPutInLeftSpace.push(element)
          }
          if (element.x >= 0) {
            dataPutInRightSpace.push(element)
          }
        }

        const textSpaceIsEnoughLeft =
          dataPutInLeftSpace.length <= textSpace.length / 2
        const textSpaceIsEnoughRight =
          dataPutInRightSpace.length <= textSpace.length / 2

        if (!textSpaceIsEnoughLeft) {
          const exuTimes = dataPutInLeftSpace.length - textSpace.length / 2
          for (let i = 0; i < exuTimes; i += 1) {
            dataPutInLeftSpace.splice(1 + i, 1, false)
          }
        }
        if (!textSpaceIsEnoughRight) {
          const exuTimes = dataPutInRightSpace.length - textSpace.length / 2
          for (let i = 0; i < exuTimes; i += 1) {
            dataPutInRightSpace.splice(1 + i, 1, false)
          }
        }

        setLabelAndCoordinate(
          dataPutInLeftSpace,
          !ascending,
          textSpace,
          coordinateData,
        )
        setLabelAndCoordinate(
          dataPutInRightSpace.reverse(),
          !!ascending,
          textSpace,
          coordinateData,
        )
      }

      // 製作文字定位點 end製作文字定位點 end製作文字定位點 end製作文字定位點 end
      // 生成圓弧實體 : 互動動畫遮蓋用 start
      g.append('path')
        .attr('d', arc)
        .style('fill', () => {
          return '#ffffff'
        })
      // 生成圓弧實體 : 互動動畫遮蓋用 end
      // 生成圓弧實體 : 最後畫面呈現 start
      g.append('path')
        .attr('d', arc)
        .attr('class', 'arcPath')
        .attr('opacity', '1')
        .style('cursor', 'pointer')
        .style('fill', function setColor(d) {
          // 生成漸層 和 色階 start
          const { open } = option.linearGradient
          const { color } = d.data
          // if (open) {
          //   const colorSaleFn = chroma
          //     .scale([color, '#ffffff'])
          //     .mode('lch')
          //     .colors(10)
          //   const linearGradientStartFrom = `${startFrom}%`
          //   const linearGradientEndFrom = `${endFrom}%`
          //   const arcWidth = (outerRadius + innerRadius) / 2
          //   const linearGradient = el
          //     .select('svg')
          //     .append('defs')
          //     .append('linearGradient')
          //     .attr('gradientUnits', 'userSpaceOnUse')
          //     .attr('id', `${vm.id}linearGradientIndex${d.index}`)
          //     .attr('x1', `${Math.cos(d.startAngle - Math.PI / 2) * arcWidth}`)
          //     .attr('y1', `${Math.sin(d.startAngle - Math.PI / 2) * arcWidth}`)
          //     .attr('x2', `${Math.cos(d.endAngle - Math.PI / 2) * arcWidth}`)
          //     .attr('y2', `${Math.sin(d.endAngle - Math.PI / 2) * arcWidth}`)
          //   linearGradient
          //     .append('stop')
          //     .attr('offset', linearGradientStartFrom)
          //     .attr('stop-color', `${colorSaleFn[0]}`)
          //     .attr('stop-opacity', 1)
          //   linearGradient
          //     .append('stop')
          //     .attr('offset', linearGradientEndFrom)
          //     .attr('stop-color', `${colorSaleFn[7]}`)
          //     .attr('stop-opacity', 1)
          //   // 生成漸層 和 色階 end
          // }

          return open ? `url(#${vm.id}linearGradientIndex${d.index})` : color
        })
        .style('stroke', function setStroke() {
          return vm.stroke
        })
        .style('stroke-width', function setStrokeWidth() {
          return vm.strokeWidth
        })
        .attr('d', arc) // 基本樣式
        .each(function getArc() {
          if (!initAnimation) {
            return
          }
          // 基本樣式動畫
          d3.select(this)
            .transition()
            .duration(initAnimationDuration)
            .attrTween('d', function setInterpolate(d) {
              const interpolate = d3.interpolate(
                {
                  startAngle: 0,
                  endAngle: 0,
                },
                d,
              )
              return function triggerInterpolate(t) {
                return arc(interpolate(t))
              }
            })
        })
      // 順時針環狀樣式  順時針環狀樣式動畫設定
      if (arcStyle === 'cornerRadiusOverlapDonut') {
        cornerRadiusDonut(svg)
      }
      // 生成圓弧實體 : 最後畫面呈現 start

      // make center info Circle start
      if (centerInfoDisplay && !vm.isIE()) {
        const {
          circleScale,
          circleBackground,
          fontSize,
          color,
          text,
        } = option.centerInfoOption // 進場動畫持續時間 結束後掛載事件的延遲時間
        svg
          .append('foreignObject') // IE 不能用 IE 不能用 IE 不能用 IE 不能用 IE 不能用 IE 不能用
          .attr('width', 2 * (radius * circleScale + 1))
          .attr('height', 2 * (radius * circleScale + 1))
          .attr('x', -radius * circleScale - 1)
          .attr('y', -radius * circleScale - 1)
          .style('pointer-events', 'none')
          .append('xhtml:div')
          .style('width', `${2 * (radius * circleScale + 1)}px`)
          .style('height', `${2 * (radius * circleScale + 1)}px`)
          .style('background-color', circleBackground)
          .style('border-radius', '50%')
          .style('padding', '10px')
          .style('display', 'flex')
          .style('justify-content', 'center')
          .style('flex-wrap', 'wrap')
          .style('align-items', 'center')
          .append('span')
          .attr('class', 'innerNameDisplay')
          .style('word-break', 'break-all')
          .style('font-size', fontSize)
          .style('text-align', 'center')
          .style('color', color)
          .text(text)
      }

      // make center info Circle end
      // make tooltips start
      const {
        fontSize,
        top,
        bottom,
        left,
        right,
        minWidth,
        minHeight,
        textMargin,
      } = option.tooltips
      svg
        .append('g')
        .attr('class', 'tooltips')
        .style('opacity', 0)
        .style('transition', `0.3s ease`)
        .style('transition-property', `opacity`)
        .attr('transform', `translate(0,0)`)
        .style('pointer-events', 'none')
        .append('rect')
        .attr('class', 'tooltips-rect')
        .attr('fill', '#272727')
        .attr('opacity', 0.6)
        .attr('width', minWidth)
        .attr('height', minHeight)
        .attr('x', 0)
        .attr('y', 0)
        .attr('rx', 4)
        .attr('ry', 4)

      const tooltips = el.select('.tooltips')
      const tooltipsRect = tooltips.select('rect')
      const tooltipsDotRadius = 6
      tooltips
        .append('circle')
        .attr('class', 'tooltipsDot')
        .attr('r', tooltipsDotRadius)
        .attr('cx', 0 + left)
        .attr('cy', fontSize + top - fontSize / 4)
      tooltips
        .append('text')
        .attr('class', 'tooltipsName')
        .attr('font-size', fontSize)
        .attr('x', 0 + left + tooltipsDotRadius * 2)
        .attr('y', fontSize + top)
        .attr('fill', '#ffffff')
        .text('ABCD')
      tooltips
        .append('text')
        .attr('class', 'tooltipsValue')
        .attr('font-size', fontSize)
        .attr('x', 0 + minWidth - right)
        .attr('y', fontSize + top)
        .attr('fill', '#ffffff')
        .attr('text-anchor', 'end')
        .text('40%')

      let tooltipsHeight = fontSize * 2 + textMargin + top + bottom
      tooltipsHeight = tooltipsHeight < minHeight ? minHeight : tooltipsHeight

      tooltipsRect.attr('height', tooltipsHeight)
      // make tooltips end
      /// ///////////////////////// *進場結束 事件掛載*////////////////////////////
      setTimeout(() => {
        el.selectAll('.arcPath').on('click', function trigger() {
          // 所有圓弧歸位
          el.selectAll('.arcPath').each(function setTransition() {
            d3.select(this)
              .transition()
              .duration(100)
              .attr('transform', function setTransform() {
                return `translate(0,0)`
              })
          })
          // 選定圓弧進行特效
          d3.select(this)
            .transition()
            .duration(100)
            .attr('transform', function setTransform(d) {
              if (d.index !== vm.focusArc) {
                vm.focusArc = d.index
                const point = arc.centroid(d)
                return `translate(${0.2 * point[0]},${0.2 * point[1]}  )`
              }
              vm.focusArc = ''
              return `translate(0,0)`
            })
        })
      }, initAnimationDuration + vm.reInitPending)
      setTimeout(() => {
        el.select('.mouseLeaveSensor').on('mouseover', function trigger() {
          const selection = [
            el.selectAll('.arcPath'),
            el.selectAll('.connectionLine'),
            el.select('.arcGroup').selectAll('text'),
          ]

          selection.forEach(selectEl => {
            selectEl.each(function setEach() {
              d3.select(this).attr('opacity', function setOpacity() {
                return 1
              })
            })
          })
          tooltips.style('opacity', 0)
        })
        el.selectAll('.arcPath').on('mouseenter', function trigger() {
          const selection = [
            el.selectAll('.arcPath'),
            el.selectAll('.connectionLine'),
            el.select('.arcGroup').selectAll('text'),
          ]
          const selection2 = [
            d3.select(this),
            d3.select(this.parentNode).select('.connectionLine'),
            d3.select(this.parentNode).selectAll('text'),
          ]
          selection.forEach(selectEl => {
            selectEl.each(function setEach() {
              d3.select(this).attr('opacity', function setOpacity(d) {
                return d.index === vm.focusArc ? 1 : 0.3
              })
            })
          })
          selection2.forEach(selectEl => {
            selectEl.attr('opacity', function setOpacity(d) {
              vm.hoverArc = d.index
              return d.index === vm.hoverArc ? 1 : 0.3
            })
          })
        })
        el.selectAll('.arcPath').on('mouseleave', function trigger() {
          vm.hoverArc = ''
          const selection = [
            el.selectAll('.arcPath'),
            el.selectAll('.connectionLine'),
            el.select('.arcGroup').selectAll('text'),
          ]
          selection.forEach(selectEl => {
            selectEl.each(function setEach() {
              d3.select(this).attr('opacity', function setOpacity(d) {
                return d.index === vm.focusArc ? 1 : 0.3
              })
            })
          })
        })
        el.selectAll('.arcPath').on('mousemove', function trigger(event) {
          // d3.event ^5.15.0
          // event ^6.1.1
          const e = event
          const elWidth = document
            .querySelector(`#${vm.id}`)
            .getBoundingClientRect().width
          const elheight = document
            .querySelector(`#${vm.id}`)
            .getBoundingClientRect().height
          const elTop = document
            .querySelector(`#${vm.id}`)
            .getBoundingClientRect().top // 元素到頂部距離
          const elLeft = document
            .querySelector(`#${vm.id}`)
            .getBoundingClientRect().left // 元素到左側距離
          const positionXInEl = e.x - elLeft
          const positionYInEl = e.y - elTop
          const halfHeight = elheight / 2
          const halfWidth = elWidth / 2
          const outOfRange = halfHeight * 0.7 >= positionYInEl
          const outOfRangeAdjustment = outOfRange
            ? -tooltipsHeight
            : tooltipsHeight * 1.2
          tooltips.attr(
            'transform',
            `translate(${positionXInEl -
              halfWidth -
              minWidth / 2},${positionYInEl -
              halfHeight -
              outOfRangeAdjustment})`,
          )
          const { open } = option.tooltips
          if (open) {
            tooltips.style('opacity', 1)
          }
          if (data[vm.hoverArc]) {
            tooltips
              .select('.tooltipsDot')
              .attr('fill', data[vm.hoverArc].color)
            tooltips.select('.tooltipsName').text(data[vm.hoverArc].name)
            tooltips.select('.tooltipsValue').text(function getName() {
              return `${vm.gotPercent(data[vm.hoverArc].value)}%`
            })
          }

          tooltips
            .select('.tooltips-rect')
            .attr('width', function getTooltipWidth() {
              const elId = document.getElementById(vm.id)
              const eltooltipsName = elId.querySelector(`.tooltipsName`)
              const eltooltipsValue = elId.querySelector(`.tooltipsValue`)
              const nameFontsLength = eltooltipsName.getBoundingClientRect()
                .width
              const valueFontsLength = eltooltipsValue.getBoundingClientRect()
                .width
              const dot = tooltipsDotRadius * 2
              const padding = left + right
              const autoWidth =
                valueFontsLength + nameFontsLength + dot + padding

              if (minWidth >= autoWidth) {
                el.select('.tooltipsValue').attr('x', 0 + minWidth - right)
                return minWidth
              }
              el.select('.tooltipsValue').attr(
                'x',
                0 + autoWidth - right + textMargin,
              )
              return autoWidth + textMargin
            })
        })
      }, initAnimationDuration + vm.reInitPending)
    },
  },
}
</script>

<style lang="scss" scoped>
.pieAnimation {
  animation: crescendo 0.9s alternate 1 ease-in;
  @keyframes crescendo {
    0% {
      transform: scale(0);
    }

    100% {
      transform: scale(1);
    }
  }
}
</style>
