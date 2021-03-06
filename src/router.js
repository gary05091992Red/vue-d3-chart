import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'demo',
      component: () => import(/* webpackChunkName: "demo" */ './components/Charts_modular/demo.vue')
    }
  ]
})
