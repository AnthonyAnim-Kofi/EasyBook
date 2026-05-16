import { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Bell, Edit3, ChevronRight } from "lucide-react-native";
import { Image } from "expo-image";
import { useRouter, useFocusEffect } from "expo-router";
import BusinessTabBar from "@/components/BusinessTabBar";
import authService from "@/services/auth";
import { supabase } from "@/utils/supabase";
import { format } from "date-fns";

const PRIMARY = "#00A896";
const { width } = Dimensions.get("window");

const FILTER_TABS = ["Active", "Upcoming", "Request"];

// Removed hardcoded bookings

function ActiveCard({ booking, onPress }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        backgroundColor: "#fff",
        borderRadius: 20,
        padding: 18,
        marginBottom: 14,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 10,
        elevation: 2,
      }}
    >
      {/* Customer row */}
      <View
        style={{ flexDirection: "row", alignItems: "center", marginBottom: 14 }}
      >
        <Image
          source={{ uri: booking.avatar }}
          style={{
            width: 52,
            height: 52,
            borderRadius: 26,
            borderWidth: 2,
            borderColor: "#F0F0F0",
          }}
          contentFit="cover"
        />
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={{ fontSize: 15, fontWeight: "800", color: "#1A1A1A" }}>
            {booking.customer}
          </Text>
          <Text style={{ fontSize: 12, color: "#888", marginTop: 2 }}>
            {booking.date} · {booking.time}
          </Text>
        </View>
        <ChevronRight size={18} color="#CCC" />
      </View>

      <View
        style={{ height: 1, backgroundColor: "#F5F5F5", marginBottom: 14 }}
      />

      {/* Charges + specialist */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          marginBottom: 12,
        }}
      >
        <View>
          <Text style={{ fontSize: 11, color: "#AAA", marginBottom: 3 }}>
            Service Charges
          </Text>
          <Text style={{ fontSize: 16, fontWeight: "800", color: PRIMARY }}>
            {booking.charge}
          </Text>
        </View>
        <View style={{ alignItems: "flex-end" }}>
          <Text style={{ fontSize: 11, color: "#AAA", marginBottom: 3 }}>
            Specialist
          </Text>
          <Text style={{ fontSize: 14, fontWeight: "700", color: "#1A1A1A" }}>
            {booking.specialist}
          </Text>
        </View>
      </View>

      {/* Services */}
      <View>
        <Text style={{ fontSize: 11, color: "#AAA", marginBottom: 6 }}>
          Services
        </Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
          {booking.services.map((s) => (
            <View
              key={s}
              style={{
                backgroundColor: "#E0F5F3",
                borderRadius: 20,
                paddingHorizontal: 12,
                paddingVertical: 5,
              }}
            >
              <Text style={{ fontSize: 12, fontWeight: "600", color: PRIMARY }}>
                {s}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </TouchableOpacity>
  );
}

function UpcomingCard({ booking, onPress }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        backgroundColor: "#fff",
        borderRadius: 20,
        padding: 18,
        marginBottom: 14,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 10,
        elevation: 2,
      }}
    >
      {/* Date banner */}
      <View
        style={{
          backgroundColor: "#F7F7F7",
          borderRadius: 12,
          paddingHorizontal: 14,
          paddingVertical: 10,
          marginBottom: 14,
          flexDirection: "row",
          alignItems: "center",
          gap: 8,
        }}
      >
        <Text style={{ fontSize: 13, fontWeight: "700", color: PRIMARY }}>
          📅 {booking.date} · {booking.time}
        </Text>
      </View>

      {/* Customer row */}
      <View
        style={{ flexDirection: "row", alignItems: "center", marginBottom: 14 }}
      >
        <Image
          source={{ uri: booking.avatar }}
          style={{
            width: 52,
            height: 52,
            borderRadius: 26,
            borderWidth: 2,
            borderColor: "#F0F0F0",
          }}
          contentFit="cover"
        />
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={{ fontSize: 15, fontWeight: "800", color: "#1A1A1A" }}>
            {booking.customer}
          </Text>
        </View>
        <ChevronRight size={18} color="#CCC" />
      </View>

      <View
        style={{ height: 1, backgroundColor: "#F5F5F5", marginBottom: 14 }}
      />

      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          marginBottom: 12,
        }}
      >
        <View>
          <Text style={{ fontSize: 11, color: "#AAA", marginBottom: 3 }}>
            Service Charges
          </Text>
          <Text style={{ fontSize: 16, fontWeight: "800", color: PRIMARY }}>
            {booking.charge}
          </Text>
        </View>
        <View style={{ alignItems: "flex-end" }}>
          <Text style={{ fontSize: 11, color: "#AAA", marginBottom: 3 }}>
            Specialist
          </Text>
          <Text style={{ fontSize: 14, fontWeight: "700", color: "#1A1A1A" }}>
            {booking.specialist}
          </Text>
        </View>
      </View>

      <View>
        <Text style={{ fontSize: 11, color: "#AAA", marginBottom: 6 }}>
          Services
        </Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
          {booking.services.map((s) => (
            <View
              key={s}
              style={{
                backgroundColor: "#E0F5F3",
                borderRadius: 20,
                paddingHorizontal: 12,
                paddingVertical: 5,
              }}
            >
              <Text style={{ fontSize: 12, fontWeight: "600", color: PRIMARY }}>
                {s}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </TouchableOpacity>
  );
}

function RequestCard({ booking, onAccept, onMessage, onPress }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        backgroundColor: "#fff",
        borderRadius: 20,
        padding: 18,
        marginBottom: 14,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 10,
        elevation: 2,
      }}
    >
      <View
        style={{ flexDirection: "row", alignItems: "center", marginBottom: 14 }}
      >
        <Image
          source={{ uri: booking.avatar }}
          style={{
            width: 52,
            height: 52,
            borderRadius: 26,
            borderWidth: 2,
            borderColor: "#F0F0F0",
          }}
          contentFit="cover"
        />
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={{ fontSize: 15, fontWeight: "800", color: "#1A1A1A" }}>
            {booking.customer}
          </Text>
          <Text style={{ fontSize: 12, color: "#888", marginTop: 2 }}>
            {booking.date} · {booking.time}
          </Text>
        </View>
      </View>

      <View
        style={{ height: 1, backgroundColor: "#F5F5F5", marginBottom: 14 }}
      />

      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          marginBottom: 12,
        }}
      >
        <View>
          <Text style={{ fontSize: 11, color: "#AAA", marginBottom: 3 }}>
            Service Charges
          </Text>
          <Text style={{ fontSize: 16, fontWeight: "800", color: PRIMARY }}>
            {booking.charge}
          </Text>
        </View>
        <View style={{ alignItems: "flex-end" }}>
          <Text style={{ fontSize: 11, color: "#AAA", marginBottom: 3 }}>
            Specialist
          </Text>
          <Text style={{ fontSize: 14, fontWeight: "700", color: "#1A1A1A" }}>
            {booking.specialist}
          </Text>
        </View>
      </View>

      <View style={{ marginBottom: 16 }}>
        <Text style={{ fontSize: 11, color: "#AAA", marginBottom: 6 }}>
          Services
        </Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
          {booking.services.map((s) => (
            <View
              key={s}
              style={{
                backgroundColor: "#E0F5F3",
                borderRadius: 20,
                paddingHorizontal: 12,
                paddingVertical: 5,
              }}
            >
              <Text style={{ fontSize: 12, fontWeight: "600", color: PRIMARY }}>
                {s}
              </Text>
            </View>
          ))}
        </View>
      </View>

      {/* Accept + Message buttons */}
      <View style={{ flexDirection: "row", gap: 10 }}>
        <TouchableOpacity
          onPress={onAccept}
          style={{
            flex: 1,
            backgroundColor: PRIMARY,
            borderRadius: 14,
            paddingVertical: 13,
            alignItems: "center",
          }}
        >
          <Text style={{ fontSize: 14, fontWeight: "700", color: "#fff" }}>
            Accept
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={onMessage}
          style={{
            flex: 1,
            borderWidth: 1.5,
            borderColor: PRIMARY,
            borderRadius: 14,
            paddingVertical: 13,
            alignItems: "center",
          }}
        >
          <Text style={{ fontSize: 14, fontWeight: "700", color: PRIMARY }}>
            Message
          </Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

