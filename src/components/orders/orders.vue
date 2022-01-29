<template>
  <!-- 面包屑导航 -->
  <el-breadcrumb separator-class="el-icon-arrow-right">
    <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
    <el-breadcrumb-item>订单管理</el-breadcrumb-item>
    <el-breadcrumb-item>订单列表</el-breadcrumb-item>
  </el-breadcrumb>
  <!-- 卡片区域 -->
  <el-card>
    <!-- 查询区域 -->
    <el-row :gutter="20">
      <el-col :span="8">
        <el-input placeholder="服务器接口异常,该功能无法正常使用" v-model="getOrdersParams.query" clearable @clear="getOrdersList">
          <template #append>
            <el-button icon="el-icon-search" @click="getOrdersList"></el-button>
          </template>
        </el-input>
      </el-col>
    </el-row>
    <!-- 表格区域 -->
    <el-table :data="ordersData.orderList" stripe border style="width: 100%">
      <el-table-column type="index" label="#" width="48"> </el-table-column>
      <el-table-column prop="order_number" label="订单编号" width="200"> </el-table-column>
      <el-table-column prop="order_price" label="订单价格"> </el-table-column>
      <el-table-column label="是否付款">
        <template #default="scope">
          <el-tag type="success" v-if="scope.row.pay_status === '1'">已付款</el-tag>
          <el-tag type="danger" v-else>未付款</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="is_send" label="是否发货"> </el-table-column>
      <el-table-column prop="create_time" label="下单时间"> </el-table-column>
      <el-table-column prop="create_time" label="操作">
        <template #default="scope">
          <el-button type="primary" icon="el-icon-edit" size="mini" @click="editBtnHandle"></el-button>
          <el-button type="success" icon="el-icon-location" size="mini" @click="getExpressData(scope.row.order_id)"></el-button>
        </template>
      </el-table-column>
    </el-table>
    <!-- 分页区域 -->
    <el-pagination
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      :current-page="getOrdersParams.pagenum"
      :page-sizes="[5, 10, 15]"
      :page-size="getOrdersParams.pagesize"
      layout="total, sizes, prev, pager, next, jumper"
      :total="ordersData.total"
    >
    </el-pagination>
  </el-card>
  <!-- 物流进度对话框 -->
  <el-dialog title="物流进度" v-model="expressDialogVisible" width="50%">
    <el-timeline>
      <el-timeline-item v-for="(activity, index) in expressData" :key="index" :timestamp="activity.ftime">
        {{ activity.context }}
      </el-timeline-item>
    </el-timeline>
  </el-dialog>
  <!-- 修改地址对话框 -->
  <el-dialog title="修改地址" v-model="editAddressVisible" width="50%" :before-close="handleEditAddressClose">
    <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="100px">
      <el-form-item label="详细地址" prop="detail_addr">
        <el-input v-model="editForm.detail_addr"></el-input>
      </el-form-item>
      <el-form-item label="省市区/县" prop="consignee_addr">
        <!-- 级联选择器 -->
        <el-cascader style="width: 100%" v-model="editForm.consignee_addr" :options="citydata" clearable :props="cityProps"></el-cascader>
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="handleEditAddressClose">取 消</el-button>
        <el-button type="primary" @click="editAddressSureBtn">确 定</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script>
