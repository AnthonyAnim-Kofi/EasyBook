import { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import {
  MapPin,
  Clock,
  ChevronRight,
  Info,
  Calendar,
} from "lucide-react-native";
import { Image } from "expo-image";
import { useRouter, router } from "expo-router";
import { supabase } from "@/utils/supabase";
import { colors, typography, radius, shadows } from "@/theme";
import { format } from "date-fns";

const { width } = Dimensions.get("window");
const TABS = ["Upcoming", "Completed", "Cancelled"];

function EmptyState({ tab }) {
  const messages = {
    Upcoming: {
      title: "No upcoming bookings",
      sub: "Your future appointments will appear here.",
    },
    Completed: {
      title: "No completed bookings",
      sub: "Completed appointments will show here.",
    },
    Cancelled: {
      title: "No cancelled bookings",
      sub: "Cancelled appointments will show here.",
    },
  };
  const msg = messages[tab];
  return (
    <View
      style={{ alignItems: "center", paddingTop: 80, paddingHorizontal: 40 }}
    >
      <View
        style={{
          width: 80,
          height: 80,
          borderRadius: 40,
          backgroundColor: colors.primarySurface,
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 16,
        }}
      >
        <Calendar size={40} color={colors.primary} />
      </View>
      <Text
        style={{
          fontSize: typography.size.xl,
          fontWeight: typography.weight.bold,
          color: colors.text,
          marginBottom: 8,
          textAlign: "center",
        }}
      >
        {msg.title}
      </Text>
      <Text
        style={{
          fontSize: typography.size.md,
          color: colors.textTertiary,
          textAlign: "center",
          lineHeight: 21,
        }}
      >
        {msg.sub}
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
          Book a Service
        </Text>
      </TouchableOpacity>
    </View>
  );
}

function BookingCard({ item, isFirst, onPress, onClear, onRestore, tab }) {
  const isTeal = isFirst && tab === "Upcoming";

  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        backgroundColor: isTeal ? colors.primary : colors.card,
        borderRadius: radius.lg,
        marginBottom: 14,
        padding: 16,
        flexDirection: "row",
        alignItems: "center",
        ...shadows.sm,
      }}
    >
      <Image
        source={{ uri: item.image }}
        style={{
          width: 70,
          height: 70,
          borderRadius: radius.md,
          borderWidth: 2,
          borderColor: isTeal ? "rgba(255,255,255,0.4)" : colors.borderLight,
        }}
        contentFit="cover"
      />

      <View style={{ flex: 1, marginLeft: 14 }}>
        <Text
          style={{
            fontSize: typography.size.md,
            fontWeight: typography.weight.extrabold,
            color: isTeal ? colors.white : colors.text,
            marginBottom: 6,
          }}
          numberOfLines={1}
        >
          {item.salon}
        </Text>

        <View style={{ flexDirection: "row", flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: isTeal ? "rgba(255,255,255,0.2)" : colors.inputBg,
              borderRadius: radius.pill,
              paddingHorizontal: 10,
              paddingVertical: 4,
            }}
          >
            <MapPin size={10} color={isTeal ? colors.white : colors.textTertiary} />
            <Text
              style={{
                fontSize: 10,
                color: isTeal ? colors.white : colors.textSecondary,
                marginLeft: 4,
                fontWeight: typography.weight.medium,
              }}
              numberOfLines={1}
            >
              {item.location}
            </Text>
          </View>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: isTeal ? "rgba(255,255,255,0.2)" : colors.inputBg,
              borderRadius: radius.pill,
              paddingHorizontal: 10,
              paddingVertical: 4,
            }}
          >
            <Clock size={10} color={isTeal ? colors.white : colors.textTertiary} />
            <Text
              style={{
                fontSize: 10,
                color: isTeal ? colors.white : colors.textSecondary,
                marginLeft: 4,
                fontWeight: typography.weight.medium,
              }}
            >
              {item.time}
            </Text>
          </View>
        </View>

        <Text
          style={{
            fontSize: 11,
            color: isTeal ? "rgba(255,255,255,0.8)" : colors.primary,
            fontWeight: typography.weight.semibold,
          }}
        >
          {item.date}
        </Text>
      </View>

      <ChevronRight
        size={18}
        color={isTeal ? "rgba(255,255,255,0.7)" : colors.textMuted}
      />
    </TouchableOpacity>
  );
}

export default function BookingsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("Upcoming");
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          business:businesses (name, city, address, image_url),
          package:packages (name)
        `)
        .eq('user_id', user.id)
        .order('date', { ascending: false });

      if (error) throw error;

      const formatted = data.map(b => ({
        id: b.id,
        salon: b.business.name,
        location: `${b.business.city}, ${b.business.address}`,
        time: b.time.substring(0, 5),
        date: format(new Date(b.date), 'EEE, d MMM yyyy'),
        status: b.status,
        image: b.business.image_url || "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=200",
        packageName: b.package?.name || 'Service'
      }));

      setBookings(formatted);
    } catch (err) {
      console.error('Error fetching bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = bookings.filter((b) => {
    if (activeTab === "Upcoming") return b.status === "pending" || b.status === "confirmed" || b.status === "in_progress";
    if (activeTab === "Completed") return b.status === "completed";
    if (activeTab === "Cancelled") return b.status === "cancelled";
    return false;
  });

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
          borderBottomWidth: 1,
          borderBottomColor: colors.borderLight,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Text style={{ fontSize: typography.size.xl, fontWeight: typography.weight.extrabold, color: colors.text }}>
          My Bookings
        </Text>
      </View>

      {/* Tab Pills */}
      <View
        style={{
          flexDirection: "row",
          paddingHorizontal: 22,
          marginTop: 16,
          marginBottom: 20,
          gap: 10,
        }}
      >
        {TABS.map((tab) => (
          <TouchableOpacity
            key={tab}
            onPress={() => setActiveTab(tab)}
            style={{
              flex: 1,
              paddingVertical: 12,
              borderRadius: radius.pill,
              alignItems: "center",
              backgroundColor: activeTab === tab ? colors.primary : colors.card,
              borderWidth: 1.5,
              borderColor: activeTab === tab ? colors.primary : colors.border,
              ...shadows.sm,
            }}
          >
            <Text
              style={{
                fontSize: 13,
                fontWeight: typography.weight.bold,
                color: activeTab === tab ? colors.white : colors.textSecondary,
              }}
            >
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Booking List */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 22,
          paddingBottom: insets.bottom + 100,
          flexGrow: 1,
        }}
      >
        {loading ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : filtered.length === 0 ? (
          <EmptyState tab={activeTab} />
        ) : (
          filtered.map((item, index) => (
            <BookingCard
              key={item.id}
              item={item}
              tab={activeTab}
              isFirst={index === 0}
              onPress={() =>
                router.push({
                  pathname: "/booking/summary",
                  params: { id: item.id },
                })
              }
            />
          ))
        )}
      </ScrollView>
    </View>
  );
}
