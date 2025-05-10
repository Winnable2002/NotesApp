// types.ts

export type Note = {
    password: string;
    id: string;
    title: string;
    content: string;
    createdAt: string;
    locked?: boolean;
  };

export type RootStackParamList = {
    Login: undefined;
    Home: undefined;
    Detail: { noteId: string };
    Archive: undefined;
    Insert: undefined;
    Edit: { note: string; index: number };
    Settings: undefined;
    LockNote: { note: Note; onLock: (lockedNote: Note) => void };
    PasswordScreen: { note: Note }; // 👈 Thêm dòng này
    Register: undefined;

  };

  
  