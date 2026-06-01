import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Image, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { supabase } from "../../supabaseConfig";
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

const ADMIN_EMAIL = "oullea43@gmail.com";

export default function Pedido() {
  const { carrito, eliminar, vaciar } = useCarrito();
  const router = useRouter();
  const [expandido, setExpandido] = useState<number | null>(null);
  const [session, setSession] = useState<any>(null);
  const [enviando, setEnviando] = useState(false);
  const [modal, setModal] = useState<{ visible: boolean; titulo: string; mensaje: string; accion?: () => void }>({
    visible: false, titulo: "", mensaje: "",
  });

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
    const { data: listener } = supabase.auth.onAuthStateChange((_e, session) => setSession(session));
    return () => listener.subscription.unsubscribe();
  }, []);

  const mostrarModal = (titulo: string, mensaje: string, accion?: () => void) => {
    setModal({ visible: true, titulo, mensaje, accion });
  };

  const confirmarPedido = async () => {
    if (!session) {
      mostrarModal("Inicia sesión", "Debes iniciar sesión antes de confirmar el pedido.", () => router.navigate("/tabs/perfil" as any));
      return;
    }

    if (session.user.email === ADMIN_EMAIL) {
      mostrarModal("Admin", "El administrador no puede hacer pedidos.");
      return;
    }

    setEnviando(true);
    const user = session.user;

    const { data: perfil } = await supabase.from("perfiles").select("telefono").eq("id", user.id).single();
    const { data: profile } = await supabase.from("profiles").select("username").eq("id", user.id).single();

    const grupoId = `${user.id}-${Date.now()}`;

    const pedidosAInsertar = carrito.map((item) => ({
      pedido_grupo_id: grupoId,
      user_id: user.id,
      nombre_usuario: profile?.username ?? "Sin nombre",
      email: user.email,
      telefono: perfil?.telefono ?? "No indicado",
      nombre_tarta: item.name,
      tamano: item.tamaño,
      descripcion: item.descripcionDiseño ?? "",
      mensaje: item.mensajeTarta ?? "",
      estado: "pendiente",
      created_at: new Date().toISOString(),
    }));

    const { error } = await supabase.from("pedidos").insert(pedidosAInsertar);
    setEnviando(false);

    if (error) {
      mostrarModal("Error", "No se pudo enviar el pedido: " + error.message);
    } else {
      vaciar();
      mostrarModal("¡Pedido enviado! 🎂", "Tu pedido ha sido recibido. Te avisaremos cuando esté listo.");
    }
  };

  if (carrito.length === 0) {
    return (
      <View style={styles.vacio}>
        <Text style={styles.carritoIcono}>🛒</Text>
        <Text style={styles.vacioTitulo}>Tu carrito está vacío</Text>
        <Text style={styles.vacioSubtitulo}>Añade tartas desde el catálogo</Text>
      </View>
    );
  }

  const total = carrito.reduce((sum, item) => sum + item.price, 0);

  return (
    <View style={styles.container}>
      <Modal transparent visible={modal.visible} animationType="fade">
        <View style={styles.modalFondo}>
          <View style={styles.modalCaja}>
            <Text style={styles.modalTitulo}>{modal.titulo}</Text>
            <Text style={styles.modalMensaje}>{modal.mensaje}</Text>
            <View style={styles.modalBotones}>
              {modal.accion ? (
                <>
                  <TouchableOpacity style={styles.modalBotonCancelar} onPress={() => setModal({ ...modal, visible: false })}>
                    <Text style={styles.modalBotonCancelarTexto}>Cancelar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.modalBotonConfirmar} onPress={() => { setModal({ ...modal, visible: false }); modal.accion!(); }}>
                    <Text style={styles.modalBotonConfirmarTexto}>Iniciar sesión</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <TouchableOpacity style={styles.modalBotonConfirmar} onPress={() => setModal({ ...modal, visible: false })}>
                  <Text style={styles.modalBotonConfirmarTexto}>OK</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </Modal>

      <Text style={styles.titulo}>Mi Pedido</Text>
      <Text style={styles.subtitulo}>Revisa y confirma tu pedido</Text>

      <ScrollView style={styles.lista} showsVerticalScrollIndicator={false}>
        {carrito.map((item, index) => (
          <View key={index} style={styles.card}>
            <TouchableOpacity style={styles.fila} onPress={() => setExpandido(expandido === index ? null : index)}>
              <Image source={IMAGENES[item.image]} style={styles.img} />
              <View style={styles.info}>
                <Text style={styles.nombre}>{item.name}</Text>
                <Text style={styles.precio}>{item.price}€</Text>
                <Text style={styles.tamaño}>📦 {item.tamaño}</Text>
              </View>
              <View style={styles.acciones}>
                <Text style={styles.flecha}>{expandido === index ? "▲" : "▼"}</Text>
                <TouchableOpacity onPress={() => eliminar(index)} style={styles.botonEliminar}>
                  <Text style={styles.eliminarTexto}>✕</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>

            {expandido === index && (
              <View style={styles.detalle}>
                <Text style={styles.detalleLabel}>Tamaño</Text>
                <Text style={styles.detalleValor}>{item.tamaño}</Text>
                {item.descripcionDiseño ? (<><Text style={styles.detalleLabel}>Descripción del diseño</Text><Text style={styles.detalleValor}>{item.descripcionDiseño}</Text></>) : null}
                {item.mensajeTarta ? (<><Text style={styles.detalleLabel}>Mensaje de la tarta</Text><Text style={styles.detalleValor}>{item.mensajeTarta}</Text></>) : null}
              </View>
            )}
          </View>
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.totalFila}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalPrecio}>{total}€</Text>
        </View>
        <TouchableOpacity
          style={[styles.botonConfirmar, enviando && { backgroundColor: "#ccc" }]}
          onPress={confirmarPedido}
          disabled={enviando}
        >
          <Text style={styles.botonConfirmarTexto}>{enviando ? "Enviando..." : "Confirmar pedido"}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 24, paddingTop: 60 },
  vacio: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#fff" },
  carritoIcono: { fontSize: 64, marginBottom: 16, opacity: 0.2 },
  vacioTitulo: { fontSize: 18, fontWeight: "bold", color: "#000", marginBottom: 8 },
  vacioSubtitulo: { fontSize: 14, color: "#aaa" },
  titulo: { fontSize: 28, fontWeight: "bold", color: "#000", marginBottom: 4 },
  subtitulo: { fontSize: 14, color: "#888", marginBottom: 24 },
  lista: { flex: 1 },
  card: { backgroundColor: "#f9f9f9", borderRadius: 12, marginBottom: 12, overflow: "hidden" },
  fila: { flexDirection: "row", alignItems: "center", padding: 12, gap: 12 },
  img: { width: 60, height: 60, borderRadius: 8, backgroundColor: "#eee" },
  info: { flex: 1 },
  nombre: { fontSize: 15, fontWeight: "600", color: "#000", marginBottom: 2 },
  precio: { fontSize: 14, color: "#555", marginBottom: 2 },
  tamaño: { fontSize: 12, color: "#888" },
  acciones: { alignItems: "center", gap: 8 },
  flecha: { fontSize: 12, color: "#888" },
  botonEliminar: { padding: 4 },
  eliminarTexto: { fontSize: 16, color: "#aaa" },
  detalle: { paddingHorizontal: 16, paddingBottom: 16, borderTopWidth: 1, borderTopColor: "#eee" },
  detalleLabel: { fontSize: 12, fontWeight: "700", color: "#888", marginTop: 12, textTransform: "uppercase" },
  detalleValor: { fontSize: 14, color: "#000", marginTop: 4 },
  footer: { paddingTop: 16, borderTopWidth: 1, borderTopColor: "#eee" },
  totalFila: { flexDirection: "row", justifyContent: "space-between", marginBottom: 16 },
  totalLabel: { fontSize: 16, color: "#555" },
  totalPrecio: { fontSize: 20, fontWeight: "bold", color: "#000" },
  botonConfirmar: { backgroundColor: "#000", paddingVertical: 16, borderRadius: 12, alignItems: "center" },
  botonConfirmarTexto: { color: "#fff", fontSize: 16, fontWeight: "bold" },
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