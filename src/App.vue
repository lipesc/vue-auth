<script setup>
import Login from './components/Login.vue'
import Home from './views/Home.vue'
</script>

<template>
  <div>
    <a href="hhttps://github.com/lipesc" target="_blank">
      <img src="./assets/gitlogo.png" class="logo" alt="profilepic" />
    </a>
 
  </div>
  <Home msg="lipesc" />
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
