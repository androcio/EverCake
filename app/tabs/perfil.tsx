import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator, Image,
  Modal, Platform, ScrollView, StyleSheet,
  Text, TextInput, TouchableOpacity, View
} from "react-native";
import { supabase } from "../../supabaseConfig";

const ADMIN_EMAIL = "info@tartasdeautor.com";

type Pedido = {
  id: string;
  nombre_usuario: string;
  email: string;
  telefono: string;
  tamano: string;
  descripcion: string;
  mensaje: string;
  estado: string;
  created_at: string;
  nombre_tarta: string;
  pedido_grupo_id: string;
  borrado_admin: boolean;
  borrado_usuario: boolean;
};

type GrupoPedido = {
  grupo_id: string;
  nombre_usuario: string;
  email: string;
  telefono: string;
  estado: string;
  created_at: string;
  tartas: Pedido[];
};

function AdminPanel({ onCerrarSesion }: { onCerrarSesion: () => void }) {
  const [grupos, setGrupos] = useState<GrupoPedido[]>([]);
  const [cargando, setCargando] = useState(true);
  const [grupoAbierto, setGrupoAbierto] = useState<string | null>(null);
  const [modal, setModal] = useState<{ visible: boolean; titulo: string; mensaje: string; accion?: () => void }>({ visible: false, titulo: "", mensaje: "" });

  useEffect(() => {
    cargarPedidos();
    const canal = supabase
      .channel("pedidos-admin-" + Date.now())
      .on("postgres_changes", { event: "*", schema: "public", table: "pedidos" }, () => {
        cargarPedidos();
      })
      .subscribe();
    return () => { supabase.removeChannel(canal); };
  }, []);

  const cargarPedidos = async () => {
    const { data } = await supabase
      .from("pedidos")
      .select("*")
      .eq("borrado_admin", false)
      .order("created_at", { ascending: false });
    if (!data) { setCargando(false); return; }
    const mapaGrupos: { [key: string]: GrupoPedido } = {};
    data.forEach((p: Pedido) => {
      const gid = p.pedido_grupo_id || p.id;
      if (!mapaGrupos[gid]) {
        mapaGrupos[gid] = { grupo_id: gid, nombre_usuario: p.nombre_usuario, email: p.email, telefono: p.telefono, estado: p.estado, created_at: p.created_at, tartas: [] };
      }
      mapaGrupos[gid].tartas.push(p);
    });
    setGrupos(Object.values(mapaGrupos));
    setCargando(false);
  };

  const cambiarEstadoGrupo = async (grupo: GrupoPedido, nuevoEstado: string) => {
    const ids = grupo.tartas.map((t) => t.id);
    await supabase.from("pedidos").update({ estado: nuevoEstado }).in("id", ids);
    cargarPedidos();
  };

  const borrarGrupo = (grupo: GrupoPedido) => {
    setModal({
      visible: true,
      titulo: "¿Borrar pedido?",
      mensaje: `¿Estás seguro de que quieres borrar el pedido de ${grupo.nombre_usuario} del panel?`,
      accion: async () => {
        const ids = grupo.tartas.map((t) => t.id);
        await supabase.from("pedidos").update({ borrado_admin: true }).in("id", ids);
        cargarPedidos();
        if (grupoAbierto === grupo.grupo_id) setGrupoAbierto(null);
      },
    });
  };

  const colorEstado = (estado: string) => {
    if (estado === "pendiente") return "#ff9500";
    if (estado === "en proceso") return "#007aff";
    if (estado === "completado") return "#34c759";
    return "#888";
  };

  if (cargando) return <View style={aStyles.centrado}><ActivityIndicator size="large" color="#000" /></View>;

  return (
    <ScrollView style={aStyles.container} contentContainerStyle={aStyles.content}>
      <Modal transparent visible={modal.visible} animationType="fade">
        <View style={aStyles.modalFondo}>
          <View style={aStyles.modalCaja}>
            <Text style={aStyles.modalTitulo}>{modal.titulo}</Text>
            <Text style={aStyles.modalMensaje}>{modal.mensaje}</Text>
            <View style={aStyles.modalBotones}>
              {modal.accion ? (
                <>
                  <TouchableOpacity style={aStyles.modalBotonCancelar} onPress={() => setModal({ ...modal, visible: false })}>
                    <Text style={aStyles.modalBotonCancelarTexto}>Cancelar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={aStyles.modalBotonConfirmar} onPress={() => { setModal({ ...modal, visible: false }); modal.accion!(); }}>
                    <Text style={aStyles.modalBotonConfirmarTexto}>Borrar</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <TouchableOpacity style={aStyles.modalBotonConfirmar} onPress={() => setModal({ ...modal, visible: false })}>
                  <Text style={aStyles.modalBotonConfirmarTexto}>OK</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </Modal>

      <Text style={aStyles.titulo}>Panel Admin 🎂</Text>
      <Text style={aStyles.subtitulo}>{grupos.length} pedidos recibidos</Text>
      {grupos.length === 0 && <Text style={aStyles.vacio}>No hay pedidos todavía.</Text>}

      {grupos.map((grupo) => (
        <View key={grupo.grupo_id} style={aStyles.tarjeta}>
          <TouchableOpacity style={aStyles.cabecera} onPress={() => setGrupoAbierto(grupoAbierto === grupo.grupo_id ? null : grupo.grupo_id)}>
            <View style={{ flex: 1 }}>
              <Text style={aStyles.tarjetaNombre}>{grupo.nombre_usuario || "Sin nombre"}</Text>
              <Text style={aStyles.tarjetaFecha}>{new Date(grupo.created_at).toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}</Text>
              <Text style={aStyles.tartasCount}>{grupo.tartas.length} tarta{grupo.tartas.length > 1 ? "s" : ""}</Text>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <View style={[aStyles.badge, { backgroundColor: colorEstado(grupo.estado) }]}>
                <Text style={aStyles.badgeTexto}>{grupo.estado}</Text>
              </View>
              {grupo.estado === "completado" && (
                <TouchableOpacity style={aStyles.botonBorrar} onPress={() => borrarGrupo(grupo)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                  <Text style={aStyles.botonBorrarTexto}>✕</Text>
                </TouchableOpacity>
              )}
            </View>
          </TouchableOpacity>

          {grupoAbierto === grupo.grupo_id && (
            <View style={aStyles.detalle}>
              <Text style={aStyles.detalleLabel}>📧 Correo</Text>
              <Text style={aStyles.detalleValor}>{grupo.email}</Text>
              <Text style={aStyles.detalleLabel}>📞 Teléfono</Text>
              <Text style={aStyles.detalleValor}>{grupo.telefono || "No indicado"}</Text>
              {grupo.tartas.map((tarta, i) => (
                <View key={tarta.id} style={aStyles.tartaItem}>
                  <Text style={aStyles.tartaItemTitulo}>🎂 Tarta {i + 1}: {tarta.nombre_tarta}</Text>
                  <Text style={aStyles.detalleLabel}>📦 Tamaño</Text>
                  <Text style={aStyles.detalleValor}>{tarta.tamano}</Text>
                  {tarta.descripcion ? <><Text style={aStyles.detalleLabel}>🎨 Descripción</Text><Text style={aStyles.detalleValor}>{tarta.descripcion}</Text></> : null}
                  {tarta.mensaje ? <><Text style={aStyles.detalleLabel}>💬 Mensaje</Text><Text style={aStyles.detalleValor}>{tarta.mensaje}</Text></> : null}
                </View>
              ))}
              <Text style={[aStyles.detalleLabel, { marginTop: 12 }]}>Cambiar estado</Text>
              <View style={aStyles.estadoBotones}>
                {["pendiente", "en proceso", "completado"].map((e) => (
                  <TouchableOpacity key={e} style={[aStyles.estadoBoton, grupo.estado === e && { backgroundColor: colorEstado(e) }]} onPress={() => cambiarEstadoGrupo(grupo, e)}>
                    <Text style={[aStyles.estadoBotonTexto, grupo.estado === e && { color: "#fff" }]}>{e}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
        </View>
      ))}

      <TouchableOpacity style={aStyles.botonCerrar} onPress={onCerrarSesion}>
        <Text style={aStyles.botonCerrarTexto}>⇥  Cerrar sesión</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

export default function Perfil() {
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);
  const [telefono, setTelefono] = useState("");
  const [telefonoEditando, setTelefonoEditando] = useState("");
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [nombreUsuario, setNombreUsuario] = useState("Usuario EverCake");
  const [nombreEdicion, setNombreEdicion] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarEdicion, setAvatarEdicion] = useState<string | null>(null);
  const [imageKey, setImageKey] = useState(Date.now());
  const [abierto, setAbierto] = useState<string | null>(null);
  const [historial, setHistorial] = useState<any[]>([]);
  const [modal, setModal] = useState<{ visible: boolean; titulo: string; mensaje: string }>({ visible: false, titulo: "", mensaje: "" });
  const fileInputRef = useRef<any>(null);

  useEffect(() => {
    let canal: any = null;

    const cargarDatos = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user;
      setEmail(user?.email ?? null);
      setUserId(user?.id ?? null);
      if (user) {
        const { data } = await supabase.from("perfiles").select("telefono").eq("id", user.id).single();
        const tel = data?.telefono ?? "";
        setTelefono(tel);
        setTelefonoEditando(tel);
        cargarPerfil(user.id);

        const hace30Dias = new Date();
        hace30Dias.setDate(hace30Dias.getDate() - 30);
        const { data: pedidos } = await supabase
          .from("pedidos")
          .select("*")
          .eq("user_id", user.id)
          .eq("borrado_usuario", false)
          .gte("created_at", hace30Dias.toISOString())
          .order("created_at", { ascending: false });
        setHistorial(pedidos ?? []);

        if (canal) supabase.removeChannel(canal);
        canal = supabase
          .channel("historial-usuario-" + user.id)
          .on("postgres_changes", { event: "INSERT", schema: "public", table: "pedidos", filter: `user_id=eq.${user.id}` }, (payload) => {
            setHistorial((prev) => [payload.new as any, ...prev]);
          })
          .on("postgres_changes", { event: "UPDATE", schema: "public", table: "pedidos", filter: `user_id=eq.${user.id}` }, (payload) => {
            if (payload.new.borrado_usuario) {
              setHistorial((prev) => prev.filter((p) => p.id !== payload.new.id));
            } else {
              setHistorial((prev) => prev.map((p) => (p.id === payload.new.id ? { ...p, ...payload.new } : p)));
            }
          })
          .subscribe();
      }
      setCargando(false);
    };

    cargarDatos();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setEmail(session?.user?.email ?? null);
      setUserId(session?.user?.id ?? null);
      if (session?.user) cargarPerfil(session.user.id);
    });

    return () => {
      listener.subscription.unsubscribe();
      if (canal) supabase.removeChannel(canal);
    };
  }, []);

  const cargarPerfil = async (uid: string) => {
    const { data } = await supabase.from("profiles").select("username, avatar_url").eq("id", uid).single();
    if (data) {
      if (data.username) setNombreUsuario(data.username);
      if (data.avatar_url) { setAvatarUrl(data.avatar_url); setAvatarEdicion(data.avatar_url); }
    }
  };

  const elegirFoto = async () => {
    if (Platform.OS === "web") {
      fileInputRef.current?.click();
    } else {
      const ImagePicker = await import("expo-image-picker");
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") { setModal({ visible: true, titulo: "Permiso denegado", mensaje: "Necesitamos acceso a tu galería." }); return; }
      const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, aspect: [1, 1], quality: 0.7 });
      if (!result.canceled && result.assets[0]) setAvatarEdicion(result.assets[0].uri);
    }
  };

  const handleFileChange = (e: any) => {
    const file = e.target.files[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setAvatarEdicion(url);
  };

  const guardarCambios = async () => {
    if (!userId) return;
    setGuardando(true);
    let nuevaAvatarUrl = avatarUrl;

    if (avatarEdicion && avatarEdicion !== avatarUrl) {
      try {
        const response = await fetch(avatarEdicion);
        const blob = await response.blob();
        const ext = blob.type.split("/")[1] ?? "jpg";
        const fileName = `${userId}-${Date.now()}.${ext}`;
        const { error: uploadError } = await supabase.storage.from("avatars").upload(fileName, blob, { upsert: true, contentType: blob.type });
        if (uploadError) {
          setModal({ visible: true, titulo: "Error", mensaje: "No se pudo subir la foto: " + uploadError.message });
          setGuardando(false);
          return;
        }
        const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(fileName);
        nuevaAvatarUrl = urlData.publicUrl;
      } catch (e) {
        setModal({ visible: true, titulo: "Error", mensaje: "No se pudo procesar la imagen." });
        setGuardando(false);
        return;
      }
    }

    await supabase.from("profiles").upsert({ id: userId, username: nombreEdicion, avatar_url: nuevaAvatarUrl, updated_at: new Date().toISOString() });
    const { error } = await supabase.from("perfiles").upsert({ id: userId, telefono: telefonoEditando, updated_at: new Date().toISOString() });
    setGuardando(false);

    if (error) {
      setModal({ visible: true, titulo: "Error", mensaje: "No se pudo guardar el teléfono." });
    } else {
      setNombreUsuario(nombreEdicion);
      setAvatarUrl(nuevaAvatarUrl);
      setAvatarEdicion(nuevaAvatarUrl);
      setImageKey(Date.now());
      setTelefono(telefonoEditando);
      setModal({ visible: true, titulo: "Guardado ✓", mensaje: "Cambios guardados correctamente." });
    }
  };

  const cerrarSesion = async () => {
    await supabase.auth.signOut();
    setEmail(null);
  };

  const toggleSeccion = (nombre: string) => {
    if (nombre === "cuenta" && abierto !== "cuenta") {
      setNombreEdicion(nombreUsuario);
      setAvatarEdicion(avatarUrl);
      setTelefonoEditando(telefono);
    }
    setAbierto(abierto === nombre ? null : nombre);
  };

  const colorEstado = (estado: string) => {
    if (estado === "pendiente") return "#ff9500";
    if (estado === "en proceso") return "#007aff";
    if (estado === "completado") return "#34c759";
    return "#888";
  };

  const borrarDelHistorial = async (id: string) => {
    await supabase.from("pedidos").update({ borrado_usuario: true }).eq("id", id);
    setHistorial((prev) => prev.filter((p) => p.id !== id));
  };

  if (cargando) return <View style={pStyles.centrado}><ActivityIndicator size="large" color="#000" /></View>;
  if (email === ADMIN_EMAIL) return <AdminPanel onCerrarSesion={cerrarSesion} />;

  if (!email) {
    return (
      <View style={pStyles.centrado}>
        <View style={pStyles.logoCirculo}><Text style={pStyles.logoEmoji}>👤</Text></View>
        <Text style={pStyles.titulo}>Mi Perfil</Text>
        <Text style={pStyles.subtitulo}>Inicia sesión para ver tus pedidos y datos</Text>
        <TouchableOpacity style={pStyles.botonNegro} onPress={() => router.navigate("/auth/" as any)}>
          <Text style={pStyles.botonNegroTexto}>Iniciar sesión</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        style={pStyles.container}
        contentContainerStyle={pStyles.content}
        keyboardShouldPersistTaps="handled"
      >
        <Modal transparent visible={modal.visible} animationType="fade">
          <View style={pStyles.modalFondo}>
            <View style={pStyles.modalCaja}>
              <Text style={pStyles.modalTitulo}>{modal.titulo}</Text>
              <Text style={pStyles.modalMensaje}>{modal.mensaje}</Text>
              <TouchableOpacity style={pStyles.modalBoton} onPress={() => setModal({ ...modal, visible: false })}>
                <Text style={pStyles.modalBotonTexto}>OK</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {Platform.OS === "web" && (
          <input ref={fileInputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleFileChange} />
        )}

        <Text style={pStyles.titulo}>Mi Perfil</Text>
        <Text style={pStyles.subtitulo}>Gestiona tu cuenta y pedidos</Text>

        <View style={pStyles.tarjetaUsuario}>
          <View style={pStyles.avatarCirculo}>
            {avatarUrl
              ? <Image key={imageKey} source={{ uri: avatarUrl }} style={pStyles.avatarImagen} />
              : <Text style={pStyles.avatarIcono}>👤</Text>}
          </View>
          <View style={{ flex: 1 }}>
            <Text style={pStyles.nombreUsuario}>{nombreUsuario}</Text>
            <Text style={pStyles.emailUsuario}>✉  {email}</Text>
          </View>
        </View>

        <View style={pStyles.opciones}>
          <TouchableOpacity style={pStyles.fila} onPress={() => toggleSeccion("historial")}>
            <Text style={pStyles.filaIcono}>🕐</Text>
            <Text style={pStyles.filaTexto}>Historial de pedidos</Text>
            <Text style={pStyles.filaFlecha}>{abierto === "historial" ? "∨" : "›"}</Text>
          </TouchableOpacity>
          {abierto === "historial" && (
            <View style={pStyles.contenidoDesplegable}>
              {historial.length === 0 ? (
                <Text style={pStyles.textoVacio}>No tienes pedidos todavía.</Text>
              ) : (
                historial.map((p) => (
                  <View key={p.id} style={pStyles.historialItem}>
                    <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <Text style={pStyles.historialNombre}>{p.nombre_tarta}</Text>
                      {p.estado === "completado" && (
                        <TouchableOpacity onPress={() => borrarDelHistorial(p.id)} style={pStyles.botonBorrarHistorial}>
                          <Text style={pStyles.botonBorrarHistorialTexto}>✕</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                    <Text style={pStyles.historialDetalle}>📦 {p.tamano}</Text>
                    <View style={[pStyles.estadoBadge, { backgroundColor: colorEstado(p.estado) }]}>
                      <Text style={pStyles.estadoBadgeTexto}>{p.estado}</Text>
                    </View>
                    <Text style={pStyles.historialFecha}>{new Date(p.created_at).toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric" })}</Text>
                  </View>
                ))
              )}
            </View>
          )}
          <View style={pStyles.separador} />

          <TouchableOpacity style={pStyles.fila} onPress={() => toggleSeccion("cuenta")}>
            <Text style={pStyles.filaIcono}>👤</Text>
            <Text style={pStyles.filaTexto}>Mi cuenta</Text>
            <Text style={pStyles.filaFlecha}>{abierto === "cuenta" ? "∨" : "›"}</Text>
          </TouchableOpacity>
          {abierto === "cuenta" && (
            <View style={pStyles.contenidoDesplegable}>
              <Text style={pStyles.campoLabel}>Foto de perfil</Text>
              <TouchableOpacity style={pStyles.fotoSelector} onPress={elegirFoto}>
                <View style={pStyles.fotoPreview}>
                  {avatarEdicion
                    ? <Image key={imageKey} source={{ uri: avatarEdicion }} style={pStyles.fotoImagen} />
                    : <Text style={pStyles.fotoIcono}>👤</Text>}
                </View>
                <Text style={pStyles.fotoCambiar}>Cambiar foto</Text>
              </TouchableOpacity>
              <Text style={pStyles.campoLabel}>Nombre de usuario</Text>
              <TextInput
                style={pStyles.campoInput}
                placeholder="Tu nombre"
                placeholderTextColor="#aaa"
                value={nombreEdicion}
                onChangeText={setNombreEdicion}
                editable={true}
              />
              <Text style={pStyles.campoLabel}>Teléfono</Text>
              <TextInput
                style={pStyles.campoInput}
                placeholder="600 000 000"
                keyboardType="phone-pad"
                value={telefonoEditando}
                onChangeText={setTelefonoEditando}
                editable={true}
              />
              <TouchableOpacity style={[pStyles.botonGuardar, guardando && { backgroundColor: "#ccc" }]} onPress={guardarCambios} disabled={guardando}>
                <Text style={pStyles.botonGuardarTexto}>{guardando ? "Guardando..." : "Guardar cambios"}</Text>
              </TouchableOpacity>
            </View>
          )}
          <View style={pStyles.separador} />

          <TouchableOpacity style={pStyles.fila} onPress={() => toggleSeccion("faq")}>
            <Text style={pStyles.filaIcono}>❓</Text>
            <Text style={pStyles.filaTexto}>Preguntas frecuentes</Text>
            <Text style={pStyles.filaFlecha}>{abierto === "faq" ? "∨" : "›"}</Text>
          </TouchableOpacity>
          {abierto === "faq" && (
            <View style={pStyles.contenidoDesplegable}>
              <Text style={pStyles.faqPregunta}>📦 Recogida en tienda</Text>
              <Text style={pStyles.faqRespuesta}>Cuando su pedido esté listo se le avisará por WhatsApp o por correo electrónico para que pueda pasar a recogerlo.</Text>
              <Text style={pStyles.faqPregunta}>💳 ¿Por dónde se realiza el pago?</Text>
              <Text style={pStyles.faqRespuesta}>El pago se realiza en la tienda al momento de recoger su pedido.</Text>
              <Text style={pStyles.faqPregunta}>📍 ¿Dónde encontrarnos?</Text>
              <Text style={pStyles.faqRespuesta}>Plaza de la Debla, 15, Sevilla (Kansas City).</Text>
            </View>
          )}
          <View style={pStyles.separador} />

          <TouchableOpacity style={pStyles.fila} onPress={() => toggleSeccion("contacto")}>
            <Text style={pStyles.filaIcono}>📞</Text>
            <Text style={pStyles.filaTexto}>Contacta con nosotros</Text>
            <Text style={pStyles.filaFlecha}>{abierto === "contacto" ? "∨" : "›"}</Text>
          </TouchableOpacity>
          {abierto === "contacto" && (
            <View style={pStyles.contenidoDesplegable}>
              <Text style={pStyles.contactoLinea}>📞  Teléfono: 657 89 39 38</Text>
              <Text style={pStyles.contactoLinea}>✉️  Correo: info@tartasdeautor.com</Text>
            </View>
          )}
        </View>

        <TouchableOpacity style={pStyles.botonCerrar} onPress={cerrarSesion}>
          <Text style={pStyles.botonCerrarTexto}>⇥  Cerrar sesión</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const aStyles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  content: { padding: 24, paddingTop: 60, paddingBottom: 48 },
  centrado: { flex: 1, alignItems: "center", justifyContent: "center" },
  titulo: { fontSize: 28, fontWeight: "bold", color: "#000", marginBottom: 4 },
  subtitulo: { fontSize: 14, color: "#888", marginBottom: 24 },
  vacio: { fontSize: 15, color: "#aaa", textAlign: "center", marginTop: 40 },
  tarjeta: { backgroundColor: "#f9f9f9", borderRadius: 16, marginBottom: 12, overflow: "hidden" },
  cabecera: { flexDirection: "row", alignItems: "center", padding: 16, gap: 12 },
  tarjetaNombre: { fontSize: 15, fontWeight: "bold", color: "#000", marginBottom: 2 },
  tarjetaFecha: { fontSize: 12, color: "#888" },
  tartasCount: { fontSize: 12, color: "#aaa", marginTop: 2 },
  badge: { borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  badgeTexto: { color: "#fff", fontSize: 11, fontWeight: "bold" },
  detalle: { paddingHorizontal: 16, paddingBottom: 16, borderTopWidth: 1, borderTopColor: "#eee" },
  detalleLabel: { fontSize: 12, color: "#888", marginTop: 10, marginBottom: 2 },
  detalleValor: { fontSize: 15, color: "#000" },
  tartaItem: { marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: "#eee" },
  tartaItemTitulo: { fontSize: 14, fontWeight: "700", color: "#000", marginBottom: 4 },
  estadoBotones: { flexDirection: "row", gap: 8, marginTop: 8 },
  estadoBoton: { borderWidth: 1, borderColor: "#ddd", borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6 },
  estadoBotonTexto: { fontSize: 12, color: "#555" },
  botonBorrar: { width: 28, height: 28, borderRadius: 14, backgroundColor: "#ffe5e5", alignItems: "center", justifyContent: "center" },
  botonBorrarTexto: { color: "#e00", fontSize: 13, fontWeight: "bold" },
  botonCerrar: { borderWidth: 1, borderColor: "#ffcccc", borderRadius: 12, paddingVertical: 16, alignItems: "center", marginTop: 24 },
  botonCerrarTexto: { color: "#e00", fontSize: 15, fontWeight: "600" },
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

const pStyles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  content: { padding: 24, paddingTop: 60, paddingBottom: 48 },
  centrado: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#fff", padding: 30 },
  logoCirculo: { width: 100, height: 100, borderRadius: 50, backgroundColor: "#f5f5f5", alignItems: "center", justifyContent: "center", marginBottom: 20 },
  logoEmoji: { fontSize: 48 },
  botonNegro: { backgroundColor: "#000", paddingVertical: 16, borderRadius: 12, width: "100%", alignItems: "center", marginTop: 16 },
  botonNegroTexto: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  titulo: { fontSize: 28, fontWeight: "bold", color: "#000", marginBottom: 4 },
  subtitulo: { fontSize: 14, color: "#888", marginBottom: 24 },
  tarjetaUsuario: { flexDirection: "row", alignItems: "center", backgroundColor: "#f9f9f9", borderRadius: 16, padding: 16, marginBottom: 24, gap: 14 },
  avatarCirculo: { width: 56, height: 56, borderRadius: 28, backgroundColor: "#000", alignItems: "center", justifyContent: "center", overflow: "hidden" },
  avatarImagen: { width: 56, height: 56, borderRadius: 28 },
  avatarIcono: { fontSize: 26 },
  nombreUsuario: { fontSize: 16, fontWeight: "bold", color: "#000", marginBottom: 4 },
  emailUsuario: { fontSize: 13, color: "#555" },
  opciones: { backgroundColor: "#f9f9f9", borderRadius: 16, paddingHorizontal: 16, marginBottom: 24 },
  fila: { flexDirection: "row", alignItems: "center", paddingVertical: 16, gap: 12 },
  filaIcono: { fontSize: 18, width: 24, textAlign: "center" },
  filaTexto: { flex: 1, fontSize: 15, color: "#000" },
  filaFlecha: { fontSize: 22, color: "#aaa" },
  separador: { height: 1, backgroundColor: "#eee" },
  contenidoDesplegable: { paddingBottom: 16, paddingLeft: 36 },
  textoVacio: { fontSize: 14, color: "#888" },
  campoLabel: { fontSize: 13, color: "#888", marginBottom: 4 },
  campoInput: { borderWidth: 1, borderColor: "#ddd", borderRadius: 10, padding: 12, fontSize: 15, color: "#000", backgroundColor: "#fff", marginBottom: 12 },
  botonGuardar: { backgroundColor: "#000", borderRadius: 10, paddingVertical: 12, alignItems: "center" },
  botonGuardarTexto: { color: "#fff", fontSize: 14, fontWeight: "bold" },
  contactoLinea: { fontSize: 15, color: "#000", marginBottom: 8 },
  botonCerrar: { borderWidth: 1, borderColor: "#ffcccc", borderRadius: 12, paddingVertical: 16, alignItems: "center" },
  botonCerrarTexto: { color: "#e00", fontSize: 15, fontWeight: "600" },
  fotoSelector: { flexDirection: "row", alignItems: "center", gap: 14, marginBottom: 12 },
  fotoPreview: { width: 64, height: 64, borderRadius: 32, backgroundColor: "#ddd", alignItems: "center", justifyContent: "center", overflow: "hidden" },
  fotoImagen: { width: 64, height: 64, borderRadius: 32 },
  fotoIcono: { fontSize: 28 },
  fotoCambiar: { fontSize: 14, color: "#000", fontWeight: "600", textDecorationLine: "underline" },
  faqPregunta: { fontSize: 14, fontWeight: "700", color: "#000", marginTop: 14, marginBottom: 4 },
  faqRespuesta: { fontSize: 14, color: "#555", lineHeight: 20 },
  historialItem: { marginBottom: 14, paddingBottom: 14, borderBottomWidth: 1, borderBottomColor: "#eee" },
  historialNombre: { fontSize: 15, fontWeight: "600", color: "#000", marginBottom: 4 },
  historialDetalle: { fontSize: 13, color: "#555", marginBottom: 6 },
  historialFecha: { fontSize: 12, color: "#aaa", marginTop: 4 },
  estadoBadge: { alignSelf: "flex-start", borderRadius: 20, paddingHorizontal: 10, paddingVertical: 3, marginBottom: 4 },
  estadoBadgeTexto: { color: "#fff", fontSize: 11, fontWeight: "bold" },
  botonBorrarHistorial: { width: 24, height: 24, borderRadius: 12, backgroundColor: "#ffe5e5", alignItems: "center", justifyContent: "center" },
  botonBorrarHistorialTexto: { color: "#e00", fontSize: 12, fontWeight: "bold" },
  modalFondo: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", alignItems: "center", justifyContent: "center", padding: 30 },
  modalCaja: { backgroundColor: "#fff", borderRadius: 16, padding: 24, width: "100%" },
  modalTitulo: { fontSize: 18, fontWeight: "bold", color: "#000", marginBottom: 12 },
  modalMensaje: { fontSize: 14, color: "#444", lineHeight: 22, marginBottom: 24 },
  modalBoton: { backgroundColor: "#000", borderRadius: 10, paddingVertical: 12, alignItems: "center" },
  modalBotonTexto: { color: "#fff", fontSize: 14, fontWeight: "bold" },
});