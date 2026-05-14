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
  textContentType,
  autoComplete,
  onFocus,
  onBlur,
  right,
  prefix,
  error,
  multiline,
  numberOfLines,
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
          alignItems: multiline ? 'flex-start' : 'center',
          backgroundColor: isTeal ? colors.inputBgAlt : colors.inputBg,
          borderWidth: isTeal ? 0 : 1.5,
          borderColor: error ? colors.error : colors.border,
          borderRadius: radius.lg,
          paddingHorizontal: 16,
          minHeight: multiline ? 100 : 56,
        }}
      >
        {Icon && (
          <Icon
            size={18}
            color={isTeal ? colors.primary : '#999'}
            style={{ marginRight: 10, marginTop: multiline ? 18 : 0 }}
          />
        )}
        {prefix && (
          <Text
            style={{
              fontSize: typography.size.lg,
              color: colors.textSecondary,
              fontWeight: typography.weight.semibold,
              marginRight: 6,
              marginTop: multiline ? 16 : 0,
            }}
          >
            {prefix}
          </Text>
        )}
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={isTeal ? '#A0C4C1' : colors.textPlaceholder}
          keyboardType={keyboardType || 'default'}
          secureTextEntry={secureTextEntry}
          autoCapitalize={autoCapitalize}
          textContentType={textContentType}
          autoComplete={autoComplete}
          onFocus={onFocus}
          onBlur={onBlur}
          multiline={multiline}
          numberOfLines={numberOfLines}
          selectionColor={colors.primary}
          cursorColor={colors.primary}
          style={{
            flex: 1,
            paddingVertical: multiline ? 15 : 0,
            fontSize: typography.size.lg,
            color: colors.text,
            backgroundColor: 'transparent',
            textAlignVertical: multiline ? 'top' : 'center',
          }}
        />
        {right && <View style={{ marginTop: multiline ? 12 : 0 }}>{right}</View>}
      </View>
      {error && (
        <Text style={{ color: colors.error, fontSize: typography.size.sm, marginTop: 4, marginLeft: 2 }}>
          {error}
        </Text>
      )}
    </View>
  );
}
