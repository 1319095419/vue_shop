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
      },
      {
        path: 'users',
        name: 'Users',
        component: Users
      },
      {
        path: '/rights',
        name: 'Right',
        component: Rights
      },
      {
        path: '/roles',
        name: 'Roles',
        component: Roles
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
  const isLogin = sessionStorage.getItem('token')
  // 如果登录成功或要跳转到登录页面，允许继续跳转
  if (isLogin || to.path === '/login') {
    return next()
  }
  // 否则强制其跳转回登录页面
  next({ name: 'Login' })
})

export default router
