import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import AppRoutes from "./src/routes/AppRoutes";

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style="auto" />
      <AppRoutes />
    </SafeAreaProvider>
  );
}