import { useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity, Modal, ActivityIndicator } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { ChevronDown, Star, X, TrendingUp, BarChart3, Users } from "lucide-react-native";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import BusinessTabBar from "@/components/BusinessTabBar";
import { supabase } from "@/utils/supabase";
import { colors, typography, radius, shadows } from "@/theme";
import { format, startOfMonth, endOfMonth, subMonths, formatDistanceToNow } from "date-fns";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];
const YEARS = ["2024", "2025", "2026"];

function StarRow({ rating }) {
  return (
    <View style={{ flexDirection: "row", gap: 2 }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={12}
          color="#FFD93D"
          fill={i <= rating ? "#FFD93D" : "transparent"}
        />
      ))}
    </View>
  );
}

function DatePickerModal({
  visible,
  onClose,
  startMonth,
  startYear,
  endMonth,
  endYear,
  onApply,
}) {
  const [selStartMonth, setSelStartMonth] = useState(startMonth);
  const [selStartYear, setSelStartYear] = useState(startYear);
  const [selEndMonth, setSelEndMonth] = useState(endMonth);
  const [selEndYear, setSelEndYear] = useState(endYear);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.4)" }}
        activeOpacity={1}
        onPress={onClose}
      />
      <View
        style={{
          backgroundColor: colors.card,
          borderTopLeftRadius: 28,
          borderTopRightRadius: 28,
          padding: 24,
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
          <Text style={{ fontSize: 18, fontWeight: typography.weight.extrabold, color: colors.text }}>
            Select Date Range
          </Text>
          <TouchableOpacity onPress={onClose}>
            <X size={22} color={colors.textMuted} />
          </TouchableOpacity>
        </View>

        <View style={{ flexDirection: "row", gap: 16 }}>
          {/* From */}
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 10, fontWeight: "700", color: colors.textMuted, marginBottom: 10, textAlign: "center" }}>FROM</Text>
            <ScrollView style={{ height: 180 }} showsVerticalScrollIndicator={false}>
              {MONTHS.map((m) => (
                <TouchableOpacity
                  key={m}
                  onPress={() => setSelStartMonth(m)}
                  style={{
                    paddingVertical: 10,
                    alignItems: "center",
                    borderRadius: 10,
                    backgroundColor: selStartMonth === m ? colors.inputBg : "transparent",
                  }}
                >
                  <Text style={{ fontSize: 14, fontWeight: selStartMonth === m ? "700" : "400", color: selStartMonth === m ? colors.primary : colors.textSecondary }}>{m}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* To */}
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 10, fontWeight: "700", color: colors.textMuted, marginBottom: 10, textAlign: "center" }}>TO</Text>
            <ScrollView style={{ height: 180 }} showsVerticalScrollIndicator={false}>
              {MONTHS.map((m) => (
                <TouchableOpacity
                  key={m}
                  onPress={() => setSelEndMonth(m)}
                  style={{
                    paddingVertical: 10,
                    alignItems: "center",
                    borderRadius: 10,
                    backgroundColor: selEndMonth === m ? colors.inputBg : "transparent",
                  }}
                >
                  <Text style={{ fontSize: 14, fontWeight: selEndMonth === m ? "700" : "400", color: selEndMonth === m ? colors.primary : colors.textSecondary }}>{m}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>

        <TouchableOpacity
          onPress={() => {
            onApply(selStartMonth, selStartYear, selEndMonth, selEndYear);
            onClose();
          }}
          style={{
            backgroundColor: colors.primary,
            borderRadius: 30,
            paddingVertical: 16,
            alignItems: "center",
            marginTop: 20,
          }}
        >
          <Text style={{ color: colors.white, fontSize: 16, fontWeight: "700" }}>Apply</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
}

export default function InsightsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [datePickerVisible, setDatePickerVisible] = useState(false);
  const [startMonth, setStartMonth] = useState(format(subMonths(new Date(), 1), "MMMM"));
  const [startYear, setStartYear] = useState("2024");
  const [endMonth, setEndMonth] = useState(format(new Date(), "MMMM"));
  const [endYear, setEndYear] = useState("2024");
  
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState([
    { label: "Bookings", value: "0", icon: TrendingUp, color: "#E0F5F3" },
    { label: "Revenue", value: "GHS 0", icon: BarChart3, color: "#E8F4FF" },
    { label: "Customers", value: "0", icon: Users, color: "#FFF0E8" },
  ]);
  const [feedbacks, setFeedbacks] = useState([]);

  useEffect(() => {
    fetchInsights();
  }, []);

  const fetchInsights = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // 1. Fetch the business owned by this user
      const { data: business, error: bizError } = await supabase
        .from('businesses')
        .select('id')
        .eq('owner_id', user.id)
        .single();

      if (bizError) {
        console.warn('Business not found for user:', bizError);
        return;
      }

      // 2. Fetch bookings for statistics
      const { data: bookings, error: bError } = await supabase
        .from('bookings')
        .select('*')
        .eq('business_id', business.id);

      if (bError) throw bError;

      const completedBookings = bookings.filter(b => b.status === 'completed');
      const uniqueCustomers = new Set(bookings.map(b => b.user_id)).size;
      
      // Calculate revenue based on actual total_price in bookings
      const totalRevenue = completedBookings.reduce((sum, b) => sum + (b.total_price || 0), 0);

      setStats([
        { label: "Bookings", value: bookings.length.toString(), icon: TrendingUp, color: "#E0F5F3" },
        { label: "Revenue", value: `GHS ${totalRevenue}`, icon: BarChart3, color: "#E8F4FF" },
        { label: "Customers", value: uniqueCustomers.toString(), icon: Users, color: "#FFF0E8" },
      ]);

      // 3. Fetch real reviews joined with customer profiles
      const { data: reviews, error: rError } = await supabase
        .from('reviews')
        .select(`
          id,
          rating,
          comment,
          created_at,
          profiles:user_id (
            full_name,
            avatar_url
          )
        `)
        .eq('business_id', business.id)
        .order('created_at', { ascending: false });

      if (rError) throw rError;

      const formattedFeedbacks = reviews.map(r => ({
        id: r.id,
        name: r.profiles?.full_name || "Anonymous",
        avatar: r.profiles?.avatar_url || "https://ui-avatars.com/api/?name=" + (r.profiles?.full_name || "A"),
        rating: r.rating,
        service: "Service", // We could join with bookings/packages for more detail
        comment: r.comment,
        date: formatDistanceToNow(new Date(r.created_at)) + " ago"
      }));

      setFeedbacks(formattedFeedbacks);

    } catch (err) {
      console.error('Error fetching insights:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = (sm, sy, em, ey) => {
    setStartMonth(sm);
    setStartYear(sy);
    setEndMonth(em);
    setEndYear(ey);
    fetchInsights();
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar style="dark" />

      {/* Header */}
      <View
        style={{
          paddingTop: insets.top + 16,
          paddingHorizontal: 22,
          paddingBottom: 16,
          backgroundColor: colors.background,
          borderBottomWidth: 1,
          borderBottomColor: colors.borderLight,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Text style={{ fontSize: 20, fontWeight: typography.weight.extrabold, color: colors.text }}>
          Performance
        </Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 22,
          paddingTop: 20,
          paddingBottom: insets.bottom + 90,
        }}
      >
        {/* Date range selector */}
        <TouchableOpacity
          onPress={() => setDatePickerVisible(true)}
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 24,
            alignSelf: 'center',
            backgroundColor: colors.inputBg,
            paddingHorizontal: 16,
            paddingVertical: 8,
            borderRadius: 20,
          }}
        >
          <Text style={{ fontSize: 13, color: colors.primary, fontWeight: "600" }}>
            {startMonth} {startYear} - {endMonth} {endYear}
          </Text>
          <ChevronDown size={14} color={colors.primary} style={{ marginLeft: 6 }} />
        </TouchableOpacity>

        {loading ? (
          <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />
        ) : (
          <>
            {/* Stat boxes */}
            <View style={{ flexDirection: "row", gap: 12, marginBottom: 32 }}>
              {stats.map((stat) => (
                <View
                  key={stat.label}
                  style={{
                    flex: 1,
                    backgroundColor: colors.card,
                    borderRadius: radius.xl,
                    padding: 16,
                    alignItems: "center",
                    ...shadows.sm,
                    borderBottomWidth: 3,
                    borderBottomColor: stat.color,
                  }}
                >
                  <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: stat.color, alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
                    <stat.icon size={18} color={colors.text} />
                  </View>
                  <Text style={{ fontSize: 22, fontWeight: typography.weight.extrabold, color: colors.text, marginBottom: 2 }}>
                    {stat.value}
                  </Text>
                  <Text style={{ fontSize: 11, color: colors.textSecondary, fontWeight: "600" }}>
                    {stat.label}
                  </Text>
                </View>
              ))}
            </View>

            {/* Feedback section */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <Text style={{ fontSize: 18, fontWeight: typography.weight.extrabold, color: colors.text }}>
                Customer Feedback
              </Text>
              <TouchableOpacity>
                <Text style={{ fontSize: 12, color: colors.primary, fontWeight: '700' }}>See All</Text>
              </TouchableOpacity>
            </View>

            {feedbacks.map((fb) => (
              <View
                key={fb.id}
                style={{
                  backgroundColor: colors.card,
                  borderRadius: radius.xl,
                  padding: 16,
                  marginBottom: 14,
                  ...shadows.sm,
                }}
              >
                <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 10 }}>
                  <Image
                    source={{ uri: fb.avatar }}
                    style={{ width: 44, height: 44, borderRadius: 22 }}
                    contentFit="cover"
                  />
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                      <Text style={{ fontSize: 14, fontWeight: "700", color: colors.text }}>{fb.name}</Text>
                      <Text style={{ fontSize: 11, color: colors.textMuted }}>{fb.date}</Text>
                    </View>
                    <StarRow rating={fb.rating} />
                  </View>
                </View>
                <View style={{ alignSelf: "flex-start", backgroundColor: colors.inputBg, borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4, marginBottom: 8 }}>
                  <Text style={{ fontSize: 10, fontWeight: "700", color: colors.primary }}>{fb.service}</Text>
                </View>
                <Text style={{ fontSize: 13, color: colors.textSecondary, lineHeight: 20 }}>{fb.comment}</Text>
              </View>
            ))}
          </>
        )}
      </ScrollView>

      <BusinessTabBar active="Insights" />

      <DatePickerModal
        visible={datePickerVisible}
        onClose={() => setDatePickerVisible(false)}
        startMonth={startMonth}
        startYear={startYear}
        endMonth={endMonth}
        endYear={endYear}
        onApply={handleApply}
      />
    </View>
  );
}