import axios from '../../plugins/axios.js'
import citydata from '../../plugins/citydata.js'
export default {
  data() {
    return {
      // 获取订单列表需要向服务器提交的参数
      getOrdersParams: {
        query: '',
        pagenum: 1,
        pagesize: 10
      },
      // 从服务器获取到的订单数据
      ordersData: {
        orderList: [],
        total: 0
      },
      // 物流信息
      expressData: [],
      // 物流进度对话框的显示和隐藏
      expressDialogVisible: false,
      // 修改地址对话框的显示和隐藏
      editAddressVisible: false,
      // 修改表单数据
      editForm: {
        consignee_addr: [],
        detail_addr: ''
      },
      editFormRules: {
        detail_addr: [{ required: true, message: '请输入详细地址', trigger: 'blur' }],
        consignee_addr: [{ required: true, message: '请输入省市区/县', trigger: 'blur' }]
      },
      // 级联选择器选项数据源
      citydata: [],
      // 级联选择器配置
      cityProps: {
        expandTrigger: 'hover'
      }
    }
  },
  methods: {
    // 修改地址按钮事件监听
    editBtnHandle() {
      this.citydata = citydata
      this.editAddressVisible = !this.editAddressVisible
    },
    // 关闭修改地址对话框事件监听
    handleEditAddressClose() {
      this.editForm.consignee_addr = []
      this.$refs.editFormRef.resetFields()
      this.editAddressVisible = !this.editAddressVisible
    },
    //  修改地址对话框确认按钮事件监听
    async editAddressSureBtn() {
      const result = await this.$refs.editFormRef.validate().catch((err) => err)
      console.log(result)
      if (result !== true) return
      // 验证成功,发送请求
      this.$message('由于服务端接口未提供,该功能暂不可用')
      this.editAddressVisible = !this.editAddressVisible
    },
    // 获取订单数据
    async getExpressData(id) {
      console.log(id)
      // 这里只是模拟接口,获取一个固定的物流信息,实际要根据订单id来发送请求获取数据
      const res = {
        data: [
          {
            time: '2018-05-10 09:39:00',
            ftime: '2018-05-10 09:39:00',
            context: '已签收,感谢使用顺丰,期待再次为您服务',
            location: ''
          },
          {
            time: '2018-05-10 08:23:00',
            ftime: '2018-05-10 08:23:00',
            context: '[北京市]北京海淀育新小区营业点派件员 顺丰速运 95338正在为您派件',
            location: ''
          },
          {
            time: '2018-05-10 07:32:00',
            ftime: '2018-05-10 07:32:00',
            context: '快件到达 [北京海淀育新小区营业点]',
            location: ''
          },
          {
            time: '2018-05-10 02:03:00',
            ftime: '2018-05-10 02:03:00',
            context: '快件在[北京顺义集散中心]已装车,准备发往 [北京海淀育新小区营业点]',
            location: ''
          },
          {
            time: '2018-05-09 23:05:00',
            ftime: '2018-05-09 23:05:00',
            context: '快件到达 [北京顺义集散中心]',
            location: ''
          },
          {
            time: '2018-05-09 21:21:00',
            ftime: '2018-05-09 21:21:00',
            context: '快件在[北京宝胜营业点]已装车,准备发往 [北京顺义集散中心]',
            location: ''
          },
          {
            time: '2018-05-09 13:07:00',
            ftime: '2018-05-09 13:07:00',
            context: '顺丰速运 已收取快件',
            location: ''
          },
          {
            time: '2018-05-09 12:25:03',
            ftime: '2018-05-09 12:25:03',
            context: '卖家发货',
            location: ''
          },
          {
            time: '2018-05-09 12:22:24',
            ftime: '2018-05-09 12:22:24',
            context: '您的订单将由HLA（北京海淀区清河中街店）门店安排发货。',
            location: ''
          },
          {
            time: '2018-05-08 21:36:04',
            ftime: '2018-05-08 21:36:04',
            context: '商品已经下单',
            location: ''
          }
        ],
        meta: { status: 200, message: '获取物流信息成功！' }
      }
      this.expressData = res.data
      this.expressDialogVisible = !this.expressDialogVisible
    },
    // 每页显示数据条数发生变化事件处理
    handleSizeChange(newSize) {
      // 将变化后的每页显示数据条数同步到data中
      this.getOrdersParams.pagesize = newSize
      // 获取订单数据
      this.getOrdersList()
    },
    // 页码发生变化事件处理
    handleCurrentChange(newPage) {
      // 将变化后的页码值同步到data中
      this.getOrdersParams.pagenum = newPage
      // 获取订单数据
      this.getOrdersList()
    },
    // 获取订单列表
    async getOrdersList() {
      const res = await axios.get('/orders', { params: this.getOrdersParams })
      if (res.meta.status !== 200) return this.$message.error('获取订单数据失败')
      // 遍历数据转换日期格式
      res.data.goods.map((item) => {
        item.create_time = this.dateFormat(item.create_time)
      })
      // 数据获取成功
      this.ordersData.orderList = res.data.goods
      this.ordersData.total = res.data.total
    },
    // 日期格式转换
    dateFormat(time) {
      const date = new Date(time)
      const yy = date.getFullYear()
      const mm = (date.getMonth() + 1).toString().padStart(2, '0')
      const dd = date.getDate().toString().padStart(2, '0')
      const hh = date.getHours().toString().padStart(2, '0')
      const MM = date.getMinutes().toString().padStart(2, '0')
      const ss = date.getSeconds().toString().padStart(2, '0')
      return `${yy}-${mm}-${dd} ${hh}:${MM}:${ss}`
    }
  },
  created() {
    this.getOrdersList()
  }
}
</script>

<style lang="less" scoped>
</style>
