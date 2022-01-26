<template>
  <!-- 面包屑导航 -->
  <el-breadcrumb separator-class="el-icon-arrow-right">
    <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
    <el-breadcrumb-item>权限管理</el-breadcrumb-item>
    <el-breadcrumb-item>角色列表</el-breadcrumb-item>
  </el-breadcrumb>
  <!-- 卡片组件 -->
  <el-card class="box-card">
    <!-- 添加角色按钮 -->
    <el-button type="primary" @click="openAddRoleDialog">添加角色</el-button>
    <!-- 表格区域 -->
    <el-table :data="roleDataList" stripe border style="width: 100%">
      <el-table-column type="expand">
        <template #default="scope">
          <el-row align="middle" :class="{ bb: true, bt: index1 === 0 ? true : false }" v-for="(item1, index1) in scope.row.children" :key="item1.id">
            <el-col :span="4">
              <el-tag closable @close="deleterights(scope.row.id, item1.id)">
                {{ item1.authName }}
              </el-tag>
              <el-icon class="el-icon-caret-right" :size="12"></el-icon>
            </el-col>
            <el-col :span="20">
              <el-row align="middle" :class="{ bt: index2 === 0 ? false : true }" v-for="(item2, index2) in item1.children" :key="item2.id">
                <el-col :span="5">
                  <el-tag type="success" closable @close="deleterights(scope.row.id, item2.id)">
                    {{ item2.authName }}
                  </el-tag>
                  <el-icon class="el-icon-caret-right" :size="12"></el-icon>
                </el-col>
                <el-col :span="19">
                  <el-tag type="warning" closable @close="deleterights(scope.row.id, item3.id)" v-for="item3 in item2.children" :key="item3.id">
                    {{ item3.authName }}
                  </el-tag>
                </el-col>
              </el-row>
            </el-col>
          </el-row>
        </template>
      </el-table-column>
      <el-table-column type="index" label="#" width="50"> </el-table-column>
      <el-table-column prop="roleName" label="角色名称"> </el-table-column>
      <el-table-column prop="roleDesc" label="角色描述"> </el-table-column>
      <el-table-column label="操作" width="300px">
        <template #default="scope">
          <el-button type="primary" size="mini" icon="el-icon-edit" @click="openEditRoleDialog(scope.row.id)">编辑</el-button>
          <el-button type="danger" size="mini" icon="el-icon-delete" @click="deleteRole(scope.row.id)">删除</el-button>
          <el-button type="warning" size="mini" icon="el-icon-setting" @click="openAddRightsDialog(scope.row)">分配权限</el-button>
        </template>
      </el-table-column>
    </el-table>
  </el-card>
  <!-- 添加角色对话框 -->
  <el-dialog title="角色添加" v-model="addRoleDialogVisible" width="50%" :before-close="addRoleClose">
    <el-form :model="addRoleForm" :rules="addRoleRules" ref="addRoleFormRef" label-width="100px">
      <!-- 添加角色表单 -->
      <el-form-item label="角色名称" prop="roleName">
        <el-input v-model="addRoleForm.roleName"></el-input>
      </el-form-item>
      <el-form-item label="角色描述">
        <el-input v-model="addRoleForm.roleDesc"></el-input>
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="addRoleClose">取 消</el-button>
        <el-button type="primary" @click="submitAddForm">确 定</el-button>
      </span>
    </template>
  </el-dialog>
  <!-- 编辑角色对话框 -->
  <el-dialog title="编辑角色" v-model="editRoleDialogVisible" width="50%" :before-close="editRoleClose">
    <el-form :model="editRoleForm" :rules="editRoleRules" ref="editRoleFormRef" label-width="100px">
      <!-- 编辑角色表单 -->
      <el-form-item label="角色名称" prop="roleName">
        <el-input v-model="editRoleForm.roleName"></el-input>
      </el-form-item>
      <el-form-item label="角色描述">
        <el-input v-model="editRoleForm.roleDesc"></el-input>
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="editRoleClose">取 消</el-button>
        <el-button type="primary" @click="submitEditForm">确 定</el-button>
      </span>
    </template>
  </el-dialog>
  <!-- 权限分配对话框 -->
  <el-dialog title="分配权限" v-model="addRightsDialogVisible" width="50%" :before-close="addRightsClose">
    <!-- 树形控件 -->
    <el-tree
      ref="rightsTreeRef"
      :data="treeRightsDataList"
      :props="defaultProps"
      @node-click="handleNodeClick"
      :show-checkbox="true"
      :default-expand-all="true"
      node-key="id"
      :default-checked-keys="checkedKeysArr"
    ></el-tree>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="addRightsClose">取 消</el-button>
        <el-button type="primary" @click="submitAddRightsForm">确 定</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script>
