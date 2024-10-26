import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  TextInput,
  SafeAreaView,
  View,
  Button,
  FlatList,
  Alert,
  Text,
  TouchableOpacity,
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
import { useNavigation } from "@react-navigation/native"; // ナビゲーションフックをインポート

export const Chatclub = () => {
  const [text, setText] = useState<string>(""); // 入力されたメッセージ
  const [messages, setMessages] = useState<Message[]>([]); // メッセージリスト
  const [userId, setUserId] = useState<string | undefined>(); // ユーザーID
  const navigation = useNavigation(); // ナビゲーションオブジェクトの取得

  // ユーザーIDを取得
  const signin = async () => {
    const uid = await getUserId();
    setUserId(uid);
  };

  // メッセージ送信
  const sendMessage = async (value: string) => {
    if (value !== "" && userId) {
      const docRef = await getMessageDocRef();
      const newMessage: Message = {
        id: docRef.id,
        text: value,
        createdAt: Timestamp.now(),
        userId: userId,
        userName: "YOUR_USER_NAME", // ユーザー名の設定（必要に応じて変更）
      } as Message;
      await setDoc(docRef, newMessage);
      setText(""); // 送信後に入力フィールドをリセット
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
      setMessages(newMessages); // メッセージを更新
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

      {/* 戻るボタン */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()} // 戻るボタンを押すと前の画面に戻る
      >
        <Text style={styles.backButtonText}>戻る</Text>
      </TouchableOpacity>

      <FlatList
        data={messages}
        renderItem={({ item }) => (
          <MessageItem message={item} userId={userId} />
        )}
        keyExtractor={(item) => item.id}
        inverted
      />
      <View style={styles.inputTextContainer}>
        <TextInput
          style={styles.inputText}
          onChangeText={(value) => setText(value)}
          value={text}
          placeholder="メッセージを入力してください"
          placeholderTextColor="#bbb"
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="send"
        />
        <TouchableOpacity
          style={styles.sendButton}
          onPress={() => sendMessage(text)}
        >
          <Text style={styles.sendButtonText}>送信</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1e1e1e", // 背景色
  },
  backButton: {
    padding: 10,
    backgroundColor: "#4a90e2",
    borderRadius: 8,
    margin: 10,
  },
  backButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  chatList: {
    flex: 1,
    padding: 10,
    backgroundColor: "#2c2c2c", // チャットリストの背景色
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  message: {
    color: "#fff",
    backgroundColor: "#444",
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
    alignSelf: "flex-start", // メッセージが左寄せ
  },
  messageUser: {
    alignSelf: "flex-end", // 自分のメッセージを右寄せ
    backgroundColor: "#4a90e2", // ユーザーのメッセージ
  },
  inputTextContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    backgroundColor: "#333", // 入力エリアの背景色
    borderTopWidth: 1,
    borderTopColor: "#444",
  },
  inputText: {
    color: "#fff",
    borderWidth: 1,
    borderColor: "#555",
    height: 40,
    flex: 1,
    borderRadius: 25,
    paddingHorizontal: 15,
    backgroundColor: "#444", // 入力フィールドの背景
  },
  sendButton: {
    marginLeft: 10,
    backgroundColor: "#4a90e2", // 送信ボタンの背景色
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
  },
  sendButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
