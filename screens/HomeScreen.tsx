import React, { useEffect, useState, useLayoutEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Alert,
  TouchableWithoutFeedback,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Ionicons from 'react-native-vector-icons/Ionicons';
import RNFS from 'react-native-fs';

const NOTES_KEY = 'NOTES';
const ARCHIVE_KEY = 'ARCHIVE';

interface Note {
  title: string;
  content: string;
  createdAt: string;
  archived: boolean;
  locked?: boolean;
  password?: string;
}

type RootStackParamList = {
  Home: undefined;
  Insert: undefined;
  Detail: { note: Note };
  Edit: { note: Note; index: number };
  Settings: undefined;
  Archive: undefined;
  LockNote: { note: Note; onLock: (lockedNote: Note) => void };
  UnlockNote: { note: Note; index: number };
};

const formatDateTime = (isoString: string) => {
  const date = new Date(isoString);
  return `${date.toLocaleDateString('vi-VN')} ${date.toLocaleTimeString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
  })}`;
};

export default function HomeScreen() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [archivedNotes, setArchivedNotes] = useState<Note[]>([]);
  const [longPressIndex, setLongPressIndex] = useState<number | null>(null);
  const isFocused = useIsFocused();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList, 'Home'>>();

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity onPress={() => navigation.navigate('Settings')} style={{ marginRight: 16 }}>
          <Ionicons name="settings-outline" size={24} color="#8B4513" />
        </TouchableOpacity>
      ),
      title: 'Ghi chú',
    });
  }, [navigation]);

  const loadNotes = React.useCallback(async () => {
    const json = await AsyncStorage.getItem(NOTES_KEY);
    if (json) {
      const parsedNotes: Note[] = JSON.parse(json);
      setNotes(parsedNotes.filter(note => !note.archived));
    }
  }, []);

  const loadArchivedNotes = React.useCallback(async () => {
    const json = await AsyncStorage.getItem(ARCHIVE_KEY);
    if (json) {
      setArchivedNotes(JSON.parse(json));
    }
  }, []);

  useEffect(() => {
    if (isFocused) {
      loadNotes();
      loadArchivedNotes();
    }
  }, [isFocused, loadNotes, loadArchivedNotes]);

  const saveNotesToFile = async (notesToSave: Note[]) => {
    const path = `${RNFS.DocumentDirectoryPath}/notes.json`;
    try {
      const notesToSaveWithHiddenContent = notesToSave.map(note => {
        if (note.locked) {
          return { title: note.title, locked: true };
        }
        return note;
      });

      await RNFS.writeFile(path, JSON.stringify(notesToSaveWithHiddenContent, null, 2), 'utf8');
    } catch (err) {
      console.error('Lỗi khi ghi vào file:', err);
    }
  };

  const handleDeleteNote = (index: number) => {
    Alert.alert('Xác nhận xoá', 'Bạn có chắc muốn xoá ghi chú này?', [
      { text: 'Huỷ', style: 'cancel' },
      {
        text: 'Xoá',
        style: 'destructive',
        onPress: async () => {
          const updatedNotes = [...notes];
          updatedNotes.splice(index, 1);
          setNotes(updatedNotes);
          await AsyncStorage.setItem(NOTES_KEY, JSON.stringify(updatedNotes));
          await saveNotesToFile(updatedNotes);
        },
      },
    ]);
  };

  const handleArchiveNote = (index: number) => {
    Alert.alert('Lưu trữ ghi chú', 'Bạn có chắc chắn muốn lưu trữ ghi chú này?', [
      { text: 'Huỷ', style: 'cancel' },
      {
        text: 'Lưu trữ',
        onPress: async () => {
          try {
            const updatedNotes = [...notes];
            const noteToArchive = { ...updatedNotes[index] };
            updatedNotes.splice(index, 1);
            const updatedArchived = [...archivedNotes, noteToArchive];
            await AsyncStorage.setItem(NOTES_KEY, JSON.stringify(updatedNotes));
            await AsyncStorage.setItem(ARCHIVE_KEY, JSON.stringify(updatedArchived));
            setNotes(updatedNotes);
            setArchivedNotes(updatedArchived);
            await saveNotesToFile(updatedNotes);
          } catch (error) {
            Alert.alert('Lỗi', 'Không thể lưu trữ ghi chú.');
          }
        },
      },
    ]);
  };

  const renderActions = (index: number, note: Note) => (
    <View style={styles.actionsContainer}>
      <TouchableOpacity
        style={styles.iconButton}
        onPress={() =>
          navigation.navigate('LockNote', {
            note,
            onLock: (lockedNote: Note) => {
              const updatedNotes = [...notes];
              const noteIndex = updatedNotes.findIndex((n) => n === note);
              if (noteIndex !== -1) {
                updatedNotes[noteIndex] = lockedNote;
                setNotes(updatedNotes);
                AsyncStorage.setItem(NOTES_KEY, JSON.stringify(updatedNotes));
                saveNotesToFile(updatedNotes);
              }
            },
          })
        }
      >
        <Ionicons name="lock-closed-outline" size={24} color="#0000CD" />
      </TouchableOpacity>
      <TouchableOpacity style={styles.iconButton} onPress={() => handleArchiveNote(index)}>
        <Ionicons name="archive-outline" size={24} color="#FFD700" />
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.iconButton}
        onPress={() => {
          if (note.locked) {
            Alert.prompt(
              '🔒 Nhập mật khẩu',
              'Bạn cần nhập mật khẩu để chỉnh sửa ghi chú này.',
              [
                { text: 'Huỷ', style: 'cancel' },
                {
                  text: 'Xác nhận',
                  onPress: (inputPassword) => {
                    if (inputPassword === note.password) {
                      navigation.navigate('Edit', { note, index });
                    } else {
                      Alert.alert('Sai mật khẩu', 'Vui lòng thử lại.');
                    }
                  },
                },
              ],
              'secure-text'
            );
          } else {
            navigation.navigate('Edit', { note, index });
          }
        }}
      >
        <Ionicons name="create-outline" size={24} color="#FF9900" />
      </TouchableOpacity>
      <TouchableOpacity style={styles.iconButton} onPress={() => handleDeleteNote(index)}>
        <Ionicons name="trash-outline" size={24} color="red" />
      </TouchableOpacity>
    </View>
  );

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: 16,
      backgroundColor: '#EEE8AA',
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      textAlign: 'center',
      marginBottom: 12,
      color: '#000',
    },
    card: {
      backgroundColor: '#FFDAB9',
      padding: 16,
      borderRadius: 10,
      elevation: 2,
      marginBottom: 12,
    },
    noteTitle: {
      fontSize: 16,
      fontWeight: 'bold',
      color: '#000',
    },
    noteContent: {
      fontSize: 14,
      color: '#333',
    },
    dateText: {
      fontSize: 12,
      color: '#888',
      marginTop: 6,
    },
    actionsContainer: {
      flexDirection: 'row-reverse',
      justifyContent: 'flex-start',
      backgroundColor: '#FFF',
      borderRadius: 8,
      padding: 6,
      marginTop: 10,
      alignSelf: 'flex-end',
      width: 'auto',
    },
    iconButton: {
      marginHorizontal: 10,
    },
    addButton: {
      position: 'absolute',
      right: 20,
      bottom: 30,
      backgroundColor: '#007AFF',
      width: 56,
      height: 56,
      borderRadius: 28,
      alignItems: 'center',
      justifyContent: 'center',
      elevation: 4,
    },
    emptyText: {
      textAlign: 'center',
      color: '#888',
      marginTop: 20,
    },
  });

  return (
    <TouchableWithoutFeedback onPress={() => setLongPressIndex(null)}>
      <View style={styles.container}>
        <Text style={styles.title}>📒 Danh sách ghi chú</Text>
        <FlatList
          data={notes}
          keyExtractor={(_, index) => index.toString()}
          renderItem={({ item, index }) => (
            <TouchableOpacity
              style={styles.card}
              activeOpacity={0.6}
              onLongPress={() => setLongPressIndex(index)}
              onPress={() => {
                if (item.locked) {
                  navigation.navigate('UnlockNote', { note: item, index });
                } else {
                  navigation.navigate('Detail', { note: item });
                }
              }}
            >
              <Text style={styles.noteTitle}>
                {item.title}{' '}
                {item.locked && (
                  <Ionicons name="lock-closed-outline" size={14} color="red" />
                )}
              </Text>

              <Text style={styles.noteContent} numberOfLines={2}>
                {item.locked ? '🔒 Nội dung đã bị khóa' : item.content}
              </Text>

              <Text style={styles.dateText}>{formatDateTime(item.createdAt)}</Text>

              {longPressIndex === index && renderActions(index, item)}
            </TouchableOpacity>
          )}
          ListEmptyComponent={<Text style={styles.emptyText}>Chưa có ghi chú nào</Text>}
        />
        <TouchableOpacity style={styles.addButton} onPress={() => navigation.navigate('Insert')}>
          <Ionicons name="add" size={28} color="#fff" />
        </TouchableOpacity>
      </View>
    </TouchableWithoutFeedback>
  );
}