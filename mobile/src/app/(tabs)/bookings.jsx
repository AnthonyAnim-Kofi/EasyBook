import { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import {
  ArrowLeft,
  MapPin,
  Clock,
  ChevronRight,
  Info,
} from "lucide-react-native";
import { Image } from "expo-image";
import { useRouter } from "expo-router";

const PRIMARY = "#00A896";
const BG = "#FFF5F3";
const { width } = Dimensions.get("window");

const TABS = ["Upcoming", "Completed", "Cancelled"];

const ALL_BOOKINGS = [
  {
    id: "1",
    salon: "Kofi's Spa",
    location: "Kwabenya, Accra",
    time: "10:00 AM",
    date: "Mon, 13 May 2026",
    createdAt: "Created on 10 May 2026, 09:00 AM",
    status: "upcoming",
    image: "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=200",
  },
  {
    id: "2",
    salon: "Yanks Spa and Salon",
    location: "Takoradi, Ghana",
    time: "2:30 PM",
    date: "Wed, 15 May 2026",
    createdAt: "Created on 12 May 2026, 11:00 AM",
    status: "upcoming",
    image: "https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=200",
  },
  {
    id: "3",
    salon: "Magnus Spa",
    location: "East Legon, Accra",
    time: "11:00 AM",
    date: "Fri, 2 May 2026",
    createdAt: "Completed on 2 May 2026, 12:30 PM",
    status: "completed",
    image: "https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=200",
  },
  {
    id: "4",
    salon: "Sister Yaa's Spa",
    location: "Kasoa, Accra",
    time: "9:00 AM",
    date: "Tue, 28 Apr 2026",
    createdAt: "Completed on 28 Apr 2026, 10:15 AM",
    status: "completed",
    image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=200",
  },
  {
    id: "5",
    salon: "Elite Cuts Barber",
    location: "Kumasi, Ghana",
    time: "3:00 PM",
    date: "Sat, 25 Apr 2026",
    createdAt: "Cancelled on 24 Apr 2026, 08:00 AM",
    status: "cancelled",
    image: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=200",
  },
];

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
          width: 64,
          height: 64,
          borderRadius: 32,
          backgroundColor: "#E0F5F3",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 16,
        }}
      >
        <Info size={30} color={PRIMARY} />
      </View>
      <Text
        style={{
          fontSize: 17,
          fontWeight: "700",
          color: "#1A1A1A",
          marginBottom: 8,
          textAlign: "center",
        }}
      >
        {msg.title}
      </Text>
      <Text
        style={{
          fontSize: 14,
          color: "#AAA",
          textAlign: "center",
          lineHeight: 21,
        }}
      >
        {msg.sub}
      </Text>
    </View>
  );
}

