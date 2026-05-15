import { supabase } from './supabaseClient';

// ============================================
// GET CURRENT USER
// ============================================
export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};

// ============================================
// TRANSACTIONS - WITH USER FILTERING
// ============================================

export const getTransactions = async () => {
  const user = await getCurrentUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching transactions:', error);
    return null;
  }
  return data;
};

export const addTransaction = async (transaction) => {
  const user = await getCurrentUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('transactions')
    .insert([{
      ...transaction,
      user_id: user.id,
    }]);

  if (error) {
    console.error('Error adding transaction:', error);
    return null;
  }
  return data;
};

export const updateTransaction = async (id, transaction) => {
  const user = await getCurrentUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('transactions')
    .update(transaction)
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) {
    console.error('Error updating transaction:', error);
    return null;
  }
  return data;
};

export const deleteTransaction = async (id) => {
  const user = await getCurrentUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('transactions')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) {
    console.error('Error deleting transaction:', error);
    return null;
  }
  return data;
};

// ============================================
// EXPENSES - WITH USER FILTERING
// Note: Only use if expenses table exists in your database
// ============================================

export const getExpenses = async () => {
  try {
    const user = await getCurrentUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Expenses table not available or no user_id column:', error.message);
      return null;
    }
    return data;
  } catch (error) {
    console.warn('Error fetching expenses:', error);
    return null;
  }
};

export const addExpense = async (expense) => {
  try {
    const user = await getCurrentUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('expenses')
      .insert([{
        ...expense,
        user_id: user.id,
      }]);

    if (error) {
      console.warn('Expenses table not available:', error.message);
      return null;
    }
    return data;
  } catch (error) {
    console.warn('Error adding expense:', error);
    return null;
  }
};

export const updateExpense = async (id, expense) => {
  try {
    const user = await getCurrentUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('expenses')
      .update(expense)
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      console.warn('Expenses table not available:', error.message);
      return null;
    }
    return data;
  } catch (error) {
    console.warn('Error updating expense:', error);
    return null;
  }
};

export const deleteExpense = async (id) => {
  try {
    const user = await getCurrentUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('expenses')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      console.warn('Expenses table not available:', error.message);
      return null;
    }
    return data;
  } catch (error) {
    console.warn('Error deleting expense:', error);
    return null;
  }
};

// ============================================
// BUDGETS - WITH USER FILTERING
// Note: Only use if budgets table exists in your database
// ============================================

export const getBudgets = async () => {
  try {
    const user = await getCurrentUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('budgets')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Budgets table not available or no user_id column:', error.message);
      return null;
    }
    return data;
  } catch (error) {
    console.warn('Error fetching budgets:', error);
    return null;
  }
};

export const addBudget = async (budget) => {
  try {
    const user = await getCurrentUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('budgets')
      .insert([{
        ...budget,
        user_id: user.id,
      }]);

    if (error) {
      console.warn('Budgets table not available:', error.message);
      return null;
    }
    return data;
  } catch (error) {
    console.warn('Error adding budget:', error);
    return null;
  }
};

export const updateBudget = async (id, budget) => {
  try {
    const user = await getCurrentUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('budgets')
      .update(budget)
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      console.warn('Budgets table not available:', error.message);
      return null;
    }
    return data;
  } catch (error) {
    console.warn('Error updating budget:', error);
    return null;
  }
};

export const deleteBudget = async (id) => {
  try {
    const user = await getCurrentUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('budgets')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      console.warn('Budgets table not available:', error.message);
      return null;
    }
    return data;
  } catch (error) {
    console.warn('Error deleting budget:', error);
    return null;
  }
};

// ============================================
// INSIGHTS - WITH USER FILTERING
// Note: Only use if insights table exists in your database
// ============================================

export const getInsights = async () => {
  try {
    const user = await getCurrentUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('insights')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Insights table not available or no user_id column:', error.message);
      return null;
    }
    return data;
  } catch (error) {
    console.warn('Error fetching insights:', error);
    return null;
  }
};

export const addInsight = async (insight) => {
  try {
    const user = await getCurrentUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('insights')
      .insert([{
        ...insight,
        user_id: user.id,
      }]);

    if (error) {
      console.warn('Insights table not available:', error.message);
      return null;
    }
    return data;
  } catch (error) {
    console.warn('Error adding insight:', error);
    return null;
  }
};

// ============================================
// GENERIC QUERY FUNCTION - FOR ANY TABLE
// ============================================

export const queryTable = async (tableName, filters = {}) => {
  try {
    let query = supabase.from(tableName).select('*');

    // Apply filters if provided
    Object.entries(filters).forEach(([key, value]) => {
      query = query.eq(key, value);
    });

    const { data, error } = await query;

    if (error) {
      console.error(`Error fetching from ${tableName}:`, error);
      return null;
    }
    return data;
  } catch (error) {
    console.error(`Error querying ${tableName}:`, error);
    return null;
  }
};

// ============================================
// GENERIC INSERT FUNCTION - FOR ANY TABLE
// ============================================

export const insertIntoTable = async (tableName, record) => {
  try {
    const user = await getCurrentUser();
    if (!user) return null;

    const recordWithUser = {
      ...record,
      user_id: user.id,
    };

    const { data, error } = await supabase
      .from(tableName)
      .insert([recordWithUser]);

    if (error) {
      console.error(`Error inserting into ${tableName}:`, error);
      return null;
    }
    return data;
  } catch (error) {
    console.error(`Error inserting into ${tableName}:`, error);
    return null;
  }
};

// ============================================
// GENERIC UPDATE FUNCTION - FOR ANY TABLE
// ============================================

export const updateInTable = async (tableName, id, record) => {
  try {
    const user = await getCurrentUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from(tableName)
      .update(record)
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      console.error(`Error updating ${tableName}:`, error);
      return null;
    }
    return data;
  } catch (error) {
    console.error(`Error updating ${tableName}:`, error);
    return null;
  }
};

// ============================================
// GENERIC DELETE FUNCTION - FOR ANY TABLE
// ============================================

export const deleteFromTable = async (tableName, id) => {
  try {
    const user = await getCurrentUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from(tableName)
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      console.error(`Error deleting from ${tableName}:`, error);
      return null;
    }
    return data;
  } catch (error) {
    console.error(`Error deleting from ${tableName}:`, error);
    return null;
  }
};