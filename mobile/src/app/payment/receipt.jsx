import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { ArrowLeft, Share2, CheckCircle } from "lucide-react-native";
import { useRouter, useLocalSearchParams } from "expo-router";

const PRIMARY = "#00A896";
const SERVICE_PRICE = 150;
const TAX = 18;

function QRCode() {
  // Decorative barcode-style visual
  const bars = [
    6, 3, 8, 2, 5, 7, 3, 6, 4, 8, 2, 5, 7, 3, 6, 4, 8, 3, 5, 7, 2, 6, 4, 8, 3,
    5,
  ];
  return (
    <View style={{ alignItems: "center", marginVertical: 20 }}>
      {/* QR border */}
      <View
        style={{
          borderWidth: 3,
          borderColor: "#1A1A1A",
          borderRadius: 16,
          padding: 10,
          backgroundColor: "#fff",
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "flex-end",
            height: 60,
            gap: 2,
          }}
        >
          {bars.map((h, i) => (
            <View
              key={i}
              style={{
                width: 5,
                height: h * 6,
                backgroundColor: "#1A1A1A",
                borderRadius: 2,
              }}
            />
          ))}
        </View>
        <Text
          style={{
            fontSize: 10,
            color: "#888",
            textAlign: "center",
            marginTop: 6,
            letterSpacing: 2,
          }}
        >
          EZBK-{Date.now().toString().slice(-8)}
        </Text>
      </View>
    </View>
  );
}

export default function ReceiptScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();
  const total = params.total || "168";

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
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <TouchableOpacity
            onPress={() => router.back()}
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: "#F5F5F5",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <ArrowLeft size={20} color="#1A1A1A" />
          </TouchableOpacity>
          <Text style={{ fontSize: 17, fontWeight: "700", color: "#1A1A1A" }}>
            E-Receipt
          </Text>
          <TouchableOpacity
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: "#F5F5F5",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Share2 size={18} color="#1A1A1A" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          padding: 22,
          paddingBottom: insets.bottom + 110,
        }}
      >
        {/* Receipt card */}
        <View
          style={{
            backgroundColor: "#fff",
            borderRadius: 24,
            overflow: "hidden",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.1,
            shadowRadius: 16,
            elevation: 5,
          }}
        >
          {/* Header stripe */}
          <View
            style={{
              backgroundColor: PRIMARY,
              paddingVertical: 22,
              alignItems: "center",
            }}
          >
            <View
              style={{
                width: 52,
                height: 52,
                borderRadius: 26,
                backgroundColor: "#fff",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 10,
              }}
            >
              <CheckCircle size={28} color={PRIMARY} />
            </View>
            <Text style={{ fontSize: 18, fontWeight: "800", color: "#fff" }}>
              Payment Receipt
            </Text>
            <Text
              style={{
                fontSize: 13,
                color: "rgba(255,255,255,0.75)",
                marginTop: 4,
              }}
            >
              EasyBook
            </Text>
          </View>

          {/* Scalloped edge effect */}
          <View style={{ flexDirection: "row", marginHorizontal: -1 }}>
            {Array.from({ length: 20 }).map((_, i) => (
              <View key={i} style={{ flex: 1, height: 12, borderRadius: 0 }}>
                <View
                  style={{
                    width: 16,
                    height: 16,
                    borderRadius: 8,
                    backgroundColor: "#F7F7F7",
                    alignSelf: "center",
                    marginTop: -8,
                  }}
                />
              </View>
            ))}
          </View>

          <View style={{ paddingHorizontal: 22, paddingBottom: 22 }}>
            {/* Barcode */}
            <QRCode />

            {/* Amount */}
            <View style={{ alignItems: "center", marginBottom: 20 }}>
              <Text style={{ fontSize: 13, color: "#888" }}>Total Paid</Text>
              <Text style={{ fontSize: 36, fontWeight: "800", color: PRIMARY }}>
                GH₵ {total}.00
              </Text>
            </View>

            {/* Divider */}
            <View
              style={{
                height: 1,
                backgroundColor: "#F0F0F0",
                marginBottom: 18,
              }}
            />

            {/* Details */}
            {[
              { label: "Salon", value: params.salon || "Yanks Spa and Salon" },
              { label: "Service", value: params.service || "Classic Haircut" },
              { label: "Specialist", value: params.specialist || "Lily" },
              { label: "Date", value: params.date || "—" },
              { label: "Time", value: params.time || "—" },
              {
                label: "Payment",
                value:
                  params.method === "momo" || params.method === "Mobile Money"
                    ? `Mobile Money · ${params.network || "MTN"}`
                    : params.method || "Mobile Money",
              },
              { label: "Transaction ID", value: params.txId || "TXN-00000000" },
            ].map((row, i) => (
              <View
                key={i}
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  paddingVertical: 8,
                }}
              >
                <Text style={{ fontSize: 13, color: "#888" }}>{row.label}</Text>
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: "600",
                    color: "#1A1A1A",
                    maxWidth: "55%",
                    textAlign: "right",
                  }}
                >
                  {row.value}
                </Text>
              </View>
            ))}

            <View
              style={{
                height: 1,
                backgroundColor: "#F0F0F0",
                marginVertical: 14,
              }}
            />

            {/* Price breakdown */}
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                marginBottom: 6,
              }}
            >
              <Text style={{ fontSize: 13, color: "#888" }}>Service fee</Text>
              <Text style={{ fontSize: 13, color: "#1A1A1A" }}>
                GH₵ {SERVICE_PRICE}.00
              </Text>
            </View>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                marginBottom: 12,
              }}
            >
              <Text style={{ fontSize: 13, color: "#888" }}>Tax (12%)</Text>
              <Text style={{ fontSize: 13, color: "#1A1A1A" }}>
                GH₵ {TAX}.00
              </Text>
            </View>
            <View
              style={{ flexDirection: "row", justifyContent: "space-between" }}
            >
              <Text
                style={{ fontSize: 15, fontWeight: "700", color: "#1A1A1A" }}
              >
                Total
              </Text>
              <Text style={{ fontSize: 15, fontWeight: "800", color: PRIMARY }}>
                GH₵ {total}.00
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Share button */}
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
          style={{
            flex: 1,
            backgroundColor: "#E0F5F3",
            borderRadius: 30,
            paddingVertical: 16,
            alignItems: "center",
          }}
        >
          <Text style={{ color: PRIMARY, fontSize: 15, fontWeight: "700" }}>
            Share Receipt
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => router.replace("/(tabs)/home")}
          style={{
            flex: 1,
            backgroundColor: PRIMARY,
            borderRadius: 30,
            paddingVertical: 16,
            alignItems: "center",
          }}
        >
          <Text style={{ color: "#fff", fontSize: 15, fontWeight: "700" }}>
            Done
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
