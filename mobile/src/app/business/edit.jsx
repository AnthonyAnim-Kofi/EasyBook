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
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { ArrowLeft, Camera, Plus, X, MapPin, Globe, Phone as PhoneIcon, Clock, Users, Package } from "lucide-react-native";
import { useRouter } from "expo-router";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import authService from "@/services/auth";
import { getCurrentLocation } from "@/utils/location";
import KeyboardAvoidingAnimatedView from "@/components/KeyboardAvoidingAnimatedView";

const PRIMARY = "#00A896";

const Field = ({
  label,
  value,
  onChangeText,
  placeholder,
  multiline,
  numberOfLines,
  keyboardType,
  onFocus,
  onBlur,
  icon: Icon,
  action,
}) => (
  <View style={{ marginBottom: 18 }}>
    <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8, paddingHorizontal: 2 }}>
      <Text style={{ fontSize: 13, fontWeight: "600", color: "#555" }}>{label}</Text>
      {action}
    </View>
    <View style={{ position: "relative" }}>
      {Icon && (
        <View style={{ position: "absolute", left: 16, top: 16, zIndex: 1 }}>
          <Icon size={20} color={PRIMARY} />
        </View>
      )}
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#9DDDD8"
        multiline={multiline}
        numberOfLines={numberOfLines}
        keyboardType={keyboardType}
        onFocus={onFocus}
        onBlur={onBlur}
        style={{
          backgroundColor: "#E0F5F3",
          borderRadius: 14,
          paddingLeft: Icon ? 48 : 18,
          paddingRight: 18,
          paddingVertical: 15,
          fontSize: 15,
          color: "#1A1A1A",
          textAlignVertical: multiline ? "top" : "center",
          minHeight: multiline ? 100 : 54,
        }}
      />
    </View>
  </View>
);

