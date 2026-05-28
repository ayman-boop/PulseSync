import React, { useState } from "react";
import { Alert, Pressable, SafeAreaView, StyleSheet, Text, TextInput, View } from "react-native";
import FloatingMusicBackground from "../components/FloatingMusicBackground";
import { isSupabaseConfigured, supabase } from "../lib/supabase";

export default function SignupPasswordScreen({ navigation, route }) {
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleContinue = async () => {
    const email = route.params?.email || "";
    if (!email) {
      Alert.alert("Missing email", "Please go back and enter your email.");
      return;
    }

    if (password.length < 8) {
      Alert.alert("Weak password", "Password must be at least 8 characters.");
      return;
    }

    if (!isSupabaseConfigured) {
      Alert.alert("Supabase not configured", "Set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY.");
      return;
    }

    try {
      setIsSubmitting(true);
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: route.params?.name || "",
            date_of_birth: route.params?.dateOfBirth || "",
            workout_frequency: route.params?.workoutFrequency || "",
            favorite_genres: route.params?.favoriteGenres || []
          }
        }
      });

      if (error) {
        Alert.alert("Sign up failed", error.message);
        return;
      }

      navigation.navigate("SignupVerifyCode", {
        email
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <FloatingMusicBackground noteColor="#6D7E79" />
      <View style={styles.content}>
        <Text style={styles.eyebrow}>Final step</Text>
        <Text style={styles.title}>Create a password</Text>
        <Text style={styles.subtitle}>Use at least 8 characters</Text>

        <TextInput
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoCapitalize="none"
          placeholder="Enter password"
          placeholderTextColor="#8B9894"
          style={styles.input}
        />

        <Pressable
          style={({ pressed }) => [styles.continueButton, pressed && styles.continuePressed]}
          onPress={handleContinue}
          disabled={isSubmitting}
        >
          <Text style={styles.continueText}>{isSubmitting ? "Creating..." : "Continue"}</Text>
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
