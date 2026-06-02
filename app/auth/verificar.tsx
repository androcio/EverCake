import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { Keyboard, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { supabase } from "../../supabaseConfig";

const ADMIN_EMAIL = "agarcia@itpfp.com";

export default function Verificar() {
  const router = useRouter();
  const { email } = useLocalSearchParams();
  const [codigo, setCodigo] = useState("");
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");

  const comprobarCodigo = async (texto: string) => {
    const cod = texto || codigo;
    if (cod.length < 6) return;
    if (Platform.OS !== "web") Keyboard.dismiss();
    setCargando(true);
    setError("");

    const { error: err } = await supabase.auth.verifyOtp({
      email: email as string,
      token: cod,
      type: "email",
    });

    setCargando(false);

    if (err) {
      setError("Código incorrecto. Inténtalo de nuevo.");
    } else {
      if ((email as string) === ADMIN_EMAIL) {
        router.replace("/tabs/perfil" as any);
      } else {
        router.replace("/auth/telefono" as any);
      }
    }
  };

  const handleCodigo = (texto: string) => {
    const soloNumeros = texto.replace(/[^0-9]/g, "").slice(0, 6);
    setCodigo(soloNumeros);
    if (soloNumeros.length === 6) comprobarCodigo(soloNumeros);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.backArrow}>←</Text>
      </TouchableOpacity>
      <View style={styles.logo}>
        <Text style={styles.logoEmoji}>🎂</Text>
      </View>
      <Text style={styles.title}>Verificar cuenta</Text>
      <Text style={styles.subtitle}>Hemos enviado un código a {email}</Text>
      <Text style={styles.label}>Código de verificación</Text>
      <TextInput
        style={styles.input}
        placeholder="000000"
        inputMode="numeric"
        maxLength={6}
        value={codigo}
        onChangeText={handleCodigo}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <TouchableOpacity
        style={[styles.boton, (codigo.length < 6 || cargando) && styles.botonDesactivado]}
        onPress={() => comprobarCodigo(codigo)}
        disabled={codigo.length < 6 || cargando}
      >
        <Text style={styles.botonTexto}>{cargando ? "Verificando..." : "Verificar"}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#fff", padding: 30 },
  backButton: { position: "absolute", top: 50, left: 20, padding: 8 },
  backArrow: { fontSize: 28, color: "#000", fontWeight: "300" },
  logo: { width: 100, height: 100, borderRadius: 50, backgroundColor: "#000", alignItems: "center", justifyContent: "center", marginBottom: 20 },
  logoEmoji: { fontSize: 48 },
  title: { fontSize: 28, fontWeight: "bold", color: "#000", marginBottom: 8 },
  subtitle: { fontSize: 14, color: "#888", textAlign: "center", marginBottom: 40 },
  label: { alignSelf: "flex-start", fontSize: 14, color: "#333", marginBottom: 8 },
  input: { width: "100%", borderWidth: 1, borderColor: "#ddd", borderRadius: 12, padding: 14, fontSize: 24, textAlign: "center", letterSpacing: 8, marginBottom: 12 },
  error: { color: "#e00", fontSize: 13, marginBottom: 12 },
  boton: { backgroundColor: "#000", paddingVertical: 16, borderRadius: 12, width: "100%", alignItems: "center" },
  botonDesactivado: { backgroundColor: "#ccc" },
  botonTexto: { color: "#fff", fontSize: 16, fontWeight: "bold" },
});