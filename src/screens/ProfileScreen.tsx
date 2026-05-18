import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch, Image, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, PenLine, BadgeCheck, Globe, Bell, Info, Shield, FileText, LogOut, ChevronRight } from 'lucide-react-native';
import { Colors, Spacing, BorderRadius } from '../constants/Theme';
import { useLanguage } from '../store/LanguageContext';
import { useAuth } from '../store/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';

export const ProfileScreen = () => {
  const { language, setLanguage, t } = useLanguage();
  const { logout } = useAuth();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerIcon}>
            <ArrowLeft color="#1A1A2E" size={24} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('profile')}</Text>
          <TouchableOpacity style={styles.headerIcon}>
            <PenLine color="#1A1A2E" size={24} />
          </TouchableOpacity>
        </View>

        {/* Profile Info */}
        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            <Image 
              source={{ uri: 'https://randomuser.me/api/portraits/men/32.jpg' }} 
              style={styles.avatar} 
            />
            <View style={styles.badgeContainer}>
              <BadgeCheck color="#FFFFFF" fill="#0F7B46" size={24} />
            </View>
          </View>
          <Text style={styles.nameText}>{t('user_name')}</Text>
          <Text style={styles.emailText}>ahmed.khan@lawconnect.pk</Text>
          <Text style={styles.memberText}>{t('member_since')} May 2026</Text>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>12</Text>
            <Text style={styles.statLabel}>{t('cases')}</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>45</Text>
            <Text style={styles.statLabel}>{t('documents')}</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>08</Text>
            <Text style={styles.statLabel}>{t('rights')}</Text>
          </View>
        </View>

        {/* Preferences */}
        <Text style={styles.sectionHeader}>{t('preferences')}</Text>
        <View style={styles.card}>
          <View style={[styles.row, styles.borderBottom]}>
            <View style={styles.rowLeft}>
              <Globe color="#1A1A2E" size={22} />
              <View>
                <Text style={styles.rowTitle}>{t('language')}</Text>
                <Text style={styles.rowSubtitle}>{t('urdu_english')}</Text>
              </View>
            </View>
            <View style={styles.languageToggle}>
              <TouchableOpacity 
                style={[styles.langBtn, language === 'en' && styles.langBtnActive]}
                onPress={() => setLanguage('en')}
              >
                <Text style={[styles.langText, language === 'en' && styles.langTextActive]}>EN</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.langBtn, language === 'ur' && styles.langBtnActive]}
                onPress={() => setLanguage('ur')}
              >
                <Text style={[styles.langText, language === 'ur' && styles.langTextActive]}>اردو</Text>
              </TouchableOpacity>
            </View>
          </View>
          
          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <Bell color="#1A1A2E" size={22} />
              <Text style={styles.rowTitle}>{t('notifications')}</Text>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: '#E0E0E0', true: '#B8E0CC' }}
              thumbColor={notificationsEnabled ? '#0F7B46' : '#F5F5F5'}
            />
          </View>
        </View>

        {/* Legal Info */}
        <Text style={styles.sectionHeader}>{t('legal_info')}</Text>
        <View style={styles.card}>
          <TouchableOpacity style={[styles.row, styles.borderBottom]} onPress={() => navigation.navigate('About')}>
            <View style={styles.rowLeft}>
              <Info color="#1A1A2E" size={22} />
              <Text style={styles.rowTitle}>{t('about wakeel-ai')}</Text>
            </View>
            <ChevronRight color="#BDBDBD" size={20} />
          </TouchableOpacity>
          
          <TouchableOpacity style={[styles.row, styles.borderBottom]} onPress={() => navigation.navigate('PrivacyPolicy')}>
            <View style={styles.rowLeft}>
              <Shield color="#1A1A2E" size={22} />
              <Text style={styles.rowTitle}>{t('privacy policy')}</Text>
            </View>
            <ChevronRight color="#BDBDBD" size={20} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.row} onPress={() => navigation.navigate('TermsOfService')}>
            <View style={styles.rowLeft}>
              <FileText color="#1A1A2E" size={22} />
              <Text style={styles.rowTitle}>{t('terms of service')}</Text>
            </View>
            <ChevronRight color="#BDBDBD" size={20} />
          </TouchableOpacity>
        </View>

        {/* Sign Out */}
        <TouchableOpacity style={styles.signOutButton} onPress={logout}>
          <LogOut color="#D32F2F" size={22} />
          <Text style={styles.signOutText}>{t('sign out')}</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF9F6',
  },
  scrollContent: {
    paddingBottom: Spacing.xxl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  headerIcon: {
    padding: Spacing.xs,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A2E',
  },
  profileSection: {
    alignItems: 'center',
    marginTop: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: Spacing.md,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 24,
    backgroundColor: '#E8E8E2',
  },
  badgeContainer: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    backgroundColor: '#FAF9F6',
    borderRadius: 12,
    padding: 2,
  },
  nameText: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1A1A2E',
    marginBottom: 4,
  },
  emailText: {
    fontSize: 14,
    color: '#5A5A7A',
    marginBottom: 4,
  },
  memberText: {
    fontSize: 13,
    color: '#8E8EA0',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.xl,
    gap: Spacing.sm,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#F5F5F9',
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1A1A2E',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#5A5A7A',
    fontWeight: '500',
  },
  sectionHeader: {
    fontSize: 13,
    fontWeight: '600',
    color: '#8E8EA0',
    letterSpacing: 0.5,
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.xl,
    borderWidth: 1,
    borderColor: '#E8E8E8',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
  },
  borderBottom: {
    borderBottomWidth: 1,
    borderBottomColor: '#E8E8E8',
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  rowTitle: {
    fontSize: 16,
    color: '#1A1A2E',
    fontWeight: '500',
  },
  rowSubtitle: {
    fontSize: 13,
    color: '#5A5A7A',
    marginTop: 2,
  },
  languageToggle: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
    padding: 2,
  },
  langBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 18,
  },
  langBtnActive: {
    backgroundColor: '#1A1A2E',
  },
  langText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#5A5A7A',
  },
  langTextActive: {
    color: Colors.surface,
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF0F0',
    marginHorizontal: Spacing.lg,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    gap: Spacing.sm,
    borderWidth: 1,
    borderColor: '#FFE0E0',
    marginBottom: Spacing.xxl,
  },
  signOutText: {
    color: '#D32F2F',
    fontSize: 16,
    fontWeight: '600',
  },
});
