# FibreFlow React - API Migration Guide

## Overview

This guide provides comprehensive patterns and examples for migrating from Angular services to React services, maintaining the same Firebase backend while adopting React patterns.

---

## Service Architecture Migration

### Angular Service Pattern
```typescript
// Angular Service with RxJS
@Injectable({ providedIn: 'root' })
export class ProjectService {
  private projectsCollection: AngularFirestoreCollection<Project>;
  projects$: Observable<Project[]>;

  constructor(private firestore: AngularFirestore) {
    this.projectsCollection = firestore.collection<Project>('projects');
    this.projects$ = this.projectsCollection.valueChanges({ idField: 'id' });
  }

  getProjects(): Observable<Project[]> {
    return this.projects$;
  }

  getProject(id: string): Observable<Project> {
    return this.projectsCollection.doc(id).valueChanges();
  }

  createProject(project: Project): Promise<void> {
    const id = this.firestore.createId();
    return this.projectsCollection.doc(id).set(project);
  }
}
```

### React Service Pattern
```typescript
// React Service with Firebase SDK
import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc,
  onSnapshot,
  query,
  where,
  orderBy,
  Timestamp
} from 'firebase/firestore';
import { db } from '@/config/firebase';

export const projectService = {
  // Get all projects
  async getProjects() {
    const snapshot = await getDocs(collection(db, 'projects'));
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Project));
  },

  // Get single project
  async getProject(id: string) {
    const docRef = doc(db, 'projects', id);
    const snapshot = await getDoc(docRef);
    
    if (!snapshot.exists()) {
      throw new Error('Project not found');
    }
    
    return {
      id: snapshot.id,
      ...snapshot.data()
    } as Project;
  },

  // Create project
  async createProject(project: Omit<Project, 'id'>) {
    const docRef = await addDoc(collection(db, 'projects'), {
      ...project,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });
    return docRef.id;
  },

  // Update project
  async updateProject(id: string, updates: Partial<Project>) {
    const docRef = doc(db, 'projects', id);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: Timestamp.now()
    });
  },

  // Delete project
  async deleteProject(id: string) {
    await deleteDoc(doc(db, 'projects', id));
  },

  // Real-time subscription
  subscribeToProjects(callback: (projects: Project[]) => void) {
    return onSnapshot(collection(db, 'projects'), (snapshot) => {
      const projects = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Project));
      callback(projects);
    });
  },

  // Complex query
  async getActiveProjectsByManager(managerId: string) {
    const q = query(
      collection(db, 'projects'),
      where('projectManager.id', '==', managerId),
      where('status', '==', 'active'),
      orderBy('createdAt', 'desc')
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Project));
  }
};
```

---

## Hook Patterns for Data Fetching

### Basic Query Hook
```typescript
// hooks/useProjects.ts
import { useQuery } from '@tanstack/react-query';
import { projectService } from '@/services/projectService';

export function useProjects() {
  return useQuery({
    queryKey: ['projects'],
    queryFn: projectService.getProjects,
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });
}
```

### Detailed Query Hook with Parameters
```typescript
// hooks/useProject.ts
export function useProject(projectId: string) {
  return useQuery({
    queryKey: ['projects', projectId],
    queryFn: () => projectService.getProject(projectId),
    enabled: !!projectId,
    retry: 2,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}
```

### Real-time Subscription Hook
```typescript
// hooks/useProjectsRealtime.ts
import { useEffect, useState } from 'react';
import { projectService } from '@/services/projectService';

export function useProjectsRealtime() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    setLoading(true);
    
    const unsubscribe = projectService.subscribeToProjects(
      (data) => {
        setProjects(data);
        setLoading(false);
        setError(null);
      },
      (err) => {
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  return { projects, loading, error };
}
```

### Mutation Hook
```typescript
// hooks/useCreateProject.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { projectService } from '@/services/projectService';
import { toast } from 'sonner';

export function useCreateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: projectService.createProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast.success('Project created successfully');
    },
    onError: (error) => {
      toast.error(`Failed to create project: ${error.message}`);
    },
  });
}
```

---

## Authentication Migration

### Angular Auth Service
```typescript
// Angular
@Injectable({ providedIn: 'root' })
export class AuthService {
  user$: Observable<User>;

  constructor(private afAuth: AngularFireAuth) {
    this.user$ = this.afAuth.authState;
  }

  async login(email: string, password: string) {
    return this.afAuth.signInWithEmailAndPassword(email, password);
  }

  async loginWithGoogle() {
    const provider = new firebase.auth.GoogleAuthProvider();
    return this.afAuth.signInWithPopup(provider);
  }
}
```

