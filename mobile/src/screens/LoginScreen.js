import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Button,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  Animated,
  View
} from "react-native";
import * as WebBrowser from "expo-web-browser";
import * as Linking from "expo-linking";

import { isSupabaseConfigured, supabase } from "../lib/supabase";
import FloatingMusicBackground from "../components/FloatingMusicBackground";

WebBrowser.maybeCompleteAuthSession();

function parseAuthTokensFromUrl(url) {
  if (!url || typeof url !== "string") {
    return { accessToken: null, refreshToken: null };
  }

  // Supabase may return tokens in query params or URL hash fragment.
  const normalizedUrl = url.includes("#") ? url.replace("#", "?") : url;
  const { queryParams } = Linking.parse(normalizedUrl);

  const accessToken = typeof queryParams?.access_token === "string" ? queryParams.access_token : null;
  const refreshToken = typeof queryParams?.refresh_token === "string" ? queryParams.refresh_token : null;

  return { accessToken, refreshToken };
}

export default function LoginScreen({ navigation, route }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState(null);
  const [subtitleIndex, setSubtitleIndex] = useState(0);
  const subtitleFade = useRef(new Animated.Value(1)).current;

  const dynamicSubtitles = [
    "Let's get you started",
    "Sync your workouts with music",
    "Build playlists that match your energy"
  ];

  useEffect(() => {
    if (route?.params?.openMode) {
      setMode(route.params.openMode);
    }
  }, [route?.params?.openMode]);

  useEffect(() => {
    if (route?.params?.prefillEmail) {
      setEmail(route.params.prefillEmail);
    }
  }, [route?.params?.prefillEmail]);

  useEffect(() => {
    const id = setInterval(() => {
      Animated.sequence([
        Animated.timing(subtitleFade, {
          toValue: 0.4,
          duration: 260,
          useNativeDriver: true
        }),
        Animated.timing(subtitleFade, {
          toValue: 1,
          duration: 260,
          useNativeDriver: true
        })
      ]).start();
      setSubtitleIndex((prev) => (prev + 1) % dynamicSubtitles.length);
    }, 2800);

    return () => clearInterval(id);
  }, [dynamicSubtitles.length, subtitleFade]);

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
        const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
        if (result.type === "success" && result.url) {
          const { accessToken, refreshToken } = parseAuthTokensFromUrl(result.url);

          if (!accessToken || !refreshToken) {
            Alert.alert(
              "Google sign in incomplete",
              "OAuth callback did not include tokens. Check Supabase redirect URL configuration."
            );
            return;
          }

          const { error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
          });

          if (sessionError) {
            Alert.alert("Google sign in failed", sessionError.message);
          }
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <FloatingMusicBackground noteColor="#6D7E79" />

      <View style={styles.centerCard}>
        <Text style={styles.title}>Welcome to PulseSync</Text>
        <Animated.Text style={[styles.subtitle, { opacity: subtitleFade }]}>
          {dynamicSubtitles[subtitleIndex]}
        </Animated.Text>

        {!mode ? (
          <View style={styles.choiceContainer}>
            <Pressable
              onPress={() => setMode("signin")}
              style={({ pressed, hovered }) => [styles.primaryAction, (pressed || hovered) && styles.actionPressed]}
            >
              <Text style={styles.primaryActionText}>Sign in</Text>
            </Pressable>
            <Pressable
              onPress={() => navigation.navigate("SignupName")}
              style={({ pressed, hovered }) => [styles.secondaryAction, (pressed || hovered) && styles.actionPressed]}
            >
              <Text style={styles.secondaryActionText}>Sign up</Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.formContainer}>
            <Text style={styles.formTitle}>{mode === "signin" ? "Sign in to continue" : "Create your account"}</Text>
            <TextInput
              autoCapitalize="none"
              keyboardType="email-address"
              placeholder="Email"
              placeholderTextColor="#95A3A1"
              value={email}
              onChangeText={setEmail}
              style={styles.input}
            />
            <TextInput
              secureTextEntry
              placeholder="Password"
              placeholderTextColor="#95A3A1"
              value={password}
              onChangeText={setPassword}
              style={styles.input}
            />

            <View style={styles.buttonGroup}>
              <Button
                title={isLoading ? "Please wait..." : mode === "signin" ? "Sign In" : "Sign Up"}
                onPress={mode === "signin" ? handleSignIn : handleSignUp}
                disabled={isLoading}
                color="#2A8769"
              />
            </View>
            <View style={styles.buttonGroup}>
              <Button
                title={isLoading ? "Please wait..." : "Sign In With Google"}
                onPress={handleGoogleSignIn}
                disabled={isLoading}
                color="#415A54"
              />
            </View>
            <Pressable onPress={() => setMode(null)} style={styles.backLink}>
              <Text style={styles.backLinkText}>Back</Text>
            </Pressable>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1E2221"
  },
  centerCard: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 24
  },
  title: {
    color: "#F1F5F3",
    textAlign: "center",
    fontSize: 34,
    fontWeight: "700"
  },
  subtitle: {
    color: "#B8C8C2",
    textAlign: "center",
    marginTop: 10,
    fontSize: 16
  },
  choiceContainer: {
    marginTop: 54,
    gap: 12
  },
  primaryAction: {
    height: 50,
    borderRadius: 12,
    backgroundColor: "#2A8769",
    alignItems: "center",
    justifyContent: "center"
  },
  primaryActionText: {
    color: "#EAF6F1",
    fontWeight: "600",
    fontSize: 16
  },
  secondaryAction: {
    height: 50,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#3F4C49",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.02)"
  },
  secondaryActionText: {
    color: "#DDE7E3",
    fontWeight: "600",
    fontSize: 16
  },
  actionPressed: {
    backgroundColor: "rgba(42, 135, 105, 0.25)",
    borderColor: "rgba(82, 181, 148, 0.65)"
  },
  formContainer: {
    marginTop: 28,
    gap: 10
  },
  formTitle: {
    color: "#DCE7E2",
    textAlign: "center",
    marginBottom: 4,
    fontSize: 16,
    fontWeight: "600"
  },
  input: {
    borderWidth: 1,
    borderColor: "#40514D",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: "rgba(0,0,0,0.22)",
    color: "#F3F8F6"
  },
  buttonGroup: {
    marginTop: 4
  },
  backLink: {
    marginTop: 10,
    alignItems: "center"
  },
  backLinkText: {
    color: "#8EB4A5",
    fontSize: 15
  }
});
