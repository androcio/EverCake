import { Stack } from "expo-router";
import { CarritoProvider } from "./context/CarritoContext";

export default function RootLayout() {
  return (
    <CarritoProvider>
      <Stack>
        <Stack.Screen name="tabs" options={{ headerShown: false }} />
        <Stack.Screen name="auth" options={{ headerShown: false }} />
      </Stack>
    </CarritoProvider>
  );
}