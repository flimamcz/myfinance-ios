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
import { getCategoriesByType } from "../services/categories";

export default function NewIncomeModal({ visible, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    value: "",
    description: "",
    date: new Date().toISOString().split("T")[0],
  });

  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showCategoryModal, setShowCategoryModal] = useState(false);

  const incomeCategories = getCategoriesByType(1); // typeId: 1 = Receita

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
      Alert.alert("Erro", "Informe um valor válido para a receita");
      return;
    }

    if (!formData.description.trim()) {
      Alert.alert("Erro", "Informe uma descrição para a receita");
      return;
    }

    try {
      setLoading(true);

      const transactionData = {
        value: getNumericValue(),
        typeId: 1,
        description: formData.description.trim(),
        date: formData.date,
        status: true,
        // Podemos adicionar a categoria na descrição ou criar campo separado
        categoryId: selectedCategory?.id || 1,
      };

      console.log("📤 Enviando nova receita:", transactionData);

      const response = await createTransaction(transactionData);

      if (response.error) {
        Alert.alert(
          "Erro",
          response.message || "Não foi possível criar a receita"
        );
        return;
      }

      Alert.alert("Sucesso!", "Receita adicionada com sucesso!", [
        {
          text: "OK",
          onPress: () => {
            resetForm();
            onSuccess();
          },
        },
      ]);
    } catch (error) {
      console.error("Erro ao criar receita:", error);
      Alert.alert(
        "Erro",
        error.response?.data?.message ||
          "Erro ao salvar receita. Tente novamente."
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
                <View
                  style={[
                    styles.iconContainer,
                    { backgroundColor: "#22c55e20" },
                  ]}
                >
                  <MaterialIcons
                    name="attach-money"
                    size={24}
                    color={colors.success}
                  />
                </View>
                <View>
                  <Text style={styles.modalTitle}>Nova Receita</Text>
                  <Text style={styles.modalSubtitle}>
                    Adicione uma nova entrada
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                onPress={handleClose}
                style={styles.closeButton}
              >
                <MaterialIcons
                  name="close"
                  size={24}
                  color={colors.textSecondary}
                />
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
                    placeholder="Ex: Salário, Freelance, Venda..."
                    placeholderTextColor={colors.textSecondary + "80"}
                    value={formData.description}
                    onChangeText={(text) =>
                      handleInputChange("description", text)
                    }
                    editable={!loading}
                    multiline
                    maxLength={100}
                  />
                  <Text style={styles.charCount}>
                    {formData.description.length}/100
                  </Text>
                </View>

                {/* DATA */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Data</Text>
                  <View style={styles.dateContainer}>
                    <MaterialIcons
                      name="calendar-today"
                      size={20}
                      color={colors.primary}
                    />
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

                {/* CATEGORIA (Futura implementação) */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Categoria (Opcional)</Text>
                  <TouchableOpacity
                    style={styles.categoryButton}
                    disabled={true}
                  >
                    <Text style={styles.categoryButtonText}>
                      Selecionar categoria
                    </Text>
                    <MaterialIcons
                      name="arrow-forward-ios"
                      size={16}
                      color={colors.textSecondary}
                    />
                  </TouchableOpacity>
                  <Text style={styles.hintText}>
                    Categorias em breve disponíveis
                  </Text>
                </View>

                {/* NOTAS (Opcional) */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Notas (Opcional)</Text>
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    placeholder="Adicione observações, detalhes..."
                    placeholderTextColor={colors.textSecondary + "80"}
                    multiline
                    numberOfLines={3}
                    editable={!loading}
                  />
                </View>
              </View>

              {/* RECIBO PREVIEW */}
              <View style={styles.receiptPreview}>
                <Text style={styles.receiptTitle}>📋 Resumo da Receita</Text>

                <View style={styles.receiptRow}>
                  <Text style={styles.receiptLabel}>Valor:</Text>
                  <Text
                    style={[styles.receiptValue, { color: colors.success }]}
                  >
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
                  <View
                    style={[styles.typeBadge, { backgroundColor: "#22c55e20" }]}
                  >
                    <Text
                      style={[styles.typeBadgeText, { color: colors.success }]}
                    >
                      RECEITA
                    </Text>
                  </View>
                </View>
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
                  (!formData.value || !formData.description) &&
                    styles.submitButtonDisabled,
                ]}
                onPress={handleSubmit}
                disabled={loading || !formData.value || !formData.description}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <MaterialIcons name="check" size={20} color="#fff" />
                    <Text style={styles.submitButtonText}>
                      Adicionar Receita
                    </Text>
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
    borderColor: colors.success + "40",
    borderRadius: 16,
    backgroundColor: "#fff",
    paddingHorizontal: 16,
  },
  currencySymbol: {
    fontSize: 24,
    fontWeight: "700",
    color: colors.success,
    marginRight: 8,
  },
  valueInput: {
    flex: 1,
    fontSize: 32,
    fontWeight: "700",
    color: colors.success,
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
  textArea: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  charCount: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: "right",
    marginTop: 4,
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
  receiptPreview: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
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
    backgroundColor: colors.success,
  },
  submitButtonDisabled: {
    backgroundColor: colors.success + "80",
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
  },
});
