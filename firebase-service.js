// Firebase Service Layer
class FirebaseService {
    constructor() {
        this.db = null;
        this.initialized = false;
        this.listeners = new Map();
    }

    // Initialize Firebase connection
    async initialize() {
        try {
            // Wait for Firebase to be available
            await this.waitForFirebase();
            this.db = window.Firebase.db;
            
            // Test connection
            await this.testConnection();
            this.initialized = true;
            console.log('Firebase service initialized');
            return true;
        } catch (error) {
            console.error('Failed to initialize Firebase:', error);
            return false;
        }
    }

    waitForFirebase() {
        return new Promise((resolve, reject) => {
            const checkFirebase = () => {
                if (window.Firebase && window.Firebase.db) {
                    resolve();
                } else {
                    setTimeout(checkFirebase, 100);
                }
            };
            checkFirebase();
            
            // Timeout after 10 seconds
            setTimeout(() => {
                reject(new Error('Firebase timeout'));
            }, 10000);
        });
    }

    async testConnection() {
        const testDoc = window.Firebase.doc(this.db, 'test', 'connection');
        await window.Firebase.setDoc(testDoc, { 
            timestamp: window.Firebase.serverTimestamp(),
            test: true 
        });
    }

    // User Management
    async getUser(userId) {
        try {
            const userDoc = window.Firebase.doc(this.db, 'users', userId);
            const docSnap = await window.Firebase.getDoc(userDoc);
            
            if (docSnap.exists()) {
                return { id: docSnap.id, ...docSnap.data() };
            }
            return null;
        } catch (error) {
            console.error('Error getting user:', error);
            return null;
        }
    }

    async saveUser(userId, userData) {
        try {
            const userDoc = window.Firebase.doc(this.db, 'users', userId);
            await window.Firebase.setDoc(userDoc, {
                ...userData,
                lastUpdated: window.Firebase.serverTimestamp()
            }, { merge: true });
            return true;
        } catch (error) {
            console.error('Error saving user:', error);
            return false;
        }
    }

    async createUser(userId, userData) {
        try {
            const userDoc = window.Firebase.doc(this.db, 'users', userId);
            await window.Firebase.setDoc(userDoc, {
                ...userData,
                createdAt: window.Firebase.serverTimestamp(),
                lastUpdated: window.Firebase.serverTimestamp()
            });
            return true;
        } catch (error) {
            console.error('Error creating user:', error);
            return false;
        }
    }

    // Admin Management
    async getAdminData() {
        try {
            const adminDoc = window.Firebase.doc(this.db, 'admin', 'data');
            const docSnap = await window.Firebase.getDoc(adminDoc);
            
            if (docSnap.exists()) {
                return docSnap.data();
            }
            
            // Initialize admin data if not exists
            const initialAdminData = {
                students: [],
                systemStats: {
                    totalStudents: 0,
                    totalAssignments: 0,
                    totalSubmissions: 0
                },
                createdAt: window.Firebase.serverTimestamp()
            };
            
            await this.saveAdminData(initialAdminData);
            return initialAdminData;
        } catch (error) {
            console.error('Error getting admin data:', error);
            return null;
        }
    }

    async saveAdminData(adminData) {
        try {
            const adminDoc = window.Firebase.doc(this.db, 'admin', 'data');
            await window.Firebase.setDoc(adminDoc, {
                ...adminData,
                lastUpdated: window.Firebase.serverTimestamp()
            }, { merge: true });
            return true;
        } catch (error) {
            console.error('Error saving admin data:', error);
            return false;
        }
    }

    // Assignments Management
    async getAssignments(userId) {
        try {
            const assignmentsCol = window.Firebase.collection(this.db, 'assignments');
            const q = window.Firebase.query(
                assignmentsCol,
                window.Firebase.where('studentId', '==', userId),
                window.Firebase.orderBy('assignedAt', 'desc')
            );
            
            const querySnapshot = await window.Firebase.getDocs(q);
            const assignments = [];
            
            querySnapshot.forEach((doc) => {
                assignments.push({ id: doc.id, ...doc.data() });
            });
            
            return assignments;
        } catch (error) {
            console.error('Error getting assignments:', error);
            return [];
        }
    }