import axios from '../../plugins/axios.js'
export default {
  data() {
    return {
      // 角色数据列表
      roleDataList: [],
      // 角色添加对话框的显示和隐藏
      addRoleDialogVisible: false,
      // 角色添加表单绑定的数据
      addRoleForm: {
        roleName: '',
        roleDesc: ''
      },
      // 角色添加表单验证规则
      addRoleRules: {
        roleName: [{ required: true, message: '角色名称为必填项', trigger: 'blur' }]
      },
      // 操作角色列表对应的数据时获取到的id
      roleId: null,
      // 操作角色列表对应的数据时获取到的用户信息
      roleData: null,
      // 角色编辑对话框的显示和隐藏
      editRoleDialogVisible: false,
      // 角色编辑表单绑定的数据
      editRoleForm: {
        roleName: '',
        roleDesc: ''
      },
      // 角色编辑表单验证规则
      editRoleRules: {
        roleName: [{ required: true, message: '角色名称为必填项', trigger: 'blur' }]
      },
      // 权限分配对话框显示和隐藏
      addRightsDialogVisible: false,
      // 树形权限数据列表
      treeRightsDataList: [],
      // 树形结构配置
      defaultProps: {
        children: 'children',
        label: 'authName'
      },
      // 树形结构默认勾选节点的数组
      checkedKeysArr: []
    }
  },
  methods: {
    // 获取用户角色列表
    async getRoleList() {
      const res = await axios.get('/roles')
      if (res.meta.status !== 200) return res.$message.error('获取用户角色列表失败')
      // 用户角色列表获取成功
      this.roleDataList = res.data
    },
    // 删除权限
    async deleterights(roleId, rightsId) {
      // 打开确认删除的弹框
      const result = await this.$confirm('此操作将删除该权限, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch((err) => err)
      if (result !== 'confirm') return this.$message('取消了删除')
      // 点击了确认按钮，发送删除权限的请求
      const res = await axios.delete(`/roles/${roleId}/rights/${rightsId}`)
      if (res.meta.status !== 200) return this.$message.error('权限删除失败')
      // 权限删除成功后消息提示并更新角色列表
      this.$message.success('权限删除成功')
      this.getRoleList()
    },
    // 打开添加角色对话框
    openAddRoleDialog() {
      this.addRoleDialogVisible = !this.addRoleDialogVisible
    },
    // 关闭添加角色对话框前的处理函数
    addRoleClose() {
      this.$refs.addRoleFormRef.resetFields()
      this.addRoleForm.roleDesc = ''
      this.addRoleDialogVisible = !this.addRoleDialogVisible
    },
    // 点击确认编辑角色对话框的处理函数
    async submitAddForm() {
      // 对表单输入内容进行验证
      const result = await this.$refs.addRoleFormRef.validate().catch((err) => err)
      if (result !== true) return
      // 验证通过发送编辑请求
      const res = await axios.post('/roles', this.addRoleForm)
      if (res.meta.status !== 201) return this.$message.error('编辑角色失败')
      this.$message.success('编辑角色成功')
      this.getRoleList()
      this.addRoleDialogVisible = !this.addRoleDialogVisible
      this.addRoleForm.roleName = ''
      this.addRoleForm.roleDesc = ''
    },
    // 打开编辑角色对话框
    async openEditRoleDialog(id) {
      // 根据角色id发送请求获取角色数据
      const res = await axios.get('/roles/' + id)
      if (res.meta.status !== 200) return this.$message.error('角色信息获取失败')
      // 获取成功后将信息填充到角色编辑表单中
      this.roleId = id
      this.editRoleForm.roleName = res.data.roleName
      this.editRoleForm.roleDesc = res.data.roleDesc
      this.editRoleDialogVisible = !this.editRoleDialogVisible
    },
    // 关闭编辑角色对话框前的处理函数
    editRoleClose() {
      this.$refs.editRoleFormRef.resetFields()
      this.editRoleForm.roleDesc = ''
      this.editRoleDialogVisible = !this.editRoleDialogVisible
    },
    // 点击对话框确认编辑角色的处理函数
    async submitEditForm() {
      // 对表单输入内容进行验证
      const result = await this.$refs.editRoleFormRef.validate().catch((err) => err)
      if (result !== true) return
      // 验证通过发送编辑请求
      const res = await axios.put('/roles/' + this.roleId, this.editRoleForm)
      if (res.meta.status !== 200) return this.$message.error('编辑角色失败')
      this.$message.success('编辑角色成功')
      this.getRoleList()
      this.editRoleDialogVisible = !this.editRoleDialogVisible
    },
    // 删除角色
    async deleteRole(id) {
      // 打开确认删除的弹框
      const result = await this.$confirm('此操作将永久删除该角色, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch((err) => err)
      if (result !== 'confirm') return this.$message('取消了删除')
      // 点击了确认按钮，发送删除角色的请求
      const res = await axios.delete(`/roles/${id}`)
      if (res.meta.status !== 200) return this.$message.error('角色删除失败')
      // 角色删除成功后消息提示并更新角色列表
      this.$message.success('角色删除成功')
      this.getRoleList()
    },
    // 打开权限分配对话框
    openAddRightsDialog(row) {
      // 将角色对应的数据存入data中
      this.roleId = row.id
      this.getIdArrByRole(this.checkedKeysArr, row.children)
      this.addRightsDialogVisible = !this.addRightsDialogVisible
    },
    // 关闭权限分配对话框前的处理函数
    addRightsClose() {
      this.$router.go(0)
      this.addRightsDialogVisible = !this.addRightsDialogVisible
    },
    // 点击对话框确认分配权限的处理函数
    async submitAddRightsForm() {
      const rids = this.getIdByTree()
      const res = await axios.post(`/roles/${this.roleId}/rights`, { rids })
      if (res.meta.status !== 200) return this.$message.error('分配权限失败')
      this.$message.success('分配权限成功')
      this.$router.go()
    },
    // 点击树形节点时的函数处理
    handleNodeClick() {},
    // 获取树形权限列表数据
    async getTreeRightsList() {
      const res = await axios.get('/rights/tree')
      if (res.meta.status !== 200) return this.$message.error('获取树形权限列表失败')
      this.treeRightsDataList = res.data
    },
    // 遍历单个角色权限数据，获取其内所有id并推入一个数组中
    getIdArrByRole(idArr, rightsData) {
      if (!rightsData) return
      rightsData.map((item) => {
        if (!item.children) idArr.push(item.id)
        this.getIdArrByRole(idArr, item.children)
      })
    },
    // 获取树形控件所有选中节点的id
    getIdByTree() {
      const refArr = this.$refs.rightsTreeRef.getCheckedKeys()
      return refArr.join()
    }
  },
  created() {
    this.getRoleList()
    this.getTreeRightsList()
  }
}
</script>

<style lang="less" scoped>
.el-tag {
  margin: 10px;
}
</style>
