import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import {
  Image, Modal, ScrollView, StyleSheet, Text,
  TextInput, TouchableOpacity, View,
} from "react-native";
import { useCarrito } from "../context/CarritoContext";

const IMAGENES: { [key: number]: any } = {
  1: require("../../assets/images/1.png"),
  2: require("../../assets/images/2.png"),
  3: require("../../assets/images/3.png"),
  4: require("../../assets/images/4.png"),
  5: require("../../assets/images/5.png"),
  6: require("../../assets/images/6.png"),
  7: require("../../assets/images/7.png"),
  8: require("../../assets/images/8.png"),
  9: require("../../assets/images/9.png"),
  10: require("../../assets/images/10.png"),
  11: require("../../assets/images/11.png"),
  12: require("../../assets/images/12.png"),
  13: require("../../assets/images/13.png"),
  14: require("../../assets/images/14.png"),
  15: require("../../assets/images/15.png"),
  16: require("../../assets/images/16.png"),
  17: require("../../assets/images/17.png"),
  18: require("../../assets/images/18.png"),
  19: require("../../assets/images/19.png"),
  20: require("../../assets/images/20.png"),
  21: require("../../assets/images/21.png"),
  22: require("../../assets/images/22.png"),
  23: require("../../assets/images/23.png"),
  24: require("../../assets/images/24.png"),
  25: require("../../assets/images/25.png"),
  26: require("../../assets/images/26.png"),
  27: require("../../assets/images/27.png"),
  28: require("../../assets/images/28.png"),
  29: require("../../assets/images/29.png"),
  30: require("../../assets/images/30.png"),
};

const TAMAÑOS = [
  { id: "pequeña", label: "Tarta pequeña", detalle: "1,1 kg aprox. · 22 cm", precio: 25 },
  { id: "mediana", label: "Tarta mediana", detalle: "1,6 kg aprox. · 24 cm", precio: 35 },
  { id: "grande", label: "Tarta grande", detalle: "2,3 kg aprox. · 28 cm", precio: 45 },
];

