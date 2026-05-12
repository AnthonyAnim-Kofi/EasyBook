import { View, Text, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  CalendarCheck,
  MessageCircle,
  BarChart2,
  User,
} from "lucide-react-native";
import { useRouter } from "expo-router";

const PRIMARY = "#00A896";

const TABS = [
  { label: "Bookings", icon: CalendarCheck, href: "/business/dashboard" },
  { label: "Chat", icon: MessageCircle, href: "/business/inbox" },
  { label: "Insights", icon: BarChart2, href: "/business/insights" },
  { label: "Profile", icon: User, href: "/business/profile" },
];

export default function BusinessTabBar({ active }) {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  return (
    <View
      style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: "#fff",
        borderTopWidth: 1,
        borderTopColor: "#F0F0F0",
        flexDirection: "row",
        paddingBottom: insets.bottom + 4,
        paddingTop: 8,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -3 },
        shadowOpacity: 0.06,
        shadowRadius: 10,
        elevation: 10,
      }}
    >
      {TABS.map((tab) => {
        const isActive = active === tab.label;
        return (
          <TouchableOpacity
            key={tab.label}
            onPress={() => !isActive && router.push(tab.href)}
            style={{ flex: 1, alignItems: "center", paddingVertical: 4 }}
          >
            <tab.icon size={22} color={isActive ? PRIMARY : "#BBBBBB"} />
            <Text
              style={{
                fontSize: 11,
                fontWeight: "600",
                marginTop: 4,
                color: isActive ? PRIMARY : "#BBBBBB",
              }}
            >
              {tab.label}
            </Text>
            {isActive && (
              <View
                style={{
                  width: 4,
                  height: 4,
                  borderRadius: 2,
                  backgroundColor: PRIMARY,
                  marginTop: 3,
                }}
              />
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
