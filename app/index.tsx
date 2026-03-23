import { Text, View, StyleSheet, TextInput, TouchableOpacity, Keyboard, TouchableWithoutFeedback } from "react-native";
import { useRouter } from "expo-router";
import { useState } from "react";

export default function Index() {
  const router = useRouter();
  const [telefono, setTelefono] = useState("");

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <View style={styles.logo}>
          <Text style={styles.logoEmoji}>🎂</Text>
        </View>
        <Text style={styles.title}>EverCake</Text>
        <Text style={styles.subtitle}>Las mejores tartas para tus momentos especiales</Text>

        <Text style={styles.label}>Número de teléfono</Text>
        <TextInput
          style={styles.input}
          placeholder="+34 600 000 000"
          keyboardType="phone-pad"
          value={telefono}
          onChangeText={setTelefono}
        />

        <TouchableOpacity
          style={[styles.boton, !telefono && styles.botonDesactivado]}
          onPress={() => telefono && router.push("/cartelera")}
        >
          <Text style={styles.botonTexto}>Continuar</Text>
        </TouchableOpacity>

        <View style={styles.separador}>
          <View style={styles.linea} />
          <Text style={styles.bienvenido}>Bienvenido</Text>
          <View style={styles.linea} />
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    padding: 30,
  },
  logo: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#000",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  logoEmoji: {
    fontSize: 48,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: "#888",
    textAlign: "center",
    marginBottom: 40,
  },
  label: {
    alignSelf: "flex-start",
    fontSize: 14,
    color: "#333",
    marginBottom: 8,
  },
  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    marginBottom: 20,
  },
  boton: {
    backgroundColor: "#888",
    paddingVertical: 16,
    borderRadius: 12,
    width: "100%",
    alignItems: "center",
    marginBottom: 30,
  },
  botonDesactivado: {
    backgroundColor: "#ccc",
  },
  botonTexto: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  separador: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
  },
  linea: {
    flex: 1,
    height: 1,
    backgroundColor: "#ddd",
  },
  bienvenido: {
    marginHorizontal: 10,
    color: "#aaa",
    fontSize: 14,
  },
});