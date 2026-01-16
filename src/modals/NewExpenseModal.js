import React, { useState, useEffect } from "react";
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
  FlatList,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { colors } from "../theme/colors";
import { MaterialIcons, FontAwesome5 } from "@expo/vector-icons";
import { createTransaction } from "../services/transaction";
import { getCategoriesByType } from "../services/categories";

export default function NewExpenseModal({ visible, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [formData, setFormData] = useState({
    value: "",
    description: "",
    date: new Date().toISOString().split("T")[0],
  });

  const expenseCategories = getCategoriesByType(2);

  // Mapeamento entre sugestões e categorias
  const suggestionToCategoryMap = {
    Alimentação: "Alimentação",
    Transporte: "Transporte",
    Moradia: "Moradia",
    Lazer: "Lazer",
    Saúde: "Saúde",
    Educação: "Educação",
    Compras: "Compras",
    Serviços: "Serviços",
  };

  const expenseSuggestions = [
    "Alimentação",
    "Transporte",
    "Moradia",
    "Lazer",
    "Saúde",
    "Educação",
    "Compras",
    "Serviços",
  ];

  useEffect(() => {
    if (expenseCategories.length > 0 && !selectedCategory) {
      setSelectedCategory(expenseCategories[0]);
    }
  }, []);

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

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    setShowCategoryPicker(false);
  };

  // ✅ NOVA FUNÇÃO: Quando selecionar sugestão, também seleciona categoria
  const handleSuggestionSelect = (suggestion) => {
    // Atualiza a descrição
    handleInputChange("description", suggestion);

    // Encontra a categoria correspondente
    const categoryName = suggestionToCategoryMap[suggestion];
    if (categoryName) {
      const matchingCategory = expenseCategories.find(
        (cat) => cat.name === categoryName
      );
      if (matchingCategory) {
        setSelectedCategory(matchingCategory);
      }
    }
  };

  // ✅ NOVA FUNÇÃO: Quando mudar categoria, atualiza sugestão se houver correspondência
  useEffect(() => {
    if (selectedCategory && formData.description) {
      // Verifica se a descrição atual corresponde a alguma sugestão
      const suggestionMatch = expenseSuggestions.find(
        (suggestion) =>
          suggestionToCategoryMap[suggestion] === selectedCategory.name
      );

      // Se não encontrar correspondência exata, não faz nada
      // (mantém a descrição do usuário)
    }
  }, [selectedCategory]);

  const isFormValid = () => {
    const hasValue = formData.value && parseFloat(getNumericValue()) > 0;
    const hasDescription = formData.description.trim().length > 0;
    const hasCategory = selectedCategory !== null;

    return hasValue && hasDescription && hasCategory;
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

    if (!selectedCategory) {
      Alert.alert("Erro", "Selecione uma categoria para a despesa");
      return;
    }

    try {
      setLoading(true);

      // ✅ DEBUG DETALHADO
      console.log("🔍 DEBUG EXPENSE - ANTES DE ENVIAR:");
      console.log("📝 Descrição digitada:", formData.description);
      console.log("🎯 Categoria selecionada:", selectedCategory?.name);
      console.log("🆔 ID da categoria:", selectedCategory?.id);
      console.log("🎨 Cor da categoria:", selectedCategory?.color);
      console.log(
        "📋 Todas categorias disponíveis:",
        expenseCategories.map((c) => `${c.id}: ${c.name}`)
      );

      // Verifica se o ID da categoria existe na lista
      const categoryExists = expenseCategories.find(
        (cat) => cat.id === selectedCategory.id
      );
      console.log(
        "✅ Categoria existe na lista?",
        categoryExists ? "SIM" : "NÃO"
      );

      const transactionData = {
        value: getNumericValue(),
        typeId: 2,
        description: formData.description.trim(),
        date: formData.date,
        status: true,
        categoryId: selectedCategory ? selectedCategory.id : null,
      };

      console.log(
        "📤 Dados sendo enviados:",
        JSON.stringify(transactionData, null, 2)
      );

      const response = await createTransaction(transactionData);

      // ✅ DEBUG da resposta
      console.log("📥 Resposta do backend:", response);

      if (response.error) {
        console.error("❌ Erro do backend:", response.message);
        Alert.alert(
          "Erro",
          response.message || "Não foi possível criar a despesa"
        );
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
      console.error("🔥 ERRO AO CRIAR DESPESA:", error);
      console.error("📞 Response error:", error.response?.data);
      Alert.alert(
        "Erro",
        error.response?.data?.message ||
          "Erro ao salvar despesa. Tente novamente."
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
    if (expenseCategories.length > 0) {
      setSelectedCategory(expenseCategories[0]);
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const CategoryPickerModal = () => (
    <Modal
      visible={showCategoryPicker}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowCategoryPicker(false)}
    >
      <View style={styles.categoryPickerOverlay}>
        <View style={styles.categoryPickerContainer}>
          <View style={styles.categoryPickerHeader}>
            <Text style={styles.categoryPickerTitle}>Selecionar Categoria</Text>
            <TouchableOpacity
              onPress={() => setShowCategoryPicker(false)}
              style={styles.categoryPickerCloseButton}
            >
              <MaterialIcons
                name="close"
                size={24}
                color={colors.textPrimary}
              />
            </TouchableOpacity>
          </View>

          <FlatList
            data={expenseCategories}
            keyExtractor={(item) => item.id.toString()}
            numColumns={3}
            contentContainerStyle={styles.categoryPickerList}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.categoryPickerItem,
                  selectedCategory?.id === item.id &&
                    styles.categoryPickerItemSelected,
                ]}
                onPress={() => handleCategorySelect(item)}
              >
                <View
                  style={[
                    styles.categoryIcon,
                    { backgroundColor: item.color + "20" },
                  ]}
                >
                  <Text style={styles.categoryEmoji}>
                    {item.emoji || item.icon}
                  </Text>
                </View>
                <Text
                  style={[
                    styles.categoryPickerItemText,
                    selectedCategory?.id === item.id &&
                      styles.categoryPickerItemTextSelected,
                  ]}
                  numberOfLines={1}
                >
                  {item.name}
                </Text>
              </TouchableOpacity>
            )}
          />
        </View>
      </View>
    </Modal>
  );

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
            <View style={styles.modalHeader}>
              <View style={styles.headerTitleContainer}>
                <View
                  style={[
                    styles.iconContainer,
                    { backgroundColor: "#ef444420" },
                  ]}
                >
                  <MaterialIcons
                    name="money-off"
                    size={24}
                    color={colors.danger}
                  />
                </View>
                <View>
                  <Text style={styles.modalTitle}>Nova Despesa</Text>
                  <Text style={styles.modalSubtitle}>
                    Registre uma nova saída
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
              <View style={styles.formCard}>
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

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Descrição</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Ex: Supermercado, Combustível, Aluguel..."
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

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Sugestões rápidas</Text>
                  <View style={styles.suggestionsContainer}>
                    {expenseSuggestions.map((suggestion, index) => {
                      // Verifica se esta sugestão corresponde à categoria selecionada
                      const isActive =
                        selectedCategory &&
                        suggestionToCategoryMap[suggestion] ===
                          selectedCategory.name &&
                        formData.description === suggestion;

                      return (
                        <TouchableOpacity
                          key={index}
                          style={[
                            styles.suggestionChip,
                            isActive && styles.suggestionChipActive,
                          ]}
                          onPress={() => handleSuggestionSelect(suggestion)}
                        >
                          <Text
                            style={[
                              styles.suggestionText,
                              isActive && styles.suggestionTextActive,
                            ]}
                          >
                            {suggestion}
                          </Text>
                          {isActive && (
                            <MaterialIcons
                              name="check"
                              size={14}
                              color={colors.danger}
                            />
                          )}
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Categoria *</Text>
                  <TouchableOpacity
                    style={styles.categoryButton}
                    onPress={() => setShowCategoryPicker(true)}
                    disabled={loading}
                  >
                    <View style={styles.categoryButtonContent}>
                      {selectedCategory ? (
                        <View style={styles.selectedCategoryInfo}>
                          <View
                            style={[
                              styles.categoryIconSmall,
                              {
                                backgroundColor: selectedCategory.color + "20",
                              },
                            ]}
                          >
                            <Text style={styles.categoryEmojiSmall}>
                              {selectedCategory.emoji || selectedCategory.icon}
                            </Text>
                          </View>
                          <Text style={styles.selectedCategoryName}>
                            {selectedCategory.name}
                          </Text>
                        </View>
                      ) : (
                        <Text style={styles.categoryPlaceholder}>
                          Selecione uma categoria
                        </Text>
                      )}
                      <MaterialIcons
                        name="arrow-forward-ios"
                        size={16}
                        color={colors.textSecondary}
                      />
                    </View>
                  </TouchableOpacity>
                  {!selectedCategory && (
                    <View style={styles.warningContainer}>
                      <MaterialIcons name="warning" size={14} color="#f59e0b" />
                      <Text style={styles.warningText}>
                        Selecione uma categoria para habilitar o registro
                      </Text>
                    </View>
                  )}
                </View>

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

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Despesa fixa?</Text>
                  <View style={styles.fixedExpenseContainer}>
                    <TouchableOpacity style={styles.fixedOption}>
                      <View
                        style={[
                          styles.radioCircle,
                          { borderColor: colors.primary },
                        ]}
                      >
                        <View style={styles.radioInnerCircle} />
                      </View>
                      <Text style={styles.radioLabel}>Sim (mensal)</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.fixedOption}>
                      <View
                        style={[
                          styles.radioCircle,
                          { borderColor: colors.border },
                        ]}
                      />
                      <Text style={styles.radioLabel}>Não (única)</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>

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
                  <Text style={styles.receiptLabel}>Categoria:</Text>
                  {selectedCategory ? (
                    <View style={styles.categoryBadge}>
                      <Text style={styles.categoryEmojiBadge}>
                        {selectedCategory.emoji || selectedCategory.icon}
                      </Text>
                      <Text style={styles.categoryNameBadge}>
                        {selectedCategory.name}
                      </Text>
                    </View>
                  ) : (
                    <Text
                      style={[
                        styles.receiptValue,
                        { color: colors.textSecondary },
                      ]}
                    >
                      Não selecionada
                    </Text>
                  )}
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
                    style={[styles.typeBadge, { backgroundColor: "#ef444420" }]}
                  >
                    <Text
                      style={[styles.typeBadgeText, { color: colors.danger }]}
                    >
                      DESPESA
                    </Text>
                  </View>
                </View>
              </View>

              <View style={styles.tipContainer}>
                <MaterialIcons name="lightbulb" size={20} color="#f59e0b" />
                <Text style={styles.tipText}>
                  Dica: Despesas menores que 3% da sua renda mensal geralmente
                  são saudáveis.
                </Text>
              </View>

              {!isFormValid() && (
                <View style={styles.formValidationContainer}>
                  <MaterialIcons
                    name="info"
                    size={16}
                    color={colors.textSecondary}
                  />
                  <Text style={styles.formValidationText}>
                    Preencha todos os campos obrigatórios (*) para registrar a
                    despesa
                  </Text>
                </View>
              )}
            </ScrollView>

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
                  !isFormValid() && styles.submitButtonDisabled,
                ]}
                onPress={handleSubmit}
                disabled={loading || !isFormValid()}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <MaterialIcons name="check" size={20} color="#fff" />
                    <Text style={styles.submitButtonText}>
                      Registrar Despesa
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>
      </KeyboardAvoidingView>

      <CategoryPickerModal />
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
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: colors.border,
    borderRadius: 20,
  },
  suggestionChipActive: {
    backgroundColor: colors.danger + "20",
    borderWidth: 1,
    borderColor: colors.danger,
  },
  suggestionText: {
    fontSize: 14,
    color: colors.textPrimary,
  },
  suggestionTextActive: {
    color: colors.danger,
    fontWeight: "600",
  },
  categoryButton: {
    padding: 16,
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  categoryButtonContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  selectedCategoryInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  categoryIconSmall: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  categoryEmojiSmall: {
    fontSize: 18,
  },
  selectedCategoryName: {
    fontSize: 16,
    color: colors.textPrimary,
    fontWeight: "500",
  },
  categoryPlaceholder: {
    fontSize: 16,
    color: colors.textSecondary,
    fontStyle: "italic",
  },
  warningContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#fef3c7",
    padding: 10,
    borderRadius: 8,
    marginTop: 8,
  },
  warningText: {
    fontSize: 12,
    color: "#92400e",
    flex: 1,
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
  categoryBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#f8fafc",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  categoryEmojiBadge: {
    fontSize: 16,
  },
  categoryNameBadge: {
    fontSize: 12,
    color: colors.textPrimary,
    fontWeight: "500",
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
    marginBottom: 16,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    color: "#92400e",
    lineHeight: 20,
  },
  formValidationContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: colors.border,
    padding: 12,
    borderRadius: 8,
    marginBottom: 24,
  },
  formValidationText: {
    fontSize: 12,
    color: colors.textSecondary,
    flex: 1,
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
  categoryPickerOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  categoryPickerContainer: {
    backgroundColor: colors.bg,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    maxHeight: "70%",
    paddingTop: 20,
  },
  categoryPickerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  categoryPickerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  categoryPickerCloseButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.border,
  },
  categoryPickerList: {
    padding: 24,
  },
  categoryPickerItem: {
    flex: 1,
    alignItems: "center",
    margin: 8,
    padding: 16,
    borderRadius: 20,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    maxWidth: 100,
  },
  categoryPickerItemSelected: {
    backgroundColor: colors.primary + "10",
    borderColor: colors.primary,
  },
  categoryIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  categoryEmoji: {
    fontSize: 28,
  },
  categoryPickerItemText: {
    fontSize: 12,
    color: colors.textPrimary,
    textAlign: "center",
    fontWeight: "500",
  },
  categoryPickerItemTextSelected: {
    color: colors.primary,
    fontWeight: "700",
  },
});
