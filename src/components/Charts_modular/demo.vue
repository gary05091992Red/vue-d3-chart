<template>
  <div class="home">
    <!-- <pie :id="'pie1'" :data="dataPie.pei1" /> -->

    <!-- 以下圖表如果keys不傳，預設會用傳入data中的key值代替 BarPerformance -->
    <verticalBar :id="'bar'" :data="data" :keys="['替換A', '替換B']" />

    <positiveNegativeLine
      :id="'line1'"
      :data="data"
      :keys="['替換A', '替換B']"
    />

    <stackedBarWithPercentage
      id="StackedBar1"
      :data="data2"
      class="legendsChartAlign"
    >
      <template slot="legend">
        <legends :data="data2" :colors="['#01fc85', '#fed203']" />
      </template>
    </stackedBarWithPercentage>

    <stackedBarWithNegativeValue
      id="StackedBar5"
      :data="data3"
      :keys="['Single contribution', 'Recurring contribution', 'Withdrawal']"
      class="legendsChartAlign"
    >
      <template slot="legend">
        <legends
          :data="data3"
          :colors="['#01fc85', '#583b6c', '#1a1a1a']"
          :keys="[
            'Single contribution',
            'Recurring contribution',
            'Withdrawal',
          ]"
        />
      </template>
    </stackedBarWithNegativeValue>

    <stackedLine :id="'stackedLine'" :data="data" :keys="['替換A', '替換B']" />

    <horizontalStackedBar id="StackedBar6" :data="data4" />
  </div>
</template>

<script>
import legends from './charts/legends/legendsName.vue'
import verticalBar from './charts/Bar/verticalBar.vue'
import positiveNegativeLine from './charts/Line/positiveNegativeLine.vue'
import stackedBarWithPercentage from './charts/StackedBar/stackedBarWithPercentage.vue'
import stackedBarWithNegativeValue from './charts/StackedBar/stackedBarWithNegativeValue.vue'
import horizontalStackedBar from './charts/StackedBar/horizontalStackedBar.vue'
import stackedLine from './charts/StackedLine/stackedLine.vue'
import pie from './charts/Pie/pie.vue'
import data from './data'
import data2 from './data2'
import data3 from './data3'
import data4 from './data4'
import dataPie from './dataPie'

export default {
  components: {
    legends,
    verticalBar,
    positiveNegativeLine,
    stackedBarWithPercentage,
    stackedBarWithNegativeValue,
    horizontalStackedBar,
    stackedLine,
    pie,
  },
  data() {
    return {
      data,
      data2,
      data3,
      data4,
      dataPie,
    }
  },
  mounted() {},
  methods: {},
}
</script>

<style lang="scss">
// 基礎設定
@import './charts/scss/chartsBase';
</style>
<style lang="scss">
// 客製設定
.home {
  width: 100%;

  .tick {
    //刻度數字顏色
    color: #a09fa0;
    font-size: 14px;
  }
  .domain {
    //線條顏色
    color: #bdbdbd;
  }
}
</style>
