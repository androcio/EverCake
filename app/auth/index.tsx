import { useRouter } from "expo-router";
import { useState } from "react";
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { supabase } from "../../supabaseConfig";

export default function Index() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [cargando, setCargando] = useState(false);

  const enviarCodigo = async () => {
  if (!email) return;
  setCargando(true);

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { shouldCreateUser: true },
  });

  setCargando(false);

  if (error) {
    // Muestra el error completo para diagnosticar
    console.log("Error completo:", JSON.stringify(error));
    alert("Error: " + error.message + " (status: " + error.status + ")");
  } else {
    router.push({ pathname: "/auth/verificar" as any, params: { email } });
  }
};

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.container}>

        <TouchableOpacity style={styles.backButton} onPress={() => router.replace("/tabs/cartelera" as any)}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>

        <View style={styles.logo}>
          <Text style={styles.logoEmoji}>🎂</Text>
        </View>
        <Text style={styles.title}>EverCake</Text>
        <Text style={styles.subtitle}>Las mejores tartas para tus momentos especiales</Text>

        <Text style={styles.label}>Correo electrónico</Text>
        <TextInput
          style={styles.input}
          placeholder="tu@email.com"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />

        <TouchableOpacity
          style={[styles.boton, (!email || cargando) && styles.botonDesactivado]}
          onPress={enviarCodigo}
          disabled={!email || cargando}
        >
          <Text style={styles.botonTexto}>{cargando ? "Enviando..." : "Continuar"}</Text>
        </TouchableOpacity>

        <View style={styles.separador}>
          <View style={styles.linea} />
          <Text style={styles.bienvenido}>Bienvenido</Text>
          <View style={styles.linea} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#fff", padding: 30 },
  backButton: { position: "absolute", top: 50, left: 20, padding: 8 },
  backArrow: { fontSize: 28, color: "#000", fontWeight: "300" },
  logo: { width: 100, height: 100, borderRadius: 50, backgroundColor: "#000", alignItems: "center", justifyContent: "center", marginBottom: 20 },
  logoEmoji: { fontSize: 48 },
  title: { fontSize: 32, fontWeight: "bold", color: "#000", marginBottom: 8 },
  subtitle: { fontSize: 14, color: "#888", textAlign: "center", marginBottom: 40 },
  label: { alignSelf: "flex-start", fontSize: 14, color: "#333", marginBottom: 8 },
  input: { width: "100%", borderWidth: 1, borderColor: "#ddd", borderRadius: 12, padding: 14, fontSize: 16, marginBottom: 20 },
  boton: { backgroundColor: "#888", paddingVertical: 16, borderRadius: 12, width: "100%", alignItems: "center", marginBottom: 30 },
  botonDesactivado: { backgroundColor: "#ccc" },
  botonTexto: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  separador: { flexDirection: "row", alignItems: "center", width: "100%" },
  linea: { flex: 1, height: 1, backgroundColor: "#ddd" },
  bienvenido: { marginHorizontal: 10, color: "#aaa", fontSize: 14 },
});