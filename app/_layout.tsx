import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SupabaseAuthProvider } from "@/hooks/supabase-auth-context";
import { AppProvider } from "@/hooks/app-context";
import { HadithProvider } from "@/hooks/hadith-context";
import { ErrorBoundary } from "@/components/ErrorBoundary";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  return (
    <Stack screenOptions={{ headerBackTitle: "Back" }}>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="auth/sign-in" options={{ title: "Sign In", presentation: "modal" }} />
      <Stack.Screen name="auth/sign-up" options={{ title: "Sign Up", presentation: "modal" }} />
      <Stack.Screen name="debug-supabase" options={{ title: "Supabase Debug", presentation: "modal" }} />
      <Stack.Screen name="(parent)" options={{ headerShown: false }} />
      <Stack.Screen name="(admin)" options={{ headerShown: false }} />
    </Stack>
  );
}

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  const containerStyle = { flex: 1 };

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <GestureHandlerRootView style={containerStyle}>
          <SupabaseAuthProvider>
            <AppProvider>
              <HadithProvider>
                <RootLayoutNav />
              </HadithProvider>
            </AppProvider>
          </SupabaseAuthProvider>
        </GestureHandlerRootView>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}