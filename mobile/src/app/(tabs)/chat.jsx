import { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Search, MessageCircle } from "lucide-react-native";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { supabase } from "@/utils/supabase";
import { colors, typography, radius, shadows } from "@/theme";
import { format } from "date-fns";

export default function ChatScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchChats();
    
    const channel = supabase
      .channel('chat-list-realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        () => fetchChats()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchChats = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      // In a real app, you'd have a conversations table. 
      // Here we'll fetch unique partners from messages.
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:profiles!messages_sender_id_fkey(id, username, business_name, avatar_url),
          receiver:profiles!messages_receiver_id_fkey(id, username, business_name, avatar_url)
        `)
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Group by partner
      const groups = {};
      data.forEach(msg => {
        const partner = msg.sender_id === user.id ? msg.receiver : msg.sender;
        if (!groups[partner.id]) {
          groups[partner.id] = {
            id: partner.id,
            name: partner.business_name || partner.username || 'User',
            lastMsg: msg.text || (msg.media_type ? `Sent an ${msg.media_type}` : ''),
            time: format(new Date(msg.created_at), 'p'),
            unread: msg.receiver_id === user.id && !msg.is_read ? 1 : 0,
            image: partner.avatar_url || "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=200",
            rawTime: new Date(msg.created_at)
          };
        } else if (msg.receiver_id === user.id && !msg.is_read) {
          groups[partner.id].unread += 1;
        }
      });

      setChats(Object.values(groups).sort((a, b) => b.rawTime - a.rawTime));
    } catch (err) {
      console.error('Error fetching chats:', err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = chats.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar style="light" />
      <View
        style={{
          backgroundColor: colors.primary,
          paddingTop: insets.top + 16,
          paddingHorizontal: 22,
          paddingBottom: 28,
        }}
      >
        <Text
          style={{
            fontSize: typography.size.xxl,
            fontWeight: typography.weight.extrabold,
            color: colors.white,
            marginBottom: 4,
          }}
        >
          Messages
        </Text>
        <Text
          style={{
            fontSize: typography.size.sm,
            color: "rgba(255,255,255,0.7)",
            marginBottom: 16,
          }}
        >
          Chat with your service providers
        </Text>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: colors.white,
            borderRadius: radius.md,
            paddingHorizontal: 14,
            ...shadows.sm,
          }}
        >
          <Search size={18} color={colors.textMuted} />
          <TextInput
            placeholder="Search messages..."
            placeholderTextColor={colors.textMuted}
            value={search}
            onChangeText={setSearch}
            style={{
              flex: 1,
              paddingVertical: 12,
              paddingHorizontal: 10,
              fontSize: typography.size.md,
              color: colors.text,
            }}
          />
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 80, flexGrow: 1 }}
        style={{
          flex: 1,
          marginTop: -16,
          borderTopLeftRadius: radius.xl,
          borderTopRightRadius: radius.xl,
          backgroundColor: colors.background,
        }}
      >
        <View style={{ paddingHorizontal: 22, paddingTop: 24 }}>
          {loading ? (
            <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />
          ) : filtered.length === 0 ? (
            <View style={{ alignItems: "center", paddingTop: 80 }}>
              <View style={{
                width: 80,
                height: 80,
                borderRadius: 40,
                backgroundColor: colors.primarySurface,
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 20
              }}>
                <MessageCircle size={40} color={colors.primary} />
              </View>
              <Text
                style={{
                  fontSize: typography.size.lg,
                  fontWeight: typography.weight.bold,
                  color: colors.text,
                  marginTop: 16,
                }}
              >
                No messages yet
              </Text>
              <Text style={{ fontSize: typography.size.md, color: colors.textTertiary, marginTop: 6, textAlign: 'center' }}>
                Book a service to start chatting with providers
              </Text>
            </View>
          ) : (
            filtered.map((chat) => (
              <TouchableOpacity
                key={chat.id}
                onPress={() => router.push({
                  pathname: "/business/message",
                  params: { id: chat.id, name: chat.name, avatar: chat.image }
                })}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  backgroundColor: colors.card,
                  borderRadius: radius.lg,
                  padding: 16,
                  marginBottom: 12,
                  ...shadows.sm,
                }}
              >
                <View style={{ position: "relative", marginRight: 14 }}>
                  <Image
                    source={{ uri: chat.image }}
                    style={{ width: 56, height: 56, borderRadius: 28 }}
                    contentFit="cover"
                  />
                  <View
                    style={{
                      position: "absolute",
                      bottom: 0,
                      right: 0,
                      width: 14,
                      height: 14,
                      borderRadius: 7,
                      backgroundColor: "#6BCB77",
                      borderWidth: 2,
                      borderColor: colors.card,
                    }}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: 4,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: typography.size.md,
                        fontWeight: typography.weight.bold,
                        color: colors.text,
                      }}
                    >
                      {chat.name}
                    </Text>
                    <Text style={{ fontSize: 11, color: colors.textMuted }}>
                      {chat.time}
                    </Text>
                  </View>
                  <Text style={{ fontSize: typography.size.sm, color: colors.textSecondary }} numberOfLines={1}>
                    {chat.lastMsg}
                  </Text>
                </View>
                {chat.unread > 0 && (
                  <View
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: 11,
                      backgroundColor: colors.primary,
                      alignItems: "center",
                      justifyContent: "center",
                      marginLeft: 8,
                    }}
                  >
                    <Text
                      style={{ color: colors.white, fontSize: 10, fontWeight: typography.weight.bold }}
                    >
                      {chat.unread}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}
