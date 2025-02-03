<template>
  <div class="home-page">
    <h1>lipesc project: vue3 loging</h1>
    <button @click="logout">logout</button>
  </div>
</template>

<script>
import { auth } from "../firebase";
import { signOut } from "firebase/auth";
import { useRouter } from "vue-router";
import { useToast } from "vue-toastification";

export default {
  setup() {
    const router = useRouter();
    const toast = useToast();
    const logout = async () => {
      try {
        await signOut(auth);
        toast("Logged out successfully.");
        router.push('/');
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

h1 {
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