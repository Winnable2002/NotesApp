import React, { useEffect, useState, useLayoutEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Alert,
  TouchableWithoutFeedback,
} from 'react-native';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Ionicons from 'react-native-vector-icons/Ionicons';
import RNFS from 'react-native-fs';

const NOTES_KEY = 'notes.json';
const ARCHIVE_KEY = 'archive.json';

interface Note {
  id: string;
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
  PasswordScreen: { note: Note; index: number; goToEdit?: boolean };
};

const formatDateTime = (isoString: string) => {
  const date = new Date(isoString);
  return `${date.toLocaleDateString('vi-VN')} ${date.toLocaleTimeString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
  })}`;
};

const HomeScreen = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [archivedNotes, setArchivedNotes] = useState<Note[]>([]);
  const [unlockedNotes, setUnlockedNotes] = useState<string[]>([]);
  const [longPressIndex, setLongPressIndex] = useState<number | null>(null);
  const isFocused = useIsFocused();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList, 'Home'>>();

  // Load notes from file
  const loadNotes = useCallback(async () => {
    try {
      const path = `${RNFS.DocumentDirectoryPath}/${NOTES_KEY}`;
      const fileExists = await RNFS.exists(path);
      if (fileExists) {
        const json = await RNFS.readFile(path, 'utf8');
        const parsedNotes: Note[] = JSON.parse(json);
        const activeNotes = parsedNotes.filter(note => !note.archived);
        setNotes(activeNotes);
      } else {
        console.log('File notes.json không tồn tại');
      }
    } catch (err) {
      console.error('Lỗi khi load NOTES:', err);
    }
  }, []);
  

  // Load archived notes from file
  const loadArchivedNotes = useCallback(async () => {
    try {
      const path = `${RNFS.DocumentDirectoryPath}/${ARCHIVE_KEY}`;
      const fileExists = await RNFS.exists(path);
      if (fileExists) {
        const json = await RNFS.readFile(path, 'utf8');
        setArchivedNotes(JSON.parse(json));
      } else {
        console.log('File archive.json không tồn tại');
      }
    } catch (err) {
      console.error('Lỗi khi load ARCHIVE:', err);
    }
  }, []);

  // Save notes to file
  const saveNotesToFile = async (notes: Note[]) => {
    try {
      const path = `${RNFS.DocumentDirectoryPath}/${NOTES_KEY}`;
      const json = JSON.stringify(notes, null, 2);
      await RNFS.writeFile(path, json, 'utf8');
      console.log('✅ File notes.json đã được cập nhật tại:', path);
    } catch (err) {
      console.error('❌ Lỗi ghi file notes.json:', err);
    }
  };
  

  // Save archived notes to file
  const saveArchivedNotesToFile = async (archivedNotes: Note[]) => {
    try {
      const path = `${RNFS.DocumentDirectoryPath}/${ARCHIVE_KEY}`;
      const json = JSON.stringify(archivedNotes, null, 2);
      await RNFS.writeFile(path, json, 'utf8');
      console.log('✅ File archive.json đã được cập nhật tại:', path);
    } catch (err) {
      console.error('❌ Lỗi ghi file archive.json:', err);
    }
  };

  // Handle delete note
  const handleDeleteNote = async (index: number) => {
    Alert.alert('Xác nhận xoá', 'Bạn có chắc muốn xoá ghi chú này?', [
      { text: 'Huỷ', style: 'cancel' },
      {
        text: 'Xoá',
        style: 'destructive',
        onPress: async () => {
          const updatedNotes = [...notes];
          updatedNotes.splice(index, 1);
          setNotes(updatedNotes);
          await saveNotesToFile(updatedNotes);
          loadNotes(); // Làm mới danh sách ghi chú
        },
      },
    ]);
  };

  // Handle archive note
  const handleArchiveNote = async (index: number) => {
    Alert.alert('Lưu trữ ghi chú', 'Bạn có chắc chắn muốn lưu trữ ghi chú này?', [
      { text: 'Huỷ', style: 'cancel' },
      {
        text: 'Lưu trữ',
        onPress: async () => {
          const updatedNotes = [...notes];
          const noteToArchive = { ...updatedNotes[index] };
          updatedNotes.splice(index, 1);
          const updatedArchived = [...archivedNotes, noteToArchive];
          setNotes(updatedNotes);
          setArchivedNotes(updatedArchived);
          await saveNotesToFile(updatedNotes);
          await saveArchivedNotesToFile(updatedArchived); // Lưu trữ ghi chú vào archive
          loadNotes(); // Làm mới danh sách ghi chú
          loadArchivedNotes(); // Làm mới danh sách ghi chú đã lưu trữ
        },
      },
    ]);
  };

  // Unlock note
  const handleUnlock = (note: Note) => {
    if (!unlockedNotes.includes(note.id)) {
      setUnlockedNotes(prev => [...prev, note.id]);
    }
    navigation.navigate('Detail', { note });
  };

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

  useEffect(() => {
    if (isFocused) {
      loadNotes();
      loadArchivedNotes();
    }
  }, [isFocused, loadNotes, loadArchivedNotes]);

  const renderActions = (index: number, note: Note) => (
    <View style={styles.actionsContainer}>
      <TouchableOpacity
        style={styles.iconButton}
        onPress={() =>
          navigation.navigate('LockNote', {
            note,
            onLock: (lockedNote: Note) => {
              const updatedNotes = [...notes];
              const noteIndex = updatedNotes.findIndex(n => n.id === note.id);
              if (noteIndex !== -1) {
                updatedNotes[noteIndex] = lockedNote;
                setNotes(updatedNotes);
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
          if (note.locked && !unlockedNotes.includes(note.id)) {
            navigation.navigate('PasswordScreen', { note, index });
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

  return (
    <TouchableWithoutFeedback onPress={() => setLongPressIndex(null)}>
      <View style={styles.container}>
        <Text style={styles.title}>📒 Danh sách ghi chú</Text>
        <FlatList
          data={notes}
          keyExtractor={(item) => item.id}
          renderItem={({ item, index }) => (
            <TouchableOpacity
              style={styles.card}
              activeOpacity={0.6}
              onLongPress={() => setLongPressIndex(index)}
              onPress={() => {
                if (item.locked && !unlockedNotes.includes(item.id)) {
                  navigation.navigate('PasswordScreen', { note: item, index });
                } else {
                  navigation.navigate('Detail', { note: item });
                }
              }}
            >
              <Text style={styles.noteTitle}>
                {item.title}{' '}
                {item.locked && <Ionicons name="lock-closed-outline" size={14} color="red" />}
              </Text>
              <Text style={styles.noteContent} numberOfLines={2}>
                {item.locked && !unlockedNotes.includes(item.id)
                  ? '🔒 Nội dung đã bị khóa'
                  : item.content}
              </Text>
              <Text style={styles.dateText}>{formatDateTime(item.createdAt)}</Text>
              {longPressIndex === index && renderActions(index, item)}
            </TouchableOpacity>
          )}
          ListEmptyComponent={<Text style={styles.emptyText}>Chưa có ghi chú nào</Text>}
        />
        <TouchableOpacity style={styles.addButton} onPress={() => navigation.navigate('Insert')}>
          <Ionicons name="add" size={30} color="#FF6600" />
        </TouchableOpacity>
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 16 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 16 },
  card: { marginBottom: 10, padding: 10, backgroundColor: '#f9f9f9', borderRadius: 8, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4 },
  noteTitle: { fontSize: 18, fontWeight: 'bold' },
  noteContent: { fontSize: 14, marginTop: 8, color: '#555' },
  dateText: { fontSize: 12, marginTop: 5, color: '#aaa' },
  actionsContainer: { flexDirection: 'row', marginTop: 10 },
  iconButton: { marginRight: 12 },
  emptyText: { textAlign: 'center', color: '#aaa', fontSize: 18 },
  addButton: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    backgroundColor: '#EECFA1',
    padding: 16,
    borderRadius: 50,
    elevation: 5,
  },});

export default HomeScreen;