export default function EditBusinessScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  
  const [loading, setLoading] = useState(false);
  const [locating, setLocating] = useState(false);
  const [formData, setFormData] = useState({
    business_name: "",
    business_location: "",
    phone: "",
    website: "",
    business_category: "",
    business_about: "",
    avatar_url: null,
    opening_hours: "",
    gallery: [],
    packages: [],
    specialists: [],
    promotions: [],
  });

  useEffect(() => {
    loadBusinessData();
  }, []);

  const loadBusinessData = async () => {
    const user = await authService.getStoredUser();
    if (user) {
      setFormData({
        business_name: user.business_name || "Yanks Spa",
        business_location: user.business_location || "Kwabenya, Accra",
        phone: user.phone || "+233 24 412 3456",
        website: user.website || "www.yanksspa.com",
        business_category: user.business_category || "Spa & Salon",
        business_about: user.business_about || "Your business description here...",
        avatar_url: user.avatar_url || "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=300",
        opening_hours: user.opening_hours || "Mon - Sat: 9:00 AM - 8:00 PM",
        gallery: user.gallery || [],
        packages: user.packages || [],
        specialists: user.specialists || [],
        promotions: user.promotions || [],
      });
    }
  };

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleUseLiveLocation = async () => {
    setLocating(true);
    const result = await getCurrentLocation();
    setLocating(false);
    if (!result.error) updateField("business_location", result.fullAddress);
    else Alert.alert("Error", result.error);
  };

  const pickImage = async (type) => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: type === 'avatar',
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled) {
      if (type === 'avatar') updateField("avatar_url", result.assets[0].uri);
      else updateField("gallery", [...formData.gallery, result.assets[0].uri]);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await authService.updateProfile(formData);
      Alert.alert("Success", "Business details updated!");
      router.back();
    } catch (error) {
      Alert.alert("Error", "Could not save changes");
    } finally {
      setLoading(false);
    }
  };

  const paddingAnimation = useRef(new Animated.Value(insets.bottom + 20)).current;
  const handleFocus = () => Animated.timing(paddingAnimation, { toValue: 20, duration: 200, useNativeDriver: false }).start();
  const handleBlur = () => Animated.timing(paddingAnimation, { toValue: insets.bottom + 20, duration: 200, useNativeDriver: false }).start();

  return (
    <KeyboardAvoidingAnimatedView style={{ flex: 1 }} behavior="padding">
      <StatusBar style="dark" />
      <View style={{ flex: 1, backgroundColor: "#F7F7F7" }}>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingTop: insets.top + 16, paddingHorizontal: 22, paddingBottom: 16, backgroundColor: "#fff", borderBottomWidth: 1, borderBottomColor: "#F0F0F0" }}>
          <TouchableOpacity onPress={() => router.back()} style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: "#F5F5F5", alignItems: "center", justifyContent: "center" }}>
            <ArrowLeft size={20} color="#1A1A1A" />
          </TouchableOpacity>
          <Text style={{ fontSize: 17, fontWeight: "700", color: "#1A1A1A" }}>Edit Business</Text>
          <TouchableOpacity onPress={handleSave} disabled={loading}>
            {loading ? <ActivityIndicator size="small" color={PRIMARY} /> : <Text style={{ fontSize: 15, fontWeight: "700", color: PRIMARY }}>Save</Text>}
          </TouchableOpacity>
        </View>

        <Animated.ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 22, paddingBottom: paddingAnimation }} keyboardShouldPersistTaps="handled">
          <View style={{ alignItems: "center", marginBottom: 32, marginTop: 8 }}>
            <View style={{ position: "relative" }}>
              <View style={{ width: 100, height: 100, borderRadius: 50, borderWidth: 3, borderColor: PRIMARY, overflow: "hidden" }}>
                <Image source={{ uri: formData.avatar_url }} style={{ width: "100%", height: "100%" }} contentFit="cover" />
              </View>
              <TouchableOpacity onPress={() => pickImage('avatar')} style={{ position: "absolute", bottom: 0, right: 0, width: 32, height: 32, borderRadius: 16, backgroundColor: PRIMARY, alignItems: "center", justifyContent: "center", borderWidth: 2.5, borderColor: "#fff" }}>
                <Camera size={14} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>

          <Field label="Business Name" value={formData.business_name} onChangeText={(v) => updateField("business_name", v)} placeholder="Shop Name" onFocus={handleFocus} onBlur={handleBlur} />
          <Field label="Location" value={formData.business_location} onChangeText={(v) => updateField("business_location", v)} placeholder="Address" icon={MapPin} onFocus={handleFocus} onBlur={handleBlur} action={
            <TouchableOpacity onPress={handleUseLiveLocation} style={{ flexDirection: "row", alignItems: "center" }}>
              {locating ? <ActivityIndicator size="small" color={PRIMARY} /> : <MapPin size={12} color={PRIMARY} />}
              <Text style={{ fontSize: 12, color: PRIMARY, fontWeight: "700", marginLeft: 4 }}>Live Location</Text>
            </TouchableOpacity>
          } />
          <Field label="Phone" value={formData.phone} onChangeText={(v) => updateField("phone", v)} placeholder="+233..." icon={PhoneIcon} keyboardType="phone-pad" onFocus={handleFocus} onBlur={handleBlur} />
          <Field label="Website" value={formData.website} onChangeText={(v) => updateField("website", v)} placeholder="www.site.com" icon={Globe} onFocus={handleFocus} onBlur={handleBlur} />
          <Field label="Opening Hours" value={formData.opening_hours} onChangeText={(v) => updateField("opening_hours", v)} placeholder="Mon-Sat" icon={Clock} onFocus={handleFocus} onBlur={handleBlur} />
          <Field label="About" value={formData.business_about} onChangeText={(v) => updateField("business_about", v)} placeholder="Description" multiline numberOfLines={4} onFocus={handleFocus} onBlur={handleBlur} />

          <SectionHeader title="Gallery" icon={Camera} onAdd={() => pickImage('gallery')} />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 24 }}>
            {formData.gallery.map((img, i) => (
              <View key={i} style={{ marginRight: 12 }}>
                <Image source={{ uri: img }} style={{ width: 80, height: 80, borderRadius: 12 }} contentFit="cover" />
                <TouchableOpacity onPress={() => updateField("gallery", formData.gallery.filter((_, idx) => idx !== i))} style={{ position: "absolute", top: -5, right: -5, backgroundColor: "#FF5252", borderRadius: 10, padding: 2 }}><X size={12} color="#fff" /></TouchableOpacity>
              </View>
            ))}
          </ScrollView>

          <SectionHeader title="Team" icon={Users} onAdd={() => Alert.alert("Add Specialist", "Coming soon!")} />
          {formData.specialists.map(sp => <ItemRow key={sp.id} title={sp.name} subtitle={sp.service} onRemove={() => updateField("specialists", formData.specialists.filter(s => s.id !== sp.id))} />)}

          <SectionHeader title="Services" icon={Package} onAdd={() => Alert.alert("Add Service", "Coming soon!")} />
          {formData.packages.map(pkg => <ItemRow key={pkg.id} title={pkg.name} subtitle={pkg.price} onRemove={() => updateField("packages", formData.packages.filter(p => p.id !== pkg.id))} />)}
        </Animated.ScrollView>
      </View>
    </KeyboardAvoidingAnimatedView>
  );
}

const SectionHeader = ({ title, icon: Icon, onAdd }) => (
  <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16, marginTop: 12 }}>
    <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>{Icon && <Icon size={18} color="#1A1A1A" />}<Text style={{ fontSize: 16, fontWeight: "800", color: "#1A1A1A" }}>{title}</Text></View>
    <TouchableOpacity onPress={onAdd} style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: "#E0F5F3", alignItems: "center", justifyContent: "center" }}><Plus size={18} color={PRIMARY} /></TouchableOpacity>
  </View>
);

const ItemRow = ({ title, subtitle, onRemove }) => (
  <View style={{ backgroundColor: "#fff", borderRadius: 16, padding: 16, marginBottom: 10, flexDirection: "row", alignItems: "center", justifyContent: "space-between", shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 5, elevation: 2 }}>
    <View><Text style={{ fontSize: 14, fontWeight: "700", color: "#1A1A1A" }}>{title}</Text><Text style={{ fontSize: 12, color: "#888", marginTop: 2 }}>{subtitle}</Text></View>
    <TouchableOpacity onPress={onRemove}><X size={18} color="#FF5252" /></TouchableOpacity>
  </View>
);
