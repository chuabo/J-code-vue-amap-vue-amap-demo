<template>
  <div id="map" style="height: 100vh; width: 100vw"></div>
</template>
 
<script>
import "ol/ol.css";
import { Map, View, Feature } from "ol";
import { OSM, Vector as VectorSource } from "ol/source";
import { Vector as VectorLayer, Tile as TileLayer } from "ol/layer";
import { fromExtent } from "ol/geom/Polygon";
import GeoJSON from "ol/format/GeoJSON";
import {
    Style,
    Stroke,
    Fill,
    Icon,
    Text,
    Circle as CircleStyle
} from "ol/style";
 
import { Point, LineString, LinearRing, Polygon } from "ol/geom";
import { createProjection, Projection } from 'ol/proj'

//import areaGeo from "/assets/xs.json";
//import areaGeo from '/assets/bound.json'
import areaGeo from '/assets/bound2.json'

export default {
  data() {
    return {
      map: {},
      vectorLayer: {},
      coverLayer: null,
      geojsonData: {
        type: "FeatureCollection",
        features: [
          {
            type: "Feature",
            geometry: {
              type: "Point",
              coordinates: [0, 0],
            },
          },
        ],
      },
      vtSource: null
    };
  },
  created() {},
  mounted() {
    this.initMap();
    //this.addLayer();
    this.testAddShade();
  },
  computed: {},
  methods: {
    initMap() {
      this.map = new Map({
        target: "map",
        layers: [
          new TileLayer({
            source: new OSM(),
          }),
        ],
        view: new View({
          projection: "EPSG:4326",
          center: [103.763195,25.523818],
          zoom: 18,
        }),
      });

      /*let mystyle = new Style({
        fill: new Fill({
          color: 'rgba(72, 61, 139, 0.4)'
        }),
        stroke: new Stroke({
          color: '#BDBDBD',
          width: 2
        })
      })
      this.coverLayer = new VectorLayer({
        source: new VectorSource(),
        style: mystyle
      })
      this.map.addLayer(this.coverLayer)*/
      //this.addConvertLayer(areaGeo)

      // 遮罩样式
      const shadeStyle = new Style({
        fill: new Fill({
          color: 'rgba(0, 0, 0, 0.5)'
        }),
        stroke: new Stroke({
          width: 1,
          color: '#ccc'
        })
      })
      // 遮罩数据源
      this.vtSource = new VectorSource()
      // 遮罩图层
      const vtLayer = new VectorLayer({
        source: this.vtSource,
        style: shadeStyle
      })

      this.map.addLayer(vtLayer)
    },
    addLayer() {
      this.vectorLayer = new VectorLayer({
        source: new VectorSource(),
      });
      this.vectorLayer.getSource().addFeature(
        //添加点图层
        new Feature({
          geometry: new Point([104.2979180563, 30.528298024]),
        })
        //添加线图层
        // new Feature({
        //   geometry: new LineString([
        //     [104.2979180563, 30.528298024],
        //     [104.2987389704, 30.527798338],
        //   ]),
        // })
        //添加面图层
        // new Feature({
        //   geometry: new Polygon([
        //     [
        //       [104.2979180563, 30.528298024],
        //       [104.2987389704, 30.527798338],
        //       [104.2974397847, 30.5265062907],
        //       [104.2979180563, 30.528298024],
        //     ],
        //   ]),
        // })
      );
      this.map.addLayer(this.vectorLayer);

      
 
      //let features = new GeoJSON().readFeatures(this.geojsonData)
      //console.log(features)
    },
    addConvertLayer(data) {
      //let fts = (new ol.format.GeoJSON()).readFeature(data);
      //let fts = new GeoJSON().readFeature(data);
      let fts = new GeoJSON().readFeatures(this.geojsonData)
      let areaFeature = null;
      data.forEach(g => {
        let lineData = g.features[0]
          let geom = this.arase(lineData.geometry);

          let coverFt = new Feature({
            geometry: geom
          })
          this.coverLayer.getSource().addFeature(coverFt)
      });
    },
    arase(geom) {
      let extent = [-180, -90, 180, 90];
      let ring = new fromExtent(extent)
      if (!geom instanceof Polygon) {
        return
      }
      //coords = geom.getCoordinates();
      geom.coordinates.forEach(coord => {
        let lineRing = new LinearRing(coord[0],coord[1])
        ring.appendLinearRing(lineRing)
      })
      return ring
    },

    /**
     * 擦除操作
     * @param {LineString | MultiLineString | Polygon | MultiPolygon} geom 必选参数
     * @param { View } view 必选参数
     * @returns {Polygon}
     */
    erase2 (geom, view) {
      var part = this.getCoordsGroup(geom)
      if (!part) {
        return
      }
      var extent = view.getProjection().getExtent()
      var polygonRing = fromExtent(extent);
      part.forEach((item) => {
        let linearRing = new LinearRing(item);
        polygonRing.appendLinearRing(linearRing);
      })
      return polygonRing
    },
    /**
     * 添加遮罩
     * @param {LineString | MultiLineString | Polygon | MultiPolygon} geom 必选参数
     * @param { View } view 必选参数
     * @param { String } dataProjection geom的坐标系,只支持epsg:4326 || epsg:3857, 可选参数, 当地图的坐标系与遮罩数据的坐标系不一致时，需求提供数据的坐标系
     * @returns { Feature }
     */
    createShade (geom, view, dataProjection) {
      //if (geom instanceof Geometry) {
        dataProjection = dataProjection.toUpperCase()
        const source = geom.clone()
        if(['EPSG:4326', 'EPSG:3857'].includes(dataProjection) && view instanceof View) {
          const projection = createProjection(dataProjection)
          const mapProjection = view.getProjection()
          const mapProjetionCode = mapProjection.getCode()
          if (projection.getCode() !== mapProjetionCode && ['EPSG:4326', 'EPSG:3857'].includes(mapProjetionCode)) {
            source.transform(projection, mapProjection)
          }
        }

        var polygon = this.erase2(source, view)
        var feature = new Feature({
          geometry: polygon
        })
        return {
          feature,
          shade: source
        }
      //}
    },
    /**
     * geom转坐标数组
     * @param {LineString | MultiLineString | Polygon | MultiPolygon} geom 
     * @returns {Array<Array<import("ol/coordinate").Coordinate>>} 返回geom中的坐标
     */
    getCoordsGroup(geom) {
      var group = [] // 
      var geomType = geom.getType()
      if (geomType === 'LineString') {
        group.push(geom.getCoordinates())
      } else if (geomType === 'MultiLineString') {
        group = geom.getCoordinates()
      } else if (geomType === 'Polygon') {
        group = geom.getCoordinates()
      } else if (geomType === 'MultiPolygon') {
        geom.getPolygons().forEach((poly) => {
          var coords = poly.getCoordinates()
          group = group.concat(coords)
        })
      } else {
        console.log('暂时不支持的类型')
      }
      return group
    },
    testAddShade () {
      //fetch('/assets/bound.geojson').then((res) => {
      //  return res.json()
      //}).then((data) => {
        const features = new GeoJSON().readFeatures(areaGeo)
        const ft = features[0]
        const bound = ft.getGeometry()
        const result = this.createShade(bound, this.map.getView(), 'epsg:4326')
        if (result) {
          this.vtSource.addFeature(result.feature)
          this.map.getView().fit(result.shade)
        }
      //})
    },

  }
};
</script>