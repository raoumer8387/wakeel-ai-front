import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Image,
  TouchableOpacity,
  StatusBar
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  ArrowLeft, 
  Folder, 
  FileText, 
  Scale, 
  CheckCircle,
  Plus,
  ChevronRight
} from 'lucide-react-native';
import { Colors, Spacing, BorderRadius } from '../constants/Theme';
import { useLanguage } from '../store/LanguageContext';

export const HomeScreen = () => {
  const { t } = useLanguage();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity>
            <ArrowLeft color={Colors.primary} size={24} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Wakeel-AI</Text>
        </View>
        <Image 
          source={{ uri: 'https://randomuser.me/api/portraits/men/32.jpg' }} 
          style={styles.avatar} 
        />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* Greeting Section */}
        <View style={styles.greetingSection}>
          <Text style={styles.greetingTitle}>{t('greeting')}, Ahmed</Text>
          <Text style={styles.greetingSubtitle}>{t('case_overview')}</Text>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <View style={styles.statHeader}>
              <Folder color={Colors.primary} size={18} />
              <Text style={styles.statLabel}>{t('total_cases')}</Text>
            </View>
            <Text style={[styles.statValue, { color: Colors.primary }]}>12</Text>
          </View>
          
          <View style={styles.statCard}>
            <View style={styles.statHeader}>
              <FileText color="#0F7B46" size={18} />
              <Text style={styles.statLabel}>{t('docs_generated').replace(' ', '\n')}</Text>
            </View>
            <Text style={[styles.statValue, { color: '#0F7B46' }]}>48</Text>
          </View>

          <View style={styles.statCard}>
            <View style={styles.statHeader}>
              <Scale color="#C05621" size={18} />
              <Text style={styles.statLabel}>{t('rights_analysed').replace(' ', '\n')}</Text>
            </View>
            <Text style={[styles.statValue, { color: '#C05621' }]}>07</Text>
          </View>

          <View style={styles.statCard}>
            <View style={styles.statHeader}>
              <CheckCircle color="#0F7B46" size={18} />
              <Text style={styles.statLabel}>{t('cases_filed')}</Text>
            </View>
            <Text style={[styles.statValue, { color: '#0F7B46' }]}>03</Text>
          </View>
        </View>

        {/* Agent Activity */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{t('agent_activity')}</Text>
          <View style={styles.liveBadge}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>{t('live')}</Text>
          </View>
        </View>

        <View style={styles.activityCard}>
          <View style={styles.activityItem}>
            <View>
              <Text style={styles.activityTitle}>Khula Draft Review</Text>
              <Text style={styles.activitySubtitle}>Scanning requirements</Text>
            </View>
            <View style={styles.statusProcessing}>
              <Text style={styles.statusProcessingText}>{t('processing')}</Text>
            </View>
          </View>
          <View style={styles.divider} />
          <View style={styles.activityItem}>
            <View>
              <Text style={styles.activityTitle}>Succession Certificate</Text>
              <Text style={styles.activitySubtitle}>Finalizing document</Text>
            </View>
            <View style={styles.statusCompleted}>
              <Text style={styles.statusCompletedText}>{t('completed')}</Text>
            </View>
          </View>
          <View style={styles.divider} />
          <View style={styles.activityItem}>
            <View>
              <Text style={styles.activityTitle}>Child Custody Rights</Text>
              <Text style={styles.activitySubtitle}>Analyzing laws</Text>
            </View>
            <View style={styles.statusProcessing}>
              <Text style={styles.statusProcessingText}>{t('processing')}</Text>
            </View>
          </View>
        </View>

        {/* Recent Cases */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{t('recent_cases')}</Text>
          <TouchableOpacity style={styles.viewAllBtn}>
            <Text style={styles.viewAllText}>{t('view_all')}</Text>
            <ChevronRight color={Colors.primary} size={16} />
          </TouchableOpacity>
        </View>

        {/* Case Card 1 */}
        <View style={styles.caseCard}>
          <View style={styles.caseHeader}>
            <View style={styles.caseCategoryTag}>
              <Text style={styles.caseCategoryText}>Family Law</Text>
            </View>
            <Text style={styles.caseDate}>Oct 24, 2023</Text>
          </View>
          <View style={styles.caseBody}>
            <Text style={styles.caseTitle}>Khula Petition — Divorce</Text>
            <View style={[styles.statusProcessing, { alignSelf: 'flex-start', marginBottom: 8 }]}>
              <Text style={styles.statusProcessingText}>{t('under_review')}</Text>
            </View>
            <Text style={styles.caseDescription}>
              Detailed drafting of the Khula petition following the Family Courts Act 1964...
            </Text>
          </View>
        </View>

        {/* Case Card 2 */}
        <View style={[styles.caseCard, { backgroundColor: '#B8F2D1' }]}>
          <View style={styles.caseHeader}>
            <View style={[styles.caseCategoryTag, { backgroundColor: '#1C6641' }]}>
              <Text style={styles.caseCategoryText}>Property Law</Text>
            </View>
            <Text style={styles.caseDate}>Oct 21, 2023</Text>
          </View>
          <View style={[styles.caseBody, { backgroundColor: '#FFFFFF', borderBottomLeftRadius: BorderRadius.lg, borderBottomRightRadius: BorderRadius.lg }]}>
            <Text style={styles.caseTitle}>Inheritance Claim</Text>
            <View style={[styles.statusCompleted, { alignSelf: 'flex-start', marginBottom: 8 }]}>
              <Text style={styles.statusCompletedText}>{t('approved')}</Text>
            </View>
            <Text style={styles.caseDescription}>
              Calculation of shares according to Islamic Inheritance Law for...
            </Text>
          </View>
        </View>

      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity style={styles.fab}>
        <Plus color={Colors.surface} size={20} />
        <Text style={styles.fabText}>{t('new_consultation')}</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF9F6', // Lighter off-white matching screenshot
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: 100, // Space for FAB
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.sm,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.primary,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.border,
  },
  greetingSection: {
    marginTop: Spacing.md,
    marginBottom: Spacing.lg,
  },
  greetingTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: Colors.primary,
    marginBottom: 4,
  },
  greetingSubtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: Spacing.xl,
  },
  statCard: {
    width: '48%',
    backgroundColor: '#F3F2F8',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: '#E8E8E8',
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  statLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
    flex: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.primary,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#0F7B46',
  },
  liveText: {
    fontSize: 14,
    color: '#0F7B46',
    fontWeight: '500',
  },
  activityCard: {
    backgroundColor: '#F9F9FC',
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: '#E8E8E8',
    marginBottom: Spacing.xl,
    padding: Spacing.md,
  },
  activityItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  activityTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 2,
  },
  activitySubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  divider: {
    height: 1,
    backgroundColor: '#E8E8E8',
    marginVertical: Spacing.xs,
  },
  statusProcessing: {
    backgroundColor: '#B8F2D1',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  statusProcessingText: {
    color: '#0F7B46',
    fontSize: 12,
    fontWeight: '600',
  },
  statusCompleted: {
    backgroundColor: '#277A55',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  statusCompletedText: {
    color: Colors.surface,
    fontSize: 12,
    fontWeight: '600',
  },
  viewAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewAllText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '500',
    marginRight: 2,
  },
  caseCard: {
    backgroundColor: '#E6E6FA', // Light purple for first card
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
  },
  caseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.md,
  },
  caseCategoryTag: {
    backgroundColor: '#2D2B55',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
  },
  caseCategoryText: {
    color: Colors.surface,
    fontSize: 12,
    fontWeight: '600',
  },
  caseDate: {
    fontSize: 13,
    color: '#2D2B55',
    fontWeight: '500',
  },
  caseBody: {
    backgroundColor: '#F4F4FD',
    padding: Spacing.md,
    borderBottomLeftRadius: BorderRadius.lg,
    borderBottomRightRadius: BorderRadius.lg,
  },
  caseTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 8,
  },
  caseDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  fab: {
    position: 'absolute',
    bottom: Spacing.lg,
    right: Spacing.lg,
    backgroundColor: '#0F0D35', // Very dark blue
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: 14,
    borderRadius: BorderRadius.full,
    gap: Spacing.sm,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  fabText: {
    color: Colors.surface,
    fontWeight: '600',
    fontSize: 15,
  },
});
