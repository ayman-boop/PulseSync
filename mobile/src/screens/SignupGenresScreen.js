import React, { useState } from "react";
import { Alert, Pressable, SafeAreaView, StyleSheet, Text, View } from "react-native";
import FloatingMusicBackground from "../components/FloatingMusicBackground";

const GENRES = [
  "Pop",
  "Hip-Hop",
  "Rap",
  "R&B",
  "Rock",
  "Alternative",
  "EDM",
  "House",
  "Techno",
  "Latin",
  "Reggaeton",
  "Afrobeats",
  "Jazz",
  "Classical",
  "Country",
  "Indie"
];

export default function SignupGenresScreen({ navigation, route }) {
  const [selectedGenres, setSelectedGenres] = useState([]);

  const toggleGenre = (genre) => {
    setSelectedGenres((prev) => {
      const alreadySelected = prev.includes(genre);
      if (alreadySelected) {
        return prev.filter((g) => g !== genre);
      }

      if (prev.length >= 3) {
        Alert.alert("Selection limit", "You can select up to 3 genres.");
        return prev;
      }

      return [...prev, genre];
    });
  };

  const handleContinue = () => {
    if (selectedGenres.length === 0) {
      Alert.alert("Select genres", "Please select at least 1 genre.");
      return;
    }

    navigation.navigate("SignupEmail", {
      ...(route.params || {}),
      favoriteGenres: selectedGenres
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <FloatingMusicBackground noteColor="#6D7E79" />
      <View style={styles.content}>
        <Text style={styles.eyebrow}>Tell us more about your music taste</Text>
        <Text style={styles.title}>What is your favorite music genre</Text>
        <Text style={styles.subtitle}>Select up to 3</Text>

        <View style={styles.genreGrid}>
          {GENRES.map((genre) => {
            const selected = selectedGenres.includes(genre);
            return (
              <Pressable
                key={genre}
                onPress={() => toggleGenre(genre)}
                style={({ pressed }) => [
                  styles.genreChip,
                  selected && styles.genreChipSelected,
                  pressed && styles.genreChipPressed
                ]}
              >
                <Text style={[styles.genreText, selected && styles.genreTextSelected]}>{genre}</Text>
              </Pressable>
            );
          })}
        </View>

        <Pressable
          style={({ pressed }) => [styles.continueButton, pressed && styles.continuePressed]}
          onPress={handleContinue}
        >
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
  subtitle: {
    marginTop: 8,
    color: "#AFC0BA",
    fontSize: 15
  },
  genreGrid: {
    marginTop: 18,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10
  },
  genreChip: {
    borderWidth: 1,
    borderColor: "#3D4A47",
    borderRadius: 999,
    paddingVertical: 10,
    paddingHorizontal: 14,
    backgroundColor: "rgba(255,255,255,0.03)"
  },
  genreChipSelected: {
    borderColor: "#2A8769",
    backgroundColor: "rgba(42, 135, 105, 0.2)"
  },
  genreChipPressed: {
    backgroundColor: "rgba(42, 135, 105, 0.16)"
  },
  genreText: {
    color: "#DDE7E3",
    fontSize: 14
  },
  genreTextSelected: {
    color: "#ECF8F3",
    fontWeight: "600"
  },
  continueButton: {
    marginTop: 24,
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