export default function Detalle() {
  const { id, name, description } = useLocalSearchParams<{
    id: string; name: string; description: string;
  }>();
  const { añadir } = useCarrito();
  const router = useRouter();

  const [tamañoSeleccionado, setTamañoSeleccionado] = useState<string | null>(null);
  const [descripcionDiseño, setDescripcionDiseño] = useState("");
  const [mensajeTarta, setMensajeTarta] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMensaje, setModalMensaje] = useState("");
  const [modalConfirmar, setModalConfirmar] = useState(false);

  const precioSeleccionado = TAMAÑOS.find(t => t.id === tamañoSeleccionado)?.precio ?? 0;
  const imagenLocal = IMAGENES[Number(id)];

  const handleAñadir = () => {
    if (!tamañoSeleccionado) {
      setModalMensaje("Por favor selecciona un tamaño antes de añadir al carrito.");
      setModalConfirmar(false);
      setModalVisible(true);
      return;
    }

    const resumen = [
      `📦 Tamaño: ${tamañoSeleccionado} · ${precioSeleccionado}€`,
      descripcionDiseño ? `🎨 Diseño: ${descripcionDiseño}` : null,
      mensajeTarta ? `💬 Mensaje: "${mensajeTarta}"` : null,
    ].filter(Boolean).join("\n");

    setModalMensaje(resumen);
    setModalConfirmar(true);
    setModalVisible(true);
  };

  const confirmar = () => {
    setModalVisible(false);
    añadir({
      id: Number(id),
      name: name as string,
      description: description as string,
      price: precioSeleccionado,
      image: Number(id),
      tamaño: tamañoSeleccionado!,
      descripcionDiseño,
      mensajeTarta,
    });
    setTamañoSeleccionado(null);
    setDescripcionDiseño("");
    setMensajeTarta("");
    router.replace("/tabs/cartelera");
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>

      {/* Modal propio en vez de Alert */}
      <Modal transparent visible={modalVisible} animationType="fade">
        <View style={styles.modalFondo}>
          <View style={styles.modalCaja}>
            <Text style={styles.modalTitulo}>
              {modalConfirmar ? `Añadir ${name}` : "Falta el tamaño"}
            </Text>
            <Text style={styles.modalMensaje}>{modalMensaje}</Text>
            <View style={styles.modalBotones}>
              {modalConfirmar ? (
                <>
                  <TouchableOpacity
                    style={styles.modalBotonCancelar}
                    onPress={() => setModalVisible(false)}
                  >
                    <Text style={styles.modalBotonCancelarTexto}>Cancelar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.modalBotonConfirmar} onPress={confirmar}>
                    <Text style={styles.modalBotonConfirmarTexto}>Confirmar</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <TouchableOpacity
                  style={styles.modalBotonConfirmar}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.modalBotonConfirmarTexto}>OK</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </Modal>

      <Image source={imagenLocal} style={styles.imagen} />
      <Text style={styles.nombre}>{name}</Text>
      <Text style={styles.descripcion}>{description}</Text>

      {tamañoSeleccionado && (
        <Text style={styles.precio}>{precioSeleccionado}€</Text>
      )}

      <View style={styles.seccion}>
        <Text style={styles.seccionTitulo}>Tamaño</Text>
        {TAMAÑOS.map((t) => (
          <TouchableOpacity
            key={t.id}
            style={[styles.opcionTamaño, tamañoSeleccionado === t.id && styles.opcionSeleccionada]}
            onPress={() => setTamañoSeleccionado(t.id)}
          >
            <View style={styles.radio}>
              {tamañoSeleccionado === t.id && <View style={styles.radioBola} />}
            </View>
            <View>
              <Text style={styles.opcionLabel}>{t.label}</Text>
              <Text style={styles.opcionDetalle}>{t.detalle} · {t.precio}€</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.seccion}>
        <Text style={styles.seccionTitulo}>Descripción del diseño</Text>
        <TextInput
          style={styles.textarea}
          placeholder="Cuéntanos cómo quieres que sea tu tarta..."
          placeholderTextColor="#aaa"
          multiline
          numberOfLines={4}
          value={descripcionDiseño}
          onChangeText={setDescripcionDiseño}
        />
      </View>

      <View style={styles.seccion}>
        <Text style={styles.seccionTitulo}>
          Mensaje de la tarta <Text style={styles.opcional}>(opcional)</Text>
        </Text>
        <TextInput
          style={styles.textarea}
          placeholder="Ej: Feliz cumpleaños Ana 🎂"
          placeholderTextColor="#aaa"
          multiline
          numberOfLines={3}
          value={mensajeTarta}
          onChangeText={setMensajeTarta}
        />
      </View>

      <TouchableOpacity style={styles.boton} onPress={handleAñadir}>
        <Text style={styles.botonTexto}>Añadir al carrito</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  content: { padding: 24, paddingBottom: 48 },
  imagen: { width: "100%", height: 260, borderRadius: 16, backgroundColor: "#f5f5f5", marginBottom: 20 },
  nombre: { fontSize: 26, fontWeight: "bold", color: "#000", marginBottom: 8 },
  descripcion: { fontSize: 15, color: "#666", lineHeight: 22, marginBottom: 8 },
  precio: { fontSize: 22, fontWeight: "bold", color: "#000", marginBottom: 24 },
  seccion: { marginBottom: 28 },
  seccionTitulo: { fontSize: 17, fontWeight: "700", color: "#000", marginBottom: 12 },
  opcional: { fontSize: 13, fontWeight: "400", color: "#888" },
  opcionTamaño: {
    flexDirection: "row", alignItems: "center", gap: 12,
    borderWidth: 1, borderColor: "#ddd", borderRadius: 12,
    padding: 14, marginBottom: 10, backgroundColor: "#fafafa",
  },
  opcionSeleccionada: { borderColor: "#000", backgroundColor: "#f0f0f0" },
  radio: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: "#000", alignItems: "center", justifyContent: "center" },
  radioBola: { width: 10, height: 10, borderRadius: 5, backgroundColor: "#000" },
  opcionLabel: { fontSize: 15, fontWeight: "600", color: "#000" },
  opcionDetalle: { fontSize: 13, color: "#888", marginTop: 2 },
  textarea: {
    borderWidth: 1, borderColor: "#ddd", borderRadius: 12,
    padding: 14, fontSize: 14, color: "#000",
    textAlignVertical: "top", minHeight: 100, backgroundColor: "#fafafa",
  },
  boton: { backgroundColor: "#000", borderRadius: 12, paddingVertical: 16, alignItems: "center", marginTop: 8 },
  botonTexto: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  modalFondo: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", alignItems: "center", justifyContent: "center", padding: 30 },
  modalCaja: { backgroundColor: "#fff", borderRadius: 16, padding: 24, width: "100%" },
  modalTitulo: { fontSize: 18, fontWeight: "bold", color: "#000", marginBottom: 12 },
  modalMensaje: { fontSize: 14, color: "#444", lineHeight: 22, marginBottom: 24 },
  modalBotones: { flexDirection: "row", justifyContent: "flex-end", gap: 12 },
  modalBotonCancelar: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 10, borderWidth: 1, borderColor: "#ddd" },
  modalBotonCancelarTexto: { fontSize: 14, color: "#555" },
  modalBotonConfirmar: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 10, backgroundColor: "#000" },
  modalBotonConfirmarTexto: { fontSize: 14, color: "#fff", fontWeight: "bold" },
});