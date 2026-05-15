import { useAuth } from "@/utils/auth/useAuth";
import { Stack, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Alert, Platform } from "react-native";
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
  const { initiate, isReady, auth, appMode } = useAuth();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    initiate();
  }, [initiate]);

  useEffect(() => {
    if (isReady) {
      SplashScreen.hideAsync();
      
      const currentPath = segments.join('/');
      const publicRoutes = ["signin", "signup", "onboarding", "forgot-password", "reset-password", "business/signup"];
      
      const isPublicRoute = publicRoutes.includes(currentPath) || publicRoutes.includes(segments[0]);
      const inAuthGroup = segments[0] === "(tabs)" || segments[0] === "business";

      if (!auth) {
        // If not authenticated and not on a public route, go to onboarding
        if (!isPublicRoute && currentPath !== "" && currentPath !== "index") {
          router.replace("/onboarding");
        }
      } else {
        const user = typeof auth === 'string' ? JSON.parse(auth) : auth;
        const role = user?.role || user?.user_metadata?.role;
        const targetDashboard = appMode === 'business' ? "/business/dashboard" : "/(tabs)/home";

        // 1. If on a "public only" page, redirect to correct dashboard
        const publicOnlyRoutes = ["signin", "signup", "onboarding"];
        if (publicOnlyRoutes.includes(currentPath) || publicOnlyRoutes.includes(segments[0])) {
          router.replace(targetDashboard);
        }
        // 2. If at root, redirect
        else if (segments.length === 0 || segments[0] === "index") {
          router.replace(targetDashboard);
        }
        
        // 3. Safety check for business owners trying to access business side without a business record
        if (appMode === 'business' && inAuthGroup && currentPath !== "business/signup") {
           // If they are not a business owner or don't have a business, kick them out
           if (role !== 'business_owner' || user.has_business === false) {
              import('@/services/auth').then(({ authService }) => {
                 authService.signOut();
                 const msg = "Access Denied: You are not a business owner. Please register your business first.";
                 if (Platform.OS === 'web') {
                    window.alert(msg);
                 } else {
                    Alert.alert("Access Denied", msg);
                 }
                 router.replace("/signin");
              });
           }
        }
      }
    }
  }, [isReady, auth, segments, appMode]);

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
