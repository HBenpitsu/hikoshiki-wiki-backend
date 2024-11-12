import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { NavigationContainer } from "@react-navigation/native";
import HomeScreen from "./pages/HomeScreen";
// import PhotoUploadPage from "./pages/PhotoUploadPage";
// import InformationForm from "./pages/InformationForm";

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="Home" component={HomeScreen} />
        {/* <Stack.Screen name="PhotoUpload" component={PhotoUploadPage} />
        <Stack.Screen name="InformationForm" component={InformationForm} /> */}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
