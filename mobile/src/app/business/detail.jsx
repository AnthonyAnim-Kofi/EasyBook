import { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Animated,
  Linking,
  Share,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import {
  ArrowLeft,
  Heart,
  Share2,
  MapPin,
  Clock,
  Star,
  Globe,
  MessageCircle,
  Phone,
  Navigation,
  ChevronRight,
} from "lucide-react-native";
import { Image } from "expo-image";
import { useRouter, useLocalSearchParams } from "expo-router";
import { businessService } from "@/services/business";
import { supabase } from "@/utils/supabase";
import { colors, typography, radius, shadows } from "@/theme";

const PRIMARY = colors.primary;
const { width } = Dimensions.get("window");

const TABS = ["Specialist", "Package", "Gallery", "Review", "About us"];

function StarRow({ rating, size = 14 }) {
  return (
    <View style={{ flexDirection: "row", gap: 2 }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={size}
          color="#FFD93D"
          fill={i <= Math.round(rating) ? "#FFD93D" : "transparent"}
        />
      ))}
    </View>
  );
}

export default function BusinessDetailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id, name: paramName } = useLocalSearchParams();
  
  const [business, setBusiness] = useState(null);
  const [specialists, setSpecialists] = useState([]);
  const [activeTab, setActiveTab] = useState("Specialist");
  const [liked, setLiked] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBusinessDetails();
  }, [id]);

  const loadBusinessDetails = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const data = await businessService.getDetail(id);
      setBusiness(data);
      setSpecialists(data?.specialists || []);
      
      // Check if favorited
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: fav } = await supabase
          .from('favourites')
          .select('*')
          .eq('user_id', user.id)
          .eq('business_id', id)
          .maybeSingle();
        setLiked(!!fav);
      }
    } catch (err) {
      console.log("Error loading business detail:", err);
    } finally {
      setLoading(false);
    }
  };

  const toggleFavourite = async () => {
    try {
      const { favourited } = await businessService.toggleFavourite(id);
      setLiked(favourited);
    } catch (err) {
      console.log("Error toggling favourite:", err);
      Alert.alert("Error", "Could not update favorites");
    }
  };

  const handleAction = (type) => {
    if (!biz) return;
    
    switch (type) {
      case "Call":
        if (biz.phone) {
          Linking.openURL(`tel:${biz.phone}`);
        } else {
          Alert.alert("Notice", "This business hasn't provided a phone number.");
        }
        break;
      case "Website":
        let webUrl = biz.website || "https://easybook.com";
        if (!webUrl.startsWith("http://") && !webUrl.startsWith("https://")) {
          webUrl = `https://${webUrl}`;
        }
        Linking.openURL(webUrl);
        break;
      case "Direction":
        const addr = encodeURIComponent(biz.address || "Kwabenya, Accra");
        Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${addr}`);
        break;
      case "Share":
        Share.share({
          message: `Check out ${biz.name} on Easybook!`,
          url: "https://easybook.com",
        });
        break;
      case "Message":
        router.push({ 
          pathname: "/business/message", 
          params: { 
            id: biz.owner_id, 
            name: biz.name,
            phone: biz.phone,
            avatar: biz.image_url
          } 
        });
        break;
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const biz = business || { name: paramName || "Yanks Spa and Salon" };
  const packages = biz.packages || [
    { id: "1", name: "Basic Facial", price: "GH₵ 80", duration: "45 mins", desc: "Deep cleanse, exfoliation & moisturising." },
    { id: "2", name: "Full Hair Package", price: "GH₵ 150", duration: "90 mins", desc: "Wash, cut, blow dry & style." }
  ];

  const galleryImages = biz.gallery || [
    "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400",
    "https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=400",
    "https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=400",
    "https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?w=400",
    "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400",
    "https://images.unsplash.com/photo-1527799822367-3debd8b8df6a?w=400"
  ];

  const reviews = biz.reviews?.map(r => ({
    id: r.id,
    name: r.profiles?.full_name || "User",
    avatar: r.profiles?.avatar_url || `https://i.pravatar.cc/150?u=${r.id}`,
    date: new Date(r.created_at).toLocaleDateString(),
    rating: r.rating,
    comment: r.comment
  })) || [];

  // Calculate average rating
  const avgRating = reviews.length > 0 
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
    : "5.0";

  const renderTabContent = () => {
    switch (activeTab) {
      case "Specialist":
        return (
          <View style={{ padding: 20 }}>
            {specialists.map((sp) => (
              <View
                key={sp.id}
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
                <Image
                  source={{ uri: sp.image_url }}
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: 28,
                    borderWidth: 2,
                    borderColor: PRIMARY,
                  }}
                  contentFit="cover"
                />
                <View style={{ flex: 1, marginLeft: 14 }}>
                  <Text
                    style={{
                      fontSize: 15,
                      fontWeight: "700",
                      color: "#1A1A1A",
                    }}
                  >
                    {sp.name}
                  </Text>
                  <Text
                    style={{ fontSize: 13, color: "#888", marginBottom: 4 }}
                  >
                    {sp.service}
                  </Text>
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <Star size={12} color="#FFD93D" fill="#FFD93D" />
                    <Text
                      style={{
                        fontSize: 12,
                        fontWeight: "600",
                        color: "#1A1A1A",
                        marginLeft: 3,
                      }}
                    >
                      {sp.rating}
                    </Text>
                  </View>
                </View>
                <TouchableOpacity
                  onPress={() =>
                    router.push({
                      pathname: "/booking/date",
                      params: {
                        salon: biz.name,
                        salonImage: biz.image_url,
                        service: sp.service,
                        specialist: sp.name,
                        specialistImage: sp.image_url,
                      },
                    })
                  }
                  style={{
                    backgroundColor: PRIMARY,
                    borderRadius: 20,
                    paddingHorizontal: 16,
                    paddingVertical: 8,
                  }}
                >
                  <Text
                    style={{ color: "#fff", fontSize: 12, fontWeight: "700" }}
                  >
                    Book
                  </Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        );

      case "Package":
        return (
          <View style={{ padding: 20 }}>
            {(biz.packages && biz.packages.length > 0 ? biz.packages : packages).map((pkg) => (
              <View
                key={pkg.id}
                style={{
                  backgroundColor: "#fff",
                  borderRadius: 16,
                  padding: 18,
                  marginBottom: 12,
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.05,
                  shadowRadius: 6,
                  elevation: 2,
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    marginBottom: 6,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 15,
                      fontWeight: "700",
                      color: "#1A1A1A",
                      flex: 1,
                    }}
                  >
                    {pkg.name}
                  </Text>
                  <Text
                    style={{ fontSize: 15, fontWeight: "800", color: PRIMARY }}
                  >
                    {pkg.price}
                  </Text>
                </View>
                <Text style={{ fontSize: 13, color: "#888", marginBottom: 12 }}>
                  {pkg.description || pkg.desc}
                </Text>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <Clock size={14} color="#888" />
                    <Text
                      style={{ fontSize: 13, color: "#888", marginLeft: 6 }}
                    >
                      {pkg.duration}
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() =>
                      router.push({
                        pathname: "/booking/date",
                        params: {
                          salon: biz.name,
                          salonImage: biz.image_url,
                          service: pkg.name,
                          price: pkg.price,
                          specialist: 'No Specialist',
                        },
                      })
                    }
                    style={{
                      backgroundColor: "#E0F5F3",
                      borderRadius: 20,
                      paddingHorizontal: 16,
                      paddingVertical: 8,
                    }}
                  >
                    <Text
                      style={{
                        color: PRIMARY,
                        fontSize: 12,
                        fontWeight: "700",
                      }}
                    >
                      Book
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        );

      case "Gallery":
        return (
          <View style={{ padding: 20 }}>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
              {galleryImages.map((img, i) => (
                <Image
                  key={i}
                  source={{ uri: img }}
                  style={{
                    width: (width - 56) / 3,
                    height: (width - 56) / 3,
                    borderRadius: 12,
                  }}
                  contentFit="cover"
                />
              ))}
            </View>
          </View>
        );

      case "Review":
        return (
          <View style={{ padding: 20 }}>
            {/* Summary */}
            <View
              style={{
                backgroundColor: "#fff",
                borderRadius: 16,
                padding: 20,
                marginBottom: 16,
                alignItems: "center",
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.05,
                shadowRadius: 6,
                elevation: 2,
              }}
            >
              <Text
                style={{ fontSize: 48, fontWeight: "800", color: "#1A1A1A" }}
              >
                {avgRating}
              </Text>
              <StarRow rating={parseFloat(avgRating)} size={18} />
              <Text style={{ fontSize: 13, color: "#888", marginTop: 6 }}>
                {reviews.length} Reviews
              </Text>
            </View>
            {reviews.map((review) => (
              <View
                key={review.id}
                style={{
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
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginBottom: 10,
                  }}
                >
                  <Image
                    source={{ uri: review.avatar }}
                    style={{ width: 44, height: 44, borderRadius: 22 }}
                    contentFit="cover"
                  />
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text
                      style={{
                        fontSize: 14,
                        fontWeight: "700",
                        color: "#1A1A1A",
                      }}
                    >
                      {review.name}
                    </Text>
                    <Text style={{ fontSize: 11, color: "#AAA" }}>
                      {review.date}
                    </Text>
                  </View>
                  <StarRow rating={review.rating} />
                </View>
                <Text style={{ fontSize: 13, color: "#555", lineHeight: 20 }}>
                  {review.comment}
                </Text>
              </View>
            ))}
          </View>
        );

      case "About us":
      default:
        return (
          <View style={{ padding: 20 }}>
            <View
              style={{
                backgroundColor: "#fff",
                borderRadius: 16,
                padding: 18,
                marginBottom: 14,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.05,
                shadowRadius: 6,
                elevation: 2,
              }}
            >
              <Text
                style={{
                  fontSize: 15,
                  fontWeight: "700",
                  color: "#1A1A1A",
                  marginBottom: 10,
                }}
              >
                About {biz.name}
              </Text>
              <Text style={{ fontSize: 14, color: "#666", lineHeight: 22 }}>
                {biz.description || `${biz.name} is a premier beauty destination. We offer a wide range of services including hair styling, manicures, pedicures, facials, and full body spa treatments. Our team of experienced specialists are dedicated to making you look and feel your best.`}
              </Text>
            </View>

            <View
              style={{
                backgroundColor: "#fff",
                borderRadius: 16,
                padding: 18,
                marginBottom: 14,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.05,
                shadowRadius: 6,
                elevation: 2,
              }}
            >
              <Text
                style={{
                  fontSize: 15,
                  fontWeight: "700",
                  color: "#1A1A1A",
                  marginBottom: 14,
                }}
              >
                Working Hours
              </Text>
              {(biz.working_hours && Array.isArray(biz.working_hours) && biz.working_hours.length > 0 
                ? biz.working_hours 
                : [
                  { day: "Monday – Friday", hours: "8:00 AM – 7:00 PM" },
                  { day: "Saturday", hours: "9:00 AM – 6:00 PM" },
                  { day: "Sunday", hours: "10:00 AM – 4:00 PM" },
                ]
              ).map((h, i, arr) => (
                <View
                  key={i}
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    paddingVertical: 8,
                    borderBottomWidth: i < arr.length - 1 ? 1 : 0,
                    borderBottomColor: "#F5F5F5",
                  }}
                >
                  <Text
                    style={{ fontSize: 13, color: "#555", fontWeight: "600" }}
                  >
                    {h.day}
                  </Text>
                  <Text
                    style={{ fontSize: 13, color: PRIMARY, fontWeight: "600" }}
                  >
                    {h.hours}
                  </Text>
                </View>
              ))}
            </View>

            <View
              style={{
                backgroundColor: "#fff",
                borderRadius: 16,
                padding: 18,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.05,
                shadowRadius: 6,
                elevation: 2,
              }}
            >
              <Text
                style={{
                  fontSize: 15,
                  fontWeight: "700",
                  color: "#1A1A1A",
                  marginBottom: 14,
                }}
              >
                Contact
              </Text>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginBottom: 10,
                }}
              >
                <Phone size={16} color={PRIMARY} />
                <Text style={{ fontSize: 14, color: "#555", marginLeft: 10 }}>
                  {biz.phone || "+233 244 123 456"}
                </Text>
              </View>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginBottom: 10,
                }}
              >
                <Globe size={16} color={PRIMARY} />
                <Text style={{ fontSize: 14, color: "#555", marginLeft: 10 }}>
                  {biz.website || "www.easybook.com"}
                </Text>
              </View>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <MapPin size={16} color={PRIMARY} />
                <Text
                  style={{
                    fontSize: 14,
                    color: "#555",
                    marginLeft: 10,
                    flex: 1,
                  }}
                >
                  {biz.address || "Kwabenya, Accra"}
                </Text>
              </View>
            </View>
          </View>
        );
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#F7F7F7" }}>
      <StatusBar style="light" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
      >
        {/* Hero Image */}
        <View style={{ position: "relative", height: 280 }}>
          <Image
            source={{
              uri: biz.image_url || "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800",
            }}
            style={{ width: "100%", height: "100%" }}
            contentFit="cover"
          />
          {/* Gradient overlay */}
          <View
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0,0,0,0.25)",
            }}
          />

          {/* Top buttons */}
          <View
            style={{
              position: "absolute",
              top: insets.top + 12,
              left: 20,
              right: 20,
              flexDirection: "row",
              justifyContent: "space-between",
            }}
          >
            <TouchableOpacity
              onPress={() => router.back()}
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: "rgba(0,0,0,0.35)",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <ArrowLeft size={20} color="#fff" />
            </TouchableOpacity>
            <View style={{ flexDirection: "row", gap: 10 }}>
              <TouchableOpacity
                onPress={() => handleAction("Call")}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: "rgba(0,0,0,0.35)",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Phone size={18} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleAction("Share")}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: "rgba(0,0,0,0.35)",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Share2 size={18} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={toggleFavourite}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: "rgba(0,0,0,0.35)",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Heart
                  size={18}
                  color={liked ? "#FF6B6B" : "#fff"}
                  fill={liked ? "#FF6B6B" : "transparent"}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Rating pill */}
          <View style={{ position: "absolute", bottom: 20, left: 20 }}>
            <View
              style={{
                backgroundColor: PRIMARY,
                borderRadius: 20,
                paddingHorizontal: 14,
                paddingVertical: 7,
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <Star size={13} color="#fff" fill="#fff" />
              <Text
                style={{
                  color: "#fff",
                  fontWeight: "700",
                  fontSize: 13,
                  marginLeft: 4,
                }}
              >
                {biz.rating || "0.0"} ({biz.review_count || "0"} Review)
              </Text>
            </View>
          </View>
        </View>

        {/* Business Info Card */}
        <View
          style={{
            backgroundColor: "#fff",
            paddingHorizontal: 22,
            paddingTop: 20,
            paddingBottom: 16,
          }}
        >
          <Text
            style={{
              fontSize: 22,
              fontWeight: "800",
              color: "#1A1A1A",
              marginBottom: 10,
            }}
          >
            {biz.name}
          </Text>

          {/* Services chips */}
          <View
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              gap: 8,
              marginBottom: 14,
            }}
          >
            {(biz.categories || ["Salon", "Spa"]).map((s) => (
              <View
                key={typeof s === 'string' ? s : s.name}
                style={{
                  backgroundColor: "#E0F5F3",
                  borderRadius: 20,
                  paddingHorizontal: 12,
                  paddingVertical: 5,
                }}
              >
                <Text
                  style={{ fontSize: 12, color: PRIMARY, fontWeight: "600" }}
                >
                  {typeof s === 'string' ? s : s.name}
                </Text>
              </View>
            ))}
          </View>

          {/* Address + hours */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 6,
            }}
          >
            <MapPin size={14} color={PRIMARY} />
            <Text style={{ fontSize: 13, color: "#555", marginLeft: 6 }}>
              {biz.address || "Kwabenya, Accra"}
            </Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Clock size={14} color={PRIMARY} />
            <Text style={{ fontSize: 13, color: "#555", marginLeft: 6 }}>
              Open · Closes at 7:00 PM
            </Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View
          style={{
            backgroundColor: "#fff",
            borderTopWidth: 1,
            borderTopColor: "#F5F5F5",
            flexDirection: "row",
            justifyContent: "space-around",
            paddingVertical: 18,
            paddingHorizontal: 10,
            marginBottom: 8,
          }}
        >
          {[
            { label: "Website", icon: Globe, action: "Website" },
            { label: "Message", icon: MessageCircle, action: "Message" },
            { label: "Call", icon: Phone, action: "Call" },
            { label: "Direction", icon: Navigation, action: "Direction" },
            { label: "Share", icon: Share2, action: "Share" },
          ].map((btn) => (
            <TouchableOpacity 
              key={btn.label} 
              onPress={() => handleAction(btn.action)}
              style={{ alignItems: "center" }}
            >
              <View
                style={{
                  width: 46,
                  height: 46,
                  borderRadius: 23,
                  backgroundColor: "#E0F5F3",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 5,
                }}
              >
                <btn.icon size={20} color={PRIMARY} />
              </View>
              <Text style={{ fontSize: 11, color: "#555", fontWeight: "600" }}>
                {btn.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Tab Bar */}
        <View
          style={{
            backgroundColor: "#fff",
            borderBottomWidth: 1,
            borderBottomColor: "#F0F0F0",
          }}
        >
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ flexGrow: 0 }}
            contentContainerStyle={{ paddingHorizontal: 16 }}
          >
            {TABS.map((tab) => (
              <TouchableOpacity
                key={tab}
                onPress={() => setActiveTab(tab)}
                style={{
                  paddingHorizontal: 14,
                  paddingVertical: 14,
                  borderBottomWidth: 2.5,
                  borderBottomColor:
                    activeTab === tab ? PRIMARY : "transparent",
                  marginRight: 4,
                }}
              >
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: "700",
                    color: activeTab === tab ? PRIMARY : "#888",
                  }}
                >
                  {tab}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Tab Content */}
        {renderTabContent()}
      </ScrollView>

      {/* Book Appointment button */}
      <View
        style={{
          position: "absolute",
          bottom: insets.bottom + 10,
          left: 22,
          right: 22,
        }}
      >
        <TouchableOpacity
          onPress={() =>
            router.push({
              pathname: "/booking/date",
              params: {
                salon: business?.name || paramName,
                salonImage: business?.image_url,
                service: "Select Service",
                specialist: "No Specialist",
              },
            })
          }
          style={{
            backgroundColor: PRIMARY,
            borderRadius: 30,
            paddingVertical: 17,
            alignItems: "center",
            shadowColor: PRIMARY,
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.35,
            shadowRadius: 12,
            elevation: 6,
          }}
        >
          <Text
            style={{
              color: "#fff",
              fontSize: 16,
              fontWeight: "700",
              letterSpacing: 0.5,
            }}
          >
            Book Appointment
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
