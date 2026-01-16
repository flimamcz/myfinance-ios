// TransactionDetailsModal.js - VERSÃO CORRIGIDA
import React from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Share,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { colors } from "../theme/colors";
import { MaterialIcons } from "@expo/vector-icons";
import { deleteTransaction } from "../services/transaction";

export default function TransactionDetailsModal({
  visible,
  onClose,
  transaction,
  onDeleteSuccess,
}) {
  if (!visible || !transaction) return null;

  // ✅ CORREÇÃO: Acessa category do objeto transaction
  const getCategoryInfo = () => {
    if (transaction.category) {
      return {
        name: transaction.category.name,
        icon: transaction.category.icon,
        color: transaction.category.color,
        id: transaction.category.id,
        source: "backend",
      };
    }

    // Fallback se não tiver category no objeto
    return {
      name: "Não categorizada",
      icon: "📄",
      color: colors.textSecondary,
      id: 0,
      source: "fallback",
    };
  };

  const categoryInfo = getCategoryInfo();

  const formatCurrency = (value) => {
    return `R$ ${parseFloat(value).toFixed(2).replace(".", ",")}`;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("pt-BR", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getTypeInfo = (typeId) => {
    switch (typeId) {
      case 1:
        return {
          label: "Receita",
          color: colors.success,
          icon: "💰",
          verb: "recebido",
          bgColor: colors.success + "20",
        };
      case 2:
        return {
          label: "Despesa",
          color: colors.danger,
          icon: "💸",
          verb: "gasto",
          bgColor: colors.danger + "20",
        };
      case 3:
        return {
          label: "Investimento",
          color: colors.primary,
          icon: "📈",
          verb: "investido",
          bgColor: colors.primary + "20",
        };
      default:
        return {
          label: "Transação",
          color: colors.textSecondary,
          icon: "❓",
          verb: "realizado",
          bgColor: colors.border,
        };
    }
  };

  const getStatusInfo = (status) => {
    return status
      ? {
          label: "Ativa",
          color: colors.success,
          icon: "✓",
        }
      : {
          label: "Inativa/Cancelada",
          color: colors.danger,
          icon: "✗",
        };
  };

  const typeInfo = getTypeInfo(transaction.typeId);
  const statusInfo = getStatusInfo(transaction.status);

  const handleShare = async () => {
    try {
      const shareMessage =
        `📊 Detalhes da Transação:\n\n` +
        `💰 Valor: ${formatCurrency(transaction.value)}\n` +
        `📝 Descrição: ${transaction.description}\n` +
        `🏷️ Categoria: ${categoryInfo.name} ${categoryInfo.icon}\n` +
        `📅 Data: ${formatDate(transaction.date)}\n` +
        `🎯 Tipo: ${typeInfo.label}\n` +
        `📊 Status: ${statusInfo.label}\n\n` +
        `👉 Registrado no Meu Finance App`;

      await Share.share({
        message: shareMessage,
        title: "Compartilhar Transação",
      });
    } catch (error) {
      console.error("Erro ao compartilhar:", error);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      "Confirmar exclusão",
      `Tem certeza que deseja excluir esta transação?\n\n"${
        transaction.description
      }"\n${formatCurrency(transaction.value)}\n\nCategoria: ${
        categoryInfo.name
      } ${categoryInfo.icon}`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Excluir",
          style: "destructive",
          onPress: async () => {
            try {
              const response = await deleteTransaction(transaction.id);

              if (response.error) {
                Alert.alert("Erro", response.message);
                return;
              }

              Alert.alert("Sucesso", "Transação excluída com sucesso!");
              onDeleteSuccess();
              onClose();
            } catch (error) {
              console.error("Erro ao excluir:", error);
              Alert.alert("Erro", "Não foi possível excluir a transação.");
            }
          },
        },
      ]
    );
  };

  const handleEdit = () => {
    Alert.alert("Editar Transação", "Funcionalidade em desenvolvimento! 🚧", [
      { text: "OK" },
    ]);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <LinearGradient
        colors={["rgba(0,0,0,0.5)", "rgba(0,0,0,0.7)"]}
        style={styles.modalOverlay}
      >
        <View style={styles.modalContainer}>
          <View style={[styles.header, { backgroundColor: typeInfo.bgColor }]}>
            <View style={styles.headerContent}>
              <View style={styles.typeIconContainer}>
                <View
                  style={[
                    styles.categoryIconHeader,
                    { backgroundColor: categoryInfo.color + "20" },
                  ]}
                >
                  <Text style={styles.categoryEmojiHeader}>
                    {categoryInfo.icon}
                  </Text>
                </View>
                <View style={styles.typeBadge}>
                  <Text style={[styles.typeText, { color: typeInfo.color }]}>
                    {typeInfo.label}
                  </Text>
                </View>
              </View>

              <Text style={styles.headerValue}>
                {transaction.typeId === 1 ? "+ " : "- "}
                {formatCurrency(transaction.value)}
              </Text>

              <Text style={styles.headerDescription}>
                {transaction.description}
              </Text>

              <View style={styles.categoryBadgeHeader}>
                <Text
                  style={[
                    styles.categoryNameHeader,
                    { color: categoryInfo.color },
                  ]}
                >
                  {categoryInfo.name}
                </Text>
              </View>
            </View>

            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <MaterialIcons
                name="close"
                size={24}
                color={colors.textPrimary}
              />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.detailsCard}>
              <Text style={styles.cardTitle}>📋 Detalhes da Transação</Text>

              <View style={styles.detailRow}>
                <View
                  style={[
                    styles.detailIcon,
                    { backgroundColor: categoryInfo.color + "20" },
                  ]}
                >
                  <Text
                    style={[
                      styles.categoryEmoji,
                      { color: categoryInfo.color },
                    ]}
                  >
                    {categoryInfo.icon}
                  </Text>
                </View>
                <View style={styles.detailInfo}>
                  <Text style={styles.detailLabel}>Categoria</Text>
                  <View style={styles.categoryInfoContainer}>
                    <Text
                      style={[
                        styles.detailValue,
                        { color: categoryInfo.color },
                      ]}
                    >
                      {categoryInfo.name}
                    </Text>
                    <View style={styles.categoryIdBadge}>
                      <Text style={styles.categoryIdText}>
                        ID: {categoryInfo.id}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>

              <View style={styles.detailRow}>
                <View style={styles.detailIcon}>
                  <MaterialIcons
                    name="calendar-today"
                    size={20}
                    color={colors.primary}
                  />
                </View>
                <View style={styles.detailInfo}>
                  <Text style={styles.detailLabel}>Data e Hora</Text>
                  <Text style={styles.detailValue}>
                    {formatDate(transaction.date)}
                  </Text>
                </View>
              </View>

              <View style={styles.detailRow}>
                <View style={styles.detailIcon}>
                  <MaterialIcons
                    name="circle"
                    size={20}
                    color={statusInfo.color}
                  />
                </View>
                <View style={styles.detailInfo}>
                  <Text style={styles.detailLabel}>Status</Text>
                  <Text
                    style={[styles.detailValue, { color: statusInfo.color }]}
                  >
                    {statusInfo.icon} {statusInfo.label}
                  </Text>
                </View>
              </View>

              <View style={styles.detailRow}>
                <View style={styles.detailIcon}>
                  <MaterialIcons
                    name="fingerprint"
                    size={20}
                    color={colors.textSecondary}
                  />
                </View>
                <View style={styles.detailInfo}>
                  <Text style={styles.detailLabel}>ID da Transação</Text>
                  <Text style={styles.detailValue}>#{transaction.id}</Text>
                </View>
              </View>

              <View style={styles.detailRow}>
                <View style={styles.detailIcon}>
                  <MaterialIcons
                    name="attach-money"
                    size={20}
                    color={typeInfo.color}
                  />
                </View>
                <View style={styles.detailInfo}>
                  <Text style={styles.detailLabel}>Valor</Text>
                  <Text
                    style={[
                      styles.detailValue,
                      {
                        color: typeInfo.color,
                        fontSize: 18,
                        fontWeight: "700",
                      },
                    ]}
                  >
                    {formatCurrency(transaction.value)}
                  </Text>
                </View>
              </View>

              <View style={styles.detailRow}>
                <View style={styles.detailIcon}>
                  <MaterialIcons
                    name="category"
                    size={20}
                    color={typeInfo.color}
                  />
                </View>
                <View style={styles.detailInfo}>
                  <Text style={styles.detailLabel}>Tipo</Text>
                  <Text style={[styles.detailValue, { color: typeInfo.color }]}>
                    {typeInfo.label} ({typeInfo.verb})
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.analysisCard}>
              <Text style={styles.cardTitle}>📊 Análise</Text>

              <View style={styles.analysisItem}>
                <Text style={styles.analysisLabel}>Tipo de movimento:</Text>
                <Text style={[styles.analysisValue, { color: typeInfo.color }]}>
                  {transaction.typeId === 1 ? "Entrada (Receita)" : "Saída"}
                </Text>
              </View>

              <View style={styles.analysisItem}>
                <Text style={styles.analysisLabel}>Categoria:</Text>
                <View style={styles.categoryAnalysis}>
                  <View
                    style={[
                      styles.categoryEmojiAnalysis,
                      { backgroundColor: categoryInfo.color + "20" },
                    ]}
                  >
                    <Text style={{ fontSize: 16 }}>{categoryInfo.icon}</Text>
                  </View>
                  <Text
                    style={[
                      styles.analysisValue,
                      { color: categoryInfo.color },
                    ]}
                  >
                    {categoryInfo.name}
                  </Text>
                </View>
              </View>

              <View style={styles.analysisItem}>
                <Text style={styles.analysisLabel}>Impacto no saldo:</Text>
                <Text
                  style={[
                    styles.analysisValue,
                    {
                      color:
                        transaction.typeId === 1
                          ? colors.success
                          : colors.danger,
                    },
                  ]}
                >
                  {transaction.typeId === 1
                    ? "+ Adicionou ao saldo"
                    : "- Reduziu o saldo"}
                </Text>
              </View>

              <View style={styles.analysisItem}>
                <Text style={styles.analysisLabel}>Descrição completa:</Text>
                <Text style={styles.analysisDescription}>
                  {transaction.description}
                </Text>
              </View>
            </View>

            <View style={styles.tipsCard}>
              <MaterialIcons name="lightbulb" size={20} color="#f59e0b" />
              <Text style={styles.tipText}>
                {getCategoryTip(categoryInfo.name, transaction.typeId)}
              </Text>
            </View>
          </ScrollView>

          <View style={styles.actionsContainer}>
            <TouchableOpacity
              style={[styles.actionButton, styles.shareButton]}
              onPress={handleShare}
            >
              <MaterialIcons name="share" size={20} color={colors.primary} />
              <Text style={[styles.actionText, { color: colors.primary }]}>
                Compartilhar
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.editButton]}
              onPress={handleEdit}
            >
              <MaterialIcons name="edit" size={20} color="#f59e0b" />
              <Text style={[styles.actionText, { color: "#f59e0b" }]}>
                Editar
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.deleteButton]}
              onPress={handleDelete}
            >
              <MaterialIcons name="delete" size={20} color={colors.danger} />
              <Text style={[styles.actionText, { color: colors.danger }]}>
                Excluir
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.closeFooterButton}
              onPress={onClose}
            >
              <Text style={styles.closeFooterText}>Fechar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>
    </Modal>
  );
}

