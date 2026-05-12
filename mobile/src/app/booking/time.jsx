import { useState, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Dimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { ArrowLeft } from "lucide-react-native";
import { useRouter, useLocalSearchParams } from "expo-router";

const PRIMARY = "#00A896";
const ITEM_H = 54;

const HOURS = Array.from({ length: 12 }, (_, i) =>
  String(i + 1).padStart(2, "0"),
);
const MINUTES = ["00", "15", "30", "45"];
const PERIODS = ["AM", "PM"];

function ScrollPicker({ data, selected, onSelect }) {
  const ref = useRef(null);
  return (
    <View
      style={{
        width: 80,
        height: ITEM_H * 3,
        overflow: "hidden",
        position: "relative",
      }}
    >
      {/* Highlight */}
      <View
        style={{
          position: "absolute",
          top: ITEM_H,
          left: 0,
          right: 0,
          height: ITEM_H,
          backgroundColor: "#E0F5F3",
          borderRadius: 12,
          zIndex: 0,
        }}
        pointerEvents="none"
      />
      <FlatList
        ref={ref}
        data={data}
        keyExtractor={(item) => item}
        showsVerticalScrollIndicator={false}
        snapToInterval={ITEM_H}
        decelerationRate="fast"
        contentContainerStyle={{ paddingVertical: ITEM_H }}
        onMomentumScrollEnd={(e) => {
          const idx = Math.round(e.nativeEvent.contentOffset.y / ITEM_H);
          if (idx >= 0 && idx < data.length) onSelect(data[idx]);
        }}
        renderItem={({ item }) => (
          <View
            style={{
              height: ITEM_H,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text
              style={{
                fontSize: item === selected ? 28 : 20,
                fontWeight: item === selected ? "800" : "400",
                color: item === selected ? PRIMARY : "#CCCCCC",
              }}
            >
              {item}
            </Text>
          </View>
        )}
      />
    </View>
  );
}

export default function ChooseTimeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();

  const [hour, setHour] = useState("10");
  const [minute, setMinute] = useState("00");
  const [period, setPeriod] = useState("AM");

  const handleNext = () => {
    const timeStr = `${hour}:${minute} ${period}`;
    router.push({
      pathname: "/booking/details",
      params: { ...params, time: timeStr },
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
        <View style={{ flexDirection: "row", alignItems: "center" }}>
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
            Choose a time
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
        {/* Date summary */}
        <View
          style={{
            backgroundColor: "#E0F5F3",
            borderRadius: 16,
            padding: 16,
            marginBottom: 32,
            alignItems: "center",
          }}
        >
          <Text style={{ fontSize: 14, color: PRIMARY, fontWeight: "700" }}>
            📅 {params.date || "Selected Date"}
          </Text>
        </View>

        {/* Title */}
        <Text
          style={{
            fontSize: 22,
            fontWeight: "800",
            color: "#1A1A1A",
            textAlign: "center",
            marginBottom: 10,
          }}
        >
          What time works for you?
        </Text>
        <Text
          style={{
            fontSize: 14,
            color: "#888",
            textAlign: "center",
            marginBottom: 40,
          }}
        >
          Scroll to select your preferred time
        </Text>

        {/* Time Picker */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
          }}
        >
          <ScrollPicker data={HOURS} selected={hour} onSelect={setHour} />
          <Text
            style={{
              fontSize: 32,
              fontWeight: "800",
              color: "#1A1A1A",
              marginBottom: 4,
            }}
          >
            :
          </Text>
          <ScrollPicker data={MINUTES} selected={minute} onSelect={setMinute} />
          <View style={{ width: 80, alignItems: "center" }}>
            {PERIODS.map((p) => (
              <TouchableOpacity
                key={p}
                onPress={() => setPeriod(p)}
                style={{
                  width: 64,
                  height: ITEM_H,
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: 12,
                  backgroundColor: period === p ? PRIMARY : "transparent",
                  marginBottom: 4,
                }}
              >
                <Text
                  style={{
                    fontSize: 20,
                    fontWeight: "800",
                    color: period === p ? "#fff" : "#CCCCCC",
                  }}
                >
                  {p}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Selected time display */}
        <View style={{ alignItems: "center", marginTop: 36 }}>
          <Text
            style={{
              fontSize: 44,
              fontWeight: "800",
              color: "#1A1A1A",
              letterSpacing: 2,
            }}
          >
            {hour}:{minute} <Text style={{ color: PRIMARY }}>{period}</Text>
          </Text>
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
          style={{
            backgroundColor: PRIMARY,
            borderRadius: 30,
            paddingVertical: 17,
            alignItems: "center",
            shadowColor: PRIMARY,
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.3,
            shadowRadius: 12,
            elevation: 5,
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
            Fill in your details
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
