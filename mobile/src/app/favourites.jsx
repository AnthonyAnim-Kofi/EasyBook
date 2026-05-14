import { useEffect, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, Modal, ActivityIndicator } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import {
  ChevronLeft,
  Search,
  MapPin,
  Star,
  Heart,
  ChevronRight,
  X,
  HeartOff,
} from "lucide-react-native";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { supabase } from "@/utils/supabase";
import { colors, typography, radius, shadows } from "@/theme";

const SORT_OPTIONS = ["Most Visited", "Date Added", "Highest Rated", "Nearest"];

export default function FavouritesScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [favourites, setFavourites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortVisible, setSortVisible] = useState(false);
  const [sortBy, setSortBy] = useState("Date Added");

  useEffect(() => {
    fetchFavourites();
  }, []);

  const fetchFavourites = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('favourites')
        .select(`
          id,
          business:businesses (*)
        `)
        .eq('user_id', user.id);

      if (error) throw error;
      
      // Transform data for the UI
      const formatted = data.map(item => ({
        id: item.id,
        businessId: item.business.id,
        name: item.business.name,
        location: `${item.business.city}, ${item.business.region || 'Ghana'}`,
        rating: item.business.rating || 0,
        reviews: item.business.review_count || 0,
        type: item.business.category || 'Service',
        image: item.business.image_url || "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400",
      }));

      setFavourites(formatted);
    } catch (err) {
      console.error('Error fetching favourites:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUnfavourite = async (id) => {
    try {
      // Optimistic UI update
      setFavourites((prev) => prev.filter((f) => f.id !== id));
      
      const { error } = await supabase
        .from('favourites')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    } catch (err) {
      console.error('Error removing favourite:', err);
      // Re-fetch if it fails to sync correctly
      fetchFavourites();
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar style="dark" />

      {/* Header */}
      <View
        style={{
          backgroundColor: colors.card,
          paddingTop: insets.top + 16,
          paddingHorizontal: 22,
          paddingBottom: 16,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottomWidth: 1,
          borderBottomColor: colors.borderLight,
        }}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: colors.inputBg,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <ChevronLeft size={22} color={colors.text} />
        </TouchableOpacity>
        
        <Text style={{ 
          fontSize: typography.size.xl, 
          fontWeight: typography.weight.extrabold, 
          color: colors.text 
        }}>
          My Favourites
        </Text>

        <TouchableOpacity
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: colors.inputBg,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Search size={18} color={colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 22,
          paddingTop: 20,
          paddingBottom: insets.bottom + 40,
          flexGrow: 1,
        }}
      >
        {loading ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 100 }}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={{ marginTop: 16, color: colors.textSecondary }}>Loading your favourites...</Text>
          </View>
        ) : favourites.length === 0 ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 100 }}>
            <View style={{ 
              width: 80, 
              height: 80, 
              borderRadius: 40, 
              backgroundColor: colors.primarySurface,
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 16
            }}>
              <HeartOff size={40} color={colors.primary} />
            </View>
            <Text style={{ 
              fontSize: typography.size.xl, 
              fontWeight: typography.weight.bold, 
              color: colors.text,
              marginBottom: 8
            }}>
              No favourites yet
            </Text>
            <Text style={{ 
              textAlign: 'center', 
              color: colors.textSecondary,
              paddingHorizontal: 40,
              lineHeight: 20
            }}>
              Start exploring businesses and save your favourites here for quick access.
            </Text>
            <TouchableOpacity 
              onPress={() => router.push('/(tabs)/explore')}
              style={{
                marginTop: 24,
                backgroundColor: colors.primary,
                paddingHorizontal: 24,
                paddingVertical: 12,
                borderRadius: radius.pill,
              }}
            >
              <Text style={{ color: colors.white, fontWeight: typography.weight.bold }}>
                Explore Now
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {/* Sort by */}
            <TouchableOpacity
              onPress={() => setSortVisible(true)}
              style={{
                backgroundColor: colors.card,
                borderRadius: radius.lg,
                padding: 16,
                marginBottom: 20,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                ...shadows.sm,
              }}
            >
              <View>
                <Text style={{ fontSize: typography.size.xs, color: colors.textMuted, marginBottom: 2 }}>
                  Sort by
                </Text>
                <Text style={{ fontSize: typography.size.md, fontWeight: typography.weight.bold, color: colors.text }}>
                  {sortBy}
                </Text>
              </View>
              <ChevronRight size={18} color={colors.textMuted} />
            </TouchableOpacity>

            {/* List */}
            {favourites.map((item) => (
              <TouchableOpacity
                key={item.id}
                onPress={() =>
                  router.push({
                    pathname: "/business/detail",
                    params: { id: item.businessId, name: item.name },
                  })
                }
                style={{
                  backgroundColor: colors.card,
                  borderRadius: radius.lg,
                  marginBottom: 16,
                  flexDirection: "row",
                  alignItems: "center",
                  padding: 12,
                  ...shadows.sm,
                }}
              >
                <Image
                  source={{ uri: item.image }}
                  style={{ width: 80, height: 80, borderRadius: radius.md }}
                  contentFit="cover"
                />

                <View style={{ flex: 1, marginLeft: 14 }}>
                  <Text
                    style={{
                      fontSize: typography.size.md,
                      fontWeight: typography.weight.extrabold,
                      color: colors.text,
                      marginBottom: 4,
                    }}
                    numberOfLines={1}
                  >
                    {item.name}
                  </Text>

                  <View
                    style={{
                      alignSelf: "flex-start",
                      backgroundColor: colors.primarySurface,
                      borderRadius: radius.pill,
                      paddingHorizontal: 10,
                      paddingVertical: 3,
                      marginBottom: 8,
                    }}
                  >
                    <Text
                      style={{ fontSize: 10, fontWeight: typography.weight.bold, color: colors.primary }}
                    >
                      {item.type}
                    </Text>
                  </View>

                  <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                    <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
                      <MapPin size={12} color={colors.textTertiary} />
                      <Text 
                        style={{ fontSize: typography.size.xs, color: colors.textSecondary, marginLeft: 4 }}
                        numberOfLines={1}
                      >
                        {item.location}
                      </Text>
                    </View>
                    <View style={{ flexDirection: "row", alignItems: "center", marginLeft: 8 }}>
                      <Star size={11} color={colors.star} fill={colors.star} />
                      <Text
                        style={{
                          fontSize: typography.size.sm,
                          fontWeight: typography.weight.bold,
                          color: colors.text,
                          marginLeft: 4,
                        }}
                      >
                        {item.rating}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Right actions */}
                <View style={{ alignItems: "center", marginLeft: 12, gap: 12 }}>
                  <TouchableOpacity
                    onPress={() => handleUnfavourite(item.id)}
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 18,
                      backgroundColor: colors.errorBg,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Heart size={18} color={colors.danger} fill={colors.danger} />
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
                      backgroundColor: colors.primary,
                      borderRadius: radius.md,
                      paddingHorizontal: 14,
                      paddingVertical: 8,
                    }}
                  >
                    <Text
                      style={{ color: colors.white, fontSize: 11, fontWeight: typography.weight.bold }}
                    >
                      Book
                    </Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            ))}
          </>
        )}
      </ScrollView>

      {/* Sort Modal */}
      <Modal
        visible={sortVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setSortVisible(false)}
      >
        <TouchableOpacity
          style={{ flex: 1, backgroundColor: colors.overlay }}
          activeOpacity={1}
          onPress={() => setSortVisible(false)}
        />
        <View
          style={{
            backgroundColor: colors.card,
            borderTopLeftRadius: 32,
            borderTopRightRadius: 32,
            padding: 24,
            paddingBottom: 40,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 24,
            }}
          >
            <Text style={{ fontSize: typography.size.xl, fontWeight: typography.weight.extrabold, color: colors.text }}>
              Sort by
            </Text>
            <TouchableOpacity onPress={() => setSortVisible(false)}>
              <X size={24} color={colors.textTertiary} />
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
                paddingVertical: 18,
                borderBottomWidth: 1,
                borderBottomColor: colors.divider,
              }}
            >
              <Text
                style={{
                  fontSize: typography.size.lg,
                  fontWeight: typography.weight.semibold,
                  color: sortBy === opt ? colors.primary : colors.text,
                }}
              >
                {opt}
              </Text>
              {sortBy === opt && (
                <View
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: 12,
                    backgroundColor: colors.primary,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Text
                    style={{ color: colors.white, fontSize: 14, fontWeight: typography.weight.bold }}
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
