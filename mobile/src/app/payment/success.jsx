import { useEffect, useRef } from "react";
import { View, Text, TouchableOpacity, Animated } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { CheckCircle } from "lucide-react-native";
import { useRouter, useLocalSearchParams } from "expo-router";

const PRIMARY = "#00A896";

export default function PaymentSuccessScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();

  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const pulse1 = useRef(new Animated.Value(1)).current;
  const pulse2 = useRef(new Animated.Value(1)).current;

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

    // Pulse rings
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse1, {
          toValue: 1.4,
          duration: 900,
          useNativeDriver: true,
        }),
        Animated.timing(pulse1, {
          toValue: 1,
          duration: 900,
          useNativeDriver: true,
        }),
      ]),
    ).start();
    Animated.loop(
      Animated.sequence([
        Animated.delay(450),
        Animated.timing(pulse2, {
          toValue: 1.4,
          duration: 900,
          useNativeDriver: true,
        }),
        Animated.timing(pulse2, {
          toValue: 1,
          duration: 900,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, []);

  const txId = `TXN-${Date.now().toString().slice(-8)}`;

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
        {/* Pulsing rings + icon */}
        <Animated.View
          style={{
            transform: [{ scale: scaleAnim }],
            marginBottom: 32,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Animated.View
            style={{
              position: "absolute",
              width: 140,
              height: 140,
              borderRadius: 70,
              backgroundColor: "#E0F5F3",
              transform: [{ scale: pulse1 }],
              opacity: 0.5,
            }}
          />
          <Animated.View
            style={{
              position: "absolute",
              width: 115,
              height: 115,
              borderRadius: 57.5,
              backgroundColor: "#C0EDE8",
              transform: [{ scale: pulse2 }],
              opacity: 0.6,
            }}
          />
          <View
            style={{
              width: 90,
              height: 90,
              borderRadius: 45,
              backgroundColor: PRIMARY,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <CheckCircle size={46} color="#fff" />
          </View>
        </Animated.View>

        <Animated.View
          style={{ opacity: fadeAnim, alignItems: "center", width: "100%" }}
        >
          <Text
            style={{
              fontSize: 26,
              fontWeight: "800",
              color: "#1A1A1A",
              marginBottom: 8,
            }}
          >
            Payment Successful!
          </Text>
          <Text
            style={{
              fontSize: 40,
              fontWeight: "800",
              color: PRIMARY,
              marginBottom: 10,
            }}
          >
            GH₵ {params.total || "168"}.00
          </Text>
          <Text style={{ fontSize: 14, color: "#888", marginBottom: 36 }}>
            Your payment has been processed
          </Text>

          {/* Transaction details card */}
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
              marginBottom: 28,
            }}
          >
            {[
              { label: "Salon", value: params.salon || "Yanks Spa and Salon" },
              { label: "Service", value: params.service || "Classic Haircut" },
              { label: "Date", value: params.date || "—" },
              { label: "Time", value: params.time || "—" },
              { label: "Transaction ID", value: txId },
            ].map((row, i, arr) => (
              <View
                key={i}
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  paddingVertical: 10,
                  borderBottomWidth: i < arr.length - 1 ? 1 : 0,
                  borderBottomColor: "#F5F5F5",
                }}
              >
                <Text style={{ fontSize: 13, color: "#888" }}>{row.label}</Text>
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: "600",
                    color: "#1A1A1A",
                    maxWidth: "58%",
                    textAlign: "right",
                  }}
                >
                  {row.value}
                </Text>
              </View>
            ))}
          </View>

          {/* View Receipt */}
          <TouchableOpacity
            onPress={() =>
              router.push({
                pathname: "/payment/receipt",
                params: {
                  ...params,
                  total: String(params.total || "168"),
                  txId,
                },
              })
            }
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
              View Receipt
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
