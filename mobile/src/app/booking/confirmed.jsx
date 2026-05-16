import { useEffect, useRef } from "react";
import { View, Text, TouchableOpacity, Animated } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { CheckCircle, CalendarCheck, Clock } from "lucide-react-native";
import { useRouter, useLocalSearchParams } from "expo-router";

const PRIMARY = "#00A896";

export default function AppointmentConfirmedScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();

  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 5,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <View
      style={{ flex: 1, backgroundColor: "#F7F7F7", paddingTop: insets.top }}
    >
      <StatusBar style="dark" />

      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          paddingHorizontal: 28,
        }}
      >
        {/* Checkmark animation */}
        <Animated.View
          style={{ transform: [{ scale: scaleAnim }], marginBottom: 28 }}
        >
          <View
            style={{
              width: 110,
              height: 110,
              borderRadius: 55,
              backgroundColor: "#E0F5F3",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <View
              style={{
                width: 80,
                height: 80,
                borderRadius: 40,
                backgroundColor: PRIMARY,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <CheckCircle size={44} color="#fff" fill="transparent" />
            </View>
          </View>
        </Animated.View>

        <Animated.View style={{ opacity: fadeAnim, alignItems: "center" }}>
          <Text
            style={{
              fontSize: 26,
              fontWeight: "800",
              color: "#1A1A1A",
              marginBottom: 10,
              textAlign: "center",
            }}
          >
            Appointment Confirmed!
          </Text>
          <Text
            style={{
              fontSize: 14,
              color: "#888",
              textAlign: "center",
              marginBottom: 36,
              lineHeight: 22,
            }}
          >
            Your booking at {params.salon || "Yanks Spa and Salon"} has been
            confirmed.
          </Text>

          {/* Details card */}
          <View
            style={{
              backgroundColor: "#fff",
              borderRadius: 20,
              padding: 22,
              width: "100%",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 3 },
              shadowOpacity: 0.08,
              shadowRadius: 12,
              elevation: 4,
              marginBottom: 36,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 16,
              }}
            >
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: "#E0F5F3",
                  alignItems: "center",
                  justifyContent: "center",
                  marginRight: 14,
                }}
              >
                <CalendarCheck size={18} color={PRIMARY} />
              </View>
              <View>
                <Text style={{ fontSize: 12, color: "#888", marginBottom: 2 }}>
                  Date
                </Text>
                <Text
                  style={{ fontSize: 15, fontWeight: "700", color: "#1A1A1A" }}
                >
                  {params.date || "—"}
                </Text>
              </View>
            </View>

            <View
              style={{
                height: 1,
                backgroundColor: "#F5F5F5",
                marginBottom: 16,
              }}
            />

            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 16,
              }}
            >
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: "#E0F5F3",
                  alignItems: "center",
                  justifyContent: "center",
                  marginRight: 14,
                }}
              >
                <Clock size={18} color={PRIMARY} />
              </View>
              <View>
                <Text style={{ fontSize: 12, color: "#888", marginBottom: 2 }}>
                  Time
                </Text>
                <Text
                  style={{ fontSize: 15, fontWeight: "700", color: "#1A1A1A" }}
                >
                  {params.time || "—"}
                </Text>
              </View>
            </View>

            <View
              style={{
                height: 1,
                backgroundColor: "#F5F5F5",
                marginBottom: 16,
              }}
            />

            <View>
              <Text style={{ fontSize: 12, color: "#888", marginBottom: 4 }}>
                Service
              </Text>
              <Text
                style={{ fontSize: 15, fontWeight: "700", color: "#1A1A1A" }}
              >
                {params.service || "Classic Haircut"}
              </Text>
              <Text style={{ fontSize: 13, color: "#888", marginTop: 2 }}>
                with {params.specialist || "No Specialist"}
              </Text>
            </View>
          </View>

          {/* Buttons */}
          <TouchableOpacity
            onPress={() => router.push({ pathname: "/payment/method", params })}
            style={{
              backgroundColor: PRIMARY,
              borderRadius: 30,
              paddingVertical: 17,
              width: "100%",
              alignItems: "center",
              marginBottom: 14,
              shadowColor: PRIMARY,
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: 0.3,
              shadowRadius: 12,
              elevation: 5,
            }}
          >
            <Text style={{ color: "#fff", fontSize: 16, fontWeight: "700" }}>
              Proceed to Payment
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.replace("/(tabs)/home")}>
            <Text style={{ fontSize: 15, fontWeight: "600", color: "#888" }}>
              Back to Home
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </View>
  );
}
