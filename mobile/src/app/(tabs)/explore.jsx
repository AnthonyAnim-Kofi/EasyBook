import { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Search, MapPin, Star } from "lucide-react-native";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { businessService } from "@/services/business";

const PRIMARY = "#00A896";
const BG = "#F6F4F3";

const categoryFilters = [
  { id: "all", label: "All" },
  { id: "salon", label: "Hair" },
  { id: "beauty", label: "Makeup" },
  { id: "nails", label: "Nails" },
  { id: "spa", label: "Spa" },
];

export default function ExploreScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("All");
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    loadBusinesses();
  }, []);

  const loadBusinesses = async () => {
    setLoading(true);
    try {
      const result = await businessService.list({ sort: 'rating', limit: 20 });
      setBusinesses(result.businesses || []);
    } catch (err) {
      console.log("Error loading businesses:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredPlaces = businesses.filter(biz => {
    // Search filter
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchesName = (biz.name || "").toLowerCase().includes(q);
      const matchesAddress = (biz.address || "").toLowerCase().includes(q);
      if (!matchesName && !matchesAddress) return false;
    }

    // Category filter
    if (activeTab === "All") return true;
    const category = (biz.category || "").toLowerCase();
    const name = (biz.name || "").toLowerCase();
    const tags = (biz.services_tags || []).map(t => t.toLowerCase());

    switch (activeTab) {
      case "Hair":
        return category.includes("salon") || category.includes("barber") || category.includes("hair") || name.includes("salon") || name.includes("barber") || tags.some(t => t.includes("hair"));
      case "Spa":
        return category.includes("spa") || name.includes("spa") || tags.some(t => t.includes("spa"));
      case "Makeup":
        return category.includes("beauty") || category.includes("makeup") || name.includes("beauty") || tags.some(t => t.includes("makeup") || t.includes("beauty"));
      case "Nails":
        return category.includes("nail") || name.includes("nail") || tags.some(t => t.includes("nail"));
      default:
        return true;
    }
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
            value={searchQuery}
            onChangeText={setSearchQuery}
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
          {categoryFilters.map((cat) => (
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
          {loading ? (
            <View style={{ alignItems: "center", paddingTop: 40 }}>
              <ActivityIndicator size="large" color={PRIMARY} />
            </View>
          ) : filteredPlaces.length > 0 ? (
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
                  source={{ uri: place.image_url || "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=600" }}
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
                        {place.address || place.city || "No location"}
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
                        {place.rating || "0.0"}
                      </Text>
                      <Text
                        style={{ fontSize: 12, color: "#AAA", marginLeft: 3 }}
                      >
                        ({place.review_count || 0})
                      </Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <View style={{ alignItems: "center", paddingTop: 40 }}>
              <Text style={{ color: "#AAA", fontSize: 15 }}>No places found</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
