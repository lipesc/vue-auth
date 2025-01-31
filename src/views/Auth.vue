<template>
  <div class="auth-page">
  <h1>Authentication</h1>
  <Login />
  </div>
</template>

<script>
import Login from "./components/Login.vue";

export default {
  components: {
    Login,
  },
};
</script>

<style scoped>
.auth-page {
  text-align: center;
  margin-top: 50px;
}
</style>