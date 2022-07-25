import { createApp } from 'vue'
import ViewUIPlus from 'view-ui-plus'
import App from './App.vue'
import router from './router'
import './styles/index.less'

const app = createApp(App)

app.use(router)
  .use(ViewUIPlus)
  .mount('#app')