    async saveAssignment(assignmentData) {
        try {
            const assignmentsCol = window.Firebase.collection(this.db, 'assignments');
            const assignmentDoc = window.Firebase.doc(assignmentsCol, assignmentData.id);
            
            await window.Firebase.setDoc(assignmentDoc, {
                ...assignmentData,
                lastUpdated: window.Firebase.serverTimestamp()
            }, { merge: true });
            
            return true;
        } catch (error) {
            console.error('Error saving assignment:', error);
            return false;
        }
    }

    async deleteAssignment(assignmentId) {
        try {
            const assignmentDoc = window.Firebase.doc(this.db, 'assignments', assignmentId);
            await window.Firebase.deleteDoc(assignmentDoc);
            return true;
        } catch (error) {
            console.error('Error deleting assignment:', error);
            return false;
        }
    }

    // Real-time listeners
    listenToUser(userId, callback) {
        if (this.listeners.has(`user_${userId}`)) {
            this.listeners.get(`user_${userId}`)(); // Unsubscribe previous listener
        }

        const userDoc = window.Firebase.doc(this.db, 'users', userId);
        const unsubscribe = window.Firebase.onSnapshot(userDoc, (doc) => {
            if (doc.exists()) {
                callback({ id: doc.id, ...doc.data() });
            }
        });
        
        this.listeners.set(`user_${userId}`, unsubscribe);
        return unsubscribe;
    }

    listenToAssignments(userId, callback) {
        if (this.listeners.has(`assignments_${userId}`)) {
            this.listeners.get(`assignments_${userId}`)(); // Unsubscribe previous listener
        }

        const assignmentsCol = window.Firebase.collection(this.db, 'assignments');
        const q = window.Firebase.query(
            assignmentsCol,
            window.Firebase.where('studentId', '==', userId),
            window.Firebase.orderBy('assignedAt', 'desc')
        );
        
        const unsubscribe = window.Firebase.onSnapshot(q, (querySnapshot) => {
            const assignments = [];
            querySnapshot.forEach((doc) => {
                assignments.push({ id: doc.id, ...doc.data() });
            });
            callback(assignments);
        });
        
        this.listeners.set(`assignments_${userId}`, unsubscribe);
        return unsubscribe;
    }

    listenToAdminData(callback) {
        if (this.listeners.has('admin_data')) {
            this.listeners.get('admin_data')(); // Unsubscribe previous listener
        }

        const adminDoc = window.Firebase.doc(this.db, 'admin', 'data');
        const unsubscribe = window.Firebase.onSnapshot(adminDoc, (doc) => {
            if (doc.exists()) {
                callback(doc.data());
            }
        });
        
        this.listeners.set('admin_data', unsubscribe);
        return unsubscribe;
    }

    // Cleanup listeners
    cleanup() {
        this.listeners.forEach((unsubscribe) => {
            unsubscribe();
        });
        this.listeners.clear();
    }

    // Offline/Online status
    isOnline() {
        return navigator.onLine && this.initialized;
    }

    // Batch operations for efficiency
    async batchUpdate(operations) {
        try {
            const batch = window.Firebase.writeBatch(this.db);
            
            operations.forEach(({ type, docRef, data }) => {
                switch(type) {
                    case 'set':
                        batch.set(docRef, data);
                        break;
                    case 'update':
                        batch.update(docRef, data);
                        break;
                    case 'delete':
                        batch.delete(docRef);
                        break;
                }
            });
            
            await batch.commit();
            return true;
        } catch (error) {
            console.error('Error in batch update:', error);
            return false;
        }
    }
}

// Export singleton instance
window.firebaseService = new FirebaseService();