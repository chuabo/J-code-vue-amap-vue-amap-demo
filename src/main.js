import Vue from 'vue'
import App from './App.vue'

import Element from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
Vue.use(Element);

import Antd from 'ant-design-vue';
import 'ant-design-vue/dist/antd.css';
Vue.use(Antd);

import AmapVue from '@amap/amap-vue';

AmapVue.config.version = '2.0'; // 默认2.0，这里可以不修改
//AMapVue.config.version = '1.4.15';
AmapVue.config.key = 'cb47dfa486d9dc0955b0e1624d17df29';
AmapVue.config.plugins = [
  'AMap.ToolBar',
  'AMap.MoveAnimation',
  'AMap.MarkerCluster',
  'AMap.MarkerClusterer'
  // 在此配置你需要预加载的插件，如果不配置，在使用到的时候会自动异步加载
];
Vue.use(AmapVue);

import * as echarts from 'echarts'
import 'echarts-liquidfill'
Vue.prototype.$echarts = echarts

Vue.config.productionTip = false

new Vue({
  render: h => h(App),
}).$mount('#app')
