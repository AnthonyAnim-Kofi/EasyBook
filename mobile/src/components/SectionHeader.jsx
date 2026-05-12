/**
 * Section Header — "Title" + "See all" pattern used throughout the app
 */
import { View, Text, TouchableOpacity } from 'react-native';
import { colors, typography } from '@/theme';

export default function SectionHeader({ title, actionText = 'See all', onAction, style }) {
  return (
    <View
      style={[
        {
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingHorizontal: 22,
          marginTop: 28,
          marginBottom: 16,
        },
        style,
      ]}
    >
      <Text style={{ fontSize: typography.size['2xl'], fontWeight: typography.weight.bold, color: colors.text }}>
        {title}
      </Text>
      {onAction && (
        <TouchableOpacity onPress={onAction}>
          <Text style={{ fontSize: typography.size.body, color: colors.primary, fontWeight: typography.weight.semibold }}>
            {actionText}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
