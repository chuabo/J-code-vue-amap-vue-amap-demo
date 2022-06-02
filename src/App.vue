<template>
  <div id="app">
    <home />
    <!--<VueMap />-->
  </div>
</template>

<script>
import VueMap from './components/VueMap.vue'
import home from './components/home.vue'

export default {
  name: 'App',
  components: {
    home,
    VueMap
  },
  props: {
  },
  data() {
    return {
    }
  },
  mounted () {
  },
  watch: {
  },
  created() {
  
  },
  methods: {
    
  }
}
</script>

<style>
html,
body {
  margin: 0;
  padding: 0;
  height: 100%;
}
</style>

<style lang="less" scoped>
#app {
  width: 100%;
  height: 100%;
}
</style>
