import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Button,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View
} from "react-native";
import * as Linking from "expo-linking";
import * as WebBrowser from "expo-web-browser";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { BACKEND_URL } from "../config/env";
import { supabase } from "../lib/supabase";
import FloatingMusicBackground from "../components/FloatingMusicBackground";

const STORAGE_KEY = "pulsesync.spotifyRefreshToken";
const onboardingStorageKey = (userId) => `pulsesync.onboarding.${userId}`;

export default function HomeScreen({ navigation, session }) {
  const [name, setName] = useState("Leg Day");
  const [intensity, setIntensity] = useState("high");
  const [volume, setVolume] = useState("moderate");
  const [durationMinutes, setDurationMinutes] = useState("45");
  const [genres, setGenres] = useState("edm,house,pop");
  const [vibe, setVibe] = useState("aggressive");
  const [explicitAllowed, setExplicitAllowed] = useState(false);
  const [spotifyRefreshToken, setSpotifyRefreshToken] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [userContext, setUserContext] = useState({
    name: "",
    dateOfBirth: "",
    workoutFrequency: "",
    favoriteGenres: []
  });

  const userId = session?.user?.id || "anonymous";
  const authToken = session?.access_token || "";
  const mobileRedirectUrl = Linking.createURL("spotify-callback");
  const connectSpotifyUrl = useMemo(
    () =>
      `${BACKEND_URL}/auth/spotify/login?userId=${encodeURIComponent(userId)}&frontend_redirect=${encodeURIComponent(
        mobileRedirectUrl
      )}`,
    [mobileRedirectUrl, userId]
  );

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((value) => {
      if (value) {
        setSpotifyRefreshToken(value);
      }
    });
  }, []);

  useEffect(() => {
    async function loadUserContext() {
      const metadata = session?.user?.user_metadata || {};
      const contextFromMetadata = {
        name: metadata?.name || "",
        dateOfBirth: metadata?.date_of_birth || "",
        workoutFrequency: metadata?.workout_frequency || "",
        favoriteGenres: Array.isArray(metadata?.favorite_genres) ? metadata.favorite_genres : []
      };

      let contextFromOnboarding = {};
      if (session?.user?.id) {
        try {
          const raw = await AsyncStorage.getItem(onboardingStorageKey(session.user.id));
          const parsed = raw ? JSON.parse(raw) : null;
          contextFromOnboarding = parsed?.data || {};
        } catch (_error) {
          contextFromOnboarding = {};
        }
      }

      const merged = {
        name: contextFromOnboarding?.name || contextFromMetadata.name || "",
        dateOfBirth: contextFromOnboarding?.dateOfBirth || contextFromMetadata.dateOfBirth || "",
        workoutFrequency: contextFromOnboarding?.workoutFrequency || contextFromMetadata.workoutFrequency || "",
        favoriteGenres:
          (Array.isArray(contextFromOnboarding?.favoriteGenres) && contextFromOnboarding.favoriteGenres) ||
          contextFromMetadata.favoriteGenres ||
          []
      };

      setUserContext(merged);
    }

    loadUserContext();
  }, [session?.user?.id, session?.user?.user_metadata]);

  useEffect(() => {
    const handleUrl = async ({ url }) => {
      const parsed = Linking.parse(url);
      const queryParams = parsed.queryParams || {};

      if (queryParams.spotify === "connected") {
        const tokenFromRedirect =
          typeof queryParams.spotify_refresh_token === "string" ? queryParams.spotify_refresh_token : "";
        if (tokenFromRedirect) {
          setSpotifyRefreshToken(tokenFromRedirect);
          await AsyncStorage.setItem(STORAGE_KEY, tokenFromRedirect);
        }
        Alert.alert("Spotify", "Spotify connection completed.");
      }
    };

    const subscription = Linking.addEventListener("url", handleUrl);
    Linking.getInitialURL().then((url) => {
      if (url) {
        handleUrl({ url });
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

  const handleOpenSpotifyConnect = async () => {
    const result = await WebBrowser.openAuthSessionAsync(connectSpotifyUrl, mobileRedirectUrl);
    if (result.type === "success" && result.url) {
      const parsed = Linking.parse(result.url);
      const queryParams = parsed.queryParams || {};
      const tokenFromRedirect =
        typeof queryParams.spotify_refresh_token === "string" ? queryParams.spotify_refresh_token : "";
      if (tokenFromRedirect) {
        setSpotifyRefreshToken(tokenFromRedirect);
        await AsyncStorage.setItem(STORAGE_KEY, tokenFromRedirect);
      }
      if (queryParams.spotify === "connected") {
        Alert.alert("Spotify", "Spotify connection completed.");
      }
    }
  };

  const handleGeneratePlaylist = async () => {
    if (!spotifyRefreshToken.trim()) {
      Alert.alert("Missing Spotify token", "Paste your spotifyRefreshToken first.");
      return;
    }

    const workout = {
      name: name.trim(),
      intensity: intensity.trim(),
      volume: volume.trim(),
      duration_minutes: Number(durationMinutes) || 30,
      genres: genres
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
      explicit_allowed: explicitAllowed,
      vibe: vibe.trim()
    };

    try {
      setIsGenerating(true);
      await AsyncStorage.setItem(STORAGE_KEY, spotifyRefreshToken.trim());

      const response = await fetch(`${BACKEND_URL}/api/playlist/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: authToken ? `Bearer ${authToken}` : ""
        },
        body: JSON.stringify({
          workout,
          userContext,
          spotifyRefreshToken: spotifyRefreshToken.trim()
        })
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload?.error || "Failed to generate playlist.");
      }

      navigation.navigate("Result", payload);
    } catch (error) {
      Alert.alert("Generation failed", error.message || "Unexpected error.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <View style={styles.screen}>
      <FloatingMusicBackground noteColor="#8A9A95" />
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Workout Input</Text>
        <TextInput value={name} onChangeText={setName} placeholder="Workout name" style={styles.input} />
        <TextInput value={intensity} onChangeText={setIntensity} placeholder="Intensity" style={styles.input} />
        <TextInput value={volume} onChangeText={setVolume} placeholder="Volume" style={styles.input} />
        <TextInput
          value={durationMinutes}
          onChangeText={setDurationMinutes}
          placeholder="Duration minutes"
          keyboardType="numeric"
          style={styles.input}
        />
        <TextInput value={genres} onChangeText={setGenres} placeholder="Genres (comma-separated)" style={styles.input} />
        <TextInput value={vibe} onChangeText={setVibe} placeholder="Vibe" style={styles.input} />

        <View style={styles.switchRow}>
          <Text style={styles.switchLabel}>Explicit Allowed</Text>
          <Switch value={explicitAllowed} onValueChange={setExplicitAllowed} />
        </View>

        <View style={styles.block}>
          <Button title="Connect Spotify" onPress={handleOpenSpotifyConnect} />
        </View>

        <TextInput
          value={spotifyRefreshToken}
          onChangeText={setSpotifyRefreshToken}
          placeholder="Paste Spotify refresh token"
          style={styles.input}
        />

        <View style={styles.block}>
          <Button
            title={isGenerating ? "Generating..." : "Generate Playlist"}
            onPress={handleGeneratePlaylist}
            disabled={isGenerating}
          />
        </View>

        <View style={styles.block}>
          <Button title="Sign Out" onPress={handleSignOut} />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1
  },
  container: {
    padding: 16,
    gap: 12
  },
  title: {
    fontSize: 22,
    fontWeight: "700"
  },
  input: {
    borderWidth: 1,
    borderColor: "#cccccc",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10
  },
  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  switchLabel: {
    fontSize: 16
  },
  block: {
    marginTop: 6
  }
});
