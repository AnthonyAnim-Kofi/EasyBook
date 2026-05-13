import { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Mail, ArrowLeft, CheckCircle2 } from "lucide-react-native";
import KeyboardAvoidingAnimatedView from "@/components/KeyboardAvoidingAnimatedView";
import InputField from "@/components/InputField";
import Button from "@/components/Button";
import { colors, typography } from "@/theme";

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async () => {
    if (!email) {
      setError("Please enter your email address.");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    setError(null);
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 1500);
  };

  if (submitted) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.card, paddingHorizontal: 28, justifyContent: "center", alignItems: "center" }}>
        <StatusBar style="dark" />
        <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: "#E0F5F3", alignItems: "center", justifyContent: "center", marginBottom: 24 }}>
          <CheckCircle2 size={40} color={colors.primary} />
        </View>
        <Text style={{ fontSize: 24, fontWeight: "800", color: "#1A1A1A", marginBottom: 12, textAlign: "center" }}>Check Your Email</Text>
        <Text style={{ fontSize: 16, color: "#666", textAlign: "center", lineHeight: 24, marginBottom: 32 }}>
          We've sent password reset instructions to {email}
        </Text>
        <Button 
          title="BACK TO LOGIN" 
          onPress={() => router.replace("/signin")}
          style={{ width: "100%" }}
        />
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
          <Text style={{ fontSize: 32, fontWeight: "800", color: "#1A1A1A", marginBottom: 12 }}>Forgot Password?</Text>
          <Text style={{ fontSize: 16, color: "#666", lineHeight: 24, marginBottom: 32 }}>
            Don't worry! It happens. Please enter the email address associated with your account.
          </Text>

          {error && (
            <View style={{ backgroundColor: colors.errorBg, borderRadius: 12, padding: 12, marginBottom: 16 }}>
              <Text style={{ color: colors.error, fontSize: 14 }}>{error}</Text>
            </View>
          )}

          <InputField
            label="Email Address"
            icon={Mail}
            placeholder="Enter your email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
          />

          <Button
            title={loading ? "Sending..." : "SEND CODE"}
            onPress={handleSubmit}
            loading={loading}
            disabled={loading}
            style={{ marginTop: 20 }}
          />
        </ScrollView>
      </View>
    </KeyboardAvoidingAnimatedView>
  );
}
