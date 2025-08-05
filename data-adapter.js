// Data Adapter - Bridge between ExerciseManager and Firebase/localStorage
class DataAdapter {
    constructor() {
        this.useFirebase = false;
        this.firebaseReady = false;
        this.pendingOperations = [];
        this.realtimeListeners = new Map();
        
        // Try to initialize Firebase
        this.initializeFirebase();
    }

    async initializeFirebase() {
        try {
            // Wait for Firebase to load
            await this.waitForFirebase();
            
            if (window.firebaseService) {
                const success = await window.firebaseService.initialize();
                if (success) {
                    this.useFirebase = true;
                    this.firebaseReady = true;
                    console.log('✅ Firebase ready - Using cloud storage');
                    
                    // Process any pending operations
                    await this.processPendingOperations();
                    
                    // Migrate localStorage data to Firebase if exists
                    await this.migrateLocalDataToFirebase();
                    
                    return true;
                }
            }
        } catch (error) {
            console.warn('⚠️ Firebase not available, using localStorage:', error);
        }
        
        console.log('📱 Using localStorage - Data only available on this device');
        return false;
    }

    waitForFirebase() {
        return new Promise((resolve) => {
            const checkFirebase = () => {
                if (window.firebaseService && window.Firebase) {
                    resolve();
                } else {
                    setTimeout(checkFirebase, 100);
                }
            };
            checkFirebase();
        });
    }

    // Get storage status
    getStorageInfo() {
        return {
            isOnline: this.useFirebase && this.firebaseReady,
            storageType: this.useFirebase ? 'Firebase Cloud' : 'Local Storage',
            canSync: this.useFirebase && navigator.onLine
        };
    }

    // User Data Operations
    async getUserData(userId) {
        if (this.useFirebase && this.firebaseReady) {
            try {
                return await window.firebaseService.getUser(userId);
            } catch (error) {
                console.error('Firebase error, fallback to localStorage:', error);
                return this.getLocalUserData(userId);
            }
        }
        return this.getLocalUserData(userId);
    }

    async saveUserData(userId, userData) {
        const operation = { type: 'saveUser', userId, userData };
        
        if (this.useFirebase && this.firebaseReady) {
            try {
                const success = await window.firebaseService.saveUser(userId, userData);
                if (success) {
                    // Also save to localStorage as backup
                    this.saveLocalUserData(userId, userData);
                    return true;
                }
            } catch (error) {
                console.error('Firebase error, saving to localStorage:', error);
                this.pendingOperations.push(operation);
            }
        } else if (this.useFirebase && !this.firebaseReady) {
            this.pendingOperations.push(operation);
        }
        
        return this.saveLocalUserData(userId, userData);
    }

    async createUser(userId, userData) {
        const operation = { type: 'createUser', userId, userData };
        
        if (this.useFirebase && this.firebaseReady) {
            try {
                const success = await window.firebaseService.createUser(userId, userData);
                if (success) {
                    this.saveLocalUserData(userId, userData);
                    return true;
                }
            } catch (error) {
                console.error('Firebase error, saving to localStorage:', error);
                this.pendingOperations.push(operation);
            }
        } else if (this.useFirebase && !this.firebaseReady) {
            this.pendingOperations.push(operation);
        }
        
        return this.saveLocalUserData(userId, userData);
    }

    // Admin Data Operations
    async getAdminData() {
        if (this.useFirebase && this.firebaseReady) {
            try {
                return await window.firebaseService.getAdminData();
            } catch (error) {
                console.error('Firebase error, fallback to localStorage:', error);
                return this.getLocalAdminData();
            }
        }
        return this.getLocalAdminData();
    }

    async saveAdminData(adminData) {
        const operation = { type: 'saveAdmin', adminData };
        
        if (this.useFirebase && this.firebaseReady) {
            try {
                const success = await window.firebaseService.saveAdminData(adminData);
                if (success) {
                    this.saveLocalAdminData(adminData);
                    return true;
                }
            } catch (error) {
                console.error('Firebase error, saving to localStorage:', error);
                this.pendingOperations.push(operation);
            }
        } else if (this.useFirebase && !this.firebaseReady) {
            this.pendingOperations.push(operation);
        }
        
        return this.saveLocalAdminData(adminData);
    }

    // Assignment Operations
    async getAssignments(userId) {
        if (this.useFirebase && this.firebaseReady) {
            try {
                const assignments = await window.firebaseService.getAssignments(userId);
                return this.groupAssignmentsByType(assignments);
            } catch (error) {
                console.error('Firebase error, fallback to localStorage:', error);
                return this.getLocalAssignments(userId);
            }
        }
        return this.getLocalAssignments(userId);
    }

    async saveAssignment(assignment) {
        const operation = { type: 'saveAssignment', assignment };
        
        if (this.useFirebase && this.firebaseReady) {
            try {
                const success = await window.firebaseService.saveAssignment(assignment);
                if (success) {
                    this.saveLocalAssignment(assignment);
                    return true;
                }
            } catch (error) {
                console.error('Firebase error, saving to localStorage:', error);
                this.pendingOperations.push(operation);
            }
        } else if (this.useFirebase && !this.firebaseReady) {
            this.pendingOperations.push(operation);
        }
        
        return this.saveLocalAssignment(assignment);
    }

