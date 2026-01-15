// services/transaction.js
import api from './api';
import { getSession } from './session';

export const getTransactions = async () => {
  try {
    const session = await getSession();
    
    if (!session || !session.token) {
      throw new Error('Usuário não autenticado');
    }

    const response = await api.get('/transactions', {
      headers: {
        'Authorization': `Bearer ${session.token}`
      }
    });

    return response.data;
  } catch (error) {
    console.error('Erro ao buscar transações:', error);
    throw error;
  }
};

export const createTransaction = async (transactionData) => {
  try {
    const session = await getSession();
    
    const response = await api.post('/transactions', transactionData, {
      headers: {
        'Authorization': `Bearer ${session.token}`
      }
    });

    return response.data;
  } catch (error) {
    console.error('Erro ao criar transação:', error);
    throw error;
  }
};

// Função para calcular dashboard no frontend
export const calculateDashboardData = (transactions) => {
  let balance = 0;
  let income = 0;
  let expenses = 0;
  let investments = 0;

  transactions.forEach(transaction => {
    const value = parseFloat(transaction.value);
    
    switch(transaction.typeId) {
      case 1: // RECEITA
        income += value;
        balance += value;
        break;
      case 2: // DESPESA
        expenses += value;
        balance -= value;
        break;
      case 3: // INVESTIMENTO
        investments += value;
        balance -= value;
        break;
    }
  });

  return {
    balance: balance.toFixed(2),
    income: income.toFixed(2),
    expenses: expenses.toFixed(2),
    investments: investments.toFixed(2)
  };
};

export const deleteTransaction = async (transactionId) => {
  try {
    const session = await getSession();
    
    if (!session || !session.token) {
      throw new Error('Usuário não autenticado');
    }

    const response = await api.delete(`/transactions/${transactionId}`, {
      headers: {
        'Authorization': `Bearer ${session.token}`
      }
    });

    return response.data;
  } catch (error) {
    console.error('Erro ao excluir transação:', error);
    throw error;
  }
};