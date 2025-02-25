import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import { getFirestore, collection, doc } from "firebase/firestore";
import { initializeAuth, getAuth
 } from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import 'firebase/auth';
import 'firebase/firestore';


const firebaseConfig = {
  apiKey: "AIzaSyABT5pEPk4QpsxElFk3E1IElr4Y3ICuYYs",
  authDomain: "unofficialwikigroup4.firebaseapp.com",
  databaseURL: "https://unofficialwikigroup4-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "unofficialwikigroup4",
  storageBucket: "unofficialwikigroup4.appspot.com",
  messagingSenderId: "942892902022",
  appId: "1:942892902022:web:d0432a88360497a12e1307",
  measurementId: "G-CGSGNBQ2GD"
};

// Firebaseアプリの初期化
let firebaseApp: FirebaseApp;
if (!getApps().length) {
  firebaseApp = initializeApp(firebaseConfig);
} else {
  firebaseApp = getApps()[0];
}

// Firestoreインスタンスを取得
export const db = getFirestore(firebaseApp);

// Authインスタンスを初期化し、AsyncStorageを提供


// clubtestコレクションの参照を取得する関数
export const getClubTestCollectionRef = () => {
  return collection(db, "clubtest");
};