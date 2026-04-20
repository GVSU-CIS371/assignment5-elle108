import { getFirestore } from "firebase/firestore";
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCphEM30B-n1E2go5KJGu7ALIBj3NUpPn4",
  authDomain: "brew-portal-3295d.firebaseapp.com",
  projectId: "brew-portal-3295d",
  storageBucket: "brew-portal-3295d.firebasestorage.app",
  messagingSenderId: "578254667515",
  appId: "1:578254667515:web:c3e6e1e67e9459119afa5e",
  measurementId: "G-8N7Q14XB5J"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export default db;
export { auth };