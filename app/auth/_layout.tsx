import { Stack } from "expo-router";
import { CarritoProvider } from "../context/CarritoContext";

export default function AuthLayout() {
  return (
    <CarritoProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="verificar" />
        <Stack.Screen name="telefono" />
      </Stack>
    </CarritoProvider>
  );
}