    // Real-time listeners
    listenToUserData(userId, callback) {
        if (this.useFirebase && this.firebaseReady) {
            return window.firebaseService.listenToUser(userId, callback);
        }
        return null;
    }

    listenToAssignments(userId, callback) {
        if (this.useFirebase && this.firebaseReady) {
            return window.firebaseService.listenToAssignments(userId, (assignments) => {
                callback(this.groupAssignmentsByType(assignments));
            });
        }
        return null;
    }

    listenToAdminData(callback) {
        if (this.useFirebase && this.firebaseReady) {
            return window.firebaseService.listenToAdminData(callback);
        }
        return null;
    }

    // Helper methods
    groupAssignmentsByType(assignments) {
        const grouped = { coding: [], quiz: [] };
        assignments.forEach(assignment => {
            if (assignment.type === 'coding') {
                grouped.coding.push(assignment);
            } else if (assignment.type === 'quiz') {
                grouped.quiz.push(assignment);
            }
        });
        return grouped;
    }

    // localStorage methods (fallback)
    getLocalUserData(userId) {
        const data = localStorage.getItem(`user_${userId}`);
        return data ? JSON.parse(data) : null;
    }

    saveLocalUserData(userId, userData) {
        localStorage.setItem(`user_${userId}`, JSON.stringify(userData));
        return true;
    }

    getLocalAdminData() {
        const data = localStorage.getItem('admin_data');
        return data ? JSON.parse(data) : null;
    }

    saveLocalAdminData(adminData) {
        localStorage.setItem('admin_data', JSON.stringify(adminData));
        return true;
    }

    getLocalAssignments(userId) {
        const userData = this.getLocalUserData(userId);
        return userData ? (userData.assignments || { coding: [], quiz: [] }) : { coding: [], quiz: [] };
    }

    saveLocalAssignment(assignment) {
        const userData = this.getLocalUserData(assignment.studentId);
        if (userData) {
            if (!userData.assignments) {
                userData.assignments = { coding: [], quiz: [] };
            }
            
            const assignments = userData.assignments[assignment.type] || [];
            const existingIndex = assignments.findIndex(a => a.id === assignment.id);
            
            if (existingIndex >= 0) {
                assignments[existingIndex] = assignment;
            } else {
                assignments.push(assignment);
            }
            
            userData.assignments[assignment.type] = assignments;
            this.saveLocalUserData(assignment.studentId, userData);
        }
        return true;
    }

    // Migration and sync
    async migrateLocalDataToFirebase() {
        if (!this.useFirebase || !this.firebaseReady) return;

        try {
            // Migrate admin data
            const localAdminData = this.getLocalAdminData();
            if (localAdminData) {
                await window.firebaseService.saveAdminData(localAdminData);
                console.log('✅ Migrated admin data to Firebase');
            }

            // Migrate user data
            const localKeys = Object.keys(localStorage).filter(key => key.startsWith('user_'));
            for (const key of localKeys) {
                const userId = key.replace('user_', '');
                const userData = this.getLocalUserData(userId);
                if (userData) {
                    await window.firebaseService.saveUser(userId, userData);
                    
                    // Migrate assignments separately
                    if (userData.assignments) {
                        for (const assignment of userData.assignments.coding || []) {
                            assignment.studentId = userId;
                            assignment.type = 'coding';
                            await window.firebaseService.saveAssignment(assignment);
                        }
                        for (const assignment of userData.assignments.quiz || []) {
                            assignment.studentId = userId;
                            assignment.type = 'quiz';
                            await window.firebaseService.saveAssignment(assignment);
                        }
                    }
                }
            }
            
            console.log('✅ Migration completed successfully');
        } catch (error) {
            console.error('❌ Migration failed:', error);
        }
    }

    async processPendingOperations() {
        if (!this.useFirebase || !this.firebaseReady || this.pendingOperations.length === 0) return;

        console.log(`⏳ Processing ${this.pendingOperations.length} pending operations...`);

        for (const operation of this.pendingOperations) {
            try {
                switch (operation.type) {
                    case 'saveUser':
                        await window.firebaseService.saveUser(operation.userId, operation.userData);
                        break;
                    case 'createUser':
                        await window.firebaseService.createUser(operation.userId, operation.userData);
                        break;
                    case 'saveAdmin':
                        await window.firebaseService.saveAdminData(operation.adminData);
                        break;
                    case 'saveAssignment':
                        await window.firebaseService.saveAssignment(operation.assignment);
                        break;
                }
            } catch (error) {
                console.error('Failed to process pending operation:', error);
            }
        }

        this.pendingOperations = [];
        console.log('✅ All pending operations processed');
    }

    // Status indicator for UI
    getConnectionStatus() {
        if (this.useFirebase && this.firebaseReady && navigator.onLine) {
            return { status: 'online', message: '🌐 Đã kết nối - Dữ liệu được đồng bộ' };
        } else if (this.useFirebase && !navigator.onLine) {
            return { status: 'offline', message: '📱 Offline - Dữ liệu sẽ được đồng bộ khi có mạng' };
        } else {
            return { status: 'local', message: '💾 Chế độ local - Dữ liệu chỉ lưu trên thiết bị này' };
        }
    }
}

// Export singleton instance
window.dataAdapter = new DataAdapter();