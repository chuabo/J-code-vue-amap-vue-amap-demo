<template>
  <div id="app">
    <VueMap />
  </div>
</template>

<script>
import VueMap from './components/VueMap.vue'

export default {
  name: 'App',
  components: {
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

<style  scoped>
#app {
  width: 100%;
  height: 100%;
}
</style>
