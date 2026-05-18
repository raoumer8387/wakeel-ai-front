import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ArrowLeft,
  Shield,
  Database,
  Lock,
  Share2,
  UserCheck,
  Baby,
  RefreshCw,
  Mail,
  Info,
} from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { Spacing, BorderRadius } from '../constants/Theme';

const ACCENT = '#0F7B46';
const BG = '#FAF9F6';
const CARD_BG = '#FFFFFF';
const TEXT_PRIMARY = '#1A1A2E';
const TEXT_SECONDARY = '#5A5A7A';
const TEXT_MUTED = '#8E8EA0';

interface Section {
  number: string;
  title: string;
  icon: React.ReactNode;
  content: string | { label: string; text: string }[];
}

const SECTIONS: Section[] = [
  {
    number: '1',
    title: 'Information We Collect',
    icon: <Database color="#FFFFFF" size={16} />,
    content: [
      {
        label: 'Personal Information',
        text: 'Name, contact details, and any information you provide while using the app.',
      },
      {
        label: 'Legal Case Details',
        text: 'Family court-related information you choose to share for guidance.',
      },
      {
        label: 'Technical Data',
        text: 'Device type, operating system, and usage statistics to improve app performance.',
      },
    ],
  },
  {
    number: '2',
    title: 'How We Use Your Information',
    icon: <Info color="#FFFFFF" size={16} />,
    content: [
      { label: '', text: 'To provide you with legal guidance on family court matters.' },
      { label: '', text: 'To improve the functionality and user experience of Wakeel-AI.' },
      {
        label: '',
        text: 'To communicate important updates, changes, or notifications related to the app.',
      },
      { label: '', text: 'To ensure compliance with Pakistani laws and regulations.' },
    ],
  },
  {
    number: '3',
    title: 'Data Protection',
    icon: <Lock color="#FFFFFF" size={16} />,
    content: [
      { label: '', text: 'Your information is stored securely and protected against unauthorized access.' },
      { label: '', text: 'We use encryption and other security measures to safeguard sensitive data.' },
      { label: '', text: 'Only authorized personnel have access to your information.' },
    ],
  },
  {
    number: '4',
    title: 'Sharing of Information',
    icon: <Share2 color="#FFFFFF" size={16} />,
    content: [
      { label: '', text: 'We do not sell or share your personal data with third parties for marketing purposes.' },
      {
        label: '',
        text: 'Information may be shared only when required by law or to protect your rights and safety.',
      },
    ],
  },
  {
    number: '5',
    title: 'User Rights',
    icon: <UserCheck color="#FFFFFF" size={16} />,
    content: [
      { label: '', text: 'You have the right to access, update, or delete your personal information.' },
      {
        label: '',
        text: 'You may withdraw consent for data collection at any time by discontinuing use of the app.',
      },
    ],
  },
  {
    number: '6',
    title: "Children's Privacy",
    icon: <Baby color="#FFFFFF" size={16} />,
    content: [
      {
        label: '',
        text: 'Wakeel-AI is intended for users aged 18 and above. We do not knowingly collect information from minors.',
      },
    ],
  },
  {
    number: '7',
    title: 'Updates to Privacy Policy',
    icon: <RefreshCw color="#FFFFFF" size={16} />,
    content: [
      {
        label: '',
        text: 'We may update this Privacy Policy from time to time. Any changes will be communicated through the app, and continued use will signify your acceptance of the updated policy.',
      },
    ],
  },
  {
    number: '8',
    title: 'Contact Us',
    icon: <Mail color="#FFFFFF" size={16} />,
    content: [
      {
        label: '',
        text: 'If you have questions or concerns about this Privacy Policy, please contact our support team at: support@wakeel-ai.com',
      },
    ],
  },
];

