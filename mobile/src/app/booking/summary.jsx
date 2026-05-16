import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { ArrowLeft, MapPin, Clock, Calendar, ShieldCheck, Phone, MessageSquare } from "lucide-react-native";
import { Image } from "expo-image";
import { useRouter, useLocalSearchParams } from "expo-router";

const PRIMARY = "#00A896";
const BG = "#F7F7F7";

export default function BookingSummaryScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams();

  return (
    <View style={{ flex: 1, backgroundColor: BG }}>
      <StatusBar style="dark" />
      
      {/* Header */}
      <View style={{ 
        backgroundColor: "#fff", 
        paddingTop: insets.top + 12, 
        paddingHorizontal: 22, 
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#F0F0F0",
        flexDirection: "row",
        alignItems: "center"
      }}>
        <TouchableOpacity 
          onPress={() => router.back()}
          style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: "#F5F5F5", alignItems: "center", justifyContent: "center", marginRight: 14 }}
        >
          <ArrowLeft size={20} color="#1A1A1A" />
        </TouchableOpacity>
        <Text style={{ fontSize: 17, fontWeight: "700", color: "#1A1A1A" }}>Booking Details</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 22, paddingBottom: insets.bottom + 40 }}>
        {/* Status Card */}
        <View style={{ backgroundColor: "#fff", borderRadius: 24, padding: 24, alignItems: "center", marginBottom: 20, shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 12, elevation: 3 }}>
          <View style={{ width: 60, height: 60, borderRadius: 30, backgroundColor: "#E0F5F3", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
            <ShieldCheck size={32} color={PRIMARY} />
          </View>
          <Text style={{ fontSize: 18, fontWeight: "800", color: "#1A1A1A", marginBottom: 4 }}>Booking Confirmed</Text>
          <Text style={{ fontSize: 14, color: "#888" }}>ID: #EB-{Math.floor(Math.random() * 10000)}</Text>
        </View>

        {/* Business Info */}
        <View style={{ backgroundColor: "#fff", borderRadius: 24, padding: 20, marginBottom: 20 }}>
          <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 20 }}>
            <Image 
              source={{ uri: params.image || "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=200" }} 
              style={{ width: 60, height: 60, borderRadius: 16 }}
              contentFit="cover"
            />
            <View style={{ marginLeft: 16, flex: 1 }}>
              <Text style={{ fontSize: 16, fontWeight: "800", color: "#1A1A1A" }}>{params.salon || "Kofi's Spa"}</Text>
              <View style={{ flexDirection: "row", alignItems: "center", marginTop: 4 }}>
                <MapPin size={13} color="#999" />
                <Text style={{ fontSize: 13, color: "#888", marginLeft: 4 }}>{params.location || "Kwabenya, Accra"}</Text>
              </View>
            </View>
          </View>

          <View style={{ height: 1, backgroundColor: "#F0F0F0", marginBottom: 20 }} />

          <View style={{ gap: 16 }}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: "#F5F5F5", alignItems: "center", justifyContent: "center", marginRight: 12 }}>
                <Calendar size={18} color="#555" />
              </View>
              <View>
                <Text style={{ fontSize: 12, color: "#AAA", fontWeight: "600" }}>DATE</Text>
                <Text style={{ fontSize: 14, fontWeight: "700", color: "#1A1A1A" }}>{params.date || "Mon, 13 May 2026"}</Text>
              </View>
            </View>

            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: "#F5F5F5", alignItems: "center", justifyContent: "center", marginRight: 12 }}>
                <Clock size={18} color="#555" />
              </View>
              <View>
                <Text style={{ fontSize: 12, color: "#AAA", fontWeight: "600" }}>TIME</Text>
                <Text style={{ fontSize: 14, fontWeight: "700", color: "#1A1A1A" }}>{params.time || "10:00 AM"}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={{ flexDirection: "row", gap: 12 }}>
          <TouchableOpacity 
            style={{ flex: 1, height: 56, borderRadius: 28, backgroundColor: "#fff", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, borderWidth: 1.5, borderColor: "#E8E8E8" }}
          >
            <Phone size={18} color="#1A1A1A" />
            <Text style={{ fontSize: 15, fontWeight: "700", color: "#1A1A1A" }}>Call</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            onPress={() => router.push({ pathname: "/business/message", params: { id: params.ownerId, name: params.salon, avatar: params.image } })}
            style={{ flex: 1, height: 56, borderRadius: 28, backgroundColor: PRIMARY, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 }}
          >
            <MessageSquare size={18} color="#fff" />
            <Text style={{ fontSize: 15, fontWeight: "700", color: "#fff" }}>Chat</Text>
          </TouchableOpacity>
        </View>

        {/* Cancel Button */}
        <TouchableOpacity style={{ marginTop: 20, alignItems: "center" }}>
          <Text style={{ fontSize: 14, fontWeight: "700", color: "#FF4757" }}>Cancel Appointment</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
