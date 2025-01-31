import { createRouter, createWebHistory } from "vue-router";
import Auth from "../views/Auth.vue";
import Home from "../views/Home.vue";
const routes = [
  { path: "/", component: Home },
  { path: "/auth", component: Auth },

];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;