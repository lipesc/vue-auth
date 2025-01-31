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
import { ref } from "vue";
import { store } from "../firebase";
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, GithubAuthProvider, sendPasswordResetEmail } from "firebase/auth";


export default {
  setup() {
    const email = ref("");
    const password = ref("");

    const login = async () => {
      try {
        await signInWithEmailAndPassword(auth, email.value, password.value);
        alert("loggeg in successfully ***");
      } catch (error) {
        alert(error.message);
      }
    };

    const loginWithGoole = async () => {
      try {
        const provider = new GoogleAuthProvider();
        await signInWithPopup(auth, provider);
        alert("logged in with google ***");
      } catch (error) {
        alert(error.message);
      }
    
    }

    const loginWithGithub = async () => {
      try {
        const provider = new GithubAuthProvider();
        await signInWithPopup(auth, provider);
        alert("Logge in with Github ***");
      } catch (error) {
        alert(error.message);
      }
    }

    const resetPassword = async () => {
      if (!email.value) return alert("Enter your email first.");    
      try {
        await sendPasswordResetEmail(auth, email.value);
        alert("Password reset email sent.");
      } catch (error) {
        alert(error.message);
      }
    };

    return { email, password, login, loginWithGoole, loginWithGithub, resetPassword };
    },
  };
</script>

<style scoped>
.login-container {
  max-width: 450px;
  margin: auto;
  text-align: center;
}

input {
  display: block;
  width: 100%;
  margin: 13px 0;
  padding: 10px
}

button {
  padding: auto;
  margin-top: 10px;
}
</style>