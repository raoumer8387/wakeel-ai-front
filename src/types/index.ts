export interface Task {
  id: string;
  title: string;
  category: string;
  completed: boolean;
  createdAt?: string;
}

export type Category = 'Work' | 'Personal' | 'Health' | 'Education' | 'Other';

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
}
