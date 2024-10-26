import React from "react";
import { View, Text, Button, StyleSheet } from "react-native";

export const ChatRoomSelection = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>チャットルームを選択</Text>
      <Button
        title="ユーザーと管理者のチャット"
        onPress={() => navigation.navigate("ChatAdmin")}
      />
      <Button
        title="ユーザーと部活のチャット"
        onPress={() => navigation.navigate("Chatclub")}
      />
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#333",
    paddingHorizontal: 20, // 横方向の余白を追加
    paddingVertical: 40, // 上下方向の余白を追加
  },
  title: {
    color: "#fff",
    fontSize: 28, // 少し大きめのフォントサイズ
    fontWeight: "bold", // 文字を太くして強調
    marginBottom: 30, // タイトルの下に余白を追加
    textAlign: "center", // 中央揃えでバランスよく表示
  },
});
