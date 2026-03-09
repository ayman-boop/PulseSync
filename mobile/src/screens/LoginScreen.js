import React, { useState } from "react";
import {
  Alert,
  Button,
  StyleSheet,
  Text,
  TextInput,
  View
} from "react-native";
import * as WebBrowser from "expo-web-browser";
import * as Linking from "expo-linking";

import { isSupabaseConfigured, supabase } from "../lib/supabase";

WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSignIn = async () => {
    if (!isSupabaseConfigured) {
      Alert.alert("Supabase not configured", "Set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY.");
      return;
    }

    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password
      });

      if (error) {
        Alert.alert("Sign in failed", error.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async () => {
    if (!isSupabaseConfigured) {
      Alert.alert("Supabase not configured", "Set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY.");
      return;
    }

    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signUp({
        email: email.trim(),
        password
      });

      if (error) {
        Alert.alert("Sign up failed", error.message);
      } else {
        Alert.alert("Check your inbox", "If email confirmation is enabled, confirm your email then sign in.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    if (!isSupabaseConfigured) {
      Alert.alert("Supabase not configured", "Set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY.");
      return;
    }

    try {
      setIsLoading(true);
      const redirectTo = Linking.createURL("auth-callback");
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo,
          skipBrowserRedirect: true
        }
      });

      if (error) {
        Alert.alert("Google sign in failed", error.message);
        return;
      }

      if (data?.url) {
        await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>PulseSync Login</Text>
      <TextInput
        autoCapitalize="none"
        keyboardType="email-address"
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
      />
      <TextInput
        secureTextEntry
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        style={styles.input}
      />

      <View style={styles.buttonGroup}>
        <Button title={isLoading ? "Please wait..." : "Sign In"} onPress={handleSignIn} disabled={isLoading} />
      </View>
      <View style={styles.buttonGroup}>
        <Button title={isLoading ? "Please wait..." : "Sign Up"} onPress={handleSignUp} disabled={isLoading} />
      </View>
      <View style={styles.buttonGroup}>
        <Button
          title={isLoading ? "Please wait..." : "Sign In With Google (Optional)"}
          onPress={handleGoogleSignIn}
          disabled={isLoading}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    gap: 12
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    marginTop: 8
  },
  input: {
    borderWidth: 1,
    borderColor: "#cccccc",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10
  },
  buttonGroup: {
    marginTop: 4
  }
});
