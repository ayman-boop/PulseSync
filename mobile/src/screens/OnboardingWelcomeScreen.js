import React from "react";
import { Button, StyleSheet, Text, View } from "react-native";
import FloatingMusicBackground from "../components/FloatingMusicBackground";

export default function OnboardingWelcomeScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <FloatingMusicBackground noteColor="#8A9A95" />
      <Text style={styles.title}>Hello, welcome to PuleSync! Let's get your started by answering a few questions</Text>
      <View style={styles.buttonContainer}>
        <Button title="Continue" onPress={() => navigation.navigate("OnboardingName")} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center"
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    lineHeight: 34
  },
  buttonContainer: {
    marginTop: 24
  }
});
