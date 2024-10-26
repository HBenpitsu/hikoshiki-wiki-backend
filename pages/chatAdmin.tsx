import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  TextInput,
  SafeAreaView,
  View,
  Button,
  FlatList,
  Alert,
} from "react-native";
import { StatusBar as ExpoStatusBar } from "expo-status-bar";
import {
  Timestamp,
  setDoc,
  collection,
  query,
  orderBy,
  onSnapshot,
} from "firebase/firestore";
import { getMessageDocRef, db, getUserId } from "../lib/firebase";
import { Message } from "../types/message";
import { MessageItem } from "./messageitem"; // 修正箇所

export const ChatAdmin = () => {
  const [text, setText] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [userId, setUserId] = useState<string | undefined>();

  // ユーザーIDを取得
  const signin = async () => {
    const uid = await getUserId();
    setUserId(uid);
  };

  // メッセージの送信
  const sendMessage = async (value: string) => {
    if (value !== "" && userId) {
      const docRef = await getMessageDocRef();
      const newMessage: Message = {
        id: docRef.id,
        text: value,
        createdAt: Timestamp.now(),
        userId: userId,
        userName: "YOUR_USER_NAME",
      } as Message;
      await setDoc(docRef, newMessage);
      setText("");
    } else {
      Alert.alert("エラー", "メッセージを入力してください！");
    }
  };

  // Firestoreからメッセージをリアルタイムで取得
  useEffect(() => {
    const q = query(collection(db, "messages"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newMessages: Message[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Message[];
      setMessages(newMessages);
    });

    return () => unsubscribe();
  }, []);

  // サインインとメッセージの取得
  useEffect(() => {
    signin();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <ExpoStatusBar style="light" />
      <FlatList
        data={messages}
        renderItem={({ item }) => (
          <MessageItem message={item} userId={userId} />
        )} // 修正箇所
        keyExtractor={(item) => item.id}
        inverted
      />
      <View style={styles.inputTextContainer}>
        <TextInput
          style={styles.inputText}
          onChangeText={(value) => setText(value)}
          value={text}
          placeholder="メッセージを入力してください"
          placeholderTextColor="#777"
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="done"
        />
        <Button title="送信" onPress={() => sendMessage(text)} />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#333",
  },
  inputTextContainer: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
  },
  inputText: {
    color: "#fff",
    borderWidth: 1,
    borderColor: "#999",
    height: 40,
    flex: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
  },
});
