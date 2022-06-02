<template>
  <el-row>
    <el-col :span="4">
      <el-menu
        default-active="2"
        class="el-menu-vertical-demo"
        @open="handleOpen"
        @close="handleClose"
        @select="select"
        background-color="#545c64"
        text-color="#fff"
        active-text-color="#ffd04b">
        <el-submenu index="1">
          <template slot="title">
            <i class="el-icon-location"></i>
            <span>组件功能</span>
          </template>
          <el-menu-item-group>
            <!--<template slot="title">分组一</template>-->
            <el-menu-item index="vueMap">vueMap</el-menu-item>
            <el-menu-item index="echats">echats</el-menu-item>
          </el-menu-item-group>
          <el-menu-item-group title="分组2">
            <el-menu-item index="test">test</el-menu-item>
          </el-menu-item-group>
          <el-submenu index="1-4">
            <template slot="title">选项4</template>
            <el-menu-item index="1-4-1">选项1</el-menu-item>
          </el-submenu>
        </el-submenu>
        <el-menu-item index="2">
          <i class="el-icon-menu"></i>
          <span slot="title">导航二</span>
        </el-menu-item>
        <el-menu-item index="3" disabled>
          <i class="el-icon-document"></i>
          <span slot="title">导航三</span>
        </el-menu-item>
        <el-menu-item index="4">
          <i class="el-icon-setting"></i>
          <span slot="title">导航四</span>
        </el-menu-item>
      </el-menu>
    </el-col>
    <el-col :span="20">
      <ContentVue :view="view"/>
    </el-col>
  </el-row>
</template>

<script>
import ContentVue from '@/components/content.vue'
export default {
  name: 'home',
  components: {
    ContentVue
  },
  data() {
    return {
      zoom: 5,
      activeItem: null,
      hoverItem: null,
      view: '',
      menuList: [{
          id: 1,
          title: "VueMap",
          url: "/vueMap"
        },
        {
          id: 2,
          title: "EchatsMap",
          url: "/echatsMap"
        }
      ]
    }
  },
  created() {

  },
  mounted() {
  },
  watch: {
    activeItem(item) {
      if (!item) return;
      console.log(item);
    }
  },
  methods: {
    handleOpen() {
    },
    handleClose() {
    },
    select(e) {
      console.log(e)
      this.view = e
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="less" scoped>

.el-menu {
  height: 100vh;
}
</style>
