import { useState, useRef, useEffect } from "react";
import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Animated,
  Dimensions,
  ActivityIndicator,
  Modal,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import {
  Search,
  Bell,
  MapPin,
  ChevronDown,
  SlidersHorizontal,
  Scissors,
  Sparkles,
  Hand,
  Leaf,
} from "lucide-react-native";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { colors, typography, radius, shadows } from "@/theme";
import SectionHeader from "@/components/SectionHeader";
import SalonCard from "@/components/SalonCard";
import SpecialistCard from "@/components/SpecialistCard";
import authService from "@/services/auth";
import businessService from "@/services/business";
import { getCurrentLocation } from "@/utils/location";
import { supabase } from "@/utils/supabase";

const { width } = Dimensions.get("window");
const RECENT_SEARCHES_KEY = "recent_searches";

// Icon mapping for categories from the API
const ICON_MAP = {
  Scissors, Sparkles, Hand, Leaf,
  Heart: Leaf, Footprints: Hand, // fallbacks
};

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const searchOpacity = useRef(new Animated.Value(0)).current;

  // Dynamic data from API
  const [user, setUser] = useState(null);
  const [location, setLocation] = useState("Locating...");
  const [categories, setCategories] = useState([]);
  const [specialists, setSpecialists] = useState([]);
  const [nearbySalons, setNearbySalons] = useState([]);
  const [suggestedSearches, setSuggestedSearches] = useState([]);
  const [recentSearches, setRecentSearches] = useState([]);
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notificationCount, setNotificationCount] = useState(0);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [filters, setFilters] = useState({ city: "", rating: 0 });

  useEffect(() => {
    const init = async () => {
      const city = await updateLocation();
      loadRecentSearches();
      loadData(city);
    };
    init();
  }, []);

  const loadRecentSearches = async () => {
    try {
      const stored = await AsyncStorage.getItem(RECENT_SEARCHES_KEY);
      if (stored) setRecentSearches(JSON.parse(stored));
    } catch (e) {}
  };

  const saveRecentSearch = async (term) => {
    try {
      const updated = [term, ...recentSearches.filter(t => t !== term)].slice(0, 5);
      setRecentSearches(updated);
      await AsyncStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
    } catch (e) {}
  };

  const updateLocation = async () => {
    const loc = await getCurrentLocation();
    if (!loc.error) {
      setLocation(loc.fullAddress || loc.city);
      return loc.city;
    }
    return null;
  };

  const loadData = async (userCity) => {
    try {
      // Load user profile
      const storedUser = await authService.getStoredUser();
      setUser(storedUser);

      // Load categories
      const catData = await businessService.getCategories();
      setCategories((catData.categories || []).slice(0, 4));

      // Load top specialists
      const specData = await businessService.getSpecialists({ limit: 6 });
      setSpecialists(specData.specialists || []);

      // Load nearby salons in user's city
      let bizData = await businessService.list({ 
        city: userCity || null,
        sort: 'rating', 
        limit: 10 
      });
      
      let loadedBiz = bizData.businesses || [];
      
      // Fallback: If no salons found in city, load top rated salons generally
      if (loadedBiz.length === 0) {
        console.log(`No salons found in ${userCity}, loading general top rated salons.`);
        bizData = await businessService.list({ 
          sort: 'rating', 
          limit: 10 
        });
        loadedBiz = bizData.businesses || [];
      }
      
      setNearbySalons(loadedBiz);

      // Build promotions from real business data
      const promoColors = ["#00A896", "#FF6B6B", "#4D96FF", "#8B5CF6"];
      const promoTitles = ["Featured Deal", "Special Offer", "Weekend Special", "Top Rated"];
      setPromotions(loadedBiz.slice(0, 3).map((biz, i) => ({
        id: biz.id,
        bizId: biz.id,
        title: promoTitles[i] || "Visit Today",
        desc: `at ${biz.name}`,
        image: biz.image_url || "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800",
        color: promoColors[i] || "#00A896",
      })));

      // Build suggested searches from business names and categories
      const bizNames = loadedBiz.map(b => b.name);
      const catNames = (catData.categories || []).map(c => c.name);
      setSuggestedSearches([...new Set([...bizNames, ...catNames])]);

      // Load Notifications (Confirmed bookings the user hasn't "seen" or just all confirmed)
      if (storedUser) {
        const { count, error: countError } = await supabase
          .from('bookings')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', storedUser.id)
          .eq('status', 'confirmed');
        
        if (!countError) setNotificationCount(count || 0);
      }
    } catch (err) {
      console.log('Home data load error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  const userName = user?.full_name?.split(' ')[0] || "there";

  const handleSearchFocus = () => {
    setSearchFocused(true);
    Animated.timing(searchOpacity, { toValue: 1, duration: 200, useNativeDriver: true }).start();
  };

  const handleSearchBlur = () => {
    if (!searchQuery) {
      setSearchFocused(false);
      Animated.timing(searchOpacity, { toValue: 0, duration: 150, useNativeDriver: true }).start();
    }
  };

  const handleSearchSelect = (term) => {
    saveRecentSearch(term);
    setSearchQuery(term);
    setSearchFocused(false);
    router.push({ 
      pathname: "/search-results", 
      params: { q: term, ...filters } 
    });
  };

  const applyFilters = (newFilters) => {
    setFilters(newFilters);
    setFilterModalVisible(false);
    if (searchQuery) {
      handleSearchSelect(searchQuery);
    }
  };

  const suggestions = suggestedSearches.filter((s) =>
    searchQuery ? s.toLowerCase().includes(searchQuery.toLowerCase()) : true,
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar style="light" />

      {/* Teal Header */}
      <View
        style={{
          backgroundColor: colors.primary,
          paddingTop: insets.top + 10,
          paddingHorizontal: 22,
          paddingBottom: 28,
          zIndex: 10,
        }}
      >
        {/* Top row: location + bell */}
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
          <TouchableOpacity 
            onPress={updateLocation}
            style={{ flexDirection: "row", alignItems: "center", gap: 4 }}
          >
            <MapPin size={15} color={colors.whiteAlpha85} />
            <Text style={{ fontSize: typography.size.md, color: colors.white, fontWeight: typography.weight.semibold }}>
              {location}
            </Text>
            <ChevronDown size={15} color={colors.whiteAlpha85} />
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => {
              if (notificationCount > 0) {
                Alert.alert("Notifications", `You have ${notificationCount} confirmed booking${notificationCount > 1 ? 's' : ''}.`);
              } else {
                Alert.alert("Notifications", "No new notifications.");
              }
            }}
            style={{ position: "relative" }}
          >
            <Bell size={22} color={colors.white} />
            {notificationCount > 0 && (
              <View
                style={{
                  position: "absolute",
                  top: -4,
                  right: -4,
                  minWidth: 16,
                  height: 16,
                  borderRadius: 8,
                  backgroundColor: colors.danger,
                  borderWidth: 1.5,
                  borderColor: colors.primary,
                  alignItems: 'center',
                  justifyContent: 'center',
                  paddingHorizontal: 2
                }}
              >
                <Text style={{ color: '#fff', fontSize: 8, fontWeight: '800' }}>{notificationCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Greeting — Dynamic */}
        <Text style={{ fontSize: typography.size['3xl'], fontWeight: typography.weight.extrabold, color: colors.white, marginBottom: 2, marginTop: 10 }}>
          {getGreeting()}, {userName} 👋
        </Text>
        <Text style={{ fontSize: typography.size.body, color: colors.whiteAlpha70, marginBottom: 16 }}>
          Discover the best service near you
        </Text>

        {/* Search bar */}
        <View style={{ flexDirection: "row", alignItems: "center", backgroundColor: colors.white, borderRadius: radius.lg, paddingHorizontal: 14 }}>
          <Search size={18} color={searchFocused ? colors.primary : colors.textPlaceholder} />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search salon, barber..."
            placeholderTextColor={colors.textPlaceholder}
            onFocus={handleSearchFocus}
            onBlur={handleSearchBlur}
            returnKeyType="search"
            onSubmitEditing={() => searchQuery && handleSearchSelect(searchQuery)}
            style={{ flex: 1, paddingVertical: 13, paddingHorizontal: 10, fontSize: typography.size.md, color: colors.text }}
          />
          <TouchableOpacity 
            onPress={() => setFilterModalVisible(true)}
            style={{ width: 36, height: 36, borderRadius: radius.md, backgroundColor: colors.primary, alignItems: "center", justifyContent: "center" }}
          >
            <SlidersHorizontal size={16} color={colors.white} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Search Dropdown Overlay */}
      {searchFocused && (
        <Animated.View
          style={{
            position: "absolute", 
            top: insets.top + 185, // Increased to avoid covering the search bar
            left: 22, 
            right: 22,
            backgroundColor: colors.white, 
            borderRadius: radius.xl, 
            zIndex: 100,
            ...shadows.lg, 
            opacity: searchOpacity,
          }}
        >
          {!searchQuery ? (
            <>
              <View style={{ padding: 16, borderBottomWidth: 1, borderBottomColor: colors.divider }}>
                <Text style={{ fontSize: typography.size.sm, fontWeight: typography.weight.bold, color: colors.textMuted, marginBottom: 10, letterSpacing: 0.5 }}>
                  RECENT SEARCHES
                </Text>
                {recentSearches.map((r, i) => (
                  <TouchableOpacity key={i} onPress={() => handleSearchSelect(r)} style={{ flexDirection: "row", alignItems: "center", paddingVertical: 10 }}>
                    <Search size={14} color={colors.textPlaceholder} style={{ marginRight: 10 }} />
                    <Text style={{ fontSize: typography.size.md, color: "#444" }}>{r}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <View style={{ padding: 16 }}>
                <Text style={{ fontSize: typography.size.sm, fontWeight: typography.weight.bold, color: colors.textMuted, marginBottom: 10, letterSpacing: 0.5 }}>
                  SUGGESTED
                </Text>
                {suggestions.map((s, i) => (
                  <TouchableOpacity key={i} onPress={() => handleSearchSelect(s)} style={{ flexDirection: "row", alignItems: "center", paddingVertical: 10 }}>
                    <MapPin size={14} color={colors.primary} style={{ marginRight: 10 }} />
                    <Text style={{ fontSize: typography.size.md, color: "#444" }}>{s}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </>
          ) : (
            <View style={{ padding: 8 }}>
              {suggestions.map((s, i) => (
                <TouchableOpacity key={i} onPress={() => handleSearchSelect(s)} style={{ flexDirection: "row", alignItems: "center", padding: 14, borderRadius: radius.md }}>
                  <Search size={14} color={colors.textPlaceholder} style={{ marginRight: 10 }} />
                  <Text style={{ fontSize: typography.size.md, color: "#333" }}>{s}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </Animated.View>
      )}

      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: insets.bottom + 80 }}
          keyboardShouldPersistTaps="handled"
          style={{ flex: 1, zIndex: 1 }}
        >
          {/* Promotions Carousel */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            pagingEnabled
            snapToAlignment="center"
            decelerationRate="fast"
            contentContainerStyle={{ paddingHorizontal: 22, paddingTop: 20 }}
          >
            {promotions.map((promo) => (
              <TouchableOpacity
                key={promo.id}
                onPress={() => router.push({ pathname: "/business/detail", params: { id: promo.bizId } })}
                style={{
                  width: width - 44,
                  marginRight: 12,
                  borderRadius: radius['3xl'],
                  overflow: "hidden",
                  backgroundColor: promo.color || colors.primary,
                  height: 180,
                }}
              >
                <Image
                  source={{ uri: promo.image }}
                  style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, opacity: 0.3 }}
                  contentFit="cover"
                />
                <View style={{ padding: 22, flex: 1, justifyContent: "center" }}>
                  <View style={{ backgroundColor: "rgba(255,255,255,0.2)", alignSelf: "flex-start", borderRadius: radius.pill, paddingHorizontal: 10, paddingVertical: 4, marginBottom: 10 }}>
                    <Text style={{ color: colors.white, fontSize: typography.size.xs, fontWeight: typography.weight.bold }}>FEATURED OFFER</Text>
                  </View>
                  <Text style={{ fontSize: typography.size['2xl'], fontWeight: typography.weight.extrabold, color: colors.white, marginBottom: 4 }}>
                    {promo.title}
                  </Text>
                  <Text style={{ fontSize: typography.size.body, color: colors.whiteAlpha70, marginBottom: 12 }}>
                    {promo.desc}
                  </Text>
                  <View
                    style={{ backgroundColor: colors.white, alignSelf: "flex-start", borderRadius: radius.pill, paddingHorizontal: 16, paddingVertical: 8 }}
                  >
                    <Text style={{ color: promo.color || colors.primary, fontWeight: typography.weight.bold, fontSize: typography.size.xs }}>Get Deal</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Categories */}
          <SectionHeader title="Category" onAction={() => {}} />
          <View style={{ flexDirection: "row", paddingHorizontal: 22, gap: 12 }}>
            {categories.map((cat) => {
              const IconComp = ICON_MAP[cat.icon] || Scissors;
              return (
                <TouchableOpacity
                  key={cat.id}
                  onPress={() => router.push({ pathname: "/search-results", params: { category: cat.name } })}
                  style={{
                    flex: 1, alignItems: "center", backgroundColor: colors.card, borderRadius: radius['2xl'],
                    paddingVertical: 18, ...shadows.sm,
                  }}
                >
                  <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: colors.primary, alignItems: "center", justifyContent: "center", marginBottom: 8 }}>
                    <IconComp size={20} color={colors.white} />
                  </View>
                  <Text style={{ fontSize: typography.size.xs, fontWeight: typography.weight.semibold, color: "#444", textAlign: "center" }}>
                    {cat.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Top Specialist */}
          <SectionHeader title="Top Specialist" onAction={() => {}} />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 22, gap: 14 }} style={{ flexGrow: 0 }}>
            {specialists.map((sp) => (
              <SpecialistCard
                key={sp.id}
                specialist={sp}
                onBook={() =>
                  router.push({
                    pathname: "/booking/date",
                    params: { salon: sp.business_name, service: sp.service, specialist: sp.name },
                  })
                }
              />
            ))}
          </ScrollView>

          {/* Nearby Salon */}
          <SectionHeader 
            title={nearbySalons.length > 0 && location !== "Locating..." ? `Salons in ${location.split(',')[0]}` : "Top Rated Salons"} 
            onAction={() => router.push("/(tabs)/explore")} 
          />
          {nearbySalons.map((salon) => (
            <SalonCard
              key={salon.id}
              salon={salon}
              onPress={() => router.push({ pathname: "/business/detail", params: { id: salon.id, name: salon.name } })}
              onBook={() => router.push({ pathname: "/business/detail", params: { id: salon.id, name: salon.name } })}
            />
          ))}
        </ScrollView>
      )}
      {/* Filter Modal */}
      <Modal
        visible={filterModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setFilterModalVisible(false)}
      >
        <View style={{ flex: 1, backgroundColor: colors.overlay, justifyContent: "flex-end" }}>
          <View style={{ backgroundColor: colors.white, borderTopLeftRadius: radius['3xl'], borderTopRightRadius: radius['3xl'], padding: 24, paddingBottom: insets.bottom + 20 }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <Text style={{ fontSize: typography.size.xl, fontWeight: typography.weight.bold, color: colors.text }}>Filters</Text>
              <TouchableOpacity onPress={() => setFilterModalVisible(false)}>
                <Text style={{ color: colors.primary, fontWeight: typography.weight.semibold }}>Cancel</Text>
              </TouchableOpacity>
            </View>

            <Text style={{ fontSize: typography.size.md, fontWeight: typography.weight.bold, color: colors.text, marginBottom: 12 }}>City</Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 24 }}>
              {["Accra", "Takoradi", "Kumasi", "Tarkwa"].map(city => (
                <TouchableOpacity 
                  key={city}
                  onPress={() => setFilters({ ...filters, city })}
                  style={{ 
                    paddingHorizontal: 16, paddingVertical: 8, borderRadius: radius.pill, 
                    backgroundColor: filters.city === city ? colors.primarySurface : colors.background,
                    borderWidth: 1, borderColor: filters.city === city ? colors.primary : colors.border 
                  }}
                >
                  <Text style={{ color: filters.city === city ? colors.primary : colors.textSecondary }}>{city}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity 
              onPress={() => applyFilters(filters)}
              style={{ backgroundColor: colors.primary, borderRadius: radius.xl, paddingVertical: 14, alignItems: "center" }}
            >
              <Text style={{ color: colors.white, fontWeight: typography.weight.bold, fontSize: typography.size.md }}>Apply Filters</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}
