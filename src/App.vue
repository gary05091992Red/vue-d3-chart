<template>
    <div id="app">
        <router-view></router-view>
    </div>
</template>

<script>




export default {
  
    mounted: function() {
        //綁定 DOM 之後
    },
}
</script>
<style lang="scss">

button {
    margin: 0;
    padding: 0;
    border: 1px solid transparent;
    outline: none;
}
#app {
    font-family: "Avenir", Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-align: center;
    color: #2c3e50;
}
.app-wrap {
    position: fixed;
    top: 0px;
    left: 0px;
    height: 100vh;
    width: 100vw;
}

</style>
