// src/component/MessageItem.tsx

import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Message } from "../types/message";

interface MessageItemProps {
  message: Message;
  userId: string | undefined; // userIdを受け取る
}

export const MessageItem: React.FC<MessageItemProps> = ({
  message,
  userId,
}) => {
  const isSentByCurrentUser = message.userId === userId;

  return (
    <View
      style={[
        styles.messageItem,
        isSentByCurrentUser ? styles.sentMessage : styles.receivedMessage,
      ]}
    >
      <Text style={styles.messageText}>{message.text}</Text>
      <Text style={styles.messageTime}>
        {message.createdAt.toDate().toLocaleString()}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  messageItem: {
    padding: 10,
    borderRadius: 5,
    marginVertical: 5,
  },
  sentMessage: {
    backgroundColor: "#007AFF",
    alignSelf: "flex-end", // 右寄せ
  },
  receivedMessage: {
    backgroundColor: "#444",
    alignSelf: "flex-start", // 左寄せ
  },
  messageText: {
    color: "#fff",
  },
  messageTime: {
    color: "#777",
    fontSize: 12,
    marginTop: 5,
  },
});
