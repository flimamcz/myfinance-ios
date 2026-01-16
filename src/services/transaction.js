// services/transaction.js - ATUALIZADO
import api from './api';
import { getSession } from './session';

// services/transaction.js - ATUALIZE
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

    console.log("📦 Dados brutos do backend:", JSON.stringify(response.data, null, 2));
    
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar transações:', error);
    throw error;
  }
};

export const createTransaction = async (transactionData) => {
  try {
    const session = await getSession();
    
    // ✅ Garante que categoryId é enviado (pode ser null)
    const dataToSend = {
      ...transactionData,
      categoryId: transactionData.categoryId || null
    };
    
    const response = await api.post('/transactions', dataToSend, {
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

// ✅ NOVA FUNÇÃO: Atualizar transação (para usar no futuro)
export const updateTransaction = async (id, transactionData) => {
  try {
    const session = await getSession();
    
    if (!session || !session.token) {
      throw new Error('Usuário não autenticado');
    }

    const response = await api.patch('/transactions', {
      id,
      ...transactionData,
      categoryId: transactionData.categoryId || null
    }, {
      headers: {
        'Authorization': `Bearer ${session.token}`
      }
    });

    return response.data;
  } catch (error) {
    console.error('Erro ao atualizar transação:', error);
    throw error;
  }
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

// ✅ NOVA FUNÇÃO: Agrupar transações por categoria
export const groupTransactionsByCategory = (transactions) => {
  const grouped = {};
  
  transactions.forEach(transaction => {
    const categoryId = transaction.category?.id || 0;
    const categoryName = transaction.category?.name || "Não categorizada";
    
    if (!grouped[categoryId]) {
      grouped[categoryId] = {
        id: categoryId,
        name: categoryName,
        icon: transaction.category?.icon || "📄",
        color: transaction.category?.color || "#94a3b8",
        total: 0,
        count: 0,
        transactions: []
      };
    }
    
    const value = parseFloat(transaction.value);
    grouped[categoryId].total += value;
    grouped[categoryId].count += 1;
    grouped[categoryId].transactions.push(transaction);
  });
  
  return Object.values(grouped).sort((a, b) => b.total - a.total);
};