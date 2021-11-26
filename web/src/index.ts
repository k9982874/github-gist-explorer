import Vue from "vue";
import Vuex from "vuex";
import VueRouter from "vue-router";

import BootstrapVue from "bootstrap-vue";

import "bootstrap/dist/css/bootstrap.css";
import "bootstrap-vue/dist/bootstrap-vue.css";

import API from "./API";
import Store from "./Store";
import Routes from "./Routes";

import App from "./App.vue";

Vue.use(Vuex);
Vue.use(VueRouter);
Vue.use(BootstrapVue);

const mountEl: any = document.querySelector("#app");
const storeOptions = Store(mountEl.dataset);
const store = new Vuex.Store(storeOptions);

const router = new VueRouter({ routes: Routes });

Vue.use(API, { store });

new Vue({
  el: mountEl,
  store,
  router,
  render: h => h(App)
})
