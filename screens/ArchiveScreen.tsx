import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Ionicons from 'react-native-vector-icons/Ionicons';
import RNFS from 'react-native-fs';  // Thêm RNFS vào
import { useTheme } from '../ThemeContext';
import { RootStackParamList } from '../types';

const ARCHIVE_FILE_PATH = `${RNFS.DocumentDirectoryPath}/archive.json`;

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
    try {
      const fileExists = await RNFS.exists(ARCHIVE_FILE_PATH);
      if (fileExists) {
        const fileContent = await RNFS.readFile(ARCHIVE_FILE_PATH, 'utf8');
        const parsedArchivedNotes = JSON.parse(fileContent);
        setArchivedNotes(parsedArchivedNotes);
      } else {
        console.log('File archive.json không tồn tại');
      }
    } catch (error) {
      console.log('Lỗi khi đọc file archive.json:', error);
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
            await RNFS.writeFile(ARCHIVE_FILE_PATH, JSON.stringify(updatedArchivedNotes), 'utf8');
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

            const notesJson = await RNFS.readFile(`${RNFS.DocumentDirectoryPath}/notes.json`, 'utf8');
            const existingNotes = JSON.parse(notesJson || '[]');
            const updatedNotes = [...existingNotes, unarchivedNote];

            await RNFS.writeFile(`${RNFS.DocumentDirectoryPath}/notes.json`, JSON.stringify(updatedNotes), 'utf8');
            await RNFS.writeFile(ARCHIVE_FILE_PATH, JSON.stringify(updatedArchivedNotes), 'utf8');

            setArchivedNotes(updatedArchivedNotes);
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
      marginTop: 50,
      marginBottom: 30,
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
      <TouchableOpacity
        style={{   marginTop: 50, marginLeft: 10}}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="arrow-back" size={24} color={theme === 'light' ? '#000' : '#fff'} />
      </TouchableOpacity>

      <Text style={themedStyles.title}> Ghi chú đã lưu trữ</Text>

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
                      color={theme === 'light' ? '#48D1CC' : '#473C8B'}
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
