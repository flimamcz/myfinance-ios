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

export default function NewIncomeModal({ visible, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [showDateModal, setShowDateModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [formData, setFormData] = useState({
    value: "",
    description: "",
    date: new Date(),
    notes: "",
  });

  const incomeCategories = getCategoriesByType(1);

  const suggestionToCategoryMap = {
    Salário: "Salário",
    Freelance: "Freelance",
    Venda: "Venda",
    Investimento: "Investimento",
    Presente: "Presente",
    Reembolso: "Reembolso",
    Rendimento: "Investimento",
    Extra: "Outros",
  };

  const incomeSuggestions = [
    "Salário",
    "Freelance",
    "Venda",
    "Investimento",
    "Presente",
    "Reembolso",
    "Rendimento",
    "Extra",
  ];

  useEffect(() => {
    if (incomeCategories.length > 0 && !selectedCategory) {
      setSelectedCategory(incomeCategories[0]);
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

  const handleSuggestionSelect = (suggestion) => {
    handleInputChange("description", suggestion);

    const categoryName = suggestionToCategoryMap[suggestion];
    if (categoryName) {
      const matchingCategory = incomeCategories.find(
        (cat) => cat.name === categoryName,
      );
      if (matchingCategory) {
        setSelectedCategory(matchingCategory);
      }
    }
  };

  const isFormValid = () => {
    const hasValue = formData.value && parseFloat(getNumericValue()) > 0;
    const hasDescription = formData.description.trim().length > 0;
    const hasCategory = selectedCategory !== null;

    return hasValue && hasDescription && hasCategory;
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

    if (!selectedCategory) {
      Alert.alert("Erro", "Selecione uma categoria para a receita");
      return;
    }

    try {
      setLoading(true);

      const formattedDate = formData.date.toISOString().split("T")[0];

      const transactionData = {
        value: getNumericValue(),
        typeId: 1,
        description: formData.description.trim(),
        date: formattedDate,
        status: true,
        categoryId: selectedCategory ? selectedCategory.id : null,
      };

      console.log("📤 Enviando nova receita:", transactionData);

      const response = await createTransaction(transactionData);

      if (response.error) {
        Alert.alert(
          "Erro",
          response.message || "Não foi possível criar a receita",
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
          "Erro ao salvar receita. Tente novamente.",
      );
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      value: "",
      description: "",
      date: new Date(),
      notes: "",
    });
    if (incomeCategories.length > 0) {
      setSelectedCategory(incomeCategories[0]);
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const formatDate = (date) => {
    return date.toLocaleDateString("pt-BR", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const formatShortDate = (date) => {
    return date.toLocaleDateString("pt-BR");
  };

  // COMPONENTE DE SELEÇÃO DE DATA - SIMPLIFICADO E FUNCIONAL
  const DateSelectorModal = () => {
    const [tempDate, setTempDate] = useState(formData.date);
    const [day, setDay] = useState(formData.date.getDate().toString());
    const [month, setMonth] = useState(
      (formData.date.getMonth() + 1).toString(),
    );
    const [year, setYear] = useState(formData.date.getFullYear().toString());

    // Funções para manipular data
    const changeTempDate = (days) => {
      const newDate = new Date(tempDate);
      newDate.setDate(newDate.getDate() + days);
      setTempDate(newDate);
      updateInputs(newDate);
    };

    const setTempToday = () => {
      const today = new Date();
      setTempDate(today);
      updateInputs(today);
    };

    const setTempYesterday = () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      setTempDate(yesterday);
      updateInputs(yesterday);
    };

    const updateInputs = (date) => {
      setDay(date.getDate().toString());
      setMonth((date.getMonth() + 1).toString());
      setYear(date.getFullYear().toString());
    };

    const updateDateFromInputs = () => {
      const newDay = parseInt(day) || 1;
      const newMonth = (parseInt(month) || 1) - 1;
      const newYear = parseInt(year) || new Date().getFullYear();

      const newDate = new Date(newYear, newMonth, newDay);
      setTempDate(newDate);
    };

    const confirmDate = () => {
      setFormData((prev) => ({
        ...prev,
        date: tempDate,
      }));
      setShowDateModal(false);
    };

    return (
      <Modal
        visible={showDateModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowDateModal(false)}
      >
        <View style={styles.dateModalOverlay}>
          <View style={styles.dateModalContainer}>
            <View style={styles.dateModalHeader}>
              <Text style={styles.dateModalTitle}>Selecionar Data</Text>
              <TouchableOpacity
                onPress={() => setShowDateModal(false)}
                style={styles.dateModalCloseButton}
              >
                <MaterialIcons
                  name="close"
                  size={24}
                  color={colors.textPrimary}
                />
              </TouchableOpacity>
            </View>

            <View style={styles.datePreview}>
              <Text style={styles.datePreviewText}>{formatDate(tempDate)}</Text>
            </View>

            <View style={styles.dateQuickOptions}>
              <Text style={styles.dateOptionsTitle}>Datas rápidas:</Text>

              <TouchableOpacity
                style={styles.dateOptionButton}
                onPress={setTempYesterday}
              >
                <MaterialIcons
                  name="history"
                  size={20}
                  color={colors.primary}
                />
                <Text style={styles.dateOptionText}>Ontem</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.dateOptionButton}
                onPress={setTempToday}
              >
                <MaterialIcons name="today" size={20} color={colors.success} />
                <Text style={styles.dateOptionText}>Hoje</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.dateNavigation}>
              <Text style={styles.dateNavigationTitle}>Navegar por dias:</Text>
              <View style={styles.dateNavigationButtons}>
                <TouchableOpacity
                  style={styles.navButton}
                  onPress={() => changeTempDate(-1)}
                >
                  <MaterialIcons
                    name="chevron-left"
                    size={24}
                    color={colors.textPrimary}
                  />
                  <Text style={styles.navButtonText}>Dia anterior</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.navButton}
                  onPress={() => changeTempDate(1)}
                >
                  <Text style={styles.navButtonText}>Próximo dia</Text>
                  <MaterialIcons
                    name="chevron-right"
                    size={24}
                    color={colors.textPrimary}
                  />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.dateManual}>
              <Text style={styles.dateManualTitle}>Seleção manual:</Text>
              <View style={styles.dateInputRow}>
                <View style={styles.dateInputGroup}>
                  <Text style={styles.dateInputLabel}>Dia</Text>
                  <TextInput
                    style={styles.dateInput}
                    keyboardType="numeric"
                    value={day}
                    onChangeText={(text) => {
                      setDay(text);
                      setTimeout(updateDateFromInputs, 100);
                    }}
                    maxLength={2}
                  />
                </View>

                <View style={styles.dateInputGroup}>
                  <Text style={styles.dateInputLabel}>Mês</Text>
                  <TextInput
                    style={styles.dateInput}
                    keyboardType="numeric"
                    value={month}
                    onChangeText={(text) => {
                      setMonth(text);
                      setTimeout(updateDateFromInputs, 100);
                    }}
                    maxLength={2}
                  />
                </View>

                <View style={styles.dateInputGroup}>
                  <Text style={styles.dateInputLabel}>Ano</Text>
                  <TextInput
                    style={styles.dateInput}
                    keyboardType="numeric"
                    value={year}
                    onChangeText={(text) => {
                      setYear(text);
                      setTimeout(updateDateFromInputs, 100);
                    }}
                    maxLength={4}
                  />
                </View>
              </View>
            </View>

            <TouchableOpacity
              style={styles.dateConfirmButton}
              onPress={confirmDate}
            >
              <Text style={styles.dateConfirmButtonText}>Confirmar Data</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
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
            data={incomeCategories}
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

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Sugestões rápidas</Text>
                  <View style={styles.suggestionsContainer}>
                    {incomeSuggestions.map((suggestion, index) => {
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
                              color={colors.success}
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
                  <Text style={styles.inputLabel}>Data *</Text>
                  <TouchableOpacity
                    style={styles.dateContainer}
                    onPress={() => setShowDateModal(true)}
                    disabled={loading}
                  >
                    <MaterialIcons
                      name="calendar-today"
                      size={20}
                      color={colors.primary}
                    />
                    <Text style={styles.dateText}>
                      {formatDate(formData.date)}
                    </Text>
                    <MaterialIcons
                      name="edit"
                      size={18}
                      color={colors.textSecondary}
                    />
                  </TouchableOpacity>
                  <Text style={styles.dateHint}>Toque para alterar a data</Text>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Notas (Opcional)</Text>
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    placeholder="Adicione observações, detalhes..."
                    placeholderTextColor={colors.textSecondary + "80"}
                    value={formData.notes}
                    onChangeText={(text) => handleInputChange("notes", text)}
                    multiline
                    numberOfLines={3}
                    editable={!loading}
                  />
                </View>
              </View>

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
                    {formatShortDate(formData.date)}
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

                {formData.notes && (
                  <View style={styles.receiptRow}>
                    <Text style={styles.receiptLabel}>Notas:</Text>
                    <Text
                      style={[
                        styles.receiptValue,
                        { color: colors.textSecondary },
                      ]}
                    >
                      {formData.notes}
                    </Text>
                  </View>
                )}
              </View>

              <View style={styles.tipContainer}>
                <MaterialIcons name="lightbulb" size={20} color="#f59e0b" />
                <Text style={styles.tipText}>
                  Dica: Tente economizar pelo menos 20% da sua receita para
                  investimentos.
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
                    receita
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
                      Adicionar Receita
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>
      </KeyboardAvoidingView>

      {/* MODAIS ANINHADOS - RENDERIZAM DENTRO DO MODAL PRINCIPAL */}
      <DateSelectorModal />
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
    backgroundColor: colors.success + "20",
    borderWidth: 1,
    borderColor: colors.success,
  },
  suggestionText: {
    fontSize: 14,
    color: colors.textPrimary,
  },
  suggestionTextActive: {
    color: colors.success,
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
    justifyContent: "space-between",
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
    flex: 1,
    marginLeft: 10,
  },
  dateHint: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 6,
    fontStyle: "italic",
  },
  // Date Modal Styles
  dateModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  dateModalContainer: {
    backgroundColor: colors.bg,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingTop: 20,
    paddingHorizontal: 24,
    paddingBottom: 30,
    maxHeight: "80%",
  },
  dateModalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: 16,
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  dateModalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  dateModalCloseButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.border,
  },
  datePreview: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    alignItems: "center",
  },
  datePreviewText: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.primary,
  },
  dateQuickOptions: {
    marginBottom: 20,
  },
  dateOptionsTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.textPrimary,
    marginBottom: 12,
  },
  dateOptionButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: colors.card,
    padding: 16,
    borderRadius: 12,
    marginBottom: 10,
  },
  dateOptionText: {
    fontSize: 16,
    color: colors.textPrimary,
    fontWeight: "500",
  },
  dateNavigation: {
    marginBottom: 20,
  },
  dateNavigationTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.textPrimary,
    marginBottom: 12,
  },
  dateNavigationButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  navButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: colors.card,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  navButtonText: {
    fontSize: 14,
    color: colors.textPrimary,
    fontWeight: "500",
  },
  dateManual: {
    marginBottom: 24,
  },
  dateManualTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.textPrimary,
    marginBottom: 12,
  },
  dateInputRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },
  dateInputGroup: {
    flex: 1,
  },
  dateInputLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 6,
  },
  dateInput: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: colors.textPrimary,
    textAlign: "center",
  },
  dateConfirmButton: {
    backgroundColor: colors.primary,
    padding: 18,
    borderRadius: 14,
    alignItems: "center",
  },
  dateConfirmButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
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
