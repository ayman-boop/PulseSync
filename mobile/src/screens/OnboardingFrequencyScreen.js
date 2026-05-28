import React, { useState } from "react";
import { Alert, Button, Pressable, StyleSheet, Text, View } from "react-native";
import FloatingMusicBackground from "../components/FloatingMusicBackground";

const OPTIONS = [
  "less than 1 per week",
  "1-3 times a week",
  "3-5 times a week",
  "Everyday"
];

export default function OnboardingFrequencyScreen({ route, onComplete }) {
  const [selected, setSelected] = useState(route.params?.workoutFrequency || "");

  const handleContinue = async () => {
    if (!selected) {
      Alert.alert("Selection required", "Please choose how often you workout.");
      return;
    }

    await onComplete({
      name: route.params?.name || "",
      dateOfBirth: route.params?.dateOfBirth || "",
      workoutFrequency: selected
    });
  };

  return (
    <View style={styles.container}>
      <FloatingMusicBackground noteColor="#8A9A95" />
      <Text style={styles.title}>How often do you workout</Text>

      <View style={styles.optionsContainer}>
        {OPTIONS.map((option) => {
          const isSelected = selected === option;
          return (
            <Pressable
              key={option}
              style={[styles.optionButton, isSelected && styles.optionButtonSelected]}
              onPress={() => setSelected(option)}
            >
              <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>{option}</Text>
            </Pressable>
          );
        })}
      </View>

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
  optionsContainer: {
    marginTop: 18,
    gap: 10
  },
  optionButton: {
    borderWidth: 1,
    borderColor: "#cccccc",
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 12
  },
  optionButtonSelected: {
    borderColor: "#1B6EF3",
    backgroundColor: "#E8F1FF"
  },
  optionText: {
    fontSize: 16
  },
  optionTextSelected: {
    color: "#1B6EF3",
    fontWeight: "600"
  },
  buttonContainer: {
    marginTop: 20
  }
});
