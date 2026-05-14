import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, SafeAreaView } from 'react-native';
import { supabase } from '@/utils/supabase';
import { colors, typography, spacing } from '@/theme';
import { CheckCircle2, ListTodo } from 'lucide-react-native';

export default function SupabaseTest() {
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getTodos = async () => {
      try {
        const { data: todos, error } = await supabase.from('todos').select();

        if (error) {
          console.error('Error fetching todos:', error.message);
          return;
        }

        if (todos) {
          setTodos(todos);
        }
      } catch (error) {
        console.error('Error fetching todos:', error.message);
      } finally {
        setLoading(false);
      }
    };

    getTodos();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <ListTodo size={24} color={colors.primary} />
        <Text style={styles.title}>Supabase Todo List</Text>
      </View>

      {loading ? (
        <View style={styles.center}>
          <Text style={styles.text}>Loading todos...</Text>
        </View>
      ) : todos.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.text}>No todos found in the table.</Text>
          <Text style={styles.subtext}>Make sure you have a 'todos' table with an 'id' and 'name' column.</Text>
        </View>
      ) : (
        <FlatList
          data={todos}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <View style={styles.todoItem}>
              <CheckCircle2 size={20} color={colors.primary} />
              <Text style={styles.todoText}>{item.name}</Text>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: typography.size['2xl'],
    fontWeight: typography.weight.bold,
    color: colors.text,
  },
  list: {
    padding: spacing.xl,
  },
  todoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.card,
    padding: spacing.lg,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  todoText: {
    fontSize: typography.size.md,
    color: colors.text,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  text: {
    fontSize: typography.size.md,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  subtext: {
    fontSize: typography.size.sm,
    color: colors.textTertiary,
    textAlign: 'center',
  }
});
