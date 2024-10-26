import React, { useState, useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import LoadingScreen from "./pages/LoadingScreen";
import HomeScreen from "./pages/HomeScreen";
import InputScreen from "./pages/InputScreen";

const Stack = createStackNavigator();

const App = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadApp = async () => {
      // ロード処理をここで行う（例: APIのフェッチやデータの準備など）
      await new Promise((resolve) => setTimeout(resolve, 2000)); // 2秒待つ
      setLoading(false);
    };

    loadApp();
  }, []);

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Input" component={InputScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