function BookingCard({ item, isFirst, onPress, onClear, onRestore, tab }) {
  const isTeal = isFirst && tab === "Upcoming";

  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        backgroundColor: isTeal ? PRIMARY : "#fff",
        borderRadius: 20,
        marginBottom: 14,
        padding: 16,
        flexDirection: "row",
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: isTeal ? 0.12 : 0.06,
        shadowRadius: 10,
        elevation: isTeal ? 4 : 2,
      }}
    >
      {/* Circular image */}
      <Image
        source={{ uri: item.image }}
        style={{
          width: 62,
          height: 62,
          borderRadius: 31,
          borderWidth: 2.5,
          borderColor: isTeal ? "rgba(255,255,255,0.5)" : "#F0F0F0",
        }}
        contentFit="cover"
      />

      <View style={{ flex: 1, marginLeft: 14 }}>
        <Text
          style={{
            fontSize: 15,
            fontWeight: "800",
            color: isTeal ? "#fff" : "#1A1A1A",
            marginBottom: 8,
          }}
        >
          {item.salon}
        </Text>

        {/* Pills row */}
        <View style={{ flexDirection: "row", gap: 8, marginBottom: 10 }}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: isTeal ? "rgba(255,255,255,0.2)" : "#F5F5F5",
              borderRadius: 20,
              paddingHorizontal: 10,
              paddingVertical: 5,
            }}
          >
            <MapPin size={11} color={isTeal ? "#fff" : "#888"} />
            <Text
              style={{
                fontSize: 11,
                color: isTeal ? "#fff" : "#666",
                marginLeft: 4,
                fontWeight: "500",
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
              backgroundColor: isTeal ? "rgba(255,255,255,0.2)" : "#F5F5F5",
              borderRadius: 20,
              paddingHorizontal: 10,
              paddingVertical: 5,
            }}
          >
            <Clock size={11} color={isTeal ? "#fff" : "#888"} />
            <Text
              style={{
                fontSize: 11,
                color: isTeal ? "#fff" : "#666",
                marginLeft: 4,
                fontWeight: "500",
              }}
            >
              {item.time}
            </Text>
          </View>
        </View>

        {/* Created/status date */}
        <Text
          style={{
            fontSize: 11,
            color: isTeal ? "rgba(255,255,255,0.75)" : PRIMARY,
            fontWeight: "500",
          }}
        >
          {item.createdAt}
        </Text>

        {/* Action buttons for completed/cancelled */}
        {tab === "Completed" && (
          <TouchableOpacity
            onPress={onClear}
            style={{
              marginTop: 10,
              alignSelf: "flex-start",
              borderWidth: 1.5,
              borderColor: "#DDD",
              borderRadius: 20,
              paddingHorizontal: 16,
              paddingVertical: 6,
            }}
          >
            <Text style={{ fontSize: 12, fontWeight: "600", color: "#888" }}>
              Clear
            </Text>
          </TouchableOpacity>
        )}
        {tab === "Cancelled" && (
          <View style={{ flexDirection: "row", gap: 8, marginTop: 10 }}>
            <TouchableOpacity
              onPress={onRestore}
              style={{
                borderWidth: 1.5,
                borderColor: PRIMARY,
                borderRadius: 20,
                paddingHorizontal: 14,
                paddingVertical: 6,
              }}
            >
              <Text style={{ fontSize: 12, fontWeight: "600", color: PRIMARY }}>
                Restore
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={onClear}
              style={{
                borderWidth: 1.5,
                borderColor: "#DDD",
                borderRadius: 20,
                paddingHorizontal: 14,
                paddingVertical: 6,
              }}
            >
              <Text style={{ fontSize: 12, fontWeight: "600", color: "#888" }}>
                Clear
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <ChevronRight
        size={18}
        color={isTeal ? "rgba(255,255,255,0.7)" : "#CCC"}
      />
    </TouchableOpacity>
  );
}

export default function BookingsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("Upcoming");
  const [bookings, setBookings] = useState(ALL_BOOKINGS);

  const filtered = bookings.filter((b) => b.status === activeTab.toLowerCase());

  const handleClear = (id) =>
    setBookings((prev) => prev.filter((b) => b.id !== id));
  const handleRestore = (id) =>
    setBookings((prev) =>
      prev.map((b) => (b.id === id ? { ...b, status: "upcoming" } : b)),
    );

  return (
    <View style={{ flex: 1, backgroundColor: BG }}>
      <StatusBar style="dark" />

      {/* Header */}
      <View
        style={{
          backgroundColor: BG,
          paddingTop: insets.top + 16,
          paddingHorizontal: 22,
          paddingBottom: 8,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
          }}
        >
          <TouchableOpacity
            onPress={() => router.back()}
            style={{
              position: "absolute",
              left: 0,
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
            <ArrowLeft size={20} color="#1A1A1A" />
          </TouchableOpacity>
          <Text style={{ fontSize: 18, fontWeight: "800", color: "#1A1A1A" }}>
            Bookings
          </Text>
        </View>
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
              paddingVertical: 10,
              borderRadius: 30,
              alignItems: "center",
              backgroundColor: activeTab === tab ? PRIMARY : "#fff",
              borderWidth: 1.5,
              borderColor: activeTab === tab ? PRIMARY : "#E8E8E8",
              shadowColor: activeTab === tab ? PRIMARY : "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: activeTab === tab ? 0.2 : 0.03,
              shadowRadius: 6,
              elevation: activeTab === tab ? 3 : 1,
            }}
          >
            <Text
              style={{
                fontSize: 13,
                fontWeight: "700",
                color: activeTab === tab ? "#fff" : "#888",
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
        }}
      >
        {filtered.length === 0 ? (
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
                  pathname: "/business/detail",
                  params: { name: item.salon },
                })
              }
              onClear={() => handleClear(item.id)}
              onRestore={() => handleRestore(item.id)}
            />
          ))
        )}
      </ScrollView>
    </View>
  );
}
