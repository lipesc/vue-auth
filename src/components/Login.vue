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
    <p><button> <a @click="resetPassword">Reset password</a> </button></p>

  </div>

</template>

<script>
import { ref } from "vue";
import { auth } from "../firebase";
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
  max-width: 400px;
  margin: auto;
  text-align: center;
  text-align: center;
  font-family: Inter, system-ui, Avenir, Helvetica, Arial, sans-serif;
  line-height: 1.5;
  font-weight: 400;

  color-scheme: light dark;
  color: rgba(255, 255, 255, 0.87);
  background-color: #242424;

  font-synthesis: none;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

input {
  width: 85%;
  margin: 10px 0;
  padding: 10px;
  border-radius: 8px;
  border: 1px solid transparent;
  font-size: 1em;
  font-weight: 500;
  font-family: inherit;
  background-color: #e0dfdf;
  cursor: pointer;
  transition: border-color 0.25s;
}
a {
  font-weight: 500;
  color: #646cff;
  text-decoration: inherit;
}
a:hover {
  color: #535bf2;
}

body {
  margin: 0;
  display: block;
  place-items: center;
  min-width: 320px;
  min-height: 100vh;
}

h2 {
  font-size: 1.5em;
  line-height: 1.1;
}
button {
  border-radius: 8px;
  border: 1px solid transparent;
  margin: 10px 0;
  padding: 10px;
  font-size: 1em;
  font-weight: 500;
  font-family: inherit;
  background-color: #1a1a1a;
  cursor: pointer;
  transition: border-color 0.25s;
}
button:hover {
  border-color: #646cff;
}
button:focus,
button:focus-visible {
  outline: 4px auto -webkit-focus-ring-color;
}


@media (prefers-color-scheme: light) {
  :root {
    color: #213547;
    background-color: #ffffff;
  }
  a:hover {
    color: #747bff;
  }
  button {
    background-color: #f9f9f9;
  }
}

</style>