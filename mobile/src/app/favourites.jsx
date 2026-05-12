import { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, Modal } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import {
  Menu,
  Search,
  MapPin,
  Star,
  Heart,
  ChevronRight,
  X,
} from "lucide-react-native";
import { Image } from "expo-image";
import { useRouter } from "expo-router";

const PRIMARY = "#00A896";
const BG = "#FFF5F3";

const SORT_OPTIONS = ["Most Visited", "Date Added", "Highest Rated", "Nearest"];

const initialFavourites = [
  {
    id: "1",
    name: "Yanks Spa and Salon",
    location: "Takoradi, Ghana",
    rating: 3.0,
    reviews: "1k+",
    type: "Spa & Salon",
    image: "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400",
  },
  {
    id: "2",
    name: "Magnus Spa",
    location: "Kwabenya, Accra",
    rating: 4.8,
    reviews: "820",
    type: "Spa",
    image: "https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=400",
  },
  {
    id: "3",
    name: "Elite Cuts Barber",
    location: "Kumasi, Ghana",
    rating: 4.7,
    reviews: "340",
    type: "Barber Shop",
    image: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=400",
  },
  {
    id: "4",
    name: "Sister Yaa's Spa",
    location: "Kasoa, Accra",
    rating: 4.6,
    reviews: "210",
    type: "Spa",
    image: "https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=400",
  },
];

export default function FavouritesScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [favourites, setFavourites] = useState(initialFavourites);
  const [sortVisible, setSortVisible] = useState(false);
  const [sortBy, setSortBy] = useState("Most Visited");

  const handleUnfavourite = (id) =>
    setFavourites((prev) => prev.filter((f) => f.id !== id));

  return (
    <View style={{ flex: 1, backgroundColor: BG }}>
      <StatusBar style="dark" />

      {/* Header */}
      <View
        style={{
          backgroundColor: BG,
          paddingTop: insets.top + 16,
          paddingHorizontal: 22,
          paddingBottom: 12,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <TouchableOpacity
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: "#fff",
            alignItems: "center",
            justifyContent: "center",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.06,
            shadowRadius: 4,
            elevation: 1,
          }}
        >
          <Menu size={20} color="#1A1A1A" />
        </TouchableOpacity>
        <Text style={{ fontSize: 18, fontWeight: "800", color: "#1A1A1A" }}>
          Favourites
        </Text>
        <TouchableOpacity
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: "#fff",
            alignItems: "center",
            justifyContent: "center",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.06,
            shadowRadius: 4,
            elevation: 1,
          }}
        >
          <Search size={18} color="#1A1A1A" />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 22,
          paddingBottom: insets.bottom + 90,
        }}
      >
        {/* Sort by */}
        <TouchableOpacity
          onPress={() => setSortVisible(true)}
          style={{
            backgroundColor: "#fff",
            borderRadius: 16,
            padding: 16,
            marginBottom: 20,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.05,
            shadowRadius: 5,
            elevation: 1,
          }}
        >
          <View>
            <Text style={{ fontSize: 12, color: "#AAA", marginBottom: 2 }}>
              Sort by
            </Text>
            <Text style={{ fontSize: 14, fontWeight: "700", color: "#1A1A1A" }}>
              {sortBy}
            </Text>
          </View>
          <ChevronRight size={18} color="#CCC" />
        </TouchableOpacity>

        {/* List */}
        {favourites.map((item) => (
          <TouchableOpacity
            key={item.id}
            onPress={() =>
              router.push({
                pathname: "/business/detail",
                params: { id: item.id, name: item.name },
              })
            }
            style={{
              backgroundColor: "#fff",
              borderRadius: 20,
              marginBottom: 14,
              flexDirection: "row",
              alignItems: "center",
              padding: 14,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.06,
              shadowRadius: 8,
              elevation: 2,
            }}
          >
            {/* Circular image */}
            <Image
              source={{ uri: item.image }}
              style={{ width: 68, height: 68, borderRadius: 34 }}
              contentFit="cover"
            />

            <View style={{ flex: 1, marginLeft: 14 }}>
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "800",
                  color: "#1A1A1A",
                  marginBottom: 3,
                }}
              >
                {item.name}
              </Text>

              {/* Type badge */}
              <View
                style={{
                  alignSelf: "flex-start",
                  backgroundColor: "#E0F5F3",
                  borderRadius: 20,
                  paddingHorizontal: 9,
                  paddingVertical: 3,
                  marginBottom: 6,
                }}
              >
                <Text
                  style={{ fontSize: 10, fontWeight: "700", color: PRIMARY }}
                >
                  {item.type}
                </Text>
              </View>

              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <MapPin size={12} color="#999" />
                  <Text style={{ fontSize: 11, color: "#888", marginLeft: 3 }}>
                    {item.location}
                  </Text>
                </View>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Star size={11} color="#FFD93D" fill="#FFD93D" />
                  <Text
                    style={{
                      fontSize: 12,
                      fontWeight: "700",
                      color: "#1A1A1A",
                      marginLeft: 3,
                    }}
                  >
                    {item.rating}
                  </Text>
                  <Text style={{ fontSize: 10, color: "#BBB", marginLeft: 2 }}>
                    ({item.reviews})
                  </Text>
                </View>
              </View>
            </View>

            {/* Right: heart + book */}
            <View style={{ alignItems: "center", marginLeft: 10, gap: 10 }}>
              <TouchableOpacity
                onPress={() => handleUnfavourite(item.id)}
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 17,
                  backgroundColor: "#FFE5E5",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Heart size={16} color="#FF6B6B" fill="#FF6B6B" />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() =>
                  router.push({
                    pathname: "/booking/date",
                    params: {
                      salon: item.name,
                      service: "Service",
                      specialist: "Any",
                    },
                  })
                }
                style={{
                  backgroundColor: PRIMARY,
                  borderRadius: 16,
                  paddingHorizontal: 12,
                  paddingVertical: 7,
                }}
              >
                <Text
                  style={{ color: "#fff", fontSize: 11, fontWeight: "700" }}
                >
                  Book
                </Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Sort Modal */}
      <Modal
        visible={sortVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setSortVisible(false)}
      >
        <TouchableOpacity
          style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.4)" }}
          activeOpacity={1}
          onPress={() => setSortVisible(false)}
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
              marginBottom: 20,
            }}
          >
            <Text style={{ fontSize: 18, fontWeight: "800", color: "#1A1A1A" }}>
              Sort by
            </Text>
            <TouchableOpacity onPress={() => setSortVisible(false)}>
              <X size={22} color="#888" />
            </TouchableOpacity>
          </View>
          {SORT_OPTIONS.map((opt) => (
            <TouchableOpacity
              key={opt}
              onPress={() => {
                setSortBy(opt);
                setSortVisible(false);
              }}
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                paddingVertical: 16,
                borderBottomWidth: 1,
                borderBottomColor: "#F5F5F5",
              }}
            >
              <Text
                style={{
                  fontSize: 15,
                  fontWeight: "600",
                  color: sortBy === opt ? PRIMARY : "#1A1A1A",
                }}
              >
                {opt}
              </Text>
              {sortBy === opt && (
                <View
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: 11,
                    backgroundColor: PRIMARY,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Text
                    style={{ color: "#fff", fontSize: 13, fontWeight: "800" }}
                  >
                    ✓
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </Modal>
    </View>
  );
}
