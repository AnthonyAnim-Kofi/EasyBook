import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import {
  ArrowLeft,
  CalendarCheck,
  Clock,
  Scissors,
  Smartphone,
  MessageCircle,
} from "lucide-react-native";
import { Image } from "expo-image";
import { useRouter, useLocalSearchParams } from "expo-router";

const PRIMARY = "#00A896";

export default function BusinessBookingDetailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();

  const customer = params.customer || "Andy Coleman";
  const avatar =
    params.avatar ||
    "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=200";
  const charge = params.charge || "GH₵ 150";
  const specialist = params.specialist || "Jayden";
  const date = params.date || "13 May 2026";
  const time = params.time || "10:00 AM";

  const SERVICE_PRICE = 150;
  const TAX = 18;

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
            Booking Details
          </Text>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          padding: 22,
          paddingBottom: insets.bottom + 120,
        }}
      >
        {/* Customer info card */}
        <View
          style={{
            backgroundColor: "#fff",
            borderRadius: 20,
            padding: 18,
            marginBottom: 16,
            flexDirection: "row",
            alignItems: "center",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.06,
            shadowRadius: 8,
            elevation: 2,
          }}
        >
          <Image
            source={{ uri: avatar }}
            style={{
              width: 70,
              height: 70,
              borderRadius: 35,
              borderWidth: 3,
              borderColor: PRIMARY,
            }}
            contentFit="cover"
          />
          <View style={{ marginLeft: 16, flex: 1 }}>
            <Text
              style={{
                fontSize: 18,
                fontWeight: "800",
                color: "#1A1A1A",
                marginBottom: 4,
              }}
            >
              {customer}
            </Text>
            <Text style={{ fontSize: 13, color: "#888", marginBottom: 8 }}>
              Customer
            </Text>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <CalendarCheck size={13} color={PRIMARY} />
              <Text
                style={{
                  fontSize: 13,
                  color: PRIMARY,
                  fontWeight: "600",
                  marginLeft: 5,
                }}
              >
                {date} · {time}
              </Text>
            </View>
          </View>
        </View>

        {/* Service details */}
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
            Service Details
          </Text>

          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              paddingVertical: 10,
              borderBottomWidth: 1,
              borderBottomColor: "#F5F5F5",
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
                  marginRight: 12,
                }}
              >
                <Scissors size={16} color={PRIMARY} />
              </View>
              <View>
                <Text
                  style={{ fontSize: 14, fontWeight: "700", color: "#1A1A1A" }}
                >
                  Classic Haircut
                </Text>
                <Text style={{ fontSize: 12, color: "#888" }}>30 mins</Text>
              </View>
            </View>
            <Text style={{ fontSize: 14, fontWeight: "800", color: PRIMARY }}>
              GH₵ {SERVICE_PRICE}.00
            </Text>
          </View>

          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              paddingVertical: 10,
              borderBottomWidth: 1,
              borderBottomColor: "#F5F5F5",
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
                  marginRight: 12,
                }}
              >
                <Clock size={16} color={PRIMARY} />
              </View>
              <View>
                <Text
                  style={{ fontSize: 14, fontWeight: "700", color: "#1A1A1A" }}
                >
                  Tax (12%)
                </Text>
              </View>
            </View>
            <Text style={{ fontSize: 14, fontWeight: "700", color: "#555" }}>
              GH₵ {TAX}.00
            </Text>
          </View>

          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              paddingTop: 14,
            }}
          >
            <Text style={{ fontSize: 15, fontWeight: "700", color: "#1A1A1A" }}>
              Total
            </Text>
            <Text style={{ fontSize: 16, fontWeight: "800", color: PRIMARY }}>
              GH₵ {SERVICE_PRICE + TAX}.00
            </Text>
          </View>
        </View>

        {/* Specialist requested */}
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
              marginBottom: 14,
            }}
          >
            Specialist Requested
          </Text>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Image
              source={{
                uri: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150",
              }}
              style={{
                width: 48,
                height: 48,
                borderRadius: 24,
                borderWidth: 2,
                borderColor: PRIMARY,
              }}
              contentFit="cover"
            />
            <View style={{ marginLeft: 14 }}>
              <Text
                style={{ fontSize: 15, fontWeight: "700", color: "#1A1A1A" }}
              >
                {specialist}
              </Text>
              <Text style={{ fontSize: 13, color: "#888" }}>Barber</Text>
            </View>
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
          <Text
            style={{
              fontSize: 15,
              fontWeight: "700",
              color: "#1A1A1A",
              marginBottom: 14,
            }}
          >
            Payment Method
          </Text>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
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
              <Smartphone size={18} color={PRIMARY} />
            </View>
            <View>
              <Text
                style={{ fontSize: 14, fontWeight: "700", color: "#1A1A1A" }}
              >
                Mobile Money
              </Text>
              <Text style={{ fontSize: 12, color: "#888" }}>
                MTN · +233 24x xxx xxxx
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Bottom action buttons */}
      <View
        style={{
          position: "absolute",
          bottom: insets.bottom + 16,
          left: 22,
          right: 22,
          flexDirection: "row",
          gap: 12,
        }}
      >
        <TouchableOpacity
          onPress={() =>
            router.push({
              pathname: "/business/message",
              params: { name: customer, avatar },
            })
          }
          style={{
            flex: 1,
            borderWidth: 2,
            borderColor: PRIMARY,
            borderRadius: 30,
            paddingVertical: 16,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
          }}
        >
          <MessageCircle size={16} color={PRIMARY} />
          <Text style={{ color: PRIMARY, fontSize: 14, fontWeight: "700" }}>
            Message
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={{
            flex: 1.5,
            backgroundColor: PRIMARY,
            borderRadius: 30,
            paddingVertical: 16,
            alignItems: "center",
            shadowColor: PRIMARY,
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.3,
            shadowRadius: 12,
            elevation: 5,
          }}
        >
          <Text style={{ color: "#fff", fontSize: 14, fontWeight: "700" }}>
            Accept Booking
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
