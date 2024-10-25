import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { NavigationContainer } from "@react-navigation/native";
// import HomeScreen from "./pages/HomeScreen";
// import PhotoUploadPage from "./pages/PhotoUploadPage";
// import InformationForm from "./pages/InformationForm";
import SignUpScreen from "./signup"; //デバッグ用

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <>
      <SignUpScreen/>
    </>
    // <NavigationContainer>
    //   <Stack.Navigator initialRouteName="Home">
    //     <Stack.Screen name="Home" component={HomeScreen} />
    //     <Stack.Screen name="PhotoUpload" component={PhotoUploadPage} />
    //     <Stack.Screen name="InformationForm" component={InformationForm} />
    //   </Stack.Navigator>
    // </NavigationContainer>
  );
}
