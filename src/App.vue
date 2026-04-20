<template>
  <div>
    <Beverage :isIced="beverageStore.currentTemp === 'Cold'" />
    <ul>
      <li>
        <template v-for="temp in beverageStore.temps" :key="temp">
          <label>
            <input type="radio" name="temperature" :value="temp" v-model="beverageStore.currentTemp" />
            {{ temp }}
          </label>
        </template>
      </li>
    </ul>
    <ul>
      <li>
        <template v-for="b in beverageStore.bases" :key="b.id">
          <label>
            <input type="radio" name="bases" :value="b" v-model="beverageStore.currentBase" />
            {{ b.name }}
          </label>
        </template>
      </li>
    </ul>
    <ul>
      <li>
        <template v-for="s in beverageStore.syrups" :key="s.id">
          <label>
            <input type="radio" name="syrups" :value="s" v-model="beverageStore.currentSyrup" />
            {{ s.name }}
          </label>
        </template>
      </li>
    </ul>
    <ul>
      <li>
        <template v-for="c in beverageStore.creamers" :key="c.id">
          <label>
            <input type="radio" name="creamers" :value="c" v-model="beverageStore.currentCreamer" />
            {{ c.name }}
          </label>
        </template>
      </li>
    </ul>
    <div>
      <button v-if="!beverageStore.user" @click="withGoogle">Sign in with Google</button>
      <template v-else>
        <span>{{ beverageStore.user.displayName }}</span>
        <button @click="signOut">Sign Out</button>
      </template>
    </div>

    <p v-if="message">{{ message }}</p>

    <input type="text" placeholder="Beverage Name" v-model="beverageStore.currentName" />
    <button @click="handleMake" :disabled="!beverageStore.user">Make Beverage</button>

    <ul v-if="beverageStore.user && beverageStore.beverages.length > 0">
      <li v-for="bev in beverageStore.beverages" :key="bev.id">
        <label>
          <input type="radio" name="saved" :value="bev" v-model="beverageStore.currentBeverage" @change="beverageStore.showBeverage(bev)" />
          {{ bev.name }}
        </label>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import Beverage from "./components/Beverage.vue";
import { useBeverageStore } from "./stores/beverageStore";
import { auth } from "./firebase";
import { GoogleAuthProvider, signInWithPopup, onAuthStateChanged, signOut as firebaseSignOut } from "firebase/auth";

const beverageStore = useBeverageStore();
const message = ref("");

onMounted(() => {
  onAuthStateChanged(auth, (user) => {
    beverageStore.setUser(user);
  });
});

async function withGoogle() {
  try {
    await signInWithPopup(auth, new GoogleAuthProvider());
  } catch (err: any) {
    message.value = err.message;
  }
}

async function signOut() {
  await firebaseSignOut(auth);
}

async function handleMake() {
  message.value = await beverageStore.makeBeverage();
}
</script>

<style lang="scss">
body, html {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  background-color: #6e4228;
  background: linear-gradient(to bottom, #6e4228 0%, #956f5a 100%);
}
ul {
  list-style: none;
}
</style>