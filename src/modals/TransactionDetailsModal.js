// TransactionDetailsModal.js - VERSÃO TOTALMENTE CORRIGIDA
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
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { colors } from "../theme/colors";
import { MaterialIcons, FontAwesome5, Ionicons } from "@expo/vector-icons";
import { deleteTransaction } from "../services/transaction";

export default function TransactionDetailsModal({ 
  visible, 
  onClose, 
  transaction,
  onDeleteSuccess 
}) {
  // ✅ CORREÇÃO: Verificar BOTH visible E transaction
  if (!visible || !transaction) return null;

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
      minute: "2-digit"
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
          bgColor: colors.success + "20"
        };
      case 2:
        return {
          label: "Despesa",
          color: colors.danger,
          icon: "💸",
          verb: "gasto",
          bgColor: colors.danger + "20"
        };
      case 3:
        return {
          label: "Investimento",
          color: colors.primary,
          icon: "📈",
          verb: "investido",
          bgColor: colors.primary + "20"
        };
      default:
        return {
          label: "Transação",
          color: colors.textSecondary,
          icon: "❓",
          verb: "realizado",
          bgColor: colors.border
        };
    }
  };

  const getStatusInfo = (status) => {
    return status ? {
      label: "Ativa",
      color: colors.success,
      icon: "✓"
    } : {
      label: "Inativa/Cancelada",
      color: colors.danger,
      icon: "✗"
    };
  };

  const typeInfo = getTypeInfo(transaction.typeId);
  const statusInfo = getStatusInfo(transaction.status);

  const handleShare = async () => {
    try {
      const shareMessage = `📊 Detalhes da Transação:\n\n` +
        `💰 Valor: ${formatCurrency(transaction.value)}\n` +
        `📝 Descrição: ${transaction.description}\n` +
        `📅 Data: ${formatDate(transaction.date)}\n` +
        `🎯 Tipo: ${typeInfo.label}\n` +
        `📊 Status: ${statusInfo.label}\n\n` +
        `👉 Registrado no Meu Finance App`;

      await Share.share({
        message: shareMessage,
        title: 'Compartilhar Transação'
      });
    } catch (error) {
      console.error("Erro ao compartilhar:", error);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      "Confirmar exclusão",
      `Tem certeza que deseja excluir esta transação?\n\n"${transaction.description}"\n${formatCurrency(transaction.value)}`,
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
          }
        }
      ]
    );
  };

  const handleEdit = () => {
    Alert.alert(
      "Editar Transação",
      "Funcionalidade em desenvolvimento! 🚧",
      [{ text: "OK" }]
    );
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
                <Text style={styles.typeEmoji}>{typeInfo.icon}</Text>
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
            </View>
            
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <MaterialIcons name="close" size={24} color={colors.textPrimary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            {/* CARD DE DETALHES */}
            <View style={styles.detailsCard}>
              <Text style={styles.cardTitle}>📋 Detalhes da Transação</Text>
              
              {/* DATA */}
              <View style={styles.detailRow}>
                <View style={styles.detailIcon}>
                  <MaterialIcons name="calendar-today" size={20} color={colors.primary} />
                </View>
                <View style={styles.detailInfo}>
                  <Text style={styles.detailLabel}>Data e Hora</Text>
                  <Text style={styles.detailValue}>{formatDate(transaction.date)}</Text>
                </View>
              </View>

              {/* STATUS */}
              <View style={styles.detailRow}>
                <View style={styles.detailIcon}>
                  <MaterialIcons name="circle" size={20} color={statusInfo.color} />
                </View>
                <View style={styles.detailInfo}>
                  <Text style={styles.detailLabel}>Status</Text>
                  <Text style={[styles.detailValue, { color: statusInfo.color }]}>
                    {statusInfo.icon} {statusInfo.label}
                  </Text>
                </View>
              </View>

              {/* ID DA TRANSAÇÃO */}
              <View style={styles.detailRow}>
                <View style={styles.detailIcon}>
                  <MaterialIcons name="fingerprint" size={20} color={colors.textSecondary} />
                </View>
                <View style={styles.detailInfo}>
                  <Text style={styles.detailLabel}>ID da Transação</Text>
                  <Text style={styles.detailValue}>#{transaction.id}</Text>
                </View>
              </View>

              {/* VALOR COMPLETO */}
              <View style={styles.detailRow}>
                <View style={styles.detailIcon}>
                  <MaterialIcons name="attach-money" size={20} color={typeInfo.color} />
                </View>
                <View style={styles.detailInfo}>
                  <Text style={styles.detailLabel}>Valor</Text>
                  <Text style={[styles.detailValue, { color: typeInfo.color, fontSize: 18, fontWeight: '700' }]}>
                    {formatCurrency(transaction.value)}
                  </Text>
                </View>
              </View>
            </View>

            {/* CARD DE ANÁLISE */}
            <View style={styles.analysisCard}>
              <Text style={styles.cardTitle}>📊 Análise</Text>
              
              <View style={styles.analysisItem}>
                <Text style={styles.analysisLabel}>Tipo de movimento:</Text>
                <Text style={[styles.analysisValue, { color: typeInfo.color }]}>
                  {transaction.typeId === 1 ? "Entrada (Receita)" : "Saída"}
                </Text>
              </View>
              
              <View style={styles.analysisItem}>
                <Text style={styles.analysisLabel}>Impacto no saldo:</Text>
                <Text style={[styles.analysisValue, { 
                  color: transaction.typeId === 1 ? colors.success : colors.danger 
                }]}>
                  {transaction.typeId === 1 ? "+ Adicionou ao saldo" : '- Reduziu o saldo'}
                </Text>
              </View>
              
              <View style={styles.analysisItem}>
                <Text style={styles.analysisLabel}>Descrição completa:</Text>
                <Text style={styles.analysisDescription}>
                  {transaction.description}
                </Text>
              </View>
            </View>

            {/* DICAS/INFORMAÇÕES */}
            <View style={styles.tipsCard}>
              <MaterialIcons name="lightbulb" size={20} color="#f59e0b" />
              <Text style={styles.tipText}>
                {transaction.typeId === 1 
                  ? "Receitas regulares ajudam a manter uma saúde financeira estável."
                  : transaction.typeId === 2
                  ? "Tente categorizar suas despesas para melhor controle."
                  : "Investimentos de longo prazo geralmente trazem melhores retornos."}
              </Text>
            </View>
          </ScrollView>

          {/* AÇÕES RÁPIDAS */}
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
              <Text style={[styles.actionText, { color: '#f59e0b' }]}>
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

          {/* FOOTER */}
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
  typeEmoji: {
    fontSize: 40,
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
    backgroundColor: colors.border,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
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