import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../ThemeContext';
import { RootStackParamList } from '../types';

const ARCHIVE_KEY = 'ARCHIVE';
const NOTES_KEY = 'NOTES';

interface Note {
  title: string;
  content: string;
  createdAt: string;
  archived: boolean;
  id: string;
}

type ArchiveScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Archive'>;

export default function ArchiveScreen() {
  const [archivedNotes, setArchivedNotes] = useState<Note[]>([]);
  const { theme } = useTheme();
  const navigation = useNavigation<ArchiveScreenNavigationProp>();

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', loadArchivedNotes);
    return unsubscribe;
  }, [navigation]);

  const loadArchivedNotes = async () => {
    const json = await AsyncStorage.getItem(ARCHIVE_KEY);
    if (json) {
      const parsedArchivedNotes = JSON.parse(json);
      setArchivedNotes(parsedArchivedNotes);
    }
  };

  const handleDeleteNote = (index: number) => {
    Alert.alert(
      'Xác nhận xoá',
      'Bạn có chắc muốn xoá ghi chú này?',
      [
        { text: 'Huỷ', style: 'cancel' },
        {
          text: 'Xoá',
          style: 'destructive',
          onPress: async () => {
            const updatedArchivedNotes = [...archivedNotes];
            updatedArchivedNotes.splice(index, 1);
            await AsyncStorage.setItem(ARCHIVE_KEY, JSON.stringify(updatedArchivedNotes));
            setArchivedNotes(updatedArchivedNotes);
          },
        },
      ]
    );
  };

  const handleUnarchiveNote = (index: number) => {
    Alert.alert(
      'Bỏ lưu trữ',
      'Bạn có chắc muốn bỏ lưu trữ ghi chú này và đưa nó trở lại trang chính?',
      [
        { text: 'Huỷ', style: 'cancel' },
        {
          text: 'Đồng ý',
          onPress: async () => {
            const updatedArchivedNotes = [...archivedNotes];
            const unarchivedNote = updatedArchivedNotes.splice(index, 1)[0];
            unarchivedNote.archived = false;

            // Lấy danh sách notes hiện tại
            const notesJson = await AsyncStorage.getItem(NOTES_KEY);
            const existingNotes = notesJson ? JSON.parse(notesJson) : [];

            // Thêm lại note đã bỏ lưu trữ vào danh sách chính
            const updatedNotes = [...existingNotes, unarchivedNote];

            // Lưu lại dữ liệu mới
            await AsyncStorage.setItem(NOTES_KEY, JSON.stringify(updatedNotes));
            await AsyncStorage.setItem(ARCHIVE_KEY, JSON.stringify(updatedArchivedNotes));

            // Cập nhật lại state
            setArchivedNotes(updatedArchivedNotes);

            // 👉 (Tuỳ chọn) Quay lại Home nếu muốn:
            // navigation.navigate('Home');
          },
        },
      ]
    );
  };

  const themedStyles = StyleSheet.create({
    container: {
      flex: 1,
      padding: 16,
      backgroundColor: theme === 'light' ? '#EEE8AA' : '#121212',
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      textAlign: 'center',
      marginBottom: 12,
      color: theme === 'light' ? '#000' : '#fff',
    },
    card: {
      backgroundColor: theme === 'light' ? '#FFDAB9' : '#008B8B',
      padding: 12,
      borderRadius: 10,
      elevation: 2,
      marginBottom: 12,
    },
    cardContent: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    noteTitle: {
      fontSize: 16,
      fontWeight: 'bold',
      marginBottom: 4,
      color: theme === 'light' ? '#000' : '#fff',
    },
    noteContent: {
      fontSize: 14,
      color: theme === 'light' ? '#333' : '#ccc',
    },
    dateText: {
      fontSize: 12,
      color: theme === 'light' ? '#888' : '#aaa',
      marginTop: 6,
    },
    actionsContainer: {
      marginLeft: 10,
      justifyContent: 'space-around',
      alignItems: 'center',
    },
    iconButton: {
      marginVertical: 5,
    },
  });

  return (
    <View style={themedStyles.container}>
      <Text style={themedStyles.title}>📦 Ghi chú đã lưu trữ</Text>

      {archivedNotes.length === 0 ? (
        <Text style={{ textAlign: 'center', color: theme === 'light' ? '#000' : '#fff' }}>
          Chưa có ghi chú nào được lưu trữ.
        </Text>
      ) : (
        <FlatList
          data={archivedNotes}
          keyExtractor={(_, index) => index.toString()}
          renderItem={({ item, index }) => (
            <TouchableOpacity
              activeOpacity={0.2}
              style={themedStyles.card}
              onPress={() => navigation.navigate('Detail', { noteId: item.id })}
            >
              <View style={themedStyles.cardContent}>
                <View style={{ flex: 1 }}>
                  <Text style={themedStyles.noteTitle}>{item.title}</Text>
                  <Text style={themedStyles.noteContent}>{item.content}</Text>
                  <Text style={themedStyles.dateText}>
                    {new Date(item.createdAt).toLocaleString()}
                  </Text>
                </View>
                <View style={themedStyles.actionsContainer}>
                  <TouchableOpacity
                    style={themedStyles.iconButton}
                    onPress={() => handleUnarchiveNote(index)}
                  >
                    <Ionicons
                      name="archive-outline"
                      size={24}
                      color="#FFD700"
                      style={{ transform: [{ rotate: '180deg' }] }}
                    />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={themedStyles.iconButton}
                    onPress={() => handleDeleteNote(index)}
                  >
                    <Ionicons name="trash-outline" size={24} color="red" />
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}
