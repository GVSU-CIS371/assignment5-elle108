import { defineStore } from "pinia";
import {
  BaseBeverageType,
  CreamerType,
  SyrupType,
  BeverageType,
} from "../types/beverage";
import tempretures from "../data/tempretures.json";
import db from "../firebase";
import {
  collection,
  getDocs,
  setDoc,
  doc,
  onSnapshot,
  query,
  where,
  Unsubscribe,
} from "firebase/firestore";
import { User } from "firebase/auth";

let unsubscribeBeverages: Unsubscribe | null = null;

export const useBeverageStore = defineStore("BeverageStore", {
  state: () => ({
    temps: tempretures,
    currentTemp: tempretures[0],
    bases: [] as BaseBeverageType[],
    currentBase: null as BaseBeverageType | null,
    syrups: [] as SyrupType[],
    currentSyrup: null as SyrupType | null,
    creamers: [] as CreamerType[],
    currentCreamer: null as CreamerType | null,
    beverages: [] as BeverageType[],
    currentBeverage: null as BeverageType | null,
    currentName: "",
    user: null as User | null,
  }),

  actions: {
    async init() {
      const [basesSnap, creamersSnap, syrupsSnap] = await Promise.all([
        getDocs(collection(db, "bases")),
        getDocs(collection(db, "creamers")),
        getDocs(collection(db, "syrups")),
      ]);

      this.bases = basesSnap.docs.map((d) => ({ id: d.id, ...d.data() } as BaseBeverageType));
      this.creamers = creamersSnap.docs.map((d) => ({ id: d.id, ...d.data() } as CreamerType));
      this.syrups = syrupsSnap.docs.map((d) => ({ id: d.id, ...d.data() } as SyrupType));

      // Set defaults
      this.currentBase = this.bases[0] ?? null;
      this.currentCreamer = this.creamers[0] ?? null;
      this.currentSyrup = this.syrups[0] ?? null;
    },

    setUser(user: User | null) {
      this.user = user;

      if (unsubscribeBeverages) {
        unsubscribeBeverages();
        unsubscribeBeverages = null;
      }

      if (!user) {
        this.beverages = [];
        this.currentBeverage = null;
        return;
      }

      const q = query(
        collection(db, "beverages"),
        where("userId", "==", user.uid)
      );

      unsubscribeBeverages = onSnapshot(q, (snapshot) => {
        this.beverages = snapshot.docs.map(
          (d) => ({ id: d.id, ...d.data() } as BeverageType)
        );

        if (this.beverages.length > 0) {
          const stillExists = this.beverages.find(
            (b) => b.id === this.currentBeverage?.id
          );
          this.currentBeverage = stillExists ?? this.beverages[0];
        } else {
          this.currentBeverage = null;
        }
      });
    },

    async makeBeverage(): Promise<string> {
      if (!this.user) {
        return "No user logged in, please sign in first.";
      }
      if (!this.currentBase || !this.currentCreamer || !this.currentSyrup || !this.currentName.trim()) {
        return "Please complete all beverage options and the name before making a beverage.";
      }

      const id = `${this.user.uid}_${Date.now()}`;
      const beverage: BeverageType = {
        id,
        name: this.currentName.trim(),
        temp: this.currentTemp,
        base: this.currentBase,
        creamer: this.currentCreamer,
        syrup: this.currentSyrup,
        userId: this.user.uid,
      };

      await setDoc(doc(db, "beverages", id), beverage);
      this.currentBeverage = beverage;
      this.currentName = "";

      return `Beverage ${beverage.name} made successfully!`;
    },

    showBeverage(beverage: BeverageType) {
      this.currentBeverage = beverage;
      this.currentTemp = beverage.temp;
      this.currentBase = beverage.base;
      this.currentCreamer = beverage.creamer;
      this.currentSyrup = beverage.syrup;
    },
  },
});