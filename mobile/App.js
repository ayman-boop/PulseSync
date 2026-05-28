import React, { useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { supabase } from "./src/lib/supabase";
import LoginScreen from "./src/screens/LoginScreen";
import SignupNameScreen from "./src/screens/SignupNameScreen";
import SignupDobScreen from "./src/screens/SignupDobScreen";
import SignupAboutScreen from "./src/screens/SignupAboutScreen";
import SignupGenresScreen from "./src/screens/SignupGenresScreen";
import SignupEmailScreen from "./src/screens/SignupEmailScreen";
import SignupPasswordScreen from "./src/screens/SignupPasswordScreen";
import SignupVerifyCodeScreen from "./src/screens/SignupVerifyCodeScreen";
import HomeScreen from "./src/screens/HomeScreen";
import ResultScreen from "./src/screens/ResultScreen";
import OnboardingWelcomeScreen from "./src/screens/OnboardingWelcomeScreen";
import OnboardingNameScreen from "./src/screens/OnboardingNameScreen";
import OnboardingDobScreen from "./src/screens/OnboardingDobScreen";
import OnboardingFrequencyScreen from "./src/screens/OnboardingFrequencyScreen";

const Stack = createNativeStackNavigator();
const onboardingStorageKey = (userId) => `pulsesync.onboarding.${userId}`;

export default function App() {
  const [session, setSession] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isOnboardingLoading, setIsOnboardingLoading] = useState(false);
  const [isOnboardingComplete, setIsOnboardingComplete] = useState(false);

  useEffect(() => {
    let isMounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (isMounted) {
        setSession(data.session ?? null);
        setIsLoading(false);
      }
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession ?? null);
      setIsLoading(false);
    });

    return () => {
      isMounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function loadOnboardingStatus() {
      if (!session?.user?.id) {
        setIsOnboardingComplete(false);
        setIsOnboardingLoading(false);
        return;
      }

      setIsOnboardingLoading(true);
      try {
        const raw = await AsyncStorage.getItem(onboardingStorageKey(session.user.id));
        const parsed = raw ? JSON.parse(raw) : null;
        if (isMounted) {
          setIsOnboardingComplete(Boolean(parsed?.completed));
        }
      } catch (_error) {
        if (isMounted) {
          setIsOnboardingComplete(false);
        }
      } finally {
        if (isMounted) {
          setIsOnboardingLoading(false);
        }
      }
    }

    loadOnboardingStatus();

    return () => {
      isMounted = false;
    };
  }, [session?.user?.id]);

  const handleOnboardingComplete = async (data) => {
    if (!session?.user?.id) {
      return;
    }

    await AsyncStorage.setItem(
      onboardingStorageKey(session.user.id),
      JSON.stringify({
        completed: true,
        completedAt: new Date().toISOString(),
        data
      })
    );
    setIsOnboardingComplete(true);
  };

  if (isLoading || isOnboardingLoading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <StatusBar style="auto" />
      <Stack.Navigator>
        {!session ? (
          <>
            <Stack.Screen name="Login" options={{ title: "Login", headerShown: false }}>
              {(props) => <LoginScreen {...props} />}
            </Stack.Screen>
            <Stack.Screen
              name="SignupName"
              options={{
                title: "",
                headerShown: true,
                headerTransparent: true,
                headerTintColor: "#DCE7E2",
                headerBackTitleVisible: false,
                animation: "slide_from_right"
              }}
            >
              {(props) => <SignupNameScreen {...props} />}
            </Stack.Screen>
            <Stack.Screen
              name="SignupDob"
              component={SignupDobScreen}
              options={{
                title: "",
                headerShown: true,
                headerTransparent: true,
                headerTintColor: "#DCE7E2",
                headerBackTitleVisible: false,
                animation: "slide_from_right"
              }}
            />
            <Stack.Screen
              name="SignupAbout"
              component={SignupAboutScreen}
              options={{
                title: "",
                headerShown: true,
                headerTransparent: true,
                headerTintColor: "#DCE7E2",
                headerBackTitleVisible: false,
                animation: "slide_from_right"
              }}
            />
            <Stack.Screen
              name="SignupGenres"
              component={SignupGenresScreen}
              options={{
                title: "",
                headerShown: true,
                headerTransparent: true,
                headerTintColor: "#DCE7E2",
                headerBackTitleVisible: false,
                animation: "slide_from_right"
              }}
            />
            <Stack.Screen
              name="SignupEmail"
              component={SignupEmailScreen}
              options={{
                title: "",
                headerShown: true,
                headerTransparent: true,
                headerTintColor: "#DCE7E2",
                headerBackTitleVisible: false,
                animation: "slide_from_right"
              }}
            />
            <Stack.Screen
              name="SignupPassword"
              component={SignupPasswordScreen}
              options={{
                title: "",
                headerShown: true,
                headerTransparent: true,
                headerTintColor: "#DCE7E2",
                headerBackTitleVisible: false,
                animation: "slide_from_right"
              }}
            />
            <Stack.Screen
              name="SignupVerifyCode"
              component={SignupVerifyCodeScreen}
              options={{
                title: "",
                headerShown: true,
                headerTransparent: true,
                headerTintColor: "#DCE7E2",
                headerBackTitleVisible: false,
                animation: "slide_from_right"
              }}
            />
          </>
        ) : !isOnboardingComplete ? (
          <>
            <Stack.Screen name="OnboardingWelcome" component={OnboardingWelcomeScreen} options={{ title: "Welcome" }} />
            <Stack.Screen name="OnboardingName" component={OnboardingNameScreen} options={{ title: "Your Name" }} />
            <Stack.Screen
              name="OnboardingDob"
              component={OnboardingDobScreen}
              options={{ title: "Date of Birth" }}
            />
            <Stack.Screen name="OnboardingFrequency" options={{ title: "Workout Frequency" }}>
              {(props) => <OnboardingFrequencyScreen {...props} onComplete={handleOnboardingComplete} />}
            </Stack.Screen>
          </>
        ) : (
          <>
            <Stack.Screen name="Home" options={{ title: "Create Workout Playlist" }}>
              {(props) => <HomeScreen {...props} session={session} />}
            </Stack.Screen>
            <Stack.Screen name="Result" component={ResultScreen} options={{ title: "Playlist Result" }} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loaderContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center"
  }
});
