import { createRouter, createWebHistory } from "vue-router";
import Auth from "../views/Auth.vue";
import Home from "../views/Home.vue";
import { auth } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";

const routes = [
  { path: "/", component: Auth, meta: { guestOnly: true } },
  { path: "/home", component: Home, meta: { requiresAuth: true } },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

let isAuthChecked = false;

router.beforeEach((to, from, next) => {
  onAuthStateChanged(auth, (user) => {
    if (to.meta.requiresAuth && !user) {
      next("/"); // Bloqueia acesso a /home se não estiver logado
    } else if (to.meta.guestOnly && user) {
      next("/home"); // Bloqueia acesso a / se já estiver logado
    } else {
      next();
    }
  });
});


export default router;
