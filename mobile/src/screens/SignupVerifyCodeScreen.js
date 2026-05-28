import React, { useState } from "react";
import { Alert, Pressable, SafeAreaView, StyleSheet, Text, TextInput, View } from "react-native";
import FloatingMusicBackground from "../components/FloatingMusicBackground";
import { supabase } from "../lib/supabase";

export default function SignupVerifyCodeScreen({ navigation, route }) {
  const [code, setCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const email = route.params?.email || "";

  const handleVerify = async () => {
    const token = code.trim();
    if (!/^\d{6}$/.test(token)) {
      Alert.alert("Invalid code", "Please enter the 6-digit code sent to your email.");
      return;
    }

    if (!email) {
      Alert.alert("Missing email", "Please restart signup and try again.");
      return;
    }

    try {
      setIsSubmitting(true);
      const { error } = await supabase.auth.verifyOtp({
        email,
        token,
        type: "signup"
      });

      if (error) {
        Alert.alert("Verification failed", error.message);
        return;
      }

      Alert.alert("Verified", "Your email has been confirmed. Please sign in.");
      navigation.navigate("Login", {
        openMode: "signin",
        prefillEmail: email
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <FloatingMusicBackground noteColor="#6D7E79" />
      <View style={styles.content}>
        <Text style={styles.eyebrow}>Confirm your account</Text>
        <Text style={styles.title}>Enter the 6-digit code</Text>
        <Text style={styles.subtitle}>We sent a verification code to {email || "your email"}.</Text>

        <TextInput
          value={code}
          onChangeText={setCode}
          keyboardType="number-pad"
          maxLength={6}
          placeholder="123456"
          placeholderTextColor="#8B9894"
          style={styles.input}
        />

        <Pressable
          style={({ pressed }) => [styles.verifyButton, pressed && styles.verifyPressed]}
          onPress={handleVerify}
          disabled={isSubmitting}
        >
          <Text style={styles.verifyText}>{isSubmitting ? "Verifying..." : "Verify"}</Text>
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
  subtitle: {
    marginTop: 8,
    color: "#AFC0BA",
    fontSize: 15
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
    fontSize: 18,
    letterSpacing: 4
  },
  verifyButton: {
    marginTop: 20,
    height: 52,
    borderRadius: 14,
    backgroundColor: "#2A8769",
    alignItems: "center",
    justifyContent: "center"
  },
  verifyPressed: {
    backgroundColor: "rgba(42, 135, 105, 0.25)",
    borderWidth: 1,
    borderColor: "rgba(82, 181, 148, 0.7)"
  },
  verifyText: {
    color: "#EAF6F1",
    fontSize: 16,
    fontWeight: "600"
  }
});
