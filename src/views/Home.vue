<template>
  <div class="home-page">
    <h1>lipesc project: vue3 loging</h1>
    <button @click="logout">logout</button>
  </div>
</template>

<script>
import { auth } from "../firebase";
import { signOut } from "firebase/auth";

export default {
  setup() {
    const logout = async () => {
      try {
        await signOut(auth);
        alert("Logged out successfully.");
      } catch (error) {
        alert(error.message);
      }

    };

    return { logout };
  },
};
</script>

<style scoped>
.home-page {
  text-align: center;
  margin-top: 50px;


}

button {
  padding: 10px;
  margin-top: 20px;
}
</style>