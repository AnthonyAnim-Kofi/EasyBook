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
import { Search, MapPin, Star } from "lucide-react-native";
import { Image } from "expo-image";
import { useRouter } from "expo-router";

const PRIMARY = "#00A896";
const BG = "#F6F4F3";

const categories = [
  { id: "1", label: "All", active: true },
  { id: "2", label: "Hair", active: false },
  { id: "3", label: "Makeup", active: false },
  { id: "4", label: "Nails", active: false },
  { id: "5", label: "Spa", active: false },
];

const places = [
  {
    id: "1",
    name: "Yanks Spa and Salon",
    location: "Kwabenya, Accra",
    rating: 4.5,
    reviews: "1k+",
    image: "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=600",
  },
  {
    id: "2",
    name: "Magnus Spa",
    location: "Accra, Ghana",
    rating: 4.8,
    reviews: "820",
    image: "https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=600",
  },
  {
    id: "3",
    name: "Elite Cuts Barber",
    location: "Kumasi, Ghana",
    rating: 4.7,
    reviews: "340",
    image: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=600",
  },
  {
    id: "4",
    name: "Luxe Beauty Studio",
    location: "Accra, Ghana",
    rating: 4.6,
    reviews: "210",
    image: "https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=600",
  },
];

export default function ExploreScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("All");

  const filteredPlaces = activeTab === "All" 
    ? places 
    : places.filter(p => {
        if (activeTab === "Hair") return p.name.toLowerCase().includes("barber") || p.name.toLowerCase().includes("salon");
        if (activeTab === "Spa") return p.name.toLowerCase().includes("spa");
        if (activeTab === "Makeup") return p.name.toLowerCase().includes("beauty");
        if (activeTab === "Nails") return p.name.toLowerCase().includes("beauty") || p.name.toLowerCase().includes("salon");
        return true;
      });

  return (
    <View style={{ flex: 1, backgroundColor: BG }}>
      <StatusBar style="light" />
      <View
        style={{
          backgroundColor: PRIMARY,
          paddingTop: insets.top + 16,
          paddingHorizontal: 22,
          paddingBottom: 28,
        }}
      >
        <Text
          style={{
            fontSize: 22,
            fontWeight: "800",
            color: "#fff",
            marginBottom: 4,
          }}
        >
          Explore
        </Text>
        <Text
          style={{
            fontSize: 13,
            color: "rgba(255,255,255,0.7)",
            marginBottom: 16,
          }}
        >
          Find beauty services near you
        </Text>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: "#fff",
            borderRadius: 14,
            paddingHorizontal: 14,
          }}
        >
          <Search size={18} color="#BBBBBB" />
          <TextInput
            placeholder="Search salons, services..."
            placeholderTextColor="#BBBBBB"
            style={{
              flex: 1,
              paddingVertical: 13,
              paddingHorizontal: 10,
              fontSize: 14,
              color: "#1A1A1A",
            }}
          />
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 80 }}
      >
        {/* Category chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 22,
            paddingVertical: 16,
            gap: 10,
          }}
        >
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              onPress={() => setActiveTab(cat.label)}
              style={{
                paddingHorizontal: 18,
                paddingVertical: 9,
                borderRadius: 20,
                backgroundColor: activeTab === cat.label ? PRIMARY : "#fff",
                borderWidth: 1.5,
                borderColor: activeTab === cat.label ? PRIMARY : "#E8E8E8",
              }}
            >
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: "600",
                  color: activeTab === cat.label ? "#fff" : "#666",
                }}
              >
                {cat.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={{ paddingHorizontal: 22 }}>
          {filteredPlaces.length > 0 ? (
            filteredPlaces.map((place) => (
              <TouchableOpacity
                key={place.id}
                onPress={() =>
                  router.push({
                    pathname: "/business/detail",
                    params: { id: place.id, name: place.name },
                  })
                }
                style={{
                  backgroundColor: "#fff",
                  borderRadius: 20,
                  marginBottom: 16,
                  overflow: "hidden",
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.06,
                  shadowRadius: 8,
                  elevation: 2,
                }}
              >
                <Image
                  source={{ uri: place.image }}
                  style={{ width: "100%", height: 150 }}
                  contentFit="cover"
                />
                <View style={{ padding: 16 }}>
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: "700",
                      color: "#1A1A1A",
                      marginBottom: 4,
                    }}
                  >
                    {place.name}
                  </Text>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <View style={{ flexDirection: "row", alignItems: "center" }}>
                      <MapPin size={13} color="#999" />
                      <Text
                        style={{ fontSize: 12, color: "#888", marginLeft: 4 }}
                      >
                        {place.location}
                      </Text>
                    </View>
                    <View style={{ flexDirection: "row", alignItems: "center" }}>
                      <Star size={13} color="#FFD93D" fill="#FFD93D" />
                      <Text
                        style={{
                          fontSize: 13,
                          fontWeight: "700",
                          color: "#1A1A1A",
                          marginLeft: 4,
                        }}
                      >
                        {place.rating}
                      </Text>
                      <Text
                        style={{ fontSize: 12, color: "#AAA", marginLeft: 3 }}
                      >
                        ({place.reviews})
                      </Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <View style={{ alignItems: "center", paddingTop: 40 }}>
              <Text style={{ color: "#AAA", fontSize: 15 }}>No places found in this category</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
