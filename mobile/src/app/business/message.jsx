import { useState, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Animated,
  Platform,
  KeyboardAvoidingView,
  Linking,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import {
  ArrowLeft,
  Phone,
  MoreVertical,
  Send,
  Paperclip,
} from "lucide-react-native";
import { Image } from "expo-image";
import { useRouter, useLocalSearchParams } from "expo-router";

const PRIMARY = "#00A896";
const BG = "#FFF5F3";

const initialMessages = [
  {
    id: "1",
    from: "customer",
    text: "Hello, I'd like to book an appointment for a haircut tomorrow.",
    time: "10:00 AM",
  },
  {
    id: "2",
    from: "business",
    text: "Hi Andy! Sure, we have slots available. What time works best for you?",
    time: "10:02 AM",
  },
  {
    id: "3",
    from: "customer",
    text: "Can I come in at 10am?",
    time: "10:04 AM",
  },
  {
    id: "4",
    from: "business",
    text: "Perfect! I've booked you for 10:00 AM tomorrow with Jayden. Please arrive 5 mins early 😊",
    time: "10:06 AM",
  },
  { id: "5", from: "customer", text: "Okay, see you then!", time: "10:08 AM" },
];

export default function BusinessMessageScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();
  const { id, name, avatar } = params;
  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState("");
  const scrollRef = useRef(null);

  const customerName = name || "Andy Coleman";
  const customerAvatar =
    avatar ||
    "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150";

  const sendMessage = () => {
    if (!input.trim()) return;
    const newMsg = {
      id: String(Date.now()),
      from: "business",
      text: input.trim(),
      time: "Now",
    };
    setMessages((prev) => [...prev, newMsg]);
    setInput("");
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
  };

  const handleCall = () => {
    Linking.openURL('tel:+233200000000');
  };

  const showMoreOptions = () => {
    Alert.alert(
      "Options",
      "What would you like to do?",
      [
        { 
          text: "View Profile", 
          onPress: () => {
            if (params.id) {
              router.push({ pathname: "/business/detail", params: { id: params.id, name: params.name } });
            } else {
              Alert.alert("Info", "Profile details not available for this contact.");
            }
          } 
        },
        { 
          text: "Mute Notifications", 
          onPress: () => Alert.alert("Success", "Notifications muted for this chat.") 
        },
        { 
          text: "Clear Chat", 
          onPress: () => {
            Alert.alert(
              "Clear Chat",
              "Are you sure you want to delete all messages?",
              [
                { text: "Cancel", style: "cancel" },
                { text: "Clear", onPress: () => setMessages([]), style: "destructive" }
              ]
            );
          }, 
          style: "destructive" 
        },
        { text: "Cancel", style: "cancel" }
      ]
    );
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: BG }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={0}
    >
      <StatusBar style="dark" />

      {/* Header */}
      <View
        style={{
          backgroundColor: "#fff",
          paddingTop: insets.top + 12,
          paddingHorizontal: 22,
          paddingBottom: 14,
          borderBottomWidth: 1,
          borderBottomColor: "#F0F0F0",
          flexDirection: "row",
          alignItems: "center",
        }}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          style={{
            width: 38,
            height: 38,
            borderRadius: 19,
            backgroundColor: "#F5F5F5",
            alignItems: "center",
            justifyContent: "center",
            marginRight: 12,
          }}
        >
          <ArrowLeft size={18} color="#1A1A1A" />
        </TouchableOpacity>
        <Image
          source={{ uri: customerAvatar }}
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            marginRight: 10,
            borderWidth: 2,
            borderColor: "#6BCB77",
          }}
          contentFit="cover"
        />
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 15, fontWeight: "800", color: "#1A1A1A" }}>
            {customerName}
          </Text>
          <Text style={{ fontSize: 12, color: "#6BCB77", fontWeight: "600" }}>
            ● Online
          </Text>
        </View>
        <View style={{ flexDirection: "row", gap: 10 }}>
          <TouchableOpacity
            onPress={handleCall}
            style={{
              width: 36,
              height: 36,
              borderRadius: 18,
              backgroundColor: "#F5F5F5",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Phone size={16} color="#1A1A1A" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={showMoreOptions}
            style={{
              width: 36,
              height: 36,
              borderRadius: 18,
              backgroundColor: "#F5F5F5",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <MoreVertical size={16} color="#1A1A1A" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Messages */}
      <ScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 18,
          paddingTop: 20,
          paddingBottom: 20,
        }}
        keyboardShouldPersistTaps="handled"
        onContentSizeChange={() =>
          scrollRef.current?.scrollToEnd({ animated: true })
        }
      >
        {/* Today divider */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 20,
          }}
        >
          <View style={{ flex: 1, height: 1, backgroundColor: "#E8E8E8" }} />
          <Text
            style={{
              fontSize: 12,
              color: "#AAA",
              fontWeight: "600",
              marginHorizontal: 12,
            }}
          >
            Today
          </Text>
          <View style={{ flex: 1, height: 1, backgroundColor: "#E8E8E8" }} />
        </View>

        {messages.map((msg) => {
          const isBusiness = msg.from === "business";
          return (
            <View
              key={msg.id}
              style={{
                marginBottom: 16,
                alignItems: isBusiness ? "flex-end" : "flex-start",
              }}
            >
              {!isBusiness && (
                <Image
                  source={{ uri: customerAvatar }}
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 14,
                    marginBottom: 4,
                  }}
                  contentFit="cover"
                />
              )}
              <View
                style={{
                  backgroundColor: isBusiness ? PRIMARY : "#fff",
                  borderRadius: isBusiness ? 20 : 20,
                  borderBottomLeftRadius: isBusiness ? 20 : 4,
                  borderBottomRightRadius: isBusiness ? 4 : 20,
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  maxWidth: "78%",
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.06,
                  shadowRadius: 4,
                  elevation: 1,
                }}
              >
                <Text
                  style={{
                    fontSize: 14,
                    color: isBusiness ? "#fff" : "#1A1A1A",
                    lineHeight: 20,
                  }}
                >
                  {msg.text}
                </Text>
              </View>
              <Text
                style={{
                  fontSize: 11,
                  color: "#BBBBBB",
                  marginTop: 4,
                  marginHorizontal: 4,
                }}
              >
                {msg.time}
              </Text>
            </View>
          );
        })}
      </ScrollView>

      {/* Input bar */}
      <View
        style={{
          backgroundColor: "#fff",
          paddingHorizontal: 16,
          paddingTop: 12,
          paddingBottom: insets.bottom + 12,
          borderTopWidth: 1,
          borderTopColor: "#F0F0F0",
          flexDirection: "row",
          alignItems: "center",
          gap: 10,
        }}
      >
        <TouchableOpacity
          style={{
            width: 38,
            height: 38,
            borderRadius: 19,
            backgroundColor: "#F5F5F5",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Paperclip size={17} color="#888" />
        </TouchableOpacity>
        <View
          style={{
            flex: 1,
            backgroundColor: "#F5F5F5",
            borderRadius: 24,
            paddingHorizontal: 16,
            flexDirection: "row",
            alignItems: "center",
            minHeight: 44,
          }}
        >
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder="Write a message..."
            placeholderTextColor="#BBBBBB"
            style={{
              flex: 1,
              fontSize: 14,
              color: "#1A1A1A",
              paddingVertical: 10,
            }}
            multiline
            returnKeyType="send"
            onSubmitEditing={sendMessage}
          />
        </View>
        <TouchableOpacity
          onPress={sendMessage}
          style={{
            width: 44,
            height: 44,
            borderRadius: 22,
            backgroundColor: input.trim() ? PRIMARY : "#E0F5F3",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Send size={18} color={input.trim() ? "#fff" : PRIMARY} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}
