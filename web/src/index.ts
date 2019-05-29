import Vue from 'vue';
import Vuex from 'vuex';
import VueRouter from 'vue-router'

import BootstrapVue from 'bootstrap-vue';

import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap-vue/dist/bootstrap-vue.css';

import Store from './Store';
import Routes from './Routes';

import App from './App.vue';

Vue.use(Vuex);
Vue.use(VueRouter);
Vue.use(BootstrapVue);

const store = new Vuex.Store(Store);

const router = new VueRouter({ routes: Routes });

new Vue({
  el: "#app",
  store,
  router,
  render: h => h(App)
});
