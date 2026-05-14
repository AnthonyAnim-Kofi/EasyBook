import { useState, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  Platform,
  Dimensions,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import * as Location from 'expo-location';
import {
  Store,
  User,
  Mail,
  Phone,
  Lock,
  Eye,
  EyeOff,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Briefcase,
  CheckCircle2,
  Sparkles,
  Locate,
  Check,
} from "lucide-react-native";
import { useRouter } from "expo-router";
import KeyboardAvoidingAnimatedView from "@/components/KeyboardAvoidingAnimatedView";
import InputField from "@/components/InputField";
import Button from "@/components/Button";
import { colors, typography, radius, shadows, spacing } from "@/theme";
import authService from "@/services/auth";
import { useAuthStore } from "@/utils/auth/store";
import businessService from "@/services/business";
import { supabase } from "@/utils/supabase";

const { width: SCREEN_W } = Dimensions.get("window");
const TOTAL_STEPS = 3;

// ─── Business Categories ────────────────────────────────────────────────────

const CATEGORIES = [
  { id: "salon", label: "Hair Salon", emoji: "💇" },
  { id: "barber", label: "Barbershop", emoji: "💈" },
  { id: "spa", label: "Spa & Wellness", emoji: "🧖" },
  { id: "nails", label: "Nail Studio", emoji: "💅" },
  { id: "beauty", label: "Beauty & Makeup", emoji: "💄" },
  { id: "fitness", label: "Fitness", emoji: "🏋️" },
  { id: "health", label: "Healthcare", emoji: "🏥" },
  { id: "other", label: "Other", emoji: "✨" },
];

// ─── Step Indicator ─────────────────────────────────────────────────────────

function StepIndicator({ current, total }) {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        marginBottom: 28,
      }}
    >
      {Array.from({ length: total }).map((_, i) => {
        const isActive = i === current;
        const isDone = i < current;
        return (
          <View
            key={i}
            style={{
              width: isActive ? 32 : 10,
              height: 10,
              borderRadius: 5,
              backgroundColor: isActive
                ? colors.primary
                : isDone
                ? colors.primaryLight
                : colors.border,
            }}
          />
        );
      })}
    </View>
  );
}

// ─── Category Checkbox Chip ─────────────────────────────────────────────────

function CategoryChip({ item, isSelected, onPress }) {
  return (
    <TouchableOpacity
      onPress={() => onPress(item.id)}
      activeOpacity={0.7}
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        paddingVertical: 12,
        paddingHorizontal: 14,
        borderRadius: radius.lg,
        borderWidth: 2,
        borderColor: isSelected ? colors.primary : colors.border,
        backgroundColor: isSelected ? colors.primarySurface : colors.card,
        marginBottom: 10,
        // Responsive width: 2 columns with gap
        width: '48.5%', 
        ...( isSelected ? shadows.sm : {}),
      }}
    >
      <View
        style={{
          width: 20,
          height: 20,
          borderRadius: 6,
          borderWidth: 2,
          borderColor: isSelected ? colors.primary : colors.textMuted,
          backgroundColor: isSelected ? colors.primary : colors.transparent,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {isSelected && <Check size={14} color={colors.white} strokeWidth={3} />}
      </View>
      <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 6 }}>
        <Text style={{ fontSize: 16 }}>{item.emoji}</Text>
        <Text
          style={{
            fontSize: typography.size.body,
            fontWeight: isSelected
              ? typography.weight.bold
              : typography.weight.medium,
            color: isSelected ? colors.primaryDark : colors.text,
          }}
          numberOfLines={1}
        >
          {item.label}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// Main Screen
// ═══════════════════════════════════════════════════════════════════════════

