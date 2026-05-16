import { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { ArrowLeft, Star } from "lucide-react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { supabase } from "@/utils/supabase";

const PRIMARY = "#00A896";

export default function LeaveReviewScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { bookingId, businessId, businessName } = useLocalSearchParams();

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!comment.trim()) {
      Alert.alert("Error", "Please enter a comment");
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from('reviews')
        .insert({
          business_id: businessId,
          user_id: user.id,
          rating,
          comment: comment.trim(),
        });

      if (error) throw error;

      Alert.alert("Success", "Thank you for your review!", [
        { text: "OK", onPress: () => router.back() }
      ]);
    } catch (err) {
      console.error("Error submitting review:", err);
      Alert.alert("Error", "Could not submit review. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <StatusBar style="dark" />
      
      {/* Header */}
      <View style={{ paddingTop: insets.top + 10, paddingHorizontal: 22, paddingBottom: 15, borderBottomWidth: 1, borderBottomColor: "#F0F0F0", flexDirection: "row", alignItems: "center" }}>
        <TouchableOpacity onPress={() => router.back()} style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: "#F5F5F5", alignItems: "center", justifyContent: "center", marginRight: 15 }}>
          <ArrowLeft size={20} color="#1A1A1A" />
        </TouchableOpacity>
        <Text style={{ fontSize: 18, fontWeight: "700", color: "#1A1A1A" }}>Review {businessName}</Text>
      </View>

      <View style={{ padding: 22 }}>
        <Text style={{ fontSize: 16, fontWeight: "600", color: "#555", textAlign: "center", marginBottom: 20 }}>How was your experience?</Text>
        
        {/* Stars */}
        <View style={{ flexDirection: "row", justifyContent: "center", gap: 10, marginBottom: 30 }}>
          {[1, 2, 3, 4, 5].map((s) => (
            <TouchableOpacity key={s} onPress={() => setRating(s)}>
              <Star 
                size={40} 
                color={s <= rating ? "#FFD93D" : "#DDD"} 
                fill={s <= rating ? "#FFD93D" : "transparent"} 
              />
            </TouchableOpacity>
          ))}
        </View>

        <Text style={{ fontSize: 14, fontWeight: "600", color: "#555", marginBottom: 10 }}>Your Comment</Text>
        <TextInput
          value={comment}
          onChangeText={setComment}
          placeholder="What did you like or dislike?"
          multiline
          numberOfLines={6}
          style={{
            backgroundColor: "#F9F9F9",
            borderRadius: 16,
            padding: 16,
            fontSize: 15,
            color: "#1A1A1A",
            borderWidth: 1.5,
            borderColor: "#EEEEEE",
            textAlignVertical: "top",
            minHeight: 150,
            marginBottom: 30
          }}
        />

        <TouchableOpacity
          onPress={handleSubmit}
          disabled={loading}
          style={{
            backgroundColor: PRIMARY,
            borderRadius: 30,
            paddingVertical: 17,
            alignItems: "center",
            opacity: loading ? 0.7 : 1,
            shadowColor: PRIMARY,
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.3,
            shadowRadius: 12,
            elevation: 5
          }}
        >
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={{ color: "#fff", fontSize: 16, fontWeight: "700" }}>Submit Review</Text>}
        </TouchableOpacity>
      </View>
    </View>
  );
}
