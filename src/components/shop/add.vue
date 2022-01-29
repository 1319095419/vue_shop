<template>
  <el-card>
    <!-- 警告组件 -->
    <el-alert title="添加商品信息" type="info" center show-icon> </el-alert>
    <!-- 步骤条 -->
    <el-steps :space="200" :active="Number(stepIndex)" finish-status="success" align-center>
      <el-step title="基本信息"></el-step>
      <el-step title="商品参数"></el-step>
      <el-step title="商品属性"></el-step>
      <el-step title="商品图片"></el-step>
      <el-step title="商品内容"></el-step>
      <el-step title="完成"></el-step>
    </el-steps>
    <!-- tap组件 -->
    <el-form label-position="top" :model="addGoodsData" :rules="addGoodsRules" ref="addGoodsForm" label-width="100px" class="demo-ruleForm">
      <el-tabs tab-position="left" v-model="stepIndex" :before-leave="tabBeforeLeaveHandle">
        <el-tab-pane label="基本信息" name="0">
          <el-form-item label="商品名称" prop="goods_name">
            <el-input v-model="addGoodsData.goods_name"></el-input>
          </el-form-item>
          <el-form-item label="商品价格" prop="goods_price">
            <el-input v-model="addGoodsData.goods_price" type="number"></el-input>
          </el-form-item>
          <el-form-item label="商品重量" prop="goods_weight" type="number">
            <el-input v-model="addGoodsData.goods_weight"></el-input>
          </el-form-item>
          <el-form-item label="商品数量" prop="goods_number" type="number">
            <el-input v-model="addGoodsData.goods_number"></el-input>
          </el-form-item>
          <el-form-item label="商品分类">
            <el-cascader v-model="addGoodsData.goods_cat" :options="goodsCateList" :props="goodsCateListProps"></el-cascader>
          </el-form-item>
        </el-tab-pane>
        <el-tab-pane label="商品参数" name="1">
          <el-form-item :label="item.attr_name" v-for="(item, index) in manyParams" :key="item.attr_id">
            <el-checkbox-group size="small" v-model="manyParams[index].attr_vals">
              <el-checkbox :label="item1" v-for="(item1, index1) in item.attr_vals" :key="index1" border></el-checkbox>
            </el-checkbox-group>
          </el-form-item>
        </el-tab-pane>
        <el-tab-pane label="商品属性" name="2">
          <el-form-item label="商品名称" v-for="(item, index) in onlyParams" :key="item.attr_id">
            <el-input v-model="onlyParams[index].attr_vals"></el-input>
          </el-form-item>
        </el-tab-pane>
        <el-tab-pane label="商品图片" name="3">
          <el-upload class="upload-demo" :action="uploadURL" :headers="headerObj" :on-preview="handlePreview" :on-remove="handleRemove" :on-success="successHandle" list-type="picture">
            <el-button size="small" type="primary">点击上传</el-button>
          </el-upload>
        </el-tab-pane>
        <el-tab-pane label="商品内容" name="4">
          <textarea class="content" v-model="addGoodsData.goods_introduce"></textarea>
          <el-button type="primary" @click="addGoodsHandle">添加商品</el-button>
        </el-tab-pane>
      </el-tabs>
    </el-form>
  </el-card>
  <!-- 图片预览对话框 -->
  <el-dialog title="图片预览" :before-close="closeHandle" v-model="previewVisible" width="50%">
    <img :src="previewPath" alt="" />
  </el-dialog>
</template>

