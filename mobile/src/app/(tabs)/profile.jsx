import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native";
import { useState, useEffect } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import {
  Home,
  Settings2,
  CreditCard,
  CalendarClock,
  Heart,
  LogOut,
  ChevronRight,
  Briefcase,
} from "lucide-react-native";
import { useRouter } from "expo-router";
import { Image } from "expo-image";
import authService from "@/services/auth";
import bookingService from "@/services/booking";

const PRIMARY = "#00A896";
const BG = "#F7F7F7";

const menuItems = [
  { id: "1", label: "Home", icon: Home, href: "/(tabs)/home" },
  { id: "2", label: "Preferences", icon: Settings2, href: null },
  {
    id: "3",
    label: "Payment methods",
    icon: CreditCard,
    href: "/payment/method",
  },
  {
    id: "4",
    label: "Appointment history",
    icon: CalendarClock,
    href: "/(tabs)/bookings",
  },
  { id: "5", label: "My favourites", icon: Heart, href: "/favourites" },
];

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookingCount, setBookingCount] = useState(0);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const storedUser = await authService.getStoredUser();
      setUser(storedUser);
      
      // Also try to get fresh data and bookings
      const [freshUser, bookings] = await Promise.allSettled([
        authService.getMe(),
        bookingService.list()
      ]);

      if (freshUser.status === 'fulfilled') {
        setUser(freshUser.value);
      }
      if (bookings.status === 'fulfilled') {
        setBookingCount(bookings.value.length || 0);
      }
    } catch (error) {
      console.error("Error loading profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await authService.signOut();
    router.replace("/signin");
  };

  if (loading && !user) {
    return (
      <View style={{ flex: 1, backgroundColor: BG, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color={PRIMARY} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: BG }}>
      <StatusBar style="dark" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 80 }}
      >
        {/* Top safe area padding */}
        <View
          style={{
            paddingTop: insets.top + 20,
            paddingHorizontal: 22,
            alignItems: "center",
            marginBottom: 24,
          }}
        >
          <Text style={{ fontSize: 20, fontWeight: "800", color: "#1A1A1A" }}>
            Profile
          </Text>
        </View>

        {/* Avatar */}
        <View style={{ alignItems: "center", marginBottom: 16 }}>
          <View style={{ position: "relative" }}>
            <View
              style={{
                width: 92,
                height: 92,
                borderRadius: 46,
                borderWidth: 3,
                borderColor: PRIMARY,
                overflow: "hidden",
              }}
            >
              <Image
                source={{
                  uri: user?.avatar_url || "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=300",
                }}
                style={{ width: "100%", height: "100%" }}
                contentFit="cover"
              />
            </View>
          </View>
          {/* Name + verified */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginTop: 12,
              gap: 6,
            }}
          >
            <Text style={{ fontSize: 20, fontWeight: "800", color: "#1A1A1A" }}>
              {user?.full_name || "User"}
            </Text>
            <View
              style={{
                width: 20,
                height: 20,
                borderRadius: 10,
                backgroundColor: PRIMARY,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text style={{ color: "#fff", fontSize: 11, fontWeight: "800" }}>
                ✓
              </Text>
            </View>
          </View>
          <Text style={{ fontSize: 14, color: "#888", marginTop: 3 }}>
            @{user?.username || user?.email?.split('@')[0] || "user"}
          </Text>
        </View>

        {/* Stats card */}
        <View
          style={{
            marginHorizontal: 22,
            backgroundColor: "#fff",
            borderRadius: 20,
            padding: 20,
            marginBottom: 20,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.06,
            shadowRadius: 10,
            elevation: 3,
          }}
        >
          <View
            style={{ flexDirection: "row", justifyContent: "space-around" }}
          >
            <View style={{ alignItems: "center" }}>
              <Text
                style={{ fontSize: 22, fontWeight: "800", color: "#1A1A1A" }}
              >
                {bookingCount}
              </Text>
              <Text style={{ fontSize: 12, color: "#888", marginTop: 3 }}>
                Bookings
              </Text>
            </View>
            <View style={{ width: 1, backgroundColor: "#EEEEEE" }} />
            <View style={{ alignItems: "center" }}>
              <Text
                style={{ fontSize: 22, fontWeight: "800", color: "#1A1A1A" }}
              >
                4.5
              </Text>
              <Text style={{ fontSize: 12, color: "#888", marginTop: 3 }}>
                Rating
              </Text>
            </View>
            <View style={{ width: 1, backgroundColor: "#EEEEEE" }} />
            <View style={{ alignItems: "center" }}>
              <Text
                style={{ fontSize: 22, fontWeight: "800", color: "#1A1A1A" }}
              >
                5
              </Text>
              <Text style={{ fontSize: 12, color: "#888", marginTop: 3 }}>
                Reviews
              </Text>
            </View>
          </View>
        </View>

        {/* Edit Profile */}
        <View style={{ paddingHorizontal: 22, marginBottom: 24 }}>
          <TouchableOpacity
            onPress={() => router.push("/edit-profile")}
            style={{
              borderWidth: 2,
              borderColor: PRIMARY,
              borderRadius: 30,
              paddingVertical: 13,
              alignItems: "center",
            }}
          >
            <Text style={{ fontSize: 15, fontWeight: "700", color: PRIMARY }}>
              Edit profile
            </Text>
          </TouchableOpacity>
        </View>

        {/* Divider */}
        <View
          style={{
            height: 1,
            backgroundColor: "#EBEBEB",
            marginHorizontal: 22,
            marginBottom: 20,
          }}
        />

        {/* Menu Items */}
        <View style={{ paddingHorizontal: 22 }}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={item.id}
              onPress={() => item.href && router.push(item.href)}
              style={{
                flexDirection: "row",
                alignItems: "center",
                paddingVertical: 16,
                borderBottomWidth: index < menuItems.length - 1 ? 1 : 0,
                borderBottomColor: "#EFEFEF",
              }}
            >
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: "#E0F5F3",
                  alignItems: "center",
                  justifyContent: "center",
                  marginRight: 16,
                }}
              >
                <item.icon size={18} color={PRIMARY} />
              </View>
              <Text
                style={{
                  flex: 1,
                  fontSize: 15,
                  fontWeight: "600",
                  color: "#1A1A1A",
                }}
              >
                {item.label}
              </Text>
              <ChevronRight size={18} color="#CCCCCC" />
            </TouchableOpacity>
          ))}

          {/* Switch to Business */}
          <TouchableOpacity
            onPress={() => router.push("/business/dashboard")}
            style={{
              flexDirection: "row",
              alignItems: "center",
              paddingVertical: 16,
              borderTopWidth: 1,
              borderTopColor: "#EFEFEF",
            }}
          >
            <View
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: "#E0F5F3",
                alignItems: "center",
                justifyContent: "center",
                marginRight: 16,
              }}
            >
              <Briefcase size={18} color={PRIMARY} />
            </View>
            <Text
              style={{
                flex: 1,
                fontSize: 15,
                fontWeight: "600",
                color: PRIMARY,
              }}
            >
              Switch to Business
            </Text>
            <ChevronRight size={18} color="#CCCCCC" />
          </TouchableOpacity>

          {/* Log Out */}
          <TouchableOpacity
            onPress={handleLogout}
            style={{
              flexDirection: "row",
              alignItems: "center",
              paddingVertical: 16,
            }}
          >
            <View
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: "#FFE5E5",
                alignItems: "center",
                justifyContent: "center",
                marginRight: 16,
              }}
            >
              <LogOut size={18} color="#D63031" />
            </View>
            <Text
              style={{
                flex: 1,
                fontSize: 15,
                fontWeight: "600",
                color: "#D63031",
              }}
            >
              Log out
            </Text>
            <ChevronRight size={18} color="#CCCCCC" />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}
