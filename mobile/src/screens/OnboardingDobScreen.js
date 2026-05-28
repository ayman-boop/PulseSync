import React, { useMemo, useState } from "react";
import { Button, Platform, StyleSheet, Text, View } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import FloatingMusicBackground from "../components/FloatingMusicBackground";

export default function OnboardingDobScreen({ navigation, route }) {
  const [date, setDate] = useState(new Date(2000, 0, 1));
  const [showPicker, setShowPicker] = useState(Platform.OS === "ios");

  const formattedDate = useMemo(() => {
    return date.toLocaleDateString();
  }, [date]);

  const onChange = (_event, selectedDate) => {
    if (Platform.OS === "android") {
      setShowPicker(false);
    }
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  const handleContinue = () => {
    navigation.navigate("OnboardingFrequency", {
      ...route.params,
      dateOfBirth: date.toISOString()
    });
  };

  return (
    <View style={styles.container}>
      <FloatingMusicBackground noteColor="#8A9A95" />
      <Text style={styles.title}>When where you born</Text>
      <Text style={styles.valueText}>{formattedDate}</Text>

      {Platform.OS === "android" && (
        <View style={styles.buttonContainer}>
          <Button title="Choose Date" onPress={() => setShowPicker(true)} />
        </View>
      )}

      {showPicker && (
        <View style={styles.pickerShell}>
          <DateTimePicker
            value={date}
            mode="date"
            display={Platform.OS === "ios" ? "spinner" : "default"}
            maximumDate={new Date()}
            onChange={onChange}
            themeVariant={Platform.OS === "ios" ? "light" : undefined}
          />
        </View>
      )}

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
  valueText: {
    marginTop: 14,
    fontSize: 18
  },
  pickerShell: {
    marginTop: 12,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    overflow: "hidden"
  },
  buttonContainer: {
    marginTop: 18
  }
});
