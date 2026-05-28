import React, { useState } from "react";
import { Alert, Pressable, SafeAreaView, StyleSheet, Text, TextInput, View } from "react-native";
import FloatingMusicBackground from "../components/FloatingMusicBackground";

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export default function SignupEmailScreen({ navigation, route }) {
  const [email, setEmail] = useState("");

  const handleContinue = () => {
    const trimmed = email.trim().toLowerCase();
    if (!isValidEmail(trimmed)) {
      Alert.alert("Invalid email", "Please enter a valid email address.");
      return;
    }

    navigation.navigate("SignupPassword", {
      ...(route.params || {}),
      email: trimmed
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <FloatingMusicBackground noteColor="#6D7E79" />
      <View style={styles.content}>
        <Text style={styles.eyebrow}>Almost done</Text>
        <Text style={styles.title}>What is your email address?</Text>

        <TextInput
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="email-address"
          placeholder="you@example.com"
          placeholderTextColor="#8B9894"
          style={styles.input}
        />

        <Pressable style={({ pressed }) => [styles.continueButton, pressed && styles.continuePressed]} onPress={handleContinue}>
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
  eyebrow: {
    color: "#95A8A2",
    fontSize: 15,
    marginBottom: 6
  },
  title: {
    color: "#F2F7F4",
    fontSize: 28,
    fontWeight: "700"
  },
  input: {
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
    marginTop: 20,
    height: 52,
    borderRadius: 14,
    backgroundColor: "#2A8769",
    alignItems: "center",
    justifyContent: "center"
  },
  continuePressed: {
    backgroundColor: "rgba(42, 135, 105, 0.25)",
    borderWidth: 1,
    borderColor: "rgba(82, 181, 148, 0.7)"
  },
  continueText: {
    color: "#EAF6F1",
    fontSize: 16,
    fontWeight: "600"
  }
});
