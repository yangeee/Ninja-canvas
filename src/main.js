import Vue from 'vue'
import App from './App.vue'
import {Slider, ColorPicker, Button} from 'element-ui'

Vue.use(Button)
Vue.use(Slider)
Vue.use(ColorPicker)
Vue.prototype.$bus = new Vue()

Vue.config.productionTip = false

new Vue({
  render: h => h(App),
}).$mount('#app')
