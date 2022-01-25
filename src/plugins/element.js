import {
  ElButton,
  ElForm,
  ElFormItem,
  ElInput,
  ElMessage
} from 'element-plus'

export default (app) => {
  app.use(ElButton)
  app.use(ElForm)
  app.use(ElInput)
  app.use(ElFormItem)
  app.use(ElMessage)
}
