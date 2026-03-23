import { StyleSheet, Text, View } from "react-native";

export default function Index() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>🎂 EverCake</Text>
      <Text style={styles.subtitle}>La mejor pastelería</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff8f0",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#c0392b",
  },
  subtitle: {
    fontSize: 16,
    color: "#888",
    marginTop: 8,
  },
});