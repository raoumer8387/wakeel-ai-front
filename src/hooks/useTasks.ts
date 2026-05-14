import { useState, useCallback } from 'react';
import { Task } from '../types';

const INITIAL_TASKS: Task[] = [
  { id: '1', title: 'Design System Update', category: 'Work', completed: false },
  { id: '2', title: 'Buy Groceries', category: 'Personal', completed: true },
  { id: '3', title: 'Gym Session', category: 'Health', completed: false },
  { id: '4', title: 'React Native Meeting', category: 'Work', completed: false },
];

export const useTasks = () => {
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);

  const toggleTask = useCallback((id: string) => {
    setTasks(prev => prev.map(t => 
      t.id === id ? { ...t, completed: !t.completed } : t
    ));
  }, []);

  const addTask = useCallback((title: string, category: string) => {
    const newTask: Task = {
      id: Math.random().toString(36).substr(2, 9),
      title,
      category,
      completed: false,
      createdAt: new Date().toISOString(),
    };
    setTasks(prev => [newTask, ...prev]);
  }, []);

  const deleteTask = useCallback((id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  }, []);

  return {
    tasks,
    toggleTask,
    addTask,
    deleteTask,
    pendingCount: tasks.filter(t => !t.completed).length,
    completedCount: tasks.filter(t => t.completed).length,
  };
};
