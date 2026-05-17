import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  ScrollView,
  Animated,
  Dimensions,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Svg, Path, Rect, Circle, G, Defs, LinearGradient as SvgLinearGradient, Stop } from 'react-native-svg';
import { Colors, Spacing, BorderRadius, Typography } from '../constants/Theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { useAuth } from '../store/AuthContext';

// Ensure the auth session completes when returning to the app
WebBrowser.maybeCompleteAuthSession();

// ─── SVG Icon Components ────────────────────────────────────────────

const ShieldIcon = () => (
  <Svg width={48} height={48} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 2L3.5 6.5V11.5C3.5 16.45 7.02 21.08 12 22.5C16.98 21.08 20.5 16.45 20.5 11.5V6.5L12 2Z"
      stroke="white"
      strokeWidth={1.8}
      strokeLinejoin="round"
      fill="none"
    />
    <Path
      d="M9 12L11 14L15 10"
      stroke="white"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const SecureIcon = () => (
  <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 2L3.5 6.5V11.5C3.5 16.45 7.02 21.08 12 22.5C16.98 21.08 20.5 16.45 20.5 11.5V6.5L12 2Z"
      stroke={Colors.badgeText}
      strokeWidth={2}
      strokeLinejoin="round"
      fill="none"
    />
    <Path
      d="M9 12L11 14L15 10"
      stroke={Colors.badgeText}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const LanguageIcon = () => (
  <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
    <Path
      d="M5 8L10 13M4 14L10 8L12 5"
      stroke={Colors.badgeText}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M2 5H16"
      stroke={Colors.badgeText}
      strokeWidth={2}
      strokeLinecap="round"
    />
    <Path
      d="M9 3V5"
      stroke={Colors.badgeText}
      strokeWidth={2}
      strokeLinecap="round"
    />
    <Path
      d="M14 17L17 10L20 17"
      stroke={Colors.badgeText}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M15 15H19"
      stroke={Colors.badgeText}
      strokeWidth={2}
      strokeLinecap="round"
    />
  </Svg>
);

const FreeIcon = () => (
  <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
    <Rect
      x={3}
      y={6}
      width={18}
      height={13}
      rx={2}
      stroke={Colors.badgeText}
      strokeWidth={2}
      fill="none"
    />
    <Path
      d="M3 10H21"
      stroke={Colors.badgeText}
      strokeWidth={2}
    />
    <Path
      d="M7 15H10"
      stroke={Colors.badgeText}
      strokeWidth={2}
      strokeLinecap="round"
    />
  </Svg>
);

const ScaleIcon = () => (
  <Svg width={28} height={28} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 3V21"
      stroke={Colors.featureBlueText}
      strokeWidth={1.8}
      strokeLinecap="round"
    />
    <Path
      d="M4 7L12 5L20 7"
      stroke={Colors.featureBlueText}
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M4 7L2 14H6L4 7Z"
      stroke={Colors.featureBlueText}
      strokeWidth={1.8}
      strokeLinejoin="round"
      fill="none"
    />
    <Path
      d="M20 7L18 14H22L20 7Z"
      stroke={Colors.featureBlueText}
      strokeWidth={1.8}
      strokeLinejoin="round"
      fill="none"
    />
    <Path
      d="M9 21H15"
      stroke={Colors.featureBlueText}
      strokeWidth={1.8}
      strokeLinecap="round"
    />
  </Svg>
);

const DocumentIcon = () => (
  <Svg width={28} height={28} viewBox="0 0 24 24" fill="none">
    <Path
      d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V8L14 2Z"
      stroke={Colors.featureGreenText}
      strokeWidth={1.8}
      strokeLinejoin="round"
      fill="none"
    />
    <Path
      d="M14 2V8H20"
      stroke={Colors.featureGreenText}
      strokeWidth={1.8}
      strokeLinejoin="round"
    />
    <Path
      d="M8 13H16M8 17H13"
      stroke={Colors.featureGreenText}
      strokeWidth={1.8}
      strokeLinecap="round"
    />
  </Svg>
);

const AgentIcon = () => (
  <Svg width={28} height={28} viewBox="0 0 24 24" fill="none">
    <Rect
      x={2}
      y={3}
      width={8}
      height={8}
      rx={2}
      stroke={Colors.featurePeachText}
      strokeWidth={1.8}
      fill="none"
    />
    <Rect
      x={14}
      y={3}
      width={8}
      height={8}
      rx={2}
      stroke={Colors.featurePeachText}
      strokeWidth={1.8}
      fill="none"
    />
    <Path
      d="M6 11V14C6 15.1 6.9 16 8 16H16C17.1 16 18 15.1 18 14V11"
      stroke={Colors.featurePeachText}
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
    <Path
      d="M12 16V21"
      stroke={Colors.featurePeachText}
      strokeWidth={1.8}
      strokeLinecap="round"
    />
    <Path
      d="M8 21H16"
      stroke={Colors.featurePeachText}
      strokeWidth={1.8}
      strokeLinecap="round"
    />
  </Svg>
);

const GoogleIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 48 48">
    <Path
      d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C12.955 4 4 12.955 4 24s8.955 20 20 20s20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"
      fill="#FFC107"
    />
    <Path
      d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C16.318 4 9.656 8.337 6.306 14.691z"
      fill="#FF3D00"
    />
    <Path
      d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0124 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"
      fill="#4CAF50"
    />
    <Path
      d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 01-4.087 5.571l.003-.002l6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"
      fill="#1976D2"
    />
  </Svg>
);

// ─── Feature Card Component ────────────────────────────────────────

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  bgColor: string;
  borderColor: string;
  textColor: string;
  delay: number;
}

