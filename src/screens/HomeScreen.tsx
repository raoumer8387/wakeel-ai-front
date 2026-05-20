import React, { useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Image,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  Alert,
  RefreshControl,
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
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
import { useAuth } from '../store/AuthContext';
import { ENV } from '../config/env';
import { 
  createNewChat, 
  getCaseStats, 
  getCaseActivity, 
  getCases,
  Case,
  CaseStats,
  AgentActivity 
} from '../services/caseService';

export const HomeScreen = () => {
  const { t, language } = useLanguage();
  const isUrdu = language === 'ur';
  const navigation = useNavigation<any>();
  const { user } = useAuth();
  
  const getAvatarUri = (url: string | null | undefined) => {
    if (!url) return null;
    if (url.startsWith('/static')) {
      const cleanBaseUrl = ENV.API_BASE_URL.endsWith('/') ? ENV.API_BASE_URL.slice(0, -1) : ENV.API_BASE_URL;
      return `${cleanBaseUrl}${url}`;
    }
    return url;
  };
  
  const renderHomeAvatar = () => {
    const uri = getAvatarUri(user?.avatar_url);
    if (uri) {
      return (
        <Image 
          source={{ uri }} 
          style={styles.avatar} 
        />
      );
    }
    
    const initials = user?.name
      ? user.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()
      : 'U';
      
    return (
      <View style={[styles.avatar, styles.homeInitialsAvatar]}>
        <Text style={styles.homeInitialsText}>{initials}</Text>
      </View>
    );
  };
  
  const [creatingChat, setCreatingChat] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  const [stats, setStats] = useState<CaseStats>({
    total_cases: 0,
    documents_generated: 0,
    rights_analysed: 0,
    cases_filed: 0
  });
  
  const [activities, setActivities] = useState<AgentActivity[]>([]);
  const [recentCases, setRecentCases] = useState<Case[]>([]);

  const fetchDashboardData = async (showLoader = true) => {
    if (showLoader) setLoading(true);
    try {
      const [statsRes, activityRes, casesRes] = await Promise.all([
        getCaseStats(),
        getCaseActivity(),
        getCases(2) // Get top 2 recent cases
      ]);

      if (statsRes.ok && statsRes.data) {
        setStats(statsRes.data);
      }
      if (activityRes.ok && activityRes.data) {
        setActivities(activityRes.data);
      }
      if (casesRes.ok && casesRes.data) {
        setRecentCases(casesRes.data.cases || []);
      }
    } catch (err) {
      console.error('[HomeScreen] Error loading dashboard data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchDashboardData(true);
    }, [])
  );

  const handleRefresh = () => {
    setRefreshing(true);
    fetchDashboardData(false);
  };

  const handleNewConsultation = async () => {
    if (creatingChat) return;
    setCreatingChat(true);
    try {
      const res = await createNewChat();
      if (res.ok && res.data?.case_id) {
        navigation.navigate('Chat', { caseId: res.data.case_id });
      } else {
        Alert.alert('Error', res.error || 'Failed to create new consultation.');
      }
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Something went wrong.');
    } finally {
      setCreatingChat(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />
      
      {/* Header */}
      <View style={[styles.header, isUrdu && styles.rtlRow]}>
        <View style={[styles.headerLeft, isUrdu && styles.rtlRow]}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <ArrowLeft color={Colors.primary} size={24} style={isUrdu ? { transform: [{ scaleX: -1 }] } : null} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Wakeel-AI</Text>
        </View>
        {renderHomeAvatar()}
      </View>

      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : (
        <ScrollView 
          showsVerticalScrollIndicator={false} 
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={[Colors.primary]} />
          }
        >
          
          {/* Greeting Section */}
          <View style={[styles.greetingSection, isUrdu && styles.rtlTextContainer]}>
            <Text style={[styles.greetingTitle, isUrdu && styles.rtlText]}>
              {t('greeting')}, {user?.name || 'User'}
            </Text>
            <Text style={[styles.greetingSubtitle, isUrdu && styles.rtlText]}>
              {t('case_overview')}
            </Text>
          </View>

          {/* Stats Grid */}
          <View style={[styles.statsGrid, isUrdu && styles.rtlRowWrap]}>
            <View style={styles.statCard}>
              <View style={[styles.statHeader, isUrdu && styles.rtlRow]}>
                <Folder color={Colors.primary} size={18} />
                <Text style={[styles.statLabel, isUrdu && styles.rtlText]}>{t('total_cases')}</Text>
              </View>
              <Text style={[styles.statValue, isUrdu && styles.rtlText, { color: Colors.primary }]}>
                {stats.total_cases.toString().padStart(2, '0')}
              </Text>
            </View>
            
            <View style={styles.statCard}>
              <View style={[styles.statHeader, isUrdu && styles.rtlRow]}>
                <FileText color="#0F7B46" size={18} />
                <Text style={[styles.statLabel, isUrdu && styles.rtlText]}>{t('docs_generated').replace(' ', '\n')}</Text>
              </View>
              <Text style={[styles.statValue, isUrdu && styles.rtlText, { color: '#0F7B46' }]}>
                {stats.documents_generated.toString().padStart(2, '0')}
              </Text>
            </View>

            <View style={styles.statCard}>
              <View style={[styles.statHeader, isUrdu && styles.rtlRow]}>
                <Scale color="#C05621" size={18} />
                <Text style={[styles.statLabel, isUrdu && styles.rtlText]}>{t('rights_analysed').replace(' ', '\n')}</Text>
              </View>
              <Text style={[styles.statValue, isUrdu && styles.rtlText, { color: '#C05621' }]}>
                {stats.rights_analysed.toString().padStart(2, '0')}
              </Text>
            </View>

            <View style={styles.statCard}>
              <View style={[styles.statHeader, isUrdu && styles.rtlRow]}>
                <CheckCircle color="#0F7B46" size={18} />
                <Text style={[styles.statLabel, isUrdu && styles.rtlText]}>{t('cases_filed')}</Text>
              </View>
              <Text style={[styles.statValue, isUrdu && styles.rtlText, { color: '#0F7B46' }]}>
                {stats.cases_filed.toString().padStart(2, '0')}
              </Text>
            </View>
          </View>

          {/* Agent Activity */}
          <View style={[styles.sectionHeader, isUrdu && styles.rtlRow]}>
            <Text style={[styles.sectionTitle, isUrdu && styles.rtlText]}>{t('agent_activity')}</Text>
            <View style={[styles.liveBadge, isUrdu && styles.rtlRow]}>
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>{t('live')}</Text>
            </View>
          </View>

          <View style={styles.activityCard}>
            {activities.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={[styles.emptyText, isUrdu && styles.rtlText]}>
                  {isUrdu ? 'کوئی فعال ایجنٹ کام نہیں ہے' : 'No active or completed agent tasks.'}
                </Text>
              </View>
            ) : (
              activities.map((act, index) => (
                <View key={act.id}>
                  <View style={[styles.activityItem, isUrdu && styles.rtlRow]}>
                    <View style={isUrdu && styles.rtlTextContainer}>
                      <Text style={[styles.activityTitle, isUrdu && styles.rtlText]}>{act.title}</Text>
                      <Text style={[styles.activitySubtitle, isUrdu && styles.rtlText]}>{act.subtitle}</Text>
                    </View>
                    <View style={act.status === 'completed' ? styles.statusCompleted : styles.statusProcessing}>
                      <Text style={act.status === 'completed' ? styles.statusCompletedText : styles.statusProcessingText}>
                        {act.status === 'completed' ? t('completed') : t('processing')}
                      </Text>
                    </View>
                  </View>
                  {index < activities.length - 1 && <View style={styles.divider} />}
                </View>
              ))
            )}
          </View>

          {/* Recent Cases */}
          <View style={[styles.sectionHeader, isUrdu && styles.rtlRow]}>
            <Text style={[styles.sectionTitle, isUrdu && styles.rtlText]}>{t('recent_cases')}</Text>
            <TouchableOpacity style={[styles.viewAllBtn, isUrdu && styles.rtlRow]} onPress={() => navigation.navigate('CasesTab')}>
              <Text style={styles.viewAllText}>{t('view_all')}</Text>
              <ChevronRight color={Colors.primary} size={16} style={isUrdu ? { transform: [{ scaleX: -1 }] } : null} />
            </TouchableOpacity>
          </View>

          {recentCases.length === 0 ? (
            <View style={styles.emptyCasesCard}>
              <Text style={[styles.emptyCasesText, isUrdu && styles.rtlText]}>
                {isUrdu ? 'کوئی حالیہ مقدمہ نہیں ہے۔ اپنا پہلا مشورہ شروع کرنے کے لئے نیچے بٹن پر کلک کریں!' : 'No recent cases. Click the button below to start your first consultation!'}
              </Text>
            </View>
          ) : (
            recentCases.map((item) => {
              const isFiled = item.status === 'filed';
              const formattedDate = item.created_at
                ? new Date(item.created_at).toLocaleDateString([], {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })
                : t('cases_pending');

              return (
                <TouchableOpacity 
                  key={item.id} 
                  style={[styles.caseCard, isFiled && { backgroundColor: '#B8F2D1' }]}
                  onPress={() => navigation.navigate('Chat', { caseId: item.id })}
                  activeOpacity={0.9}
                >
                  <View style={[styles.caseHeader, isUrdu && styles.rtlRow]}>
                    <View style={[styles.caseCategoryTag, isFiled && { backgroundColor: '#1C6641' }]}>
                      <Text style={styles.caseCategoryText}>{(item.issue_type || 'General').toUpperCase()}</Text>
                    </View>
                    <Text style={[styles.caseDate, isFiled && { color: '#1C6641' }]}>{formattedDate}</Text>
                  </View>
                  <View style={[styles.caseBody, isUrdu && styles.rtlTextContainer, isFiled && { backgroundColor: '#FFFFFF', borderBottomLeftRadius: BorderRadius.lg, borderBottomRightRadius: BorderRadius.lg }]}>
                    <Text style={[styles.caseTitle, isUrdu && styles.rtlText]}>{item.title || t('cases_untitled')}</Text>
                    <View style={[isFiled ? styles.statusCompleted : styles.statusProcessing, { alignSelf: isUrdu ? 'flex-end' : 'flex-start', marginBottom: 8 }]}>
                      <Text style={isFiled ? styles.statusCompletedText : styles.statusProcessingText}>
                        {(item.status || 'draft').toUpperCase()}
                      </Text>
                    </View>
                    <Text style={[styles.caseDescription, isUrdu && styles.rtlText]} numberOfLines={2}>
                      {item.legal_brief 
                        ? (typeof item.legal_brief === 'string' ? item.legal_brief : item.legal_brief.brief || t('cases_no_grounds'))
                        : (isUrdu ? 'اس مقدمے کے لیے ابھی تک کوئی تجزیہ نہیں کیا گیا ہے۔' : 'No analysis has been generated for this case yet.')}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })
          )}

        </ScrollView>
      )}

      {/* Floating Action Button */}
      <TouchableOpacity style={[styles.fab, creatingChat && { opacity: 0.6 }]} onPress={handleNewConsultation} disabled={creatingChat} activeOpacity={0.8}>
        {creatingChat ? (
          <ActivityIndicator size={20} color={Colors.surface} />
        ) : (
          <Plus color={Colors.surface} size={20} />
        )}
        <Text style={styles.fabText}>{creatingChat ? 'Creating...' : t('new_consultation')}</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF9F6',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: 120,
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
    minHeight: 60,
    justifyContent: 'center',
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
    backgroundColor: '#E6E6FA',
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
  emptyContainer: {
    paddingVertical: Spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    color: Colors.textSecondary,
    fontSize: 14,
  },
  emptyCasesCard: {
    backgroundColor: '#F3F2F8',
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: '#E8E8E8',
    padding: Spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  emptyCasesText: {
    color: Colors.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  fab: {
    position: 'absolute',
    bottom: Spacing.lg,
    right: Spacing.lg,
    backgroundColor: '#0F0D35',
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
  // RTL Helpers
  rtlRow: {
    flexDirection: 'row-reverse',
  },
  rtlRowWrap: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
  },
  rtlText: {
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  rtlTextContainer: {
    alignItems: 'flex-end',
  },
  homeInitialsAvatar: {
    backgroundColor: '#0F7B46',
    justifyContent: 'center',
    alignItems: 'center',
  },
  homeInitialsText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
