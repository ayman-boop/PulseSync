import React, { useState } from "react";
import { Alert, Pressable, SafeAreaView, StyleSheet, Text, TextInput, View } from "react-native";
import FloatingMusicBackground from "../components/FloatingMusicBackground";

export default function SignupNameScreen({ navigation }) {
  const [name, setName] = useState("");

  const handleContinue = () => {
    const trimmed = name.trim();
    if (trimmed.length < 3 || trimmed.length > 9) {
      Alert.alert("Invalid name", "Name must be more than 2 letters and less than 10.");
      return;
    }

    navigation.navigate("SignupDob", {
      name: trimmed
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <FloatingMusicBackground noteColor="#6D7E79" />
      <View style={styles.content}>
        <Text style={styles.title}>What do you want us to call you</Text>

        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="Enter your name"
          placeholderTextColor="#8B9894"
          autoCapitalize="words"
          style={styles.iosInput}
        />

        <Pressable onPress={handleContinue} style={({ pressed }) => [styles.continueButton, pressed && styles.pressed]}>
          <Text style={styles.continueText}>Continue</Text>
        </Pressable>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1E2221"
  },
  content: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingTop: 44
  },
  title: {
    color: "#F2F7F4",
    fontSize: 30,
    fontWeight: "700",
    lineHeight: 38
  },
  iosInput: {
    marginTop: 20,
    height: 52,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#41534E",
    backgroundColor: "rgba(255,255,255,0.04)",
    color: "#F2F7F4",
    paddingHorizontal: 14,
    fontSize: 16
  },
  continueButton: {
    marginTop: 18,
    height: 52,
    borderRadius: 14,
    backgroundColor: "#2A8769",
    alignItems: "center",
    justifyContent: "center"
  },
  continueText: {
    color: "#EAF6F1",
    fontSize: 16,
    fontWeight: "600"
  },
  pressed: {
    backgroundColor: "rgba(42, 135, 105, 0.25)",
    borderWidth: 1,
    borderColor: "rgba(82, 181, 148, 0.7)"
  }
});
