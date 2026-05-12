import { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Camera, Plus, X, MapPin } from "lucide-react-native";
import { Image } from "expo-image";
import BusinessTabBar from "@/components/BusinessTabBar";

const PRIMARY = "#00A896";

const PROMOTIONS = [
  { id: "1", title: "50% off Haircuts", desc: "Valid till 31 May 2026" },
  { id: "2", title: "Free Facial with Spa", desc: "Weekend offer only" },
];

export default function BusinessProfileScreen() {
  const insets = useSafeAreaInsets();
  const [about, setAbout] = useState(
    "Yanks Spa and Salon is a premier beauty destination in Takoradi, Ghana. We offer hair styling, manicures, pedicures, facials, and full body spa treatments.",
  );
  const [promotions, setPromotions] = useState(PROMOTIONS);

  const removePromo = (id) =>
    setPromotions((p) => p.filter((pr) => pr.id !== id));

  return (
    <View style={{ flex: 1, backgroundColor: "#F7F7F7" }}>
      <StatusBar style="dark" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 110 }}
      >
        {/* Top safe area */}
        <View style={{ paddingTop: insets.top + 10 }} />

        {/* Profile header */}
        <View
          style={{
            alignItems: "center",
            paddingHorizontal: 22,
            paddingTop: 20,
            paddingBottom: 24,
            backgroundColor: "#fff",
            borderBottomWidth: 1,
            borderBottomColor: "#F0F0F0",
          }}
        >
          {/* Shop image */}
          <View style={{ position: "relative", marginBottom: 14 }}>
            <View
              style={{
                width: 96,
                height: 96,
                borderRadius: 48,
                borderWidth: 3,
                borderColor: PRIMARY,
                overflow: "hidden",
              }}
            >
              <Image
                source={{
                  uri: "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=300",
                }}
                style={{ width: "100%", height: "100%" }}
                contentFit="cover"
              />
            </View>
            <TouchableOpacity
              style={{
                position: "absolute",
                bottom: 0,
                right: 0,
                width: 30,
                height: 30,
                borderRadius: 15,
                backgroundColor: PRIMARY,
                alignItems: "center",
                justifyContent: "center",
                borderWidth: 2,
                borderColor: "#fff",
              }}
            >
              <Camera size={14} color="#fff" />
            </TouchableOpacity>
          </View>

          {/* Name + location */}
          <Text
            style={{
              fontSize: 22,
              fontWeight: "800",
              color: "#1A1A1A",
              marginBottom: 4,
            }}
          >
            Yanks Spa
          </Text>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 18,
            }}
          >
            <MapPin size={14} color="#888" />
            <Text style={{ fontSize: 13, color: "#888", marginLeft: 4 }}>
              Takoradi, Ghana
            </Text>
          </View>

          {/* Edit profile button */}
          <TouchableOpacity
            style={{
              borderWidth: 2,
              borderColor: PRIMARY,
              borderRadius: 30,
              paddingVertical: 12,
              paddingHorizontal: 48,
              alignItems: "center",
            }}
          >
            <Text style={{ fontSize: 15, fontWeight: "700", color: PRIMARY }}>
              Edit profile
            </Text>
          </TouchableOpacity>
        </View>

        <View style={{ paddingHorizontal: 22, paddingTop: 24 }}>
          {/* About My Shop */}
          <Text
            style={{
              fontSize: 16,
              fontWeight: "700",
              color: "#1A1A1A",
              marginBottom: 10,
            }}
          >
            About My Shop
          </Text>
          <TextInput
            value={about}
            onChangeText={setAbout}
            multiline
            style={{
              backgroundColor: "#fff",
              borderRadius: 16,
              padding: 16,
              fontSize: 14,
              color: "#555",
              lineHeight: 22,
              minHeight: 110,
              textAlignVertical: "top",
              borderWidth: 1.5,
              borderColor: "#EEEEEE",
              marginBottom: 28,
            }}
          />

          {/* Promotions & Offers */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 14,
            }}
          >
            <Text style={{ fontSize: 16, fontWeight: "700", color: "#1A1A1A" }}>
              Promotions & Offers
            </Text>
            <TouchableOpacity
              style={{
                width: 32,
                height: 32,
                borderRadius: 16,
                backgroundColor: PRIMARY,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Plus size={16} color="#fff" />
            </TouchableOpacity>
          </View>

          {promotions.map((promo) => (
            <View
              key={promo.id}
              style={{
                backgroundColor: "#fff",
                borderRadius: 16,
                padding: 16,
                marginBottom: 10,
                flexDirection: "row",
                alignItems: "center",
                borderWidth: 1.5,
                borderColor: "#EEEEEE",
              }}
            >
              <View
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: 5,
                  backgroundColor: PRIMARY,
                  marginRight: 12,
                }}
              />
              <View style={{ flex: 1 }}>
                <Text
                  style={{ fontSize: 14, fontWeight: "700", color: "#1A1A1A" }}
                >
                  {promo.title}
                </Text>
                <Text style={{ fontSize: 12, color: "#888", marginTop: 2 }}>
                  {promo.desc}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => removePromo(promo.id)}
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 14,
                  backgroundColor: "#FFE5E5",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <X size={13} color="#D63031" />
              </TouchableOpacity>
            </View>
          ))}

          {/* Empty promo slots */}
          {[...Array(Math.max(0, 2 - promotions.length))].map((_, i) => (
            <View
              key={`empty-${i}`}
              style={{
                backgroundColor: "#F5F5F5",
                borderRadius: 16,
                height: 64,
                marginBottom: 10,
                borderWidth: 1.5,
                borderColor: "#EEEEEE",
                borderStyle: "dashed",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text
                style={{ fontSize: 13, color: "#BBBBBB", fontWeight: "600" }}
              >
                + Add promotion
              </Text>
            </View>
          ))}

          {/* Save Changes */}
          <TouchableOpacity
            style={{
              backgroundColor: PRIMARY,
              borderRadius: 30,
              paddingVertical: 17,
              alignItems: "center",
              marginTop: 20,
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
              Save Changes
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <BusinessTabBar active="Profile" />
    </View>
  );
}