export default function BusinessDashboardScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState("Active");
  const [allBookings, setAllBookings] = useState([]);
  const [user, setUser] = useState(null);
  const [businessData, setBusinessData] = useState(null);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [activeFilter])
  );

  const loadData = async () => {
    try {
      setLoading(true);
      const stored = await authService.getStoredUser();
      setUser(stored);

      if (!stored) return;

      // 1. Fetch the business owned by this user
      const { data: business, error: bizError } = await supabase
        .from('businesses')
        .select('id, image_url')
        .eq('owner_id', stored.id)
        .single();

      if (bizError) {
        console.warn('Business not found:', bizError);
        setLoading(false);
        return;
      }
      
      setBusinessData(business);

      // 2. Map filters to database statuses
      // DB statuses: pending, confirmed, completed, cancelled
      let statusFilter = 'confirmed';
      if (activeFilter === 'Active') statusFilter = 'confirmed';
      if (activeFilter === 'Upcoming') statusFilter = 'confirmed'; // Could be future confirmed
      if (activeFilter === 'Request') statusFilter = 'pending';

      const { data: bookingsData, error: bError } = await supabase
        .from('bookings')
        .select(`
          *,
          profiles:user_id (
            full_name,
            avatar_url
          ),
          package:packages (name)
        `)
        .eq('business_id', business.id)
        .eq('status', statusFilter)
        .order('date', { ascending: true });

      if (bError) throw bError;

      const formatted = (bookingsData || []).map(b => ({
        id: b.id,
        customer: b.profiles?.full_name || "Guest",
        avatar: b.profiles?.avatar_url || "https://ui-avatars.com/api/?name=" + (b.profiles?.full_name || "G"),
        charge: `GH₵ ${b.total_price || 0}`,
        specialist: "Owner", // Default for now
        services: b.package?.name ? [b.package.name] : ["General Service"],
        date: format(new Date(b.date), "dd MMM yyyy"),
        time: b.time,
        user_id: b.user_id,
        status: b.status === 'confirmed' ? 'active' : b.status === 'pending' ? 'request' : b.status
      }));

      setAllBookings(formatted);
    } catch (err) {
      console.error('Error loading dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (id) => {
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status: 'confirmed' })
        .eq('id', id);

      if (error) throw error;
      loadData();
    } catch (err) {
      Alert.alert("Error", "Could not accept booking");
    }
  };

  const filtered = allBookings; // Filtering is now done at the query level

  const BG = activeFilter === "Request" ? "#FFF5F3" : "#F7F7F7";

  return (
    <View style={{ flex: 1, backgroundColor: BG }}>
      <StatusBar style="dark" />

      {/* Header */}
      <View
        style={{
          backgroundColor: "#fff",
          paddingTop: insets.top + 14,
          paddingHorizontal: 22,
          paddingBottom: 18,
          borderBottomWidth: 1,
          borderBottomColor: "#F5F5F5",
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          {/* Avatar (left) */}
          <Image
            source={{
              uri: businessData?.image_url || user?.avatar_url || "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=100",
            }}
            style={{
              width: 44,
              height: 44,
              borderRadius: 22,
              borderWidth: 2,
              borderColor: PRIMARY,
              marginRight: 12,
            }}
            contentFit="cover"
          />
          {/* Greeting */}
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 17, fontWeight: "800", color: "#1A1A1A" }}>
              Hi {user?.full_name?.split(" ")[0] || "Owner"} 👋
            </Text>
            <Text style={{ fontSize: 12, color: "#888" }}>
              {user?.email || "business@easybook.com"}
            </Text>
          </View>
          {/* Bell */}
          <TouchableOpacity
            onPress={() => Alert.alert("Notifications", "You have no new notifications.")}
            style={{
              position: "relative",
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: "#F5F5F5",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Bell size={20} color="#1A1A1A" />
            <View
              style={{
                position: "absolute",
                top: 6,
                right: 6,
                width: 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: "#FF6B6B",
                borderWidth: 1.5,
                borderColor: "#fff",
              }}
            />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
      >
        {/* Your Bookings title */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            paddingHorizontal: 22,
            paddingTop: 24,
            paddingBottom: 16,
          }}
        >
          <Text style={{ fontSize: 20, fontWeight: "800", color: "#1A1A1A" }}>
            Your Bookings
          </Text>
          <TouchableOpacity
            onPress={() => Alert.alert("Edit", "Profile editing is coming soon.")}
            style={{
              width: 36,
              height: 36,
              borderRadius: 18,
              backgroundColor: "#E0F5F3",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Edit3 size={16} color={PRIMARY} />
          </TouchableOpacity>
        </View>

        {/* Filter tabs */}
        <View
          style={{
            flexDirection: "row",
            paddingHorizontal: 22,
            gap: 10,
            marginBottom: 20,
          }}
        >
          {FILTER_TABS.map((tab) => (
            <TouchableOpacity
              key={tab}
              onPress={() => setActiveFilter(tab)}
              style={{
                paddingHorizontal: 20,
                paddingVertical: 10,
                borderRadius: 30,
                backgroundColor: activeFilter === tab ? PRIMARY : "#fff",
                borderWidth: 1.5,
                borderColor: activeFilter === tab ? PRIMARY : "#E8E8E8",
                shadowColor: activeFilter === tab ? PRIMARY : "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: activeFilter === tab ? 0.2 : 0.03,
                shadowRadius: 6,
                elevation: activeFilter === tab ? 3 : 1,
              }}
            >
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: "700",
                  color: activeFilter === tab ? "#fff" : "#888",
                }}
              >
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Cards */}
        <View style={{ paddingHorizontal: 22 }}>
          {loading ? (
            <ActivityIndicator size="large" color={PRIMARY} style={{ marginTop: 40 }} />
          ) : filtered.length === 0 ? (
            <View style={{ alignItems: "center", paddingTop: 60 }}>
              <Text style={{ fontSize: 16, fontWeight: "700", color: "#CCC" }}>
                No {activeFilter.toLowerCase()} bookings
              </Text>
            </View>
          ) : (
            filtered.map((b) => {
              const params = {
                id: b.id,
                customer: b.customer,
                avatar: b.avatar,
                charge: b.charge,
                specialist: b.specialist,
                services: JSON.stringify(b.services),
                date: b.date,
                time: b.time,
                user_id: b.user_id,
                status: b.status,
              };
              if (activeFilter === "Active")
                return (
                  <ActiveCard
                    key={b.id}
                    booking={b}
                    onPress={() =>
                      router.push({
                        pathname: "/business/booking-detail",
                        params,
                      })
                    }
                  />
                );
              if (activeFilter === "Upcoming")
                return (
                  <UpcomingCard
                    key={b.id}
                    booking={b}
                    onPress={() =>
                      router.push({
                        pathname: "/business/booking-detail",
                        params,
                      })
                    }
                  />
                );
              return (
                <RequestCard
                  key={b.id}
                  booking={b}
                  onAccept={() => handleAccept(b.id)}
                  onMessage={() => router.push({ pathname: "/business/message", params: { id: b.user_id, name: b.customer } })}
                  onPress={() =>
                    router.push({
                      pathname: "/business/booking-detail",
                      params,
                    })
                  }
                />
              );
            })
          )}
        </View>
      </ScrollView>

      <BusinessTabBar active="Bookings" />
    </View>
  );
}
