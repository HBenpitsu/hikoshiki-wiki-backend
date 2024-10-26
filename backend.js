// backend.js
import { firestore } from "./firebaseConfig";

export const submitDataToFirestore = async (data, collectionName) => {
  try {
    await firestore.collection(collectionName).add(data); // 引数で受け取ったコレクション名を使用
    console.log("データが正常に送信されました");
  } catch (error) {
    console.error("Firestoreへの送信エラー: ", error);
  }
};
