import { useState, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  Platform,
  ScrollView,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { User, Mail, Phone, Lock, Eye, EyeOff, ChevronLeft, Sparkles } from "lucide-react-native";
import KeyboardAvoidingAnimatedView from "@/components/KeyboardAvoidingAnimatedView";
import InputField from "@/components/InputField";
import Button from "@/components/Button";
import { colors, typography, radius } from "@/theme";
import authService from "@/services/auth";
import { useAuthStore } from "@/utils/auth/store";

export default function SignUpScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phonePrefix, setPhonePrefix] = useState("+233");
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

  const handlePhoneChange = (text) => {
    // Only allow digits
    const cleaned = text.replace(/[^0-9]/g, '');
    setPhone(cleaned);
  };

  const validate = () => {
    const errors = {};
    if (!fullName.trim()) errors.fullName = "Full name is required.";
    if (!email.trim()) errors.email = "Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = "Invalid email address.";
    
    if (!phone.trim()) errors.phone = "Phone number is required.";
    else if (phone.length < 7) errors.phone = "Invalid phone number.";
    
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
      // Clean prefix and phone to be numeric only
      const cleanPrefix = phonePrefix.replace(/[^0-9]/g, '');
      const cleanPhone = phone.replace(/[^0-9]/g, '');
      const numericPhone = `${cleanPrefix}${cleanPhone}`;
      
      const { confirmationRequired, user } = await authService.signUp({ fullName, email, phone: numericPhone, password, role: "customer" });
      
      if (confirmationRequired) {
        Alert.alert(
          "Verify your email",
          "A confirmation link has been sent to your email. Please verify it before logging in.",
          [{ text: "OK", onPress: () => router.replace("/signin") }]
        );
      } else {
        // Ensure appMode is set
        const { setAppMode } = useAuthStore.getState();
        setAppMode('customer');
        router.replace("/(tabs)/home");
      }
    } catch (err) {
      setError(err.message || "Sign up failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingAnimatedView style={{ flex: 1 }} behavior="padding">
      <StatusBar style="light" />
      <View style={{ flex: 1, backgroundColor: colors.primary }}>
        {/* Teal Header - Unified with Business Signup */}
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
              <User size={13} color={colors.white} />
              <Text
                style={{
                  fontSize: typography.size.xs,
                  fontWeight: typography.weight.bold,
                  color: colors.white,
                  letterSpacing: 1.2,
                }}
              >
                CUSTOMER ACCOUNT
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
            Join EasyBook
          </Text>
          <Text
            style={{
              fontSize: typography.size.md,
              color: colors.whiteAlpha75,
            }}
          >
            Create an account to get started
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
              <View style={{ backgroundColor: colors.errorBg, borderRadius: radius.md, padding: 12, marginBottom: 16 }}>
                <Text style={{ color: colors.error, fontSize: typography.size.body }}>{error}</Text>
              </View>
            )}

            <InputField 
              label="Full Name" 
              icon={User} 
              placeholder="Enter your full name" 
              value={fullName} 
              onChangeText={setFullName} 
              variant="teal" 
              onFocus={handleFocus} 
              onBlur={handleBlur} 
              error={fieldErrors.fullName}
              textContentType="name"
              autoComplete="name"
            />
            
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
              error={fieldErrors.email}
              textContentType="emailAddress"
              autoComplete="email"
            />
            
            <InputField 
              label="Phone Number" 
              icon={Phone} 
              placeholder="024 123 4567" 
              prefix={phonePrefix}
              value={phone} 
              onChangeText={handlePhoneChange} 
              keyboardType="phone-pad" 
              variant="teal" 
              onFocus={handleFocus} 
              onBlur={handleBlur} 
              error={fieldErrors.phone}
              textContentType="telephoneNumber"
              autoComplete="tel"
            />

            <InputField
              label="Password" 
              icon={Lock} 
              placeholder="Create a password" 
              value={password} 
              onChangeText={setPassword}
              secureTextEntry={!showPassword} 
              variant="teal" 
              onFocus={handleFocus} 
              onBlur={handleBlur} 
              error={fieldErrors.password}
              textContentType="newPassword"
              autoComplete="password-new"
              right={
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff size={18} color={colors.primary} /> : <Eye size={18} color={colors.primary} />}
                </TouchableOpacity>
              }
            />

            <Button 
              title={loading ? "Creating account..." : "SIGN UP"} 
              onPress={handleSignUp} 
              loading={loading} 
              disabled={loading} 
              style={{ marginTop: 8, marginBottom: 24 }} 
            />

            {/* Sign In link */}
            <View style={{ flexDirection: "row", justifyContent: "center", alignItems: "center", marginBottom: 24 }}>
              <Text style={{ fontSize: typography.size.md, color: colors.textTertiary }}>Already have an account? </Text>
              <TouchableOpacity onPress={() => router.push("/signin")}>
                <Text style={{ fontSize: typography.size.md, color: colors.primary, fontWeight: typography.weight.bold }}>Sign In</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity 
              onPress={() => router.push("/business/signup")} 
              style={{ 
                alignItems: "center", 
                paddingVertical: 16,
                borderTopWidth: 1,
                borderTopColor: colors.divider,
                marginTop: 8
              }}
            >
              <Text style={{ fontSize: typography.size.body, color: colors.textTertiary }}>
                Are you a business owner?{" "}
                <Text style={{ color: colors.primary, fontWeight: typography.weight.bold }}>Sign Up</Text>
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </Animated.View>
      </View>
    </KeyboardAvoidingAnimatedView>
  );
}
