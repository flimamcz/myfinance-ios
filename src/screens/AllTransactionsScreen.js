// screens/AllTransactionsScreen.js
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  TextInput,
  Modal,
  FlatList,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { colors } from "../theme/colors";
import { MaterialIcons, FontAwesome5, Ionicons } from "@expo/vector-icons";
import { getTransactions } from "../services/transaction";
import { clearSession } from "../services/session";
import TransactionDetailsModal from "../modals/TransactionDetailsModal";

export default function AllTransactionsScreen({ navigation }) {
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [filterType, setFilterType] = useState("all"); // 'all', 'income', 'expense', 'investment'
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);

  // Filtros disponíveis
  const filters = [
    { id: "all", label: "Todas", icon: "📊", color: colors.primary },
    { id: "income", label: "Receitas", icon: "💰", color: colors.success },
    { id: "expense", label: "Despesas", icon: "💸", color: colors.danger },
    {
      id: "investment",
      label: "Investimentos",
      icon: "📈",
      color: colors.primary,
    },
  ];

  const loadData = async () => {
    try {
      const response = await getTransactions();

      if (response.error) {
        Alert.alert("Erro", response.message);
        return;
      }

      setTransactions(response.data || []);
      setFilteredTransactions(response.data || []);
    } catch (error) {
      console.error("Erro ao carregar transações:", error);
      Alert.alert(
        "Erro",
        "Não foi possível carregar as transações. Verifique sua conexão."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    // Aplicar filtros quando transactions, searchText ou filterType mudar
    applyFilters();
  }, [transactions, searchText, filterType]);

  const applyFilters = () => {
    let filtered = [...transactions];

    // Filtro por tipo
    if (filterType !== "all") {
      const typeMap = {
        income: 1,
        expense: 2,
        investment: 3,
      };
      filtered = filtered.filter((t) => t.typeId === typeMap[filterType]);
    }

    // Filtro por busca
    if (searchText.trim()) {
      const searchLower = searchText.toLowerCase().trim();
      filtered = filtered.filter(
        (t) =>
          t.description.toLowerCase().includes(searchLower) ||
          t.value.toString().includes(searchText)
      );
    }

    // Ordenar por data (mais recente primeiro)
    filtered.sort((a, b) => new Date(b.date) - new Date(a.date));

    setFilteredTransactions(filtered);
  };

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

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("pt-BR");
  };

  const getTypeIcon = (typeId) => {
    switch (typeId) {
      case 1:
        return "💰";
      case 2:
        return "💸";
      case 3:
        return "📈";
      default:
        return "❓";
    }
  };

  const getTypeColor = (typeId) => {
    switch (typeId) {
      case 1:
        return colors.success;
      case 2:
        return colors.danger;
      case 3:
        return colors.primary;
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

  const getStatusColor = (status) => {
    return status ? colors.success : colors.danger;
  };

  const calculateTotals = () => {
    let income = 0;
    let expense = 0;
    let investment = 0;

    filteredTransactions.forEach((transaction) => {
      const value = parseFloat(transaction.value);
      switch (transaction.typeId) {
        case 1:
          income += value;
          break;
        case 2:
          expense += value;
          break;
        case 3:
          investment += value;
          break;
      }
    });

    return { income, expense, investment };
  };

  const totals = calculateTotals();

  const clearFilters = () => {
    setSearchText("");
    setFilterType("all");
  };

  if (loading) {
    return (
      <LinearGradient
        colors={["#f0f9ff", "#f8fafc"]}
        style={styles.loadingContainer}
      >
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Carregando transações...</Text>
      </LinearGradient>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient colors={["#f0f9ff", "#f8fafc"]} style={styles.container}>
        {/* HEADER */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.backButton}
            >
              <Ionicons
                name="arrow-back"
                size={24}
                color={colors.textPrimary}
              />
            </TouchableOpacity>

            <View style={styles.headerTitle}>
              <Text style={styles.greeting}>Todas as Transações</Text>
              <Text style={styles.count}>
                {filteredTransactions.length} transações
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

          {/* BARRA DE BUSCA */}
          <View style={styles.searchContainer}>
            <View style={styles.searchInputContainer}>
              <MaterialIcons
                name="search"
                size={20}
                color={colors.textSecondary}
              />
              <TextInput
                style={styles.searchInput}
                placeholder="Buscar transações..."
                placeholderTextColor={colors.textSecondary}
                value={searchText}
                onChangeText={setSearchText}
              />
              {searchText ? (
                <TouchableOpacity onPress={() => setSearchText("")}>
                  <MaterialIcons
                    name="close"
                    size={20}
                    color={colors.textSecondary}
                  />
                </TouchableOpacity>
              ) : null}
            </View>

            <TouchableOpacity
              style={styles.filterButton}
              onPress={() => setShowFilterModal(true)}
            >
              <MaterialIcons
                name="filter-list"
                size={24}
                color={colors.primary}
              />
            </TouchableOpacity>
          </View>

          {/* FILTROS ATIVOS */}
          {(searchText || filterType !== "all") && (
            <View style={styles.activeFilters}>
              <Text style={styles.activeFiltersText}>Filtros ativos:</Text>

              {filterType !== "all" && (
                <View style={styles.activeFilterTag}>
                  <Text style={styles.activeFilterText}>
                    {filters.find((f) => f.id === filterType)?.label}
                  </Text>
                  <TouchableOpacity onPress={() => setFilterType("all")}>
                    <MaterialIcons name="close" size={14} color="#fff" />
                  </TouchableOpacity>
                </View>
              )}

              {searchText && (
                <View style={styles.activeFilterTag}>
                  <Text style={styles.activeFilterText}>
                    Busca: "{searchText}"
                  </Text>
                  <TouchableOpacity onPress={() => setSearchText("")}>
                    <MaterialIcons name="close" size={14} color="#fff" />
                  </TouchableOpacity>
                </View>
              )}

              <TouchableOpacity
                onPress={clearFilters}
                style={styles.clearFiltersButton}
              >
                <Text style={styles.clearFiltersText}>Limpar filtros</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* RESUMO DOS TOTAIS */}
        <View style={styles.totalsCard}>
          <Text style={styles.totalsTitle}>Resumo Filtrado</Text>

          <View style={styles.totalsGrid}>
            <View style={styles.totalItem}>
              <Text style={[styles.totalValue, { color: colors.success }]}>
                + {formatCurrency(totals.income)}
              </Text>
              <Text style={styles.totalLabel}>Receitas</Text>
            </View>

            <View style={styles.totalItem}>
              <Text style={[styles.totalValue, { color: colors.danger }]}>
                - {formatCurrency(totals.expense)}
              </Text>
              <Text style={styles.totalLabel}>Despesas</Text>
            </View>

            <View style={styles.totalItem}>
              <Text style={[styles.totalValue, { color: colors.primary }]}>
                {formatCurrency(totals.investment)}
              </Text>
              <Text style={styles.totalLabel}>Investimentos</Text>
            </View>
          </View>
        </View>

        {/* LISTA DE TRANSAÇÕES */}
        <FlatList
          data={filteredTransactions}
          keyExtractor={(item) => item.id.toString()}
          showsVerticalScrollIndicator={false}
          refreshing={refreshing}
          onRefresh={onRefresh}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <MaterialIcons
                name="receipt"
                size={64}
                color={colors.textSecondary}
              />
              <Text style={styles.emptyText}>
                {transactions.length === 0
                  ? "Nenhuma transação encontrada"
                  : "Nenhuma transação corresponde aos filtros"}
              </Text>
              <Text style={styles.emptySubtext}>
                {transactions.length === 0
                  ? "Adicione sua primeira transação"
                  : "Tente alterar os filtros de busca"}
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.transactionCard}
              onPress={() => {
                setSelectedTransaction(item);
                setShowDetailsModal(true);
              }}
            >
              <View style={styles.transactionLeft}>
                <View
                  style={[
                    styles.typeIcon,
                    { backgroundColor: getTypeColor(item.typeId) + "20" },
                  ]}
                >
                  <Text style={{ fontSize: 20 }}>
                    {getTypeIcon(item.typeId)}
                  </Text>
                </View>

                <View style={styles.transactionInfo}>
                  <Text style={styles.transactionDescription} numberOfLines={1}>
                    {item.description}
                  </Text>
                  <View style={styles.transactionMeta}>
                    <Text style={styles.transactionDate}>
                      {formatDate(item.date)}
                    </Text>
                    <View style={styles.dot} />
                    <Text
                      style={[
                        styles.transactionType,
                        { color: getTypeColor(item.typeId) },
                      ]}
                    >
                      {getTypeName(item.typeId)}
                    </Text>
                  </View>
                </View>
              </View>

              <View style={styles.transactionRight}>
                <Text
                  style={[
                    styles.transactionValue,
                    {
                      color:
                        item.typeId === 1 ? colors.success : colors.textPrimary,
                    },
                  ]}
                >
                  {item.typeId === 1 ? "+ " : "- "}
                  {formatCurrency(item.value)}
                </Text>
                <View
                  style={[
                    styles.statusDot,
                    { backgroundColor: getStatusColor(item.status) },
                  ]}
                />
              </View>
            </TouchableOpacity>
          )}
        />
      </LinearGradient>

      {/* MODAL DE FILTROS */}
      <Modal
        visible={showFilterModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowFilterModal(false)}
      >
        <LinearGradient
          colors={["rgba(0,0,0,0.5)", "rgba(0,0,0,0.7)"]}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filtrar Transações</Text>
              <TouchableOpacity onPress={() => setShowFilterModal(false)}>
                <MaterialIcons
                  name="close"
                  size={24}
                  color={colors.textPrimary}
                />
              </TouchableOpacity>
            </View>

            <View style={styles.modalContent}>
              <Text style={styles.filterSectionTitle}>Tipo de Transação</Text>

              <View style={styles.filtersGrid}>
                {filters.map((filter) => (
                  <TouchableOpacity
                    key={filter.id}
                    style={[
                      styles.filterCard,
                      filterType === filter.id && styles.filterCardSelected,
                      {
                        borderColor:
                          filterType === filter.id
                            ? filter.color
                            : colors.border,
                      },
                    ]}
                    onPress={() => {
                      setFilterType(filter.id);
                      setShowFilterModal(false);
                    }}
                  >
                    <Text style={{ fontSize: 28, marginBottom: 8 }}>
                      {filter.icon}
                    </Text>
                    <Text
                      style={[
                        styles.filterLabel,
                        filterType === filter.id && {
                          color: filter.color,
                          fontWeight: "700",
                        },
                      ]}
                    >
                      {filter.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.filterSectionTitle}>Ordenar por</Text>

              <View style={styles.sortOptions}>
                {[
                  "data (recentes)",
                  "data (antigos)",
                  "valor (maior)",
                  "valor (menor)",
                ].map((option) => (
                  <TouchableOpacity key={option} style={styles.sortOption}>
                    <MaterialIcons
                      name="radio-button-unchecked"
                      size={20}
                      color={colors.border}
                    />
                    <Text style={styles.sortOptionText}>{option}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => setShowFilterModal(false)}
              >
                <Text style={styles.modalCancelText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalApplyButton}
                onPress={() => setShowFilterModal(false)}
              >
                <Text style={styles.modalApplyText}>Aplicar Filtros</Text>
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>
      </Modal>
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
          loadData(); // Recarrega a lista
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
    marginBottom: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.border,
  },
  headerTitle: {
    alignItems: "center",
  },
  greeting: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  count: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
  },
  logoutButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  searchContainer: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 12,
    fontSize: 16,
    color: colors.textPrimary,
  },
  filterButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
  },
  activeFilters: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 8,
    marginTop: 8,
  },
  activeFiltersText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  activeFilterTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  activeFilterText: {
    fontSize: 12,
    color: "#fff",
  },
  clearFiltersButton: {
    marginLeft: "auto",
  },
  clearFiltersText: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: "600",
  },
  totalsCard: {
    backgroundColor: colors.card,
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  totalsTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.textPrimary,
    marginBottom: 16,
  },
  totalsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  totalItem: {
    alignItems: "center",
    flex: 1,
  },
  totalValue: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 4,
  },
  totalLabel: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 30,
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
  transactionInfo: {
    flex: 1,
  },
  transactionDescription: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.textPrimary,
    marginBottom: 4,
  },
  transactionMeta: {
    flexDirection: "row",
    alignItems: "center",
  },
  transactionDate: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  dot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: colors.textSecondary,
    marginHorizontal: 6,
  },
  transactionType: {
    fontSize: 12,
    fontWeight: "600",
  },
  transactionRight: {
    alignItems: "flex-end",
  },
  transactionValue: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 4,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.textPrimary,
    marginTop: 16,
    textAlign: "center",
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 8,
    textAlign: "center",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  modalContainer: {
    backgroundColor: colors.bg,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    maxHeight: "80%",
    marginTop: 50,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  modalContent: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 24,
  },
  filterSectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.textPrimary,
    marginBottom: 16,
  },
  filtersGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 24,
  },
  filterCard: {
    width: "48%",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    borderWidth: 2,
    borderColor: colors.border,
  },
  filterCardSelected: {
    backgroundColor: "#f8fafc",
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.textPrimary,
    textAlign: "center",
  },
  sortOptions: {
    gap: 12,
  },
  sortOption: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
  },
  sortOptionText: {
    fontSize: 16,
    color: colors.textPrimary,
  },
  modalFooter: {
    flexDirection: "row",
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: 12,
  },
  modalCancelButton: {
    flex: 1,
    padding: 18,
    borderRadius: 14,
    alignItems: "center",
    backgroundColor: colors.border,
  },
  modalCancelText: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.textSecondary,
  },
  modalApplyButton: {
    flex: 2,
    padding: 18,
    borderRadius: 14,
    alignItems: "center",
    backgroundColor: colors.primary,
  },
  modalApplyText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
  },
});