export default function BusinessSignUpScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  // Step state
  const [step, setStep] = useState(0);

  // Step 1 — Business info
  const [bizName, setBizName] = useState("");
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [otherCategoryText, setOtherCategoryText] = useState("");
  const [location, setLocation] = useState("");
  const [locLoading, setLocLoading] = useState(false);

  // Step 2 — Owner details
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phonePrefix, setPhonePrefix] = useState("+233");
  const [phone, setPhone] = useState("");

  // Step 3 — Password
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});

  // Keyboard animation
  const paddingAnim = useRef(new Animated.Value(insets.bottom + 24)).current;
  const animateTo = (v) =>
    Animated.timing(paddingAnim, {
      toValue: v,
      duration: 200,
      useNativeDriver: false,
    }).start();
  const handleFocus = () => {
    if (Platform.OS !== "web") animateTo(24);
  };
  const handleBlur = () => {
    if (Platform.OS !== "web") animateTo(insets.bottom + 24);
  };

  // ─── Input Logic ────────────────────────────────────────────────────────

  const handlePhoneChange = (text) => {
    // Only allow digits
    const cleaned = text.replace(/[^0-9]/g, '');
    setPhone(cleaned);
  };

  const toggleCategory = (id) => {
    setSelectedCategories(prev => 
      prev.includes(id) 
        ? prev.filter(c => c !== id) 
        : [...prev, id]
    );
  };

  // ─── Live Location ───────────────────────────────────────────────────────

  const handleGetCurrentLocation = async () => {
    setLocLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setError('Permission to access location was denied');
        return;
      }

      const loc = await Location.getCurrentPositionAsync({});
      const address = await Location.reverseGeocodeAsync({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      });

      if (address && address[0]) {
        const addr = address[0];
        const formatted = [addr.name, addr.street, addr.city, addr.region].filter(Boolean).join(', ');
        setLocation(formatted);
      }
    } catch (err) {
      console.error(err);
      setError('Could not fetch current location.');
    } finally {
      setLocLoading(false);
    }
  };

  // ─── Validation ─────────────────────────────────────────────────────────

  const validateStep = () => {
    const errors = {};

    if (step === 0) {
      if (!bizName.trim()) errors.bizName = "Business name is required.";
      if (selectedCategories.length === 0) errors.category = "Select at least one category.";
      if (selectedCategories.includes('other') && !otherCategoryText.trim()) {
        errors.otherCategory = "Please specify your category.";
      }
      if (!location.trim()) errors.location = "Business location is required.";
    }

    if (step === 1) {
      if (!fullName.trim()) errors.fullName = "Your name is required.";
      if (!email.trim()) errors.email = "Email is required.";
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
        errors.email = "Invalid email address.";
      if (!phone.trim()) {
        errors.phone = "Phone number is required.";
      }
    }

    if (step === 2) {
      if (!password) errors.password = "Password is required.";
      else if (password.length < 6)
        errors.password = "Password must be at least 6 characters.";
      if (!confirm) errors.confirm = "Please confirm your password.";
      else if (password !== confirm)
        errors.confirm = "Passwords do not match.";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // ─── Navigation ─────────────────────────────────────────────────────────

  const handleNext = () => {
    if (!validateStep()) return;
    setError(null);
    setStep((s) => s + 1);
  };

  const handleBack = () => {
    if (step === 0) {
      router.back();
    } else {
      setError(null);
      setFieldErrors({});
      setStep((s) => s - 1);
    }
  };

  // ─── Submit ─────────────────────────────────────────────────────────────

  const handleSignUp = async () => {
    if (!validateStep()) return;
    setError(null);
    setLoading(true);

    try {
      const cleanPrefix = phonePrefix.replace(/[^0-9]/g, '');
      const cleanPhone = phone.replace(/[^0-9]/g, '');
      const numericPhone = `${cleanPrefix}${cleanPhone}`;

      const { user, confirmationRequired } = await authService.signUp({
        fullName,
        email,
        phone: numericPhone,
        password,
        role: "business_owner",
      });

      if (confirmationRequired) {
        Alert.alert(
          "Verify your email",
          "Your business account has been created! Please check your email to verify your account before logging in.",
          [{ text: "OK", onPress: () => router.replace("/signin") }]
        );
        return;
      }

      // Prepare category list
      let finalCategories = selectedCategories
        .filter(c => c !== 'other')
        .map(c => CATEGORIES.find(cat => cat.id === c).label);
      if (selectedCategories.includes('other')) {
        finalCategories.push(otherCategoryText);
      }

      // 1. Update the profile with business-specific info and ensure role is business_owner
      await authService.updateProfile({
        business_name: bizName,
        business_location: location,
        business_category: finalCategories.join(', '),
        role: "business_owner",
      });

      // 2. Create the business record in the 'businesses' table
      const { error: bizError } = await supabase
        .from('businesses')
        .insert({
          owner_id: user.id,
          name: bizName,
          phone: numericPhone, // Added numeric phone
          city: location.split(',').pop()?.trim() || "Takoradi", 
          address: location,
          category: finalCategories[0] || "General",
          services_tags: finalCategories,
          rating: 4.5,
          image_url: "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800",
        });

      if (bizError) {
        console.error('Error creating business record:', bizError);
      }

      // Refresh profile to pick up has_business flag
      await authService.getMe();
      
      // Set app mode to business
      const { setAppMode } = useAuthStore.getState();
      setAppMode('business');

      router.replace("/business/dashboard");
    } catch (err) {
      setError(err.message || "Sign up failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ─── Step Headers ───────────────────────────────────────────────────────

  const STEP_META = [
    {
      tag: "STEP 1 OF 3",
      title: "Tell us about\nyour business",
      subtitle: "We'll create your business profile",
      icon: Store,
    },
    {
      tag: "STEP 2 OF 3",
      title: "Your personal\ndetails",
      subtitle: "So clients and us can reach you",
      icon: User,
    },
    {
      tag: "STEP 3 OF 3",
      title: "Secure your\naccount",
      subtitle: "Create a strong password",
      icon: Lock,
    },
  ];

  const meta = STEP_META[step];

  // ─── Render ─────────────────────────────────────────────────────────────

  return (
    <KeyboardAvoidingAnimatedView style={{ flex: 1 }} behavior="padding">
      <StatusBar style="light" />
      <View style={{ flex: 1, backgroundColor: colors.primary }}>
        {/* ── Teal Header ────────────────────────────────────────── */}
        <View
          style={{
            paddingTop: insets.top + 12,
            paddingHorizontal: 22,
            paddingBottom: 28,
          }}
        >
          {/* Back + Tag */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 18,
            }}
          >
            <TouchableOpacity
              onPress={handleBack}
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: "rgba(255,255,255,0.15)",
                alignItems: "center",
                justifyContent: "center",
                marginRight: 12,
              }}
            >
              <ChevronLeft size={22} color={colors.white} />
            </TouchableOpacity>
            <View
              style={{
                backgroundColor: "rgba(255,255,255,0.18)",
                paddingHorizontal: 12,
                paddingVertical: 5,
                borderRadius: radius.pill,
                flexDirection: "row",
                alignItems: "center",
                gap: 6,
              }}
            >
              <Sparkles size={13} color={colors.white} />
              <Text
                style={{
                  fontSize: typography.size.xs,
                  fontWeight: typography.weight.bold,
                  color: colors.white,
                  letterSpacing: 1.2,
                }}
              >
                BUSINESS ACCOUNT
              </Text>
            </View>
          </View>

          {/* Title */}
          <Text
            style={{
              fontSize: typography.size["4xl"],
              fontWeight: typography.weight.extrabold,
              color: colors.white,
              lineHeight: 34,
              marginBottom: 6,
            }}
          >
            {meta.title}
          </Text>
          <Text
            style={{
              fontSize: typography.size.md,
              color: colors.whiteAlpha75,
            }}
          >
            {meta.subtitle}
          </Text>
        </View>

        {/* ── White Card Body ────────────────────────────────────── */}
        <Animated.View
          style={{
            flex: 1,
            backgroundColor: colors.card,
            borderTopLeftRadius: 32,
            borderTopRightRadius: 32,
            paddingTop: 28,
          }}
        >
          <Animated.ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{
              paddingHorizontal: 24,
              paddingBottom: paddingAnim,
            }}
          >
            {/* Step dots */}
            <StepIndicator current={step} total={TOTAL_STEPS} />

            {/* Error banner */}
            {error && (
              <View
                style={{
                  backgroundColor: colors.errorBg,
                  borderRadius: radius.md,
                  padding: 12,
                  marginBottom: 16,
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <Text
                  style={{
                    color: colors.error,
                    fontSize: typography.size.body,
                    flex: 1,
                  }}
                >
                  {error}
                </Text>
              </View>
            )}

            {/* ════════ STEP 1: Business Info ════════ */}
            {step === 0 && (
              <View>
                <InputField
                  label="Business Name"
                  icon={Store}
                  placeholder="e.g. Glamour Beauty Lounge"
                  value={bizName}
                  onChangeText={setBizName}
                  variant="teal"
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                  error={fieldErrors.bizName}
                />

                <InputField
                  label="Business Location"
                  icon={MapPin}
                  placeholder="e.g. Takoradi Market Circle"
                  value={location}
                  onChangeText={setLocation}
                  variant="teal"
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                  error={fieldErrors.location}
                  right={
                    <TouchableOpacity 
                      onPress={handleGetCurrentLocation}
                      disabled={locLoading}
                      style={{ padding: 8 }}
                    >
                      {locLoading ? (
                        <ActivityIndicator size="small" color={colors.primary} />
                      ) : (
                        <Locate size={20} color={colors.primary} />
                      )}
                    </TouchableOpacity>
                  }
                />

                {/* Category picker */}
                <Text
                  style={{
                    fontSize: typography.size.body,
                    fontWeight: typography.weight.semibold,
                    color: colors.textSecondary,
                    marginBottom: 10,
                    marginLeft: 2,
                  }}
                >
                  Business Categories (Select all that apply)
                </Text>
                {fieldErrors.category && (
                  <Text
                    style={{
                      color: colors.error,
                      fontSize: typography.size.sm,
                      marginBottom: 8,
                      marginLeft: 2,
                    }}
                  >
                    {fieldErrors.category}
                  </Text>
                )}
                <View
                  style={{
                    flexDirection: "row",
                    flexWrap: "wrap",
                    justifyContent: "space-between",
                    marginBottom: 8,
                  }}
                >
                  {CATEGORIES.map((cat) => (
                    <CategoryChip
                      key={cat.id}
                      item={cat}
                      isSelected={selectedCategories.includes(cat.id)}
                      onPress={toggleCategory}
                    />
                  ))}
                </View>

                {/* Other category input */}
                {selectedCategories.includes('other') && (
                  <Animated.View 
                    entering={Animated.FadeIn}
                    style={{ marginTop: 8 }}
                  >
                    <InputField
                      label="Specify Other Category"
                      placeholder="e.g. Pet Grooming, Car Wash"
                      value={otherCategoryText}
                      onChangeText={setOtherCategoryText}
                      variant="teal"
                      onFocus={handleFocus}
                      onBlur={handleBlur}
                      multiline={true}
                      numberOfLines={3}
                      error={fieldErrors.otherCategory}
                      style={{ marginBottom: 20 }}
                    />
                  </Animated.View>
                )}
              </View>
            )}

            {/* ════════ STEP 2: Owner Details ════════ */}
            {step === 1 && (
              <View>
                <InputField
                  label="Full Name"
                  icon={User}
                  placeholder="Enter your full name"
                  value={fullName}
                  onChangeText={setFullName}
                  variant="teal"
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                  error={fieldErrors.fullName}
                  textContentType="name"
                  autoComplete="name"
                />

                <InputField
                  label="Email Address"
                  icon={Mail}
                  placeholder="Enter your email"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  variant="teal"
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                  error={fieldErrors.email}
                  textContentType="emailAddress"
                  autoComplete="email"
                />

                <InputField
                  label="Phone Number"
                  icon={Phone}
                  placeholder="024 123 4567"
                  prefix={phonePrefix}
                  value={phone}
                  onChangeText={handlePhoneChange}
                  keyboardType="phone-pad"
                  variant="teal"
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                  error={fieldErrors.phone}
                  textContentType="telephoneNumber"
                  autoComplete="tel"
                />

                <View
                  style={{
                    backgroundColor: colors.primarySurface,
                    borderRadius: radius.md,
                    padding: 14,
                    flexDirection: "row",
                    alignItems: "flex-start",
                    gap: 10,
                    marginTop: 4,
                  }}
                >
                  <Briefcase
                    size={16}
                    color={colors.primary}
                    style={{ marginTop: 2 }}
                  />
                  <Text
                    style={{
                      fontSize: typography.size.sm,
                      color: colors.primaryDark,
                      flex: 1,
                      lineHeight: 18,
                    }}
                  >
                    Your phone number will be visible to customers so they can
                    reach your business directly.
                  </Text>
                </View>
              </View>
            )}

            {/* ════════ STEP 3: Password ════════ */}
            {step === 2 && (
              <View>
                <InputField
                  label="Password"
                  icon={Lock}
                  placeholder="Create a password"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPass}
                  variant="teal"
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                  error={fieldErrors.password}
                  textContentType="newPassword"
                  autoComplete="password-new"
                  right={
                    <TouchableOpacity onPress={() => setShowPass(!showPass)}>
                      {showPass ? (
                        <EyeOff size={18} color={colors.primary} />
                      ) : (
                        <Eye size={18} color={colors.primary} />
                      )}
                    </TouchableOpacity>
                  }
                />

                <InputField
                  label="Confirm Password"
                  icon={Lock}
                  placeholder="Confirm your password"
                  value={confirm}
                  onChangeText={setConfirm}
                  secureTextEntry={!showConfirm}
                  variant="teal"
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                  error={fieldErrors.confirm}
                  textContentType="newPassword"
                  autoComplete="password-new"
                  right={
                    <TouchableOpacity
                      onPress={() => setShowConfirm(!showConfirm)}
                    >
                      {showConfirm ? (
                        <EyeOff size={18} color={colors.primary} />
                      ) : (
                        <Eye size={18} color={colors.primary} />
                      )}
                    </TouchableOpacity>
                  }
                />

                {/* Password strength hints */}
                <View
                  style={{
                    marginTop: 4,
                    marginBottom: 8,
                    gap: 6,
                  }}
                >
                  <PasswordHint
                    met={password.length >= 6}
                    label="At least 6 characters"
                  />
                  <PasswordHint
                    met={/[A-Z]/.test(password)}
                    label="One uppercase letter"
                  />
                  <PasswordHint
                    met={/[0-9]/.test(password)}
                    label="One number"
                  />
                </View>

                {/* Summary card */}
                <View
                  style={{
                    backgroundColor: colors.primarySurface,
                    borderRadius: radius.lg,
                    padding: 16,
                    marginTop: 8,
                    gap: 10,
                  }}
                >
                  <Text
                    style={{
                      fontSize: typography.size.body,
                      fontWeight: typography.weight.bold,
                      color: colors.primaryDark,
                      marginBottom: 2,
                    }}
                  >
                    Account Summary
                  </Text>
                  <SummaryRow label="Business" value={bizName} />
                  <SummaryRow
                    label="Categories"
                    value={
                      selectedCategories
                        .map(id => id === 'other' ? otherCategoryText : CATEGORIES.find(c => c.id === id)?.label)
                        .filter(Boolean)
                        .join(', ') || "—"
                    }
                  />
                  <SummaryRow label="Location" value={location} />
                  <SummaryRow label="Owner" value={fullName} />
                  <SummaryRow label="Email" value={email} />
                </View>
              </View>
            )}

            {/* ── Actions ────────────────────────────────────────── */}
            <View style={{ marginTop: 24 }}>
              {step < TOTAL_STEPS - 1 ? (
                <Button
                  title="Continue"
                  onPress={handleNext}
                  style={{ marginBottom: 16 }}
                />
              ) : (
                <Button
                  title={loading ? "Creating account…" : "Create Business Account"}
                  onPress={handleSignUp}
                  loading={loading}
                  disabled={loading}
                  style={{ marginBottom: 16 }}
                />
              )}

              {/* Sign in link */}
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "center",
                  alignItems: "center",
                  marginBottom: 12,
                }}
              >
                <Text
                  style={{
                    fontSize: typography.size.md,
                    color: colors.textTertiary,
                  }}
                >
                  Already have an account?{" "}
                </Text>
                <TouchableOpacity onPress={() => router.push("/signin")}>
                  <Text
                    style={{
                      fontSize: typography.size.md,
                      color: colors.primary,
                      fontWeight: typography.weight.bold,
                    }}
                  >
                    Log In
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Customer signup link */}
              <TouchableOpacity
                onPress={() => router.replace("/signup")}
                style={{ alignItems: "center", paddingVertical: 6 }}
              >
                <Text
                  style={{
                    fontSize: typography.size.body,
                    color: colors.textTertiary,
                  }}
                >
                  Not a business owner?{" "}
                  <Text
                    style={{
                      color: colors.primary,
                      fontWeight: typography.weight.bold,
                    }}
                  >
                    Sign Up as Customer
                  </Text>
                </Text>
              </TouchableOpacity>
            </View>
          </Animated.ScrollView>
        </Animated.View>
      </View>
    </KeyboardAvoidingAnimatedView>
  );
}

// ─── Small helper components ────────────────────────────────────────────────

function PasswordHint({ met, label }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
      <CheckCircle2
        size={15}
        color={met ? colors.success : colors.textMuted}
      />
      <Text
        style={{
          fontSize: typography.size.sm,
          color: met ? colors.success : colors.textMuted,
          fontWeight: met
            ? typography.weight.semibold
            : typography.weight.regular,
        }}
      >
        {label}
      </Text>
    </View>
  );
}

function SummaryRow({ label, value }) {
  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <Text
        style={{
          fontSize: typography.size.sm,
          color: colors.primaryDark,
          fontWeight: typography.weight.medium,
        }}
      >
        {label}
      </Text>
      <Text
        style={{
          fontSize: typography.size.sm,
          color: colors.text,
          fontWeight: typography.weight.semibold,
          maxWidth: "60%",
          textAlign: "right",
        }}
        numberOfLines={1}
      >
        {value || "—"}
      </Text>
    </View>
  );
}
