import React, {
  useEffect,
  useState,
  useLayoutEffect,
  useCallback,
  useContext,
} from 'react';
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
import { ThemeContext } from '../ThemeContext'; 

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
  PasswordScreen: { note: Note; index: number; goToEdit?: boolean; onUnlock?: (unlockedNote: Note) => void };
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
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const themeContext = useContext(ThemeContext);
  if (!themeContext) {
    throw new Error('ThemeContext is undefined. Make sure you wrapped your app with ThemeProvider.');
  }
  const { theme } = themeContext;  
  const styles = getThemedStyles(theme);

  const loadNotes = useCallback(async () => {
    try {
      const path = `${RNFS.DocumentDirectoryPath}/${NOTES_KEY}`;
      const fileExists = await RNFS.exists(path);
      if (fileExists) {
        const json = await RNFS.readFile(path, 'utf8');
        const parsedNotes: Note[] = JSON.parse(json);
        const activeNotes = parsedNotes.filter(note => !note.archived);
        setNotes(activeNotes);
      }
    } catch (err) {
      console.error('Lỗi khi load NOTES:', err);
    }
  }, []);

  const loadArchivedNotes = useCallback(async () => {
    try {
      const path = `${RNFS.DocumentDirectoryPath}/${ARCHIVE_KEY}`;
      const fileExists = await RNFS.exists(path);
      if (fileExists) {
        const json = await RNFS.readFile(path, 'utf8');
        setArchivedNotes(JSON.parse(json));
      }
    } catch (err) {
      console.error('Lỗi khi load ARCHIVE:', err);
    }
  }, []);

  const saveNotesToFile = async (notes: Note[]) => {
    try {
      const path = `${RNFS.DocumentDirectoryPath}/${NOTES_KEY}`;
      const json = JSON.stringify(notes, null, 2);
      await RNFS.writeFile(path, json, 'utf8');
    } catch (err) {
      console.error('Lỗi ghi file notes.json:', err);
    }
  };

  const saveArchivedNotesToFile = async (archivedNotes: Note[]) => {
    try {
      const path = `${RNFS.DocumentDirectoryPath}/${ARCHIVE_KEY}`;
      const json = JSON.stringify(archivedNotes, null, 2);
      await RNFS.writeFile(path, json, 'utf8');
    } catch (err) {
      console.error('Lỗi ghi file archive.json:', err);
    }
  };

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
          loadNotes();
        },
      },
    ]);
  };

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
          await saveArchivedNotesToFile(updatedArchived);
          loadNotes();
          loadArchivedNotes();
        },
      },
    ]);
  };


  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity onPress={() => navigation.navigate('Settings')} style={{ marginRight: 16 }}>
          <Ionicons name="settings-outline" size={24} color={theme === 'light' ? '#8B795E' : '#x8B795E'} />
        </TouchableOpacity>
      ),
      title: 'Ghi chú',
    });
  }, [navigation, theme]);

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
  onPress={() => {
    if (note.locked) {
      // Đã khóa: yêu cầu nhập mật khẩu để mở khóa
      navigation.navigate('PasswordScreen', {
        note,
        index,
        goToEdit: true,
        onUnlock: (unlockedNote: Note) => {
          const updatedNotes = [...notes];
          const noteIndex = updatedNotes.findIndex(n => n.id === note.id);
          if (noteIndex !== -1) {
            updatedNotes[noteIndex] = unlockedNote;
            setNotes(updatedNotes);
            saveNotesToFile(updatedNotes);
          }
        },
      });
    } else {
      // Chưa khóa: mở màn hình khóa
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
      });
    }
  }}
>
  <Ionicons
    name={note.locked ? 'lock-open-outline' : 'lock-closed-outline'}
    size={24}
    color={note.locked ? '#66CC00' : '#0000CD'} // xanh lá khi đã khóa
  />
</TouchableOpacity>

      <TouchableOpacity style={styles.iconButton} onPress={() => handleArchiveNote(index)}>
        <Ionicons name="archive-outline" size={24} color={theme === 'light' ? '#48D1CC' : '#473C8B'} />
      </TouchableOpacity>
      <TouchableOpacity
          style={styles.iconButton}
          onPress={() => {
            if (note.locked && !unlockedNotes.includes(note.id)) {
              navigation.navigate('PasswordScreen', {
                note,
                index,
                goToEdit: true, // <-- CHUYỂN SANG EDIT nếu nhập đúng mật khẩu
              });
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
                  ? '🔒'
                  : item.content}
              </Text>
              <Text style={styles.dateText}>{formatDateTime(item.createdAt)}</Text>
              {longPressIndex === index && renderActions(index, item)}
            </TouchableOpacity>
          )}
          ListEmptyComponent={<Text style={styles.emptyText}>Chưa có ghi chú nào</Text>}
        />
        <TouchableOpacity style={styles.addButton} onPress={() => navigation.navigate('Insert')}>
          <Ionicons name="add" size={30} color={theme === 'light' ? '#FF6600' : '#fff'} />
        </TouchableOpacity>
      </View>
    </TouchableWithoutFeedback>
  );
};

const getThemedStyles = (theme: 'light' | 'dark') =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme === 'light' ? '#EEE8AA' : '#121212',
      padding: 16,
    },
    title: {
      textAlign: 'center',
      fontSize: 24,
      fontWeight: 'bold',
      marginBottom: 16,
      color: theme === 'light' ? '#000' : '#fff',
    },
    card: {
      marginBottom: 10,
      padding: 10,
      backgroundColor: theme === 'light' ? '#EECFA1' : '#008B8B',
      borderRadius: 8,
      shadowColor: '#000',
      shadowOpacity: 0.1,
      shadowRadius: 4,
    },
    noteTitle: {
      textAlign: 'center',
      fontSize: 18,
      fontWeight: 'bold',
      color: theme === 'light' ? '#000' : '#fff',
    },
    noteContent: {
      fontSize: 14,
      marginTop: 8,
      color: theme === 'light' ? '#555' : '#ccc',
      textAlign: 'left',
    },
    dateText: {
      paddingLeft:235,
      fontSize: 12,
      marginTop: 5,
      color: theme === 'light' ? '#000' : '#999',
    },
    actionsContainer: {
      flexDirection: 'row',
      marginTop: 10,
    },
    iconButton: {
      marginLeft: 30,
      paddingHorizontal: 10,
      borderRadius: 50,
      
    },
    emptyText: {
      textAlign: 'center',
      color: '#aaa',
      fontSize: 18,
    },
    addButton: {
      position: 'absolute',
      bottom: 30,
      right: 30,
      backgroundColor: theme === 'light' ? '#EECFA1' : '#008B8B',
      padding: 16,
      borderRadius: 50,
      elevation: 5,
    },
  });

export default HomeScreen;
