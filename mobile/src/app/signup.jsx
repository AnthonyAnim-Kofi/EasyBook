import { useState, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { User, Mail, Phone, Lock, Eye, EyeOff, ChevronLeft } from "lucide-react-native";
import KeyboardAvoidingAnimatedView from "@/components/KeyboardAvoidingAnimatedView";
import InputField from "@/components/InputField";
import Button from "@/components/Button";
import { colors, typography } from "@/theme";
import authService from "@/services/auth";

export default function SignUpScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});

  const paddingAnimation = useRef(new Animated.Value(insets.bottom + 24)).current;

  const animateTo = (value) => {
    Animated.timing(paddingAnimation, { toValue: value, duration: 200, useNativeDriver: false }).start();
  };

  const handleFocus = () => { if (Platform.OS !== "web") animateTo(24); };
  const handleBlur = () => { if (Platform.OS !== "web") animateTo(insets.bottom + 24); };

  const validate = () => {
    const errors = {};
    if (!fullName.trim()) errors.fullName = "Full name is required.";
    if (!email.trim()) errors.email = "Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = "Invalid email address.";
    if (phone && !/^(\+233|0)(2[0-9]|5[0-9])[0-9]{7}$/.test(phone.replace(/\s/g, ''))) {
      errors.phone = "Enter a valid Ghana phone number (e.g. 0241234567).";
    }
    if (!password) errors.password = "Password is required.";
    else if (password.length < 6) errors.password = "Password must be at least 6 characters.";
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSignUp = async () => {
    if (!validate()) return;
    setError(null);
    setLoading(true);

    try {
      await authService.signUp({ fullName, email, phone, password });
      router.replace("/(tabs)/home");
    } catch (err) {
      setError(err.message || "Sign up failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingAnimatedView style={{ flex: 1 }} behavior="padding">
      <StatusBar style="dark" />
      <View style={{ flex: 1, backgroundColor: colors.backgroundAlt }}>
        {/* Header */}
        <View style={{ paddingTop: insets.top + 16, paddingHorizontal: 20, paddingBottom: 8, flexDirection: "row", alignItems: "center" }}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: colors.white, alignItems: "center", justifyContent: "center", marginRight: 12 }}
          >
            <ChevronLeft size={22} color={colors.text} />
          </TouchableOpacity>
        </View>

        <Animated.ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: paddingAnimation }}
        >
          {/* Title */}
          <View style={{ marginBottom: 32, marginTop: 8 }}>
            <Text style={{ fontSize: typography.size.body, color: colors.primary, fontWeight: typography.weight.semibold, marginBottom: 6, letterSpacing: 0.4 }}>
              START FOR FREE
            </Text>
            <Text style={{ fontSize: typography.size['5xl'], fontWeight: typography.weight.extrabold, color: colors.text, lineHeight: 36 }}>
              Create an{"\n"}account
            </Text>
            <Text style={{ fontSize: typography.size.md, color: colors.textTertiary, marginTop: 8 }}>
              Fill in your details to get started
            </Text>
          </View>

          {error && (
            <View style={{ backgroundColor: colors.errorBg, borderRadius: 10, padding: 12, marginBottom: 16 }}>
              <Text style={{ color: colors.error, fontSize: typography.size.body }}>{error}</Text>
            </View>
          )}

          <InputField label="Full Name" icon={User} placeholder="Enter your full name" value={fullName} onChangeText={setFullName} variant="teal" onFocus={handleFocus} onBlur={handleBlur} error={fieldErrors.fullName} />
          <InputField label="Email Address" icon={Mail} placeholder="Enter your email" value={email} onChangeText={setEmail} keyboardType="email-address" variant="teal" onFocus={handleFocus} onBlur={handleBlur} error={fieldErrors.email} />
          <InputField label="Phone Number" icon={Phone} placeholder="Enter your phone number" value={phone} onChangeText={setPhone} keyboardType="phone-pad" variant="teal" onFocus={handleFocus} onBlur={handleBlur} error={fieldErrors.phone} />
          <InputField
            label="Password" icon={Lock} placeholder="Create a password" value={password} onChangeText={setPassword}
            secureTextEntry={!showPassword} variant="teal" onFocus={handleFocus} onBlur={handleBlur} error={fieldErrors.password}
            right={
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                {showPassword ? <EyeOff size={18} color={colors.primary} /> : <Eye size={18} color={colors.primary} />}
              </TouchableOpacity>
            }
          />

          <Button title={loading ? "Creating account..." : "SIGN UP"} onPress={handleSignUp} loading={loading} disabled={loading} style={{ marginTop: 8, marginBottom: 24 }} />

          {/* Sign In link */}
          <View style={{ flexDirection: "row", justifyContent: "center", alignItems: "center", marginBottom: 12 }}>
            <Text style={{ fontSize: typography.size.md, color: colors.textTertiary }}>Already have an account? </Text>
            <TouchableOpacity onPress={() => router.push("/signin")}>
              <Text style={{ fontSize: typography.size.md, color: colors.primary, fontWeight: typography.weight.bold }}>Sign In</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={{ alignItems: "center", paddingVertical: 8 }}>
            <Text style={{ fontSize: typography.size.body, color: colors.textTertiary }}>
              Are you a business owner?{" "}
              <Text style={{ color: colors.primary, fontWeight: typography.weight.bold }}>Sign Up</Text>
            </Text>
          </TouchableOpacity>
        </Animated.ScrollView>
      </View>
    </KeyboardAvoidingAnimatedView>
  );
}
