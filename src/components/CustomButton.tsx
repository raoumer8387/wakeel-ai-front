import React from 'react';
import { 
  TouchableOpacity, 
  Text, 
  StyleSheet, 
  ActivityIndicator,
  ViewStyle,
  TextStyle 
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, BorderRadius, Spacing } from '../constants/Theme';

interface CustomButtonProps {
  title: string;
  onPress: () => void;
  loading?: boolean;
  variant?: 'primary' | 'secondary' | 'outline';
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const CustomButton: React.FC<CustomButtonProps> = ({ 
  title, 
  onPress, 
  loading, 
  variant = 'primary',
  style,
  textStyle
}) => {
  const isOutline = variant === 'outline';
  
  const content = (
    <>
      {loading ? (
        <ActivityIndicator color={isOutline ? Colors.primary : Colors.text} />
      ) : (
        <Text style={[
          styles.text, 
          isOutline && styles.textOutline,
          textStyle
        ]}>
          {title}
        </Text>
      )}
    </>
  );

  if (isOutline) {
    return (
      <TouchableOpacity 
        onPress={onPress} 
        disabled={loading}
        style={[styles.button, styles.outline, style]}
      >
        {content}
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity 
      onPress={onPress} 
      disabled={loading}
      activeOpacity={0.8}
      style={[styles.button, style]}
    >
      <LinearGradient
        colors={variant === 'primary' ? [Colors.primary, '#4f46e5'] : [Colors.secondary, '#db2777']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        {content}
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  outline: {
    borderWidth: 1,
    borderColor: Colors.primary,
    backgroundColor: 'transparent',
  },
  text: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  textOutline: {
    color: Colors.primary,
  },
});
