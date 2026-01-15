import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { colors } from "../theme/colors";
import { MaterialIcons, FontAwesome5 } from "@expo/vector-icons";
import { createTransaction } from "../services/transaction";

export default function NewExpenseModal({ visible, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    value: "",
    description: "",
    date: new Date().toISOString().split("T")[0], 
  });

  const handleInputChange = (field, value) => {
    setFormData({
      ...formData,
      [field]: value,
    });
  };

  const formatCurrencyInput = (text) => {
    let numericValue = text.replace(/[^0-9]/g, "");
    
    if (numericValue) {
      const value = (parseInt(numericValue) / 100).toFixed(2);
      return value.replace(".", ",");
    }
    
    return "";
  };

  const handleValueChange = (text) => {
    const formatted = formatCurrencyInput(text);
    handleInputChange("value", formatted);
  };

  const getNumericValue = () => {
    if (!formData.value) return "0";
    return formData.value.replace(",", ".");
  };

  const handleSubmit = async () => {
    if (!formData.value || parseFloat(getNumericValue()) <= 0) {
      Alert.alert("Erro", "Informe um valor válido para a despesa");
      return;
    }

    if (!formData.description.trim()) {
      Alert.alert("Erro", "Informe uma descrição para a despesa");
      return;
    }

    try {
      setLoading(true);

      const transactionData = {
        value: getNumericValue(),
        typeId: 2,
        description: formData.description.trim(),
        date: formData.date,
        status: true, 
      };

      console.log("📤 Enviando nova despesa:", transactionData);

      const response = await createTransaction(transactionData);

      if (response.error) {
        Alert.alert("Erro", response.message || "Não foi possível criar a despesa");
        return;
      }

      Alert.alert(
        "Despesa registrada!",
        "Sua despesa foi adicionada com sucesso!",
        [
          {
            text: "OK",
            onPress: () => {
              resetForm();
              onSuccess();
            },
          },
        ]
      );

    } catch (error) {
      console.error("Erro ao criar despesa:", error);
      Alert.alert(
        "Erro",
        error.response?.data?.message || "Erro ao salvar despesa. Tente novamente."
      );
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      value: "",
      description: "",
      date: new Date().toISOString().split("T")[0],
    });
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const expenseSuggestions = [
    "Alimentação", "Transporte", "Moradia", "Lazer", 
    "Saúde", "Educação", "Compras", "Serviços"
  ];

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.modalOverlay}
      >
        <LinearGradient
          colors={["rgba(0,0,0,0.5)", "rgba(0,0,0,0.7)"]}
          style={styles.modalBackground}
        >
          <View style={styles.modalContainer}>
            {/* HEADER DO MODAL */}
            <View style={styles.modalHeader}>
              <View style={styles.headerTitleContainer}>
                <View style={[styles.iconContainer, { backgroundColor: "#ef444420" }]}>
                  <MaterialIcons name="money-off" size={24} color={colors.danger} />
                </View>
                <View>
                  <Text style={styles.modalTitle}>Nova Despesa</Text>
                  <Text style={styles.modalSubtitle}>Registre uma nova saída</Text>
                </View>
              </View>
              
              <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                <MaterialIcons name="close" size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView 
              style={styles.modalContent}
              showsVerticalScrollIndicator={false}
            >
              {/* CARD DO FORMULÁRIO */}
              <View style={styles.formCard}>
                {/* VALOR */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Valor (R$)</Text>
                  <View style={styles.valueInputContainer}>
                    <Text style={styles.currencySymbol}>R$</Text>
                    <TextInput
                      style={styles.valueInput}
                      placeholder="0,00"
                      placeholderTextColor={colors.textSecondary + "80"}
                      keyboardType="numeric"
                      value={formData.value}
                      onChangeText={handleValueChange}
                      editable={!loading}
                    />
                  </View>
                </View>

                {/* DESCRIÇÃO */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Descrição</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Ex: Supermercado, Combustível, Aluguel..."
                    placeholderTextColor={colors.textSecondary + "80"}
                    value={formData.description}
                    onChangeText={(text) => handleInputChange("description", text)}
                    editable={!loading}
                    multiline
                    maxLength={100}
                  />
                  <Text style={styles.charCount}>
                    {formData.description.length}/100
                  </Text>
                </View>

                {/* SUGESTÕES RÁPIDAS */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Sugestões rápidas</Text>
                  <View style={styles.suggestionsContainer}>
                    {expenseSuggestions.map((suggestion, index) => (
                      <TouchableOpacity
                        key={index}
                        style={styles.suggestionChip}
                        onPress={() => handleInputChange("description", suggestion)}
                      >
                        <Text style={styles.suggestionText}>{suggestion}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {/* DATA */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Data</Text>
                  <View style={styles.dateContainer}>
                    <MaterialIcons name="calendar-today" size={20} color={colors.primary} />
                    <Text style={styles.dateText}>
                      {new Date(formData.date).toLocaleDateString("pt-BR", {
                        weekday: "long",
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </Text>
                  </View>
                  <Text style={styles.dateHint}>
                    Data atual selecionada automaticamente
                  </Text>
                </View>

                {/* PAGAMENTO (Futura implementação) */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Forma de Pagamento (Opcional)</Text>
                  <TouchableOpacity 
                    style={styles.categoryButton}
                    disabled={true}
                  >
                    <Text style={styles.categoryButtonText}>Selecionar</Text>
                    <MaterialIcons name="arrow-forward-ios" size={16} color={colors.textSecondary} />
                  </TouchableOpacity>
                  <Text style={styles.hintText}>
                    Cartão, Dinheiro, PIX em breve
                  </Text>
                </View>

                {/* É UMA DESPESA FIXA? */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Despesa fixa?</Text>
                  <View style={styles.fixedExpenseContainer}>
                    <TouchableOpacity style={styles.fixedOption}>
                      <View style={[
                        styles.radioCircle,
                        { borderColor: colors.primary }
                      ]}>
                        <View style={styles.radioInnerCircle} />
                      </View>
                      <Text style={styles.radioLabel}>Sim (mensal)</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity style={styles.fixedOption}>
                      <View style={[
                        styles.radioCircle,
                        { borderColor: colors.border }
                      ]} />
                      <Text style={styles.radioLabel}>Não (única)</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>

              {/* RECIBO PREVIEW */}
              <View style={styles.receiptPreview}>
                <Text style={styles.receiptTitle}>📋 Resumo da Despesa</Text>
                
                <View style={styles.receiptRow}>
                  <Text style={styles.receiptLabel}>Valor:</Text>
                  <Text style={[styles.receiptValue, { color: colors.danger }]}>
                    {formData.value ? `R$ ${formData.value}` : "R$ 0,00"}
                  </Text>
                </View>
                
                <View style={styles.receiptRow}>
                  <Text style={styles.receiptLabel}>Descrição:</Text>
                  <Text style={styles.receiptValue} numberOfLines={2}>
                    {formData.description || "Não informada"}
                  </Text>
                </View>
                
                <View style={styles.receiptRow}>
                  <Text style={styles.receiptLabel}>Data:</Text>
                  <Text style={styles.receiptValue}>
                    {new Date(formData.date).toLocaleDateString("pt-BR")}
                  </Text>
                </View>
                
                <View style={styles.receiptRow}>
                  <Text style={styles.receiptLabel}>Tipo:</Text>
                  <View style={[styles.typeBadge, { backgroundColor: "#ef444420" }]}>
                    <Text style={[styles.typeBadgeText, { color: colors.danger }]}>
                      DESPESA
                    </Text>
                  </View>
                </View>
              </View>

              {/* DICA DE ECONOMIA */}
              <View style={styles.tipContainer}>
                <MaterialIcons name="lightbulb" size={20} color="#f59e0b" />
                <Text style={styles.tipText}>
                  Dica: Despesas menores que 3% da sua renda mensal geralmente são saudáveis.
                </Text>
              </View>
            </ScrollView>

            {/* FOOTER DO MODAL */}
            <View style={styles.modalFooter}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={handleClose}
                disabled={loading}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[
                  styles.submitButton,
                  (!formData.value || !formData.description) && styles.submitButtonDisabled
                ]}
                onPress={handleSubmit}
                disabled={loading || !formData.value || !formData.description}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <MaterialIcons name="check" size={20} color="#fff" />
                    <Text style={styles.submitButtonText}>Registrar Despesa</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  modalBackground: {
    flex: 1,
  },
  modalContainer: {
    backgroundColor: colors.bg,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    maxHeight: "90%",
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
  headerTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  modalSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 2,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.border,
  },
  modalContent: {
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  formCard: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.textPrimary,
    marginBottom: 8,
  },
  valueInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 2,
    borderColor: colors.danger + "40",
    borderRadius: 16,
    backgroundColor: "#fff",
    paddingHorizontal: 16,
  },
  currencySymbol: {
    fontSize: 24,
    fontWeight: "700",
    color: colors.danger,
    marginRight: 8,
  },
  valueInput: {
    flex: 1,
    fontSize: 32,
    fontWeight: "700",
    color: colors.danger,
    paddingVertical: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: colors.textPrimary,
    backgroundColor: "#fff",
  },
  charCount: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: "right",
    marginTop: 4,
  },
  suggestionsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  suggestionChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: colors.border,
    borderRadius: 20,
  },
  suggestionText: {
    fontSize: 14,
    color: colors.textPrimary,
  },
  dateContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 16,
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  dateText: {
    fontSize: 16,
    color: colors.textPrimary,
    fontWeight: "500",
  },
  dateHint: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 6,
    fontStyle: "italic",
  },
  categoryButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  categoryButtonText: {
    fontSize: 16,
    color: colors.textPrimary,
  },
  hintText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 6,
    fontStyle: "italic",
  },
  fixedExpenseContainer: {
    flexDirection: "row",
    gap: 20,
  },
  fixedOption: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
  },
  radioInnerCircle: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
  },
  radioLabel: {
    fontSize: 16,
    color: colors.textPrimary,
  },
  receiptPreview: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  receiptTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.textPrimary,
    marginBottom: 16,
  },
  receiptRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border + "40",
  },
  receiptLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    flex: 1,
  },
  receiptValue: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.textPrimary,
    flex: 2,
    textAlign: "right",
  },
  typeBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  typeBadgeText: {
    fontSize: 12,
    fontWeight: "700",
  },
  tipContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#fffbeb",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#f59e0b30",
    marginBottom: 24,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    color: "#92400e",
    lineHeight: 20,
  },
  modalFooter: {
    flexDirection: "row",
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    padding: 18,
    borderRadius: 14,
    alignItems: "center",
    backgroundColor: colors.border,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.textSecondary,
  },
  submitButton: {
    flex: 2,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: 18,
    borderRadius: 14,
    backgroundColor: colors.danger,
  },
  submitButtonDisabled: {
    backgroundColor: colors.danger + "80",
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
  },
});