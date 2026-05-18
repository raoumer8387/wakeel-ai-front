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
  Info,
  Target,
  Zap,
  BookOpen,
  Shield,
  Eye,
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
    title: 'Our Mission',
    icon: <Target color="#FFFFFF" size={16} />,
    content: [
      {
        label: '',
        text: 'To empower people with reliable, accessible, and technology-driven legal guidance, ensuring that no one feels lost or unsupported when facing family court challenges.',
      },
    ],
  },
  {
    number: '2',
    title: 'Why Wakeel-AI?',
    icon: <Zap color="#FFFFFF" size={16} />,
    content: [
      {
        label: 'Convenience',
        text: 'Legal help at your fingertips, anytime, anywhere.',
      },
      {
        label: 'Clarity',
        text: 'Easy-to-understand guidance tailored to Pakistani family laws.',
      },
      {
        label: 'Confidence',
        text: 'Support that helps you make informed decisions about your rights and responsibilities.',
      },
    ],
  },
  {
    number: '3',
    title: 'Our Vision',
    icon: <Eye color="#FFFFFF" size={16} />,
    content: [
      {
        label: '',
        text: 'We envision a Pakistan where technology bridges the gap between citizens and the legal system, making justice more approachable for everyone.',
      },
      {
        label: '',
        text: 'Wakeel-AI is more than an app — it\'s a companion for those seeking fairness, dignity, and peace of mind in family matters.',
      },
    ],
  },
];

export const AboutScreen = () => {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ArrowLeft color={TEXT_PRIMARY} size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>About Wakeel-AI</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero */}
        <View style={styles.heroBanner}>
          <View style={styles.heroIconWrapper}>
            <Info color="#FFFFFF" size={32} />
          </View>
          <Text style={styles.heroTitle}>Wakeel-AI</Text>
          <Text style={styles.heroSubtitle}>
            Empowering Every Pakistani with Access to Justice
          </Text>
        </View>

        {/* Intro */}
        <View style={styles.introCard}>
          <Text style={styles.introText}>
            At Wakeel-AI, we believe that access to justice should be simple, affordable, and
            within reach for every Pakistani. Our mobile app is designed to provide legal assistance
            on family court matters, helping individuals navigate complex issues such as marriage,
            divorce, child custody, inheritance, and other family-related disputes.
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
                      <Text style={styles.bulletLabel}>{item.label}</Text>
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
          © 2026 Wakeel-AI. All rights reserved.
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