### React Auth Service & Context
```typescript
// services/authService.ts
import { 
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  User
} from 'firebase/auth';
import { auth } from '@/config/firebase';

export const authService = {
  async login(email: string, password: string) {
    return signInWithEmailAndPassword(auth, email, password);
  },

  async loginWithGoogle() {
    const provider = new GoogleAuthProvider();
    return signInWithPopup(auth, provider);
  },

  async logout() {
    return signOut(auth);
  },

  onAuthStateChange(callback: (user: User | null) => void) {
    return onAuthStateChanged(auth, callback);
  }
};

// contexts/AuthContext.tsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from 'firebase/auth';
import { authService } from '@/services/authService';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = authService.onAuthStateChange((user) => {
      setUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const login = async (email: string, password: string) => {
    await authService.login(email, password);
  };

  const loginWithGoogle = async () => {
    await authService.loginWithGoogle();
  };

  const logout = async () => {
    await authService.logout();
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, loginWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
```

---

## File Upload Migration

### Angular File Upload
```typescript
// Angular
uploadFile(file: File): Observable<number> {
  const filePath = `uploads/${Date.now()}_${file.name}`;
  const fileRef = this.storage.ref(filePath);
  const task = this.storage.upload(filePath, file);
  
  return task.percentageChanges();
}
```

### React File Upload
```typescript
// services/uploadService.ts
import { 
  ref, 
  uploadBytesResumable, 
  getDownloadURL,
  deleteObject 
} from 'firebase/storage';
import { storage } from '@/config/firebase';

export const uploadService = {
  uploadFile(
    file: File, 
    path: string,
    onProgress?: (progress: number) => void
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      const storageRef = ref(storage, `${path}/${Date.now()}_${file.name}`);
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          onProgress?.(progress);
        },
        (error) => {
          reject(error);
        },
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          resolve(downloadURL);
        }
      );
    });
  },

  async deleteFile(url: string) {
    const storageRef = ref(storage, url);
    await deleteObject(storageRef);
  }
};

// hooks/useFileUpload.ts
export function useFileUpload() {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const upload = async (file: File, path: string) => {
    setUploading(true);
    setProgress(0);

    try {
      const url = await uploadService.uploadFile(
        file,
        path,
        (progress) => setProgress(progress)
      );
      return url;
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  return { upload, uploading, progress };
}
```

---

## Complex Data Operations

### Batch Operations
```typescript
// services/batchService.ts
import { writeBatch, doc } from 'firebase/firestore';
import { db } from '@/config/firebase';

export const batchService = {
  async batchUpdate(updates: Array<{ id: string; data: any; collection: string }>) {
    const batch = writeBatch(db);

    updates.forEach(({ id, data, collection }) => {
      const docRef = doc(db, collection, id);
      batch.update(docRef, data);
    });

    await batch.commit();
  },

  async batchDelete(ids: string[], collectionName: string) {
    const batch = writeBatch(db);

    ids.forEach(id => {
      const docRef = doc(db, collectionName, id);
      batch.delete(docRef);
    });

    await batch.commit();
  }
};
```

### Transaction Operations
```typescript
// services/transactionService.ts
import { runTransaction, doc } from 'firebase/firestore';
import { db } from '@/config/firebase';

export const transactionService = {
  async transferStock(
    fromItemId: string,
    toItemId: string,
    quantity: number
  ) {
    return runTransaction(db, async (transaction) => {
      const fromRef = doc(db, 'stockItems', fromItemId);
      const toRef = doc(db, 'stockItems', toItemId);

      const fromDoc = await transaction.get(fromRef);
      const toDoc = await transaction.get(toRef);

      if (!fromDoc.exists() || !toDoc.exists()) {
        throw new Error('Stock items not found');
      }

      const fromStock = fromDoc.data().currentStock;
      const toStock = toDoc.data().currentStock;

      if (fromStock < quantity) {
        throw new Error('Insufficient stock');
      }

      transaction.update(fromRef, { currentStock: fromStock - quantity });
      transaction.update(toRef, { currentStock: toStock + quantity });
    });
  }
};
```

---

## Offline Support

