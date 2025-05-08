import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, Image,
  Alert, Modal, StyleSheet, SafeAreaView
} from 'react-native';
import { useTheme } from '../ThemeContext';
import RNFS from 'react-native-fs';

const NOTES_FILE_PATH = `${RNFS.DocumentDirectoryPath}/notes.json`;

const imageMap = {
  'Apple.jpg': require('../assets/images/Apple.jpg'),
  'Book.jpg': require('../assets/images/Book.jpg'),
  'Swimming.jpg': require('../assets/images/Swimming.jpg'),
};

export default function EditNoteScreen({ route, navigation }: any) {
  const { note, index } = route.params;
  const [title, setTitle] = useState(note.title);
  const [content, setContent] = useState(note.content);
  const [imageName, setImageName] = useState<keyof typeof imageMap | null>(note.image || null);
  const [modalVisible, setModalVisible] = useState(false);
  const { theme } = useTheme();
  const themedStyles = getThemedStyles(theme);

  // Đọc ghi chú từ file
  const readNotesFromFile = async () => {
    try {
      const exists = await RNFS.exists(NOTES_FILE_PATH);
      if (exists) {
        const content = await RNFS.readFile(NOTES_FILE_PATH, 'utf8');
        return content ? JSON.parse(content) : [];
      }
      return [];
    } catch (err) {
      console.error('Lỗi đọc file:', err);
      return [];
    }
  };

  // Ghi chú vào file
  const writeNotesToFile = async (notes: any[]) => {
    try {
      await RNFS.writeFile(NOTES_FILE_PATH, JSON.stringify(notes, null, 2), 'utf8');
    } catch (err) {
      console.error('Lỗi ghi file:', err);
    }
  };

  const handleUpdate = async () => {
    if (title.trim() === '' || content.trim() === '') {
      Alert.alert('Lỗi', 'Vui lòng nhập tiêu đề và nội dung');
      return;
    }
  
    try {
      const notes = await readNotesFromFile();
  
      if (index < 0 || index >= notes.length) {
        Alert.alert('Lỗi', 'Không tìm thấy ghi chú để cập nhật');
        return;
      }
  
      notes[index] = {
        ...notes[index],
        title,
        content,
        image: imageName,
        updatedAt: new Date().toLocaleString(),
      };
  
      await writeNotesToFile(notes);
  
      Alert.alert('✅ Thành công', 'Ghi chú đã được cập nhật!');
      setTimeout(() => {
        // Truyền dữ liệu đã cập nhật qua navigation
        navigation.goBack();
      }, 1000);
    } catch (error) {
      console.error('❌ Lỗi cập nhật:', error);
      Alert.alert('Lỗi', 'Không thể cập nhật ghi chú. Vui lòng thử lại.');
    }
  };
  

  const selectImage = (selectedName: keyof typeof imageMap) => {
    setImageName(selectedName);
    setModalVisible(false);
  };

  const deleteImage = () => setImageName(null);

  return (
    <View style={themedStyles.container}>
      <Text style={themedStyles.label}>Tiêu đề</Text>
      <TextInput
        placeholder="Tiêu đề"
        style={themedStyles.input}
        value={title}
        onChangeText={setTitle}
      />

      <Text style={themedStyles.label}>Nội dung</Text>
      <TextInput
        placeholder="Nội dung"
        style={[themedStyles.input, { height: 100 }]}
        multiline
        value={content}
        onChangeText={setContent}
      />

      {imageName && imageMap[imageName] && (
        <View style={themedStyles.imageContainer}>
          <Image source={imageMap[imageName]} style={themedStyles.image} resizeMode="cover" />
          <TouchableOpacity onPress={deleteImage} style={themedStyles.deleteButton}>
            <Text style={themedStyles.deleteButtonText}>Xóa ảnh</Text>
          </TouchableOpacity>
        </View>
      )}

      <TouchableOpacity style={themedStyles.button} onPress={handleUpdate}>
        <Text style={themedStyles.buttonText}>Cập nhật</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => setModalVisible(true)} style={themedStyles.button}>
        <Text style={themedStyles.buttonText}>Chọn ảnh</Text>
      </TouchableOpacity>

      {/* Modal chọn ảnh */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <SafeAreaView style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Chọn ảnh</Text>
            {Object.entries(imageMap).map(([name]) => (
              <TouchableOpacity
                key={name}
                onPress={() => selectImage(name as keyof typeof imageMap)}
                style={styles.imageOption}
              >
                <Text style={styles.imageOptionText}>{name}</Text>
              </TouchableOpacity>
            ))}

            <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>Đóng</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>
    </View>
  );
}

const getThemedStyles = (theme: 'light' | 'dark') =>
  StyleSheet.create({
    container: {
      flex: 1,
      padding: 20,
      backgroundColor: theme === 'light' ? '#EEE8AA' : '#121212',
    },
    label: {
      fontSize: 16,
      fontWeight: 'bold',
      marginBottom: 8,
      color: theme === 'light' ? '#000' : '#fff',
    },
    input: {
      borderWidth: 1,
      borderColor: theme === 'light' ? '#ccc' : '#555',
      backgroundColor: theme === 'light' ? '#fff' : '#1e1e1e',
      color: theme === 'light' ? '#000' : '#fff',
      borderRadius: 8,
      padding: 12,
      marginBottom: 16,
    },
    button: {
      padding: 16,
      backgroundColor: '#007bff',
      borderRadius: 8,
      alignItems: 'center',
      marginTop: 10,
    },
    buttonText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: 'bold',
    },
    imageContainer: {
      alignItems: 'center',
      marginBottom: 16,
    },
    image: {
      width: 150,
      height: 100,
      borderRadius: 8,
    },
    deleteButton: {
      marginTop: 10,
      backgroundColor: '#FF6347',
      padding: 10,
      borderRadius: 8,
    },
    deleteButtonText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: 'bold',
    },
  });

const styles = StyleSheet.create({
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 8,
    width: 300,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  imageOption: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  imageOptionText: {
    fontSize: 16,
  },
  closeButton: {
    marginTop: 10,
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
  },
});
