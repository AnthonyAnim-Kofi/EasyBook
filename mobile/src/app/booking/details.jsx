import { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Animated,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { ArrowLeft } from "lucide-react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import authService from "@/services/auth";
import KeyboardAvoidingAnimatedView from "@/components/KeyboardAvoidingAnimatedView";

const PRIMARY = "#00A896";

export default function BookingDetailsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [note, setNote] = useState("");

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    const user = await authService.getStoredUser();
    if (user) {
      setName(user.full_name || "");
      setEmail(user.email || "");
    }
  };

  const paddingAnimation = useRef(
    new Animated.Value(insets.bottom + 20),
  ).current;
  const animateTo = (v) =>
    Animated.timing(paddingAnimation, {
      toValue: v,
      duration: 200,
      useNativeDriver: false,
    }).start();
  const handleFocus = () => {
    if (Platform.OS !== "web") animateTo(20);
  };
  const handleBlur = () => {
    if (Platform.OS !== "web") animateTo(insets.bottom + 20);
  };

  const handleBook = () => {
    router.push({
      pathname: "/booking/confirmed",
      params: { ...params, name, email },
    });
  };

  return (
    <KeyboardAvoidingAnimatedView style={{ flex: 1 }} behavior="padding">
      <StatusBar style="dark" />
      <View style={{ flex: 1, backgroundColor: "#F7F7F7" }}>
        {/* Header */}
        <View
          style={{
            backgroundColor: "#fff",
            paddingTop: insets.top + 12,
            paddingHorizontal: 22,
            paddingBottom: 16,
            borderBottomWidth: 1,
            borderBottomColor: "#F0F0F0",
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: "#F5F5F5",
                alignItems: "center",
                justifyContent: "center",
                marginRight: 14,
              }}
            >
              <ArrowLeft size={20} color="#1A1A1A" />
            </TouchableOpacity>
            <Text style={{ fontSize: 17, fontWeight: "700", color: "#1A1A1A" }}>
              Fill in your details
            </Text>
          </View>
        </View>

        <Animated.ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{
            padding: 22,
            paddingBottom: paddingAnimation,
          }}
        >
          {/* Booking summary */}
          <View
            style={{
              backgroundColor: "#E0F5F3",
              borderRadius: 16,
              padding: 16,
              marginBottom: 28,
            }}
          >
            <Text
              style={{
                fontSize: 13,
                fontWeight: "700",
                color: PRIMARY,
                marginBottom: 6,
              }}
            >
              Booking Summary
            </Text>
            <Text style={{ fontSize: 14, color: "#1A1A1A", fontWeight: "600" }}>
              {params.salon || "Yanks Spa and Salon"}
            </Text>
            <Text style={{ fontSize: 13, color: "#555", marginTop: 2 }}>
              {params.service || "Classic Haircut"} ·{" "}
              {params.specialist || "Lily"}
            </Text>
            <View style={{ flexDirection: "row", gap: 16, marginTop: 8 }}>
              <Text style={{ fontSize: 12, color: PRIMARY, fontWeight: "600" }}>
                📅 {params.date || "—"}
              </Text>
              <Text style={{ fontSize: 12, color: PRIMARY, fontWeight: "600" }}>
                🕐 {params.time || "—"}
              </Text>
            </View>
          </View>

          {/* Name */}
          <Text
            style={{
              fontSize: 13,
              fontWeight: "600",
              color: "#555",
              marginBottom: 8,
              marginLeft: 2,
            }}
          >
            Full Name
          </Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Enter your name"
            placeholderTextColor="#BBBBBB"
            onFocus={handleFocus}
            onBlur={handleBlur}
            style={{
              backgroundColor: "#fff",
              borderRadius: 14,
              paddingHorizontal: 18,
              paddingVertical: 15,
              fontSize: 15,
              color: "#1A1A1A",
              marginBottom: 18,
              borderWidth: 1.5,
              borderColor: "#EEEEEE",
            }}
          />

          {/* Email */}
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
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="Enter your email"
            placeholderTextColor="#BBBBBB"
            keyboardType="email-address"
            autoCapitalize="none"
            onFocus={handleFocus}
            onBlur={handleBlur}
            style={{
              backgroundColor: "#fff",
              borderRadius: 14,
              paddingHorizontal: 18,
              paddingVertical: 15,
              fontSize: 15,
              color: "#1A1A1A",
              marginBottom: 18,
              borderWidth: 1.5,
              borderColor: "#EEEEEE",
            }}
          />

          {/* Note */}
          <Text
            style={{
              fontSize: 13,
              fontWeight: "600",
              color: "#555",
              marginBottom: 8,
              marginLeft: 2,
            }}
          >
            Note (Optional)
          </Text>
          <TextInput
            value={note}
            onChangeText={setNote}
            placeholder="Any special requests?"
            placeholderTextColor="#BBBBBB"
            multiline
            numberOfLines={4}
            onFocus={handleFocus}
            onBlur={handleBlur}
            style={{
              backgroundColor: "#fff",
              borderRadius: 14,
              paddingHorizontal: 18,
              paddingVertical: 15,
              fontSize: 15,
              color: "#1A1A1A",
              marginBottom: 32,
              borderWidth: 1.5,
              borderColor: "#EEEEEE",
              height: 110,
              textAlignVertical: "top",
            }}
          />

          {/* Book button */}
          <TouchableOpacity
            onPress={handleBook}
            style={{
              backgroundColor: PRIMARY,
              borderRadius: 30,
              paddingVertical: 17,
              alignItems: "center",
              shadowColor: PRIMARY,
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: 0.3,
              shadowRadius: 12,
              elevation: 5,
            }}
          >
            <Text
              style={{
                color: "#fff",
                fontSize: 16,
                fontWeight: "700",
                letterSpacing: 0.5,
              }}
            >
              Book appointment
            </Text>
          </TouchableOpacity>
        </Animated.ScrollView>
      </View>
    </KeyboardAvoidingAnimatedView>
  );
}
