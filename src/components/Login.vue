<template>
  <div class="login_container">
    <div class="login">
      <!-- logo -->
      <div class="logo">
        <img src="../assets/images/logo.png" alt="logo" />
      </div>
      <el-form :model="loginForm" ref="loginFormRef" class="loginForm" :rules="loginRules">
        <el-form-item prop="username">
          <el-input v-model="loginForm.username">
            <template #prefix>
              <el-icon class="iconfont icon-user"></el-icon>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item prop="password">
          <el-input v-model="loginForm.password" type="password">
            <template #prefix>
              <el-icon class="iconfont icon-3702mima"></el-icon>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item class="btns">
          <el-button type="primary" @click="submitForm">登录</el-button>
          <el-button type="info" @click="resetForm">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
import axios from '../plugins/axios.js'
export default {
  data() {
    return {
      loginForm: {
        // 登录表单数据
        username: 'admin',
        password: '123456'
      },
      loginRules: {
        // 登录表单验证规则
        username: [
          {
            required: true,
            message: '用户名不能为空',
            trigger: 'blur'
          }
        ],
        password: [
          {
            required: true,
            message: '密码不能为空',
            trigger: 'blur'
          },
          {
            min: 6,
            max: 15,
            message: '密码长度为6-15位字符',
            trigger: 'blur'
          }
        ]
      }
    }
  },
  methods: {
    // 登录按钮事件处理
    async submitForm() {
      // 判断登陆验证是否成功，成功返回true，失败返回失败原因
      const result = await this.$refs.loginFormRef.validate().catch((err) => err)
      if (result === true) {
        // 向服务器发送请求
        const res = await axios.post('/login', this.loginForm)
        if (res.meta.status !== 200) return this.$message.error('登录失败')
        // 登录成功后消息框提示，存储token，跳转到首页
        this.$message.success('登录成功')
        sessionStorage.setItem('token', res.data.token)
        this.$router.push('/')
      }
    },
    // 表单重置按钮事件处理
    resetForm() {
      this.$refs.loginFormRef.resetFields()
    }
  }
}
</script>

<style lang="less" scoped>
.login_container {
  height: 100%;
  background-color: #2b4b6b;
  .login {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 450px;
    height: 300px;
    background-color: #fff;
    .logo {
      position: absolute;
      top: 0;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 152px;
      height: 150px;
      padding: 10px;
      border-radius: 50%;
      background-color: #fff;
      box-shadow: 0 0 10px #ddd;
      img {
        width: 100%;
        height: 100%;
        border-radius: 50%;
        background-color: #eeeeee;
      }
    }
    .loginForm {
      position: absolute;
      bottom: 0;
      box-sizing: border-box;
      width: 100%;
      padding: 0 20px;
      .btns {
        text-align: right;
      }
    }
  }
}
</style>
