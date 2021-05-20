<template>
  <div class="legendsName">
    <template v-if="keys.length === 0">
      <div v-for="(_, key, i) of data" :key="i" class="legendName">
        <div class="legendMarker" :style="`background-color:${colors[i]}`" />
        <span class="legendTextName">{{ key }}</span>
      </div>
    </template>
    <template v-else>
      <div v-for="(key, i) of keys" :key="i" class="legendName">
        <div class="legendMarker" :style="`background-color:${colors[i]}`" />
        <span class="legendTextName">{{ key }}</span>
      </div>
    </template>
  </div>
</template>

<script>
export default {
  components: {},
  props: {
    data: {
      type: Object,
      default() {
        return {}
      },
    },

    colors: {
      type: Array,
      default() {
        return []
      },
    },

    keys: {
      type: Array,
      default() {
        return []
      },
    },
  },

  data() {
    return {}
  },

  watch: {
    data() {},
  },

  mounted() {},

  methods: {},
}
</script>

<style lang="scss" scoped>
.legendsName {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  width: 100%;

  .legendName {
    display: flex;
    align-items: center;

    .legendMarker {
      width: 12px;
      height: 12px;
      border-radius: 50%;
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
@media screen and (min-width: 768px) {
  .legendsName {
    width: 50%;
  }
}
</style>
>
