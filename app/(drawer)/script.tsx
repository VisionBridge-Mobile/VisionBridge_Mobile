import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '@/components/layout/Screen';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { colors } from '@/theme/colors';
import { radius } from '@/theme/spacing';
import { updateScript } from '@/services/scriptApi';

export default function ScriptScreen() {
  const [script, setScript] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const handleUpdate = async () => {
    if (!script.trim()) {
      Alert.alert('Error', 'Script cannot be empty');
      return;
    }

    setIsUpdating(true);
    try {
      await updateScript(script);
      Alert.alert('Success', 'Script updated and saved successfully');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update script';
      Alert.alert('Error', errorMessage);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Screen>
      <PageHeader
        title="Script"
        subtitle="View and manage lesson scripts"
        searchPlaceholder="Search scripts..."
      />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>Script Content</Text>
          <Text style={styles.sectionDescription}>
            View and edit the script below, then click "Update Script" to save changes
          </Text>

          <TextInput
            style={styles.scriptTextArea}
            placeholder="Script content will appear here..."
            placeholderTextColor={colors.muted}
            value={script}
            onChangeText={setScript}
            multiline
            numberOfLines={20}
            textAlignVertical="top"
            editable={true}
          />

          <Pressable
            style={[styles.updateButton, isUpdating && styles.buttonDisabled]}
            onPress={handleUpdate}
            disabled={isUpdating}
          >
            {isUpdating ? (
              <>
                <ActivityIndicator size="small" color="#FFFFFF" style={styles.buttonLoader} />
                <Text style={styles.updateButtonText}>Updating...</Text>
              </>
            ) : (
              <>
                <Ionicons name="checkmark-outline" size={18} color="#FFFFFF" />
                <Text style={styles.updateButtonText}>Update Script</Text>
              </>
            )}
          </Pressable>
        </Card>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    padding: 16,
    paddingBottom: 24,
    gap: 14,
  },
  card: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 6,
  },
  sectionDescription: {
    fontSize: 13,
    color: colors.muted,
    fontWeight: '600',
    marginBottom: 16,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonLoader: {
    marginRight: 4,
  },
  scriptTextArea: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    padding: 12,
    fontSize: 13,
    color: colors.text,
    backgroundColor: '#FFFFFF',
    fontFamily: 'monospace',
    minHeight: 400,
    textAlignVertical: 'top',
    marginBottom: 16,
  },
  updateButton: {
    backgroundColor: colors.primary,
    borderRadius: radius.sm,
    paddingVertical: 14,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 16,
  },
  updateButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});

