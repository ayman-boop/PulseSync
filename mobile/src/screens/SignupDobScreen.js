import React, { useMemo, useState } from "react";
import { Platform, Pressable, SafeAreaView, StyleSheet, Text, View } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import FloatingMusicBackground from "../components/FloatingMusicBackground";

export default function SignupDobScreen({ navigation, route }) {
  const [date, setDate] = useState(new Date(2000, 0, 1));
  const [showPicker, setShowPicker] = useState(Platform.OS === "ios");

  const formattedDate = useMemo(() => date.toLocaleDateString(), [date]);

  const handleDateChange = (_event, selectedDate) => {
    if (Platform.OS === "android") {
      setShowPicker(false);
    }
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  const handleContinue = () => {
    navigation.navigate("SignupAbout", {
      ...route.params,
      dateOfBirth: date.toISOString()
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <FloatingMusicBackground noteColor="#6D7E79" />
      <View style={styles.content}>
        <Text style={styles.title}>When were you born?</Text>
        <Text style={styles.selectedDate}>{formattedDate}</Text>

        {Platform.OS === "android" && (
          <Pressable style={({ pressed }) => [styles.secondaryButton, pressed && styles.pressed]} onPress={() => setShowPicker(true)}>
            <Text style={styles.secondaryText}>Pick Date</Text>
          </Pressable>
        )}

        {showPicker && (
          <View style={styles.pickerShell}>
            <DateTimePicker
              value={date}
              mode="date"
              display={Platform.OS === "ios" ? "spinner" : "default"}
              maximumDate={new Date()}
              onChange={handleDateChange}
              themeVariant={Platform.OS === "ios" ? "light" : undefined}
            />
          </View>
        )}

        <Pressable style={({ pressed }) => [styles.continueButton, pressed && styles.pressed]} onPress={handleContinue}>
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
  title: {
    color: "#F2F7F4",
    fontSize: 30,
    fontWeight: "700"
  },
  selectedDate: {
    color: "#B9CAC4",
    marginTop: 12,
    fontSize: 18
  },
  pickerShell: {
    marginTop: 12,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    overflow: "hidden"
  },
  secondaryButton: {
    marginTop: 14,
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#3F4C49",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.03)"
  },
  secondaryText: {
    color: "#DCE7E2",
    fontSize: 16,
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
  continueText: {
    color: "#EAF6F1",
    fontSize: 16,
    fontWeight: "600"
  },
  pressed: {
    backgroundColor: "rgba(42, 135, 105, 0.25)",
    borderWidth: 1,
    borderColor: "rgba(82, 181, 148, 0.7)"
  }
});
