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
  FileText,
  Target,
  UserCheck,
  ShieldOff,
  Lock,
  Cpu,
  RefreshCw,
  Scale,
  Mail,
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
  content: { label: string; text: string }[];
}

const SECTIONS: Section[] = [
  {
    number: '1',
    title: 'Purpose of the App',
    icon: <Target color="#FFFFFF" size={16} />,
    content: [
      {
        label: '',
        text: 'Wakeel-AI provides legal assistance and guidance on family court matters in Pakistan. The app is designed to offer information and support, but it does not replace professional legal advice from a licensed lawyer.',
      },
    ],
  },
  {
    number: '2',
    title: 'Eligibility',
    icon: <UserCheck color="#FFFFFF" size={16} />,
    content: [
      { label: '', text: 'You must be at least 18 years old to use Wakeel-AI.' },
      {
        label: '',
        text: 'By using the app, you confirm that you are a Pakistani citizen or resident seeking guidance on family law matters under Pakistani jurisdiction.',
      },
    ],
  },
  {
    number: '3',
    title: 'User Responsibilities',
    icon: <UserCheck color="#FFFFFF" size={16} />,
    content: [
      { label: '', text: 'You agree to use Wakeel-AI for lawful purposes only.' },
      {
        label: '',
        text: 'You are responsible for the accuracy of the information you provide within the app.',
      },
      {
        label: '',
        text: 'You must not misuse the app for fraudulent, harmful, or abusive activities.',
      },
    ],
  },
  {
    number: '4',
    title: 'Limitations of Liability',
    icon: <ShieldOff color="#FFFFFF" size={16} />,
    content: [
      {
        label: '',
        text: 'Wakeel-AI provides general legal guidance and does not guarantee outcomes in court proceedings.',
      },
      {
        label: '',
        text: 'We are not liable for any direct, indirect, or consequential damages arising from your reliance on the app\'s content.',
      },
      {
        label: '',
        text: 'For complex or sensitive cases, we strongly recommend consulting a licensed lawyer.',
      },
    ],
  },
  {
    number: '5',
    title: 'Privacy & Data Protection',
    icon: <Lock color="#FFFFFF" size={16} />,
    content: [
      {
        label: '',
        text: 'Wakeel-AI respects your privacy and handles your data responsibly.',
      },
      {
        label: '',
        text: 'Personal information provided in the app will be used only to improve your experience and will not be shared with unauthorized third parties.',
      },
      {
        label: '',
        text: 'For details, please review our Privacy Policy.',
      },
    ],
  },
  {
    number: '6',
    title: 'Intellectual Property',
    icon: <Cpu color="#FFFFFF" size={16} />,
    content: [
      {
        label: '',
        text: 'All content, design, and technology within Wakeel-AI are the property of the app creators.',
      },
      {
        label: '',
        text: 'You may not copy, distribute, or modify any part of the app without prior written consent.',
      },
    ],
  },
  {
    number: '7',
    title: 'Updates & Changes',
    icon: <RefreshCw color="#FFFFFF" size={16} />,
    content: [
      {
        label: '',
        text: 'Wakeel-AI reserves the right to update or modify these Terms & Conditions at any time.',
      },
      {
        label: '',
        text: 'Continued use of the app after changes means you accept the updated terms.',
      },
    ],
  },
  {
    number: '8',
    title: 'Governing Law',
    icon: <Scale color="#FFFFFF" size={16} />,
    content: [
      {
        label: '',
        text: 'These Terms & Conditions are governed by the laws of Pakistan. Any disputes will be subject to the jurisdiction of Pakistani courts.',
      },
    ],
  },
];

export const TermsOfServiceScreen = () => {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ArrowLeft color={TEXT_PRIMARY} size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Terms of Service</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero */}
        <View style={styles.heroBanner}>
          <View style={styles.heroIconWrapper}>
            <FileText color="#FFFFFF" size={32} />
          </View>
          <Text style={styles.heroTitle}>Terms of Service</Text>
          <Text style={styles.heroSubtitle}>
            Please read these terms carefully before using Wakeel-AI.
          </Text>
        </View>

        {/* Intro */}
        <View style={styles.introCard}>
          <Text style={styles.introText}>
            Welcome to Wakeel-AI. By downloading, accessing, or using our mobile application, you
            agree to comply with and be bound by the following Terms & Conditions.
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
              {section.content.map((item, idx) => (
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
