import { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Animated,
  Platform,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { ArrowLeft, Camera } from "lucide-react-native";
import { useRouter } from "expo-router";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import authService from "@/services/auth";
import KeyboardAvoidingAnimatedView from "@/components/KeyboardAvoidingAnimatedView";
import { uploadImage } from "@/utils/storage";

const PRIMARY = "#00A896";
const Field = ({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  keyboardType,
  onFocus,
  onBlur,
}) => (
  <View style={{ marginBottom: 18 }}>
    <Text
      style={{
        fontSize: 13,
        fontWeight: "600",
        color: "#555",
        marginBottom: 8,
        marginLeft: 2,
      }}
    >
      {label}
    </Text>
    <TextInput
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor="#9DDDD8"
      secureTextEntry={secureTextEntry}
      keyboardType={keyboardType}
      onFocus={onFocus}
      onBlur={onBlur}
      autoCapitalize="none"
      style={{
        backgroundColor: "#E0F5F3",
        borderRadius: 14,
        paddingHorizontal: 18,
        paddingVertical: 15,
        fontSize: 15,
        color: "#1A1A1A",
      }}
    />
  </View>
);

export default function EditProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("••••••••");
  const [avatar, setAvatar] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    const user = await authService.getMe(); // Use getMe for fresh data
    if (user) {
      setFullName(user.full_name || "");
      setEmail(user.email || "");
      setUsername(user.username || user.email?.split('@')[0] || "");
      setAvatar(user.avatar_url || "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=300");
      setUserRole(user.role);
    }
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setAvatar(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      const uploadedAvatar = await uploadImage(avatar, 'avatars');
      
      await authService.updateProfile({
        full_name: fullName,
        email,
        username,
        avatar_url: uploadedAvatar || avatar,
      });
      
      router.replace("/(tabs)/profile");
    } catch (error) {
      console.error("Save error:", error);
      Alert.alert("Error", "Could not save profile");
    } finally {
      setLoading(false);
    }
  };

  const paddingAnimation = useRef(
    new Animated.Value(insets.bottom + 20),
  ).current;

  const animateTo = (value) => {
    Animated.timing(paddingAnimation, {
      toValue: value,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  const handleFocus = () => {
    if (Platform.OS !== "web") animateTo(20);
  };
  const handleBlur = () => {
    if (Platform.OS !== "web") animateTo(insets.bottom + 20);
  };

  return (
    <KeyboardAvoidingAnimatedView style={{ flex: 1 }} behavior="padding">
      <StatusBar style="dark" />
      <View style={{ flex: 1, backgroundColor: "#F7F7F7" }}>
        {/* Header */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            paddingTop: insets.top + 16,
            paddingHorizontal: 22,
            paddingBottom: 16,
            backgroundColor: "#fff",
            borderBottomWidth: 1,
            borderBottomColor: "#F0F0F0",
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
            }}
          >
            <ArrowLeft size={20} color="#1A1A1A" />
          </TouchableOpacity>
          <Text style={{ fontSize: 17, fontWeight: "700", color: "#1A1A1A" }}>
            Edit profile
          </Text>
          <TouchableOpacity onPress={handleSave}>
            <Text style={{ fontSize: 15, fontWeight: "700", color: PRIMARY }}>
              Save
            </Text>
          </TouchableOpacity>
        </View>

        <Animated.ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            padding: 22,
            paddingBottom: paddingAnimation,
          }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Avatar */}
          <View
            style={{ alignItems: "center", marginBottom: 32, marginTop: 8 }}
          >
            <View style={{ position: "relative" }}>
              <View
                style={{
                  width: 100,
                  height: 100,
                  borderRadius: 50,
                  borderWidth: 3,
                  borderColor: PRIMARY,
                  overflow: "hidden",
                }}
              >
                <Image
                  source={{
                    uri: avatar,
                  }}
                  style={{ width: "100%", height: "100%" }}
                  contentFit="cover"
                />
              </View>
              <TouchableOpacity
                onPress={pickImage}
                style={{
                  position: "absolute",
                  bottom: 0,
                  right: 0,
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  backgroundColor: PRIMARY,
                  alignItems: "center",
                  justifyContent: "center",
                  borderWidth: 2.5,
                  borderColor: "#fff",
                }}
              >
                <Camera size={14} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Fields */}
          <Field
            label="Full Name"
            value={fullName}
            onChangeText={setFullName}
            placeholder="Enter full name"
            onFocus={handleFocus}
            onBlur={handleBlur}
          />
          <Field
            label="Email"
            value={email}
            onChangeText={setEmail}
            placeholder="Enter email"
            keyboardType="email-address"
            onFocus={handleFocus}
            onBlur={handleBlur}
          />
          <Field
            label="Username"
            value={username}
            onChangeText={setUsername}
            placeholder="Enter username"
            onFocus={handleFocus}
            onBlur={handleBlur}
          />
          <Field
            label="Password"
            value={password}
            onChangeText={setPassword}
            placeholder="Enter password"
            secureTextEntry
            onFocus={handleFocus}
            onBlur={handleBlur}
          />

          {/* Log out pill */}
          <View style={{ alignItems: "center", marginTop: 16 }}>
            <TouchableOpacity
              onPress={() => router.replace("/signin")}
              style={{
                borderWidth: 1.5,
                borderColor: "#DDDDDD",
                borderRadius: 30,
                paddingHorizontal: 40,
                paddingVertical: 12,
              }}
            >
              <Text style={{ fontSize: 14, fontWeight: "600", color: "#888" }}>
                Log out
              </Text>
            </TouchableOpacity>
            {/* Only show Switch to business if user has business_owner role */}
            {userRole === 'business_owner' && (
              <TouchableOpacity
                onPress={() => router.push("/business/dashboard")}
                style={{ marginTop: 16 }}
              >
                <Text style={{ fontSize: 14, fontWeight: "700", color: PRIMARY }}>
                  Switch to business
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </Animated.ScrollView>
      </View>
    </KeyboardAvoidingAnimatedView>
  );
}
