<template>
  <div class="container">
    <div class="side">
      <ul class="list" @mouseout="hoverItem = null">
        <!-- eslint-disable -->
        <li v-for="(item, index) in dataList" :key="item.id" @mouseover="hoverItem = item" @click="activeItem = item" :class="{ active: activeItem === item, hover: hoverItem === item }">
          <div class="name">{{item.content}}</div>
          <!--<div class="bar">111
            <div class="bar-inner" :style="barStyle(item, index + 1)" />
          </div>-->
        </li>
      </ul>
    </div>
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
        >
        <amap-info-window
          :visible="infoData.show"
          :position="infoData.position ? infoData.position : null"
          :z-index="999"
          :offset="[0, -40]"
          is-custom
        >
          <div class="info-window-content">
            <a-card shadow="always" v-if="infoData.show">
              <a-icon
                type="close"
                class="button-close"
                @click="infoData.show = false"
              />
              <h3>{{ infoData.title }}</h3>
              <div>{{ infoData.content }}</div>
            </a-card>
          </div>
        </amap-info-window>
        <amap-marker-cluster
          v-if="style == 'default'"
          key="default"
          :data="dataList"
          :grid-size="gridSize"
          :average-center="averageCenter"
          @click="onclick"
        />

        <amap-marker-cluster
          v-if="style == 'styles'"
          key="styles"
          :data="dataList"
          :grid-size="gridSize"
          :min-cluster-size=3
          :average-center="averageCenter"
          :styles="styles"
          @click="onclick"
          >
        </amap-marker-cluster>

        <amap-marker-cluster
          v-if="style == 'custom-cluster'"
          key="custom-cluster"
          :data="dataList"
          :grid-size="gridSize"
          :marker-options="getMarkerOptions"
          :cluster-options="getClusterOptions"
          :average-center="averageCenter"
          @click="onclick"
          >
          <template v-slot:cluster="context">
            <div :style="getClusterStyle(context)">
              居民小组({{ context.count }})人
            </div>
          </template>
        </amap-marker-cluster>

        <amap-marker-cluster
          v-if="style == 'custom-marker'"
          key="custom-marker"
          :data="dataList"
          :grid-size="gridSize"
          :marker-options="getMarkerOptions"
          :average-center="averageCenter"
          @click="onclick"
          >
          <!-- eslint-disable-next-line -->
          <template v-slot:marker="point">
            <div class="custom-marker" />
          </template>
        </amap-marker-cluster>

        <amap-marker-cluster
          v-if="style == 'custom-all'"
          key="custom-all"
          :data="dataList"
          :grid-size="gridSize"
          :marker-options="getMarkerOptions"
          :cluster-options="getClusterOptions"
          :average-center="averageCenter"
          @click="onclick"
          >
          <!-- eslint-disable-next-line -->
          <template v-slot:marker="point">
            <div class="custom-marker" />
          </template>
          <template v-slot:cluster="context">
            <div :style="getClusterStyle(context)">
              cluster居民小组({{ context.count }})人
            </div>
          </template>
        </amap-marker-cluster>
      </amap>
    </div>
    <!--<div id="divMap" class="map">
    </div>-->
  </div>
</template>

