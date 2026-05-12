import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import {
  ArrowLeft,
  CalendarCheck,
  Clock,
  Scissors,
  Smartphone,
} from "lucide-react-native";
import { Image } from "expo-image";
import { useRouter, useLocalSearchParams } from "expo-router";

const PRIMARY = "#00A896";

const SERVICE_PRICE = 150;
const TAX = 18;
const TOTAL = SERVICE_PRICE + TAX;

export default function PaymentSummaryScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();

  const methodLabel =
    params.method === "momo" || params.method === "Mobile Money"
      ? `Mobile Money · ${params.network || "MTN"}`
      : params.method === "cash"
        ? "Cash on Arrival"
        : params.method === "visa"
          ? "Visa •••• 4532"
          : params.method === "mastercard"
            ? "Mastercard •••• 7891"
            : params.method === "paypal"
              ? "PayPal"
              : "Mobile Money";

  const handleConfirm = () => {
    router.push({
      pathname: "/payment/success",
      params: { ...params, total: String(TOTAL) },
    });
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
            Review Summary
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
        {/* Service card */}
        <View
          style={{
            backgroundColor: "#fff",
            borderRadius: 20,
            overflow: "hidden",
            marginBottom: 16,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.06,
            shadowRadius: 8,
            elevation: 2,
          }}
        >
          <Image
            source={{
              uri: "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=600",
            }}
            style={{ width: "100%", height: 140 }}
            contentFit="cover"
          />
          <View style={{ padding: 16 }}>
            <Text style={{ fontSize: 17, fontWeight: "800", color: "#1A1A1A" }}>
              {params.salon || "Yanks Spa and Salon"}
            </Text>
            <Text style={{ fontSize: 13, color: "#888", marginTop: 3 }}>
              {params.service || "Classic Haircut"} ·{" "}
              {params.specialist || "Lily"}
            </Text>
          </View>
        </View>

        {/* Booking details */}
        <View
          style={{
            backgroundColor: "#fff",
            borderRadius: 20,
            padding: 18,
            marginBottom: 16,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.06,
            shadowRadius: 8,
            elevation: 2,
          }}
        >
          <Text
            style={{
              fontSize: 15,
              fontWeight: "700",
              color: "#1A1A1A",
              marginBottom: 16,
            }}
          >
            Booking Details
          </Text>
          {[
            { icon: CalendarCheck, label: "Date", value: params.date || "—" },
            { icon: Clock, label: "Time", value: params.time || "—" },
            {
              icon: Scissors,
              label: "Service Type",
              value: params.service || "Classic Haircut",
            },
          ].map((item, i) => (
            <View
              key={i}
              style={{
                flexDirection: "row",
                alignItems: "center",
                paddingVertical: 10,
                borderBottomWidth: i < 2 ? 1 : 0,
                borderBottomColor: "#F5F5F5",
              }}
            >
              <View
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 18,
                  backgroundColor: "#E0F5F3",
                  alignItems: "center",
                  justifyContent: "center",
                  marginRight: 14,
                }}
              >
                <item.icon size={16} color={PRIMARY} />
              </View>
              <Text style={{ flex: 1, fontSize: 13, color: "#888" }}>
                {item.label}
              </Text>
              <Text
                style={{ fontSize: 13, fontWeight: "600", color: "#1A1A1A" }}
              >
                {item.value}
              </Text>
            </View>
          ))}
        </View>

        {/* Price breakdown */}
        <View
          style={{
            backgroundColor: "#fff",
            borderRadius: 20,
            padding: 18,
            marginBottom: 16,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.06,
            shadowRadius: 8,
            elevation: 2,
          }}
        >
          <Text
            style={{
              fontSize: 15,
              fontWeight: "700",
              color: "#1A1A1A",
              marginBottom: 16,
            }}
          >
            Price Breakdown
          </Text>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              marginBottom: 10,
            }}
          >
            <Text style={{ fontSize: 13, color: "#888" }}>Service fee</Text>
            <Text style={{ fontSize: 13, fontWeight: "600", color: "#1A1A1A" }}>
              GH₵ {SERVICE_PRICE}.00
            </Text>
          </View>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              marginBottom: 16,
            }}
          >
            <Text style={{ fontSize: 13, color: "#888" }}>Tax (12%)</Text>
            <Text style={{ fontSize: 13, fontWeight: "600", color: "#1A1A1A" }}>
              GH₵ {TAX}.00
            </Text>
          </View>
          <View
            style={{ height: 1, backgroundColor: "#F5F5F5", marginBottom: 16 }}
          />
          <View
            style={{ flexDirection: "row", justifyContent: "space-between" }}
          >
            <Text style={{ fontSize: 15, fontWeight: "700", color: "#1A1A1A" }}>
              Total
            </Text>
            <Text style={{ fontSize: 16, fontWeight: "800", color: PRIMARY }}>
              GH₵ {TOTAL}.00
            </Text>
          </View>
        </View>

        {/* Payment method */}
        <View
          style={{
            backgroundColor: "#fff",
            borderRadius: 20,
            padding: 18,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.06,
            shadowRadius: 8,
            elevation: 2,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <View
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 18,
                  backgroundColor: "#E0F5F3",
                  alignItems: "center",
                  justifyContent: "center",
                  marginRight: 14,
                }}
              >
                <Smartphone size={16} color={PRIMARY} />
              </View>
              <View>
                <Text style={{ fontSize: 12, color: "#888" }}>
                  Payment method
                </Text>
                <Text
                  style={{ fontSize: 13, fontWeight: "700", color: "#1A1A1A" }}
                >
                  {methodLabel}
                </Text>
              </View>
            </View>
            <TouchableOpacity onPress={() => router.back()}>
              <Text style={{ fontSize: 13, color: PRIMARY, fontWeight: "600" }}>
                Change
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Confirm button */}
      <View
        style={{
          position: "absolute",
          bottom: insets.bottom + 16,
          left: 22,
          right: 22,
        }}
      >
        <TouchableOpacity
          onPress={handleConfirm}
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
            Confirm Payment · GH₵ {TOTAL}.00
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
