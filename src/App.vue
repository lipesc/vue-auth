<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const isAuth = ref(false);
const router = useRouter();

const checkAuth = () => {
  if (!isAuth.value) {
    router.push('/login');
  }
}

</script>

<template>
  <div>
    <a href="hhttps://github.com/lipesc" target="_blank">
      <img src="./assets/gitlogo.png" class="logo" alt="profilepic" />
    </a>
    <router-view @check-auth="checkAuth"></router-view>
  </div>
  
</template>

<style scoped>
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
</style>
