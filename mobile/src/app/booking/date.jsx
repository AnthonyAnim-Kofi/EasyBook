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
import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react-native";
import { Image } from "expo-image";
import { useRouter, useLocalSearchParams } from "expo-router";

const PRIMARY = "#00A896";
const { width } = Dimensions.get("window");

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
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

function buildCalendar(year, month) {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  return cells;
}

const AVAILABLE_DAYS = [6, 9, 10, 12, 13, 15, 16, 17, 20, 22, 23, 24, 27];

export default function ChooseDateScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();
  const salonName = params.salon || "Yanks Spa and Salon";
  const service = params.service || "Classic Haircut";
  const specialist = params.specialist || "No Specialist";
  const salonImage = params.salonImage || "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=300";
  const specialistImage = params.specialistImage;

  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selectedDay, setSelectedDay] = useState(null);

  const cells = buildCalendar(viewYear, viewMonth);

  const prevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else setViewMonth((m) => m - 1);
    setSelectedDay(null);
  };
  const nextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else setViewMonth((m) => m + 1);
    setSelectedDay(null);
  };

  const handleNext = () => {
    if (!selectedDay) return;
    const dateStr = `${DAYS[new Date(viewYear, viewMonth, selectedDay).getDay()]}, ${selectedDay} ${MONTHS[viewMonth]} ${viewYear}`;
    router.push({
      pathname: "/booking/time",
      params: { ...params, date: dateStr },
    });
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#F7F7F7" }}>
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
            marginBottom: 0,
          }}
        >
          <TouchableOpacity
            onPress={() => router.back()}
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: "#F5F5F5",
              alignItems: "center",
              justifyContent: "center",
              marginRight: 14,
            }}
          >
            <ArrowLeft size={20} color="#1A1A1A" />
          </TouchableOpacity>
          <Text style={{ fontSize: 17, fontWeight: "700", color: "#1A1A1A" }}>
            Choose a date
          </Text>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          padding: 22,
          paddingBottom: insets.bottom + 110,
        }}
      >
        {/* Booking summary card */}
        <View
          style={{
            backgroundColor: "#fff",
            borderRadius: 20,
            padding: 16,
            marginBottom: 24,
            flexDirection: "row",
            alignItems: "center",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.06,
            shadowRadius: 8,
            elevation: 2,
          }}
        >
          <Image
            source={{
              uri: salonImage,
            }}
            style={{ width: 60, height: 60, borderRadius: 14 }}
            contentFit="cover"
          />
          <View style={{ marginLeft: 14, flex: 1 }}>
            <Text
              style={{
                fontSize: 15,
                fontWeight: "700",
                color: "#1A1A1A",
                marginBottom: 3,
              }}
            >
              {salonName}
            </Text>
            <Text style={{ fontSize: 13, color: "#888" }}>{service}</Text>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginTop: 4,
              }}
            >
              {specialist !== "No Specialist" && specialistImage && (
                <Image
                  source={{
                    uri: specialistImage,
                  }}
                  style={{ width: 20, height: 20, borderRadius: 10 }}
                  contentFit="cover"
                />
              )}
              <Text
                style={{
                  fontSize: 12,
                  color: PRIMARY,
                  fontWeight: "600",
                  marginLeft: specialist !== "No Specialist" ? 6 : 0,
                }}
              >
                {specialist}
              </Text>
            </View>
          </View>
        </View>

        {/* Calendar */}
        <View
          style={{
            backgroundColor: "#fff",
            borderRadius: 24,
            padding: 20,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.06,
            shadowRadius: 8,
            elevation: 2,
          }}
        >
          {/* Month nav */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 20,
            }}
          >
            <TouchableOpacity
              onPress={prevMonth}
              style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                backgroundColor: "#F5F5F5",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <ChevronLeft size={18} color="#555" />
            </TouchableOpacity>
            <Text style={{ fontSize: 16, fontWeight: "700", color: "#1A1A1A" }}>
              {MONTHS[viewMonth]} {viewYear}
            </Text>
            <TouchableOpacity
              onPress={nextMonth}
              style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                backgroundColor: "#F5F5F5",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <ChevronRight size={18} color="#555" />
            </TouchableOpacity>
          </View>

          {/* Day headers */}
          <View style={{ flexDirection: "row", marginBottom: 10 }}>
            {DAYS.map((d) => (
              <Text
                key={d}
                style={{
                  flex: 1,
                  textAlign: "center",
                  fontSize: 12,
                  fontWeight: "600",
                  color: "#BBBBBB",
                }}
              >
                {d}
              </Text>
            ))}
          </View>

          {/* Grid */}
          <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
            {cells.map((day, i) => {
              if (!day)
                return (
                  <View
                    key={`e-${i}`}
                    style={{ width: (width - 88) / 7, height: 44 }}
                  />
                );
              const isAvailable = AVAILABLE_DAYS.includes(day);
              const isSelected = selectedDay === day;
              const isToday =
                day === today.getDate() &&
                viewMonth === today.getMonth() &&
                viewYear === today.getFullYear();
              return (
                <TouchableOpacity
                  key={day}
                  onPress={() => isAvailable && setSelectedDay(day)}
                  disabled={!isAvailable}
                  style={{
                    width: (width - 88) / 7,
                    height: 44,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <View
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 18,
                      backgroundColor: isSelected
                        ? PRIMARY
                        : isAvailable && !isSelected
                          ? "#E0F5F3"
                          : "transparent",
                      alignItems: "center",
                      justifyContent: "center",
                      borderWidth: isToday && !isSelected ? 1.5 : 0,
                      borderColor: PRIMARY,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 14,
                        fontWeight: isSelected || isToday ? "700" : "500",
                        color: isSelected
                          ? "#fff"
                          : isAvailable
                            ? PRIMARY
                            : "#CCCCCC",
                      }}
                    >
                      {day}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Legend */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              marginTop: 16,
              gap: 20,
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <View
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: 5,
                  backgroundColor: PRIMARY,
                  marginRight: 6,
                }}
              />
              <Text style={{ fontSize: 12, color: "#888" }}>Available</Text>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <View
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: 5,
                  backgroundColor: "#EEE",
                  marginRight: 6,
                }}
              />
              <Text style={{ fontSize: 12, color: "#888" }}>Unavailable</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Bottom button */}
      <View
        style={{
          position: "absolute",
          bottom: insets.bottom + 16,
          left: 22,
          right: 22,
        }}
      >
        <TouchableOpacity
          onPress={handleNext}
          disabled={!selectedDay}
          style={{
            backgroundColor: selectedDay ? PRIMARY : "#CCCCCC",
            borderRadius: 30,
            paddingVertical: 17,
            alignItems: "center",
            shadowColor: PRIMARY,
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: selectedDay ? 0.3 : 0,
            shadowRadius: 12,
            elevation: selectedDay ? 5 : 0,
          }}
        >
          <Text
            style={{
              color: "#fff",
              fontSize: 16,
              fontWeight: "700",
              letterSpacing: 0.5,
            }}
          >
            Choose a time
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