### Offline Persistence Setup
```typescript
// config/firebase.ts
import { initializeApp } from 'firebase/app';
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

// Enable offline persistence
enableIndexedDbPersistence(db).catch((err) => {
  if (err.code === 'failed-precondition') {
    console.warn('Multiple tabs open, persistence enabled in first tab only');
  } else if (err.code === 'unimplemented') {
    console.warn('Browser doesn't support persistence');
  }
});
```

### Offline Queue Service
```typescript
// services/offlineQueueService.ts
interface QueueItem {
  id: string;
  action: 'create' | 'update' | 'delete';
  collection: string;
  data: any;
  timestamp: number;
}

export const offlineQueueService = {
  queue: [] as QueueItem[],

  addToQueue(item: Omit<QueueItem, 'id' | 'timestamp'>) {
    const queueItem: QueueItem = {
      ...item,
      id: crypto.randomUUID(),
      timestamp: Date.now()
    };
    
    this.queue.push(queueItem);
    localStorage.setItem('offlineQueue', JSON.stringify(this.queue));
  },

  async processQueue() {
    if (!navigator.onLine) return;

    const queue = [...this.queue];
    this.queue = [];

    for (const item of queue) {
      try {
        await this.processItem(item);
      } catch (error) {
        console.error('Failed to process queue item:', error);
        this.queue.push(item);
      }
    }

    localStorage.setItem('offlineQueue', JSON.stringify(this.queue));
  },

  async processItem(item: QueueItem) {
    const { action, collection, data } = item;

    switch (action) {
      case 'create':
        await addDoc(collection(db, collection), data);
        break;
      case 'update':
        await updateDoc(doc(db, collection, data.id), data);
        break;
      case 'delete':
        await deleteDoc(doc(db, collection, data.id));
        break;
    }
  }
};
```

---

## Error Handling Patterns

### Service Error Handling
```typescript
// services/errorHandler.ts
export class ServiceError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: any
  ) {
    super(message);
    this.name = 'ServiceError';
  }
}

export const handleServiceError = (error: any): never => {
  console.error('Service error:', error);

  if (error.code === 'permission-denied') {
    throw new ServiceError(
      'You do not have permission to perform this action',
      'PERMISSION_DENIED',
      error
    );
  }

  if (error.code === 'unavailable') {
    throw new ServiceError(
      'Service temporarily unavailable. Please try again.',
      'SERVICE_UNAVAILABLE',
      error
    );
  }

  throw new ServiceError(
    'An unexpected error occurred',
    'UNKNOWN_ERROR',
    error
  );
};

// Usage in service
export const projectService = {
  async getProject(id: string) {
    try {
      const docRef = doc(db, 'projects', id);
      const snapshot = await getDoc(docRef);
      
      if (!snapshot.exists()) {
        throw new ServiceError('Project not found', 'NOT_FOUND');
      }
      
      return { id: snapshot.id, ...snapshot.data() } as Project;
    } catch (error) {
      handleServiceError(error);
    }
  }
};
```

---

## Caching Strategies

### React Query Caching
```typescript
// config/queryClient.ts
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      retry: 3,
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 2,
    },
  },
});

// Prefetching
export const prefetchProjects = async () => {
  await queryClient.prefetchQuery({
    queryKey: ['projects'],
    queryFn: projectService.getProjects,
  });
};

// Cache invalidation
export const invalidateProjectCache = () => {
  queryClient.invalidateQueries({ queryKey: ['projects'] });
};
```

---

## Migration Checklist

### For Each Service
- [ ] Convert Angular service to React service pattern
- [ ] Create TypeScript interfaces for all data models
- [ ] Implement CRUD operations
- [ ] Add real-time subscription support
- [ ] Create custom hooks for data fetching
- [ ] Add error handling
- [ ] Implement offline support
- [ ] Add caching strategy
- [ ] Write unit tests
- [ ] Document API methods

### Testing Migration
```typescript
// Example test for service
import { describe, it, expect, vi } from 'vitest';
import { projectService } from '@/services/projectService';

describe('ProjectService', () => {
  it('should fetch projects', async () => {
    const projects = await projectService.getProjects();
    expect(Array.isArray(projects)).toBe(true);
  });

  it('should handle errors', async () => {
    vi.mock('@/config/firebase', () => ({
      db: null
    }));

    await expect(projectService.getProjects()).rejects.toThrow();
  });
});
```

---

*Document Version: 1.0*  
*Last Updated: 2025-08-19*  
*Status: Active*