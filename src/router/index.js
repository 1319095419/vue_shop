import { createRouter, createWebHashHistory } from 'vue-router'
// 登陆组件
import Login from '../components/Login.vue'
// 首页组件
import Home from '../components/Home.vue'
import Welcome from '../components/Welcome.vue'
// 用户组件
import Users from '../components/users/Users.vue'
// 权限组件
import Rights from '../components/power/rights.vue'
import Roles from '../components/power/roles.vue'
// 商品组件
import Goods from '../components/shop/shoplist.vue'
import Add from '../components/shop/add.vue'
import Edit from '../components/shop/edit.vue'
import Params from '../components/shop/cateparams.vue'
import Cate from '../components/shop/shopcate.vue'
const routes = [
  {
    path: '/login',
    name: 'Login',
    component: Login
  }, {
    path: '/',
    name: 'Home',
    component: Home,
    redirect: '/welcome',
    // 子路由
    children: [
      {
        path: '/welcome',
        name: 'Welcome',
        component: Welcome
      }, {
        path: 'users',
        name: 'Users',
        component: Users
      }, {
        path: '/rights',
        name: 'Right',
        component: Rights
      }, {
        path: '/roles',
        name: 'Roles',
        component: Roles
      }, {
        path: '/goods',
        name: 'Goods',
        component: Goods
      }, {
        path: '/add',
        name: 'Add',
        component: Add
      }, {
        path: '/edit/:id',
        name: 'Edit',
        component: Edit
      }, {
        path: '/params',
        name: 'Params',
        component: Params
      }, {
        path: '/categories',
        name: 'Cate',
        component: Cate
      }
    ]
  }
  // {
  //   path: '/about',
  //   name: 'About',
  //   // route level code-splitting
  //   // this generates a separate chunk (about.[hash].js) for this route
  //   // which is lazy-loaded when the route is visited.
  //   component: () => import(/* webpackChunkName: "about" */ '../views/About.vue')
  // }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

// 添加路由守卫，只有登录成功才能跳转到其他页面
router.beforeEach((to, from, next) => {
  // 处理一下商品编辑页面路由跳转的bug
  const result = to.path === '/edit/users' || to.path === '/edit/roles' || to.path === '/edit/rights' || to.path === '/edit/roles' || to.path === '/edit/goods' || to.path === '/edit/params' || to.path === '/edit/orders' || to.path === '/edit/categories' || to.path === '/edit/reports'
  if (result) {
    return next(to.path.substring(5))
  }
  // 判断用户登陆状态
  const isLogin = sessionStorage.getItem('token')
  // 如果登录成功或要跳转到登录页面，允许继续跳转
  if (isLogin || to.path === '/login') {
    return next()
  }
  // 否则强制其跳转回登录页面
  next({ name: 'Login' })
})

export default router
