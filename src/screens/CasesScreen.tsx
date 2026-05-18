import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Platform,
  Linking,
  Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import {
  Briefcase,
  Download,
  MessageSquare,
  FileText,
  Clock,
  ArrowUpRight,
} from 'lucide-react-native';
import { Colors, Spacing, BorderRadius, Typography } from '../constants/Theme';
import { useLanguage } from '../store/LanguageContext';
import { getCases, getCaseDocuments, getDocumentDownloadUrl, Case } from '../services/caseService';

export const CasesScreen = ({ navigation }: any) => {
  const { t, language } = useLanguage();
  const isUrdu = language === 'ur';

  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchUserCases = async (showLoader = true) => {
    if (showLoader) setLoading(true);
    try {
      const response = await getCases();
      if (response.ok && response.data) {
        setCases(response.data.cases || []);
      }
    } catch (err) {
      console.error('[CasesScreen] Error fetching cases:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchUserCases(true);
    }, [])
  );

  const handleRefresh = () => {
    setRefreshing(true);
    fetchUserCases(false);
  };

  const handleDownload = async (caseId: string) => {
    try {
      const docRes = await getCaseDocuments(caseId);
      if (docRes.ok && docRes.data && docRes.data.documents.length > 0) {
        const doc = docRes.data.documents[0];
        const url = await getDocumentDownloadUrl(doc.id);
        Linking.openURL(url);
      } else {
        Alert.alert('', t('cases_no_docs'));
      }
    } catch (err) {
      Alert.alert('', t('cases_download_failed'));
    }
  };

  const getStatusColor = (status: Case['status']) => {
    switch (status) {
      case 'filed':
        return { bg: '#E6F5ED', text: '#0F7B46', border: '#B8E0CC' };
      case 'analysed':
        return { bg: '#FDF0E8', text: '#C05621', border: '#F5D5BF' };
      default:
        return { bg: '#E8EDF5', text: '#2D2B55', border: '#C5D0E6' };
    }
  };

  const getStatusLabel = (status: Case['status']) => {
    if (isUrdu) {
      switch (status) {
        case 'filed':    return 'دائر';
        case 'analysed': return 'تجزیہ شدہ';
        default:         return 'مسودہ';
      }
    }
    return (status || 'draft').toUpperCase();
  };

  const renderCaseItem = ({ item }: { item: Case }) => {
    const statusStyle = getStatusColor(item.status);
    const formattedDate = item.created_at
      ? new Date(item.created_at).toLocaleDateString([], {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        })
      : t('cases_pending');

    return (
      <View style={[styles.caseCard, isUrdu && styles.rtlCard]}>
        <View style={[styles.cardHeader, isUrdu && styles.rtlRow]}>
          <View style={styles.titleContainer}>
            <Text style={[styles.caseTitle, isUrdu && styles.rtlText]}>
              {item.title || t('cases_untitled')}
            </Text>
            <Text style={[styles.caseRef, isUrdu && styles.rtlText]}>
              {item.case_ref || t('cases_draft_ref')}
            </Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg, borderColor: statusStyle.border }]}>
            <Text style={[styles.statusText, { color: statusStyle.text }]}>
              {getStatusLabel(item.status)}
            </Text>
          </View>
        </View>

        <View style={styles.cardDivider} />

        <View style={[styles.cardDetails, isUrdu && styles.rtlRow]}>
          <View style={[styles.detailRow, isUrdu && styles.rtlRow]}>
            <Clock size={16} color={Colors.textSecondary} />
            <Text style={[styles.detailText, isUrdu && styles.rtlText]}>
              {t('cases_created')}: {formattedDate}
            </Text>
          </View>
          <View style={[styles.detailRow, isUrdu && styles.rtlRow]}>
            <FileText size={16} color={Colors.textSecondary} />
            <Text style={[styles.detailText, isUrdu && styles.rtlText]}>
              {t('cases_type')}: {(item.issue_type || 'general').toUpperCase()}
            </Text>
          </View>
        </View>

        {item.legal_brief && (
          <View style={styles.briefPreviewContainer}>
            <Text style={[styles.briefPreviewTitle, isUrdu && styles.rtlText]}>
              {t('cases_legal_grounds')}
            </Text>
            <Text style={[styles.briefPreviewText, isUrdu && styles.rtlText]} numberOfLines={2}>
              {typeof item.legal_brief === 'string'
                ? item.legal_brief
                : item.legal_brief.brief || t('cases_no_grounds')}
            </Text>
          </View>
        )}

        <View style={[styles.actionButtons, isUrdu && styles.rtlRow]}>
          <TouchableOpacity
            style={styles.resumeButton}
            onPress={() => navigation.navigate('Chat', { caseId: item.id })}
          >
            <MessageSquare size={16} color={Colors.surface} style={{ marginRight: isUrdu ? 0 : 6, marginLeft: isUrdu ? 6 : 0 }} />
            <Text style={[styles.resumeButtonText, isUrdu && styles.rtlText]}>
              {t('cases_resume_chat')}
            </Text>
          </TouchableOpacity>

          {(item.status === 'analysed' || item.status === 'filed') && (
            <TouchableOpacity
              style={styles.downloadButton}
              onPress={() => handleDownload(item.id)}
            >
              <Download size={16} color={Colors.featureGreenText} style={{ marginRight: isUrdu ? 0 : 6, marginLeft: isUrdu ? 6 : 0 }} />
              <Text style={[styles.downloadButtonText, isUrdu && styles.rtlText]}>
                {t('cases_get_draft')}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={[styles.header, isUrdu && styles.rtlRow]}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.headerTitle, isUrdu && styles.rtlText]}>
            {t('cases_header_title')}
          </Text>
          <Text style={[styles.headerSubtitle, isUrdu && styles.rtlText]}>
            {t('cases_header_subtitle')}
          </Text>
        </View>
      </View>

      {/* Cases Count Bar */}
      <View style={[styles.countBar, isUrdu && styles.rtlRow]}>
        <Briefcase
          size={18}
          color={Colors.primary}
          style={{ marginRight: isUrdu ? 0 : 8, marginLeft: isUrdu ? 8 : 0 }}
        />
        <Text style={[styles.countBarText, isUrdu && styles.rtlText]}>
          {t('cases_tab_active')} ({cases.length})
        </Text>
      </View>

      {/* Main Content */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={[styles.loadingText, isUrdu && styles.rtlText]}>
            {t('cases_loading')}
          </Text>
        </View>
      ) : cases.length === 0 ? (
        <ScrollView contentContainerStyle={styles.emptyContainer}>
          <Text style={[styles.emptyTitle, isUrdu && styles.rtlText]}>
            {t('cases_empty_title')}
          </Text>
          <Text style={[styles.emptyDesc, isUrdu && styles.rtlText]}>
            {t('cases_empty_desc')}
          </Text>
          <TouchableOpacity
            style={[styles.emptyButton, isUrdu && styles.rtlRow]}
            onPress={() => navigation.navigate('Chat')}
          >
            <ArrowUpRight
              size={18}
              color={Colors.surface}
              style={{ marginRight: isUrdu ? 0 : 8, marginLeft: isUrdu ? 8 : 0 }}
            />
            <Text style={[styles.emptyButtonText, isUrdu && styles.rtlText]}>
              {t('cases_start_first')}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      ) : (
        <FlatList
          data={cases}
          keyExtractor={(item) => item.id}
          renderItem={renderCaseItem}
          contentContainerStyle={styles.listContainer}
          refreshing={refreshing}
          onRefresh={handleRefresh}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAF7',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  // RTL helpers
  rtlRow: {
    flexDirection: 'row-reverse',
  },
  rtlText: {
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  rtlCard: {
    direction: 'rtl',
  },
  header: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.primary,
  },
  headerSubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  countBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 2,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  countBarText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingVertical: 80,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
  },
  emptyDesc: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
    marginBottom: 24,
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: BorderRadius.md,
  },
  emptyButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.surface,
  },
  listContainer: {
    padding: Spacing.md,
    paddingBottom: 40,
  },
  caseCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    ...Platform.select({
      ios: {
        shadowColor: 'rgba(0,0,0,0.05)',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 1,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  titleContainer: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  caseTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
  },
  caseRef: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  cardDivider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: Spacing.md,
  },
  cardDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailText: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  briefPreviewContainer: {
    backgroundColor: '#F7F7F4',
    padding: Spacing.sm,
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: '#EFEFEA',
  },
  briefPreviewTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
    marginBottom: 4,
  },
  briefPreviewText: {
    fontSize: 13,
    lineHeight: 18,
    color: Colors.textSecondary,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  resumeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: 10,
    borderRadius: BorderRadius.sm,
  },
  resumeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.surface,
  },
  downloadButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.featureGreen,
    borderWidth: 1,
    borderColor: Colors.featureGreenBorder,
    paddingVertical: 10,
    borderRadius: BorderRadius.sm,
  },
  downloadButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.featureGreenText,
  },
});
