<template>
  <!-- 面包屑导航 -->
  <el-breadcrumb separator-class="el-icon-arrow-right">
    <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
    <el-breadcrumb-item>商品管理</el-breadcrumb-item>
    <el-breadcrumb-item>商品分类</el-breadcrumb-item>
  </el-breadcrumb>
  <!-- 卡片组件 -->
  <el-card>
    <!-- 添加分类按钮 -->
    <el-button type="primary" @click="addBtnHandle">添加分类</el-button>
    <!-- 层级表格组件 -->
    <el-table :data="shopCateByTable.shopCateList" style="width: 100%" row-key="cat_id" border :tree-props="{ children: 'children', hasChildren: 'hasChildren' }">
      <el-table-column label="#" type="index" width="65px">
        <template #default="scope">
          {{ scope.row.index }}
        </template>
      </el-table-column>
      <el-table-column label="分类名称" prop="cat_name"> </el-table-column>
      <el-table-column label="是否有效">
        <template #default="scope">
          <i style="color: #bfef90" class="el-icon-success" v-if="!scope.row.cat_deleted"></i>
          <i class="el-icon-error" style="color: #f56c6c" v-else></i>
        </template>
      </el-table-column>
      <el-table-column label="排序">
        <template #default="scope">
          <el-tag v-if="scope.row.cat_level === 0">一级</el-tag>
          <el-tag type="success" v-else-if="scope.row.cat_level === 1">二级</el-tag>
          <el-tag type="warning" v-else>三级</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作">
        <template #default="scope">
          <el-button type="primary" icon="el-icon-edit" size="mini" @click="editBtnHandle(scope.row)">编辑</el-button
          ><el-button type="danger" icon="el-icon-delete" size="mini" @click="deleteBtnHandle(scope.row.cat_id)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <!-- 分页组件 -->
    <el-pagination
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      :current-page="shopCateParams.pagenum"
      :page-sizes="[3, 5, 10, 15]"
      :page-size="shopCateParams.pagesize"
      layout="total, sizes, prev, pager, next, jumper"
      :total="shopCateByTable.total"
    >
    </el-pagination>
  </el-card>
  <!-- 添加商品分类对话框 -->
  <el-dialog title="添加商品分类" v-model="addDialogVisible" width="50%" :before-close="handleAddDialogClose">
    <!-- 添加商品分类表单 -->
    <el-form :model="addForm" :rules="addRules" ref="addFormRef" label-width="100px">
      <el-form-item label="分类名称" prop="cat_name">
        <el-input v-model="addForm.cat_name"></el-input>
      </el-form-item>
      <el-form-item label="父级分类">
        <el-cascader style="width: 100%" v-model="addForm.cat_pid" clearable :options="shopCateByInput" :props="goodsCateListProps"></el-cascader>
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="handleAddDialogClose">取 消</el-button>
        <el-button type="primary" @click="addSureHandle">确 定</el-button>
      </span>
    </template>
  </el-dialog>
  <!-- 编辑商品分类对话框 -->
  <el-dialog title="编辑商品分类" v-model="editDialogVisible" width="50%" :before-close="handleEditDialogClose">
    <!-- 编辑商品分类表单 -->
    <el-form :model="editForm" :rules="editRules" ref="editFormRef" label-width="100px">
      <el-form-item label="分类名称" prop="cat_name">
        <el-input v-model="editForm.cat_name"></el-input>
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="handleEditDialogClose">取 消</el-button>
        <el-button type="primary" @click="editSureHandle">确 定</el-button>
      </span>
    </template>
  </el-dialog>
