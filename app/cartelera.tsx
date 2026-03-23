import { StyleSheet, Text, View } from "react-native";

export default function Cartelera() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Nuestras Tartas</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff8f0",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#c0392b",
  },
});