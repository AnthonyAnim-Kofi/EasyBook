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
import { Eye, EyeOff, Mail, Lock, ChevronLeft, User, Briefcase, Check } from "lucide-react-native";
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
    new Animated.Value(insets.bottom + 24),
  ).current;

  const animateTo = (value) => {
    Animated.timing(paddingAnimation, {
      toValue: value,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  const handleFocus = () => {
    if (Platform.OS !== "web") animateTo(24);
  };

  const handleBlur = () => {
    if (Platform.OS !== "web") animateTo(insets.bottom + 24);
  };

  const handleLogin = async () => {
    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }

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
        {/* Teal Header - Unified */}
        <View
          style={{
            paddingTop: insets.top + 12,
            paddingHorizontal: 24,
            paddingBottom: 28,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 18 }}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: "rgba(255,255,255,0.15)",
                alignItems: "center",
                justifyContent: "center",
                marginRight: 12,
              }}
            >
              <ChevronLeft size={22} color={colors.white} />
            </TouchableOpacity>
            <View
              style={{
                backgroundColor: "rgba(255,255,255,0.18)",
                paddingHorizontal: 12,
                paddingVertical: 5,
                borderRadius: radius.pill,
                flexDirection: "row",
                alignItems: "center",
                gap: 6,
              }}
            >
              <Lock size={13} color={colors.white} />
              <Text
                style={{
                  fontSize: typography.size.xs,
                  fontWeight: typography.weight.bold,
                  color: colors.white,
                  letterSpacing: 1.2,
                }}
              >
                SECURE LOGIN
              </Text>
            </View>
          </View>

          <Text
            style={{
              fontSize: typography.size["4xl"],
              fontWeight: typography.weight.extrabold,
              color: colors.white,
              lineHeight: 34,
              marginBottom: 6,
            }}
          >
            Welcome Back!
          </Text>
          <Text
            style={{
              fontSize: typography.size.md,
              color: colors.whiteAlpha75,
            }}
          >
            Log in to continue your journey
          </Text>
        </View>

        {/* White Card Body */}
        <Animated.View
          style={{
            flex: 1,
            backgroundColor: colors.card,
            borderTopLeftRadius: 32,
            borderTopRightRadius: 32,
            paddingHorizontal: 24,
            paddingTop: 32,
          }}
        >
          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ paddingBottom: paddingAnimation }}
          >
            {error && (
              <View
                style={{
                  backgroundColor: colors.errorBg,
                  borderRadius: radius.md,
                  padding: 12,
                  marginBottom: 20,
                }}
              >
                <Text style={{ color: colors.error, fontSize: typography.size.body }}>{error}</Text>
              </View>
            )}

            <InputField
              label="Email Address"
              icon={Mail}
              placeholder="Enter your email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              variant="teal"
              onFocus={handleFocus}
              onBlur={handleBlur}
              textContentType="emailAddress"
              autoComplete="email"
            />

            <InputField
              label="Password"
              icon={Lock}
              placeholder="Enter your password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              variant="teal"
              onFocus={handleFocus}
              onBlur={handleBlur}
              textContentType="password"
              autoComplete="password"
              right={
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  {showPassword ? (
                    <EyeOff size={18} color={colors.primary} />
                  ) : (
                    <Eye size={18} color={colors.primary} />
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
                marginBottom: 28,
                marginTop: 4,
              }}
            >
              <TouchableOpacity
                onPress={() => setRememberMe(!rememberMe)}
                activeOpacity={0.7}
                style={{ flexDirection: "row", alignItems: "center", gap: 10 }}
              >
                <View
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: 6,
                    borderWidth: 2,
                    borderColor: rememberMe ? colors.primary : colors.border,
                    backgroundColor: rememberMe ? colors.primary : colors.transparent,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {rememberMe && <Check size={14} color={colors.white} strokeWidth={3} />}
                </View>
                <Text style={{ fontSize: typography.size.md, color: colors.textSecondary, fontWeight: typography.weight.medium }}>
                  Remember me
                </Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => router.push("/forgot-password")}>
                <Text style={{ fontSize: typography.size.md, color: colors.primary, fontWeight: typography.weight.bold }}>
                  Forgot?
                </Text>
              </TouchableOpacity>
            </View>

            <Button
              title={loading ? "Logging in..." : "LOGIN"}
              onPress={handleLogin}
              loading={loading}
              disabled={loading}
              style={{ marginBottom: 24 }}
            />

            {/* Business owner toggle - Premium style */}
            <TouchableOpacity
              onPress={() => setIsBusiness(!isBusiness)}
              activeOpacity={0.8}
              style={{
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: isBusiness ? colors.primarySurface : colors.background,
                padding: 16,
                borderRadius: radius.lg,
                borderWidth: 1,
                borderColor: isBusiness ? colors.primary : colors.border,
                marginBottom: 24,
                gap: 12,
              }}
            >
              <View
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  backgroundColor: isBusiness ? colors.primary : colors.white,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Briefcase size={16} color={isBusiness ? colors.white : colors.textTertiary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ 
                  fontSize: typography.size.md, 
                  fontWeight: typography.weight.bold,
                  color: isBusiness ? colors.primaryDark : colors.text 
                }}>
                  Business Owner
                </Text>
                <Text style={{ fontSize: typography.size.xs, color: colors.textTertiary }}>
                  Toggle for business dashboard access
                </Text>
              </View>
              <View
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: 10,
                  borderWidth: 2,
                  borderColor: isBusiness ? colors.primary : colors.border,
                  backgroundColor: isBusiness ? colors.primary : colors.transparent,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {isBusiness && <Check size={12} color={colors.white} strokeWidth={3} />}
              </View>
            </TouchableOpacity>

            {/* Sign Up link */}
            <View
              style={{
                flexDirection: "row",
                justifyContent: "center",
                alignItems: "center",
                marginBottom: 20,
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
