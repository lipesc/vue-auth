import { createApp } from 'vue'
import Toast from "vue-toastification";
import "vue-toastification/dist/index.css";

import App from './App.vue'
import router from './router'

const options = {
  // toasts
};
const app = createApp(App);
//createApp(App).mount('#app')
app.use(router);
app.use(Toast);
app.mount("#app");