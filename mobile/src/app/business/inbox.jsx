import { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import {
  Search,
  PhoneCall,
  PhoneIncoming,
  PhoneMissed,
  Phone,
} from "lucide-react-native";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import BusinessTabBar from "@/components/BusinessTabBar";

const PRIMARY = "#00A896";
const BG = "#FFF5F3";

const chats = [
  {
    id: "1",
    name: "Andy Coleman",
    lastMsg: "Okay, see you then!",
    time: "10:22 AM",
    unread: 2,
    avatar:
      "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150",
    online: true,
  },
  {
    id: "2",
    name: "Abena Mensah",
    lastMsg: "Thank you so much 😊",
    time: "Yesterday",
    unread: 0,
    avatar:
      "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=150",
    online: false,
  },
  {
    id: "3",
    name: "Ama Owusu",
    lastMsg: "Can I reschedule to 3pm?",
    time: "Mon",
    unread: 1,
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150",
    online: true,
  },
  {
    id: "4",
    name: "Kojo Darko",
    lastMsg: "Is there still availability?",
    time: "Sun",
    unread: 0,
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
    online: false,
  },
  {
    id: "5",
    name: "Efua Asante",
    lastMsg: "Please confirm my booking",
    time: "Sat",
    unread: 3,
    avatar:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150",
    online: true,
  },
];

const calls = [
  {
    id: "1",
    name: "Andy Coleman",
    type: "outgoing",
    time: "Today, 10:15 AM",
    duration: "3 mins",
    avatar:
      "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150",
  },
  {
    id: "2",
    name: "Abena Mensah",
    type: "incoming",
    time: "Today, 8:40 AM",
    duration: "5 mins",
    avatar:
      "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=150",
  },
  {
    id: "3",
    name: "Kojo Darko",
    type: "missed",
    time: "Yesterday, 3:22 PM",
    duration: null,
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
  },
  {
    id: "4",
    name: "Ama Owusu",
    type: "incoming",
    time: "Mon, 11:00 AM",
    duration: "8 mins",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150",
  },
  {
    id: "5",
    name: "Efua Asante",
    type: "missed",
    time: "Sun, 2:30 PM",
    duration: null,
    avatar:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150",
  },
];

const callConfig = {
  outgoing: { icon: PhoneCall, color: PRIMARY, label: "Outgoing" },
  incoming: { icon: PhoneIncoming, color: "#6BCB77", label: "Incoming" },
  missed: { icon: PhoneMissed, color: "#D63031", label: "Missed" },
};

export default function BusinessInboxScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("Chat");

  return (
    <View style={{ flex: 1, backgroundColor: BG }}>
      <StatusBar style="dark" />

      {/* Header */}
      <View
        style={{
          paddingTop: insets.top + 16,
          paddingHorizontal: 22,
          paddingBottom: 16,
          backgroundColor: BG,
        }}
      >
        <Text
          style={{
            fontSize: 22,
            fontWeight: "800",
            color: "#1A1A1A",
            marginBottom: 16,
          }}
        >
          Inbox
        </Text>

        {/* Chat / Calls pills */}
        <View
          style={{
            flexDirection: "row",
            backgroundColor: "#fff",
            borderRadius: 30,
            padding: 4,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.06,
            shadowRadius: 6,
            elevation: 2,
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
                backgroundColor: activeTab === tab ? PRIMARY : "transparent",
              }}
            >
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "700",
                  color: activeTab === tab ? "#fff" : "#888",
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
            backgroundColor: "#fff",
            borderRadius: 14,
            paddingHorizontal: 14,
            borderWidth: 1,
            borderColor: "#EFEFEF",
          }}
        >
          <Search size={16} color="#BBBBBB" />
          <TextInput
            placeholder={
              activeTab === "Chat" ? "Search messages..." : "Search calls..."
            }
            placeholderTextColor="#BBBBBB"
            style={{
              flex: 1,
              paddingVertical: 12,
              paddingHorizontal: 10,
              fontSize: 14,
              color: "#1A1A1A",
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
        {activeTab === "Chat"
          ? chats.map((chat, i) => (
              <TouchableOpacity
                key={chat.id}
                onPress={() =>
                  router.push({
                    pathname: "/business/message",
                    params: { name: chat.name, avatar: chat.avatar },
                  })
                }
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  backgroundColor: "#fff",
                  borderRadius: 18,
                  padding: 14,
                  marginBottom: 10,
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.04,
                  shadowRadius: 6,
                  elevation: 1,
                }}
              >
                <View style={{ position: "relative", marginRight: 12 }}>
                  <Image
                    source={{ uri: chat.avatar }}
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
                        borderColor: "#fff",
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
                        fontWeight: "800",
                        color: "#1A1A1A",
                      }}
                    >
                      {chat.name}
                    </Text>
                    <Text style={{ fontSize: 11, color: "#AAA" }}>
                      {chat.time}
                    </Text>
                  </View>
                  <Text
                    style={{ fontSize: 13, color: "#888" }}
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
            ))
          : calls.map((call) => {
              const cfg = callConfig[call.type];
              return (
                <View
                  key={call.id}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    backgroundColor: "#fff",
                    borderRadius: 18,
                    padding: 14,
                    marginBottom: 10,
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.04,
                    shadowRadius: 6,
                    elevation: 1,
                  }}
                >
                  <Image
                    source={{ uri: call.avatar }}
                    style={{
                      width: 54,
                      height: 54,
                      borderRadius: 27,
                      marginRight: 12,
                    }}
                    contentFit="cover"
                  />
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        fontSize: 15,
                        fontWeight: "800",
                        color: "#1A1A1A",
                        marginBottom: 4,
                      }}
                    >
                      {call.name}
                    </Text>
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 6,
                      }}
                    >
                      <cfg.icon size={13} color={cfg.color} />
                      <Text style={{ fontSize: 12, color: "#888" }}>
                        {cfg.label} · {call.time}
                      </Text>
                    </View>
                    {call.duration && (
                      <Text
                        style={{ fontSize: 11, color: "#BBB", marginTop: 2 }}
                      >
                        Duration: {call.duration}
                      </Text>
                    )}
                  </View>
                  <TouchableOpacity
                    style={{
                      width: 38,
                      height: 38,
                      borderRadius: 19,
                      backgroundColor: "#E0F5F3",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Phone size={16} color={PRIMARY} />
                  </TouchableOpacity>
                </View>
              );
            })}
      </ScrollView>

      <BusinessTabBar active="Chat" />
    </View>
  );
}
