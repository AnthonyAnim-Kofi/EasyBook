import { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, ScrollView, Alert } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Lock, ArrowLeft, CheckCircle2 } from "lucide-react-native";
import KeyboardAvoidingAnimatedView from "@/components/KeyboardAvoidingAnimatedView";
import InputField from "@/components/InputField";
import Button from "@/components/Button";
import { colors, typography } from "@/theme";
import { supabase } from "@/utils/supabase";

export default function ResetPasswordScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);

  const handleReset = async () => {
    if (!password) {
      setError("Please enter a new password.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setError(null);
    setLoading(true);
    
    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: password
      });

      if (updateError) throw updateError;
      
      setSubmitted(true);
      Alert.alert("Success", "Your password has been reset successfully.");
      setTimeout(() => {
        router.replace("/signin");
      }, 2000);
    } catch (err) {
      console.error('Update password error:', err);
      setError(err.message || "Failed to reset password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.card, paddingHorizontal: 28, justifyContent: "center", alignItems: "center" }}>
        <StatusBar style="dark" />
        <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: "#E0F5F3", alignItems: "center", justifyContent: "center", marginBottom: 24 }}>
          <CheckCircle2 size={40} color={colors.primary} />
        </View>
        <Text style={{ fontSize: 24, fontWeight: "800", color: "#1A1A1A", marginBottom: 12, textAlign: "center" }}>Password Reset!</Text>
        <Text style={{ fontSize: 16, color: "#666", textAlign: "center", lineHeight: 24, marginBottom: 32 }}>
          Your password has been successfully updated. Redirecting to login...
        </Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingAnimatedView style={{ flex: 1 }} behavior="padding">
      <StatusBar style="dark" />
      <View style={{ flex: 1, backgroundColor: colors.card }}>
        <View style={{ paddingTop: insets.top + 16, paddingHorizontal: 22, paddingBottom: 20 }}>
          <TouchableOpacity 
            onPress={() => router.back()}
            style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: "#F5F5F5", alignItems: "center", justifyContent: "center" }}
          >
            <ArrowLeft size={20} color="#1A1A1A" />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={{ paddingHorizontal: 28, paddingTop: 10 }}>
          <Text style={{ fontSize: 32, fontWeight: "800", color: "#1A1A1A", marginBottom: 12 }}>New Password</Text>
          <Text style={{ fontSize: 16, color: "#666", lineHeight: 24, marginBottom: 32 }}>
            Please enter your new password below.
          </Text>

          {error && (
            <View style={{ backgroundColor: colors.errorBg, borderRadius: 12, padding: 12, marginBottom: 16 }}>
              <Text style={{ color: colors.error, fontSize: 14 }}>{error}</Text>
            </View>
          )}

          <InputField
            label="New Password"
            icon={Lock}
            placeholder="Min. 6 characters"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <InputField
            label="Confirm Password"
            icon={Lock}
            placeholder="Repeat new password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
          />

          <Button
            title={loading ? "Resetting..." : "RESET PASSWORD"}
            onPress={handleReset}
            loading={loading}
            disabled={loading}
            style={{ marginTop: 20 }}
          />
        </ScrollView>
      </View>
    </KeyboardAvoidingAnimatedView>
  );
}
