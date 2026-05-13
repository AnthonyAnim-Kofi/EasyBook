import { useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Dimensions,
  Animated,
} from "react-native";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";

const { width } = Dimensions.get("window");
const PRIMARY = "#00A896";
const BG = "#EDE9E8";
const LOGO =
  "https://dtvoeevhaseb5.cloudfront.net/user-uploads/5aef1f95-46e0-4939-bb75-8d14ba5b62fb.png";

const slides = [
  {
    id: "1",
    title: "Discover Beauty\nServices Near You!",
    subtitle:
      "Find top-rated salons, barbers, and spas\nin your neighborhood, all in one place.",
    image: "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800",
  },
  {
    id: "2",
    title: "Book Anytime,\nAnywhere.",
    subtitle:
      "Schedule your appointments in seconds —\nno calls, no waiting, just easy booking.",
    image: "https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=800",
  },
  {
    id: "3",
    title: "Rate & Get\nRewarded.",
    subtitle:
      "Share your experience and earn rewards\nevery time you complete a booking.",
    image: "https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=800",
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef(null);
  const scrollX = useRef(new Animated.Value(0)).current;

  const getItemLayout = (_, index) => ({
    length: width,
    offset: width * index,
    index,
  });

  const handleNext = () => {
    const nextIndex = currentIndex + 1;
    if (nextIndex < slides.length) {
      flatListRef.current?.scrollToIndex({
        index: nextIndex,
        animated: true,
      });
      setCurrentIndex(nextIndex); // Optimistically update
    } else {
      router.push("/signin");
    }
  };

  const handleSkip = () => {
    router.replace("/signin");
  };

  const renderItem = ({ item }) => (
    <View
      style={{ width, flex: 1, alignItems: "center", paddingHorizontal: 28 }}
    >
      <Image
        source={{ uri: item.image }}
        style={{
          width: width * 0.85,
          height: width * 0.75,
          borderRadius: 24,
          marginBottom: 32,
        }}
        contentFit="cover"
        transition={300}
      />
      <Text
        style={{
          fontSize: 28,
          fontWeight: "800",
          color: "#1A1A1A",
          textAlign: "center",
          lineHeight: 36,
          marginBottom: 14,
        }}
      >
        {item.title}
      </Text>
      <Text
        style={{
          fontSize: 15,
          color: "#777",
          textAlign: "center",
          lineHeight: 22,
        }}
      >
        {item.subtitle}
      </Text>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: BG, paddingTop: insets.top }}>
      <StatusBar style="dark" />

      {/* Skip button */}
      <TouchableOpacity
        onPress={handleSkip}
        style={{
          position: "absolute",
          top: insets.top + 16,
          right: 24,
          zIndex: 10,
        }}
      >
        <Text style={{ color: PRIMARY, fontWeight: "600", fontSize: 15 }}>
          Skip
        </Text>
      </TouchableOpacity>

      {/* Logo top */}
      <View style={{ alignItems: "center", paddingTop: 20, marginBottom: 16 }}>
        <Image
          source={{ uri: LOGO }}
          style={{ width: 52, height: 52, borderRadius: 14 }}
          contentFit="contain"
        />
        <Text
          style={{
            fontSize: 16,
            fontWeight: "700",
            color: "#1A1A1A",
            marginTop: 6,
          }}
        >
          EasyBook
        </Text>
      </View>

      {/* Slides */}
      <Animated.FlatList
        ref={flatListRef}
        data={slides}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false },
        )}
        onMomentumScrollEnd={(e) => {
          const index = Math.round(e.nativeEvent.contentOffset.x / width);
          setCurrentIndex(index);
        }}
        scrollEventThrottle={16}
        getItemLayout={getItemLayout}
        onScrollToIndexFailed={(info) => {
          const wait = new Promise(resolve => setTimeout(resolve, 500));
          wait.then(() => {
            flatListRef.current?.scrollToIndex({ index: info.index, animated: true });
          });
        }}
        style={{ flex: 1 }}
      />

      {/* Bottom area */}
      <View
        style={{
          paddingHorizontal: 28,
          paddingBottom: insets.bottom + 24,
          alignItems: "center",
        }}
      >
        {/* Dots */}
        <View style={{ flexDirection: "row", marginBottom: 28 }}>
          {slides.map((_, i) => {
            const inputRange = [(i - 1) * width, i * width, (i + 1) * width];
            const dotWidth = scrollX.interpolate({
              inputRange,
              outputRange: [8, 24, 8],
              extrapolate: "clamp",
            });
            const dotColor = scrollX.interpolate({
              inputRange,
              outputRange: ["#D0CBC9", PRIMARY, "#D0CBC9"],
              extrapolate: "clamp",
            });
            return (
              <Animated.View
                key={i}
                style={{
                  width: dotWidth,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: dotColor,
                  marginHorizontal: 4,
                }}
              />
            );
          })}
        </View>

        {/* Next / Get Started button */}
        <TouchableOpacity
          onPress={handleNext}
          style={{
            backgroundColor: PRIMARY,
            borderRadius: 30,
            paddingVertical: 16,
            width: "100%",
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
            {currentIndex === slides.length - 1 ? "Get Started" : "Next"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
