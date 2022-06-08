<template>
    <div id="projectMap" ref="projectMap" style="width: 100%;height: 100vh;">111</div>
</template>
<script>
import cqmap from '/assets/ynmap.json'//就是这么个意思
export default {
  data() {
    return {
      myChart: null
    }
  },
  methods: {
    echartsInit() {
      //使用ref代替document.getElementById
      var echarts_dom = this.$refs.projectMap;
      //var echarts_dom = document.getElementById('projectMap')
      if (echarts_dom) {
        let myChart = this.$echarts.init(echarts_dom);
        this.myChart = myChart;
        myChart.showLoading();
        //此处的cqmap是通过上面地址下载好的重庆市地图的json数据
        this.$echarts.registerMap("CQ", cqmap);
        const options = {
          //title是标题，根据需求是否需要，不需要直接false，需要的话自己看api配置项；
          title: {
            show: true,
          },
          //鼠标移入展示的提示框，同样参考api配置项，{a}{b}等都有各自的意义
          tooltip: {
            trigger: "item",
            formatter: "{b}<br/>工程项目：{c}",
          },
          //工具栏   设置为false不展示，内置有导出图片，数据视图，动态类型切换，数据区域缩放，重置五个工具，暂不需要
          toolbox: {
            show: false,
            orient: "vertical",
            left: "right",
            top: "center",
            //自定义方法
            feature: {
              dataView: { readOnly: false },
              restore: {},
              saveAsImage: {},
            },
          },
          visualMap: {
            show: false, //虽然不展示视觉映射组件，但是下面的某些配置是生效的
            // min: 100,
            // max: 700,
            // text: ["High", "Low"],
            realtime: false,
            // calculable: true,
            inRange: {
              color: ["rgb(0,137,121)"],
            },
          },
          color: ["#fff"],//展示的字体颜色
          series: [
            {
              //tooltip展示的标题，设置formatter后直接通过{b}展示区域name，此值的代号为{a}。
              name: "展示的名称",
              type: "map",
              mapType: "CQ", // 自定义扩展图表类型，必须和registerMap的第一个参数相同
              // roam: true, //可以拖拽和缩放
              label: {
                show: true,
                color: "#fff",
              },
              data: [
                { name: "奉节县", value: this.randomData() },
                { name: "巫溪县", value: this.randomData() },
                { name: "开州区", value: this.randomData() },
                { name: "酉阳土家族苗族自治县", value: this.randomData() },
                { name: "彭水苗族土家族自治县", value: this.randomData() },
                { name: "云阳县", value: this.randomData() },
                { name: "万州区", value: this.randomData() },
                { name: "城口县", value: this.randomData() },
                { name: "江津区", value: this.randomData() },
                { name: "石柱土家族自治县", value: this.randomData() },
                { name: "巫山县", value: this.randomData() },
                { name: "涪陵区", value: this.randomData() },
                { name: "丰都县", value: this.randomData() },
                { name: "武隆区", value: this.randomData() },
                { name: "南川区", value: this.randomData() },
                { name: "秀山土家族苗族自治县", value: this.randomData() },
                { name: "黔江区", value: this.randomData() },
                { name: "合川区", value: this.randomData() },
                { name: "綦江区", value: this.randomData() },
                { name: "忠县", value: this.randomData() },
                { name: "梁平区", value: this.randomData() },
                { name: "巴南区", value: this.randomData() },
                { name: "潼南区", value: this.randomData() },
                { name: "永川区", value: this.randomData() },
                { name: "垫江县", value: this.randomData() },
                { name: "渝北区", value: this.randomData() },
                { name: "长寿区", value: this.randomData() },
                { name: "大足区", value: this.randomData() },
                { name: "铜梁区", value: this.randomData() },
                { name: "荣昌区", value: this.randomData() },
                { name: "璧山区", value: this.randomData() },
                { name: "北碚区", value: this.randomData() },
                { name: "万盛区", value: this.randomData() },
                { name: "九龙坡区", value: this.randomData() },
                { name: "沙坪坝区", value: this.randomData() },
                { name: "南岸区", value: this.randomData() },
                { name: "江北区", value: this.randomData() },
                { name: "大渡口区", value: this.randomData() },
                { name: "渝中区", value: this.randomData() },
              ],
              // 自定义名称映射，json中properties的name如果是英文代号的话，可以使用nameMap和中文名对应起来，如果name是中文的话则不需要nameMap
              // nameMap: {
              //   ckx: "城口县"
              // },
            },
          ],

        };
        myChart.setOption(options);
        myChart.hideLoading();
      }
    },
    randomData() {
      return Math.round(Math.random() * 1000);
    },
    resizeChart() {
      if (this.myChart) {
        this.myChart.resize();
      }
    }
  },
//使用mounted的原因是因为在mounted中dom已经加载完毕，否则会报错，找不到getAttribute这个方法
  mounted() {
    this.$nextTick(() => {
      this.echartsInit();
    });
    window.addEventListener('resize', this.resizeChart)
  },
};
</script>
<style lang="scss" scoped>

</style>