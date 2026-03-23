import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: "#888" },
        headerTintColor: "#fff",
        headerTitleStyle: { fontWeight: "bold" },
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="cartelera" options={{ title: "Nuestras Tartas" }} />
      <Stack.Screen name="pedido" options={{ title: "Hacer Pedido" }} />
    </Stack>
  );
}