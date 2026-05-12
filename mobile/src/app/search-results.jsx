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
import { ArrowLeft, Search, MapPin, Star } from "lucide-react-native";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import businessService from "@/services/business";

const PRIMARY = "#00A896";
const BG = "#F7F7F7";

const filters = ["Location", "Rating", "New", "Top"];

function HighlightedText({ text, query }) {
  if (!query)
    return (
      <Text style={{ fontSize: 15, fontWeight: "700", color: "#1A1A1A" }}>
        {text}
      </Text>
    );
  const lower = text.toLowerCase();
  const queryLower = query.toLowerCase();
  const index = lower.indexOf(queryLower);
  if (index === -1)
    return (
      <Text style={{ fontSize: 15, fontWeight: "700", color: "#1A1A1A" }}>
        {text}
      </Text>
    );
  return (
    <Text style={{ fontSize: 15, fontWeight: "700", color: "#1A1A1A" }}>
      {text.slice(0, index)}
      <Text style={{ color: PRIMARY }}>
        {text.slice(index, index + query.length)}
      </Text>
      {text.slice(index + query.length)}
    </Text>
  );
}

export default function SearchResultsScreen() {
  const { q, category, city: cityParam } = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState(q || "");
  const [activeFilter, setActiveFilter] = useState("Location");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchResults();
  }, [q, category, cityParam]);

  const fetchResults = async () => {
    setLoading(true);
    try {
      const data = await businessService.list({ 
        query: query || q, 
        category: category,
        city: cityParam 
      });
      setResults(data.businesses || []);
    } catch (err) {
      console.log("Search results error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    fetchResults();
  };

  return (
    <View style={{ flex: 1, backgroundColor: BG }}>
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
            marginBottom: 16,
          }}
        >
          <TouchableOpacity
            onPress={() => router.back()}
            style={{
              width: 38,
              height: 38,
              borderRadius: 19,
              backgroundColor: "#F5F5F5",
              alignItems: "center",
              justifyContent: "center",
              marginRight: 14,
            }}
          >
            <ArrowLeft size={20} color="#1A1A1A" />
          </TouchableOpacity>
          <Text style={{ fontSize: 17, fontWeight: "700", color: "#1A1A1A" }}>
            Search Results
          </Text>
        </View>

        {/* Search bar */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: "#F5F5F5",
            borderRadius: 14,
            paddingHorizontal: 14,
            marginBottom: 14,
          }}
        >
          <Search size={18} color="#BBBBBB" />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search..."
            placeholderTextColor="#BBBBBB"
            onSubmitEditing={handleSearch}
            returnKeyType="search"
            style={{
              flex: 1,
              paddingVertical: 13,
              paddingHorizontal: 10,
              fontSize: 14,
              color: "#1A1A1A",
            }}
          />
        </View>

        {/* Filter chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ flexGrow: 0 }}
          contentContainerStyle={{ gap: 10 }}
        >
          {filters.map((f) => (
            <TouchableOpacity
              key={f}
              onPress={() => setActiveFilter(f)}
              style={{
                paddingHorizontal: 18,
                paddingVertical: 8,
                borderRadius: 20,
                backgroundColor: activeFilter === f ? PRIMARY : "#fff",
                borderWidth: 1.5,
                borderColor: activeFilter === f ? PRIMARY : "#E0E0E0",
              }}
            >
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: "600",
                  color: activeFilter === f ? "#fff" : "#666",
                }}
              >
                {f}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          padding: 22,
          paddingBottom: insets.bottom + 30,
        }}
      >
        {loading ? (
          <View style={{ paddingTop: 100 }}>
            <ActivityIndicator size="large" color={PRIMARY} />
          </View>
        ) : (
          <>
            <Text style={{ fontSize: 13, color: "#888", marginBottom: 16 }}>
              {results.length} result{results.length !== 1 ? "s" : ""} for "{query || category || q}"
            </Text>

            {results.map((item) => (
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
                  marginBottom: 16,
                  flexDirection: "row",
                  overflow: "hidden",
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.06,
                  shadowRadius: 8,
                  elevation: 2,
                }}
              >
                <Image
                  source={{ uri: item.image_url || item.image }}
                  style={{ width: 90, height: 90 }}
                  contentFit="cover"
                />
                <View style={{ flex: 1, padding: 14, justifyContent: "center" }}>
                  <HighlightedText text={item.name} query={query} />
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      marginTop: 4,
                      marginBottom: 8,
                    }}
                  >
                    <MapPin size={12} color="#999" />
                    <Text style={{ fontSize: 12, color: "#888", marginLeft: 4 }}>
                      {item.location || item.address || `${item.city}, ${item.country || 'Ghana'}`}
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
                      <Star size={12} color="#FFD93D" fill="#FFD93D" />
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
                      <Text style={{ fontSize: 11, color: "#BBB", marginLeft: 2 }}>
                        ({item.review_count || item.reviews || 0})
                      </Text>
                    </View>
                    <TouchableOpacity
                      style={{
                        backgroundColor: PRIMARY,
                        borderRadius: 16,
                        paddingHorizontal: 14,
                        paddingVertical: 6,
                      }}
                    >
                      <Text
                        style={{ color: "#fff", fontSize: 11, fontWeight: "700" }}
                      >
                        Book Now
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableOpacity>
            ))}

            {results.length === 0 && (
              <View style={{ alignItems: "center", paddingTop: 60 }}>
                <Search size={50} color="#DDD" />
                <Text
                  style={{
                    fontSize: 17,
                    fontWeight: "700",
                    color: "#CCC",
                    marginTop: 16,
                  }}
                >
                  No results found
                </Text>
                <Text style={{ fontSize: 14, color: "#BBB", marginTop: 6 }}>
                  Try a different keyword
                </Text>
              </View>
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}
