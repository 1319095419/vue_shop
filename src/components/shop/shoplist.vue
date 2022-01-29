<template>
  <!-- 面包屑导航 -->
  <el-breadcrumb separator-class="el-icon-arrow-right">
    <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
    <el-breadcrumb-item>商品管理</el-breadcrumb-item>
    <el-breadcrumb-item>商品列表</el-breadcrumb-item>
  </el-breadcrumb>
  <!-- 卡片组件 -->
  <el-card class="box-card">
    <!-- 查询区域 -->
    <el-row :gutter="20">
      <el-col :span="8">
        <el-input placeholder="请输入内容" v-model="getGoodsParams.query" clearable @clear="getGoodsList">
          <template #append>
            <el-button icon="el-icon-search" @click="getGoodsList"></el-button>
          </template>
        </el-input>
      </el-col>
      <!-- 添加用户 -->
      <el-col :span="8">
        <el-button type="primary" @click="$router.push('/add')">添加商品</el-button>
      </el-col>
    </el-row>
    <!-- 表格区域 -->
    <el-table :data="goodsData.goods" stripe border style="width: 100%">
      <el-table-column type="index" label="#" width="50"> </el-table-column>
      <el-table-column prop="goods_name" label="商品名称" width="580px"> </el-table-column>
      <el-table-column prop="goods_price" label="商品价格(元)"> </el-table-column>
      <el-table-column prop="goods_weight" label="商品重量"> </el-table-column>
      <el-table-column prop="add_time" label="创建时间" width="140px"> </el-table-column>
      <el-table-column label="操作" width="130px">
        <template #default="scope">
          <el-button type="primary" size="mini" icon="el-icon-edit" @click="pushEditGoodsPage(scope.row.goods_id)"></el-button>
          <el-button type="danger" size="mini" icon="el-icon-delete" @click="deleteGoods(scope.row.goods_id)"></el-button>
        </template>
      </el-table-column>
    </el-table>
    <!-- 分页区域 -->
    <el-pagination
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      :current-page="getGoodsParams.pagenum"
      :page-sizes="[5, 10, 15]"
      :page-size="getGoodsParams.pagesize"
      layout="total, sizes, prev, pager, next, jumper"
      :total="goodsData.total"
    >
    </el-pagination>
  </el-card>
</template>

<script>
import axios from '../../plugins/axios.js'
export default {
  data() {
    return {
      // 获取商品列表时向服务器提交的参数
      getGoodsParams: {
        query: '',
        pagenum: 1,
        pagesize: 5
      },
      // 商品数据
      goodsData: {
        goods: [],
        total: 0
      },
      // 添加用户表单是否显示
      addFormVisible: false,
      // 添加用户表单数据，发送请求时需携带
      addFormData: {
        username: '',
        password: '',
        email: '',
        mobile: ''
      },
      // 添加用户表单验证规则
      addFormRules: {
        username: [{ required: true, message: '用户名为必填项', trigger: 'blur' }],
        password: [
          { required: true, message: '密码为必填项', trigger: 'blur' },
          {
            min: 6,
            max: 15,
            message: '密码长度在 6 到 15 个字符',
            trigger: 'blur'
          }
        ],
        email: [{ required: true, message: '邮箱为必填项', trigger: 'blur' }, { trigger: 'blur' }],
        mobile: [{ trigger: 'blur' }, { trigger: 'blur' }]
      }
    }
  },
  methods: {
    // 每页显示数据条数发生变化时触发
    handleSizeChange(newSize) {
      this.getGoodsParams.pagesize = newSize
      this.getGoodsList()
    },
    // 页码发生变化时触发
    handleCurrentChange(newpage) {
      this.getGoodsParams.pagenum = newpage
      this.getGoodsList()
    },
    // 删除商品
    async deleteGoods(id) {
      const result = await this.$confirm('此操作将永久删除该商品, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch((err) => err)
      if (result !== 'confirm') return this.$message('取消了删除')
      const res = await axios.delete('/goods/' + id)
      if (res.meta.status !== 200) return this.message.err('删除商品失败')
      this.$message.success('删除商品成功')
      this.getGoodsList()
    },
    // 获取商品列表
    async getGoodsList() {
      const res = await axios.get('/goods', { params: this.getGoodsParams })
      if (res.meta.status !== 200) return this.$message.error('商品数据获取失败')
      // 修正日期格式
      res.data.goods.map((item, index) => {
        const date = new Date(item.add_time)
        const yy = date.getFullYear()
        const MM = String(date.getMonth() + 1).padStart(2, '0')
        const dd = String(date.getDate()).padStart(2, '0')
        const hh = String(date.getHours()).padStart(2, '0')
        const mm = String(date.getMinutes()).padStart(2, '0')
        const ss = String(date.getSeconds()).padStart(2, '0')
        res.data.goods[index].add_time = `${yy}-${MM}-${dd} ${hh}:${mm}:${ss}`
      })
      this.goodsData.goods = res.data.goods
      this.goodsData.total = res.data.total
    },
    // 点击编辑按钮跳转到编辑页面
    pushEditGoodsPage(id) {
      this.$router.push('/edit/' + id)
    }
  },
  created() {
    this.getGoodsList()
  }
}
</script>

<style lang="less" scoped>
</style>
