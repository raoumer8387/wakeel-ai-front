import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  StatusBar,
  TouchableOpacity
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Plus, CheckCircle2, Circle, Search, LogOut } from 'lucide-react-native';
import { Colors, Spacing, BorderRadius } from '../constants/Theme';
import { GlassCard } from '../components/GlassCard';
import { CustomButton } from '../components/CustomButton';
import { useTasks } from '../hooks/useTasks';
import { Task } from '../types';
import { useAuth } from '../store/AuthContext';

export const HomeScreen = () => {
  const { tasks, toggleTask, pendingCount, completedCount } = useTasks();
  const { user, logout } = useAuth();

  const renderTask = ({ item }: { item: Task }) => (
    <TouchableOpacity onPress={() => toggleTask(item.id)} activeOpacity={0.7}>
      <GlassCard style={styles.taskCard}>
        <View style={styles.taskContent}>
          <View style={styles.taskLeft}>
            {item.completed ? (
              <CheckCircle2 color={Colors.accent} size={22} />
            ) : (
              <Circle color={Colors.textMuted} size={22} />
            )}
            <View style={styles.taskInfo}>
              <Text style={[
                styles.taskTitle, 
                item.completed && styles.taskTitleCompleted
              ]}>
                {item.title}
              </Text>
              <Text style={styles.taskCategory}>{item.category}</Text>
            </View>
          </View>
        </View>
      </GlassCard>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Good Morning,</Text>
          <Text style={styles.name}>{user?.name || 'User'}</Text>
        </View>
        <View style={{ flexDirection: 'row', gap: Spacing.sm }}>
          <TouchableOpacity style={styles.iconButton}>
            <Search color={Colors.text} size={22} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton} onPress={logout}>
            <LogOut color={Colors.text} size={22} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.statsContainer}>
        <GlassCard style={styles.statCard}>
          <Text style={styles.statValue}>{pendingCount}</Text>
          <Text style={styles.statLabel}>Pending</Text>
        </GlassCard>
        <GlassCard style={styles.statCard}>
          <Text style={[styles.statValue, { color: Colors.accent }]}>
            {completedCount}
          </Text>
          <Text style={styles.statLabel}>Done</Text>
        </GlassCard>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Daily Tasks</Text>
        <TouchableOpacity>
          <Text style={styles.seeAll}>See All</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={tasks}
        renderItem={renderTask}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />

      <View style={styles.footer}>
        <CustomButton 
          title="Add New Task" 
          onPress={() => {}} 
          style={styles.addButton}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    marginBottom: Spacing.xl,
  },
  greeting: {
    color: Colors.textMuted,
    fontSize: 16,
  },
  name: {
    color: Colors.text,
    fontSize: 28,
    fontWeight: 'bold',
  },
  iconButton: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing.lg,
  },
  statValue: {
    color: Colors.text,
    fontSize: 32,
    fontWeight: 'bold',
  },
  statLabel: {
    color: Colors.textMuted,
    fontSize: 14,
    marginTop: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    color: Colors.text,
    fontSize: 20,
    fontWeight: '600',
  },
  seeAll: {
    color: Colors.primary,
    fontSize: 14,
  },
  list: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: 100,
  },
  taskCard: {
    marginBottom: Spacing.md,
  },
  taskContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  taskLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  taskInfo: {
    gap: 2,
  },
  taskTitle: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: '500',
  },
  taskTitleCompleted: {
    textDecorationLine: 'line-through',
    color: Colors.textMuted,
  },
  taskCategory: {
    color: Colors.textMuted,
    fontSize: 12,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: Spacing.lg,
    backgroundColor: 'transparent',
  },
  addButton: {
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
});
