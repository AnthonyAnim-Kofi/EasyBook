import { useEffect, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Bell, ChevronLeft, Calendar, Info, CheckCircle, Gift } from "lucide-react-native";
import { colors, typography, radius, shadows } from "@/theme";
import { supabase } from "@/utils/supabase";
import { format } from "date-fns";

const NotificationIcon = ({ type }) => {
  switch (type) {
    case "confirmation":
      return (
        <View style={[styles.iconContainer, { backgroundColor: `${colors.primary}15` }]}>
          <CheckCircle size={22} color={colors.primary} />
        </View>
      );
    case "promo":
      return (
        <View style={[styles.iconContainer, { backgroundColor: "#FFF4E5" }]}>
          <Gift size={22} color="#FF9F43" />
        </View>
      );
    case "reminder":
      return (
        <View style={[styles.iconContainer, { backgroundColor: "#E8F0FE" }]}>
          <Calendar size={22} color="#3B82F6" />
        </View>
      );
    default:
      return (
        <View style={[styles.iconContainer, { backgroundColor: colors.inputBg }]}>
          <Info size={22} color={colors.textTertiary} />
        </View>
      );
  }
};

export default function NotificationsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let channel = null;
    let cancelled = false;

    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || cancelled) {
        setLoading(false);
        return;
      }
      await fetchNotifications(user);

      // Realtime: keep notifications in sync across devices (new inserts +
      // read-status flips made on another device).
      channel = supabase
        .channel(`notif-${user.id}-${Date.now()}`)
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'notifications', filter: `user_id=eq.${user.id}` },
          (payload) => {
            setNotifications((prev) => {
              if (payload.eventType === 'INSERT') {
                if (prev.some((n) => n.id === payload.new.id)) return prev;
                return [payload.new, ...prev];
              }
              if (payload.eventType === 'UPDATE') {
                return prev.map((n) => (n.id === payload.new.id ? { ...n, ...payload.new } : n));
              }
              if (payload.eventType === 'DELETE') {
                return prev.filter((n) => n.id !== payload.old.id);
              }
              return prev;
            });
          }
        )
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') fetchNotifications(user);
        });
    })();

    return () => {
      cancelled = true;
      if (channel) supabase.removeChannel(channel);
    };
  }, []);

  const fetchNotifications = async (userArg) => {
    try {
      setLoading(true);
      const user = userArg || (await supabase.auth.getUser()).data.user;
      if (!user) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setNotifications(data);
    } catch (err) {
      console.error('Error fetching notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', id);
      if (error) throw error;
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    } catch (err) {
      console.error('Error marking as read:', err);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar style="dark" />
      
      {/* Header */}
      <View style={{ 
        paddingTop: insets.top + 16, 
        paddingHorizontal: 20, 
        paddingBottom: 16, 
        backgroundColor: colors.card,
        flexDirection: "row",
        alignItems: "center",
        borderBottomWidth: 1,
        borderBottomColor: colors.borderLight,
      }}>
        <TouchableOpacity 
          onPress={() => router.back()}
          style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: colors.inputBg, alignItems: "center", justifyContent: "center", marginRight: 12 }}
        >
          <ChevronLeft size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={{ fontSize: typography.size.xl, fontWeight: typography.weight.extrabold, color: colors.text }}>
          Notifications
        </Text>
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 20, flexGrow: 1 }}
      >
        {loading ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : notifications.length === 0 ? (
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
              onPress={() => markAsRead(item.id)}
              style={{ 
                backgroundColor: item.is_read ? colors.card : colors.white, 
                borderRadius: radius.lg, 
                padding: 16, 
                marginBottom: 16,
                flexDirection: "row",
                alignItems: "flex-start",
                borderWidth: item.is_read ? 0 : 1,
                borderColor: colors.primarySurface,
                ...shadows.sm,
              }}
            >
              <NotificationIcon type={item.type} />
              <View style={{ flex: 1, marginLeft: 14 }}>
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                  <Text style={{ 
                    fontSize: typography.size.md, 
                    fontWeight: item.is_read ? typography.weight.bold : typography.weight.extrabold, 
                    color: colors.text 
                  }}>
                    {item.title}
                  </Text>
                  <Text style={{ fontSize: 10, color: colors.textMuted }}>
                    {format(new Date(item.created_at), 'MMM d')}
                  </Text>
                </View>
                <Text
                  numberOfLines={2}
                  ellipsizeMode="tail"
                  style={{ fontSize: typography.size.sm, color: colors.textSecondary, lineHeight: 20 }}
                >
                  {item.message}
                </Text>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = {
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
  },
};
