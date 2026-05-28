import React, { useState } from "react";
import { Pressable, SafeAreaView, StyleSheet, Text, View } from "react-native";
import FloatingMusicBackground from "../components/FloatingMusicBackground";

const OPTIONS = [
  "< less than 1 time per week",
  "2-4 times a week",
  "5-7 times a week",
  "> more than 8 times"
];

export default function SignupAboutScreen({ navigation, route }) {
  const [selected, setSelected] = useState("");

  const handleContinue = () => {
    navigation.navigate("SignupGenres", {
      ...(route.params || {}),
      workoutFrequency: selected
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <FloatingMusicBackground noteColor="#6D7E79" />
      <View style={styles.content}>
        <Text style={styles.eyebrow}>Tell us more about you</Text>
        <Text style={styles.title}>How often do you work out</Text>

        <View style={styles.optionsContainer}>
          {OPTIONS.map((option) => {
            const isSelected = selected === option;
            return (
              <Pressable
                key={option}
                style={({ pressed }) => [
                  styles.option,
                  isSelected && styles.optionSelected,
                  pressed && styles.optionPressed
                ]}
                onPress={() => setSelected(option)}
              >
                <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>{option}</Text>
              </Pressable>
            );
          })}
        </View>

        <Pressable
          style={({ pressed }) => [styles.continueButton, pressed && styles.continuePressed, !selected && styles.disabledButton]}
          onPress={handleContinue}
          disabled={!selected}
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
    fontSize: 30,
    fontWeight: "700"
  },
  optionsContainer: {
    marginTop: 18,
    gap: 10
  },
  option: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#3D4A47",
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: "rgba(255,255,255,0.03)"
  },
  optionSelected: {
    borderColor: "#2A8769",
    backgroundColor: "rgba(42, 135, 105, 0.2)"
  },
  optionPressed: {
    backgroundColor: "rgba(42, 135, 105, 0.16)"
  },
  optionText: {
    color: "#DDE7E3",
    fontSize: 15
  },
  optionTextSelected: {
    color: "#ECF8F3",
    fontWeight: "600"
  },
  continueButton: {
    marginTop: 18,
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
  disabledButton: {
    opacity: 0.45
  },
  continueText: {
    color: "#EAF6F1",
    fontSize: 16,
    fontWeight: "600"
  }
});
