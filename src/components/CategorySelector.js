// components/CategorySelector.js
import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  FlatList,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { colors } from "../theme/colors";
import { MaterialIcons } from "@expo/vector-icons";
import { getCategoriesByType } from "../services/categories";

export default function CategorySelector({
  visible,
  onClose,
  typeId,
  selectedCategory,
  onSelectCategory,
}) {
  const categories = getCategoriesByType(typeId);

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
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Selecionar Categoria</Text>
            <TouchableOpacity onPress={onClose}>
              <MaterialIcons name="close" size={24} color={colors.textPrimary} />
            </TouchableOpacity>
          </View>

          <FlatList
            data={categories}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.listContent}
            numColumns={3}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.categoryCard,
                  selectedCategory?.id === item.id && styles.categoryCardSelected,
                  { borderColor: selectedCategory?.id === item.id ? item.color : colors.border }
                ]}
                onPress={() => {
                  onSelectCategory(item);
                  onClose();
                }}
              >
                <Text style={{ fontSize: 32, marginBottom: 8 }}>
                  {item.emoji}
                </Text>
                <Text 
                  style={[
                    styles.categoryName,
                    { color: selectedCategory?.id === item.id ? item.color : colors.textPrimary }
                  ]}
                  numberOfLines={2}
                >
                  {item.name}
                </Text>
              </TouchableOpacity>
            )}
          />
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
    maxHeight: "70%",
    marginTop: 100,
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
  listContent: {
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  categoryCard: {
    flex: 1,
    margin: 8,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    borderWidth: 2,
    borderColor: colors.border,
    minHeight: 120,
  },
  categoryCardSelected: {
    backgroundColor: "#f8fafc",
  },
  categoryName: {
    fontSize: 12,
    fontWeight: "600",
    textAlign: "center",
    marginTop: 4,
  },
});