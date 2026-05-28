import React, { useState } from "react";
import { Alert, Button, StyleSheet, Text, TextInput, View } from "react-native";
import FloatingMusicBackground from "../components/FloatingMusicBackground";

export default function OnboardingNameScreen({ navigation, route }) {
  const [name, setName] = useState(route.params?.name || "");

  const handleContinue = () => {
    const trimmed = name.trim();
    if (trimmed.length < 3 || trimmed.length > 9) {
      Alert.alert("Invalid name", "Name must be more than 2 letters and less than 10.");
      return;
    }

    navigation.navigate("OnboardingDob", {
      ...route.params,
      name: trimmed
    });
  };

  return (
    <View style={styles.container}>
      <FloatingMusicBackground noteColor="#8A9A95" />
      <Text style={styles.title}>What do you want us to call you</Text>
      <TextInput
        value={name}
        onChangeText={setName}
        placeholder="Enter your name"
        style={styles.input}
        autoCapitalize="words"
      />
      <View style={styles.buttonContainer}>
        <Button title="Continue" onPress={handleContinue} />
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
  input: {
    marginTop: 18,
    borderWidth: 1,
    borderColor: "#cccccc",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10
  },
  buttonContainer: {
    marginTop: 20
  }
});
