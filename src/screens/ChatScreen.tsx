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
  ScrollView,
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
  MoreVertical
} from 'lucide-react-native';
import { Colors, Spacing, BorderRadius } from '../constants/Theme';
import { useLanguage } from '../store/LanguageContext';
import { analyzeLegalQuery } from '../services/legalService';

type SenderType = 'user' | 'agent1' | 'agent2';

interface Message {
  id: string;
  text: string;
  sender: SenderType;
  timestamp: string;
  attachment?: {
    name: string;
    type: string;
    size: string;
  };
}

type Step = 'input' | 'agent1' | 'agent2' | 'done';

const CATEGORIES = [
  'Divorce/Khula',
  'Child Custody',
  'Inheritance',
  'Property Rights'
];

export const ChatScreen = ({ navigation }: any) => {
  const { t } = useLanguage();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [currentStep, setCurrentStep] = useState<Step>('input');
  const [isTyping, setIsTyping] = useState(false);
  const flatListRef = useRef<FlatList>(null);

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
    setCurrentStep('agent1');

    try {
      const response = await analyzeLegalQuery(text);

      if (response.ok && response.data) {
        const data = response.data;

        // Simulate Agent 1 thinking/responding
        setTimeout(() => {
          const agent1Message: Message = {
            id: (Date.now() + 1).toString(),
            text: `I have identified the legal context for your situation. I am now passing the details to Agent 2 to prepare the specific petition assessment and draft for you.`,
            sender: 'agent1',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          };
          setMessages((prev) => [...prev, agent1Message]);
          setCurrentStep('agent2');

          // Simulate Agent 2 responding
          setTimeout(() => {
            const agent2Message: Message = {
              id: (Date.now() + 2).toString(),
              text: data.brief || `Your petition analysis is ready. I have prepared the grounds based on the relevant sections of Pakistani law.`,
              sender: 'agent2',
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              attachment: {
                name: 'Legal_Draft_v1.pdf',
                type: 'PDF',
                size: '42 KB'
              }
            };
            setMessages((prev) => [...prev, agent2Message]);
            setIsTyping(false);
            setCurrentStep('done');
          }, 1500);
        }, 1500);
      } else {
        // Handle error
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: "I encountered an error analyzing your query. Please try again.",
          sender: 'agent1',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, errorMessage]);
        setIsTyping(false);
        setCurrentStep('input');
      }
    } catch (error) {
      setIsTyping(false);
      setCurrentStep('input');
    }
  };

  const renderStepIndicator = () => {
    const steps: { label: string; key: Step; icon: any }[] = [
      { label: 'Input', key: 'input', icon: Check },
      { label: 'Agent 1', key: 'agent1', icon: User },
      { label: 'Agent 2', key: 'agent2', icon: User },
      { label: 'Done', key: 'done', icon: Check },
    ];

    return (
      <View style={styles.stepIndicatorContainer}>
        {steps.map((step, index) => {
          const isActive = currentStep === step.key;
          const isCompleted = 
            (currentStep === 'agent1' && index < 1) ||
            (currentStep === 'agent2' && index < 2) ||
            (currentStep === 'done' && index < 4);
          
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
                <TouchableOpacity style={styles.downloadBtn}>
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
                  {CATEGORIES.map((cat) => (
                    <TouchableOpacity 
                      key={cat} 
                      style={styles.chip}
                      onPress={() => setInputText(cat)}
                    >
                      <Text style={styles.chipText}>{cat}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            ) : null
          }
        />

        {isTyping && (
          <View style={styles.typingIndicator}>
            <Text style={styles.typingText}>Agent is thinking...</Text>
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
              !inputText.trim() && styles.sendButtonDisabled
            ]}
            onPress={() => sendMessage(inputText)}
            disabled={!inputText.trim() || isTyping}
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
  chipText: {
    color: Colors.primary,
    fontWeight: '600',
    fontSize: 14,
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
