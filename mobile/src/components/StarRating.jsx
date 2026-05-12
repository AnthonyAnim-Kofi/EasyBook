/**
 * Star Rating Component
 */
import { View } from 'react-native';
import { Star } from 'lucide-react-native';
import { colors } from '@/theme';

export default function StarRating({ rating, size = 14, count = 5, style }) {
  return (
    <View style={[{ flexDirection: 'row', gap: 2 }, style]}>
      {Array.from({ length: count }, (_, i) => (
        <Star
          key={i}
          size={size}
          color={colors.star}
          fill={i < Math.round(rating) ? colors.star : 'transparent'}
        />
      ))}
    </View>
  );
}
