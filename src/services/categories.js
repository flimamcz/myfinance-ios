// services/categories.js
export const categories = {
  // RECEITAS (typeId: 1)
  income: [
    { id: 1, name: "Salário", icon: "💰", color: "#22c55e", emoji: "💼" },
    { id: 2, name: "Freelance", icon: "💼", color: "#10b981", emoji: "👨‍💻" },
    { id: 3, name: "Venda", icon: "🛒", color: "#84cc16", emoji: "📦" },
    { id: 4, name: "Investimento", icon: "📈", color: "#3b82f6", emoji: "📊" },
    { id: 5, name: "Presente", icon: "🎁", color: "#f59e0b", emoji: "🎁" },
    { id: 6, name: "Reembolso", icon: "↪️", color: "#8b5cf6", emoji: "💸" },
    { id: 7, name: "Outros", icon: "📄", color: "#94a3b8", emoji: "📝" },
  ],

  // DESPESAS (typeId: 2)
  expense: [
    { id: 101, name: "Alimentação", icon: "🍕", color: "#ef4444", emoji: "🍔" },
    { id: 102, name: "Moradia", icon: "🏠", color: "#dc2626", emoji: "🏡" },
    { id: 103, name: "Transporte", icon: "🚗", color: "#b91c1c", emoji: "⛽" },
    { id: 104, name: "Lazer", icon: "🎬", color: "#f97316", emoji: "🎳" },
    { id: 105, name: "Saúde", icon: "🏥", color: "#d97706", emoji: "💊" },
    { id: 106, name: "Educação", icon: "📚", color: "#92400e", emoji: "🎓" },
    { id: 107, name: "Compras", icon: "🛍️", color: "#7c3aed", emoji: "👕" },
    { id: 108, name: "Serviços", icon: "🔧", color: "#6d28d9", emoji: "🛠️" },
    { id: 109, name: "Assinaturas", icon: "📱", color: "#5b21b6", emoji: "📺" },
    { id: 110, name: "Outros", icon: "📄", color: "#94a3b8", emoji: "📝" },
  ],

  // INVESTIMENTOS (typeId: 3)
  investment: [
    {
      id: 201,
      name: "Tesouro Direto",
      icon: "🏦",
      color: "#3b82f6",
      emoji: "🇧🇷",
    },
    { id: 202, name: "CDB", icon: "📊", color: "#2563eb", emoji: "🏛️" },
    { id: 203, name: "Ações", icon: "📈", color: "#1d4ed8", emoji: "💹" },
    { id: 204, name: "FIIs", icon: "🏢", color: "#1e40af", emoji: "🏘️" },
    { id: 205, name: "ETF", icon: "📉", color: "#1e3a8a", emoji: "📊" },
    { id: 206, name: "Criptomoedas", icon: "₿", color: "#f59e0b", emoji: "🔗" },
    { id: 207, name: "Previdência", icon: "👵", color: "#d97706", emoji: "👴" },
    { id: 208, name: "Outros", icon: "📄", color: "#94a3b8", emoji: "📝" },
  ],
};

// Funções utilitárias
// services/categories.js - ADICIONE
export const getCategoriesByType = (typeId) => {
  console.log(`🔍 Buscando categorias para typeId: ${typeId}`);

  switch (typeId) {
    case 1:
      console.log(
        "📊 Categorias de Receita:",
        categories.income.map((c) => `${c.id}: ${c.name}`)
      );
      return categories.income;
    case 2:
      console.log(
        "📊 Categorias de Despesa:",
        categories.expense.map((c) => `${c.id}: ${c.name}`)
      );
      return categories.expense;
    case 3:
      console.log(
        "📊 Categorias de Investimento:",
        categories.investment.map((c) => `${c.id}: ${c.name}`)
      );
      return categories.investment;
    default:
      console.log("⚠️ TypeId inválido, retornando array vazio");
      return [];
  }
};
export const getCategoryById = (id) => {
  // Busca em todas as categorias
  const allCategories = [
    ...categories.income,
    ...categories.expense,
    ...categories.investment,
  ];
  return (
    allCategories.find((cat) => cat.id === id) || {
      id: 0,
      name: "Não categorizado",
      icon: "❓",
      color: "#94a3b8",
      emoji: "❓",
    }
  );
};

export const getDefaultCategory = (typeId) => {
  const cats = getCategoriesByType(typeId);
  return (
    cats[0] || {
      id: 0,
      name: "Geral",
      icon: "📄",
      color: "#94a3b8",
      emoji: "📝",
    }
  );
};
