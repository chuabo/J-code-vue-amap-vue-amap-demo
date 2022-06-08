<template>
  <div>
    <VueMap v-if="view === 'vueMap'" />
    <VueMap2 v-if="view === 'vueMap2'" />
    <EChats v-if="view === 'echats'" />
    <test v-if="view === 'test'" />
    <geoserver v-if="view === 'geoserver'" />
    <openlayerMap v-if="view === 'openlayerMap'" />
  </div>
</template>
<script>
import VueMap from '@/components/VueMap.vue'
import VueMap2 from '@/components/VueMap2.vue'
import EChats from '@/components/echats.vue'
import test from '@/components/test.vue'
import geoserver from '@/components/geoserver.vue'
import openlayerMap from '@/components/openlayerMap.vue'
export default {
  name: 'vieContent',
  props: {
    view: String
  },
  components: {
    VueMap,
    VueMap2,
    EChats,
    test,
    geoserver,
    openlayerMap
  },
  data() {
    return {
    }
  },
  created() {

  },
  mounted() {
  },
  watch: {
  },
  methods: {
    
  }
}
</script>
<style>
</style>