import { createRouter, createWebHistory } from "vue-router";
import Auth from "../views/Auth.vue";
import Home from "../views/Home.vue";
import { auth } from "../firebase";

const routes = [
  { path: "/", component: Auth },
  { path: "/home", component: Home, meta: { requiresAuth: true } },

];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  const user = auth.currentUser;
  if (to.meta.requireAuth && !user) {
    next("/auth");
  } else {
    next();
  }
});

export default router;