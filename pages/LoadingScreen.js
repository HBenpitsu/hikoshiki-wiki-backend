import React from "react";
import { View, Text, ActivityIndicator } from "react-native";

const LoadingScreen = () => {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <ActivityIndicator size="large" color="#0000ff" />
      <Text>読み込み中...</Text>
    </View>
  );
};

export default LoadingScreen;
