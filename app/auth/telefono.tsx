import { useRouter } from "expo-router";
import { useState } from "react";
import { Keyboard, StyleSheet, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from "react-native";
import { supabase } from "../../supabaseConfig";

export default function Telefono() {
  const router = useRouter();
  const [telefono, setTelefono] = useState("");
  const [cargando, setCargando] = useState(false);

  const guardar = async () => {
    setCargando(true);
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      await supabase.from("perfiles").upsert({
        id: user.id,
        telefono,
        updated_at: new Date().toISOString(),
      });
    }

    setCargando(false);
    router.replace("/tabs/cartelera" as any);
  };

  const saltar = () => {
    router.replace("/tabs/cartelera" as any);
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <View style={styles.logo}>
          <Text style={styles.logoEmoji}>📱</Text>
        </View>
        <Text style={styles.title}>Añade tu teléfono</Text>
        <Text style={styles.subtitle}>Para que podamos contactarte sobre tu pedido</Text>

        <Text style={styles.label}>Número de teléfono</Text>
        <TextInput
          style={styles.input}
          placeholder="600 000 000"
          keyboardType="phone-pad"
          value={telefono}
          onChangeText={setTelefono}
        />

        <TouchableOpacity
          style={[styles.boton, (!telefono || cargando) && styles.botonDesactivado]}
          onPress={guardar}
          disabled={!telefono || cargando}
        >
          <Text style={styles.botonTexto}>{cargando ? "Guardando..." : "Guardar y continuar"}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.botonSaltar} onPress={saltar}>
          <Text style={styles.botonSaltarTexto}>Saltar por ahora</Text>
        </TouchableOpacity>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#fff", padding: 30 },
  logo: { width: 100, height: 100, borderRadius: 50, backgroundColor: "#000", alignItems: "center", justifyContent: "center", marginBottom: 20 },
  logoEmoji: { fontSize: 48 },
  title: { fontSize: 28, fontWeight: "bold", color: "#000", marginBottom: 8 },
  subtitle: { fontSize: 14, color: "#888", textAlign: "center", marginBottom: 40 },
  label: { alignSelf: "flex-start", fontSize: 14, color: "#333", marginBottom: 8 },
  input: { width: "100%", borderWidth: 1, borderColor: "#ddd", borderRadius: 12, padding: 14, fontSize: 16, marginBottom: 20 },
  boton: { backgroundColor: "#000", paddingVertical: 16, borderRadius: 12, width: "100%", alignItems: "center", marginBottom: 12 },
  botonDesactivado: { backgroundColor: "#ccc" },
  botonTexto: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  botonSaltar: { paddingVertical: 12 },
  botonSaltarTexto: { color: "#888", fontSize: 15 },
});