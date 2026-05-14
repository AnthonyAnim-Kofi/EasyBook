import { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Camera, Plus, X, MapPin, RefreshCw } from "lucide-react-native";
import { Image } from "expo-image";
import { useRouter, useFocusEffect } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import authService from "@/services/auth";
import { useAuthStore } from "@/utils/auth/store";
import BusinessTabBar from "@/components/BusinessTabBar";

const PRIMARY = "#00A896";

export default function BusinessProfileScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const loadUser = async () => {
    setRefreshing(true);
    try {
      const stored = await authService.getStoredUser();
      setUser(stored);
    } catch (err) {
      console.error("Error loading user:", err);
    } finally {
      setRefreshing(false);
    }
  };

  // Load once on mount
  useEffect(() => {
    loadUser();
  }, []);

  // Reload when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadUser();
    }, [])
  );

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      const uri = result.assets[0].uri;
      try {
        const updated = await authService.updateProfile({ avatar_url: uri });
        setUser(updated);
        Alert.alert("Success", "Profile picture updated!");
      } catch (err) {
        Alert.alert("Error", "Could not update picture");
      }
    }
  };

  const handleSaveChanges = async () => {
    setLoading(true);
    try {
      const updated = await authService.updateProfile({
        business_about: user?.business_about,
        promotions: user?.promotions,
      });
      setUser(updated);
      Alert.alert("Success", "Profile updated successfully!");
    } catch (error) {
      Alert.alert("Error", "Could not save changes");
    } finally {
      setLoading(false);
    }
  };

  const updateAbout = (text) => {
    setUser(prev => ({ ...prev, business_about: text }));
  };

  const removePromo = async (id) => {
    const newPromos = (user?.promotions || []).filter(p => p.id !== id);
    setUser(prev => ({ ...prev, promotions: newPromos }));
  };

  if (!user && refreshing) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color={PRIMARY} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#F7F7F7" }}>
      <StatusBar style="dark" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 110 }}
      >
        <View style={{ paddingTop: insets.top + 10 }} />

        {/* Profile header */}
        <View style={{ alignItems: "center", paddingHorizontal: 22, paddingTop: 20, paddingBottom: 24, backgroundColor: "#fff", borderBottomWidth: 1, borderBottomColor: "#F0F0F0" }}>
          <View style={{ width: "100%", flexDirection: "row", justifyContent: "flex-end", position: "absolute", top: 10, right: 10 }}>
             <TouchableOpacity onPress={loadUser} style={{ padding: 10 }}>
                <RefreshCw size={18} color={refreshing ? "#CCC" : PRIMARY} />
             </TouchableOpacity>
          </View>

          <View style={{ position: "relative", marginBottom: 14 }}>
            <View style={{ width: 96, height: 96, borderRadius: 48, borderWidth: 3, borderColor: PRIMARY, overflow: "hidden" }}>
              <Image source={{ uri: user?.avatar_url || "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=300" }} style={{ width: "100%", height: "100%" }} contentFit="cover" />
            </View>
            <TouchableOpacity onPress={handlePickImage} style={{ position: "absolute", bottom: 0, right: 0, width: 30, height: 30, borderRadius: 15, backgroundColor: PRIMARY, alignItems: "center", justifyContent: "center", borderWidth: 2, borderColor: "#fff" }}>
              <Camera size={14} color="#fff" />
            </TouchableOpacity>
          </View>

          <Text style={{ fontSize: 22, fontWeight: "800", color: "#1A1A1A", marginBottom: 4 }}>
            {user?.business_name || "Your Business"}
          </Text>
          <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 18 }}>
            <MapPin size={14} color="#888" />
            <Text style={{ fontSize: 13, color: "#888", marginLeft: 4 }}>
              {user?.business_location || "Location not set"}
            </Text>
          </View>

          <TouchableOpacity onPress={() => router.push("/business/edit")} style={{ borderWidth: 2, borderColor: PRIMARY, borderRadius: 30, paddingVertical: 12, paddingHorizontal: 48, alignItems: "center" }}>
            <Text style={{ fontSize: 15, fontWeight: "700", color: PRIMARY }}>Edit business profile</Text>
          </TouchableOpacity>
        </View>

        <View style={{ paddingHorizontal: 22, paddingTop: 24 }}>
          <Text style={{ fontSize: 16, fontWeight: "700", color: "#1A1A1A", marginBottom: 10 }}>About My Shop</Text>
          <TextInput
            value={user?.business_about || ""}
            onChangeText={updateAbout}
            multiline
            placeholder="Tell users about your business..."
            style={{ backgroundColor: "#fff", borderRadius: 16, padding: 16, fontSize: 14, color: "#555", lineHeight: 22, minHeight: 110, textAlignVertical: "top", borderWidth: 1.5, borderColor: "#EEEEEE", marginBottom: 28 }}
          />

          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <Text style={{ fontSize: 16, fontWeight: "700", color: "#1A1A1A" }}>Promotions & Offers</Text>
            <TouchableOpacity onPress={() => router.push("/business/edit")} style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: PRIMARY, alignItems: "center", justifyContent: "center" }}>
              <Plus size={16} color="#fff" />
            </TouchableOpacity>
          </View>

          {(user?.promotions || []).map((promo) => (
            <View key={promo.id} style={{ backgroundColor: "#fff", borderRadius: 16, padding: 16, marginBottom: 10, flexDirection: "row", alignItems: "center", borderWidth: 1.5, borderColor: "#EEEEEE" }}>
              <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: PRIMARY, marginRight: 12 }} />
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 14, fontWeight: "700", color: "#1A1A1A" }}>{promo.title}</Text>
                <Text style={{ fontSize: 12, color: "#888", marginTop: 2 }}>{promo.desc}</Text>
              </View>
              <TouchableOpacity onPress={() => removePromo(promo.id)} style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: "#FFE5E5", alignItems: "center", justifyContent: "center" }}>
                <X size={13} color="#D63031" />
              </TouchableOpacity>
            </View>
          ))}

          <TouchableOpacity
            onPress={handleSaveChanges}
            disabled={loading}
            style={{ backgroundColor: PRIMARY, borderRadius: 30, paddingVertical: 17, alignItems: "center", marginTop: 20, opacity: loading ? 0.7 : 1, shadowColor: PRIMARY, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 5 }}
          >
            <Text style={{ color: "#fff", fontSize: 16, fontWeight: "700", letterSpacing: 0.5 }}>
              {loading ? "Saving..." : "Save Changes"}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={{ alignItems: "center", marginTop: 24, paddingHorizontal: 22 }}>
          <TouchableOpacity onPress={() => authService.signOut().then(() => router.replace("/signin"))} style={{ borderWidth: 1.5, borderColor: "#DDDDDD", borderRadius: 30, paddingHorizontal: 40, paddingVertical: 12, width: "100%", alignItems: "center" }}>
            <Text style={{ fontSize: 14, fontWeight: "600", color: "#888" }}>Log out</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => {
              const { setAppMode } = useAuthStore.getState();
              setAppMode('customer');
              router.replace("/(tabs)/home");
            }} 
            style={{ marginTop: 20 }}
          >
            <Text style={{ fontSize: 14, fontWeight: "700", color: PRIMARY }}>Switch to customer profile</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      <BusinessTabBar active="Profile" />
    </View>
  );
}
