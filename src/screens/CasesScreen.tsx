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
  Code,
  Download,
  MessageSquare,
  ChevronRight,
  Terminal,
  FileText,
  Clock,
  ArrowUpRight,
} from 'lucide-react-native';
import { Colors, Spacing, BorderRadius, Typography } from '../constants/Theme';
import { useLanguage } from '../store/LanguageContext';
import { getCases, getCaseDocuments, getDocumentDownloadUrl, Case } from '../services/caseService';

/**
 * ============================================================================
 * WAKEEL-AI CASES & DEVELOPER API DOCUMENTATION CONSOLE
 * ============================================================================
 * This screen serves a dual purpose:
 * 1. Premium User Dashboard: Fetches and displays cases created by the user,
 *    allowing them to track status, resume conversations, and download PDFs.
 * 2. Interactive Developer API Console: Documents the complete REST/SSE API
 *    endpoints, models, event flows, and query examples for future engineering.
 * ============================================================================
 */

interface EndpointDoc {
  method: 'GET' | 'POST';
  path: string;
  description: string;
  requestBody?: string;
  responseBody: string;
}

const API_ENDPOINTS: EndpointDoc[] = [
  {
    method: 'POST',
    path: '/api/v1/chat/query',
    description: 'Primary SSE endpoint for interacting with the AI Legal Analyst (Agent 1) and Document Specialist (Agent 2) pipeline. It streams event-based responses to orchestrate real-time progress.',
    requestBody: `{\n  "message": "I want a Khula. I live in Lahore.",\n  "case_id": "CASE_A1B2C3D4" // Optional\n}`,
    responseBody: `event: pipeline_start | agent1_start | agent1_done | ...\ndata: {\n  "event": "agent1_done",\n  "message": "Legal brief created",\n  "data": {\n    "case_id": "CASE_A1B2C3D4",\n    "brief": "Khula petition grounds..."\n  }\n}`,
  },
  {
    method: 'GET',
    path: '/api/v1/cases/',
    description: 'Retrieves all cases created by the currently authenticated user, sorted in descending order of creation date.',
    responseBody: `{\n  "cases": [\n    {\n      "id": "CASE_A1B2C3D4",\n      "user_id": "user-uuid",\n      "title": "Khula Petition — Wife Divorce",\n      "issue_type": "khula",\n      "status": "filed",\n      "case_ref": "FC-LHR-2024-1234",\n      "created_at": "2024-05-17T12:00:00Z"\n    }\n  ]\n}`,
  },
  {
    method: 'GET',
    path: '/api/v1/cases/{case_id}',
    description: 'Retrieves the complete detail dictionary of a specific case, including deep nested legal briefs and action logs.',
    responseBody: `{\n  "id": "CASE_A1B2C3D4",\n  "title": "Khula Petition",\n  "status": "analysed",\n  "legal_brief": {\n    "brief": "Petitioner requests Khula on grounds of...",\n    "grounds": ["Incompatibility", "Cruelty"]\n  },\n  "action_log": [\n    { "action": "created", "timestamp": "2024-05-17T12:00:00Z" }\n  ]\n}`,
  },
  {
    method: 'GET',
    path: '/api/v1/cases/{case_id}/messages',
    description: 'Retrieves complete chronological message log history exchanged between user and AI agents for a case.',
    responseBody: `{\n  "messages": [\n    {\n      "id": "msg-uuid-1",\n      "role": "user",\n      "content": "I want a Khula.",\n      "created_at": "2024-05-17T12:00:00Z"\n    },\n    {\n      "id": "msg-uuid-2",\n      "role": "agent2",\n      "content": "Please enter your CNIC...",\n      "metadata_": { "missing_fields": ["APPLICANT_CNIC"] }\n    }\n  ]\n}`,
  },
  {
    method: 'GET',
    path: '/api/v1/documents/{case_id}',
    description: 'Retrieves list of all system generated document logs and drafts associated with a specific case.',
    responseBody: `{\n  "documents": [\n    {\n      "id": "doc-uuid",\n      "case_id": "CASE_A1B2C3D4",\n      "type": "khula",\n      "file_path": "data/output/CASE_A1B2C3D4_khula.pdf",\n      "created_at": "2024-05-17T12:05:00Z"\n    }\n  ]\n}`,
  },
  {
    method: 'GET',
    path: '/api/v1/documents/{doc_id}/download',
    description: 'Downloads the actual generated PDF file for a specific document ID. Emits content type application/pdf.',
    responseBody: `Binary Stream: [PDF Data Payload]`,
  },
];

