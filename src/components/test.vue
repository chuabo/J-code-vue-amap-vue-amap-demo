<template>
  <div id='div' style="width: 100%;height: 100vh;"/>
</template>
<script>
import cqmap from '/assets/cqmap.json'
export default {
  name: 'test',
  data() {
    return {
    }
  },
  created() {

  },
  mounted() {
    var dom = document.getElementById('div')
      if (dom) {
        let myChart = this.$echarts.init(dom);
        myChart.showLoading();

        myChart.setOption({
            title: {
                text: 'ECharts 入门示例'
            },
            tooltip: {},
            xAxis: {
                data: ['衬衫', '羊毛衫', '雪纺衫', '裤子', '高跟鞋', '袜子']
            },
            yAxis: {},
            series: [{
                name: '销量',
                type: 'bar',
                data: [5, 20, 36, 10, 10, 20]
            }]
        });
        myChart.hideLoading();
      }
  },
  watch: {
  },
  methods: {
    
  }
}
</script>
<style>
</style>
