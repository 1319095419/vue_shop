<template>
  <el-container>
    <el-header>
      <div class="logo">
        <img src="../assets/images/heima.png" alt="logo" />
        <span>电商后台管理系统</span>
      </div>
      <el-button type="info" @click="outlogHandle">退出</el-button>
    </el-header>
    <el-container class="content">
      <el-aside :width="menuWidth + 'px'">
        <!-- 菜单伸缩按钮 -->
        <div class="toggle_btn" @click="toggleMenuHandle">|||</div>
        <!-- 侧边栏菜单 -->
        <el-menu
          active-text-color="#3390ff"
          background-color="#333744"
          text-color="#fff"
          :collapse="menuCollapse"
          :collapse-transition="false"
          :unique-opened="true"
          router
          :default-active="menuIndex"
        >
          <el-submenu :index="item.path" v-for="(item, index) in menuList" :key="item.id">
            <template #title>
              <el-icon :class="'iconfont ' + iconList[index]"></el-icon>
              <span>{{ item.authName }}</span>
            </template>
            <el-menu-item :index="item1.path" v-for="item1 in item.children" :key="item1.id" @click="getIndexHandle(item1.path)"
              ><el-icon class="el-icon-menu"></el-icon>{{ item1.authName }}</el-menu-item
            >
          </el-submenu>
        </el-menu>
      </el-aside>
      <el-main>
        <!-- Home页设置子路由，点击列表项在这里动态展示不同的数据 -->
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
import axios from '../plugins/axios.js'
export default {
  data() {
    return {
      // 菜单是否伸缩
      menuCollapse: false,
      // 菜单宽度
      menuWidth: 200,
      // 菜单列表数据
      menuList: [],
      // 菜单列表字体图标
      iconList: ['icon-user', 'icon-tijikongjian', 'icon-shangpin', 'icon-danju', 'icon-baobiao'],
      // 当前触发的菜单列表选项
      menuIndex: sessionStorage.getItem('menuIndex')
    }
  },
  methods: {
    // 退出登录事件处理
    outlogHandle() {
      // 消息提示，清除token，返回登陆页面
      this.$message.success('退出登录成功')
      sessionStorage.clear()
      this.$router.push('/login')
    },
    // 菜单伸缩按钮事件处理函数
    toggleMenuHandle() {
      this.menuCollapse = !this.menuCollapse
      this.menuWidth = this.menuWidth === 200 ? 56 : 200
    },
    // 获取菜单列表数据
    async getMenuList() {
      const res = await axios.get('/menus')
      if (res.meta.status !== 200) return this.$message.error('获取菜单列表数据失败')
      this.menuList = res.data
    },
    // 将点击的菜单项的唯一标识存入sessionStorage中，解决页面刷新后菜单项选中状态丢失的问题
    getIndexHandle(index) {
      this.menuIndex = index
      sessionStorage.setItem('menuIndex', index)
    }
  },
  created() {
    this.getMenuList()
  }
}
</script>

<style lang="less" scoped>
.el-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-left: 0;
  background-color: #373d41;
  .logo {
    display: flex;
    align-items: center;
    font-size: 20px;
    color: #fff;
    span {
      margin-left: 15px;
    }
  }
}
.el-container {
  height: 100%;
  .el-aside {
    overflow: hidden;
    background-color: #333744;
    .toggle_btn {
      width: 100%;
      height: 24px;
      background: #4a5064;
      color: #fff;
      font-size: 12px;
      text-align: center;
      line-height: 24px;
      letter-spacing: 0.15em;
    }
    .el-submenu {
      width: 200px;
    }
    el-icon {
      color: #909399;
    }
    .el-icon {
      margin-right: 10px;
    }
  }
  .el-main {
    background-color: #eaedf1;
  }
}
</style>
