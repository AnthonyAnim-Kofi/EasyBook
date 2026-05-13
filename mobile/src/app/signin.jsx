import { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  ScrollView,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Eye, EyeOff, Mail, Lock } from "lucide-react-native";
import KeyboardAvoidingAnimatedView from "@/components/KeyboardAvoidingAnimatedView";
import InputField from "@/components/InputField";
import Button from "@/components/Button";
import { colors, typography, radius } from "@/theme";
import authService from "@/services/auth";
import { getSavedEmail, setSavedEmail, removeSavedEmail } from "@/services/api";

export default function SignInScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isBusiness, setIsBusiness] = useState(false);

  useEffect(() => {
    loadSavedEmail();
  }, []);

  const loadSavedEmail = async () => {
    const savedEmail = await getSavedEmail();
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  };

  const paddingAnimation = useRef(
    new Animated.Value(insets.bottom + 16),
  ).current;

  const animateTo = (value) => {
    Animated.timing(paddingAnimation, {
      toValue: value,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  const handleFocus = () => {
    if (Platform.OS !== "web") animateTo(16);
  };

  const handleBlur = () => {
    if (Platform.OS !== "web") animateTo(insets.bottom + 16);
  };

  const handleLogin = async () => {
    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const data = await authService.signIn({ email, password });
      
      if (rememberMe) {
        await setSavedEmail(email);
      } else {
        await removeSavedEmail();
      }

      if (isBusiness || data.user.role === 'business_owner') {
        router.replace("/business/dashboard");
      } else {
        router.replace("/(tabs)/home");
      }
    } catch (err) {
      setError(err.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingAnimatedView style={{ flex: 1 }} behavior="padding">
      <StatusBar style="light" />
      <View style={{ flex: 1, backgroundColor: colors.primary }}>
        {/* Teal header */}
        <View
          style={{
            paddingTop: insets.top + 40,
            paddingBottom: 40,
            paddingHorizontal: 28,
          }}
        >
          <Text
            style={{
              fontSize: typography.size['4xl'],
              fontWeight: typography.weight.extrabold,
              color: colors.white,
              marginBottom: 4,
            }}
          >
            Welcome Back!
          </Text>
          <Text style={{ fontSize: typography.size.md, color: colors.whiteAlpha75 }}>
            Log in to continue
          </Text>
        </View>

        {/* White card body */}
        <Animated.View
          style={{
            flex: 1,
            backgroundColor: colors.card,
            borderTopLeftRadius: 32,
            borderTopRightRadius: 32,
            paddingHorizontal: 28,
            paddingTop: 36,
            paddingBottom: paddingAnimation,
          }}
        >
          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <Text
              style={{
                fontSize: typography.size['3xl'],
                fontWeight: typography.weight.bold,
                color: colors.text,
                marginBottom: 28,
              }}
            >
              Sign In
            </Text>

            {error && (
              <View
                style={{
                  backgroundColor: colors.errorBg,
                  borderRadius: radius.md,
                  padding: 12,
                  marginBottom: 16,
                }}
              >
                <Text style={{ color: colors.error, fontSize: typography.size.body }}>{error}</Text>
              </View>
            )}

            {/* Email */}
            <InputField
              label="Email Address"
              icon={Mail}
              placeholder="Enter your email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              onFocus={handleFocus}
              onBlur={handleBlur}
            />

            {/* Password */}
            <InputField
              label="Password"
              icon={Lock}
              placeholder="Enter your password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              onFocus={handleFocus}
              onBlur={handleBlur}
              right={
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  {showPassword ? (
                    <EyeOff size={18} color="#999" />
                  ) : (
                    <Eye size={18} color="#999" />
                  )}
                </TouchableOpacity>
              }
            />

            {/* Remember me + Forgot */}
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 32,
              }}
            >
              <TouchableOpacity
                onPress={() => setRememberMe(!rememberMe)}
                style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
              >
                <View
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: 6,
                    borderWidth: 2,
                    borderColor: rememberMe ? colors.primary : "#CCCCCC",
                    backgroundColor: rememberMe ? colors.primary : "transparent",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {rememberMe && (
                    <Text style={{ color: colors.white, fontSize: 12, fontWeight: typography.weight.bold }}>
                      ✓
                    </Text>
                  )}
                </View>
                <Text style={{ fontSize: typography.size.body, color: colors.textSecondary }}>Remember me</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => router.push("/forgot-password")}>
                <Text style={{ fontSize: typography.size.body, color: colors.primary, fontWeight: typography.weight.semibold }}>
                  Forgot Password?
                </Text>
              </TouchableOpacity>
            </View>

            {/* Login Button */}
            <Button
              title={loading ? "Logging in..." : "LOGIN"}
              onPress={handleLogin}
              loading={loading}
              disabled={loading}
              style={{ marginBottom: 28 }}
            />

            {/* Business owner toggle */}
            <TouchableOpacity
              onPress={() => setIsBusiness(!isBusiness)}
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                marginTop: 16,
                gap: 8,
              }}
            >
              <View
                style={{
                  width: 18,
                  height: 18,
                  borderRadius: 5,
                  borderWidth: 2,
                  borderColor: isBusiness ? colors.primary : "#CCC",
                  backgroundColor: isBusiness ? colors.primary : "transparent",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {isBusiness && (
                  <Text style={{ color: colors.white, fontSize: 11, fontWeight: typography.weight.extrabold }}>
                    ✓
                  </Text>
                )}
              </View>
              <Text style={{ fontSize: typography.size.body, color: "#666" }}>
                I'm a business owner
              </Text>
            </TouchableOpacity>

            {/* Sign Up link */}
            <View
              style={{
                flexDirection: "row",
                justifyContent: "center",
                alignItems: "center",
                marginTop: 14,
              }}
            >
              <Text style={{ fontSize: typography.size.md, color: colors.textTertiary }}>
                Don't have an account?{" "}
              </Text>
              <TouchableOpacity
                onPress={() =>
                  isBusiness
                    ? router.push("/business/signup")
                    : router.push("/signup")
                }
              >
                <Text style={{ fontSize: typography.size.md, color: colors.primary, fontWeight: typography.weight.bold }}>
                  Sign Up
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </Animated.View>
      </View>
    </KeyboardAvoidingAnimatedView>
  );
}
