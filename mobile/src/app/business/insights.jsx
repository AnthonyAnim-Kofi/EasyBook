import { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, Modal } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Menu, ChevronDown, Star, X } from "lucide-react-native";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import BusinessTabBar from "@/components/BusinessTabBar";

const PRIMARY = "#00A896";
const BG = "#FFFBF0";

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
const YEARS = ["2024", "2025", "2026", "2027"];

const INITIAL_STATS = [
  { label: "Bookings", value: "25", color: "#E0F5F3" },
  { label: "Shares", value: "10", color: "#E8F4FF" },
  { label: "Reviews", value: "20", color: "#FFF0E8" },
];

const feedbacks = [
  {
    id: "1",
    name: "Abena M.",
    avatar:
      "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=100",
    rating: 5,
    service: "Haircut",
    comment:
      "Amazing experience! Will definitely come back. The staff were so friendly and professional.",
    date: "2 days ago",
  },
  {
    id: "2",
    name: "Kwame A.",
    avatar:
      "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100",
    rating: 4,
    service: "Spa",
    comment:
      "Really relaxing. The environment was clean and the service was top notch.",
    date: "1 week ago",
  },
  {
    id: "3",
    name: "Ama O.",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100",
    rating: 5,
    service: "Facial",
    comment:
      "Best facial I've ever had! My skin is glowing. Highly recommend this place.",
    date: "2 weeks ago",
  },
  {
    id: "4",
    name: "Kojo D.",
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100",
    rating: 3,
    service: "Haircut",
    comment:
      "Good service but the wait was a bit long. The quality of the cut was great though.",
    date: "3 weeks ago",
  },
];

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
          backgroundColor: "#fff",
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
          <Text style={{ fontSize: 18, fontWeight: "800", color: "#1A1A1A" }}>
            Select Date Range
          </Text>
          <TouchableOpacity onPress={onClose}>
            <X size={22} color="#888" />
          </TouchableOpacity>
        </View>

        <View style={{ flexDirection: "row", gap: 16 }}>
          {/* From */}
          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontSize: 12,
                fontWeight: "700",
                color: "#AAA",
                marginBottom: 10,
                textAlign: "center",
              }}
            >
              FROM
            </Text>
            <ScrollView
              style={{ height: 180 }}
              showsVerticalScrollIndicator={false}
            >
              {MONTHS.map((m) => (
                <TouchableOpacity
                  key={m}
                  onPress={() => setSelStartMonth(m)}
                  style={{
                    paddingVertical: 10,
                    alignItems: "center",
                    borderRadius: 10,
                    backgroundColor:
                      selStartMonth === m ? "#E0F5F3" : "transparent",
                  }}
                >
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: selStartMonth === m ? "700" : "400",
                      color: selStartMonth === m ? PRIMARY : "#555",
                    }}
                  >
                    {m}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Divider */}
          <View
            style={{
              width: 1.5,
              backgroundColor: PRIMARY,
              alignSelf: "stretch",
              marginVertical: 30,
            }}
          />

          {/* To */}
          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontSize: 12,
                fontWeight: "700",
                color: "#AAA",
                marginBottom: 10,
                textAlign: "center",
              }}
            >
              TO
            </Text>
            <ScrollView
              style={{ height: 180 }}
              showsVerticalScrollIndicator={false}
            >
              {MONTHS.map((m) => (
                <TouchableOpacity
                  key={m}
                  onPress={() => setSelEndMonth(m)}
                  style={{
                    paddingVertical: 10,
                    alignItems: "center",
                    borderRadius: 10,
                    backgroundColor:
                      selEndMonth === m ? "#E0F5F3" : "transparent",
                  }}
                >
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: selEndMonth === m ? "700" : "400",
                      color: selEndMonth === m ? PRIMARY : "#555",
                    }}
                  >
                    {m}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>

        {/* Year row */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-around",
            marginTop: 16,
            marginBottom: 20,
          }}
        >
          {YEARS.map((y) => (
            <TouchableOpacity
              key={y}
              onPress={() => {
                setSelStartYear(y);
                setSelEndYear(y);
              }}
              style={{
                paddingHorizontal: 16,
                paddingVertical: 8,
                borderRadius: 20,
                backgroundColor: selStartYear === y ? PRIMARY : "#F5F5F5",
              }}
            >
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: "700",
                  color: selStartYear === y ? "#fff" : "#555",
                }}
              >
                {y}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          onPress={() => {
            onApply(selStartMonth, selStartYear, selEndMonth, selEndYear);
            onClose();
          }}
          style={{
            backgroundColor: PRIMARY,
            borderRadius: 30,
            paddingVertical: 16,
            alignItems: "center",
          }}
        >
          <Text style={{ color: "#fff", fontSize: 16, fontWeight: "700" }}>
            Apply
          </Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
}

