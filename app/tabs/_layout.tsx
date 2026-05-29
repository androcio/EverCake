import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { useEffect, useState } from "react";
import { Image } from "react-native";
import { supabase } from "../../supabaseConfig";

const ADMIN_EMAIL = "info@tartasdeautor.com";

export default function RootLayout() {
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setEmail(session?.user?.email ?? null);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setEmail(session?.user?.email ?? null);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  const esAdmin = email === ADMIN_EMAIL;

  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: "#000" },
        headerTintColor: "#fff",
        headerTitleStyle: { fontWeight: "bold" },
        tabBarActiveTintColor: "#000",
        tabBarInactiveTintColor: "#888",
        headerTitle: () => (
          <Image
            source={require("../../assets/images/logo.png")}
            style={{ width: 160, height: 85 }}
            resizeMode="contain"
          />
        ),
        headerTitleAlign: "center",
      }}
    >
      <Tabs.Screen name="index" options={{ href: null }} />
      <Tabs.Screen name="auth/index" options={{ href: null }} />
      <Tabs.Screen name="auth/verificar" options={{ href: null }} />
      <Tabs.Screen name="auth" options={{ href: null }} />
      <Tabs.Screen name="detalle" options={{ href: null }} />
      <Tabs.Screen
        name="cartelera"
        options={{
          href: esAdmin ? null : "/tabs/cartelera",
          tabBarLabel: "",
          tabBarIcon: ({ color }) => <Ionicons name="grid-outline" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="pedido"
        options={{
          href: esAdmin ? null : "/tabs/pedido",
          tabBarLabel: "",
          tabBarIcon: ({ color }) => <Ionicons name="receipt-outline" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="perfil"
        options={{
          tabBarLabel: "",
          tabBarIcon: ({ color }) => <Ionicons name="person-outline" size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}