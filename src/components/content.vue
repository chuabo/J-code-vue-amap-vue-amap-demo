<template>
  <div>
    <VueMap v-if="view === 'vueMap'" />
    <EChats v-if="view === 'echats'" />
    <test v-if="view === 'test'" />
  </div>
</template>
<script>
import VueMap from '@/components/VueMap.vue'
import EChats from '@/components/echats.vue'
import test from '@/components/test.vue'
export default {
  name: 'vieContent',
  props: {
    view: String
  },
  components: {
    VueMap,
    EChats,
    test
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