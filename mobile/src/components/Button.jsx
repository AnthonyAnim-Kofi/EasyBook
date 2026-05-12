/**
 * Reusable Button Component
 * Variants: primary, secondary, outline, danger
 */
import { TouchableOpacity, Text, ActivityIndicator } from 'react-native';
import { colors, typography, radius, shadows } from '@/theme';

const VARIANTS = {
  primary: {
    bg: colors.primary,
    bgDisabled: colors.primaryLight,
    text: colors.white,
    shadow: shadows.primary,
  },
  secondary: {
    bg: colors.primarySurface,
    bgDisabled: colors.primarySurface,
    text: colors.primary,
    shadow: {},
  },
  outline: {
    bg: colors.transparent,
    bgDisabled: colors.transparent,
    text: colors.primary,
    shadow: {},
    border: { borderWidth: 1.5, borderColor: colors.primary },
  },
  danger: {
    bg: colors.error,
    bgDisabled: '#E88',
    text: colors.white,
    shadow: {},
  },
};

export default function Button({
  title,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  size = 'lg',
  style,
  textStyle,
}) {
  const v = VARIANTS[variant] || VARIANTS.primary;
  const isDisabled = disabled || loading;

  const sizeStyles = {
    sm: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: radius.round, fontSize: typography.size.sm },
    md: { paddingVertical: 13, paddingHorizontal: 20, borderRadius: radius.pill, fontSize: typography.size.md },
    lg: { paddingVertical: 17, paddingHorizontal: 24, borderRadius: radius.pill, fontSize: typography.size.xl },
  };

  const s = sizeStyles[size];

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.8}
      style={[
        {
          backgroundColor: isDisabled ? v.bgDisabled : v.bg,
          borderRadius: s.borderRadius,
          paddingVertical: s.paddingVertical,
          paddingHorizontal: s.paddingHorizontal,
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'row',
          gap: 8,
        },
        v.shadow,
        v.border,
        style,
      ]}
    >
      {loading && <ActivityIndicator size="small" color={v.text} />}
      <Text
        style={[
          {
            color: v.text,
            fontSize: s.fontSize,
            fontWeight: typography.weight.bold,
            letterSpacing: 0.5,
          },
          textStyle,
        ]}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
}
