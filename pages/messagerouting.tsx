// AppNavigator.tsx
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { ChatRoomSelection } from "./ChatRoomSelection";
import { ChatAdmin } from "./chatAdmin";
import { Chatclub } from "./chatClub";

const Stack = createStackNavigator();

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="ChatRoomSelection">
        <Stack.Screen name="ChatRoomSelection" component={ChatRoomSelection} />
        <Stack.Screen name="ChatAdmin" component={ChatAdmin} />
        <Stack.Screen name="Chatclub" component={Chatclub} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
