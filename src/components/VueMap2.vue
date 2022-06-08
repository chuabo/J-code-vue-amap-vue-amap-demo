<template>
  <div class="container">
    <div class="map-container">
      <amap
        id="amap"
        ref="map"
        cache-key="coord-picker-map"
        mmap-style="amap://styles/whitesmoke"
        async
        :zoom.sync="zoom"
        is-hotspot
        @complete="ready = true"
        @click="onMapClick"
        >
        <a-form class="info" layout="inline">
          <a-form-item label="卫星图">
            <a-switch v-model="satellite" />
          </a-form-item>
        </a-form>
        <amap-satellite-layer :visible="satellite" />
      </amap>
    </div>
  </div>
</template>

<script>
/*eslint-disable*/
import { loadAmap, loadPlugins } from '@amap/amap-vue';
import icon from '/assets/people_icon.png';
import xzq from '/assets/xzq.jpg';
import xs from '/assets/xs.jpg';
import areaGeo from "/assets/xs.json";
export default {
  name: 'HelloWorld',
  props: {
    msg: String
  },
  data() {
    return {
      zoom: 13,
      mapInstance: null,
      map: null,
      map2: null,
      satellite: false,
    }
  },
  created() {
    const self = this
    this.$ready = new Promise(async resolve => {
      const AMap = await loadAmap();
      this.map = AMap;
      console.log('AMap:', AMap)
      await loadPlugins(['AMap.PlaceSearch', 'AMap.AutoComplete']);

      /*
      //动态创建map
      let map_ = new AMap.Map("divMap", {
          center: [104.937478,35.439575],
          zoom: 5
      });
      self.map2 = map_
      console.log('map_', map_)*/

      const layer = new AMap.TileLayer({
        zIndex:6,
        opacity:1,
        getTileUrl:'https://t{1,2,3,4}.tianditu.gov.cn/DataServer?T=ter_w&x=[x]&y=[y]&l=[z]'
      })
      //self.map.add(layer)

      this.mapInit();
    })


  },
  mounted() {
  },
  watch: {
    
  },
  methods: {
    // 地图初始化
    mapInit() {
      const self = this;
      if (this.$refs.map && this.$refs.map.$map) {
        this.mapInstance = this.$refs.map.$map;
        console.log('mapInstance', this.mapInstance);
        //this.addCluster()

        //const layer = new AMap.TileLayer({
        //  zIndex:6,
        //  opacity:1,
        //  getTileUrl:'https://webst01.is.autonavi.com/appmaptile?style=6&x={x}&y={y}&z={z}'
          //getTileUrl:'/appmaptile?style=6&x={x}&y={y}&z={z}'
        //})
        //this.$refs.map.$map.add(layer)

        var outer = [
            new AMap.LngLat(-360,90,true),
            new AMap.LngLat(-360,-90,true),
            new AMap.LngLat(360,-90,true),
            new AMap.LngLat(360,90,true),
        ];
        const holes = areaGeo[0].features[0].geometry.coordinates
        const path = [
          //areaGeo[0].features[0].geometry.coordinates,
          //holes,
          outer,
          holes
        ]
        
        //path.push.apply(path, holes)
        const polygon = new AMap.Polygon({
          pathL: path,
          //strokeColor: '#00eeff',
          strokeColor: '#fff',
          strokeWeight: 1,
          //fillColor: '#71B3FF',
          fillColor: '#000',
          fillOpacity: 0.5
        })
        polygon.setPath(path);
        this.$refs.map.$map.add(polygon)
      } else {
        setTimeout(() => {
          if (self.$refs.map && self.$refs.map.$map) {
            self.mapInstance = self.$refs.map.$map;
            console.log(self.mapInstance);

            //this.addCluster()
          }
        }, 2000)
      }
    },
    onclick(e) {
      
    },
    onMapClick(e) {
      console.log(e);
      //this.swx = e.lnglat.lng
      //this.swy = e.lnglat.lat
    },
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="less" scoped>
  .map-container {
    width: 100%;
    height: calc(100vh - 0px);
  }
</style>
