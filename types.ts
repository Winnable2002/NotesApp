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
    UnlockNote: { note: Note; index: number }; // Thêm UnlockNote vào đây
  };

  
  