const FeatureCard: React.FC<FeatureCardProps> = ({
  icon,
  title,
  bgColor,
  borderColor,
  textColor,
  delay,
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        delay,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        delay,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.featureCard,
        {
          backgroundColor: bgColor,
          borderColor: borderColor,
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <View style={[styles.featureIconBox, { backgroundColor: bgColor }]}>
        {icon}
      </View>
      <Text style={[styles.featureTitle, { color: textColor }]}>{title}</Text>
    </Animated.View>
  );
};

// ─── Badge Component ────────────────────────────────────────────────

interface BadgeProps {
  icon: React.ReactNode;
  label: string;
}

const Badge: React.FC<BadgeProps> = ({ icon, label }) => (
  <View style={styles.badge}>
    {icon}
    <Text style={styles.badgeText}>{label}</Text>
  </View>
);

// ─── Main Screen ────────────────────────────────────────────────────

export const WelcomeScreen = ({ navigation }: any) => {
  const { signInWithGoogle } = useAuth();

  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    clientId: '361401902601-phrs46oc97ds5ootflncd3iiocnvugo2.apps.googleusercontent.com',
  });

  const logoScale = useRef(new Animated.Value(0.3)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const titleSlide = useRef(new Animated.Value(20)).current;
  const badgesOpacity = useRef(new Animated.Value(0)).current;
  const buttonOpacity = useRef(new Animated.Value(0)).current;
  const buttonSlide = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    // Logo entrance
    Animated.parallel([
      Animated.spring(logoScale, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();

    // Title entrance
    Animated.parallel([
      Animated.timing(titleOpacity, {
        toValue: 1,
        duration: 500,
        delay: 300,
        useNativeDriver: true,
      }),
      Animated.timing(titleSlide, {
        toValue: 0,
        duration: 500,
        delay: 300,
        useNativeDriver: true,
      }),
    ]).start();

    // Badges entrance
    Animated.timing(badgesOpacity, {
      toValue: 1,
      duration: 500,
      delay: 500,
      useNativeDriver: true,
    }).start();

    // Button entrance
    Animated.parallel([
      Animated.timing(buttonOpacity, {
        toValue: 1,
        duration: 500,
        delay: 1200,
        useNativeDriver: true,
      }),
      Animated.timing(buttonSlide, {
        toValue: 0,
        duration: 500,
        delay: 1200,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  useEffect(() => {
    if (response?.type === 'success') {
      const { id_token } = response.params;
      if (id_token) {
        signInWithGoogle(id_token).then((res) => {
          if (!res.ok) {
            console.error('Google backend signin failed:', res.error);
          }
        });
      }
    }
  }, [response]);

  const handleGoogleSignIn = () => {
    promptAsync();
  };

  const handleEmailSignIn = () => {
    navigation.navigate('Login');
  };

  const handleSignUp = () => {
    navigation.navigate('Register');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* ── Logo Section ──────────────────────── */}
        <View style={styles.logoSection}>
          <Animated.View
            style={[
              styles.logoBox,
              {
                transform: [{ scale: logoScale }],
                opacity: logoOpacity,
              },
            ]}
          >
            <ShieldIcon />
          </Animated.View>

          <Animated.View
            style={{
              opacity: titleOpacity,
              transform: [{ translateY: titleSlide }],
              alignItems: 'center',
            }}
          >
            <Text style={styles.appTitle}>Wakeel-AI</Text>
            <Text style={styles.appTitleUrdu}>وکیل - AI</Text>
            <Text style={styles.tagline}>
              Your AI-powered family law navigator
            </Text>
          </Animated.View>
        </View>

        {/* ── Badges ────────────────────────────── */}
        <Animated.View style={[styles.badgeRow, { opacity: badgesOpacity }]}>
          <Badge icon={<SecureIcon />} label="Secure" />
          <Badge icon={<LanguageIcon />} label="اردو + English" />
          <Badge icon={<FreeIcon />} label="Free" />
        </Animated.View>

        {/* ── Feature Cards ─────────────────────── */}
        <View style={styles.featuresSection}>
          <FeatureCard
            icon={<ScaleIcon />}
            title="Know your rights instantly"
            bgColor={Colors.featureBlue}
            borderColor={Colors.featureBlueBorder}
            textColor={Colors.featureBlueText}
            delay={600}
          />
          <FeatureCard
            icon={<DocumentIcon />}
            title="AI-drafted petitions"
            bgColor={Colors.featureGreen}
            borderColor={Colors.featureGreenBorder}
            textColor={Colors.featureGreenText}
            delay={800}
          />
          <FeatureCard
            icon={<AgentIcon />}
            title="Dual AI agent system"
            bgColor={Colors.featurePeach}
            borderColor={Colors.featurePeachBorder}
            textColor={Colors.featurePeachText}
            delay={1000}
          />
        </View>

        {/* ── Bottom Section ────────────────────── */}
        <View style={styles.bottomSection}>
          <Animated.View
            style={{
              opacity: buttonOpacity,
              transform: [{ translateY: buttonSlide }],
              width: '100%',
            }}
          >
            <TouchableOpacity
              style={styles.googleButton}
              onPress={handleGoogleSignIn}
              activeOpacity={0.8}
            >
              <GoogleIcon />
              <Text style={styles.googleButtonText}>Continue with Google</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.emailButton}
              onPress={handleEmailSignIn}
              activeOpacity={0.8}
            >
              <Text style={styles.emailButtonText}>Sign in with Email</Text>
            </TouchableOpacity>
          </Animated.View>

          <Animated.View style={[styles.registerRow, { opacity: buttonOpacity }]}>
            <Text style={styles.registerText}>Don't have an account? </Text>
            <TouchableOpacity onPress={handleSignUp}>
              <Text style={styles.registerLink}>Sign Up</Text>
            </TouchableOpacity>
          </Animated.View>

          <Animated.View style={[styles.legalSection, { opacity: buttonOpacity }]}>
            <Text style={styles.legalText}>
              By continuing, you agree to our{' '}
              <Text style={styles.legalLink}>Terms of Service</Text> and{'\n'}
              <Text style={styles.legalLink}>Privacy Policy</Text>. We ensure your legal data remains
              {'\n'}strictly confidential.
            </Text>
          </Animated.View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// ─── Styles ─────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: Spacing.lg,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight ? StatusBar.currentHeight + 10 : 40 : 10,
    paddingBottom: Spacing.xl,
  },

  // Logo
  logoSection: {
    alignItems: 'center',
    marginTop: Spacing.xl,
    marginBottom: Spacing.lg,
  },
  logoBox: {
    width: 88,
    height: 88,
    borderRadius: 22,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
    // Subtle shadow
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 10,
  },
  appTitle: {
    fontSize: 34,
    fontWeight: '700',
    color: Colors.text,
    letterSpacing: -0.5,
  },
  appTitleUrdu: {
    fontSize: 22,
    fontWeight: '600',
    color: Colors.text,
    marginTop: 2,
    // Urdu text rendering
    writingDirection: 'rtl',
  },
  tagline: {
    fontSize: 16,
    color: Colors.textMuted,
    marginTop: Spacing.sm,
    textAlign: 'center',
  },

  // Badges
  badgeRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.badgeBg,
    borderWidth: 1,
    borderColor: Colors.badgeBorder,
  },
  badgeText: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.badgeText,
  },

  // Feature Cards
  featuresSection: {
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  featureCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    gap: Spacing.md,
  },
  featureIconBox: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },

  // Bottom
  bottomSection: {
    marginTop: 'auto',
    alignItems: 'center',
    paddingTop: Spacing.md,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    width: '100%',
    height: 56,
    borderRadius: BorderRadius.xl,
    backgroundColor: Colors.buttonBg,
    // Shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  googleButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.buttonText,
  },

  // Email button
  emailButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: 52,
    borderRadius: BorderRadius.xl,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    backgroundColor: 'transparent',
    marginTop: Spacing.md,
  },
  emailButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary,
  },

  // Register
  registerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: Spacing.lg,
  },
  registerText: {
    fontSize: 15,
    color: Colors.textMuted,
  },
  registerLink: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.primary,
  },

  // Legal
  legalSection: {
    marginTop: Spacing.lg,
    paddingHorizontal: Spacing.md,
  },
  legalText: {
    fontSize: 12.5,
    lineHeight: 18,
    color: Colors.textMuted,
    textAlign: 'center',
  },
  legalLink: {
    color: Colors.text,
    textDecorationLine: 'underline',
    fontWeight: '500',
  },
});