// TransactionDetailsModal.js - ATUALIZE A FUNÇÃO getCategoryTip
const getCategoryTip = (categoryName, typeId) => {
  const tips = {
    // Dicas para Receitas (typeId: 1)
    Salário: "Considere automatizar parte do seu salário para investimentos.",
    Freelance:
      "Freelances são ótimos para renda extra. Mantenha um controle das horas trabalhadas.",
    Venda: "Vendas ocasionais podem se tornar uma fonte de renda constante.",
    Investimento:
      "Reinvestir os rendimentos acelera o crescimento do seu patrimônio.",
    Presente:
      "Presentes são bônus! Considere poupar parte para objetivos futuros.",
    Reembolso: "Reembolsos ajudam a recuperar gastos inesperados.",
    Outros:
      "Registre todas as receitas, mesmo as pequenas, para ter um controle completo.",

    // Dicas para Despesas (typeId: 2)
    Alimentação:
      "Planeje suas compras de supermercado para evitar desperdícios e compras por impulso.",
    Transporte:
      "Avalie se vale a pena usar transporte público ou compartilhado para economizar.",
    Moradia:
      "Aluguel/hipoteca geralmente é sua maior despesa fixa. Tente negociar valores quando possível.",
    Lazer:
      "Lazer é importante para qualidade de vida, mas tente manter abaixo de 10% da sua renda mensal.",
    Saúde:
      "Invista em prevenção (check-ups, exercícios) para economizar em tratamentos futuros.",
    Educação:
      "Educação é um investimento que sempre tem retorno a longo prazo.",
    Compras:
      "Espere 24h antes de compras impulsivas acima de R$ 100 para avaliar real necessidade.",
    Serviços:
      "Compare preços e avalie contratos anuais para serviços como internet e telefone.",
    Assinaturas:
      "Revise suas assinaturas mensalmente e cancele as que não usa regularmente.",

    // Dicas para Investimentos (typeId: 3)
    "Tesouro Direto":
      "Ótimo para reserva de emergência ou objetivos de curto/médio prazo com baixo risco.",
    CDB: "CDBs com liquidez diária são bons para reserva, mas compare taxas entre bancos.",
    Ações:
      "Diversifique seus investimentos em ações de diferentes setores para reduzir riscos.",
    FIIs: "Fundos Imobiliários podem proporcionar renda passiva mensal através de aluguéis.",
    ETF: "ETFs são uma forma prática de investir em uma cesta de ações com baixa taxa.",
    Criptomoedas:
      "Criptomoedas são voláteis. Invista apenas o que está disposto a perder completamente.",
    Previdência:
      "Previdência privada tem vantagens fiscais para prazos muito longos (10+ anos).",

    // Categoria padrão
    "Não categorizada":
      "Categorize suas transações para ter melhor controle e análise financeira.",

    // Dica genérica baseada no tipo
    default:
      typeId === 1
        ? "Receitas regulares ajudam a manter uma saúde financeira estável. Tente aumentar fontes de renda passiva."
        : typeId === 2
        ? "Controle suas despesas para alcançar seus objetivos financeiros. Analise onde pode reduzir gastos."
        : "Investimentos consistentes são a chave para o crescimento patrimonial. Invista regularmente.",
  };

  return tips[categoryName] || tips.default;
};
const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  modalContainer: {
    backgroundColor: colors.bg,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    maxHeight: "90%",
    marginTop: 50,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 20,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  headerContent: {
    alignItems: "center",
  },
  typeIconContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 10,
  },
  categoryIconHeader: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  categoryEmojiHeader: {
    fontSize: 24,
  },
  typeBadge: {
    backgroundColor: "rgba(255,255,255,0.9)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  typeText: {
    fontSize: 14,
    fontWeight: "700",
  },
  headerValue: {
    fontSize: 36,
    fontWeight: "800",
    color: colors.textPrimary,
    marginBottom: 8,
  },
  headerDescription: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: "center",
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  categoryBadgeHeader: {
    backgroundColor: "rgba(255,255,255,0.9)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  categoryNameHeader: {
    fontSize: 14,
    fontWeight: "600",
  },
  closeButton: {
    position: "absolute",
    top: 24,
    right: 24,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.9)",
  },
  modalContent: {
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  detailsCard: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.textPrimary,
    marginBottom: 20,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  detailIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  categoryEmoji: {
    fontSize: 20,
  },
  detailInfo: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.textPrimary,
  },
  categoryInfoContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  categoryIdBadge: {
    backgroundColor: colors.border,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  categoryIdText: {
    fontSize: 10,
    color: colors.textSecondary,
  },
  analysisCard: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  analysisItem: {
    marginBottom: 14,
  },
  analysisLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  analysisValue: {
    fontSize: 16,
    fontWeight: "600",
  },
  categoryAnalysis: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 4,
  },
  categoryEmojiAnalysis: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  analysisDescription: {
    fontSize: 16,
    color: colors.textPrimary,
    lineHeight: 22,
    marginTop: 4,
  },
  tipsCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#fffbeb",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#f59e0b30",
    marginBottom: 20,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    color: "#92400e",
    lineHeight: 20,
  },
  actionsContainer: {
    flexDirection: "row",
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: 12,
    borderRadius: 12,
    backgroundColor: colors.border,
  },
  shareButton: {
    backgroundColor: "#e0e7ff",
  },
  editButton: {
    backgroundColor: "#fef3c7",
  },
  deleteButton: {
    backgroundColor: "#fee2e2",
  },
  actionText: {
    fontSize: 14,
    fontWeight: "600",
  },
  footer: {
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  closeFooterButton: {
    padding: 16,
    borderRadius: 14,
    alignItems: "center",
    backgroundColor: colors.primary,
  },
  closeFooterText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
  },
});
