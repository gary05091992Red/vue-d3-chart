import * as d3 from 'd3'

export default {
  data() {
    return {
      initStatus: true,
      resizeEvent() {},
    }
  },
  props: {},
  watch: {
    data: {
      async handler() {
        const vm = this
        if (vm.type === 'pie') {
          this.preprocessingPie()
        }
        this.throttle(this.init, true)
      },
      deep: true,
    },
  },

  destroyed() {
    if (this.isMobile()) {
      window.removeEventListener('orientationchange', this.resizeEvent)
    } else {
      window.removeEventListener('resize', this.resizeEvent)
    }
  },
  methods: {
    isMobile() {
      try {
        document.createEvent('TouchEvent')
        return true
      } catch (e) {
        return false
      }
    },
    isIE() {
      const { userAgent } = navigator
      const isOpera = userAgent.indexOf('Opera') > -1
      const isIE =
        userAgent.indexOf('compatible') > -1 &&
        userAgent.indexOf('MSIE') > -1 &&
        !isOpera
      const isIE11 =
        navigator.userAgent.indexOf('MSIE') !== -1 ||
        navigator.appVersion.indexOf('Trident/') > 0
      return isIE || isIE11
    },
    isSmallDevice() {
      if (window.innerWidth < 768) {
        return true
      }
      return false
    },
    makeid() {
      let text = ''
      const possibleEn = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'
      const possibleNu = '0123456789'
      for (let i = 0; i < 5; i++)
        text += possibleEn.charAt(Math.floor(Math.random() * possibleEn.length))
      text += '-'
      for (let i = 0; i < 5; i++)
        text += possibleNu.charAt(Math.floor(Math.random() * possibleNu.length))
      return text
    },
    preprocessingPie() {
      const vm = this
      const dataCopy = JSON.parse(JSON.stringify(vm.data))
      const removedValueZero = []
      dataCopy.forEach(item => {
        if (item.value !== 0) {
          const copyItem = JSON.parse(JSON.stringify(item))
          copyItem.value = Number(item.value)
          removedValueZero.push(copyItem)
        }
      })
      vm.dataSorted = removedValueZero.sort(function sortFn(a, b) {
        return b.value - a.value
      })
    },
    throttle(fn, openAnimation) {
      // 初始化
      fn(openAnimation)
      // 掛載防斗節流函式，在桌機版resize時效能大幅優化
      const throttle = {
        zoomHandle() {
          let timeId = null
          let startTime = new Date()
          clearTimeout(timeId)
          const cur = new Date()
          if (cur - startTime > 2000) {
            fn(openAnimation)
            startTime = cur
          } else {
            timeId = setTimeout(fn, 500)
          }
        },
      }
      this.resizeEvent = throttle.zoomHandle
      if (this.isMobile()) {
        window.addEventListener('orientationchange', this.resizeEvent)
      } else {
        window.addEventListener('resize', this.resizeEvent)
      }
    },
    init() {
      const vm = this
      const el = document.querySelector(`#${vm.id}`)
      vm.setOption()
      if (el && vm.initAnimation) {
        el.classList.add(vm.animationName)
      }
      d3.select(`#${vm.id}`)
        .select('svg')
        .remove()
      this.draw()
    },
    SumDataMapReduce(arr, key) {
      let copyArr = JSON.parse(JSON.stringify(arr))
      copyArr = copyArr.map(item => {
        const copyitem = JSON.parse(JSON.stringify(item))
        copyitem.value = Number(copyitem.value)
        return copyitem
      })

      return copyArr
        .map(el => (key ? el[key] : el.value))
        .reduce((a, b) => a + b)
    },
    gotPercent(d) {
      const sumValue = this.SumDataMapReduce(this.data, 'value')
      const value = (d / sumValue) * 100
      value.toFixed(2)
      return value.toFixed(2)
    },
  },
}