<script>
import _ from 'lodash'
import axios from '../../plugins/axios.js'
export default {
  data() {
    const checkNumber = (rule, value, callback) => {
      if (value <= 0) {
        return callback(new Error('商品数量，重量，价格必须大于0'))
      }
      callback()
    }
    return {
      // 步骤条对应的索引值
      stepIndex: '0',
      // 添加商品表单数据
      addGoodsData: {
        goods_name: '',
        goods_cat: null,
        goods_price: 0,
        goods_number: 0,
        goods_weight: 0,
        goods_introduce: '',
        pics: [],
        attrs: []
      },
      // 获取动态参数
      manyParams: [],
      // 获取静态属性
      onlyParams: [],
      // 文件上传地址
      uploadURL: 'http://127.0.0.1:8888/api/private/v1/upload',
      // 文件上传请求头配置
      headerObj: {
        Authorization: sessionStorage.getItem('token')
      },
      // 图片预览路径
      previewPath: '',
      // 图片预览对话框的显示和隐藏
      previewVisible: false,
      // 添加商品表单验证
      addGoodsRules: {
        goods_name: [{ required: true, message: '请输入商品名称', trigger: 'blur' }],
        goods_price: [
          { required: true, message: '请输入商品价格', trigger: 'blur' },
          { validator: checkNumber, trigger: 'blur' }
        ],
        goods_weight: [
          { required: true, message: '请输入商品重量', trigger: 'blur' },
          { validator: checkNumber, trigger: 'blur' }
        ],
        goods_number: [
          { required: true, message: '请输入商品数量', trigger: 'blur' },
          { validator: checkNumber, trigger: 'blur' }
        ]
      },
      // 商品分类数据
      goodsCateList: [],
      // 商品分类列表配置（级联选择器)
      goodsCateListProps: {
        expandTrigger: 'hover',
        value: 'cat_id',
        label: 'cat_name'
      }
    }
  },
  methods: {
    // 获取分类列表
    async getCateList() {
      const res = await axios.get('/categories')
      if (res.meta.status !== 200) return this.$message.error('分类列表获取失败')
      this.goodsCateList = res.data
    },
    // tab切换之前会触发的函数
    tabBeforeLeaveHandle(activeName, oldActiveName) {
      // 是从第一个tab跳转到其他tab
      if (oldActiveName === '0') {
        const { goods_name: goodsName, goods_cat: goodsCat, goods_price: goodsPrice, goods_number: goodsNumber, goods_weight: goodsWeight } = this.addGoodsData
        //   第一页内容是否全部填写完毕
        const result = goodsName && goodsCat && goodsPrice.toString() && goodsNumber.toString() && goodsWeight.toString()
        if (!result) {
          this.$message.error('以上内容均为必填项，请全部填写')
          return false
        }
      }
      if (activeName === '1' || activeName === '4') {
        // 获取商品动态参数
        this.getManyGoodsParams()
      }
      if (activeName === '2' || activeName === '4') {
        // 获取商品静态属性
        this.getOnlyGoodsParams()
      }
    },
    // 获取商品动态参数
    async getManyGoodsParams() {
      const res = await axios.get(`categories/${this.addGoodsData.goods_cat[2]}/attributes`, { params: { sel: 'many' } })
      if (res.meta.status !== 200) return this.$message.error('获取动态参数失败')
      res.data.map((item, index) => {
        res.data[index].attr_vals = item.attr_vals === '' ? [] : item.attr_vals.split(' ')
      })
      this.manyParams = res.data
    },
    // 获取商品静态属性
    async getOnlyGoodsParams() {
      const res = await axios.get(`categories/${this.addGoodsData.goods_cat[2]}/attributes`, { params: { sel: 'only' } })
      if (res.meta.status !== 200) return this.$message.error('获取静态属性失败')
      this.onlyParams = res.data
    },
    // 文件上传成功后执行的函数
    successHandle(res) {
      const pathObj = {
        pic: res.data.tmp_path
      }
      this.addGoodsData.pics.push(pathObj)
    },
    // 文件列表移除文件时执行的函数
    handleRemove(file) {
      // 获取到将要删除图片的临时路径
      const filePath = file.response.data.tmp_path
      // 得到要删除的图片信息在图片列表中的index
      const index = this.addGoodsData.pics.findIndex((item) => {
        return item.pic === filePath
      })
      // 根据index删除图片信息
      this.addGoodsData.pics.splice(index, 1)
    },
    // 点击文件列表中已上传的文件时执行的函数
    handlePreview(file) {
      this.previewPath = file.response.data.url
      this.previewVisible = !this.previewVisible
    },
    // 文件预览对话框关闭时执行的函数
    closeHandle() {
      this.previewPath = ''
      this.previewVisible = !this.previewVisible
    },
    // 添加商品
    async addGoodsHandle() {
      // 对数据进行格式处理
      const addGoodsData = _.cloneDeep(this.addGoodsData)
      const manyParams = _.cloneDeep(this.manyParams)
      const onlyParams = _.cloneDeep(this.onlyParams)
      addGoodsData.goods_cat = addGoodsData.goods_cat.join()
      manyParams.map((item, index) => {
        manyParams[index].attr_vals = item.attr_vals.join()
      })
      addGoodsData.attrs = [...manyParams, ...onlyParams]
      addGoodsData.attrs.map((item, index) => {
        addGoodsData.attrs[index].attr_value = item.attr_vals
        delete addGoodsData.attrs[index].attr_vals
      })
      // 数据处理成功，验证后发送添加商品请求
      const result = await this.$refs.addGoodsForm.validate().catch((err) => err)
      if (result !== true) return this.$message.error('信息填写有误，请检查填写格式是否正确')
      const res = await axios.post('/goods', addGoodsData)
      if (res.meta.status !== 201) return this.$message.error(res.meta.msg)
      this.$message.success('商品创建成功')
      this.$router.push('/goods')
    }
  },
  created() {
    this.getCateList()
  }
}
</script>
<style lang="less" scoped>
.el-steps {
  margin: 15px 0;
}
img {
  width: 100%;
  height: 100%;
}
.content {
  outline: none;
  width: 900px !important;
  height: 280px !important;
  padding: 20px;
  margin-bottom: 20px;
  resize: none;
  border: 1px solid #ccc;
  background-color: #eee;
  font-size: 20px;
}
</style>
