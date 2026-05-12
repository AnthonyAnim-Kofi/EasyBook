import { useState, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Animated,
  Platform,
  ScrollView,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import {
  Store,
  Mail,
  Phone,
  Lock,
  Eye,
  EyeOff,
  ChevronLeft,
} from "lucide-react-native";
import { useRouter } from "expo-router";
import KeyboardAvoidingAnimatedView from "@/components/KeyboardAvoidingAnimatedView";

const PRIMARY = "#00A896";
const INPUT_BG = "#E0F5F3";

function Field({
  icon: Icon,
  placeholder,
  value,
  onChangeText,
  keyboardType,
  secureTextEntry,
  right,
  prefix,
  onFocus,
  onBlur,
}) {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: INPUT_BG,
        borderRadius: 14,
        paddingHorizontal: 14,
        marginBottom: 14,
      }}
    >
      <Icon size={18} color={PRIMARY} style={{ marginRight: 10 }} />
      {prefix ? (
        <Text
          style={{
            fontSize: 15,
            color: "#555",
            fontWeight: "600",
            marginRight: 6,
          }}
        >
          {prefix}
        </Text>
      ) : null}
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#A0C9C4"
        keyboardType={keyboardType || "default"}
        secureTextEntry={secureTextEntry}
        autoCapitalize="none"
        onFocus={onFocus}
        onBlur={onBlur}
        style={{ flex: 1, paddingVertical: 15, fontSize: 15, color: "#1A1A1A" }}
      />
      {right}
    </View>
  );
}

export default function BusinessSignUpScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [bizName, setBizName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const paddingAnim = useRef(new Animated.Value(insets.bottom + 24)).current;
  const animateTo = (v) =>
    Animated.timing(paddingAnim, {
      toValue: v,
      duration: 200,
      useNativeDriver: false,
    }).start();
  const handleFocus = () => {
    if (Platform.OS !== "web") animateTo(24);
  };
  const handleBlur = () => {
    if (Platform.OS !== "web") animateTo(insets.bottom + 24);
  };

  const handleSignUp = () => {
    if (!bizName || !email || !phone || !password || !confirm) {
      setError("Please fill in all fields.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    setError(null);
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      router.replace("/business/dashboard");
    }, 1400);
  };

  return (
    <KeyboardAvoidingAnimatedView style={{ flex: 1 }} behavior="padding">
      <StatusBar style="dark" />
      <View style={{ flex: 1, backgroundColor: "#EDE9E8" }}>
        {/* Back button */}
        <View
          style={{
            paddingTop: insets.top + 16,
            paddingHorizontal: 22,
            paddingBottom: 8,
          }}
        >
          <TouchableOpacity
            onPress={() => router.back()}
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: "#fff",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <ChevronLeft size={22} color="#1A1A1A" />
          </TouchableOpacity>
        </View>

        <Animated.ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{
            paddingHorizontal: 24,
            paddingBottom: paddingAnim,
          }}
        >
          {/* Title */}
          <View style={{ marginBottom: 28, marginTop: 8 }}>
            <Text
              style={{
                fontSize: 13,
                color: PRIMARY,
                fontWeight: "600",
                marginBottom: 6,
                letterSpacing: 0.4,
              }}
            >
              BUSINESS ACCOUNT
            </Text>
            <Text
              style={{
                fontSize: 28,
                fontWeight: "800",
                color: "#1A1A1A",
                lineHeight: 34,
                marginBottom: 6,
              }}
            >
              Create a business{"\n"}account
            </Text>
            <Text style={{ fontSize: 14, color: "#888" }}>
              Fill in your business details to get started
            </Text>
          </View>

          {error && (
            <View
              style={{
                backgroundColor: "#FFE5E5",
                borderRadius: 10,
                padding: 12,
                marginBottom: 14,
              }}
            >
              <Text style={{ color: "#D63031", fontSize: 13 }}>{error}</Text>
            </View>
          )}

          <Text
            style={{
              fontSize: 13,
              fontWeight: "600",
              color: "#555",
              marginBottom: 8,
              marginLeft: 2,
            }}
          >
            Business Name
          </Text>
          <Field
            icon={Store}
            placeholder="Enter your business name"
            value={bizName}
            onChangeText={setBizName}
            onFocus={handleFocus}
            onBlur={handleBlur}
          />

          <Text
            style={{
              fontSize: 13,
              fontWeight: "600",
              color: "#555",
              marginBottom: 8,
              marginLeft: 2,
            }}
          >
            Email Address
          </Text>
          <Field
            icon={Mail}
            placeholder="Enter business email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            onFocus={handleFocus}
            onBlur={handleBlur}
          />

          <Text
            style={{
              fontSize: 13,
              fontWeight: "600",
              color: "#555",
              marginBottom: 8,
              marginLeft: 2,
            }}
          >
            Phone Number
          </Text>
          <Field
            icon={Phone}
            placeholder="244 000 0000"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            prefix="🇬🇭 +233"
            onFocus={handleFocus}
            onBlur={handleBlur}
          />

          <Text
            style={{
              fontSize: 13,
              fontWeight: "600",
              color: "#555",
              marginBottom: 8,
              marginLeft: 2,
            }}
          >
            Password
          </Text>
          <Field
            icon={Lock}
            placeholder="Create a password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPass}
            onFocus={handleFocus}
            onBlur={handleBlur}
            right={
              <TouchableOpacity onPress={() => setShowPass(!showPass)}>
                {showPass ? (
                  <EyeOff size={18} color={PRIMARY} />
                ) : (
                  <Eye size={18} color={PRIMARY} />
                )}
              </TouchableOpacity>
            }
          />

          <Text
            style={{
              fontSize: 13,
              fontWeight: "600",
              color: "#555",
              marginBottom: 8,
              marginLeft: 2,
            }}
          >
            Confirm Password
          </Text>
          <Field
            icon={Lock}
            placeholder="Confirm your password"
            value={confirm}
            onChangeText={setConfirm}
            secureTextEntry={!showConfirm}
            onFocus={handleFocus}
            onBlur={handleBlur}
            right={
              <TouchableOpacity onPress={() => setShowConfirm(!showConfirm)}>
                {showConfirm ? (
                  <EyeOff size={18} color={PRIMARY} />
                ) : (
                  <Eye size={18} color={PRIMARY} />
                )}
              </TouchableOpacity>
            }
          />

          {/* Sign Up Button */}
          <TouchableOpacity
            onPress={handleSignUp}
            disabled={loading}
            style={{
              backgroundColor: loading ? "#80D4CB" : PRIMARY,
              borderRadius: 30,
              paddingVertical: 17,
              alignItems: "center",
              shadowColor: PRIMARY,
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: 0.3,
              shadowRadius: 12,
              elevation: 5,
              marginTop: 8,
              marginBottom: 24,
            }}
          >
            <Text
              style={{
                color: "#fff",
                fontSize: 16,
                fontWeight: "700",
                letterSpacing: 1,
              }}
            >
              {loading ? "Creating account..." : "SIGN UP"}
            </Text>
          </TouchableOpacity>

          {/* Log in link */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Text style={{ fontSize: 14, color: "#888" }}>
              Already have an account?{" "}
            </Text>
            <TouchableOpacity onPress={() => router.replace("/signin")}>
              <Text style={{ fontSize: 14, color: PRIMARY, fontWeight: "700" }}>
                Log In
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.ScrollView>
      </View>
    </KeyboardAvoidingAnimatedView>
  );
}
