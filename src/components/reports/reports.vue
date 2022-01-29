<template>
  <!-- 面包屑导航 -->
  <el-breadcrumb separator-class="el-icon-arrow-right">
    <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
    <el-breadcrumb-item>数据统计</el-breadcrumb-item>
    <el-breadcrumb-item>数据报表</el-breadcrumb-item>
  </el-breadcrumb>
  <!-- 卡片组件 -->
  <el-card>
    <div id="main" style="width: 1000px; height: 500px"></div>
  </el-card>
</template>
<script>
import axios from '../../plugins/axios.js'
import echarts from 'echarts'
export default {
  async mounted() {
    const res = await axios.get('/reports/type/1')
    if (res.meta.status !== 200) return this.$message.error('图表数据获取失败')
    // 基于准备好的dom，初始化echarts实例
    var myChart = echarts.init(document.getElementById('main'))
    // 使用刚指定的配置项和数据显示图表。
    myChart.setOption(res.data)
  }
}
</script>
<style lang="less" scoped>
</style>