export const CasesScreen = ({ navigation }: any) => {
  const { t, language } = useLanguage();
  const isUrdu = language === 'ur';

  const [activeTab, setActiveTab] = useState<'cases' | 'api'>('cases');
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedEndpoints, setExpandedEndpoints] = useState<Record<number, boolean>>({});

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

  const toggleEndpoint = (index: number) => {
    setExpandedEndpoints((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
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

  const renderDeveloperConsole = () => {
    return (
      <ScrollView style={styles.apiContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.docIntroCard}>
          <View style={[styles.docIntroHeader, isUrdu && styles.rtlRow]}>
            <Terminal size={22} color={Colors.secondary} />
            <Text style={[styles.docIntroTitle, isUrdu && styles.rtlText]}>
              {t('cases_api_title')}
            </Text>
          </View>
          <Text style={[styles.docIntroDesc, isUrdu && styles.rtlText]}>
            {t('cases_api_desc')}
          </Text>
        </View>

        <Text style={[styles.sectionHeader, isUrdu && styles.rtlText]}>
          {t('cases_api_section')}
        </Text>

        {API_ENDPOINTS.map((endpoint, index) => {
          const isExpanded = expandedEndpoints[index];
          const isGet = endpoint.method === 'GET';
          return (
            <View key={index} style={styles.endpointCard}>
              <TouchableOpacity
                style={[styles.endpointHeader, isUrdu && styles.rtlRow]}
                onPress={() => toggleEndpoint(index)}
                activeOpacity={0.8}
              >
                <View style={[styles.endpointBadgeContainer, isUrdu && styles.rtlRow]}>
                  <View
                    style={[
                      styles.methodBadge,
                      { backgroundColor: isGet ? '#E6F5ED' : '#FDF0E8' },
                    ]}
                  >
                    <Text
                      style={[
                        styles.methodText,
                        { color: isGet ? '#0F7B46' : '#C05621' },
                      ]}
                    >
                      {endpoint.method}
                    </Text>
                  </View>
                  <Text style={styles.endpointPath} numberOfLines={1}>
                    {endpoint.path}
                  </Text>
                </View>
                <ChevronRight
                  size={18}
                  color={Colors.textSecondary}
                  style={{ transform: [{ rotate: isExpanded ? '90deg' : '0deg' }] }}
                />
              </TouchableOpacity>

              {isExpanded && (
                <View style={styles.endpointDetails}>
                  <Text style={[styles.endpointDesc, isUrdu && styles.rtlText]}>
                    {endpoint.description}
                  </Text>

                  {endpoint.requestBody && (
                    <View style={styles.codeContainer}>
                      <Text style={styles.codeLabel}>REQUEST JSON BODY</Text>
                      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        <Text style={styles.codeText}>{endpoint.requestBody}</Text>
                      </ScrollView>
                    </View>
                  )}

                  <View style={[styles.codeContainer, { marginTop: 12 }]}>
                    <Text style={styles.codeLabel}>RESPONSE PAYLOAD</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                      <Text style={styles.codeText}>{endpoint.responseBody}</Text>
                    </ScrollView>
                  </View>
                </View>
              )}
            </View>
          );
        })}

        <View style={{ height: 40 }} />
      </ScrollView>
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

      {/* Tabs */}
      <View style={[styles.tabContainer, isUrdu && styles.rtlRow]}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'cases' && styles.tabButtonActive]}
          onPress={() => setActiveTab('cases')}
        >
          <Briefcase
            size={18}
            color={activeTab === 'cases' ? Colors.surface : Colors.primary}
            style={{ marginRight: isUrdu ? 0 : 8, marginLeft: isUrdu ? 8 : 0 }}
          />
          <Text style={[styles.tabButtonText, activeTab === 'cases' && styles.tabButtonTextActive, isUrdu && styles.rtlText]}>
            {t('cases_tab_active')} ({cases.length})
          </Text>
        </TouchableOpacity>

        {cases.length > 0 && (
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'api' && styles.tabButtonActive]}
            onPress={() => setActiveTab('api')}
          >
            <Code
              size={18}
              color={activeTab === 'api' ? Colors.surface : Colors.primary}
              style={{ marginRight: isUrdu ? 0 : 8, marginLeft: isUrdu ? 8 : 0 }}
            />
            <Text style={[styles.tabButtonText, activeTab === 'api' && styles.tabButtonTextActive, isUrdu && styles.rtlText]}>
              {t('cases_tab_api')}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Main Content Area */}
      {activeTab === 'cases' ? (
        loading ? (
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
        )
      ) : (
        renderDeveloperConsole()
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
  tabContainer: {
    flexDirection: 'row',
    padding: Spacing.sm,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: BorderRadius.md,
  },
  tabButtonActive: {
    backgroundColor: Colors.primary,
  },
  tabButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
  },
  tabButtonTextActive: {
    color: Colors.surface,
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
  apiContainer: {
    padding: Spacing.md,
  },
  docIntroCard: {
    backgroundColor: '#E8EDF5',
    borderWidth: 1,
    borderColor: '#C5D0E6',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
  },
  docIntroHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  docIntroTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.primary,
  },
  docIntroDesc: {
    fontSize: 13,
    lineHeight: 19,
    color: Colors.primaryLight,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  endpointCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.sm,
    overflow: 'hidden',
  },
  endpointHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.md,
  },
  endpointBadgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: Spacing.sm,
  },
  methodBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
    marginRight: 10,
    width: 60,
    alignItems: 'center',
  },
  methodText: {
    fontSize: 11,
    fontWeight: '800',
  },
  endpointPath: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    flex: 1,
  },
  endpointDetails: {
    padding: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: '#FDFDFB',
  },
  endpointDesc: {
    fontSize: 13,
    lineHeight: 18,
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
  },
  codeContainer: {
    backgroundColor: '#1E1E24',
    padding: 12,
    borderRadius: BorderRadius.sm,
  },
  codeLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#8E8EA0',
    marginBottom: 6,
  },
  codeText: {
    fontSize: 12,
    color: '#E8E8ED',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    lineHeight: 16,
  },
});
