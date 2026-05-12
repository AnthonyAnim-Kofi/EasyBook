import { useState, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Animated,
  Platform,
  Modal,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { ArrowLeft, X, Delete } from "lucide-react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import KeyboardAvoidingAnimatedView from "@/components/KeyboardAvoidingAnimatedView";

const PRIMARY = "#00A896";
const NETWORKS = ["MTN", "Airtel Tigo", "Telecel"];

function PinModal({ visible, onClose, onConfirm }) {
  const [pin, setPin] = useState([]);

  const append = (d) => {
    if (pin.length >= 4) return;
    const next = [...pin, d];
    setPin(next);
    if (next.length === 4) {
      setTimeout(() => {
        onConfirm();
        setPin([]);
      }, 400);
    }
  };
  const del = () => setPin((p) => p.slice(0, -1));

  const PAD = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "*", "0", "#"];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.45)" }}
        activeOpacity={1}
        onPress={onClose}
      />
      <View
        style={{
          backgroundColor: "#fff",
          borderTopLeftRadius: 28,
          borderTopRightRadius: 28,
          padding: 28,
          paddingBottom: 40,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 24,
          }}
        >
          <Text style={{ fontSize: 18, fontWeight: "800", color: "#1A1A1A" }}>
            Enter Momo PIN
          </Text>
          <TouchableOpacity onPress={onClose}>
            <X size={22} color="#888" />
          </TouchableOpacity>
        </View>

        {/* Dots */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "center",
            gap: 18,
            marginBottom: 32,
          }}
        >
          {[0, 1, 2, 3].map((i) => (
            <View
              key={i}
              style={{
                width: 18,
                height: 18,
                borderRadius: 9,
                backgroundColor: i < pin.length ? PRIMARY : "#E5E5E5",
              }}
            />
          ))}
        </View>

        {/* Numpad */}
        <View
          style={{
            flexDirection: "row",
            flexWrap: "wrap",
            justifyContent: "center",
            gap: 12,
          }}
        >
          {PAD.map((k) => (
            <TouchableOpacity
              key={k}
              onPress={() => (k === "#" ? del() : k !== "*" && append(k))}
              style={{
                width: 72,
                height: 72,
                borderRadius: 36,
                backgroundColor:
                  k === "#" ? "#FFE5E5" : k === "*" ? "transparent" : "#F5F5F5",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {k === "#" ? (
                <Delete size={22} color="#D63031" />
              ) : (
                <Text
                  style={{ fontSize: 22, fontWeight: "700", color: "#1A1A1A" }}
                >
                  {k}
                </Text>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </Modal>
  );
}

export default function MobileMoneyScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();

  const [network, setNetwork] = useState("MTN");
  const [phone, setPhone] = useState("");
  const [pinVisible, setPinVisible] = useState(false);

  const ref = `EZBK-${Date.now().toString().slice(-6)}`;

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

  const handlePinConfirm = () => {
    setPinVisible(false);
    router.push({
      pathname: "/payment/summary",
      params: { ...params, method: "Mobile Money", network, phone },
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
              Mobile Money
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
          {/* Network selector */}
          <Text
            style={{
              fontSize: 13,
              fontWeight: "600",
              color: "#555",
              marginBottom: 12,
              marginLeft: 2,
            }}
          >
            Select Network
          </Text>
          <View style={{ flexDirection: "row", gap: 12, marginBottom: 28 }}>
            {NETWORKS.map((n) => (
              <TouchableOpacity
                key={n}
                onPress={() => setNetwork(n)}
                style={{
                  flex: 1,
                  paddingVertical: 12,
                  borderRadius: 14,
                  alignItems: "center",
                  backgroundColor: network === n ? PRIMARY : "#fff",
                  borderWidth: 1.5,
                  borderColor: network === n ? PRIMARY : "#E0E0E0",
                }}
              >
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: "700",
                    color: network === n ? "#fff" : "#555",
                  }}
                >
                  {n}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Phone Number */}
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
          <TextInput
            value={phone}
            onChangeText={setPhone}
            placeholder="e.g. 024 000 0000"
            placeholderTextColor="#BBBBBB"
            keyboardType="phone-pad"
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

          {/* Reference */}
          <Text
            style={{
              fontSize: 13,
              fontWeight: "600",
              color: "#555",
              marginBottom: 8,
              marginLeft: 2,
            }}
          >
            Reference
          </Text>
          <View
            style={{
              backgroundColor: "#F5F5F5",
              borderRadius: 14,
              paddingHorizontal: 18,
              paddingVertical: 15,
              marginBottom: 36,
              borderWidth: 1.5,
              borderColor: "#EEEEEE",
            }}
          >
            <Text style={{ fontSize: 15, color: "#888" }}>{ref}</Text>
          </View>

          {/* Pay Now */}
          <TouchableOpacity
            onPress={() => setPinVisible(true)}
            disabled={!phone}
            style={{
              backgroundColor: phone ? PRIMARY : "#CCCCCC",
              borderRadius: 30,
              paddingVertical: 17,
              alignItems: "center",
              shadowColor: PRIMARY,
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: phone ? 0.3 : 0,
              shadowRadius: 12,
              elevation: phone ? 5 : 0,
            }}
          >
            <Text style={{ color: "#fff", fontSize: 16, fontWeight: "700" }}>
              Pay Now
            </Text>
          </TouchableOpacity>
        </Animated.ScrollView>

        <PinModal
          visible={pinVisible}
          onClose={() => setPinVisible(false)}
          onConfirm={handlePinConfirm}
        />
      </View>
    </KeyboardAvoidingAnimatedView>
  );
}