<script>
/*eslint-disable*/
import { loadAmap, loadPlugins } from '@amap/amap-vue';
import icon from '/assets/people_icon.png';
export default {
  name: 'HelloWorld',
  props: {
    msg: String
  },
  data() {
    return {
      zoom: 5,
      activeItem: null,
      hoverItem: null,
      markers: [],
      mapInstance: null,
      map: null,
      map2: null,
      point: null,
      gridSize: 80,
      averageCenter: true,
      //style: 'default',
      //style: 'styles',
      //style: 'custom-cluster',
      //style: 'custom-marker',
      style: 'custom-all',
      styles: Object.freeze([
        {
          //url: '//a.amap.com/jsapi_demos/static/images/blue.png',
          url: icon,
          size: [60, 50],
          offset: [-16, -16],
        },
        {
          //url: '//a.amap.com/jsapi_demos/static/images/green.png',
          url: icon,
          size: [60, 50],
          offset: [-16, -16],
        },
        {
          //url: '//a.amap.com/jsapi_demos/static/images/orange.png',
          url: icon,
          size: [36, 36],
          offset: [-18, -18],
        },
        {
          //url: '//a.amap.com/jsapi_demos/static/images/red.png',
          url: icon,
          size: [48, 48],
          offset: [-24, -24],
        },
        {
          //url: '//a.amap.com/jsapi_demos/static/images/darkRed.png',
          url: icon,
          size: [48, 48],
          offset: [-24, -24],
        },
      ]),
      points: [
         { lnglat: ["108.939621", "34.343147"] },
         { lnglat: ["112.985037", "23.15046"] },
          { lnglat: ["111.985337", "24.15146"] },
        { lnglat: ["115.985037", "22.15146"] },
      ],
      dataList: [{
              lnglat: [113.951955,22.530825],
              lng: 113.951955,
              lat: 22.530825,
              id: 1,
              content: "aaa",
              url: "https://ss3.bdstatic.com/70cFv8Sh_Q1YnxGkpoWK1HF6hhy/it/u=2126240618,1874470849&fm=26&gp=0.jpg"
          }, /*{
              lnglat: [116.397428,39.90923],
              lng: 116.397428,
              lat: 39.90923,
              id: 2,
              content: "bbb",
              url: "https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1605524499220&di=061f5404ccf4b56ca5109c6a74cad7e8&imgtype=0&src=http%3A%2F%2Fbpic.588ku.com%2Felement_origin_min_pic%2F18%2F01%2F15%2Fecc1be26af0ccb3aab8a64cbc1d7d5b9.jpg"
          }, */{
              lnglat: [117.000923,36.675807],
              lng: 117.000923,
              lat: 36.675807,
              id: 3,
              content: "cccccccccccc",
              url: "https://ss2.bdstatic.com/70cFvnSh_Q1YnxGkpoWK1HF6hhy/it/u=3897032442,810482418&fm=26&gp=0.jpg"
          }, {
              lnglat: [112.89114340293699,38.06208615376387],
              lng: 112.89114340293699,
              lat: 38.06208615376387,
              id: 4,
              content: "dddddddddddddddddddd",
              url: "https://ss2.bdstatic.com/70cFvnSh_Q1YnxGkpoWK1HF6hhy/it/u=3897032442,810482418&fm=26&gp=0.jpg"
          }, {
              lnglat: [116.303843,39.983412],
              lng: 116.303843,
              lat: 39.983412,
              id: 5,
              content: "eeeeeeeeeeeeeeeeeeeeeeeeeee",
              url: "https://ss1.bdstatic.com/70cFuXSh_Q1YnxGkpoWK1HF6hhy/it/u=1794114107,2569649938&fm=26&gp=0.jpg"
          }, /*{
              lnglat: [108.94444,34.14248],
              lng: 108.94444,
              lat: 34.14248,
              id: 6,
              content: "fff",
              url: "https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1605524653591&di=fce2171454e6d4d44545e51b41bb4224&imgtype=0&src=http%3A%2F%2Fbpic.588ku.com%2Foriginal_pic%2F19%2F03%2F18%2Fbf2928abcd5f96beab12f7a8611614c5.jpg"
          }, {
              lnglat: [121.472644,31.231706],
              lng: 121.472644,
              lat: 31.231706,
              id: 7,
              content: "ggg",
              url: "https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1605524499220&di=061f5404ccf4b56ca5109c6a74cad7e8&imgtype=0&src=http%3A%2F%2Fbpic.588ku.com%2Felement_origin_min_pic%2F18%2F01%2F15%2Fecc1be26af0ccb3aab8a64cbc1d7d5b9.jpg"
          }, //上海
          {
              lnglat: [121.506377,31.245105],
              lng: 121.506377,
              lat: 31.245105,
              id: 8,
              content: "hhh",
              url: "https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1605524653591&di=fce2171454e6d4d44545e51b41bb4224&imgtype=0&src=http%3A%2F%2Fbpic.588ku.com%2Foriginal_pic%2F19%2F03%2F18%2Fbf2928abcd5f96beab12f7a8611614c5.jpg"
          },*/ {
              lnglat: [121.392735,31.083714],
              lng: 121.392735,
              lat: 31.083714,
              id: 9,
              content: "iiiiiiiiiiiiii",
              url: " https://ss1.bdstatic.com/70cFuXSh_Q1YnxGkpoWK1HF6hhy/it/u=1794114107,2569649938&fm=26&gp=0.jpg",

          },

          {
              lnglat: [107.0138,33.0436],
              lng: 107.0138,
              lat: 33.0436,
              id: 10,
              content: "jjjj",
              url: "https://ss2.bdstatic.com/70cFvnSh_Q1YnxGkpoWK1HF6hhy/it/u=3897032442,810482418&fm=26&gp=0.jpg",

          }, //汉中
          /*{
              lnglat: [108.95,34.27],
              lng: 108.95,
              lat: 34.27,
              id: 11,
              content: "kkkk",
              url: "https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1605524499220&di=061f5404ccf4b56ca5109c6a74cad7e8&imgtype=0&src=http%3A%2F%2Fbpic.588ku.com%2Felement_origin_min_pic%2F18%2F01%2F15%2Fecc1be26af0ccb3aab8a64cbc1d7d5b9.jpg"

          },*/ {
              lnglat: [109.11,35.09],
              lng: 109.11,
              lat: 35.09,
              id: 12,
              content: "lll",
              url: "https://ss3.bdstatic.com/70cFv8Sh_Q1YnxGkpoWK1HF6hhy/it/u=2126240618,1874470849&fm=26&gp=0.jpg",

          }, {
              lnglat: [110.51,38.83],
              lng: 110.51,
              lat: 38.83,
              id: 13,
              content: "mmm",
              url: " https://ss1.bdstatic.com/70cFuXSh_Q1YnxGkpoWK1HF6hhy/it/u=1794114107,2569649938&fm=26&gp=0.jpg"

          }, {
              lnglat: [109.77,38.3],
              lng: 109.77,
              lat: 38.3,
              id: 14,
              content: "nnnn",
              url: "https://ss2.bdstatic.com/70cFvnSh_Q1YnxGkpoWK1HF6hhy/it/u=3897032442,810482418&fm=26&gp=0.jpg",

          }, {
              lnglat: [106.16, 33.34],
              lng: 106.16,
              lat: 33.34,
              id: 15,
              content: "oooo",
              url: "https://ss3.bdstatic.com/70cFv8Sh_Q1YnxGkpoWK1HF6hhy/it/u=2126240618,1874470849&fm=26&gp=0.jpg"

          },
      ],
      infoData: {
        show: true,
        position: null,
        title: 'infoTitle',
        content: 'infoContent'
      }
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

      this.mapInit();
    })
    //this.mapInit();
  },
  mounted() {
  },
  watch: {
    activeItem(item) {
      if (!item) return;
      console.log(item);
      this.infoData.show = true;
      this.infoData.position = new Array();
      this.infoData.position[0] = item.lng;
      this.infoData.position[1] = item.lat

      this.mapInstance.setCenter([item.lng, item.lat]);
    }
  },
  methods: {
    // 地图初始化
    mapInit() {
      const self = this;
      if (this.$refs.map && this.$refs.map.$map) {
        this.mapInstance = this.$refs.map.$map;
        console.log('mapInstance', this.mapInstance);
        //this.addCluster()
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
    _renderClusterMarker(context) {
        var factor = Math.pow(context.count / count, 1 / 18);
        var div = document.createElement('div');
        var Hue = 180 - factor * 180;
        var bgColor = 'hsla(' + Hue + ',100%,50%,0.7)';
        var fontColor = 'hsla(' + Hue + ',100%,20%,1)';
        var borderColor = 'hsla(' + Hue + ',100%,40%,1)';
        var shadowColor = 'hsla(' + Hue + ',100%,50%,1)';
        div.style.backgroundColor = bgColor;
        var size = Math.round(30 + Math.pow(context.count / count, 1 / 5) * 20);
        div.style.width = div.style.height = size + 'px';
        div.style.border = 'solid 1px ' + borderColor;
        div.style.borderRadius = size / 2 + 'px';
        div.style.boxShadow = '0 0 1px ' + shadowColor;
        div.innerHTML = context.count;
        div.style.lineHeight = size + 'px';
        div.style.color = fontColor;
        div.style.fontSize = '14px';
        div.style.textAlign = 'center';
        context.marker.setOffset(new AMap.Pixel(-size / 2, -size / 2));
        context.marker.setContent(div)
    },
    _renderMarker(context) {
        var content = '<div style="background-color: hsla(180, 100%, 50%, 0.3); height: 18px; width: 18px; border: 1px solid hsl(180, 100%, 40%); border-radius: 12px; box-shadow: hsl(180, 100%, 50%) 0px 0px 3px;"></div>';
        var offset = new AMap.Pixel(-9, -9);
        context.marker.setContent(content)
        context.marker.setOffset(offset)
    },
    addCluster() {
      const self = this;
      this.dataList.map(item => {
        let marker = new AMap.Marker({
          lnglat: [item.lng, item.lat],
          position: new AMap.LngLat(item.lng, item.lat),
          title: item.title,
          content: `<div><img style="width:100px;height:60px"  src="${item.url}"></img>居民小组(556)人</div>`,
          offset: new AMap.Pixel(-15, -15)
        })
        let infoWindow = new AMap.InfoWindow({
            content: 'aaa', //使用默认信息窗体框样式，显示信息内容
            offset: new AMap.Pixel(0, -15),
        });
        self.map.Event.addListener(marker, "click", function(e) {
            infoWindow.open(
                //self.map,
                self.mapInstance,
                // 窗口信息的位置
                marker.getPosition(item.lng, item.lat)
            );
        })
        //console.log(marker)
        self.markers.push(marker)
        //self.mapInstance.add(marker)
        //marker.setMap(self.mapInstance);

        //self.map.Event.addListener(self.map, 'zoomend', function() {
        //    var zoom = self.map.getZoom();
        //    // 关闭信息窗体
        //    self.map.clearInfoWindow(infoWindow);
        //});
      })

      let count = self.markers.length;
      let _renderClusterMarker = function(context) {
          var factor = Math.pow(context.count / count, 1 / 18);
          var div = document.createElement('div');
          var Hue = 180 - factor * 180;
          var bgColor = 'hsla(' + Hue + ',100%,50%,0.7)';
          var fontColor = 'hsla(' + Hue + ',100%,20%,1)';
          var borderColor = 'hsla(' + Hue + ',100%,40%,1)';
          var shadowColor = 'hsla(' + Hue + ',100%,50%,1)';
          div.style.backgroundColor = bgColor;
          var size = Math.round(30 + Math.pow(context.count / count, 1 / 5) * 20);
          div.style.width = div.style.height = size + 'px';
          div.style.border = 'solid 1px ' + borderColor;
          div.style.borderRadius = size / 2 + 'px';
          div.style.boxShadow = '0 0 1px ' + shadowColor;
          div.innerHTML = context.count;
          div.style.lineHeight = size + 'px';
          div.style.color = fontColor;
          div.style.fontSize = '14px';
          div.style.textAlign = 'center';
          context.marker.setOffset(new AMap.Pixel(-size / 2, -size / 2));
          context.marker.setContent(div)
          console.log(context.marker)
      };
      let _renderMarker = function(context) {
          var content = '<div style="background-color: hsla(180, 100%, 50%, 0.3); height: 18px; width: 18px; border: 1px solid hsl(180, 100%, 40%); border-radius: 12px; box-shadow: hsl(180, 100%, 50%) 0px 0px 3px;"></div>';
          var offset = new AMap.Pixel(-9, -9);
          context.marker.setContent(content)
          context.marker.setOffset(offset)
      }

      if (self.cluster) {
          self.cluster.setMap(null);
      }

      const sts = [{
          url: "http://a.amap.com/jsapi_demos/static/images/blue.png",
          size: new AMap.Size(32, 32),
          offset: new AMap.Pixel(-16, -16)
      }, {
          url: "//a.amap.com/jsapi_demos/static/images/green.png",
          size: new AMap.Size(32, 32),
          offset: new AMap.Pixel(-16, -16)
      }, {
          url: "//a.amap.com/jsapi_demos/static/images/orange.png",
          size: new AMap.Size(36, 36),
          offset: new AMap.Pixel(-18, -18)
      }, {
          url: "//a.amap.com/jsapi_demos/static/images/red.png",
          size: new AMap.Size(48, 48),
          offset: new AMap.Pixel(-24, -24)
      }, {
          url: "//a.amap.com/jsapi_demos/static/images/darkRed.png",
          size: new AMap.Size(48, 48),
          offset: new AMap.Pixel(-24, -24)
      }]

      // 点聚合样式
      self.cluster = new AMap.MarkerClusterer(self.mapInstance, self.markers, {gridSize: 80});
      //self.cluster = new AMap.MarkerClusterer(self.mapInstance, self.dataList, {gridSize: 80});
      //self.cluster = new AMap.MarkerCluster(self.mapInstance, self.dataList, {gridSize: 80, renderClusterMarker: _renderClusterMarker, renderMarker: _renderMarker});
      //self.cluster = new AMap.MarkerClusterer(self.mapInstance, self.dataList, {gridSize: 80, renderClusterMarker: self._renderClusterMarker, renderMarker: self._renderMarker});
      //self.cluster = new AMap.MarkerClusterer(self.mapInstance, self.dataList, {styles: sts, gridSize: 80, averageCenter: true, zoomOnClick: false });

      

     //self.cluster = new AMap.MarkerClusterer(self.mapInstance, this.dataList, {gridSize: 80});
     //self.cluster.setMap(self.mapInstance);
      //console.log(self.cluster)
    },
    getMarkerOptions(point) {
      console.log('point', point)
      return {
        //position: point.lnglat,
        //position: point.lnglat.pos,
        //position: [point.lng, point.lat],
        offset: [15, 15],
        //content: 'aaaaaaaa<div class="custom-marker" />',
        content: `<div><img style="width:100px;height:60px"  src="${point.url}"></img>${point.content}</div>`,
        url: icon,
        label: '1111111',
        title: '000000000000'
      };
    },
    getClusterOptions(context) {
      console.log('context2:', context);
      const size = Math.round(
        30 + Math.pow(context.count / this.dataList.length, 1 / 5) * 20
      );
      return {
        offset: [-size / 2, -size / 2],
        content: `<div><img style="width:100px;height:60px"  src="https://ss1.bdstatic.com/70cFuXSh_Q1YnxGkpoWK1HF6hhy/it/u=1794114107,2569649938&fm=26&gp=0.jpg"></img>${context.count}</div>`
      };
    },
    onclick(e) {
      const self = this;
      console.log(e)
      this.infoData.show = true;
      this.infoData.position = new Array();
      this.infoData.position[0] = e.lnglat.lng;
      this.infoData.position[1] = e.lnglat.lat;
      const zoom = this.mapInstance.getZoom();
      // 点击展开重合的点
      if (e.clusterData.length > 1) {
        this.mapInstance.setZoomAndCenter(zoom + 2, e.lnglat);
        const item = e.clusterData[0];

        /*let marker = new AMap.Marker({
          //lnglat: [item.lng, item.lat],
          position: new AMap.LngLat(item.lng, item.lat),
          title: item.title,
          content: `<div><img style="width:100px;height:60px"  src="${item.url}"></img></div>`,
          offset: new AMap.Pixel(-15, -15)
        })
        let infoWindow = new AMap.InfoWindow({
            content: 'aaa', //使用默认信息窗体框样式，显示信息内容
            offset: new AMap.Pixel(0, -15),
        });
        self.map.Event.addListener(marker, "click", function(e) {
            infoWindow.open(
                //self.map,
                self.mapInstance,
                // 窗口信息的位置
                marker.getPosition(item.lng, item.lat)
            );
        })
        //console.log(marker)
        //self.markers.push(marker)
        self.mapInstance.add(marker)*/
      }
    },
    interpolate(u, begin, end) {
      if (u < 0) u = 0;
      if (u > 1) u = 1;
      u = Math.pow(u, 1 / 10);
      return u * (end - begin) + begin;
    },
    getClusterStyle(context) {
      console.log('context', context)
      const u = context.count / this.dataList.length;
      const hue = this.interpolate(u, 90, 0);
      const size = this.interpolate(u, 30, 50);
      return {
        backgroundColor: `hsla(${hue}, 100%, 50%, 0.7)`,
        width: `${size}px`,
        height: `${size}px`,
        lineHeight: `${size}px`,
        borderRadius: `${size / 2}px`,
        border: `1px solid hsla(${hue}, 100%, 40%, 1)`,
        boxShadow: `0 0 1px hsla(${hue}, 100%, 50%, 1)`,
        color: `hsla(${hue}, 100%, 20%, 1)`,
        fontSize: '14px',
        textAlign: 'center',
      };
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="less" scoped>
.container {
  display: flex;
  border: 1px solid #000;
  width: 100%;
  /*height: 200px;*/

  .side {
    
    /*height: 100%;*/
    overflow-x: scroll;
  }

  .list {
    
    margin: 0;
    padding: 0;
    list-style: none;
    /*width: 140px;*/
    width: 200px;
    
    
    position: relative;

    li {
      box-sizing: border-box;
      width: 100%;
      padding: 5px 12px;
      cursor: default;
      white-space: nowrap;
    }
    li.hover,
    li.active {
      background-color: #e5e5e5;
    }
    .name {
      width: 100%;
      white-space: nowrap;
      /*text-overflow: ellipsis;
      overflow-x: hidden;*/
    }
    .bar {
      padding: 4px 0 0;
    }
    .bar-inner {
      height: 8px;
    }
  }

  .map-container {
    width: 100%;
    height: calc(100vh - 0px);
    /*height: 400px;*/

    .info-window-content {
      position: relative;

      h3 {
        margin-top: 0;
      }

      .button-close {
        position: absolute;
        right: 0.5px;
        top: 0.5px;

        cursor: pointer;
      }
    }
  }
}





</style>
