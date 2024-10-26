import firebase from "firebase/app";
import "firebase/firestore";

// Firebaseの初期化
const firebaseConfig = {
  apiKey: "AIzaSyABT5pEPk4QpsxElFk3E1IElr4Y3ICuYYs",
  authDomain: "rio-s-tets.firebaseapp.com",
  projectId: "rio-s-tets",
  storageBucket: "rio-s-tets.appspot.com",
  messagingSenderId: "1087006869767",
  appId: "1:1087006869767:web:e9a796972e40dd10d15da2",
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const firestore = firebase.firestore();

export const submitDataToFirestore = async (data, collectionName) => {
  try {
    await firestore.collection(collectionName).add(data);
  } catch (error) {
    console.error("Error submitting data to Firestore: ", error);
  }
};
