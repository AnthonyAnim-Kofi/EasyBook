import { useAuth } from "@/utils/auth/useAuth";
import { Stack, useRouter } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      cacheTime: 1000 * 60 * 30, // 30 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export default function RootLayout() {
  const { initiate, isReady, auth } = useAuth();
  const router = useRouter();

  useEffect(() => {
    initiate();
  }, [initiate]);

  useEffect(() => {
    if (isReady) {
      SplashScreen.hideAsync();
      if (auth) {
        router.replace("/(tabs)/home");
      } else {
        router.replace("/onboarding");
      }
    }
  }, [isReady, auth]);

  if (!isReady) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <Stack
          screenOptions={{ headerShown: false, animation: "slide_from_right" }}
          initialRouteName="signin"
        >
          <Stack.Screen name="onboarding" options={{ animation: "fade" }} />
          <Stack.Screen
            name="signin"
            options={{ animation: "slide_from_right" }}
          />
          <Stack.Screen
            name="signup"
            options={{ animation: "slide_from_right" }}
          />
          <Stack.Screen
            name="(tabs)"
            options={{ animation: "fade", headerShown: false }}
          />
          <Stack.Screen
            name="edit-profile"
            options={{ animation: "slide_from_right" }}
          />
          <Stack.Screen
            name="search-results"
            options={{ animation: "slide_from_right" }}
          />
          <Stack.Screen
            name="business/detail"
            options={{ animation: "slide_from_right" }}
          />
          {/* Booking flow */}
          <Stack.Screen
            name="booking/date"
            options={{ animation: "slide_from_right" }}
          />
          <Stack.Screen
            name="booking/time"
            options={{ animation: "slide_from_right" }}
          />
          <Stack.Screen
            name="booking/details"
            options={{ animation: "slide_from_right" }}
          />
          <Stack.Screen
            name="booking/confirmed"
            options={{ animation: "slide_from_right" }}
          />
          {/* Payment flow */}
          <Stack.Screen
            name="payment/method"
            options={{ animation: "slide_from_right" }}
          />
          <Stack.Screen
            name="payment/mobile-money"
            options={{ animation: "slide_from_right" }}
          />
          <Stack.Screen
            name="payment/summary"
            options={{ animation: "slide_from_right" }}
          />
          <Stack.Screen
            name="payment/success"
            options={{ animation: "fade" }}
          />
          <Stack.Screen
            name="payment/receipt"
            options={{ animation: "slide_from_right" }}
          />
          {/* Business mode screens */}
          <Stack.Screen
            name="business/dashboard"
            options={{ animation: "fade" }}
          />
          <Stack.Screen
            name="business/insights"
            options={{ animation: "slide_from_right" }}
          />
          <Stack.Screen
            name="business/barber"
            options={{ animation: "slide_from_right" }}
          />
          <Stack.Screen
            name="business/signup"
            options={{ animation: "slide_from_right" }}
          />
          <Stack.Screen
            name="business/inbox"
            options={{ animation: "slide_from_right" }}
          />
          <Stack.Screen
            name="business/message"
            options={{ animation: "slide_from_right" }}
          />
          <Stack.Screen
            name="business/profile"
            options={{ animation: "slide_from_right" }}
          />
          <Stack.Screen
            name="business/booking-detail"
            options={{ animation: "slide_from_right" }}
          />
          {/* Customer extra screens */}
          <Stack.Screen
            name="favourites"
            options={{ animation: "slide_from_right" }}
          />
          <Stack.Screen
            name="notifications"
            options={{ animation: "slide_from_right" }}
          />
        </Stack>
      </GestureHandlerRootView>
    </QueryClientProvider>
  );
}
