<template>
  <!-- 面包屑导航 -->
  <el-breadcrumb separator-class="el-icon-arrow-right">
    <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
    <el-breadcrumb-item>商品管理</el-breadcrumb-item>
    <el-breadcrumb-item>参数列表</el-breadcrumb-item>
  </el-breadcrumb>
  <!-- 卡片 -->
  <el-card>
    <!-- 警告组件 -->
    <el-alert title="注意：只允许为第三级分类设置相关参数！" type="warning" show-icon> </el-alert>
    <el-row class="goodscate_select">
      <!-- 级联选择器 -->
      <el-col>
        <span>选择商品分类：</span>
        <el-cascader v-model="selectGoodsCate" :options="goodsCateList" :props="goodsCateListProps" @change="GoodsCateChangeHandle"></el-cascader>
      </el-col>
    </el-row>
    <!-- tab切换组件 -->
    <el-tabs v-model="activeTabName" @tab-click="handleTabClick">
      <!-- 根据是否选中分类来判断按钮是否可交互 -->
      <el-tab-pane label="动态参数" name="many">
        <el-button type="primary" size="mini" :disabled="selectGoodsCate.length !== 3" @click="addBtnHandle">添加参数</el-button>
        <!-- 表格区域 -->
        <el-table :data="tableData" stripe border style="width: 100%">
          <el-table-column type="expand">
            <template #default="scope">
              <el-tag v-for="(item, index) in scope.row.attr_vals" :key="index" closable @close="deleteTagHandle(item, scope.row)">
                {{ item }}
              </el-tag>
              <el-input class="input-new-tag" v-if="addTagVisible" v-model="newTagValue" ref="saveTagInput" size="small" @keyup.enter="handleInputConfirm" @blur="handleInputConfirm"> </el-input>
              <el-button v-else class="button-new-tag" size="small" @click="showAddInput(scope.row)">+ New Tag</el-button>
            </template>
          </el-table-column>
          <el-table-column type="index" label="#"></el-table-column>
          <el-table-column prop="attr_name" label="参数名称"> </el-table-column>
          <el-table-column label="操作">
            <template #default="scope">
              <el-button type="danger" icon="el-icon-edit" size="mini" @click="editParamsHandle(scope.row)">编辑</el-button>
              <el-button type="primary" icon="el-icon-delete" size="mini" @click="deleteParamsHandle(scope.row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>
      <el-tab-pane label="静态属性" name="only">
        <el-button type="primary" size="mini" :disabled="selectGoodsCate.length !== 3" @click="addBtnHandle">添加属性</el-button>
        <!-- 表格区域 -->
        <!-- 表格区域 -->
        <el-table :data="tableData" stripe border style="width: 100%">
          <el-table-column type="expand">
            <template #default="scope">
              <el-tag v-for="(item, index) in scope.row.attr_vals" :key="index" closable @close="deleteTagHandle(item, scope.row)">
                {{ item }}
              </el-tag>
              <el-input class="input-new-tag" v-if="addTagVisible" v-model="newTagValue" ref="saveTagInput" size="small" @keyup.enter="handleInputConfirm" @blur="handleInputConfirm"> </el-input>
              <el-button v-else class="button-new-tag" size="small" @click="showAddInput(scope.row)">+ New Tag</el-button>
            </template>
          </el-table-column>
          <el-table-column type="index" label="#"></el-table-column>
          <el-table-column prop="attr_name" label="参数名称"> </el-table-column>
          <el-table-column label="操作">
            <template #default="scope">
              <el-button type="danger" icon="el-icon-edit" size="mini" @click="editParamsHandle(scope.row)">编辑</el-button>
              <el-button type="primary" icon="el-icon-delete" size="mini" @click="deleteParamsHandle(scope.row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>
    </el-tabs>
  </el-card>
  <!-- 添加参数或属性对话框 -->
  <el-dialog :title="this.activeTabName === 'many' ? '添加动态参数' : '添加静态属性'" v-model="addDialogVisible" width="50%" :before-close="addCloseHandle">
    <!-- 添加参数或属性表单 -->
    <el-form :model="addParamsForm" :rules="addRules" ref="addFormRef" label-width="100px" class="demo-ruleForm">
      <el-form-item :label="this.activeTabName === 'many' ? '动态参数' : '静态属性'" prop="attr_name">
        <el-input v-model="addParamsForm.attr_name"></el-input>
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="addCloseHandle">取 消</el-button>
        <el-button type="primary" @click="addParamSure">确 定</el-button>
      </span>
    </template>
  </el-dialog>
  <!-- 编辑参数或属性对话框 -->
  <el-dialog :title="this.activeTabName === 'many' ? '修改动态参数' : '修改静态属性'" v-model="editDialogVisible" width="50%" :before-close="editCloseHandle">
    <!-- 添加参数或属性表单 -->
    <el-form :model="editParamsForm" :rules="editRules" ref="editFormRef" label-width="100px" class="demo-ruleForm">
      <el-form-item :label="this.activeTabName === 'many' ? '动态参数' : '静态属性'" prop="attr_name">
        <el-input v-model="editParamsForm.attr_name"></el-input>
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="editCloseHandle">取 消</el-button>
        <el-button type="primary" @click="editParamSure">确 定</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script>
