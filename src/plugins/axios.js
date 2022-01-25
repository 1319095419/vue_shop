import axios from 'axios'

// 配置axios请求根路径
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1'

// 请求拦截器
axios.interceptors.request.use(
  function (config) {
    // 发送请求前配置携带的token
    config.headers.Authorization = sessionStorage.getItem('token') || ''
    return config
  },
  function (error) {
    // Do something with request error
    return console.log(error)
  }
)

// 响应拦截器
axios.interceptors.response.use(
  function (response) {
    // 响应数据剥离
    return response.data
  },
  function (error) {
    // Do something with response error
    return console.log(error)
  }
)

export default axios
