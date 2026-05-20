import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Switch, Image, ScrollView,
  Modal, TextInput, KeyboardAvoidingView, Platform, ActivityIndicator, Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import {
  ArrowLeft, PenLine, BadgeCheck, Globe, Bell, Info, Shield, FileText, LogOut, ChevronRight, X, Check,
  MapPin, Camera, Upload, Phone, CreditCard
} from 'lucide-react-native';
import { Colors, Spacing, BorderRadius } from '../constants/Theme';
import { useLanguage } from '../store/LanguageContext';
import { useAuth } from '../store/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { getCaseStats, CaseStats } from '../services/caseService';
import { updateProfile, uploadAvatarFile } from '../services/authService';
import * as ImagePicker from 'expo-image-picker';
import { ENV } from '../config/env';

const AVATARS = [
  'default_male',
  'default_female',
];

export const ProfileScreen = () => {
  const { language, setLanguage, t } = useLanguage();
  const isRTL = language === 'ur';
  const rtlRow = isRTL ? { flexDirection: 'row-reverse' as const } : { flexDirection: 'row' as const };
  const rtlText = isRTL ? { textAlign: 'right' as const } : { textAlign: 'left' as const };
  const { logout, user, updateUser } = useAuth();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [stats, setStats] = useState<CaseStats>({
    total_cases: 0,
    documents_generated: 0,
    rights_analysed: 0,
    cases_filed: 0
  });

  // Modal States
  const [modalVisible, setModalVisible] = useState(false);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editCnic, setEditCnic] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('');
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const getAvatarUri = (url: string | null | undefined) => {
    if (!url) return null;
    if (url.startsWith('/static')) {
      const cleanBaseUrl = ENV.API_BASE_URL.endsWith('/') ? ENV.API_BASE_URL.slice(0, -1) : ENV.API_BASE_URL;
      return `${cleanBaseUrl}${url}`;
    }
    return url;
  };

  const renderAvatar = (url: string | null | undefined, size: number = 96, style: any = styles.avatar) => {
    if (url === 'default_male') {
      return <Image source={require('../../assets/ava_male.jpg')} style={[style, { width: size, height: size, borderRadius: size * 0.25 }]} />;
    }
    if (url === 'default_female') {
      return <Image source={require('../../assets/ava_female.jpg')} style={[style, { width: size, height: size, borderRadius: size * 0.25 }]} />;
    }

    const uri = getAvatarUri(url);
    if (uri) {
      return (
        <Image
          source={{ uri }}
          style={style}
        />
      );
    }

    // Default avatar fallback
    return (
      <Image
        source={require('../../assets/ava_male.jpg')}
        style={[style, { width: size, height: size, borderRadius: size * 0.25 }]}
      />
    );
  };

  const fetchProfileStats = async () => {
    try {
      const res = await getCaseStats();
      if (res.ok && res.data) {
        setStats(res.data);
      }
    } catch (err) {
      console.error('[ProfileScreen] Error fetching profile stats:', err);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchProfileStats();
    }, [])
  );

  const handleOpenEdit = () => {
    setEditName(user?.name || '');
    setEditPhone(user?.phone || '');
    setEditCnic(user?.cnic || '');
    setEditAddress(user?.address || '');
    setSelectedAvatar(user?.avatar_url || AVATARS[0]);
    setValidationErrors({});
    setModalVisible(true);
  };

  const formatCNIC = (text: string) => {
    const clean = text.replace(/\D/g, '');
    let formatted = clean;
    if (clean.length > 5) {
      formatted = `${clean.slice(0, 5)}-${clean.slice(5)}`;
    }
    if (clean.length > 12) {
      formatted = `${clean.slice(0, 5)}-${clean.slice(5, 12)}-${clean.slice(12, 13)}`;
    }
    return formatted.slice(0, 15);
  };

  const validateProfile = (): boolean => {
    const errs: Record<string, string> = {};
    if (!editName.trim()) {
      errs.name = t('name_required');
    }
    if (editCnic.trim()) {
      const cnicRegex = /^\d{5}-\d{7}-\d{1}$/;
      if (!cnicRegex.test(editCnic.trim())) {
        errs.cnic = t('cnic_invalid');
      }
    }
    setValidationErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSaveProfile = async () => {
    if (!validateProfile()) return;
    setSaving(true);
    try {
      const res = await updateProfile({
        name: editName.trim(),
        phone: editPhone.trim() || undefined,
        cnic: editCnic.trim() || undefined,
        avatar_url: selectedAvatar,
        address: editAddress.trim() || undefined,
      });

      if (res.ok && res.data) {
        await updateUser(res.data);
        setModalVisible(false);
        Alert.alert(t('success'), t('profile_updated'));
      } else {
        Alert.alert(t('error'), res.error || t('failed_update'));
      }
    } catch (err: any) {
      Alert.alert(t('error'), err.message || 'Something went wrong.');
    } finally {
      setSaving(false);
    }
  };

  const handlePickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert(t('permission_denied'), t('permission_denied_desc'));
      return;
    }

    const pickerResult = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (pickerResult.canceled) return;

    const asset = pickerResult.assets[0];

    // Check if image size exceeds 2MB (2 * 1024 * 1024 bytes)
    if (asset.fileSize && asset.fileSize > 2097152) {
      Alert.alert(t('size_limit_exceeded'), t('size_limit_desc'));
      return;
    }

    const pickedUri = asset.uri;

    setUploadingAvatar(true);
    try {
      const uploadResult = await uploadAvatarFile(pickedUri);
      if (uploadResult.ok && uploadResult.data) {
        await updateUser(uploadResult.data);
        setSelectedAvatar(uploadResult.data.avatar_url || '');
        Alert.alert(t('success'), t('profile uploaded successfully'));
      } else {
        Alert.alert(t('error'), uploadResult.error || t('failed to upload profile'));
      }
    } catch (err: any) {
      Alert.alert(t('error'), err.message || t('image_upload_failed'));
    } finally {
      setUploadingAvatar(false);
    }
  };

  const memberSinceDate = user?.created_at
    ? new Date(user.created_at).toLocaleDateString(language === 'ur' ? 'ur-PK' : 'en-US', { month: 'long', year: 'numeric' })
    : 'May 2026';

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={[styles.header, rtlRow]}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerIcon}>
            <ArrowLeft color="#1A1A2E" size={24} style={isRTL ? { transform: [{ rotate: '180deg' }] } : {}} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('profile')}</Text>
          <TouchableOpacity style={styles.headerIcon} onPress={handleOpenEdit}>
            <PenLine color="#1A1A2E" size={24} />
          </TouchableOpacity>
        </View>

        {/* Profile Info */}
        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            {renderAvatar(user?.avatar_url, 96, styles.avatar)}
            <View style={styles.badgeContainer}>
              <BadgeCheck color="#FFFFFF" fill="#0F7B46" size={24} />
            </View>
          </View>
          <Text style={styles.nameText}>{user?.name || t('user_name')}</Text>
          <Text style={styles.emailText}>{user?.email || 'user@example.com'}</Text>
          <Text style={styles.memberText}>{t('member_since')} {memberSinceDate}</Text>
        </View>

        {/* Stats */}
        <View style={[styles.statsRow, rtlRow]}>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{stats.total_cases.toString().padStart(2, '0')}</Text>
            <Text style={styles.statLabel}>{t('cases')}</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{stats.documents_generated.toString().padStart(2, '0')}</Text>
            <Text style={styles.statLabel}>{t('documents')}</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{stats.rights_analysed.toString().padStart(2, '0')}</Text>
            <Text style={styles.statLabel}>{t('rights')}</Text>
          </View>
        </View>

        {/* Profile Details */}
        <Text style={[styles.sectionHeader, rtlText]}>{t('profile details')}</Text>
        <View style={styles.card}>
          <View style={[styles.row, styles.borderBottom, rtlRow]}>
            <View style={[styles.rowLeft, rtlRow]}>
              <Phone color="#1A1A2E" size={22} />
              <View>
                <Text style={[styles.rowTitle, rtlText]}>{t('phone_number')}</Text>
                <Text style={[styles.rowSubtitle, rtlText]}>{user?.phone || t('not_provided')}</Text>
              </View>
            </View>
          </View>

          <View style={[styles.row, styles.borderBottom, rtlRow]}>
            <View style={[styles.rowLeft, rtlRow]}>
              <CreditCard color="#1A1A2E" size={22} />
              <View>
                <Text style={[styles.rowTitle, rtlText]}>{t('cnic')}</Text>
                <Text style={[styles.rowSubtitle, rtlText]}>{user?.cnic || t('not_provided')}</Text>
              </View>
            </View>
          </View>

          <View style={[styles.row, rtlRow]}>
            <View style={[styles.rowLeft, rtlRow]}>
              <MapPin color="#1A1A2E" size={22} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.rowTitle, rtlText]}>{t('address')}</Text>
                <Text style={[styles.rowSubtitle, rtlText]} numberOfLines={2}>{user?.address || t('not_provided')}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Preferences */}
        <Text style={[styles.sectionHeader, rtlText]}>{t('preferences')}</Text>
        <View style={styles.card}>
          <View style={[styles.row, styles.borderBottom, rtlRow]}>
            <View style={[styles.rowLeft, rtlRow]}>
              <Globe color="#1A1A2E" size={22} />
              <View>
                <Text style={[styles.rowTitle, rtlText]}>{t('language')}</Text>
                <Text style={[styles.rowSubtitle, rtlText]}>{t('urdu_english')}</Text>
              </View>
            </View>
            <View style={[styles.languageToggle, rtlRow]}>
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

          <View style={[styles.row, rtlRow]}>
            <View style={[styles.rowLeft, rtlRow]}>
              <Bell color="#1A1A2E" size={22} />
              <Text style={[styles.rowTitle, rtlText]}>{t('notifications')}</Text>
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
        <Text style={[styles.sectionHeader, rtlText]}>{t('legal_info')}</Text>
        <View style={styles.card}>
          <TouchableOpacity style={[styles.row, styles.borderBottom, rtlRow]} onPress={() => navigation.navigate('About')}>
            <View style={[styles.rowLeft, rtlRow]}>
              <Info color="#1A1A2E" size={22} />
              <Text style={[styles.rowTitle, rtlText]}>{t('about wakeel-ai')}</Text>
            </View>
            <ChevronRight color="#BDBDBD" size={20} style={isRTL ? { transform: [{ rotate: '180deg' }] } : {}} />
          </TouchableOpacity>

          <TouchableOpacity style={[styles.row, styles.borderBottom, rtlRow]} onPress={() => navigation.navigate('PrivacyPolicy')}>
            <View style={[styles.rowLeft, rtlRow]}>
              <Shield color="#1A1A2E" size={22} />
              <Text style={[styles.rowTitle, rtlText]}>{t('privacy policy')}</Text>
            </View>
            <ChevronRight color="#BDBDBD" size={20} style={isRTL ? { transform: [{ rotate: '180deg' }] } : {}} />
          </TouchableOpacity>

          <TouchableOpacity style={[styles.row, rtlRow]} onPress={() => navigation.navigate('TermsOfService')}>
            <View style={[styles.rowLeft, rtlRow]}>
              <FileText color="#1A1A2E" size={22} />
              <Text style={[styles.rowTitle, rtlText]}>{t('terms of service')}</Text>
            </View>
            <ChevronRight color="#BDBDBD" size={20} style={isRTL ? { transform: [{ rotate: '180deg' }] } : {}} />
          </TouchableOpacity>
        </View>

        {/* Sign Out */}
        <TouchableOpacity style={[styles.signOutButton, rtlRow]} onPress={logout}>
          <LogOut color="#D32F2F" size={22} />
          <Text style={[styles.signOutText, rtlText]}>{t('sign out')}</Text>
        </TouchableOpacity>

      </ScrollView>

      {/* Edit Profile Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setModalVisible(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={[styles.modalHeader, rtlRow]}>
            <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.modalCloseBtn}>
              <X color="#1A1A2E" size={24} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>{t('edit profile')}</Text>
            <TouchableOpacity onPress={handleSaveProfile} disabled={saving} style={styles.modalSaveBtn}>
              {saving ? (
                <ActivityIndicator size="small" color="#0F7B46" />
              ) : (
                <Check color="#0F7B46" size={24} />
              )}
            </TouchableOpacity>
          </View>

          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{ flex: 1 }}
          >
            <ScrollView
              contentContainerStyle={styles.modalScroll}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              {/* Custom Image Picker Section */}
              <View style={styles.imagePickerSection}>
                <TouchableOpacity
                  style={styles.imagePickerBox}
                  onPress={handlePickImage}
                  disabled={uploadingAvatar}
                  activeOpacity={0.8}
                >
                  {uploadingAvatar ? (
                    <View style={styles.imagePickerInner}>
                      <ActivityIndicator size="small" color="#0F7B46" />
                      <Text style={styles.imagePickerText}>{t('uploading')}</Text>
                    </View>
                  ) : (
                    <View style={styles.imagePickerInner}>
                      {selectedAvatar ? (
                        <Image source={{ uri: getAvatarUri(selectedAvatar) || '' }} style={styles.imagePickerBoxImage} />
                      ) : (
                        <Image source={require('../../assets/icon.png')} style={styles.imagePickerBoxImage} />
                      )}
                      <View style={styles.cameraIconBadge}>
                        <Camera color="#FFFFFF" size={14} strokeWidth={2.5} />
                      </View>
                      <Text style={styles.imagePickerText}>{t('upload photo')}</Text>
                    </View>
                  )}
                </TouchableOpacity>
              </View>

              {/* Avatar Picker Section */}
              <Text style={[styles.modalSectionLabel, rtlText]}>{t('choose an avatar')}</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.avatarPickerScroll}
              >
                {(() => {
                  const avatarOptions = [...AVATARS];
                  if (selectedAvatar && !AVATARS.includes(selectedAvatar)) {
                    avatarOptions.unshift(selectedAvatar);
                  }

                  return avatarOptions.map((uri) => {
                    const isSelected = selectedAvatar === uri;
                    const avatarUri = getAvatarUri(uri);

                    return (
                      <TouchableOpacity
                        key={uri}
                        style={[
                          styles.avatarOptionWrapper,
                          isSelected && styles.avatarOptionSelected,
                        ]}
                        onPress={() => setSelectedAvatar(uri)}
                        activeOpacity={0.8}
                      >
                        {renderAvatar(uri, 64, styles.avatarOptionImage)}
                        {isSelected && (
                          <View style={styles.avatarSelectedOverlay}>
                            <Check color="#FFFFFF" size={14} strokeWidth={3} />
                          </View>
                        )}
                      </TouchableOpacity>
                    );
                  });
                })()}
              </ScrollView>

              {/* Form Fields */}
              <View style={styles.modalForm}>
                {/* Name */}
                <Text style={[styles.modalInputLabel, rtlText]}>{t('full name')}</Text>
                <View style={[styles.modalInputBox, rtlRow, validationErrors.name && styles.modalInputBoxError]}>
                  <TextInput
                    style={[styles.modalTextInput, rtlText]}
                    placeholder={t('enter_full_name')}
                    placeholderTextColor="#8E8EA0"
                    value={editName}
                    onChangeText={(t) => {
                      setEditName(t);
                      if (validationErrors.name) {
                        setValidationErrors((prev) => {
                          const copy = { ...prev };
                          delete copy.name;
                          return copy;
                        });
                      }
                    }}
                    autoCapitalize="words"
                  />
                </View>
                {validationErrors.name && (
                  <Text style={[styles.modalErrorText, rtlText]}>{validationErrors.name}</Text>
                )}

                {/* Phone */}
                <Text style={[styles.modalInputLabel, rtlText, { marginTop: Spacing.md }]}>{t('phone_number')}</Text>
                <View style={[styles.modalInputBox, rtlRow]}>
                  <TextInput
                    style={[styles.modalTextInput, rtlText]}
                    placeholder={t('eg_phone')}
                    placeholderTextColor="#8E8EA0"
                    value={editPhone}
                    onChangeText={setEditPhone}
                    keyboardType="phone-pad"
                  />
                </View>

                {/* CNIC */}
                <Text style={[styles.modalInputLabel, rtlText, { marginTop: Spacing.md }]}>{t('cnic')}</Text>
                <View style={[styles.modalInputBox, rtlRow, styles.modalInputBoxDisabled]}>
                  <TextInput
                    style={[styles.modalTextInput, rtlText, styles.modalTextInputDisabled]}
                    placeholder="XXXXX-XXXXXXX-X"
                    placeholderTextColor="#8E8EA0"
                    value={editCnic}
                    editable={false}
                    selectTextOnFocus={false}
                  />
                </View>

                {/* Address */}
                <Text style={[styles.modalInputLabel, rtlText, { marginTop: Spacing.md }]}>{t('address')}</Text>
                <View style={[styles.modalInputBox, rtlRow, styles.addressInputBox]}>
                  <MapPin color="#8E8EA0" size={20} style={[styles.inputIcon, isRTL ? { marginLeft: Spacing.sm, marginRight: 0 } : {}]} />
                  <TextInput
                    style={[styles.modalTextInput, rtlText, styles.addressTextInput]}
                    placeholder={t('enter_address')}
                    placeholderTextColor="#8E8EA0"
                    value={editAddress}
                    onChangeText={setEditAddress}
                    multiline
                    numberOfLines={3}
                    textAlignVertical="top"
                  />
                </View>
              </View>

              {/* Action Button */}
              <TouchableOpacity
                style={[styles.modalSubmitBtn, saving && { opacity: 0.7 }]}
                onPress={handleSaveProfile}
                disabled={saving}
                activeOpacity={0.8}
              >
                {saving ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.modalSubmitBtnText}>{t('save profile')}</Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </Modal>
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
  modalContainer: {
    flex: 1,
    backgroundColor: '#FAF9F6',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#E8E8E8',
    backgroundColor: Colors.surface,
  },
  modalCloseBtn: {
    padding: Spacing.xs,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A2E',
  },
  modalSaveBtn: {
    padding: Spacing.xs,
  },
  modalScroll: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  modalSectionLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1A1A2E',
    marginBottom: Spacing.md,
  },
  avatarPickerScroll: {
    paddingVertical: Spacing.xs,
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  avatarOptionWrapper: {
    position: 'relative',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'transparent',
    padding: 2,
  },
  avatarOptionSelected: {
    borderColor: '#0F7B46',
  },
  avatarOptionImage: {
    width: 64,
    height: 64,
    borderRadius: 12,
    backgroundColor: '#E8E8E2',
  },
  avatarSelectedOverlay: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: '#0F7B46',
    borderRadius: 9,
    width: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  modalForm: {
    marginBottom: Spacing.xl,
  },
  modalInputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#5A5A7A',
    marginBottom: 6,
  },
  modalInputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 52,
    borderRadius: BorderRadius.md,
    borderWidth: 1.5,
    borderColor: '#E8E8E8',
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.md,
  },
  modalInputBoxError: {
    borderColor: '#ef4444',
  },
  modalTextInput: {
    flex: 1,
    fontSize: 16,
    color: '#1A1A2E',
    height: '100%',
  },
  modalErrorText: {
    fontSize: 12,
    color: '#ef4444',
    marginTop: 4,
  },
  modalSubmitBtn: {
    height: 54,
    borderRadius: BorderRadius.md,
    backgroundColor: '#0F7B46',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#0F7B46',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  modalSubmitBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  initialsAvatar: {
    backgroundColor: '#0F7B46',
    justifyContent: 'center',
    alignItems: 'center',
  },
  initialsText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  imagePickerSection: {
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  imagePickerBox: {
    width: 130,
    height: 130,
    borderRadius: BorderRadius.md,
    borderWidth: 2,
    borderColor: '#0F7B46',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FDF9',
  },
  imagePickerInner: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    width: '100%',
    height: '100%',
  },
  imagePickerBoxImage: {
    width: 80,
    height: 80,
    borderRadius: BorderRadius.md - 4,
    backgroundColor: '#E8E8E2',
  },
  cameraIconBadge: {
    position: 'absolute',
    bottom: 25,
    right: 20,
    backgroundColor: '#0F7B46',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#FAF9F6',
  },
  imagePickerText: {
    fontSize: 12,
    color: '#0F7B46',
    fontWeight: '600',
    marginTop: 6,
  },
  addressInputBox: {
    height: 90,
    alignItems: 'flex-start',
    paddingVertical: Spacing.sm,
  },
  addressTextInput: {
    height: '100%',
    paddingTop: Platform.OS === 'ios' ? 0 : 2,
    textAlignVertical: 'top',
  },
  inputIcon: {
    marginRight: Spacing.sm,
    marginTop: Platform.OS === 'ios' ? 2 : 4,
  },
  modalInputBoxDisabled: {
    backgroundColor: '#F3F4F6',
    borderColor: '#E5E7EB',
  },
  modalTextInputDisabled: {
    color: '#9CA3AF',
  },
});
