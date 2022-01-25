<template>
  <!-- 面包屑导航 -->
  <el-breadcrumb separator-class="el-icon-arrow-right">
    <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
    <el-breadcrumb-item>用户管理</el-breadcrumb-item>
    <el-breadcrumb-item>用户列表</el-breadcrumb-item>
  </el-breadcrumb>
  <!-- 卡片组件 -->
  <el-card class="box-card">
    <!-- 查询区域 -->
    <el-row :gutter="20">
      <el-col :span="8">
        <el-input placeholder="请输入内容" v-model="getUserParams.query" clearable @clear="getUserList">
          <template #append>
            <el-button icon="el-icon-search" @click="getUserList"></el-button>
          </template>
        </el-input>
      </el-col>
      <!-- 添加用户 -->
      <el-col :span="8">
        <el-button type="primary" @click="openAddForm">添加用户</el-button>
      </el-col>
    </el-row>
    <!-- 表格区域 -->
    <el-table :data="userData.userList" stripe border style="width: 100%">
      <el-table-column type="index" label="#" width="50"> </el-table-column>
      <el-table-column prop="username" label="姓名"> </el-table-column>
      <el-table-column prop="email" label="邮箱"> </el-table-column>
      <el-table-column prop="mobile" label="电话"> </el-table-column>
      <el-table-column prop="role_name" label="角色"> </el-table-column>
      <el-table-column label="状态">
        <template #default="scope">
          <el-switch v-model="scope.row.mg_state" @change="stateChangeHandle(scope.row)"> </el-switch>
        </template>
      </el-table-column>
      <el-table-column label="操作">
        <template #default="scope">
          <el-button type="primary" size="mini" icon="el-icon-edit" @click="openEditForm(scope.row.id)"></el-button>
          <el-button type="danger" size="mini" icon="el-icon-delete" @click="deleteUser(scope.row.id)"></el-button>
        </template>
      </el-table-column>
    </el-table>
    <!-- 分页区域 -->
    <el-pagination
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      :current-page="getUserParams.pagenum"
      :page-sizes="[2, 3, 5, 10]"
      :page-size="getUserParams.pagesize"
      layout="total, sizes, prev, pager, next, jumper"
      :total="userData.total"
    >
    </el-pagination>
  </el-card>
  <!-- 添加用户信息对话框 -->
  <el-dialog title="添加用户" v-model="addFormVisible" width="50%" :before-close="addFormClose">
    <el-form ref="addFormRef" :model="addFormData" :rules="addFormRules" label-width="80px">
      <el-form-item label="用户名" prop="username">
        <el-input v-model="addFormData.username"></el-input>
      </el-form-item>
      <el-form-item label="密码" prop="password">
        <el-input v-model="addFormData.password" type="password"></el-input>
      </el-form-item>
      <el-form-item label="邮箱" prop="email">
        <el-input v-model="addFormData.email"></el-input>
      </el-form-item>
      <el-form-item label="手机号" prop="mobile">
        <el-input v-model="addFormData.mobile"></el-input>
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="addFormClose">取 消</el-button>
        <el-button type="primary" @click="addFormSubmit">确 定</el-button>
      </span>
    </template>
  </el-dialog>
  <!-- 修改用户信息对话框 -->
  <el-dialog title="修改用户" v-model="editFormVisible" width="50%" :before-close="editFormClose">
    <el-form ref="editFormRef" :model="editFormData" :rules="editFormRules" label-width="80px">
      <el-form-item label="用户名" prop="username">
        <el-input v-model="editFormData.username" disabled></el-input>
      </el-form-item>
      <el-form-item label="邮箱" prop="email">
        <el-input v-model="editFormData.email"></el-input>
      </el-form-item>
      <el-form-item label="手机号" prop="mobile">
        <el-input v-model="editFormData.mobile"></el-input>
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="editFormClose">取 消</el-button>
        <el-button type="primary" @click="editFormSubmit">确 定</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script>
import axios from '../../plugins/axios.js'

