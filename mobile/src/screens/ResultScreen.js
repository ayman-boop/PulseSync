import React from "react";
import { Button, StyleSheet, Text, View } from "react-native";
import * as Linking from "expo-linking";
import FloatingMusicBackground from "../components/FloatingMusicBackground";

export default function ResultScreen({ route, navigation }) {
  const playlistUrl = route.params?.playlistUrl || "";
  const playlistId = route.params?.playlistId || "";

  const handleOpenPlaylist = async () => {
    if (!playlistUrl) {
      return;
    }
    await Linking.openURL(playlistUrl);
  };

  return (
    <View style={styles.container}>
      <FloatingMusicBackground noteColor="#8A9A95" />
      <Text style={styles.title}>Playlist Generated</Text>
      <Text style={styles.label}>Playlist ID</Text>
      <Text selectable style={styles.value}>
        {playlistId || "Unavailable"}
      </Text>

      <Text style={styles.label}>Playlist URL</Text>
      <Text selectable style={styles.value}>
        {playlistUrl || "Unavailable"}
      </Text>

      <View style={styles.buttonRow}>
        <Button title="Open Playlist" onPress={handleOpenPlaylist} disabled={!playlistUrl} />
      </View>
      <View style={styles.buttonRow}>
        <Button title="Back Home" onPress={() => navigation.navigate("Home")} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    gap: 10
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 6
  },
  label: {
    fontSize: 14,
    color: "#666666"
  },
  value: {
    fontSize: 15
  },
  buttonRow: {
    marginTop: 8
  }
});
