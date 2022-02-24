import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import installElementPlus from './plugins/element'
// 引入全局通用样式
import './assets/global.css'
// 引入字体文件
import './assets/fonts/iconfont.css'

const app = createApp(App)
// 将elementui挂载到app实例中（部分引入）
installElementPlus(app)
app.use(router).mount('#app')