export default {
  data() {
    // 自定义邮箱规则
    const validateEmail = (rule, value, callback) => {
      const RegEmail = /^[a-z0-9]+([._\\-]*[a-z0-9])*@([a-z0-9]+[-a-z0-9]*[a-z0-9]+.){1,63}[a-z0-9]+$/
      if (RegEmail.test(value)) {
        return callback()
      }
      return callback(new Error('输入邮箱格式错误'))
    }
    // 自定义手机号规则
    const validateMoblie = (rule, value, callback) => {
      const RegMoblie = /^[1][3,4,5,7,8,9][0-9]{9}$/
      if (RegMoblie.test(value)) {
        return callback()
      }
      return callback(new Error('输入手机号格式错误'))
    }
    return {
      // 获取用户列表时向服务器提交的参数
      getUserParams: {
        query: '',
        pagenum: 1,
        pagesize: 2
      },
      // 用户数据
      userData: {
        userList: [],
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
        email: [
          { required: true, message: '邮箱为必填项', trigger: 'blur' },
          { validator: validateEmail, trigger: 'blur' }
        ],
        mobile: [
          { required: true, message: '手机号为必填项', trigger: 'blur' },
          { validator: validateMoblie, trigger: 'blur' }
        ]
      },
      // 修改用户表单是否显示
      editFormVisible: false,
      // 点击的编辑或删除按钮对应的用火id
      userId: null,
      // 修改用户表单数据，发送请求时需携带
      editFormData: {
        username: '',
        email: '',
        mobile: ''
      },
      // 修改用户表单验证规则
      editFormRules: {
        username: [{ required: true, message: '用户名为必填项', trigger: 'blur' }],
        email: [
          { required: true, message: '邮箱为必填项', trigger: 'blur' },
          { validator: validateEmail, trigger: 'blur' }
        ],
        mobile: [
          { required: true, message: '手机号为必填项', trigger: 'blur' },
          { validator: validateMoblie, trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    // 获取用户列表数据
    async getUserList() {
      const res = await axios.get('/users', { params: this.getUserParams })
      if (res.meta.status !== 200) return this.$message.error('获取用户列表数据失败')
      // 用户列表数据获取成功
      this.userData.userList = res.data.users
      this.userData.total = res.data.total
    },
    // 每页显示内容条数发生变化会触发
    handleSizeChange(newSize) {
      // 更新data中页面数据并重新发送获取用户列表请求
      this.getUserParams.pagesize = newSize
      this.getUserList()
    },
    // 翻页后会触发
    handleCurrentChange(newPage) {
      this.getUserParams.pagenum = newPage
      this.getUserList()
    },
    // 点击添加用户按钮打开对话框
    openAddForm() {
      this.addFormVisible = !this.addFormVisible
    },
    // 添加按钮对话框关闭前事件处理
    addFormClose() {
      // 对整个表单进行重置，将所有字段值重置为初始值并移除校验结果
      this.$refs.addFormRef.resetFields()
      this.addFormVisible = !this.addFormVisible
    },
    // 添加用户表单提交按钮事件处理
    async addFormSubmit() {
      // 表单填写内容是否校验成功
      const result = await this.$refs.addFormRef.validate().catch((err) => err)
      if (result !== true) return
      // 校验成功后发送添加用户请求
      const res = await axios.post('/users', this.addFormData)
      if (res.meta.status !== 201) return this.$message.error('用户创建失败')
      // 请求成功后消息提示,关闭对话框并重新获取用户列表
      this.$message.success('用户创建成功')
      this.addFormVisible = !this.addFormVisible
      this.getUserList()
    },
    // 点击修改用户按钮
    async openEditForm(id) {
      // 将id存入data中
      this.userId = id
      // 根据id获取用户数据
      const res = await axios.get('users/' + id)
      if (res.meta.status !== 200) return this.$message.error('查询用户数据失败')
      // 用户数据获取成功，填充到表单中
      this.editFormData.username = res.data.username
      this.editFormData.email = res.data.email
      this.editFormData.mobile = res.data.mobile
      // 打开对话框,同时获取到该用户对应的id
      this.editFormVisible = !this.editFormVisible
    },
    // 修改按钮对话框关闭前事件处理
    editFormClose() {
      // 对整个表单进行重置，将所有字段值重置为初始值并移除校验结果
      this.$refs.editFormRef.resetFields()
      this.editFormVisible = !this.editFormVisible
    },
    // 修改用户表单提交按钮事件处理
    async editFormSubmit() {
      // 表单填写内容是否校验成功
      const result = await this.$refs.editFormRef.validate().catch((err) => err)
      if (result !== true) return
      // 校验成功后发送修改用户请求
      const res = await axios.put('/users/' + this.userId, this.editFormData)
      if (res.meta.status !== 200) return this.$message.error('用户信息修改失败')
      // 请求成功后消息提示,关闭对话框并重新获取用户列表
      this.$message.success('用户信息修改成功')
      this.editFormVisible = !this.editFormVisible
      this.getUserList()
    },
    // 根据id删除用户
    async deleteUser(id) {
      // 打开弹框
      const result = await this.$confirm('此操作将永久删除该用户, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch((err) => err)
      if (result !== 'confirm') return this.$message('取消删除')
      // 点击了确认按钮，发送删除请求
      const res = await axios.delete('/users/' + id)
      if (res.meta.status !== 200) return this.$message.error('用户信息删除失败')
      // 删除成功后消息提示并更新用户列表
      this.$message.success('用户信息删除成功')
      this.getUserList()
    },
    // 用户状态变更
    async stateChangeHandle(row) {
      // 发送状态变更请求
      const res = await axios.put(`/users/${row.id}/state/${row.mg_state}`)
      if (res.meta.status !== 200) return this.$message.error('状态设置失败')
      this.getUserList()
      this.$message.success('状态设置成功')
    }
  },
  created() {
    // 获取用户列表数据
    this.getUserList()
  }
}
</script>
<style lang="less" scoped>
</style>
