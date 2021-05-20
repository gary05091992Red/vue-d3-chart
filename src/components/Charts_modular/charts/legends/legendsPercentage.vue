<template>
  <div class="legendsPercentage">
    <div v-for="(item, i) of treatedData" :key="i" class="legendPercentage">
      <div class="legendMarker" :style="`background-color:${item.color}`" />
      <span class="legendTextName">{{ item.name }}</span>
      <span class="legendTextValue">{{ item.value }} %</span>
    </div>
  </div>
</template>

<script>
import mixinCharts from '@/components/Charts_modular/charts/mixins/mixinCharts'

export default {
  components: {},
  mixins: [mixinCharts],
  props: {
    data: {
      type: Array,
      default() {
        return []
      },
    },
  },

  data() {
    return {
      treatedData: [],
    }
  },

  watch: {
    data() {
      this.init()
    },
  },

  mounted() {
    this.init()
  },

  methods: {
    init() {
      this.treatedData = this.data.map(item => {
        const copy = JSON.parse(JSON.stringify(item))
        copy.value = this.gotPercent(copy.value)
        return copy
      })
    },
  },
}
</script>

<style lang="scss" scoped>
.legendsPercentage {
  display: flex;
  flex-wrap: wrap;
  align-items: center;

  .legendPercentage {
    display: flex;
    align-items: center;
    width: 50%;

    .legendMarker {
      width: 12px;
      height: 8px;
      border-radius: 50px;
      margin-right: 10px;
    }

    .legendTextName {
      display: inline-block;
      white-space: nowrap;
      margin-right: 10px;
    }

    .legendTextValue {
      display: inline-block;
    }
  }
}
</style>
