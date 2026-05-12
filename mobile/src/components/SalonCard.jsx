/**
 * SalonCard — Used in home screen and search results
 */
import { View, Text, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { MapPin, Star } from 'lucide-react-native';
import { colors, typography, radius, shadows } from '@/theme';

export default function SalonCard({ salon, onPress, onBook, style }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.9}
      style={[
        {
          marginHorizontal: 22,
          marginBottom: 16,
          backgroundColor: colors.card,
          borderRadius: radius['3xl'],
          overflow: 'hidden',
          ...shadows.md,
        },
        style,
      ]}
    >
      <Image
        source={{ uri: salon.image_url || salon.image }}
        style={{ width: '100%', height: 160 }}
        contentFit="cover"
      />
      <View style={{ padding: 16 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: typography.size.lg, fontWeight: typography.weight.bold, color: colors.text, marginBottom: 4 }}>
              {salon.name}
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <MapPin size={13} color="#999" />
              <Text style={{ fontSize: typography.size.sm, color: colors.textTertiary, marginLeft: 4 }}>
                {salon.location || salon.address || `${salon.city}, ${salon.country || 'Ghana'}`}
              </Text>
            </View>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
              <Star size={13} color={colors.star} fill={colors.star} />
              <Text style={{ fontSize: typography.size.body, fontWeight: typography.weight.bold, color: colors.text, marginLeft: 3 }}>
                {salon.rating}
              </Text>
              <Text style={{ fontSize: typography.size.xs, color: colors.textMuted, marginLeft: 2 }}>
                ({salon.review_count || salon.reviews || 0})
              </Text>
            </View>
            {onBook && (
              <TouchableOpacity
                onPress={onBook}
                style={{
                  backgroundColor: colors.primary,
                  borderRadius: radius.pill,
                  paddingHorizontal: 16,
                  paddingVertical: 8,
                }}
              >
                <Text style={{ color: colors.white, fontSize: typography.size.sm, fontWeight: typography.weight.bold }}>
                  Book Now
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}