export const PrivacyPolicyScreen = () => {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ArrowLeft color={TEXT_PRIMARY} size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Privacy Policy</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero */}
        <View style={styles.heroBanner}>
          <View style={styles.heroIconWrapper}>
            <Shield color="#FFFFFF" size={32} />
          </View>
          <Text style={styles.heroTitle}>Privacy Policy</Text>
          <Text style={styles.heroSubtitle}>
            At Wakeel-AI, your privacy is our priority.
          </Text>
        </View>

        {/* Intro */}
        <View style={styles.introCard}>
          <Text style={styles.introText}>
            We are committed to protecting your personal information and ensuring that your trust
            in us is respected. This Privacy Policy explains how we collect, use, and safeguard
            your data when you use our mobile application.
          </Text>
        </View>

        {/* Sections */}
        {SECTIONS.map((section) => (
          <View key={section.number} style={styles.sectionBlock}>
            {/* Section header */}
            <View style={styles.sectionHeaderRow}>
              <View style={styles.sectionNumberBadge}>
                <Text style={styles.sectionNumber}>{section.number}</Text>
              </View>
              <View style={styles.sectionIconBox}>{section.icon}</View>
              <Text style={styles.sectionTitle}>{section.title}</Text>
            </View>

            {/* Section content */}
            <View style={styles.sectionCard}>
              {(section.content as { label: string; text: string }[]).map((item, idx) => (
                <View key={idx} style={[styles.bulletRow, idx > 0 && styles.bulletRowBorder]}>
                  <View style={styles.bulletDot} />
                  <View style={styles.bulletTextCol}>
                    {item.label ? (
                      <Text style={styles.bulletLabel}>{item.label}:</Text>
                    ) : null}
                    <Text style={styles.bulletText}>{item.text}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        ))}

        {/* Contact highlight */}
        <View style={styles.contactCard}>
          <Mail color={ACCENT} size={20} />
          <Text style={styles.contactEmail}>support@wakeel-ai.com</Text>
        </View>

        <Text style={styles.footerTag}>
          Last updated: May 2026 · © 2026 Wakeel-AI
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#EBEBEB',
    backgroundColor: BG,
  },
  backBtn: {
    padding: Spacing.xs,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: TEXT_PRIMARY,
  },
  headerSpacer: {
    width: 32,
  },
  scrollContent: {
    paddingBottom: 40,
  },

  // Hero
  heroBanner: {
    backgroundColor: '#1A1A2E',
    alignItems: 'center',
    paddingVertical: 36,
    paddingHorizontal: Spacing.xl,
  },
  heroIconWrapper: {
    backgroundColor: ACCENT,
    borderRadius: 50,
    padding: 16,
    marginBottom: 12,
  },
  heroTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.75)',
    textAlign: 'center',
  },

  // Intro
  introCard: {
    backgroundColor: '#F0FAF5',
    borderLeftWidth: 4,
    borderLeftColor: ACCENT,
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.xl,
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
  },
  introText: {
    fontSize: 14,
    color: '#1A5C35',
    lineHeight: 22,
  },

  // Section
  sectionBlock: {
    marginTop: Spacing.xl,
    paddingHorizontal: Spacing.lg,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
    gap: 8,
  },
  sectionNumberBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#E8E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionNumber: {
    fontSize: 12,
    fontWeight: '700',
    color: TEXT_PRIMARY,
  },
  sectionIconBox: {
    backgroundColor: '#1A1A2E',
    borderRadius: 6,
    padding: 5,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: TEXT_PRIMARY,
    flex: 1,
  },
  sectionCard: {
    backgroundColor: CARD_BG,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: '#E8E8E8',
    overflow: 'hidden',
  },

  // Bullet rows
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: Spacing.md,
    gap: 10,
  },
  bulletRowBorder: {
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  bulletDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: ACCENT,
    marginTop: 6,
  },
  bulletTextCol: {
    flex: 1,
  },
  bulletLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: TEXT_PRIMARY,
    marginBottom: 2,
  },
  bulletText: {
    fontSize: 14,
    color: TEXT_SECONDARY,
    lineHeight: 21,
  },

  // Contact
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#E8F5EE',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.xl,
    borderWidth: 1,
    borderColor: '#C2E8D4',
  },
  contactEmail: {
    fontSize: 15,
    fontWeight: '600',
    color: ACCENT,
  },

  footerTag: {
    textAlign: 'center',
    color: TEXT_MUTED,
    fontSize: 12,
    marginTop: 28,
    marginBottom: 8,
  },
});