</template>
<script>
import axios from '../../plugins/axios.js'
export default {
  data() {
    return {
      // 获取表格中的分类数据需要向服务器提交的参数
      shopCateParams: {
        pagenum: 1,
        pagesize: 5
      },
      // 商品分类表格数据
      shopCateByTable: {
        total: 0,
        shopCateList: []
      },
      // 商品分类选择框数据
      shopCateByInput: [],
      // 添加商品分类对话框显示和隐藏
      addDialogVisible: false,
      // 添加分类表单数据
      addForm: {
        cat_name: '',
        cat_pid: []
      },
      // 添加分类表单验证规则
      addRules: {
        cat_name: [
          {
            required: true,
            message: '请输入分类名称',
            trigger: 'blur'
          }
        ]
      },
      // 商品分类列表级联选择器配置
      goodsCateListProps: {
        expandTrigger: 'hover',
        checkStrictly: true,
        value: 'cat_id',
        label: 'cat_name'
      },
      // 编辑商品分类对话框显示和隐藏
      editDialogVisible: false,
      // 编辑分类表单数据
      editForm: {
        cat_name: ''
      },
      // 编辑分类表单验证规则
      editRules: {
        cat_name: [
          {
            required: true,
            message: '请输入分类名称',
            trigger: 'blur'
          }
        ]
      },
      // 操作的商品分类项对应的id
      catId: ''
    }
  },
  methods: {
    // 每页展示数据条数发生变化后会执行
    handleSizeChange(newSize) {
      // 将变化后的每页展示数据条数存入data
      this.shopCateParams.pagesize = newSize
      // 发送请求重新获取表格分类列表
      this.getTableCateList()
    },
    // 当前页码发生变化后会执行
    handleCurrentChange(newPage) {
      // 将变化后的页码存入data
      this.shopCateParams.pagenum = newPage
      // 发送请求重新获取表格分类列表
      this.getTableCateList()
    },
    // 点击添加分类按钮事件处理
    addBtnHandle() {
      this.addDialogVisible = !this.addDialogVisible
      this.getInputCateList()
    },
    // 添加分类对话框关闭事件监听
    handleAddDialogClose() {
      this.$refs.addFormRef.resetFields()
      this.addDialogVisible = !this.addDialogVisible
    },
    // 添加分类对话框确认添加事件监听
    async addSureHandle() {
      // 表单验证
      const result = await this.$refs.addFormRef.validate().catch((err) => err)
      if (result !== true) return
      // 表单验证通过,发送请求
      const bodyData = {
        cat_pid: this.addForm.cat_pid.length === 0 ? 0 : this.addForm.cat_pid[this.addForm.cat_pid.length - 1],
        cat_name: this.addForm.cat_name,
        cat_level: this.addForm.cat_pid.length
      }
      const res = await axios.post('/categories', bodyData)
      if (res.meta.status !== 201) return this.$message.error('添加商品分类失败')
      this.$message.success('添加商品分类成功')
      this.getTableCateList()
      this.addDialogVisible = !this.addDialogVisible
      this.addform.cat_name = ''
      this.addform.cat_pid = []
    },
    // 获取填充表格的分类列表数据
    async getTableCateList() {
      const res = await axios.get('/categories', { params: this.shopCateParams })
      if (res.meta.status !== 200) return this.$message.error('获取分类列表数据失败')
      res.data.result.map((item, index) => {
        item.index = index + 1
      })
      this.shopCateByTable.shopCateList = res.data.result
      this.shopCateByTable.total = res.data.total
    },
    // 获取填充选择框的分类列表数据
    async getInputCateList() {
      const res = await axios.get('/categories', { params: { type: 2 } })
      if (res.meta.status !== 200) return this.$message.error('获取分类列表数据失败')
      this.shopCateByInput = res.data
    },
    // 删除商品分类事件监听
    async deleteBtnHandle(id) {
      const result = await this.$confirm('此操作将永久删除该分类, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch((err) => err)
      if (result !== 'confirm') return this.$message('取消了删除')
      // 点击了确认按钮,发送删除请求
      const res = await axios.delete('/categories/' + id)
      if (res.meta.status !== 200) return this.$message.error('删除分类失败')
      this.$message.success('删除分类成功')
      this.getTableCateList()
    },
    // 编辑商品分类事件监听
    async editBtnHandle(row) {
      // 将分类数据存入data中
      this.catId = row.cat_id
      // 将编辑前的分类数据填充表单
      this.editForm.cat_name = row.cat_name
      // 打开编辑分类对话框
      this.editDialogVisible = !this.editDialogVisible
    },
    // 编辑分类对话框关闭事件监听
    handleEditDialogClose() {
      // 关闭对话框
      this.editDialogVisible = !this.editDialogVisible
      // 表单重置
      this.$refs.editFormRef.resetFields()
    },
    // 编辑分类对话框确认按钮事件监听
    async editSureHandle() {
      // 表单验证
      const result = await this.$refs.editFormRef.validate().catch((err) => err)
      if (result !== true) return
      // 表单验证通过,发送请求
      const bodyData = {
        cat_name: this.editForm.cat_name
      }
      const res = await axios.put('/categories/' + this.catId, bodyData)
      if (res.meta.status !== 200) return this.$message.error('编辑商品分类失败')
      this.$message.success('编辑商品分类成功')
      this.getTableCateList()
      this.editDialogVisible = !this.editDialogVisible
    }
  },

  created() {
    this.getTableCateList()
  }
}
</script>
<style lang="less" scoped>
</style>
