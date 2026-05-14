import { Redirect } from "expo-router";
import { useAuth } from "@/utils/auth/useAuth";
import { View, ActivityIndicator } from "react-native";
import { colors } from "@/theme";

export default function Index() {
  const { isReady, auth, appMode } = useAuth();

  if (!isReady) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!auth) {
    return <Redirect href="/onboarding" />;
  }

  if (appMode === 'business') {
    return <Redirect href="/business/dashboard" />;
  }

  return <Redirect href="/(tabs)/home" />;
}
