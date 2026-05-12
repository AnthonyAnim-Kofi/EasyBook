import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Search, MessageCircle } from "lucide-react-native";
import { Image } from "expo-image";

const PRIMARY = "#00A896";
const BG = "#F6F4F3";

const chats = [
  {
    id: "1",
    name: "Yanks Spa and Salon",
    lastMsg: "Your appointment is confirmed for tomorrow!",
    time: "10:22 AM",
    unread: 2,
    image: "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=200",
  },
  {
    id: "2",
    name: "Elite Cuts Barber",
    lastMsg: "Thanks for your booking, see you soon!",
    time: "Yesterday",
    unread: 0,
    image: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=200",
  },
  {
    id: "3",
    name: "Magnus Spa",
    lastMsg: "We've rescheduled your session to 3PM.",
    time: "Mon",
    unread: 1,
    image: "https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=200",
  },
  {
    id: "4",
    name: "Luxe Beauty Studio",
    lastMsg: "Hi! How can we help you today?",
    time: "Sun",
    unread: 0,
    image: "https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=200",
  },
];

export default function ChatScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={{ flex: 1, backgroundColor: BG }}>
      <StatusBar style="light" />
      <View
        style={{
          backgroundColor: PRIMARY,
          paddingTop: insets.top + 16,
          paddingHorizontal: 22,
          paddingBottom: 28,
        }}
      >
        <Text
          style={{
            fontSize: 22,
            fontWeight: "800",
            color: "#fff",
            marginBottom: 4,
          }}
        >
          Messages
        </Text>
        <Text
          style={{
            fontSize: 13,
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
            backgroundColor: "#fff",
            borderRadius: 14,
            paddingHorizontal: 14,
          }}
        >
          <Search size={18} color="#BBBBBB" />
          <TextInput
            placeholder="Search messages..."
            placeholderTextColor="#BBBBBB"
            style={{
              flex: 1,
              paddingVertical: 13,
              paddingHorizontal: 10,
              fontSize: 14,
              color: "#1A1A1A",
            }}
          />
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 80 }}
        style={{
          flex: 1,
          marginTop: -12,
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          backgroundColor: BG,
        }}
      >
        <View style={{ paddingHorizontal: 22, paddingTop: 20 }}>
          {chats.map((chat, index) => (
            <TouchableOpacity
              key={chat.id}
              style={{
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: "#fff",
                borderRadius: 16,
                padding: 16,
                marginBottom: 12,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.05,
                shadowRadius: 6,
                elevation: 2,
              }}
            >
              <View style={{ position: "relative", marginRight: 14 }}>
                <Image
                  source={{ uri: chat.image }}
                  style={{ width: 52, height: 52, borderRadius: 26 }}
                  contentFit="cover"
                />
                <View
                  style={{
                    position: "absolute",
                    bottom: 0,
                    right: 0,
                    width: 12,
                    height: 12,
                    borderRadius: 6,
                    backgroundColor: "#6BCB77",
                    borderWidth: 2,
                    borderColor: "#fff",
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
                      fontSize: 15,
                      fontWeight: "700",
                      color: "#1A1A1A",
                    }}
                  >
                    {chat.name}
                  </Text>
                  <Text style={{ fontSize: 11, color: "#AAA" }}>
                    {chat.time}
                  </Text>
                </View>
                <Text style={{ fontSize: 13, color: "#888" }} numberOfLines={1}>
                  {chat.lastMsg}
                </Text>
              </View>
              {chat.unread > 0 && (
                <View
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: 10,
                    backgroundColor: PRIMARY,
                    alignItems: "center",
                    justifyContent: "center",
                    marginLeft: 8,
                  }}
                >
                  <Text
                    style={{ color: "#fff", fontSize: 11, fontWeight: "700" }}
                  >
                    {chat.unread}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {chats.length === 0 && (
          <View style={{ alignItems: "center", paddingTop: 80 }}>
            <MessageCircle size={60} color="#DDD" />
            <Text
              style={{
                fontSize: 18,
                fontWeight: "700",
                color: "#CCC",
                marginTop: 16,
              }}
            >
              No messages yet
            </Text>
            <Text style={{ fontSize: 14, color: "#BBB", marginTop: 6 }}>
              Book a service to start chatting
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
