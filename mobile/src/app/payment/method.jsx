import { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { ArrowLeft, Plus, Wallet } from "lucide-react-native";
import { useRouter, useLocalSearchParams } from "expo-router";

const PRIMARY = "#00A896";

const METHODS = [
  { id: "cash", label: "Cash", sub: "Pay on arrival", icon: "💵" },
  { id: "visa", label: "Visa Card", sub: "•••• •••• •••• 4532", icon: "💳" },
  {
    id: "add",
    label: "Add New Card",
    sub: "Credit or debit card",
    icon: "➕",
    isAdd: true,
  },
  {
    id: "mastercard",
    label: "Mastercard",
    sub: "•••• •••• •••• 7891",
    icon: "💳",
  },
  { id: "paypal", label: "PayPal", sub: "ella@gmail.com", icon: "🅿️" },
  {
    id: "momo",
    label: "Mobile Money",
    sub: "MTN, Airtel, Telecel",
    icon: "📱",
  },
];

export default function PaymentMethodScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();
  const [selected, setSelected] = useState("momo");

  const handlePayNow = () => {
    if (selected === "momo") {
      router.push({ pathname: "/payment/mobile-money", params });
    } else {
      router.push({
        pathname: "/payment/summary",
        params: { ...params, method: selected },
      });
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#F7F7F7" }}>
      <StatusBar style="dark" />

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
            Payment method
          </Text>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          padding: 22,
          paddingBottom: insets.bottom + 110,
        }}
      >
        <Text style={{ fontSize: 14, color: "#888", marginBottom: 20 }}>
          Select how you'd like to pay
        </Text>

        {METHODS.map((method, index) => (
          <TouchableOpacity
            key={method.id}
            onPress={() => !method.isAdd && setSelected(method.id)}
            style={{
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: selected === method.id ? "#E0F5F3" : "#fff",
              borderRadius: 16,
              padding: 18,
              marginBottom: 12,
              borderWidth: selected === method.id ? 2 : 1.5,
              borderColor: selected === method.id ? PRIMARY : "#F0F0F0",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.04,
              shadowRadius: 4,
              elevation: 1,
            }}
          >
            <Text style={{ fontSize: 24, marginRight: 16 }}>{method.icon}</Text>
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontSize: 15,
                  fontWeight: "700",
                  color: method.isAdd ? PRIMARY : "#1A1A1A",
                }}
              >
                {method.label}
              </Text>
              <Text style={{ fontSize: 12, color: "#888", marginTop: 2 }}>
                {method.sub}
              </Text>
            </View>
            {!method.isAdd && (
              <View
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: 11,
                  borderWidth: 2,
                  borderColor: selected === method.id ? PRIMARY : "#CCCCCC",
                  backgroundColor:
                    selected === method.id ? PRIMARY : "transparent",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {selected === method.id && (
                  <View
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: "#fff",
                    }}
                  />
                )}
              </View>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Bottom button */}
      <View
        style={{
          position: "absolute",
          bottom: insets.bottom + 16,
          left: 22,
          right: 22,
        }}
      >
        <TouchableOpacity
          onPress={handlePayNow}
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
          <Text style={{ color: "#fff", fontSize: 16, fontWeight: "700" }}>
            Pay Now
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