import axios from '../../plugins/axios.js'
import _ from 'lodash'
export default {
  data() {
    return {
      // 商品分类列表
      goodsCateList: [],
      // 商品分类列表配置（级联选择器)
      goodsCateListProps: {
        expandTrigger: 'hover',
        value: 'cat_id',
        label: 'cat_name'
      },
      // 选中的商品分类
      selectGoodsCate: [],
      // 选中的动态参数或静态属性
      param: null,
      // 选中的tab名称
      activeTabName: 'many',
      // 表格数据
      tableData: [],
      // 添加参数或属性对话框的显示和隐藏
      addDialogVisible: false,
      // 添加参数或属性表单数据
      addParamsForm: {
        attr_name: ''
      },
      // 添加参数或属性表单数据验证规则
      addRules: {
        attr_name: [{ required: true, message: '请输入参数或属性名称', trigger: 'blur' }]
      },
      // 修改参数或属性对话框的显示和隐藏
      editDialogVisible: false,
      // 修改参数或属性表单数据
      editParamsForm: {
        attr_name: ''
      },
      // 修改参数或属性表单数据验证规则
      editRules: {
        attr_name: [{ required: true, message: '请输入参数或属性名称', trigger: 'blur' }]
      },
      // New Tag状态切换
      addTagVisible: false,
      // New Tag输入内容
      newTagValue: ''
    }
  },
  methods: {
    // 获取商品分类列表
    async getGoodsCateList() {
      const res = await axios.get('/categories')
      if (res.meta.status !== 200) return this.$message.error('获取分类列表失败')
      this.goodsCateList = res.data
    },
    // 分类发生变化时获取参数
    GoodsCateChangeHandle() {
      this.getParamsList()
    },
    // 查询参数列表
    async getParamsList() {
      const res = await axios.get(`/categories/${this.selectGoodsCate[2]}/attributes`, { params: { sel: this.activeTabName } })
      if (res.meta.status !== 200) return this.$message.error('获取参数列表失败')
      res.data.map((item) => {
        item.attr_vals = item.attr_vals === '' ? [] : item.attr_vals.split(' ')
        item.addTagVisible = false
        item.newTagValue = ''
      })
      this.tableData = res.data
    },
    // tab切换事件处理函数
    handleTabClick() {
      this.getParamsList()
    },
    // 添加按钮点击事件监听
    addBtnHandle() {
      this.addDialogVisible = !this.addDialogVisible
    },
    // 关闭添加参数对话框的函数处理
    addCloseHandle() {
      this.$refs.addFormRef.resetFields()
      this.addDialogVisible = !this.addDialogVisible
    },
    // 点击添加参数对话框中确认按钮的函数处理
    async addParamSure() {
      // 表单验证
      const result = await this.$refs.addFormRef.validate().catch((err) => err)
      if (result !== true) return
      // 验证通过发送请求添加参数
      const bodyData = {
        attr_name: this.addParamsForm.attr_name,
        attr_sel: this.activeTabName
      }
      const res = await axios.post(`/categories/${this.selectGoodsCate[2]}/attributes`, bodyData)
      if (res.meta.status !== 201) return this.$message.error('添加失败')
      this.$message.success('添加成功')
      this.getParamsList()
      this.addParamsForm.attr_name = ''
      this.addDialogVisible = !this.addDialogVisible
    },
    // 编辑按钮事件监听
    editParamsHandle(row) {
      this.param = row
      this.editParamsForm.attr_name = row.attr_name
      this.editDialogVisible = !this.editDialogVisible
    },
    // 关闭添加参数对话框的函数处理
    editCloseHandle() {
      this.$refs.editFormRef.resetFields()
      this.editDialogVisible = !this.editDialogVisible
    },
    // 点击修改参数对话框中确认按钮的函数处理
    async editParamSure() {
      // 表单验证
      const result = await this.$refs.editFormRef.validate().catch((err) => err)
      if (result !== true) return
      // 验证通过发送请求修改参数
      const attrValsClone = _.cloneDeep(this.param.attr_vals)
      const bodyData = {
        attr_name: this.editParamsForm.attr_name,
        attr_sel: this.activeTabName,
        attr_vals: attrValsClone.join(' ')
      }
      const res = await axios.put(`/categories/${this.param.cat_id}/attributes/${this.param.attr_id}`, bodyData)
      if (res.meta.status !== 200) return this.$message.error('修改失败')
      this.$message.success('修改成功')
      this.getParamsList()
      this.editParamsForm.attr_name = ''
      this.editDialogVisible = !this.editDialogVisible
    },
    // 删除按钮事件监听
    async deleteParamsHandle(row) {
      console.log(row)
      // 弹出确认删除弹框
      const result = await this.$confirm('此操作将永久删除该参数, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch((err) => err)
      if (result !== 'confirm') return this.$message('取消删除')
      // 点击了确认删除按钮，开始删除
      const res = await axios.delete(`/categories/${row.cat_id}/attributes/${row.attr_id}`)
      if (res.meta.status !== 200) return this.$message.error('删除失败')
      this.$message.success('删除成功')
      this.getParamsList()
    },
    // New Tag点击按钮事件监听
    showAddInput(row) {
      // 显示输入框
      this.addTagVisible = !this.addTagVisible
      // 将输入框对应的参数行数据存入data
      this.param = row
      // 输入框选中
      this.$nextTick(() => {
        this.$refs.saveTagInput.$refs.input.focus()
      })
    },
    // New Tag输入框内容变化事件监听
    handleInputConfirm() {
      // 输入内容是否为空
      if (this.newTagValue.trim()) {
        this.param.attr_vals.push(this.newTagValue)
        this.editAttrVal('添加')
      }
      this.newTagValue = ''
      this.addTagVisible = false
    },
    // 删除tag事件处理函数
    deleteTagHandle(tag, row) {
      // 将输入框对应的参数行数据存入data
      this.param = row
      // 删除参数的attr_vals数组中的数据
      this.param.attr_vals.splice(this.param.attr_vals.indexOf(tag), 1)
      // 向服务器发送attr_val修改请求
      this.editAttrVal('删除')
    },
    // 向服务器发送attr_val修改请求
    async editAttrVal(msg) {
      const attrValsClone = _.cloneDeep(this.param.attr_vals)
      const bodyData = {
        attr_name: this.param.attr_name,
        attr_sel: this.activeTabName,
        attr_vals: attrValsClone.join(' ')
      }
      const res = await axios.put(`/categories/${this.param.cat_id}/attributes/${this.param.attr_id}`, bodyData)
      if (res.meta.status !== 200) {
        this.param.attr_vals.pop()
        return this.$message.error(msg + '失败')
      }
      this.$message.success(msg + '成功')
    }
  },
  created() {
    this.getGoodsCateList()
  }
}
</script>
<style lang="less" scoped>
.goodscate_select {
  margin: 15px 0;
}
.el-tag {
  margin: 10px;
}
.input-new-tag {
  width: 120px;
}
</style>
