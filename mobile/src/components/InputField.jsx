/**
 * Reusable InputField Component
 */
import { View, Text, TextInput } from 'react-native';
import { colors, typography, radius } from '@/theme';

export default function InputField({
  label,
  icon: Icon,
  placeholder,
  value,
  onChangeText,
  keyboardType,
  secureTextEntry,
  autoCapitalize = 'none',
  onFocus,
  onBlur,
  right,
  error,
  variant = 'default', // 'default' | 'teal'
  style,
}) {
  const isTeal = variant === 'teal';

  return (
    <View style={[{ marginBottom: 16 }, style]}>
      {label && (
        <Text
          style={{
            fontSize: typography.size.body,
            fontWeight: typography.weight.semibold,
            color: colors.textSecondary,
            marginBottom: 8,
            marginLeft: 2,
          }}
        >
          {label}
        </Text>
      )}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: isTeal ? colors.inputBgAlt : colors.inputBg,
          borderWidth: isTeal ? 0 : 1.5,
          borderColor: error ? colors.error : colors.border,
          borderRadius: radius.lg,
          paddingHorizontal: 16,
        }}
      >
        {Icon && (
          <Icon
            size={18}
            color={isTeal ? colors.primary : '#999'}
            style={{ marginRight: 10 }}
          />
        )}
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={isTeal ? '#A0C4C1' : colors.textPlaceholder}
          keyboardType={keyboardType || 'default'}
          secureTextEntry={secureTextEntry}
          autoCapitalize={autoCapitalize}
          onFocus={onFocus}
          onBlur={onBlur}
          style={{
            flex: 1,
            paddingVertical: 15,
            fontSize: typography.size.lg,
            color: colors.text,
          }}
        />
        {right}
      </View>
      {error && (
        <Text style={{ color: colors.error, fontSize: typography.size.sm, marginTop: 4, marginLeft: 2 }}>
          {error}
        </Text>
      )}
    </View>
  );
}
