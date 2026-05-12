/**
 * SpecialistCard — Used in home screen and business detail
 */
import { View, Text, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { Star } from 'lucide-react-native';
import { colors, typography, radius, shadows } from '@/theme';

export default function SpecialistCard({ specialist, onBook, style }) {
  return (
    <TouchableOpacity
      activeOpacity={0.9}
      style={[
        {
          width: 130,
          backgroundColor: colors.card,
          borderRadius: radius['3xl'],
          padding: 14,
          alignItems: 'center',
          ...shadows.sm,
        },
        style,
      ]}
    >
      <Image
        source={{ uri: specialist.image_url || specialist.image }}
        style={{
          width: 64,
          height: 64,
          borderRadius: 32,
          marginBottom: 10,
          borderWidth: 2.5,
          borderColor: colors.primary,
        }}
        contentFit="cover"
      />
      <Text style={{ fontSize: typography.size.md, fontWeight: typography.weight.bold, color: colors.text, marginBottom: 2 }}>
        {specialist.name}
      </Text>
      <Text style={{ fontSize: typography.size.xs, color: colors.textTertiary, marginBottom: 8 }}>
        {specialist.service}
      </Text>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
        <Star size={12} color={colors.star} fill={colors.star} />
        <Text style={{ fontSize: typography.size.sm, fontWeight: typography.weight.bold, color: colors.text, marginLeft: 3 }}>
          {specialist.rating}
        </Text>
      </View>
      {onBook && (
        <TouchableOpacity
          onPress={onBook}
          style={{
            backgroundColor: colors.primary,
            borderRadius: radius.pill,
            paddingHorizontal: 18,
            paddingVertical: 7,
          }}
        >
          <Text style={{ color: colors.white, fontSize: typography.size.sm, fontWeight: typography.weight.bold }}>
            Book
          </Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
}
