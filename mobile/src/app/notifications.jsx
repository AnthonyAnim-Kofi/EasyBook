import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Bell, ChevronLeft, Calendar, Info, CheckCircle } from "lucide-react-native";
import { colors, typography } from "@/theme";

const notifications = [
  {
    id: "1",
    title: "Appointment Confirmed",
    message: "Your appointment with Kofi's Spa has been confirmed for tomorrow at 10:00 AM.",
    time: "2h ago",
    type: "confirmation",
    icon: CheckCircle,
    color: colors.primary,
  },
  {
    id: "2",
    title: "Special Offer!",
    message: "Get 20% off your next haircut at any participating salon in Kumasi.",
    time: "5h ago",
    type: "promo",
    icon: Info,
    color: "#F59E0B",
  },
  {
    id: "3",
    title: "Reminder",
    message: "Don't forget your appointment today at 3:00 PM with Grace.",
    time: "1d ago",
    type: "reminder",
    icon: Calendar,
    color: "#3B82F6",
  },
];

export default function NotificationsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  return (
    <View style={{ flex: 1, backgroundColor: colors.backgroundAlt }}>
      <StatusBar style="dark" />
      
      {/* Header */}
      <View style={{ 
        paddingTop: insets.top + 16, 
        paddingHorizontal: 20, 
        paddingBottom: 16, 
        backgroundColor: colors.white,
        flexDirection: "row",
        alignItems: "center",
        borderBottomWidth: 1,
        borderBottomColor: colors.divider,
      }}>
        <TouchableOpacity 
          onPress={() => router.back()}
          style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: colors.backgroundAlt, alignItems: "center", justifyContent: "center", marginRight: 12 }}
        >
          <ChevronLeft size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={{ fontSize: typography.size.xl, fontWeight: typography.weight.bold, color: colors.text }}>
          Notifications
        </Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20 }}>
        {notifications.length === 0 ? (
          <View style={{ alignItems: "center", justifyContent: "center", marginTop: 100 }}>
            <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: colors.primarySurface, alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
              <Bell size={40} color={colors.primary} />
            </View>
            <Text style={{ fontSize: typography.size.lg, fontWeight: typography.weight.bold, color: colors.text }}>No notifications yet</Text>
            <Text style={{ fontSize: typography.size.md, color: colors.textTertiary, textAlign: "center", marginTop: 8 }}>
              We'll notify you when something important happens.
            </Text>
          </View>
        ) : (
          notifications.map((item) => (
            <TouchableOpacity 
              key={item.id}
              style={{ 
                backgroundColor: colors.white, 
                borderRadius: 16, 
                padding: 16, 
                marginBottom: 16,
                flexDirection: "row",
                alignItems: "flex-start",
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.05,
                shadowRadius: 8,
                elevation: 2,
              }}
            >
              <View style={{ 
                width: 44, 
                height: 44, 
                borderRadius: 22, 
                backgroundColor: `${item.color}15`, 
                alignItems: "center", 
                justifyContent: "center",
                marginRight: 14 
              }}>
                <item.icon size={22} color={item.color} />
              </View>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                  <Text style={{ fontSize: typography.size.md, fontWeight: typography.weight.bold, color: colors.text }}>{item.title}</Text>
                  <Text style={{ fontSize: typography.size.xs, color: colors.textTertiary }}>{item.time}</Text>
                </View>
                <Text style={{ fontSize: typography.size.body, color: colors.textTertiary, lineHeight: 20 }}>{item.message}</Text>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );
}
