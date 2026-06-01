import { Tabs } from "expo-router";
import { useEffect, useState } from "react";
import { Image, Text } from "react-native";
import { supabase } from "../../supabaseConfig";

const ADMIN_EMAIL = "agarcia@itpfp.com";

export default function RootLayout() {
  const [email, setEmail] = useState<string | null>(null);
  const [listo, setListo] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setEmail(session?.user?.email ?? null);
      setListo(true);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setEmail(session?.user?.email ?? null);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  if (!listo) return null;

  const esAdmin = email === ADMIN_EMAIL;

  return (
    <Tabs
      initialRouteName={esAdmin ? "perfil" : "cartelera"}
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
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 22, color }}>🏪</Text>,
        }}
      />
      <Tabs.Screen
        name="pedido"
        options={{
          href: esAdmin ? null : "/tabs/pedido",
          tabBarLabel: "",
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 22, color }}>🛒</Text>,
        }}
      />
      <Tabs.Screen
        name="perfil"
        options={{
          tabBarLabel: "",
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 22, color }}>👤</Text>,
        }}
      />
    </Tabs>
  );
}