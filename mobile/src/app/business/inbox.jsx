import { useState, useEffect } from "react";
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
import {
  Search,
  PhoneCall,
  PhoneIncoming,
  PhoneMissed,
  Phone,
  MessageCircle,
} from "lucide-react-native";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import BusinessTabBar from "@/components/BusinessTabBar";
import { supabase } from "@/utils/supabase";
import { colors, typography, shadows, radius } from "@/theme";
import { format } from "date-fns";

export default function BusinessInboxScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("Chat");
  const [loading, setLoading] = useState(true);
  const [partners, setPartners] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchConversations();
    
    // Subscribe to messages to update list in real-time
    const channel = supabase
      .channel('inbox-updates')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, () => {
        fetchConversations();
      })
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

  const fetchConversations = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch all messages involving the user
      const { data: messages, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:profiles!messages_sender_id_fkey(full_name, avatar_url),
          receiver:profiles!messages_receiver_id_fkey(full_name, avatar_url)
        `)
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Group by partner
      const partnerMap = new Map();
      messages.forEach(msg => {
        const partnerId = msg.sender_id === user.id ? msg.receiver_id : msg.sender_id;
        if (!partnerMap.has(partnerId)) {
          const partnerInfo = msg.sender_id === user.id ? msg.receiver : msg.sender;
          partnerMap.set(partnerId, {
            id: partnerId,
            name: partnerInfo?.full_name || 'User',
            avatar: partnerInfo?.avatar_url,
            lastMsg: msg.text || (msg.media_type === 'image' ? 'Sent an image' : 'Sent a voice note'),
            time: msg.created_at,
            unread: 0, // In a real app, track unread status in DB
            online: false // Placeholder for online status
          });
        }
      });

      setPartners(Array.from(partnerMap.values()));
    } catch (err) {
      console.error('Error fetching inbox:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredPartners = partners.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    p.lastMsg.toLowerCase().includes(search.toLowerCase())
  );

  const renderContent = () => {
    if (loading) {
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 100 }}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      );
    }

    if (activeTab === "Chat") {
      if (filteredPartners.length === 0) {
        return (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', marginTop: 100 }}>
             <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: colors.inputBg, alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                <MessageCircle size={32} color={colors.textMuted} />
             </View>
             <Text style={{ fontSize: 16, fontWeight: '700', color: colors.text, marginBottom: 8 }}>No conversations yet</Text>
             <Text style={{ fontSize: 14, color: colors.textSecondary, textAlign: 'center', paddingHorizontal: 40 }}>
                When you start messaging customers, they will appear here.
             </Text>
          </View>
        );
      }

      return filteredPartners.map((chat) => (
        <TouchableOpacity
          key={chat.id}
          onPress={() =>
            router.push({
              pathname: "/business/message",
              params: { id: chat.id, name: chat.name, avatar: chat.avatar },
            })
          }
          style={{
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: colors.card,
            borderRadius: radius.xl,
            padding: 14,
            marginBottom: 12,
            ...shadows.sm,
          }}
        >
          <View style={{ position: "relative", marginRight: 12 }}>
            <Image
              source={{ uri: chat.avatar || "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150" }}
              style={{ width: 54, height: 54, borderRadius: 27 }}
              contentFit="cover"
            />
            {chat.online && (
              <View
                style={{
                  position: "absolute",
                  bottom: 1,
                  right: 1,
                  width: 13,
                  height: 13,
                  borderRadius: 6.5,
                  backgroundColor: "#6BCB77",
                  borderWidth: 2,
                  borderColor: colors.card,
                }}
              />
            )}
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
                  fontSize: 15,
                  fontWeight: typography.weight.extrabold,
                  color: colors.text,
                }}
              >
                {chat.name}
              </Text>
              <Text style={{ fontSize: 11, color: colors.textMuted }}>
                {format(new Date(chat.time), 'p')}
              </Text>
            </View>
            <Text
              style={{ fontSize: 13, color: colors.textSecondary }}
              numberOfLines={1}
            >
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
                style={{ color: colors.white, fontSize: 11, fontWeight: "700" }}
              >
                {chat.unread}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      ));
    }

    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', marginTop: 100 }}>
         <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: colors.inputBg, alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
            <Phone size={32} color={colors.textMuted} />
         </View>
         <Text style={{ fontSize: 16, fontWeight: '700', color: colors.text, marginBottom: 8 }}>No call history</Text>
         <Text style={{ fontSize: 14, color: colors.textSecondary, textAlign: 'center', paddingHorizontal: 40 }}>
            Recent voice calls will show up here.
         </Text>
      </View>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar style="dark" />

      {/* Header */}
      <View
        style={{
          paddingTop: insets.top + 16,
          paddingHorizontal: 22,
          paddingBottom: 16,
          backgroundColor: colors.background,
        }}
      >
        <Text
          style={{
            fontSize: 24,
            fontWeight: typography.weight.extrabold,
            color: colors.text,
            marginBottom: 16,
          }}
        >
          Inbox
        </Text>

        {/* Chat / Calls pills */}
        <View
          style={{
            flexDirection: "row",
            backgroundColor: colors.card,
            borderRadius: 30,
            padding: 4,
            ...shadows.sm,
          }}
        >
          {["Chat", "Calls"].map((tab) => (
            <TouchableOpacity
              key={tab}
              onPress={() => setActiveTab(tab)}
              style={{
                flex: 1,
                paddingVertical: 10,
                borderRadius: 26,
                alignItems: "center",
                backgroundColor: activeTab === tab ? colors.primary : "transparent",
              }}
            >
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "700",
                  color: activeTab === tab ? colors.white : colors.textSecondary,
                }}
              >
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Search */}
      <View style={{ paddingHorizontal: 22, marginBottom: 12 }}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: colors.card,
            borderRadius: radius.lg,
            paddingHorizontal: 14,
            borderWidth: 1,
            borderColor: colors.borderLight,
          }}
        >
          <Search size={16} color={colors.textMuted} />
          <TextInput
            placeholder={
              activeTab === "Chat" ? "Search messages..." : "Search calls..."
            }
            placeholderTextColor={colors.textMuted}
            value={search}
            onChangeText={setSearch}
            style={{
              flex: 1,
              paddingVertical: 12,
              paddingHorizontal: 10,
              fontSize: 14,
              color: colors.text,
            }}
          />
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 22,
          paddingBottom: insets.bottom + 100,
        }}
      >
        {renderContent()}
      </ScrollView>

      <BusinessTabBar active="Chat" />
    </View>
  );
}
