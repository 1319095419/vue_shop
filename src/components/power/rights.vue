<template>
  <!-- 面包屑导航 -->
  <el-breadcrumb separator-class="el-icon-arrow-right">
    <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
    <el-breadcrumb-item>权限管理</el-breadcrumb-item>
    <el-breadcrumb-item>权限列表</el-breadcrumb-item>
  </el-breadcrumb>
  <!-- 卡片组件 -->
  <el-card class="box-card">
    <!-- 表格区域 -->
    <el-table :data="rightsData" stripe border style="width: 100%">
      <el-table-column type="index" label="#" width="50"> </el-table-column>
      <el-table-column prop="authName" label="权限名称"> </el-table-column>
      <el-table-column prop="path" label="路径"> </el-table-column>
      <el-table-column label="权限等级">
        <template #default="scope">
          <el-tag v-if="scope.row.level === '0'">一级</el-tag>
          <el-tag type="success" v-else-if="scope.row.level === '1'">二级</el-tag>
          <el-tag type="warning" v-else-if="scope.row.level === '2'">三级</el-tag>
        </template>
      </el-table-column>
    </el-table>
  </el-card>
</template>

<script>
import axios from '../../plugins/axios.js'
export default {
  data() {
    return {
      rightsData: []
    }
  },
  methods: {
    // 获取用户权限列表
    async getRightsList() {
      const res = await axios.get('/rights/list')
      if (res.meta.status !== 200) return res.$message.error('获取用户权限列表失败')
      // 用户权限列表获取成功
      this.rightsData = res.data
    }
  },
  created() {
    this.getRightsList()
  }
}
</script>

<style lang="less" scoped>
</style>
