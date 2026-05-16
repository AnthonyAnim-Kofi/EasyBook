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
import { ArrowLeft, Camera, Plus, X, MapPin, Globe, Phone as PhoneIcon, Clock, Users, Package, Sparkles } from "lucide-react-native";
import { useRouter } from "expo-router";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import authService from "@/services/auth";
import { getCurrentLocation } from "@/utils/location";
import KeyboardAvoidingAnimatedView from "@/components/KeyboardAvoidingAnimatedView";
import { supabase } from "@/utils/supabase";
import { uploadImage } from "@/utils/storage";

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

const SectionHeader = ({ title, icon: Icon, onAdd }) => (
  <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16, marginTop: 12 }}>
    <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
      {Icon && <Icon size={18} color="#1A1A1A" />}
      <Text style={{ fontSize: 16, fontWeight: "800", color: "#1A1A1A" }}>{title}</Text>
    </View>
    {onAdd && (
      <TouchableOpacity onPress={onAdd} style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: "#E0F5F3", alignItems: "center", justifyContent: "center" }}>
        <Plus size={18} color={PRIMARY} />
      </TouchableOpacity>
    )}
  </View>
);

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export default function EditBusinessScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  
  const [loading, setLoading] = useState(false);
  const [locating, setLocating] = useState(false);
  const [businessId, setBusinessId] = useState(null);
  const [specialists, setSpecialists] = useState([]);
  const [packages, setPackages] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    city: "",
    country: "",
    phone: "",
    website: "",
    category: "",
    description: "",
    image_url: null,
    working_hours: [], 
    gallery: [],
  });

  useEffect(() => {
    loadBusinessData();
  }, []);

  const loadBusinessData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: bizData, error } = await supabase
        .from('businesses')
        .select('*, specialists (*), packages (*)')
        .eq('owner_id', user.id)
        .single();

      if (!error && bizData) {
        setBusinessId(bizData.id);
        setSpecialists(bizData.specialists || []);
        setPackages(bizData.packages || []);
        
        let initialHours = bizData.working_hours;
        if (!initialHours || !Array.isArray(initialHours) || initialHours.length === 0) {
          initialHours = DAYS.map(day => ({ day, hours: "9:00 AM – 6:00 PM" }));
        }

        setFormData({
          name: bizData.name || "",
          address: bizData.address || "",
          city: bizData.city || "",
          country: bizData.country || "",
          phone: bizData.phone || "",
          website: bizData.website || "",
          category: bizData.category || "",
          description: bizData.description || "",
          image_url: bizData.image_url || "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=300",
          working_hours: initialHours,
          gallery: bizData.gallery || [],
        });
      }
    } catch (err) {
      console.error("Error loading business:", err);
    }
  };

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const updateWorkingHour = (index, hours) => {
    const newHours = [...formData.working_hours];
    newHours[index] = { ...newHours[index], hours };
    updateField("working_hours", newHours);
  };

  const handleUseLiveLocation = async () => {
    setLocating(true);
    const result = await getCurrentLocation();
    setLocating(false);
    if (!result.error) {
      setFormData(prev => ({
        ...prev,
        address: result.fullAddress,
        city: result.city,
        country: result.country
      }));
    } else {
      Alert.alert("Error", result.error);
    }
  };

  const pickImage = async (type, specIndex = null) => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    
    if (!result.canceled) {
      const uri = result.assets[0].uri;
      if (type === 'avatar') updateField("image_url", uri);
      else if (type === 'gallery') updateField("gallery", [...formData.gallery, uri]);
      else if (type === 'specialist') {
        const newSpecs = [...specialists];
        newSpecs[specIndex] = { ...newSpecs[specIndex], image_url: uri };
        setSpecialists(newSpecs);
      }
    }
  };

  const addSpecialist = () => {
    setSpecialists([...specialists, { name: "", service: "", rating: 5.0, image_url: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100" }]);
  };

  const updateSpecialist = (index, field, value) => {
    const newSpecs = [...specialists];
    newSpecs[index] = { ...newSpecs[index], [field]: value };
    setSpecialists(newSpecs);
  };

  const removeSpecialist = (index) => {
    setSpecialists(specialists.filter((_, i) => i !== index));
  };

  const addPackage = () => {
    setPackages([...packages, { name: "", price: "", duration: "", description: "" }]);
  };

  const updatePackage = (index, field, value) => {
    const newPkgs = [...packages];
    newPkgs[index] = { ...newPkgs[index], [field]: value };
    setPackages(newPkgs);
  };

  const removePackage = (index) => {
    setPackages(packages.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!businessId) {
      Alert.alert("Error", "No business found to update.");
      return;
    }
    setLoading(true);
    try {
      // 1. Upload images to storage
      const uploadedMainImage = await uploadImage(formData.image_url, 'business-profiles');
      const uploadedGallery = await Promise.all(
        formData.gallery.map(img => uploadImage(img, 'business-gallery'))
      );

      const finalGallery = uploadedGallery.filter(url => url !== null);

      // 2. Upload specialist images
      const finalSpecs = await Promise.all(
        specialists.map(async (s) => {
          const uploadedUrl = await uploadImage(s.image_url, 'specialists');
          return { ...s, image_url: uploadedUrl || s.image_url };
        })
      );

      // 3. Save to businesses table
      const { error } = await supabase
        .from('businesses')
        .update({
          name: formData.name,
          address: formData.address,
          city: formData.city,
          country: formData.country,
          phone: formData.phone,
          website: formData.website,
          description: formData.description,
          working_hours: formData.working_hours,
          gallery: finalGallery,
          image_url: uploadedMainImage || formData.image_url,
        })
        .eq('id', businessId);

      if (error) throw error;


      // 4. Update specialists (Simple approach: delete all and re-insert)
      await supabase.from('specialists').delete().eq('business_id', businessId);
      if (finalSpecs.length > 0) {
        const specsToInsert = finalSpecs.map(({ id, ...s }) => ({
          ...s,
          business_id: businessId
        }));
        await supabase.from('specialists').insert(specsToInsert);
      }

      // 5. Update packages
      await supabase.from('packages').delete().eq('business_id', businessId);
      if (packages.length > 0) {
        const pkgsToInsert = packages.map(({ id, ...p }) => ({
          ...p,
          business_id: businessId
        }));
        await supabase.from('packages').insert(pkgsToInsert);
      }

      // 6. Update the profile's display fields
      try {
        await authService.updateProfile({
          business_name: formData.name,
          business_location: formData.address,
        });
      } catch (profileErr) {
        console.warn("Profile sync warning:", profileErr);
      }

      router.replace("/business/profile");
    } catch (error) {
      console.error("Save error:", error);
      Alert.alert("Error", error.message || "Could not save changes");
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
          <Text style={{ fontSize: 17, fontWeight: "700", color: "#1A1A1A" }}>Edit Business Profile</Text>
          <TouchableOpacity onPress={handleSave} disabled={loading}>
            {loading ? <ActivityIndicator size="small" color={PRIMARY} /> : <Text style={{ fontSize: 15, fontWeight: "700", color: PRIMARY }}>Save</Text>}
          </TouchableOpacity>
        </View>

        <Animated.ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 22, paddingBottom: paddingAnimation + 100 }} keyboardShouldPersistTaps="handled">
          <View style={{ alignItems: "center", marginBottom: 32, marginTop: 8 }}>
            <View style={{ position: "relative" }}>
              <View style={{ width: 100, height: 100, borderRadius: 50, borderWidth: 3, borderColor: PRIMARY, overflow: "hidden" }}>
                <Image source={{ uri: formData.image_url }} style={{ width: "100%", height: "100%" }} contentFit="cover" />
              </View>
              <TouchableOpacity onPress={() => pickImage('avatar')} style={{ position: "absolute", bottom: 0, right: 0, width: 32, height: 32, borderRadius: 16, backgroundColor: PRIMARY, alignItems: "center", justifyContent: "center", borderWidth: 2.5, borderColor: "#fff" }}>
                <Camera size={14} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>

          <Field label="Business Name" value={formData.name} onChangeText={(v) => updateField("name", v)} placeholder="Shop Name" onFocus={handleFocus} onBlur={handleBlur} />
          <Field label="Location" value={formData.address} onChangeText={(v) => updateField("address", v)} placeholder="Address" icon={MapPin} onFocus={handleFocus} onBlur={handleBlur} action={
            <TouchableOpacity onPress={handleUseLiveLocation} style={{ flexDirection: "row", alignItems: "center" }}>
              {locating ? <ActivityIndicator size="small" color={PRIMARY} /> : <MapPin size={12} color={PRIMARY} />}
              <Text style={{ fontSize: 12, color: PRIMARY, fontWeight: "700", marginLeft: 4 }}>Live Location</Text>
            </TouchableOpacity>
          } />
          <View style={{ flexDirection: "row", gap: 12 }}>
            <View style={{ flex: 1 }}>
              <Field label="City" value={formData.city} onChangeText={(v) => updateField("city", v)} placeholder="City" onFocus={handleFocus} onBlur={handleBlur} />
            </View>
            <View style={{ flex: 1 }}>
              <Field label="Country" value={formData.country} onChangeText={(v) => updateField("country", v)} placeholder="Country" onFocus={handleFocus} onBlur={handleBlur} />
            </View>
          </View>
          <Field label="Phone" value={formData.phone} onChangeText={(v) => updateField("phone", v)} placeholder="+233..." icon={PhoneIcon} keyboardType="phone-pad" onFocus={handleFocus} onBlur={handleBlur} />
          <Field label="Website" value={formData.website} onChangeText={(v) => updateField("website", v)} placeholder="www.site.com" icon={Globe} onFocus={handleFocus} onBlur={handleBlur} />
          
          <SectionHeader title="Working Hours" icon={Clock} />
          <View style={{ backgroundColor: "#fff", borderRadius: 18, padding: 16, marginBottom: 24 }}>
            {formData.working_hours.map((item, idx) => (
              <View key={idx} style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 10, borderBottomWidth: idx < 6 ? 1 : 0, borderBottomColor: "#F5F5F5" }}>
                <Text style={{ fontSize: 14, color: "#555", fontWeight: "600", width: 100 }}>{item.day}</Text>
                <TextInput
                  value={item.hours}
                  onChangeText={(v) => updateWorkingHour(idx, v)}
                  style={{ fontSize: 14, color: PRIMARY, fontWeight: "700", textAlign: "right", flex: 1 }}
                  placeholder="Closed"
                />
              </View>
            ))}
          </View>

          <Field label="About" value={formData.description} onChangeText={(v) => updateField("description", v)} placeholder="Description" multiline numberOfLines={4} onFocus={handleFocus} onBlur={handleBlur} />

          <SectionHeader title="Specialists" icon={Users} onAdd={addSpecialist} />
          {specialists.map((spec, i) => (
            <View key={i} style={{ backgroundColor: "#fff", borderRadius: 18, padding: 16, marginBottom: 16 }}>
              <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 16 }}>
                <TouchableOpacity onPress={() => pickImage('specialist', i)}>
                  <Image source={{ uri: spec.image_url }} style={{ width: 60, height: 60, borderRadius: 30, backgroundColor: "#F0F0F0" }} contentFit="cover" />
                  <View style={{ position: "absolute", bottom: 0, right: 0, width: 20, height: 20, borderRadius: 10, backgroundColor: PRIMARY, alignItems: "center", justifyContent: "center" }}>
                    <Camera size={10} color="#fff" />
                  </View>
                </TouchableOpacity>
                <View style={{ flex: 1, marginLeft: 16 }}>
                  <TextInput
                    value={spec.name}
                    onChangeText={(v) => updateSpecialist(i, "name", v)}
                    placeholder="Specialist Name"
                    style={{ fontSize: 16, fontWeight: "700", color: "#1A1A1A", marginBottom: 4 }}
                  />
                  <TextInput
                    value={spec.service}
                    onChangeText={(v) => updateSpecialist(i, "service", v)}
                    placeholder="Primary Service (e.g. Barber)"
                    style={{ fontSize: 13, color: "#888" }}
                  />
                </View>
                <TouchableOpacity onPress={() => removeSpecialist(i)} style={{ padding: 8 }}>
                  <X size={20} color="#FF5252" />
                </TouchableOpacity>
              </View>
            </View>
          ))}

          <SectionHeader title="Services" icon={Sparkles} onAdd={addPackage} />
          {packages.map((pkg, i) => (
            <View key={i} style={{ backgroundColor: "#fff", borderRadius: 18, padding: 16, marginBottom: 16 }}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <TextInput
                  value={pkg.name}
                  onChangeText={(v) => updatePackage(i, "name", v)}
                  placeholder="Service Name (e.g. Wash & Set)"
                  style={{ fontSize: 16, fontWeight: "700", color: "#1A1A1A", flex: 1 }}
                />
                <TouchableOpacity onPress={() => removePackage(i)} style={{ padding: 4 }}>
                  <X size={18} color="#FF5252" />
                </TouchableOpacity>
              </View>
              <View style={{ flexDirection: "row", gap: 12, marginBottom: 12 }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 12, color: "#888", marginBottom: 4 }}>Price (e.g. GH₵ 50)</Text>
                  <TextInput
                    value={pkg.price}
                    onChangeText={(v) => updatePackage(i, "price", v)}
                    placeholder="Price"
                    style={{ backgroundColor: "#F9F9F9", borderRadius: 8, padding: 10, fontSize: 14 }}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 12, color: "#888", marginBottom: 4 }}>Duration (e.g. 30 mins)</Text>
                  <TextInput
                    value={pkg.duration}
                    onChangeText={(v) => updatePackage(i, "duration", v)}
                    placeholder="Duration"
                    style={{ backgroundColor: "#F9F9F9", borderRadius: 8, padding: 10, fontSize: 14 }}
                  />
                </View>
              </View>
              <TextInput
                value={pkg.description}
                onChangeText={(v) => updatePackage(i, "description", v)}
                placeholder="Brief description..."
                multiline
                style={{ backgroundColor: "#F9F9F9", borderRadius: 8, padding: 10, fontSize: 13, color: "#555", minHeight: 60 }}
              />
            </View>
          ))}

          <SectionHeader title="Gallery" icon={Camera} onAdd={() => pickImage('gallery')} />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 24 }}>
            {formData.gallery.map((img, i) => (
              <View key={i} style={{ marginRight: 12 }}>
                <Image source={{ uri: img }} style={{ width: 100, height: 100, borderRadius: 12 }} contentFit="cover" />
                <TouchableOpacity onPress={() => updateField("gallery", formData.gallery.filter((_, idx) => idx !== i))} style={{ position: "absolute", top: -5, right: -5, backgroundColor: "#FF5252", borderRadius: 10, padding: 4 }}><X size={12} color="#fff" /></TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        </Animated.ScrollView>
      </View>
    </KeyboardAvoidingAnimatedView>
  );
}

