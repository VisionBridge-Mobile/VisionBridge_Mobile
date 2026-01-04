import { colors } from "@/theme/colors";
import { Picker } from "@react-native-picker/picker";
import * as DocumentPicker from "expo-document-picker";
import React, { useState } from "react";
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { PageHeader } from "../components/layout/PageHeader";
import { Screen } from "../components/layout/Screen";

interface UploadedFile {
  id: string;
  name: string;
  type: string;
  size: string;
  uploadedAt: string;
}

const getFileTypeColor = (type: string) => {
  switch (type) {
    case 'video':
      return '#9333EA';
    case 'image':
      return '#16A34A';
    case 'pdf':
      return '#DC2626';
    default:
      return '#2563EB';
  }
};

export default function LessonUploadScreen() {
  const [selectedFiles, setSelectedFiles] = useState<DocumentPicker.DocumentPickerAsset[]>([]);
  const [lessonTitle, setLessonTitle] = useState("");
  const [selectedTopic, setSelectedTopic] = useState("");
  const [description, setDescription] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  
  const handleFileSelect = async () => {
    try {
      const res = await DocumentPicker.getDocumentAsync({
        type: [
          "application/pdf",
          "application/msword",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          "application/vnd.ms-powerpoint",
          "application/vnd.openxmlformats-officedocument.presentationml.presentation",
          "video/*",
          "image/*",
        ],
        multiple: true,              
        copyToCacheDirectory: true,
      });
      // User canceled
      if (res.canceled) return;
      // expo-document-picker returns: { assets: [...] }
      const picked = res.assets ?? [];
      // Merge into your existing state (keep same structure you use)
      setSelectedFiles((prev: any[]) => [...prev, ...picked]);
    } catch (err) {
      Alert.alert("Error", "Failed to select files");
    }
  };
  
  const removeFile = (index: number) => {
    setSelectedFiles(selectedFiles.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'Unknown';
    return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
  };

  const handleUpload = () => {
    if (!lessonTitle || !selectedTopic) {
      Alert.alert('Error', 'Please fill in lesson title and topic');
      return;
    }

    setIsUploading(true);
    // Simulate upload
    setTimeout(() => {
      setIsUploading(false);
      setSelectedFiles([]);
      setLessonTitle('');
      setDescription('');
      Alert.alert('Success', 'Lesson uploaded successfully');
    }, 2000);
  };

  return (
    <Screen>
    <ScrollView style={styles.container}>
      <PageHeader title="Lesson Upload" subtitle="Upload lesson content and resources" />
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Upload New Lesson Material</Text>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Lesson Title</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., Introduction to Algorithms"
            value={lessonTitle}
            onChangeText={setLessonTitle}
            placeholderTextColor="#9CA3AF"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Topic Category</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={selectedTopic}
              onValueChange={setSelectedTopic}
              style={styles.picker}
            >
              <Picker.Item label="Select topic" value="" />
              <Picker.Item label="Health/Security" value="health/security" />
              <Picker.Item label="Data Representation" value="data-representation" />
              <Picker.Item label="Networks" value="networks" />
              <Picker.Item label="Databases" value="databases" />
              <Picker.Item label="Web Development" value="web-dev" />
              <Picker.Item label="Hardware" value="hardware" />
              <Picker.Item label="SDLC" value="sdlc" />
              <Picker.Item label="Programming (Pascal)" value="programming-pascal" />
              <Picker.Item label="Operating Systems" value="operating-systems" />
              <Picker.Item label="Legal/Ethical" value="legal-ethical" />
              <Picker.Item label="Logic Gates" value="logic-gates" />
            </Picker>
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Brief description of the lesson content..."
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            placeholderTextColor="#9CA3AF"
          />
        </View>

        <TouchableOpacity
          style={styles.uploadButton}
          onPress={handleFileSelect}
        >
          <Text style={styles.uploadButtonText}>📁 Select Files</Text>
          <Text style={styles.uploadButtonSubtext}>
            PDF, DOC (Max 100MB)
          </Text>
        </TouchableOpacity>

        {/* Selected Files */}
        {selectedFiles.length > 0 && (
          <View style={styles.filesSection}>
            <Text style={styles.label}>Selected Files</Text>
            {selectedFiles.map((file, index) => (
              <View key={index} style={styles.fileItem}>
                <View style={styles.fileInfo}>
                  <Text style={styles.fileName}>{file.name}</Text>
                  <Text style={styles.fileSize}>
                    {formatFileSize(file.size)}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => removeFile(index)}
                  style={styles.removeButton}
                >
                  <Text style={styles.removeButtonText}>✕</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[
              styles.primaryButton,
              (selectedFiles.length === 0 || isUploading) && styles.disabledButton,
            ]}
            onPress={handleUpload}
            disabled={selectedFiles.length === 0 || isUploading}
          >
            {isUploading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.primaryButtonText}>
                📤 Upload Lesson
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Quick Stats */}
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <View style={[styles.statIcon, { backgroundColor: '#DBEAFE' }]}>
            <Text style={{ fontSize: 24 }}>📄</Text>
          </View>
          <Text style={styles.statValue}>24</Text>
          <Text style={styles.statLabel}>Total Lessons</Text>
        </View>

        <View style={styles.statCard}>
          <View style={[styles.statIcon, { backgroundColor: '#DCFCE7' }]}>
            <Text style={{ fontSize: 24 }}>📤</Text>
          </View>
          <Text style={styles.statValue}>1.2 GB</Text>
          <Text style={styles.statLabel}>Storage Used</Text>
        </View>
      </View>
    </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { padding: 16 },
  h: { fontSize: 16, fontWeight: "800", color: colors.text },
  p: { marginTop: 6, color: colors.muted, fontWeight: "600" },

  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  card: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#111827',
    backgroundColor: '#FFFFFF',
  },
  textArea: {
    height: 100,
    paddingTop: 12,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    overflow: 'hidden',
  },
  picker: {
    height: 50,
  },
  uploadButton: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 32,
    alignItems: 'center',
    marginBottom: 20,
  },
  uploadButtonText: {
    fontSize: 16,
    color: '#2563EB',
    marginBottom: 8,
  },
  uploadButtonSubtext: {
    fontSize: 12,
    color: '#6B7280',
  },
  filesSection: {
    marginBottom: 20,
  },
  fileItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  fileInfo: {
    flex: 1,
  },
  fileName: {
    fontSize: 14,
    color: '#111827',
    marginBottom: 4,
  },
  fileSize: {
    fontSize: 12,
    color: '#6B7280',
  },
  removeButton: {
    padding: 8,
  },
  removeButtonText: {
    fontSize: 18,
    color: '#6B7280',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: '#2563EB',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#9CA3AF',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  secondaryButtonText: {
    color: '#374151',
    fontSize: 14,
    fontWeight: '600',
  },
  recentFileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  fileIcon: {
    width: 48,
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  recentFileInfo: {
    flex: 1,
  },
  recentFileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  recentFileName: {
    fontSize: 14,
    color: '#111827',
    flex: 1,
  },
  checkmark: {
    color: '#16A34A',
    fontSize: 16,
  },
  recentFileDetails: {
    fontSize: 12,
    color: '#6B7280',
  },
  statsGrid: {
    flexDirection: 'row',
    margin: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
});


