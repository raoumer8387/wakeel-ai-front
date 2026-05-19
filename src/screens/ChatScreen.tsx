import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StatusBar,
  Linking,
} from 'react-native';
import {
  ArrowLeft,
  Info,
  Mic,
  Send,
  Download,
  FileText,
  Check,
  User,
} from 'lucide-react-native';
import { Colors, Spacing, BorderRadius } from '../constants/Theme';
import { useLanguage } from '../store/LanguageContext';
import { streamChatQuery } from '../services/legalService';
import { getCaseMessages, getCaseDocuments, getDocumentDownloadUrl } from '../services/caseService';

type SenderType = 'user' | 'agent1' | 'agent2';

interface Message {
  id: string;
  text: string;
  sender: SenderType;
  timestamp: string;
  attachment?: {
    id?: string;
    name: string;
    type: string;
    size: string;
  };
}

type Step = 'start' | 'consultation' | 'drafting' | 'complete';

const CATEGORIES = [
  'Divorce/Khula',
  'Child Custody',
  'Inheritance',
  'Property Rights'
];

export const ChatScreen = ({ navigation, route }: any) => {
  const { t } = useLanguage();
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [inputText, setInputText] = useState('');
  const [currentStep, setCurrentStep] = useState<Step>('start');
  const [isTyping, setIsTyping] = useState(false);
  const [typingLabel, setTypingLabel] = useState('Wakeel is thinking...');
  const [pipelineActive, setPipelineActive] = useState(false);
  const [caseId, setCaseId] = useState<string | null>(route?.params?.caseId || null);
  const caseIdRef = useRef<string | null>(route?.params?.caseId || null);
  const flatListRef = useRef<FlatList>(null);

  // Sync state and refs whenever route parameters change (e.g. navigating to different cases or starting a new one)
  useEffect(() => {
    const newCaseId = route?.params?.caseId || null;
    setCaseId(newCaseId);
    caseIdRef.current = newCaseId;
    if (newCaseId) {
      loadCaseData(newCaseId);
    } else {
      // Reset state for a fresh new conversation
      setMessages([]);
      setCurrentStep('start');
      setSelectedCategory(null);
    }
  }, [route?.params?.caseId]);

  const loadCaseData = async (id: string) => {
    try {
      setIsTyping(true);
      const [msgRes, docRes] = await Promise.all([
        getCaseMessages(id),
        getCaseDocuments(id)
      ]);

      if (msgRes.ok && msgRes.data) {
        const mappedMessages: Message[] = msgRes.data.messages.map((msg: any) => ({
          id: msg.id,
          text: msg.content,
          sender: msg.role,
          timestamp: new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        }));

        // Attach any documents to the latest agent2 message
        if (docRes.ok && docRes.data && docRes.data.documents.length > 0) {
          const docs = docRes.data.documents;

          // Find the last agent2 message to append the attachment
          const latestAgent2Idx = [...mappedMessages].reverse().findIndex(m => m.sender === 'agent2');
          if (latestAgent2Idx !== -1) {
            const idx = mappedMessages.length - 1 - latestAgent2Idx;
            const doc = docs[0]; // Take primary document
            mappedMessages[idx].attachment = {
              id: doc.id,
              name: doc.file_path.split('/').pop() || 'Legal_Draft.pdf',
              type: 'PDF',
              size: '42 KB'
            };
          }
        }

        setMessages(mappedMessages);

        // Infer step from current state
        if (mappedMessages.length > 0) {
          const lastMsg = mappedMessages[mappedMessages.length - 1];
          if (lastMsg.sender === 'user') {
            setCurrentStep('consultation');
          } else if (lastMsg.sender === 'agent1') {
            setCurrentStep('consultation');
          } else if (lastMsg.sender === 'agent2') {
            setCurrentStep('complete');
          }
        }
      }
      setIsTyping(false);
    } catch (err) {
      console.error("Failed to load case data:", err);
      setIsTyping(false);
    }
  };

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);
    setTypingLabel('Wakeel is thinking...');
    setPipelineActive(true);
    setCurrentStep('consultation');

    try {
      await streamChatQuery(
        text,
        caseIdRef.current,
        (eventData) => {
          console.log("[SSE Event]:", eventData.event, eventData.message);

          switch (eventData.event) {
            case 'pipeline_start':
              setCurrentStep('consultation');
              setTypingLabel('Wakeel is thinking...');
              // Capture case_id from pipeline_start (top-level, earliest & safest)
              if (eventData.case_id && !caseIdRef.current) {
                caseIdRef.current = eventData.case_id;
                setCaseId(eventData.case_id);
              }
              break;

            case 'agent1_start':
              setCurrentStep('consultation');
              setIsTyping(true);
              setTypingLabel('Legal Analyst is typing...');
              break;

            case 'agent1_message':
              // Each agent1_message is a separate conversational reply — new bubble each time
              setIsTyping(false);
              setMessages((prev) => [
                ...prev,
                {
                  id: Date.now().toString() + '_a1',
                  text: eventData.message,
                  sender: 'agent1',
                  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                }
              ]);
              break;

            case 'agent2_start':
              setCurrentStep('drafting');
              setIsTyping(true);
              setTypingLabel('Document Specialist is typing...');
              break;

            case 'agent2_question':
              // Agent 2 asking for missing info — render as normal bot bubble
              setIsTyping(false);
              setMessages((prev) => [
                ...prev,
                {
                  id: Date.now().toString() + '_a2q',
                  text: eventData.message,
                  sender: 'agent2',
                  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                }
              ]);
              break;

            case 'agent2_done': {
              // Document drafted — show message with PDF attachment if available
              setIsTyping(false);
              const pdfPath = eventData.data?.pdf_path;
              setMessages((prev) => [
                ...prev,
                {
                  id: Date.now().toString() + '_a2done',
                  text: eventData.message || 'Your document has been drafted successfully.',
                  sender: 'agent2',
                  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                  attachment: pdfPath ? {
                    name: pdfPath.split('/').pop() || 'Legal_Draft.pdf',
                    type: 'PDF',
                    size: 'Download',
                  } : undefined,
                }
              ]);
              break;
            }

            case 'simulation_start':
              setIsTyping(true);
              setTypingLabel('Submitting to court...');
              break;

            case 'simulation_done':
              setIsTyping(false);
              if (eventData.data?.case_ref) {
                setMessages((prev) => [
                  ...prev,
                  {
                    id: Date.now().toString() + '_sim',
                    text: `\u2705 Case filed successfully!\nReference: ${eventData.data.case_ref}`,
                    sender: 'agent2',
                    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                  }
                ]);
              }
              setCurrentStep('complete');
              break;

            case 'complete':
              setIsTyping(false);
              setPipelineActive(false);
              // Sync documents from server using case_id (nested in data on complete)
              const finalCaseId = caseIdRef.current || eventData.data?.case_id;
              if (finalCaseId) {
                caseIdRef.current = finalCaseId;
                setCaseId(finalCaseId);
              }
              break;

            case 'error':
              setIsTyping(false);
              setPipelineActive(false);
              setMessages((prev) => [
                ...prev,
                {
                  id: Date.now().toString(),
                  text: `An error occurred: ${eventData.message}`,
                  sender: 'agent1',
                  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                }
              ]);
              break;
          }
        },
        () => {
          setIsTyping(false);
          setPipelineActive(false);
        },
        (err) => {
          setIsTyping(false);
          setPipelineActive(false);
          setMessages((prev) => [
            ...prev,
            {
              id: Date.now().toString(),
              text: `Connection error: ${err}`,
              sender: 'agent1',
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            }
          ]);
        }
      );
    } catch (error: any) {
      setIsTyping(false);
      setPipelineActive(false);
      setCurrentStep('start');
    }
  };


  const renderStepIndicator = () => {
    const steps: { label: string; key: Step; icon: any }[] = [
      { label: 'Start', key: 'start', icon: Check },
      { label: 'Consultation', key: 'consultation', icon: User },
      { label: 'Drafting', key: 'drafting', icon: User },
      { label: 'Complete', key: 'complete', icon: Check },
    ];

    return (
      <View style={styles.stepIndicatorContainer}>
        {steps.map((step, index) => {
          const isActive = currentStep === step.key;
          const isCompleted =
            (currentStep === 'consultation' && index < 1) ||
            (currentStep === 'drafting' && index < 2) ||
            (currentStep === 'complete' && index < 4);

          return (
            <React.Fragment key={step.key}>
              <View style={styles.stepItem}>
                <View style={[
                  styles.stepCircle,
                  isActive && styles.stepCircleActive,
                  isCompleted && styles.stepCircleCompleted
                ]}>
                  {index === 0 || index === 3 ? (
                    <Check size={14} color={isCompleted || isActive ? Colors.primary : Colors.textMuted} />
                  ) : (
                    <User size={14} color={isActive ? Colors.surface : Colors.textMuted} />
                  )}
                </View>
                <Text style={[
                  styles.stepLabel,
                  isActive && styles.stepLabelActive
                ]}>{step.label}</Text>
              </View>
              {index < steps.length - 1 && (
                <View style={styles.stepLine} />
              )}
            </React.Fragment>
          );
        })}
      </View>
    );
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isUser = item.sender === 'user';
    const isAgent1 = item.sender === 'agent1';
    const isAgent2 = item.sender === 'agent2';

    return (
      <View style={[
        styles.messageWrapper,
        isUser ? styles.userMessageWrapper : styles.agentMessageWrapper
      ]}>
        {!isUser && (
          <View style={[
            styles.avatar,
            isAgent1 ? styles.agent1Avatar : styles.agent2Avatar
          ]}>
            <Text style={styles.avatarText}>{isAgent1 ? 'A1' : 'A2'}</Text>
          </View>
        )}
        <View style={[
          styles.messageBubble,
          isUser && styles.userBubble,
          isAgent1 && styles.agent1Bubble,
          isAgent2 && styles.agent2Bubble
        ]}>
          <Text style={[
            styles.messageText,
            isUser && styles.userMessageText,
            isAgent2 && styles.agent2MessageText
          ]}>
            {item.text}
          </Text>

          {item.attachment && (
            <View style={styles.attachmentCard}>
              <View style={styles.attachmentInfo}>
                <View style={styles.fileIconContainer}>
                  <FileText size={24} color={Colors.surface} />
                </View>
                <View style={styles.fileDetails}>
                  <Text style={styles.fileName}>{item.attachment.name}</Text>
                  <Text style={styles.fileMeta}>{item.attachment.type} • {item.attachment.size}</Text>
                </View>
                <TouchableOpacity
                  style={styles.downloadBtn}
                  onPress={async () => {
                    if (item.attachment?.id) {
                      try {
                        const url = await getDocumentDownloadUrl(item.attachment.id);
                        Linking.openURL(url);
                      } catch (err: any) {
                        console.error("Failed to download document:", err.message);
                      }
                    } else {
                      alert("Document is still being drafted. Please try again in a few seconds.");
                    }
                  }}
                >
                  <Download size={20} color={Colors.featureGreenText} />
                </TouchableOpacity>
              </View>
            </View>
          )}

          <Text style={[
            styles.timestamp,
            isUser && styles.userTimestamp,
            isAgent2 && styles.agent2Timestamp
          ]}>
            {item.timestamp}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation?.goBack()}>
          <ArrowLeft color={Colors.primary} size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Wakeel-AI</Text>
        <TouchableOpacity>
          <Info color={Colors.primary} size={24} />
        </TouchableOpacity>
      </View>

      <View style={styles.topInfo}>
        <Text style={styles.topInfoText}>Describe your situation in Urdu or English</Text>
      </View>

      {renderStepIndicator()}

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessage}
          contentContainerStyle={styles.messageList}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          ListHeaderComponent={
            messages.length === 0 ? (
              <View style={styles.emptyState}>
                <View style={styles.chipsContainer}>
                  {CATEGORIES.map((cat) => {
                    const isActive = selectedCategory === cat;
                    return (
                      <TouchableOpacity 
                        key={cat} 
                        style={[styles.chip, isActive && styles.chipActive]}
                        onPress={() => {
                          setSelectedCategory(cat);
                          setInputText(cat);
                        }}
                      >
                        <Text style={[styles.chipText, isActive && styles.chipTextActive]}>{cat}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            ) : null
          }
        />

        {isTyping && (
          <View style={styles.typingIndicator}>
            <Text style={styles.typingText}>{typingLabel}</Text>
          </View>
        )}

        <View style={styles.inputContainer}>
          <TouchableOpacity style={styles.micButton}>
            <Mic color={Colors.textSecondary} size={24} />
          </TouchableOpacity>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              placeholder="Type your message..."
              placeholderTextColor={Colors.textMuted}
              value={inputText}
              onChangeText={setInputText}
              multiline
            />
          </View>
          <TouchableOpacity
            style={[
              styles.sendButton,
              (!inputText.trim() || pipelineActive) && styles.sendButtonDisabled
            ]}
            onPress={() => sendMessage(inputText)}
            disabled={!inputText.trim() || pipelineActive}
          >
            <Send color={Colors.surface} size={20} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF9FF',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: '#FAF9FF',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.primary,
  },
  topInfo: {
    alignItems: 'center',
    marginVertical: Spacing.sm,
  },
  topInfoText: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  stepIndicatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
  },
  stepItem: {
    alignItems: 'center',
    width: 60,
  },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F0F0F5',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E8',
  },
  stepCircleActive: {
    backgroundColor: '#E6E6FF',
    borderColor: Colors.primary,
    borderWidth: 2,
  },
  stepCircleCompleted: {
    backgroundColor: '#E6E6FF',
    borderColor: Colors.primary,
  },
  stepLine: {
    flex: 1,
    height: 2,
    backgroundColor: '#D0D0D8',
    marginHorizontal: -10,
    marginTop: -15,
  },
  stepLabel: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 4,
    fontWeight: '600',
  },
  stepLabelActive: {
    color: Colors.primary,
  },
  keyboardView: {
    flex: 1,
  },
  messageList: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.md,
    paddingTop: Spacing.sm,
  },
  emptyState: {
    marginTop: Spacing.lg,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  chip: {
    backgroundColor: '#F3F2F8',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: '#E8E8E8',
  },
  chipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  chipText: {
    color: Colors.primary,
    fontWeight: '600',
    fontSize: 14,
  },
  chipTextActive: {
    color: Colors.surface,
  },
  messageWrapper: {
    flexDirection: 'row',
    marginBottom: Spacing.md,
    maxWidth: '85%',
  },
  userMessageWrapper: {
    alignSelf: 'flex-end',
    flexDirection: 'row-reverse',
  },
  agentMessageWrapper: {
    alignSelf: 'flex-start',
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    marginTop: 4,
  },
  agent1Avatar: {
    backgroundColor: Colors.primary,
  },
  agent2Avatar: {
    backgroundColor: '#B8F2D1',
  },
  avatarText: {
    color: Colors.surface,
    fontSize: 12,
    fontWeight: '700',
  },
  messageBubble: {
    padding: 12,
    borderRadius: 16,
    borderTopLeftRadius: 4,
  },
  userBubble: {
    backgroundColor: Colors.primary,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 4,
  },
  agent1Bubble: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: '#E8E8E8',
  },
  agent2Bubble: {
    backgroundColor: '#B8F2D1',
  },
  messageText: {
    fontSize: 15,
    lineHeight: 22,
    color: Colors.text,
  },
  userMessageText: {
    color: Colors.surface,
  },
  agent2MessageText: {
    color: '#1C6641',
  },
  timestamp: {
    fontSize: 10,
    color: Colors.textMuted,
    alignSelf: 'flex-end',
    marginTop: 4,
  },
  userTimestamp: {
    color: 'rgba(255,255,255,0.7)',
  },
  agent2Timestamp: {
    color: '#0F7B46',
  },
  attachmentCard: {
    marginTop: 12,
    backgroundColor: Colors.surface,
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  attachmentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  fileIconContainer: {
    width: 40,
    height: 48,
    backgroundColor: '#2E7D32',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fileDetails: {
    flex: 1,
    marginLeft: 12,
  },
  fileName: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  fileMeta: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  downloadBtn: {
    padding: 8,
  },
  typingIndicator: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 4,
  },
  typingText: {
    fontSize: 12,
    color: Colors.textMuted,
    fontStyle: 'italic',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.sm,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
  },
  micButton: {
    padding: 10,
  },
  inputWrapper: {
    flex: 1,
    backgroundColor: '#F3F2F8',
    borderRadius: 24,
    paddingHorizontal: 16,
    marginHorizontal: 8,
    maxHeight: 100,
  },
  input: {
    fontSize: 16,
    color: Colors.text,
    paddingVertical: 8,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
});
