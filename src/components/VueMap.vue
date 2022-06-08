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
        @click="onMapClick"
        >
        <a-form class="info" layout="inline">
          <a-form-item label="">
            <a-button @click="firstClick">第一点</a-button>
            <a-button @click="nextClick">下一点</a-button>
            <a-button @click="endClick">终点</a-button>
          </a-form-item>
          <a-form-item label="opacity">
            <a-slider
              v-model="opacity"
              :min="0"
              :max="1"
              :step="0.1"
              style="width: 180px;"
            />
          </a-form-item>
          <!-- prettier-ignore -->
          <a-form-item label="卫星图">
            <a-switch v-model="satellite" />
          </a-form-item>
        </a-form>
        <amap-satellite-layer :visible="satellite" />
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

        <amap-image-layer :bounds="[[swx, swy], [nex, ney]]" :url="picUrl" :opacity="opacity" />

        <amap-polygon
          v-if="drawer.polygon"
          :path.sync="drawer.polygon"
          :fill-color="styles.fill"
          :stroke-color="styles.stroke"
          :fill-opacity="0.5"
          editable
        />

        <!--<amap-text v-for="(position, index) in drawer.polygon" :key="index" :position="position" :text="index + ',' + position[0] + ',' + position[1]" />-->
        <amap-text v-for="(position, index) in drawer.polygon" :key="index" :position="position" :text="index + ','" />

        <amap-marker :position.sync="marker.position" :label="marker.label" :draggable="false"  @click="markerClick" @rightclick="markerRightClick" />

        <amap-marker :position.sync="markerStart.position" :label="markerStart.label" draggable  @click="markerStartClick" @rightclick="markerStartRightClick" />
        <amap-marker :position.sync="markerEnd.position" :label="markerEnd.label" draggable  @click="markerEndClick" @rightclick="markerEndRightClick" />
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
import xzq from '/assets/xzq.jpg';
import xs from '/assets/xs.jpg';
import xs2 from '/assets/xs2.jpg';
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
      },
      swx: 103.602668,
      swy: 25.437735,
      nex: 103.825606,
      ney: 25.562469,
      //picUrl: xzq,
      //picUrl: xs,
      picUrl: xs2,
      opacity: 0.4,

      markerIndex: 0,
      marker: {
        position: null, 
        label: {},
        show: true
      },

      markerStart: {
        //position: [103.602668, 25.437735],
        position: [103.608505,25.440459], 
        label: {},
        show: true
      },
      markerEnd: {
        //position: [103.825606,25.562469],
        position: [103.819931, 25.555266],
        label: {},
        show: true
      },
      drawer: {
        /*polygon: [
          [103.694035, 25.52463],
          [103.786005, 25.519295],
          [103.624538, 25.457162],
        ],*/
        //西城社区
        //polygon: [[103.693195,25.523169],[103.695857,25.522646],[103.698065,25.52174],[103.699604,25.523853],[103.703752,25.525785],[103.705888,25.524212],[103.706961,25.522424],[103.712811,25.522884],[103.713851,25.521073],[103.71608,25.522951],[103.725295,25.524225],[103.731537,25.514568],[103.737681,25.518385],[103.752355,25.519668],[103.766855,25.519813],[103.773413,25.518283],[103.786116,25.51298],[103.792098,25.513188],[103.791177,25.510177],[103.795434,25.508412],[103.792098,25.504882],[103.785311,25.504778],[103.775418,25.494188],[103.777603,25.491696],[103.775648,25.486919],[103.777603,25.483908],[103.775763,25.47965],[103.774652,25.480472],[103.775,25.48379],[103.773162,25.484732],[103.768144,25.48527],[103.762977,25.482041],[103.758852,25.485154],[103.753438,25.481907],[103.754382,25.479799],[103.746383,25.477511],[103.748967,25.474192],[103.74842,25.472892],[103.74683,25.47352],[103.745683,25.475298],[103.738226,25.477854],[103.736504,25.475862],[103.732184,25.475639],[103.723689,25.478025],[103.718214,25.475042],[103.711889,25.474701],[103.704715,25.472912],[103.705659,25.476917],[103.702261,25.478366],[103.697446,25.479474],[103.696219,25.47794],[103.695275,25.476321],[103.691971,25.475809],[103.693387,25.48007],[103.697918,25.483053],[103.697824,25.485865],[103.693198,25.488847],[103.686591,25.487058],[103.683759,25.48612],[103.681304,25.48399],[103.681871,25.475213],[103.681278,25.472027],[103.676315,25.468891],[103.674081,25.462282],[103.679292,25.460602],[103.678586,25.458395],[103.670286,25.452766],[103.64781,25.453848],[103.641925,25.453299],[103.638074,25.453357],[103.6357,25.454115],[103.634061,25.454691],[103.632438,25.455972],[103.628555,25.455868],[103.624538,25.457162],[103.621224,25.464112],[103.619581,25.467642],[103.617169,25.470781],[103.618545,25.475676],[103.622622,25.475758],[103.624218,25.478253],[103.62615,25.478294],[103.626825,25.478923],[103.626465,25.479674],[103.627094,25.480302],[103.62815,25.479734],[103.629072,25.479816],[103.630159,25.482311],[103.631374,25.482585],[103.633729,25.482105],[103.634244,25.484456],[103.633805,25.486425],[103.635068,25.486867],[103.637339,25.486845],[103.637414,25.485177],[103.637114,25.483961],[103.637938,25.483758],[103.638712,25.484028],[103.63951,25.486552],[103.641432,25.490021],[103.642704,25.492805],[103.644375,25.493868],[103.644679,25.495445],[103.645908,25.496059],[103.647641,25.495171],[103.648246,25.494167],[103.648859,25.49403],[103.649984,25.494452],[103.65078,25.493734],[103.652436,25.495199],[103.653691,25.494962],[103.654575,25.495298],[103.65673,25.495379],[103.656576,25.493378],[103.657099,25.49246],[103.65633,25.490043],[103.657038,25.488959],[103.659624,25.491988],[103.661933,25.493544],[103.663873,25.493127],[103.663781,25.494378],[103.66415,25.494962],[103.666503,25.495341],[103.670246,25.495216],[103.678146,25.497743],[103.680529,25.499751],[103.681223,25.501003],[103.682899,25.500795],[103.683881,25.498969],[103.684401,25.501421],[103.686077,25.502725],[103.686597,25.503768],[103.685499,25.505854],[103.685744,25.507817],[103.687663,25.506925],[103.688225,25.508447],[103.69038,25.509082],[103.690661,25.511238],[103.694957,25.511603],[103.693641,25.513196],[103.691577,25.512335],[103.690782,25.513899],[103.69214,25.516225],[103.694118,25.516225],[103.695481,25.517574],[103.69403,25.519955],[103.692491,25.520193]]
        
        //西山社区
        //polygon: [[103.682222,25.50563],[103.683026,25.504905],[103.684486,25.504501],[103.686106,25.503945],[103.687295,25.503594],[103.688505,25.503279],[103.691898,25.501394],[103.69532,25.498765],[103.696199,25.495552],[103.695829,25.494049],[103.695181,25.492547],[103.694349,25.490627],[103.694467,25.488835],[103.694589,25.487023],[103.696839,25.485234],[103.697248,25.484354],[103.696644,25.482258],[103.700258,25.48023],[103.709383,25.481802],[103.720989,25.487894],[103.722545,25.492084],[103.721922,25.49502],[103.724018,25.498678],[103.728185,25.503204],[103.729749,25.506434],[103.724476,25.510408],[103.721332,25.515262],[103.719658,25.519541],[103.718583,25.52292],[103.715282,25.522769],[103.710324,25.523918],[103.708716,25.524371],[103.704562,25.52422],[103.700514,25.521188],[103.697885,25.521976],[103.695608,25.520978],[103.693786,25.5218],[103.693314,25.523194],[103.692159,25.523532],[103.690809,25.522549],[103.690386,25.521418],[103.690647,25.520024],[103.691492,25.518174],[103.689821,25.51771],[103.687754,25.517347],[103.688477,25.516354],[103.688778,25.515394],[103.688457,25.514761],[103.687774,25.514543],[103.690042,25.510904],[103.689661,25.508912],[103.688657,25.508278],[103.686443,25.507807],[103.683629,25.506991]]
        polygon: [[103.682222,25.50563],[103.683026,25.504905],[103.684486,25.504501],[103.686106,25.503945],[103.687295,25.503594],[103.688505,25.503279],[103.691898,25.501394],[103.69532,25.498765],[103.696199,25.495552],[103.695829,25.494049],[103.695181,25.492547],[103.694349,25.490627],[103.694467,25.488835],[103.694589,25.487023],[103.696839,25.485234],[103.697248,25.484354],[103.696644,25.482258],[103.700258,25.48023],[103.709383,25.481802],[103.720989,25.487894],[103.722545,25.492084],[103.721922,25.49502],[103.724018,25.498678],[103.728185,25.503204],[103.729749,25.506434],[103.727651,25.507692],[103.724991,25.510227],[103.721332,25.515262],[103.719658,25.519541],[103.718583,25.52292],[103.715282,25.522769],[103.710324,25.523918],[103.708716,25.524371],[103.704562,25.52422],[103.700514,25.521188],[103.697885,25.521976],[103.695608,25.520978],[103.693786,25.5218],[103.693314,25.523194],[103.692159,25.523532],[103.690809,25.522549],[103.690386,25.521418],[103.690647,25.520024],[103.691492,25.518174],[103.689821,25.51771],[103.687754,25.517347],[103.688477,25.516354],[103.688778,25.515394],[103.688457,25.514761],[103.687774,25.514543],[103.690042,25.510904],[103.689661,25.508912],[103.688657,25.508278],[103.686443,25.507807],[103.683629,25.506991]]
        //大海哨社区
        //polygon: [[103.68271,25.502661],[103.683026,25.504905],[103.684486,25.504501],[103.686106,25.503945],[103.687295,25.503594],[103.688505,25.503279],[103.691898,25.501394],[103.69532,25.498765],[103.696199,25.495552],[103.695829,25.494049],[103.695181,25.492547],[103.694349,25.490627],[103.694467,25.488835],[103.694589,25.487023],[103.696839,25.485234],[103.697248,25.484354],[103.696644,25.482258],[103.700258,25.48023],[103.698074,25.478789],[103.69412,25.479607],[103.690577,25.475368],[103.679363,25.473003],[103.669769,25.470455],[103.668979,25.466379],[103.671302,25.462865],[103.675586,25.461674],[103.675751,25.459369],[103.667219,25.453238],[103.658282,25.453767],[103.649234,25.454857],[103.634337,25.454103],[103.628676,25.456648],[103.623338,25.456994],[103.621367,25.458212],[103.619743,25.460754],[103.617144,25.465788],[103.614149,25.471198],[103.614149,25.475095],[103.617173,25.476158],[103.619307,25.475873],[103.620922,25.478647],[103.621947,25.477953],[103.623068,25.478357],[103.623645,25.480324],[103.625022,25.479832],[103.626176,25.480353],[103.62656,25.481943],[103.627905,25.482955],[103.630512,25.482428],[103.630431,25.486396],[103.631179,25.486648],[103.633784,25.48701],[103.634221,25.485828],[103.633918,25.483754],[103.63552,25.484478],[103.637098,25.488736],[103.63934,25.492476],[103.642157,25.496089],[103.644848,25.493664],[103.646457,25.4945],[103.648894,25.495248],[103.651721,25.495248],[103.653671,25.495468],[103.653086,25.493356],[103.654061,25.492124],[103.652989,25.490496],[103.65372,25.489],[103.656753,25.49278],[103.660449,25.49338],[103.660868,25.49493],[103.667203,25.494996],[103.675941,25.498178],[103.677625,25.500783],[103.67985,25.500566],[103.680992,25.498504],[103.681848,25.49957],[103.681318,25.501775]]
        //西苑社区
        //polygon: [[103.758318,25.509721],[103.762393,25.509672],[103.765973,25.509654],[103.767326,25.50942],[103.768901,25.508818],[103.77169,25.506834],[103.772962,25.505666],[103.771229,25.503865],[103.770286,25.503113],[103.769255,25.502618],[103.769369,25.500616],[103.771111,25.499779],[103.77384,25.501295],[103.776481,25.50335],[103.777251,25.50294],[103.77812,25.503243],[103.778969,25.504366],[103.780131,25.505135],[103.782456,25.505293],[103.785255,25.50546],[103.787035,25.50626],[103.78801,25.507821],[103.785574,25.507601],[103.784623,25.508129],[103.784039,25.508986],[103.784939,25.511322],[103.779618,25.512251],[103.776356,25.513723],[103.771635,25.516309],[103.7667,25.517906],[103.762052,25.518528],[103.758374,25.518371]]
        //冯官桥社区
        //polygon: [[103.758318,25.509721],[103.762393,25.509672],[103.765973,25.509654],[103.767326,25.50942],[103.768901,25.508818],[103.77169,25.506834],[103.772962,25.505666],[103.771229,25.503865],[103.770286,25.503113],[103.769255,25.502618],[103.769369,25.500616],[103.771111,25.499779],[103.768354,25.49871],[103.770121,25.49768],[103.773051,25.498037],[103.775566,25.497705],[103.77347,25.496465],[103.771652,25.49566],[103.769762,25.495886],[103.769691,25.492538],[103.77265,25.492281],[103.772088,25.489626],[103.770418,25.489017],[103.770483,25.486756],[103.771927,25.485047],[103.772313,25.482409],[103.771253,25.480497],[103.769616,25.481221],[103.769428,25.485633],[103.767087,25.485504],[103.764691,25.485708],[103.762768,25.484183],[103.759355,25.48295],[103.757072,25.484428],[103.75655,25.485358],[103.755445,25.486169],[103.753957,25.486079],[103.754003,25.487612],[103.753406,25.490109],[103.75537,25.493362],[103.756152,25.49495],[103.755175,25.495346],[103.753015,25.496893],[103.752292,25.498253],[103.752051,25.50032],[103.750183,25.501353],[103.750303,25.503638],[103.748684,25.507375],[103.744283,25.508948],[103.739881,25.508865],[103.734698,25.509814],[103.732515,25.510075],[103.730845,25.510973],[103.728758,25.513088],[103.734537,25.515956],[103.738846,25.517511],[103.74341,25.518444],[103.751398,25.518798],[103.758374,25.518371]]
        //polygon: [[103.758318,25.509721],[103.762393,25.509672],[103.765973,25.509654],[103.767326,25.50942],[103.768901,25.508818],[103.77169,25.506834],[103.772962,25.505666],[103.771229,25.503865],[103.770286,25.503113],[103.769255,25.502618],[103.769369,25.500616],[103.771111,25.499779],[103.768354,25.49871],[103.770121,25.49768],[103.773051,25.498037],[103.775566,25.497705],[103.77347,25.496465],[103.771652,25.49566],[103.769762,25.495886],[103.769691,25.492538],[103.77265,25.492281],[103.772088,25.489626],[103.770418,25.489017],[103.770483,25.486756],[103.771927,25.485047],[103.772313,25.482409],[103.771253,25.480497],[103.769616,25.481221],[103.769428,25.485633],[103.767087,25.485504],[103.764691,25.485708],[103.762768,25.484183],[103.759355,25.48295],[103.757072,25.484428],[103.75655,25.485358],[103.755445,25.486169],[103.753957,25.486079],[103.754003,25.487612],[103.753406,25.490109],[103.75537,25.493362],[103.756152,25.49495],[103.755175,25.495346],[103.753015,25.496893],[103.752292,25.498253],[103.752051,25.50032],[103.750183,25.501353],[103.750303,25.503638],[103.748684,25.507375],[103.744283,25.508948],[103.739881,25.508865],[103.734698,25.509814],[103.732515,25.510075],[103.730845,25.510973],[103.724991,25.510227],[103.728741,25.512925],[103.734537,25.515956],[103.738846,25.517511],[103.74341,25.518444],[103.751398,25.518798],[103.758374,25.518371]]
        //polygon: [[103.758318,25.509721],[103.762393,25.509672],[103.765973,25.509654],[103.767326,25.50942],[103.768901,25.508818],[103.77169,25.506834],[103.772962,25.505666],[103.771229,25.503865],[103.770286,25.503113],[103.769255,25.502618],[103.769369,25.500616],[103.771111,25.499779],[103.768354,25.49871],[103.770121,25.49768],[103.773051,25.498037],[103.775566,25.497705],[103.77347,25.496465],[103.771652,25.49566],[103.769762,25.495886],[103.769691,25.492538],[103.77265,25.492281],[103.772088,25.489626],[103.770418,25.489017],[103.770483,25.486756],[103.771927,25.485047],[103.772313,25.482409],[103.771253,25.480497],[103.769616,25.481221],[103.769428,25.485633],[103.767087,25.485504],[103.764691,25.485708],[103.762768,25.484183],[103.759355,25.48295],[103.757072,25.484428],[103.75655,25.485358],[103.755445,25.486169],[103.753957,25.486079],[103.754003,25.487612],[103.753406,25.490109],[103.75537,25.493362],[103.756152,25.49495],[103.755175,25.495346],[103.753015,25.496893],[103.752292,25.498253],[103.752051,25.50032],[103.750183,25.501353],[103.750303,25.503638],[103.748232,25.504851],[103.745129,25.505661],[103.739999,25.505777],[103.732049,25.505777],[103.729749,25.506434],[103.727651,25.507692],[103.724991,25.510227],[103.728741,25.512925],[103.734537,25.515956],[103.738846,25.517511],[103.74341,25.518444],[103.751398,25.518798],[103.758374,25.518371]]
        //湛大屯
        //polygon: [[103.7209,25.498843],[103.710342,25.496796],[103.723247,25.496231],[103.721917,25.49489],[103.715739,25.493054],[103.708387,25.490725],[103.706353,25.489383],[103.703929,25.4855],[103.701739,25.481547],[103.700018,25.479852],[103.702052,25.47957],[103.702685,25.478243],[103.704144,25.478732],[103.705435,25.478168],[103.705144,25.476927],[103.704519,25.475497],[103.705227,25.474482],[103.707019,25.474971],[103.711435,25.476325],[103.713528,25.476282],[103.71581,25.476513],[103.71931,25.478807],[103.72106,25.479334],[103.724185,25.479033],[103.728152,25.477953],[103.730352,25.476551],[103.733644,25.47734],[103.735685,25.478807],[103.73806,25.478356],[103.741894,25.476588],[103.743477,25.475159],[103.744394,25.474331],[103.745191,25.474986],[103.744212,25.476917],[103.742833,25.478216],[103.742393,25.478956],[103.744572,25.479064],[103.745718,25.47915],[103.74713,25.479561],[103.747036,25.480669],[103.749459,25.480811],[103.750025,25.481578],[103.748922,25.482557],[103.749404,25.483428],[103.751035,25.482848],[103.752804,25.483822],[103.752877,25.48531],[103.753957,25.486079],[103.754003,25.487612],[103.753406,25.490109],[103.75537,25.493362],[103.756152,25.49495],[103.755175,25.495346],[103.753015,25.496893],[103.752292,25.498253],[103.752051,25.50032],[103.750183,25.501353],[103.750303,25.503638],[103.748684,25.507375],[103.744283,25.508948],[103.739881,25.508865],[103.734698,25.509814],[103.732006,25.508161],[103.730364,25.505126],[103.728643,25.503643],[103.726062,25.50082],[103.722699,25.499196]]
        //polygon: [[103.729749,25.506434],[103.728185,25.503204],[103.724018,25.498678],[103.721922,25.49502],[103.722545,25.492084],[103.720989,25.487894],[103.709383,25.481802],[103.700258,25.48023],[103.702052,25.47957],[103.702685,25.478243],[103.704144,25.478732],[103.705435,25.478168],[103.705144,25.476927],[103.704519,25.475497],[103.705227,25.474482],[103.707019,25.474971],[103.711435,25.476325],[103.713528,25.476282],[103.71581,25.476513],[103.71931,25.478807],[103.72106,25.479334],[103.724185,25.479033],[103.728152,25.477953],[103.730352,25.476551],[103.733644,25.47734],[103.735685,25.478807],[103.73806,25.478356],[103.741894,25.476588],[103.743477,25.475159],[103.744394,25.474331],[103.745191,25.474986],[103.744212,25.476917],[103.742833,25.478216],[103.742393,25.478956],[103.744572,25.479064],[103.745718,25.47915],[103.74713,25.479561],[103.747036,25.480669],[103.749459,25.480811],[103.750025,25.481578],[103.748922,25.482557],[103.749404,25.483428],[103.751035,25.482848],[103.752804,25.483822],[103.752877,25.48531],[103.753957,25.486079],[103.754003,25.487612],[103.753406,25.490109],[103.75537,25.493362],[103.756152,25.49495],[103.755175,25.495346],[103.753015,25.496893],[103.752292,25.498253],[103.752051,25.50032],[103.750183,25.501353],[103.750303,25.503638],[103.748232,25.504851],[103.745129,25.505661],[103.739999,25.505777],[103.732049,25.505777],[103.729749,25.506434]]
      },
      styles: {
        fill: '#409EFF',
        stroke: '#000A58',
      },
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

      this.mapInit();
    })
    //this.mapInit();

    this.swx = this.markerStart.position[0];
    this.swy = this.markerStart.position[1];
    this.nex = this.markerEnd.position[0];
    this.ney = this.markerEnd.position[1];
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
    },
    'markerStart.position'(val) {
      console.log(val)
      if (val) {
        this.swx = val[0];
        this.swy = val[1];
      }
    },
    'markerEnd.position'(val) {
      console.log(val)
      if (val) {
        this.nex = val[0];
        this.ney = val[1];
      }
    },
    'drawer.polygon'(val) {
      console.log(JSON.stringify(val))
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
    },
    onMapClick(e) {
      console.log(e);
      //this.swx = e.lnglat.lng
      //this.swy = e.lnglat.lat
    },
    markerClick(e) {
      console.log(e)
    },
    markerRightClick(e) {
      console.log(e)
    },
    markerStartClick(e) {
      console.log(e)
    },
    markerStartRightClick(e) {
      console.log(e)
    },
    markerEndClick(e) {
      console.log(e)
    },
    markerEndRightClick(e) {
      console.log(e)
    },
    firstClick() {
      this.markerIndex = 0
      if (this.marker.position == null) {
        this.marker.position = new Array(2);
      }
      this.marker.position[0] = this.drawer.polygon[0][0]
      this.marker.position[1] = this.drawer.polygon[0][1]
    },
    nextClick() {
      this.markerIndex++
      if (this.marker.position == null) {
        this.marker.position = new Array(2);
      }
      this.marker.position = null
      this.marker.position = new Array(2);
      this.marker.position[0] = this.drawer.polygon[this.markerIndex][0]
      this.marker.position[1] = this.drawer.polygon[this.markerIndex][1]
    },
    endClick() {
      if (this.marker.position == null) {
        this.marker.position = new Array(2);
      }
      this.marker.position[0] = this.drawer.polygon[this.drawer.polygon.length - 1][0]
      this.marker.position[1] = this.drawer.polygon[this.drawer.polygon.length - 1][1]
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="less" scoped>
.info {
  position: absolute;
  right: 10px;
  top: 10px;
  padding-left: 24px;
}
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
