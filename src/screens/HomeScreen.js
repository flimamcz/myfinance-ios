// screens/HomeScreen.js - VERSÃO FINAL CORRIGIDA
import { SafeAreaView } from "react-native-safe-area-context";
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { colors } from "../theme/colors";
import { MaterialIcons, FontAwesome5, Ionicons } from "@expo/vector-icons";
import { getTransactions } from "../services/transaction";
import { calculateDashboardData } from "../services/transaction";
import { clearSession } from "../services/session";

import NewIncomeModal from "../modals/NewIncomeModal";
import NewExpenseModal from "../modals/NewExpenseModal";
import NewInvestmentModal from "../modals/NewInvestmentModal";
import TransactionDetailsModal from "../modals/TransactionDetailsModal";

export default function HomeScreen({ navigation }) {
  // ESTADOS
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [dashboard, setDashboard] = useState({
    balance: "0.00",
    income: "0.00",
    expenses: "0.00",
    investments: "0.00",
  });

  // ESTADOS DOS MODAIS
  const [showIncomeModal, setShowIncomeModal] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showInvestmentModal, setShowInvestmentModal] = useState(false);

  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);

  // CARREGAR DADOS DA API
  const loadData = async () => {
    try {
      const response = await getTransactions();

      if (response.error) {
        Alert.alert("Erro", response.message);
        return;
      }

      setTransactions(response.data || []);

      // Calcular dashboard
      if (response.data && response.data.length > 0) {
        const dashboardData = calculateDashboardData(response.data);
        setDashboard(dashboardData);
      }
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      Alert.alert(
        "Erro",
        "Não foi possível carregar as transações. Verifique sua conexão."
      );

      // Se erro de autenticação, volta para login
      if (error.response?.status === 401) {
        handleLogout();
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleLogout = async () => {
    Alert.alert("Sair", "Deseja realmente sair?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Sair",
        style: "destructive",
        onPress: async () => {
          await clearSession();
          navigation.replace("Login");
        },
      },
    ]);
  };

  const formatCurrency = (value) => {
    return `R$ ${parseFloat(value).toFixed(2).replace(".", ",")}`;
  };

  const getTypeIcon = (typeId) => {
    switch (typeId) {
      case 1:
        return "💰"; // RECEITA
      case 2:
        return "💸"; // DESPESA
      case 3:
        return "📈"; // INVESTIMENTO
      default:
        return "❓";
    }
  };

  const getTypeColor = (typeId) => {
    switch (typeId) {
      case 1:
        return colors.success; // RECEITA - verde
      case 2:
        return colors.danger; // DESPESA - vermelho
      case 3:
        return colors.primary; // INVESTIMENTO - azul
      default:
        return colors.textSecondary;
    }
  };

  const getTypeName = (typeId) => {
    switch (typeId) {
      case 1:
        return "Receita";
      case 2:
        return "Despesa";
      case 3:
        return "Investimento";
      default:
        return "Desconhecido";
    }
  };

  // TELA DE LOADING
  if (loading) {
    return (
      <LinearGradient
        colors={["#f0f9ff", "#f8fafc"]}
        style={styles.loadingContainer}
      >
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Carregando suas finanças...</Text>
      </LinearGradient>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient colors={["#f0f9ff", "#f8fafc"]} style={styles.container}>
        {/* HEADER */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.greeting}>Olá, Usuário</Text>
              <Text style={styles.date}>
                {new Date().toLocaleDateString("pt-BR", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                })}
              </Text>
            </View>

            <TouchableOpacity
              onPress={handleLogout}
              style={styles.logoutButton}
            >
              <Ionicons
                name="log-out-outline"
                size={24}
                color={colors.danger}
              />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[colors.primary]}
            />
          }
        >
          {/* SALDO TOTAL */}
          <View style={styles.balanceCard}>
            <Text style={styles.balanceLabel}>Saldo Total</Text>
            <Text style={styles.balanceValue}>
              {formatCurrency(dashboard.balance)}
            </Text>

            <View style={styles.balanceDetails}>
              <View style={styles.detailItem}>
                <Text style={[styles.detailValue, { color: colors.success }]}>
                  + {formatCurrency(dashboard.income)}
                </Text>
                <Text style={styles.detailLabel}>Receitas</Text>
              </View>

              <View style={styles.separator} />

              <View style={styles.detailItem}>
                <Text style={[styles.detailValue, { color: colors.danger }]}>
                  - {formatCurrency(dashboard.expenses)}
                </Text>
                <Text style={styles.detailLabel}>Despesas</Text>
              </View>

              <View style={styles.separator} />

              <View style={styles.detailItem}>
                <Text style={[styles.detailValue, { color: colors.primary }]}>
                  {formatCurrency(dashboard.investments)}
                </Text>
                <Text style={styles.detailLabel}>Investimentos</Text>
              </View>
            </View>
          </View>

          {/* AÇÕES RÁPIDAS */}
          <View style={styles.actionsSection}>
            <Text style={styles.sectionTitle}>Ações Rápidas</Text>

            <View style={styles.actionsGrid}>
              {/* NOVA RECEITA */}
              <TouchableOpacity
                style={styles.actionCard}
                onPress={() => setShowIncomeModal(true)}
              >
                <View
                  style={[
                    styles.actionIcon,
                    { backgroundColor: colors.success + "20" },
                  ]}
                >
                  <MaterialIcons name="add" size={24} color={colors.success} />
                </View>
                <Text style={styles.actionText}>Nova Receita</Text>
              </TouchableOpacity>

              {/* NOVA DESPESA */}
              <TouchableOpacity
                style={styles.actionCard}
                onPress={() => setShowExpenseModal(true)}
              >
                <View
                  style={[
                    styles.actionIcon,
                    { backgroundColor: colors.danger + "20" },
                  ]}
                >
                  <MaterialIcons
                    name="remove"
                    size={24}
                    color={colors.danger}
                  />
                </View>
                <Text style={styles.actionText}>Nova Despesa</Text>
              </TouchableOpacity>

              {/* NOVO INVESTIMENTO */}
              <TouchableOpacity
                style={styles.actionCard}
                onPress={() => setShowInvestmentModal(true)}
              >
                <View
                  style={[
                    styles.actionIcon,
                    { backgroundColor: colors.primary + "20" },
                  ]}
                >
                  <FontAwesome5
                    name="chart-line"
                    size={20}
                    color={colors.primary}
                  />
                </View>
                <Text style={styles.actionText}>Investir</Text>
              </TouchableOpacity>

              {/* RELATÓRIOS (Placeholder) */}
              <TouchableOpacity style={styles.actionCard}>
                <View
                  style={[
                    styles.actionIcon,
                    { backgroundColor: colors.textSecondary + "20" },
                  ]}
                >
                  <MaterialIcons
                    name="list"
                    size={24}
                    color={colors.textSecondary}
                  />
                </View>
                <Text style={styles.actionText}>Relatórios</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* TRANSAÇÕES RECENTES */}
          <View style={styles.transactionsSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Transações Recentes</Text>
              <TouchableOpacity
                onPress={() => navigation.navigate("AllTransactions")}
              >
                <Text style={styles.seeAll}>Ver todas</Text>
              </TouchableOpacity>
            </View>

            {transactions.length === 0 ? (
              <View style={styles.emptyState}>
                <MaterialIcons
                  name="receipt"
                  size={48}
                  color={colors.textSecondary}
                />
                <Text style={styles.emptyText}>
                  Nenhuma transação encontrada
                </Text>
                <Text style={styles.emptySubtext}>
                  Adicione sua primeira transação
                </Text>
              </View>
            ) : (
              transactions.slice(0, 5).map((transaction) => (
                <TouchableOpacity
                  key={transaction.id}
                  style={styles.transactionCard}
                  onPress={() => {
                    setSelectedTransaction(transaction);
                    setShowDetailsModal(true);
                  }}
                >
                  <View style={styles.transactionLeft}>
                    <View
                      style={[
                        styles.typeIcon,
                        {
                          backgroundColor:
                            getTypeColor(transaction.typeId) + "20",
                        },
                      ]}
                    >
                      <Text style={{ fontSize: 20 }}>
                        {getTypeIcon(transaction.typeId)}
                      </Text>
                    </View>

                    <View>
                      <Text style={styles.transactionDescription}>
                        {transaction.description}
                      </Text>
                      <Text style={styles.transactionDate}>
                        {new Date(transaction.date).toLocaleDateString("pt-BR")}
                        {" • "}
                        <Text
                          style={{ color: getTypeColor(transaction.typeId) }}
                        >
                          {getTypeName(transaction.typeId)}
                        </Text>
                      </Text>
                    </View>
                  </View>

                  <View style={styles.transactionRight}>
                    <Text
                      style={[
                        styles.transactionValue,
                        {
                          color:
                            transaction.typeId === 1
                              ? colors.success
                              : colors.textPrimary,
                        },
                      ]}
                    >
                      {transaction.typeId === 1 ? "+ " : "- "}
                      {formatCurrency(transaction.value)}
                    </Text>
                    <View
                      style={[
                        styles.statusDot,
                        {
                          backgroundColor: transaction.status
                            ? colors.success
                            : colors.danger,
                        },
                      ]}
                    />
                  </View>
                </TouchableOpacity>
              ))
            )}
          </View>

          <View style={styles.spacer} />
        </ScrollView>
      </LinearGradient>
      {/* MODAL DE NOVA RECEITA */}
      <NewIncomeModal
        visible={showIncomeModal}
        onClose={() => setShowIncomeModal(false)}
        onSuccess={() => {
          setShowIncomeModal(false);
          loadData(); // Recarrega as transações
        }}
      />
      {/* MODAL DE NOVA DESPESA */}
      <NewExpenseModal
        visible={showExpenseModal}
        onClose={() => setShowExpenseModal(false)}
        onSuccess={() => {
          setShowExpenseModal(false);
          loadData(); // Recarrega as transações
        }}
      />
      {/* MODAL DE NOVO INVESTIMENTO */}
      <NewInvestmentModal
        visible={showInvestmentModal}
        onClose={() => setShowInvestmentModal(false)}
        onSuccess={() => {
          setShowInvestmentModal(false);
          loadData(); // Recarrega as transações
        }}
      />
      <TransactionDetailsModal
        visible={showDetailsModal}
        onClose={() => {
          setShowDetailsModal(false);
          setSelectedTransaction(null);
        }}
        transaction={selectedTransaction}
        onDeleteSuccess={() => {
          setShowDetailsModal(false);
          setSelectedTransaction(null);
          loadData(); // Recarrega a lista após excluir
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    color: colors.textSecondary,
    fontSize: 16,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  greeting: {
    fontSize: 24,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  date: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
  },
  logoutButton: {
    padding: 8,
  },
  balanceCard: {
    backgroundColor: colors.card,
    marginHorizontal: 20,
    marginTop: 10,
    marginBottom: 20,
    padding: 24,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 5,
    borderWidth: 1,
    borderColor: colors.border,
  },
  balanceLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  balanceValue: {
    fontSize: 36,
    fontWeight: "800",
    color: colors.textPrimary,
    marginBottom: 24,
  },
  balanceDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  detailItem: {
    alignItems: "center",
    flex: 1,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 4,
  },
  detailLabel: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  separator: {
    width: 1,
    height: 30,
    backgroundColor: colors.border,
  },
  actionsSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.textPrimary,
    marginBottom: 16,
  },
  actionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  actionCard: {
    width: "48%",
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  actionText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.textPrimary,
    textAlign: "center",
  },
  transactionsSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  seeAll: {
    color: colors.primary,
    fontWeight: "600",
    fontSize: 14,
  },
  emptyState: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 32,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: "600",
    color: colors.textPrimary,
  },
  emptySubtext: {
    marginTop: 4,
    fontSize: 14,
    color: colors.textSecondary,
  },
  transactionCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  transactionLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  typeIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  transactionDescription: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.textPrimary,
    marginBottom: 4,
  },
  transactionDate: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  transactionRight: {
    alignItems: "flex-end",
    flexDirection: "row",
    alignItems: "center",
  },
  transactionValue: {
    fontSize: 16,
    fontWeight: "700",
    marginRight: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  spacer: {
    height: 30,
  },
});
