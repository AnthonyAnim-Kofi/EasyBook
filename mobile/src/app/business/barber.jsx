import { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { ArrowLeft, Star, MapPin, CheckCircle } from "lucide-react-native";
import { Image } from "expo-image";
import { useRouter, useLocalSearchParams } from "expo-router";

const PRIMARY = "#00A896";
const { width } = Dimensions.get("window");

const services = [
  { id: "1", name: "Haircut", duration: "30 mins", price: "GH₵ 50" },
  { id: "2", name: "Shave & Trim", duration: "20 mins", price: "GH₵ 35" },
  { id: "3", name: "Full Styling", duration: "60 mins", price: "GH₵ 90" },
  { id: "4", name: "Beard Grooming", duration: "25 mins", price: "GH₵ 40" },
];

const gallery = [
  "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=300",
  "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=300",
  "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=300",
  "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300",
  "https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=300",
  "https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=300",
];

const reviews = [
  {
    id: "1",
    name: "Kwame A.",
    rating: 5,
    comment: "Best barber in Accra! Jayden is super talented.",
    avatar:
      "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100",
  },
  {
    id: "2",
    name: "Kojo D.",
    rating: 4,
    comment: "Great fade every time, very consistent quality.",
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100",
  },
];

export default function BarberDetailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();
  const [selectedService, setSelectedService] = useState(null);

  const name = params.name || "Jayden";
  const role = params.role || "Barber";
  const salon = params.salon || "Yanks Spa and Salon";
  const rating = params.rating || "4.8";

  return (
    <View style={{ flex: 1, backgroundColor: "#F7F7F7" }}>
      <StatusBar style="light" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 110 }}
      >
        {/* Teal header */}
        <View
          style={{
            backgroundColor: PRIMARY,
            paddingTop: insets.top,
            paddingBottom: 70,
            paddingHorizontal: 22,
            position: "relative",
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 0,
              paddingTop: 16,
            }}
          >
            <TouchableOpacity
              onPress={() => router.back()}
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: "rgba(255,255,255,0.2)",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <ArrowLeft size={20} color="#fff" />
            </TouchableOpacity>
            <Text style={{ fontSize: 17, fontWeight: "700", color: "#fff" }}>
              Specialist Profile
            </Text>
            <View style={{ width: 40 }} />
          </View>
        </View>

        {/* Profile card floating over header */}
        <View
          style={{
            marginHorizontal: 22,
            marginTop: -50,
            backgroundColor: "#fff",
            borderRadius: 24,
            padding: 20,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.1,
            shadowRadius: 14,
            elevation: 6,
            alignItems: "center",
            marginBottom: 20,
          }}
        >
          <Image
            source={{
              uri: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=300",
            }}
            style={{
              width: 90,
              height: 90,
              borderRadius: 45,
              borderWidth: 3,
              borderColor: PRIMARY,
              marginBottom: 12,
            }}
            contentFit="cover"
          />
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 6,
              marginBottom: 4,
            }}
          >
            <Text style={{ fontSize: 20, fontWeight: "800", color: "#1A1A1A" }}>
              {name}
            </Text>
            <CheckCircle size={18} color={PRIMARY} fill="#E0F5F3" />
          </View>
          <Text style={{ fontSize: 14, color: "#888", marginBottom: 8 }}>
            {role}
          </Text>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 14,
            }}
          >
            <MapPin size={13} color="#999" />
            <Text style={{ fontSize: 13, color: "#888", marginLeft: 4 }}>
              {salon}
            </Text>
          </View>
          <View style={{ flexDirection: "row", gap: 24 }}>
            <View style={{ alignItems: "center" }}>
              <Text
                style={{ fontSize: 18, fontWeight: "800", color: "#1A1A1A" }}
              >
                {rating}
              </Text>
              <View style={{ flexDirection: "row" }}>
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} size={12} color="#FFD93D" fill="#FFD93D" />
                ))}
              </View>
            </View>
            <View style={{ width: 1, backgroundColor: "#EEE" }} />
            <View style={{ alignItems: "center" }}>
              <Text
                style={{ fontSize: 18, fontWeight: "800", color: "#1A1A1A" }}
              >
                89
              </Text>
              <Text style={{ fontSize: 12, color: "#888" }}>Clients</Text>
            </View>
            <View style={{ width: 1, backgroundColor: "#EEE" }} />
            <View style={{ alignItems: "center" }}>
              <Text
                style={{ fontSize: 18, fontWeight: "800", color: "#1A1A1A" }}
              >
                3yr
              </Text>
              <Text style={{ fontSize: 12, color: "#888" }}>Exp.</Text>
            </View>
          </View>
        </View>

        {/* Gallery */}
        <View style={{ paddingHorizontal: 22, marginBottom: 24 }}>
          <Text
            style={{
              fontSize: 16,
              fontWeight: "700",
              color: "#1A1A1A",
              marginBottom: 12,
            }}
          >
            Gallery
          </Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
            {gallery.map((img, i) => (
              <Image
                key={i}
                source={{ uri: img }}
                style={{
                  width: (width - 56) / 3,
                  height: (width - 56) / 3,
                  borderRadius: 12,
                }}
                contentFit="cover"
              />
            ))}
          </View>
        </View>

        {/* Services */}
        <View style={{ paddingHorizontal: 22, marginBottom: 24 }}>
          <Text
            style={{
              fontSize: 16,
              fontWeight: "700",
              color: "#1A1A1A",
              marginBottom: 12,
            }}
          >
            Services
          </Text>
          {services.map((svc) => (
            <TouchableOpacity
              key={svc.id}
              onPress={() => setSelectedService(svc.id)}
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                backgroundColor:
                  selectedService === svc.id ? "#E0F5F3" : "#fff",
                borderRadius: 16,
                padding: 16,
                marginBottom: 10,
                borderWidth: 1.5,
                borderColor: selectedService === svc.id ? PRIMARY : "#F0F0F0",
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.04,
                shadowRadius: 4,
                elevation: 1,
              }}
            >
              <View>
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: "700",
                    color: "#1A1A1A",
                    marginBottom: 3,
                  }}
                >
                  {svc.name}
                </Text>
                <Text style={{ fontSize: 12, color: "#888" }}>
                  {svc.duration}
                </Text>
              </View>
              <View
                style={{ flexDirection: "row", alignItems: "center", gap: 12 }}
              >
                <Text
                  style={{ fontSize: 15, fontWeight: "800", color: PRIMARY }}
                >
                  {svc.price}
                </Text>
                {selectedService === svc.id && (
                  <CheckCircle size={20} color={PRIMARY} />
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Reviews */}
        <View style={{ paddingHorizontal: 22 }}>
          <Text
            style={{
              fontSize: 16,
              fontWeight: "700",
              color: "#1A1A1A",
              marginBottom: 12,
            }}
          >
            Reviews
          </Text>
          {reviews.map((r) => (
            <View
              key={r.id}
              style={{
                backgroundColor: "#fff",
                borderRadius: 16,
                padding: 16,
                marginBottom: 12,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.04,
                shadowRadius: 4,
                elevation: 1,
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginBottom: 8,
                }}
              >
                <Image
                  source={{ uri: r.avatar }}
                  style={{ width: 38, height: 38, borderRadius: 19 }}
                  contentFit="cover"
                />
                <View style={{ marginLeft: 10 }}>
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: "700",
                      color: "#1A1A1A",
                    }}
                  >
                    {r.name}
                  </Text>
                  <View style={{ flexDirection: "row" }}>
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star
                        key={i}
                        size={11}
                        color="#FFD93D"
                        fill={i <= r.rating ? "#FFD93D" : "transparent"}
                      />
                    ))}
                  </View>
                </View>
              </View>
              <Text style={{ fontSize: 13, color: "#555", lineHeight: 20 }}>
                {r.comment}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Book button */}
      <View
        style={{
          position: "absolute",
          bottom: insets.bottom + 14,
          left: 22,
          right: 22,
        }}
      >
        <TouchableOpacity
          onPress={() =>
            router.push({
              pathname: "/booking/date",
              params: {
                salon,
                service: selectedService
                  ? services.find((s) => s.id === selectedService)?.name
                  : "Haircut",
                specialist: name,
              },
            })
          }
          style={{
            backgroundColor: PRIMARY,
            borderRadius: 30,
            paddingVertical: 17,
            alignItems: "center",
            shadowColor: PRIMARY,
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.35,
            shadowRadius: 12,
            elevation: 6,
          }}
        >
          <Text style={{ color: "#fff", fontSize: 16, fontWeight: "700" }}>
            Book {name}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