export default function InsightsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [datePickerVisible, setDatePickerVisible] = useState(false);
  const [startMonth, setStartMonth] = useState("May");
  const [startYear, setStartYear] = useState("2025");
  const [endMonth, setEndMonth] = useState("May");
  const [endYear, setEndYear] = useState("2026");
  const [currentStats, setCurrentStats] = useState(INITIAL_STATS);

  const handleApply = (sm, sy, em, ey) => {
    setStartMonth(sm);
    setStartYear(sy);
    setEndMonth(em);
    setEndYear(ey);
    
    // Simulate data fetching/filtering based on date range
    // In a real app, this would be an API call
    setCurrentStats([
      { label: "Bookings", value: Math.floor(Math.random() * 50 + 10).toString(), color: "#E0F5F3" },
      { label: "Shares", value: Math.floor(Math.random() * 20 + 5).toString(), color: "#E8F4FF" },
      { label: "Reviews", value: Math.floor(Math.random() * 30 + 5).toString(), color: "#FFF0E8" },
    ]);
  };

  return (
    <View style={{ flex: 1, backgroundColor: BG }}>
      <StatusBar style="dark" />

      {/* Header */}
      <View
        style={{
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
          Performance
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 22,
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
          }}
        >
          <Text style={{ fontSize: 14, color: PRIMARY, fontWeight: "600" }}>
            From {startMonth} {startYear} to {endMonth} {endYear}
          </Text>
          <ChevronDown size={16} color={PRIMARY} style={{ marginLeft: 4 }} />
        </TouchableOpacity>

        {/* Stat boxes */}
        <View style={{ flexDirection: "row", gap: 12, marginBottom: 28 }}>
          {currentStats.map((stat) => (
            <View
              key={stat.label}
              style={{
                flex: 1,
                backgroundColor: stat.color,
                borderRadius: 20,
                padding: 18,
                alignItems: "center",
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.04,
                shadowRadius: 6,
                elevation: 1,
              }}
            >
              <Text
                style={{
                  fontSize: 32,
                  fontWeight: "800",
                  color: "#1A1A1A",
                  marginBottom: 4,
                }}
              >
                {stat.value}
              </Text>
              <Text style={{ fontSize: 12, color: "#666", fontWeight: "600" }}>
                {stat.label}
              </Text>
            </View>
          ))}
        </View>

        {/* Feedback section */}
        <Text
          style={{
            fontSize: 17,
            fontWeight: "800",
            color: "#1A1A1A",
            marginBottom: 16,
          }}
        >
          Feedback from customers
        </Text>

        {feedbacks.map((fb) => (
          <View
            key={fb.id}
            style={{
              backgroundColor: "#fff",
              borderRadius: 20,
              padding: 16,
              marginBottom: 14,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.05,
              shadowRadius: 8,
              elevation: 2,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 10,
              }}
            >
              <Image
                source={{ uri: fb.avatar }}
                style={{ width: 44, height: 44, borderRadius: 22 }}
                contentFit="cover"
              />
              <View style={{ flex: 1, marginLeft: 12 }}>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: "700",
                      color: "#1A1A1A",
                    }}
                  >
                    {fb.name}
                  </Text>
                  <Text style={{ fontSize: 11, color: "#AAA" }}>{fb.date}</Text>
                </View>
                <StarRow rating={fb.rating} />
              </View>
            </View>
            <View
              style={{
                alignSelf: "flex-start",
                backgroundColor: "#E0F5F3",
                borderRadius: 20,
                paddingHorizontal: 10,
                paddingVertical: 4,
                marginBottom: 8,
              }}
            >
              <Text style={{ fontSize: 11, fontWeight: "600", color: PRIMARY }}>
                {fb.service}
              </Text>
            </View>
            <Text style={{ fontSize: 13, color: "#555", lineHeight: 20 }}>
              {fb.comment}
            </Text>
          </View>
        ))}
      </ScrollView>

      {/* Replace the old bottom tab bar with: */}
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
