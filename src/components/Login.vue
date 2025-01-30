<template>
  <div class="login-container">

    <h2>Login</h2>

    <form @submit.prevent="login">
      <input v-model="email" type="email" placeholder="Email" required />
      <input v-model="password" type="password" placeholder="password" required />
      <button type="submit">Login</button>
    </form>

    <button @click="loginWithGoole"> Login with google</button>
    <button @click="loginWithGithub"> Login with github</button>
    <p><a @click="resetPassword">Reset password</a> </p>

  </div>

</template>

<script>

</script>