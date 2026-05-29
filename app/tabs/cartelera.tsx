import { useRouter } from "expo-router";
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

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

const CATEGORIAS = [
  {
    titulo: "Tartas de Chocolate",
    tartas: [
      { id: 1, name: "Plátano, nueces y chocolate", description: "Tarta de chocolate con plátano y nueces" },
      { id: 2, name: "Trufada de naranja", description: "Tarta de chocolate trufada con naranja" },
      { id: 3, name: "Chocolate con avellanas y fresa", description: "Tarta de chocolate con avellanas y fresa" },
      { id: 4, name: "Boston Cream Pie", description: "Clásica tarta americana de crema y chocolate" },
      { id: 5, name: "Muerte por chocolate", description: "Tarta intensa de chocolate para los más chocolateros" },
      { id: 6, name: "Tarta Red Pasión", description: "Tarta de chocolate rojo apasionado" },
    ],
  },
  {
    titulo: "Tartas con Nata y Queso / Frosting",
    tartas: [
      { id: 7, name: "Chocolate con cookies", description: "Tarta de chocolate con frosting de cookies" },
      { id: 8, name: "Tarta de zanahoria", description: "Clásica carrot cake con frosting de queso" },
      { id: 9, name: "Calabaza y caramelo", description: "Tarta de calabaza con caramelo" },
      { id: 10, name: "Calabaza con dulce de leche", description: "Tarta de calabaza y dulce de leche" },
      { id: 11, name: "Plátano, nueces y caramelo", description: "Tarta de plátano con nueces y caramelo" },
      { id: 12, name: "Plátano, nueces y dulce de leche", description: "Tarta de plátano con dulce de leche" },
      { id: 13, name: "Tarta Red Velvet", description: "Clásica red velvet con frosting de queso crema" },
      { id: 14, name: "Vainilla y cookies", description: "Tarta de vainilla con cookies" },
      { id: 15, name: "Manzana, chocolate blanco y toffee", description: "Tarta de manzana con choco blanco y toffee" },
      { id: 16, name: "Tarta de limón y moras", description: "Tarta fresca de limón con moras" },
      { id: 17, name: "Caribbean King Cake", description: "Tarta tropical estilo caribeño" },
      { id: 18, name: "Tarta de mango y papaya", description: "Tarta tropical de mango y papaya" },
      { id: 19, name: "Higos y caramelo", description: "Tarta de higos con caramelo" },
      { id: 20, name: "Tarta de fresas con nata", description: "Clásica tarta de fresas con nata" },
      { id: 21, name: "Tarta de melón y caramelo", description: "Tarta de melón con caramelo" },
    ],
  },
  {
    titulo: "Tartas con Hojaldre",
    tartas: [
      { id: 22, name: "Strudel de manzana y pera", description: "Strudel clásico de manzana y pera" },
      { id: 23, name: "Hojaldre dulce de leche", description: "Hojaldre con dulce de leche" },
    ],
  },
  {
    titulo: "Tartas con Queso (Cheesecakes)",
    tartas: [
      { id: 24, name: "New York Cheesecake a tu gusto", description: "Clásica cheesecake estilo Nueva York personalizada" },
    ],
  },
  {
    titulo: "Más de Nuestras Tartas",
    tartas: [
      { id: 25, name: "Tiramisú Cake", description: "Tarta estilo tiramisú italiano" },
      { id: 26, name: "Moka y Baileys", description: "Tarta de moka con Baileys" },
      { id: 27, name: "San Marcos", description: "Clásica tarta San Marcos" },
      { id: 28, name: "Tarta de Oreo", description: "Tarta de Oreo para los más golosos" },
      { id: 29, name: "Tarta de Lotus", description: "Tarta de galleta Lotus" },
      { id: 30, name: "Inés Rosales", description: "Tarta inspirada en las tortas Inés Rosales" },
    ],
  },
];

export default function Cartelera() {
  const router = useRouter();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.titulo}>Nuestras Tartas</Text>
      <Text style={styles.subtitulo}>Descubre nuestras deliciosas creaciones</Text>

      {CATEGORIAS.map((categoria, ci) => (
        <View key={ci} style={styles.categoria}>
          <Text style={styles.categoriaTitulo}>{categoria.titulo}</Text>
          {categoria.tartas.map((tarta) => (
            <TouchableOpacity
              key={tarta.id}
              style={styles.card}
              onPress={() =>
                router.push({
                  pathname: "/tabs/detalle" as any,
                  params: {
                    id: tarta.id,
                    name: tarta.name,
                    description: tarta.description,
                    image: tarta.id,
                  },
                })
              }
            >
              <Image source={IMAGENES[tarta.id]} style={styles.cardImage} />
              <View style={styles.cardContent}>
                <Text style={styles.tartaNombre}>{tarta.name}</Text>
                <Text style={styles.tartaDescripcion}>{tarta.description}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  content: { padding: 24, paddingBottom: 48 },
  titulo: { fontSize: 28, fontWeight: "bold", color: "#000", marginBottom: 4 },
  subtitulo: { fontSize: 14, color: "#888", marginBottom: 24 },
  categoria: { marginBottom: 32 },
  categoriaTitulo: {
    fontSize: 16, fontWeight: "800", color: "#000",
    textTransform: "uppercase", letterSpacing: 1,
    borderLeftWidth: 4, borderLeftColor: "#000",
    paddingLeft: 10, marginBottom: 12,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#eee",
    overflow: "hidden",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardImage: { width: "100%", height: 160, backgroundColor: "#f5f5f5" },
  cardContent: { padding: 14 },
  tartaNombre: { fontSize: 16, fontWeight: "600", color: "#000", marginBottom: 4 },
  tartaDescripcion: { fontSize: 13, color: "#888" },
});