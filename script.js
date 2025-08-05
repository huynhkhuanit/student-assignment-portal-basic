// Exercise Management System with Admin/Student Role Management

class ExerciseManager {
    constructor() {
        this.currentUser = null;
        this.userRole = null; // 'admin' or 'student'
        this.currentTab = 'dashboard';
        this.editingExercise = null;
        this.editingType = null;
        this.dayModalContext = null;
        this.selectedStudent = null;
        this.assignmentType = null;
        this.editingStudent = null; // For editing student mode
        this.dataAdapter = null; // Will be initialized after dataAdapter is loaded
        
        // Admin credentials - you can change this
        this.adminIds = ['ADMIN2024', 'ADMIN123', 'GIAOVIEN'];
        
        this.init();
    }

    async init() {
        this.bindEvents();
        await this.initializeDataAdapter();
        this.checkExistingSession();
        this.initializeData();
        this.initializePrismConfig();
        this.setupConnectionStatusUpdate();
    }

    async initializeDataAdapter() {
        // Wait for dataAdapter to be loaded
        const waitForAdapter = () => {
            return new Promise((resolve) => {
                const checkAdapter = () => {
                    if (window.dataAdapter) {
                        this.dataAdapter = window.dataAdapter;
                        resolve();
                    } else {
                        setTimeout(checkAdapter, 100);
                    }
                };
                checkAdapter();
            });
        };
        
        await waitForAdapter();
        console.log('✅ Data adapter initialized');
    }

    setupConnectionStatusUpdate() {
        const statusElement = document.getElementById('connection-status');
        if (!statusElement) return;

        const updateStatus = () => {
            const status = this.dataAdapter.getConnectionStatus();
            const icon = statusElement.querySelector('i');
            const text = statusElement.querySelector('span');
            
            // Remove existing status classes
            statusElement.className = 'connection-status';
            
            switch(status.status) {
                case 'online':
                    statusElement.classList.add('online');
                    icon.className = 'fas fa-cloud';
                    break;
                case 'offline':
                    statusElement.classList.add('offline');
                    icon.className = 'fas fa-wifi';
                    break;
                case 'local':
                    statusElement.classList.add('local');
                    icon.className = 'fas fa-database';
                    break;
            }
            
            text.textContent = status.message;
        };

        // Update status immediately and then every 5 seconds
        updateStatus();
        setInterval(updateStatus, 5000);

        // Also update on online/offline events
        window.addEventListener('online', updateStatus);
        window.addEventListener('offline', updateStatus);
    }

    // Event Binding
    bindEvents() {
        // Authentication
        document.getElementById('auth-form').addEventListener('submit', this.handleLogin.bind(this));
        document.getElementById('logout-btn').addEventListener('click', this.handleLogout.bind(this));

        // Navigation
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', this.handleTabSwitch.bind(this));
        });

        // Daily Check-in
        document.getElementById('daily-checkin').addEventListener('click', this.handleDailyCheckin.bind(this));

        // Student Exercise Management (Student Only)
        document.getElementById('add-coding-exercise')?.addEventListener('click', () => this.openExerciseModal('coding'));
        document.getElementById('add-quiz-exercise')?.addEventListener('click', () => this.openExerciseModal('quiz'));
        document.getElementById('add-coding-day')?.addEventListener('click', () => this.openDayModal('coding'));
        document.getElementById('add-quiz-day')?.addEventListener('click', () => this.openDayModal('quiz'));

        // Admin Student Management
        document.getElementById('add-student')?.addEventListener('click', this.openStudentModal.bind(this));
        document.getElementById('assign-coding-exercise')?.addEventListener('click', () => this.openAssignmentModal('coding'));
        document.getElementById('assign-quiz-exercise')?.addEventListener('click', () => this.openAssignmentModal('quiz'));
        document.getElementById('student-select')?.addEventListener('change', this.handleStudentSelect.bind(this));

        // Daily Assignments
        document.getElementById('assign-daily-coding')?.addEventListener('click', () => this.openDailyAssignmentModal('coding'));
        document.getElementById('assign-daily-quiz')?.addEventListener('click', () => this.openDailyAssignmentModal('quiz'));
        document.getElementById('assign-to-all')?.addEventListener('click', () => this.openDailyAssignmentModal('both'));
        document.getElementById('assignment-date')?.addEventListener('change', this.handleDateChange.bind(this));

        // Assignment Form Enhancements
        document.getElementById('enable-coding')?.addEventListener('change', this.toggleCodingContent.bind(this));
        document.getElementById('enable-quiz')?.addEventListener('change', this.toggleQuizContent.bind(this));
        document.getElementById('select-all-students')?.addEventListener('click', this.selectAllStudents.bind(this));
        document.getElementById('deselect-all-students')?.addEventListener('click', this.deselectAllStudents.bind(this));

        // Day selectors
        document.getElementById('quiz-day-select')?.addEventListener('change', this.handleDayChange.bind(this));

        // Modal events
        document.getElementById('modal-overlay').addEventListener('click', this.handleModalOverlayClick.bind(this));
        document.querySelectorAll('.modal-close').forEach(btn => {
            btn.addEventListener('click', this.closeModal.bind(this));
        });

        // Form submissions
        document.getElementById('coding-exercise-form')?.addEventListener('submit', this.handleCodingExerciseSubmit.bind(this));
        document.getElementById('quiz-exercise-form')?.addEventListener('submit', this.handleQuizExerciseSubmit.bind(this));
        document.getElementById('day-form')?.addEventListener('submit', this.handleDaySubmit.bind(this));
        document.getElementById('student-form')?.addEventListener('submit', this.handleStudentSubmit.bind(this));
        document.getElementById('assignment-form')?.addEventListener('submit', this.handleAssignmentSubmit.bind(this));
    }

    // Authentication Methods
    async checkExistingSession() {
        const savedUser = localStorage.getItem('currentUser');
        if (savedUser) {
            this.currentUser = savedUser;
            this.userRole = this.determineUserRole(savedUser);
            await this.showMainScreen();
        }
    }

    determineUserRole(userId) {
        return this.adminIds.includes(userId) ? 'admin' : 'student';
    }

    async handleLogin(e) {
        e.preventDefault();
        const userId = document.getElementById('user-id').value.trim();
        
        if (!userId) {
            this.showError('Vui lòng nhập ID');
            return;
        }

        // Validate ID format (basic validation)
        if (userId.length < 3) {
            this.showError('ID phải có ít nhất 3 ký tự');
            return;
        }

        // Determine user role
        this.userRole = this.determineUserRole(userId);
        
        // If student, check if ID is valid (created by admin)
        if (this.userRole === 'student') {
            const isValid = await this.isValidStudentId(userId);
            if (!isValid) {
                this.showError('ID không hợp lệ. Vui lòng liên hệ admin để được cấp ID.');
                return;
            }
        }

        this.currentUser = userId;
        localStorage.setItem('currentUser', userId);
        await this.initializeUserData();
        await this.showMainScreen();
        
        if (this.userRole === 'student') {
            await this.handleDailyCheckin();
        }
    }

    async isValidStudentId(studentId) {
        const adminData = await this.getAdminData();
        if (!adminData || !adminData.students) {
            return false;
        }
        
        return adminData.students.some(student => student.id === studentId);
    }

    handleLogout() {
        if (confirm('Bạn có chắc chắn muốn đăng xuất?')) {
            localStorage.removeItem('currentUser');
            this.currentUser = null;
            this.userRole = null;
            this.showAuthScreen();
        }
    }

    showAuthScreen() {
        document.getElementById('auth-screen').classList.add('active');
        document.getElementById('main-screen').classList.remove('active');
        document.getElementById('user-id').value = '';
    }

    async showMainScreen() {
        document.getElementById('auth-screen').classList.remove('active');
        document.getElementById('main-screen').classList.add('active');
        document.getElementById('current-user').textContent = this.currentUser;
        
        // Set role-based UI
        this.setupRoleBasedUI();
        
        await this.loadDashboard();
        if (this.userRole === 'student') {
            await this.loadDays();
            await this.updateDailyCheckinButton();
        } else {
            await this.loadAdminData();
        }
    }

    setupRoleBasedUI() {
        const body = document.body;
        
        if (this.userRole === 'admin') {
            body.classList.add('is-admin');
            body.classList.remove('is-student');
        } else {
            body.classList.add('is-student');
            body.classList.remove('is-admin');
        }
    }

    // Data Management
    async initializeUserData() {
        if (this.userRole === 'admin') {
            await this.initializeAdminData();
            await this.loadStudentConfig();
        } else {
            await this.initializeStudentData();
        }
    }

    // Load student configuration from external file or localStorage
    async loadStudentConfig() {
        try {
            // Try to load from external file first (for GitHub Pages)
            const response = await fetch('./student-config.json');
            if (response.ok) {
                const config = await response.json();
                await this.importStudentConfig(config);
            }
        } catch (error) {
            console.log('No external config found, using localStorage');
        }
    }

    async importStudentConfig(config) {
        const adminData = await this.getAdminData();
        if (!adminData) return;
        
        // Merge students from config
        config.students.forEach(configStudent => {
            const existingStudent = adminData.students.find(s => s.id === configStudent.id);
            if (!existingStudent && configStudent.active) {
                const studentData = {
                    id: configStudent.id,
                    name: configStudent.name,
                    email: configStudent.email || '',
                    notes: `${configStudent.class} - ${configStudent.notes}`,
                    createdAt: new Date().toISOString(),
                    stats: {
                        totalAssignments: 0,
                        completedAssignments: 0,
                        attendanceDays: 0
                    }
                };
                
                adminData.students.push(studentData);
                this.initializeNewStudentData(studentData.id, studentData);
            }
        });
        
        adminData.systemStats.totalStudents = adminData.students.length;
        await this.saveAdminData(adminData);
        
        // Refresh displays
        if (this.currentTab === 'student-management') {
            await this.loadStudentsList();
        }
        await this.loadStudentSelect();
    }

    async initializeAdminData() {
        const adminData = await this.getAdminData();
        if (!adminData) {
            const initialData = {
                students: [],
                assignments: {},
                systemStats: {
                    totalStudents: 0,
                    totalAssignments: 0,
                    totalSubmissions: 0
                },
                createdAt: new Date().toISOString()
            };
            await this.saveAdminData(initialData);
            
            // Auto-create demo student for first-time admin
            await this.createDemoStudent();
        }
    }

    async createDemoStudent() {
        const demoStudent = {
            id: 'HV2024_001',
            name: 'Học Viên Demo',
            email: 'demo@example.com',
            notes: 'Tài khoản demo được tạo tự động',
            createdAt: new Date().toISOString(),
            stats: {
                totalAssignments: 0,
                completedAssignments: 0,
                attendanceDays: 0
            }
        };

        const adminData = await this.getAdminData();
        if (!adminData.students) {
            adminData.students = [];
        }
        adminData.students.push(demoStudent);
        if (!adminData.systemStats) {
            adminData.systemStats = { totalStudents: 0, totalAssignments: 0, totalSubmissions: 0 };
        }
        adminData.systemStats.totalStudents = adminData.students.length;
        await this.saveAdminData(adminData);

        // Initialize demo student data
        await this.initializeNewStudentData(demoStudent.id, demoStudent);
    }

    async initializeStudentData() {
        const userData = await this.getUserData();
        
        if (!userData) {
            const initialData = {
                codingExercises: {},
                quizExercises: {},
                assignments: {
                    coding: [],
                    quiz: []
                },
                attendance: [],
                days: {
                    coding: [],
                    quiz: []
                },
                activities: [],
                profile: {
                    name: '',
                    email: '',
                    joinedAt: new Date().toISOString()
                },
                createdAt: new Date().toISOString()
            };
            await this.saveUserData(initialData);
        }
    }

    async getAdminData() {
        return await this.dataAdapter.getAdminData();
    }

    async saveAdminData(data) {
        return await this.dataAdapter.saveAdminData(data);
    }

    async getUserData() {
        return await this.dataAdapter.getUserData(this.currentUser);
    }

    async saveUserData(data) {
        return await this.dataAdapter.saveUserData(this.currentUser, data);
    }

    async getStudentData(studentId) {
        return await this.dataAdapter.getUserData(studentId);
    }

    async saveStudentData(studentId, data) {
        return await this.dataAdapter.saveUserData(studentId, data);
    }

    initializeData() {
        // This method can be used to set up any initial data structure
    }

    // Student Management (Admin Only)
    openStudentModal() {
        document.getElementById('modal-overlay').classList.add('active');
        document.getElementById('student-modal').classList.add('active');
        document.getElementById('student-form').reset();
        document.getElementById('student-modal-title').textContent = 'Thêm Học Viên Mới';
        
        // Reset editing mode
        this.editingStudent = null;
        
        // Enable ID field for new students
        document.getElementById('student-id').disabled = false;
        
        document.getElementById('student-id').focus();
    }

    async handleStudentSubmit(e) {
        e.preventDefault();
        
        const formData = {
            id: document.getElementById('student-id').value.trim(),
            name: document.getElementById('student-name').value.trim(),
            email: document.getElementById('student-email').value.trim(),
            notes: document.getElementById('student-notes').value.trim()
        };

        if (!formData.id || !formData.name) {
            this.showError('Vui lòng nhập đầy đủ ID và tên học viên');
            return;
        }

        const adminData = await this.getAdminData();
        if (!adminData) {
            this.showError('Không thể tải dữ liệu admin');
            return;
        }
        
        if (this.editingStudent) {
            // Edit mode - update existing student
            if (!adminData.students) {
                adminData.students = [];
            }
            const studentIndex = adminData.students.findIndex(s => s.id === this.editingStudent.id);
            if (studentIndex === -1) {
                this.showError('Không tìm thấy học viên để cập nhật');
                return;
            }
            
            // Update student data (keep existing createdAt and stats)
            adminData.students[studentIndex] = {
                ...adminData.students[studentIndex],
                name: formData.name,
                email: formData.email,
                notes: formData.notes,
                updatedAt: new Date().toISOString()
            };
            
            await this.saveAdminData(adminData);
            this.closeModal();
            await this.loadStudentsList();
            await this.loadStudentSelect();
            this.showSuccess(`Đã cập nhật thông tin học viên ${formData.name}`);
            
            // Reset editing mode
            this.editingStudent = null;
            
        } else {
            // Add mode - create new student
            if (!adminData.students) {
                adminData.students = [];
            }
            
            // Check if ID already exists
            if (adminData.students.some(student => student.id === formData.id)) {
                this.showError('ID này đã tồn tại');
                return;
            }

            const studentData = {
                ...formData,
                createdAt: new Date().toISOString(),
                stats: {
                    totalAssignments: 0,
                    completedAssignments: 0,
                    attendanceDays: 0
                }
            };

            // Add student to admin data
            adminData.students.push(studentData);
            if (!adminData.systemStats) {
                adminData.systemStats = { totalStudents: 0, totalAssignments: 0, totalSubmissions: 0 };
            }
            adminData.systemStats.totalStudents = adminData.students.length;
            await this.saveAdminData(adminData);

            // Initialize student data
            await this.initializeNewStudentData(studentData.id, studentData);

            this.closeModal();
            await this.loadStudentsList();
            await this.loadStudentSelect();
            this.showSuccess(`Đã thêm học viên ${studentData.name} (${studentData.id})`);
        }
    }

    async initializeNewStudentData(studentId, profile) {
        const initialData = {
            codingExercises: {},
            quizExercises: {},
            assignments: {
                coding: [],
                quiz: []
            },
            attendance: [],
            days: {
                coding: [],
                quiz: []
            },
            activities: [],
            profile: {
                name: profile.name,
                email: profile.email,
                joinedAt: profile.createdAt
            },
            createdAt: profile.createdAt
        };
        await this.saveStudentData(studentId, initialData);
    }

    async loadStudentsList() {
        const adminData = await this.getAdminData();
        const container = document.getElementById('students-list');
        
        if (!adminData || !adminData.students || !adminData.students.length) {
            container.innerHTML = '<p class="text-center text-muted">Chưa có học viên nào</p>';
            return;
        }

        // Process student data asynchronously
        const studentCards = [];
        for (const student of adminData.students) {
            const studentData = await this.getStudentData(student.id);
            const totalAssignments = studentData && studentData.assignments ? 
                ((studentData.assignments.coding || []).length + (studentData.assignments.quiz || []).length) : 0;
            const attendanceDays = studentData && studentData.attendance ? studentData.attendance.length : 0;

            studentCards.push(`
                <div class="student-card fade-in">
                    <div class="student-card-header">
                        <div>
                            <div class="student-name">${student.name}</div>
                            <div class="student-id">${student.id}</div>
                        </div>
                    </div>
                    ${student.email ? `<div class="student-email">${student.email}</div>` : ''}
                    <div class="student-stats">
                        <div class="student-stat">
                            <span class="student-stat-value">${totalAssignments}</span>
                            <span class="student-stat-label">Bài tập</span>
                        </div>
                        <div class="student-stat">
                            <span class="student-stat-value">${attendanceDays}</span>
                            <span class="student-stat-label">Ngày học</span>
                        </div>
                    </div>
                    ${student.notes ? `<p class="text-muted">${student.notes}</p>` : ''}
                    <div class="student-actions">
                        <button class="btn-small btn-edit" onclick="exerciseManager.editStudent('${student.id}')">
                            <i class="fas fa-edit"></i> Sửa
                        </button>
                        <button class="btn-small btn-delete" onclick="exerciseManager.deleteStudent('${student.id}')">
                            <i class="fas fa-trash"></i> Xóa
                        </button>
                        <button class="btn-small" onclick="exerciseManager.viewStudentProgress('${student.id}')" style="background: var(--primary-color); color: white;">
                            <i class="fas fa-chart-line"></i> Xem tiến độ
                        </button>
                    </div>
                </div>
            `);
        }

        container.innerHTML = studentCards.join('');


    }

    async loadStudentSelect() {
        const adminData = await this.getAdminData();
        const select = document.getElementById('student-select');
        
        if (!select) return;
        
        select.innerHTML = '<option value="">-- Chọn học viên --</option>';
        if (adminData && adminData.students) {
            adminData.students.forEach(student => {
                select.innerHTML += `<option value="${student.id}">${student.name} (${student.id})</option>`;
            });
        }
    }

    async deleteStudent(studentId) {
        const adminData = await this.getAdminData();
        if (!adminData || !adminData.students) return;
        
        const student = adminData.students.find(s => s.id === studentId);
        
        if (!student) return;
        
        if (confirm(`Bạn có chắc chắn muốn xóa học viên ${student.name}?\nTất cả dữ liệu của học viên sẽ bị xóa!`)) {
            // Remove from admin data
            adminData.students = adminData.students.filter(s => s.id !== studentId);
            adminData.systemStats.totalStudents = adminData.students.length;
            await this.saveAdminData(adminData);
            
            // Remove student data
            const userKey = `user_${studentId}`;
            localStorage.removeItem(userKey);
            
            await this.loadStudentsList();
            await this.loadStudentSelect();
            this.showSuccess(`Đã xóa học viên ${student.name}`);
        }
    }

    async editStudent(studentId) {
        const adminData = await this.getAdminData();
        if (!adminData || !adminData.students) {
            this.showError('Không thể tải dữ liệu admin');
            return;
        }
        
        const student = adminData.students.find(s => s.id === studentId);
        
        if (!student) {
            this.showError('Không tìm thấy học viên');
            return;
        }
        
        // Open student modal with existing data
        document.getElementById('modal-overlay').classList.add('active');
        document.getElementById('student-modal').classList.add('active');
        
        // Update modal title
        document.getElementById('student-modal-title').textContent = 'Chỉnh Sửa Học Viên';
        
        // Fill form with existing data
        document.getElementById('student-id').value = student.id;
        document.getElementById('student-name').value = student.name;
        document.getElementById('student-email').value = student.email || '';
        document.getElementById('student-notes').value = student.notes || '';
        
        // Disable ID field for editing
        document.getElementById('student-id').disabled = true;
        
        // Set editing mode
        this.editingStudent = student;
    }

    async viewStudentProgress(studentId) {
        const studentData = await this.getStudentData(studentId);
        const adminData = await this.getAdminData();
        if (!adminData || !adminData.students) {
            this.showError('Không thể tải dữ liệu admin');
            return;
        }
        const student = adminData.students.find(s => s.id === studentId);
        
        if (!student || !studentData) {
            this.showError('Không tìm thấy dữ liệu học viên');
            return;
        }
        
        // Calculate statistics with null checks
        const totalCodingAssignments = studentData.assignments && studentData.assignments.coding ? studentData.assignments.coding.length : 0;
        const completedCodingAssignments = studentData.assignments && studentData.assignments.coding ? 
            studentData.assignments.coding.filter(a => a.status === 'submitted' || a.status === 'graded').length : 0;
        const totalQuizAssignments = studentData.assignments && studentData.assignments.quiz ? studentData.assignments.quiz.length : 0;
        const completedQuizAssignments = studentData.assignments && studentData.assignments.quiz ? 
            studentData.assignments.quiz.filter(a => a.status === 'submitted' || a.status === 'graded').length : 0;
        const attendanceDays = studentData.attendance ? studentData.attendance.length : 0;
        const streak = studentData.attendance ? this.calculateStreak(studentData.attendance) : 0;
        
        // Show progress in alert for now (can be improved with a modal later)
        const progressInfo = `
📊 TIẾN ĐỘ HỌC VIÊN: ${student.name}
ID: ${student.id}

📝 BÀI TẬP:
• Coding: ${completedCodingAssignments}/${totalCodingAssignments} hoàn thành
• Quiz: ${completedQuizAssignments}/${totalQuizAssignments} hoàn thành

📅 ĐIỂM DANH:
• Tổng ngày học: ${attendanceDays}
• Chuỗi ngày liên tiếp: ${streak}

📈 TỈ LỆ HOÀN THÀNH:
• Coding: ${totalCodingAssignments > 0 ? Math.round((completedCodingAssignments / totalCodingAssignments) * 100) : 0}%
• Quiz: ${totalQuizAssignments > 0 ? Math.round((completedQuizAssignments / totalQuizAssignments) * 100) : 0}%
        `;
        
        alert(progressInfo);
        
        // TODO: Replace with proper modal in future
        console.log('Student Progress Data:', {
            student,
            studentData,
            stats: {
                totalCodingAssignments,
                completedCodingAssignments,
                totalQuizAssignments,
                completedQuizAssignments,
                attendanceDays,
                streak
            }
        });
    }

    // Exercise Assignment (Admin Only)
    openAssignmentModal(type, isDailyAssignment = false) {
        this.assignmentType = type;
        this.isDailyAssignment = isDailyAssignment;
        
        document.getElementById('modal-overlay').classList.add('active');
        document.getElementById('assignment-modal').classList.add('active');
        
        let title = 'Giao Bài Tập';
        if (type === 'coding') title = 'Giao Bài Tập Lập Trình';
        else if (type === 'quiz') title = 'Giao Bài Trắc Nghiệm';
        else if (type === 'both') title = 'Giao Bài Tập Tổng Hợp';
        
        document.getElementById('assignment-modal-title').textContent = title;
        
        // Reset form and populate students
        document.getElementById('assignment-form').reset();
        this.populateStudentCheckboxes();
        
        // Hide content sections initially
        document.getElementById('coding-content').style.display = 'none';
        document.getElementById('quiz-content').style.display = 'none';
        
        // Pre-select student if single assignment
        if (!isDailyAssignment && this.selectedStudent) {
            const checkbox = document.getElementById(`student-${this.selectedStudent}`);
            if (checkbox) checkbox.checked = true;
        }
        
        // Pre-select all students for daily assignments
        if (isDailyAssignment) {
            this.selectAllStudents();
        }
    }

    async handleStudentSelect(e) {
        this.selectedStudent = e.target.value;
        await this.loadStudentExercises();
    }

    async handleAssignmentSubmit(e) {
        e.preventDefault();
        
        // Get selected students
        const selectedStudents = Array.from(document.querySelectorAll('#assignment-students input[type="checkbox"]:checked'))
            .map(cb => cb.value);
        
        if (!selectedStudents.length) {
            this.showError('Vui lòng chọn ít nhất một học viên');
            return;
        }

        const title = document.getElementById('assignment-title').value.trim();
        const description = document.getElementById('assignment-description').value.trim();
        const deadline = document.getElementById('assignment-deadline').value;
        const isOptional = document.getElementById('assignment-optional').checked;
        
        const enableCoding = document.getElementById('enable-coding').checked;
        const enableQuiz = document.getElementById('enable-quiz').checked;

        if (!title || !description) {
            this.showError('Vui lòng nhập đầy đủ tiêu đề và mô tả');
            return;
        }

        if (!enableCoding && !enableQuiz) {
            this.showError('Vui lòng chọn ít nhất một loại bài tập (Code hoặc Quiz)');
            return;
        }

        let assignmentCount = 0;

        for (const studentId of selectedStudents) {
            const baseAssignment = {
                id: `${Date.now()}_${studentId}_${Math.random().toString(36).substr(2, 9)}`,
                title,
                description,
                deadline,
                assignedAt: new Date().toISOString(),
                status: 'pending',
                optional: isOptional
            };

            // Create coding assignment if enabled
            if (enableCoding) {
                const codingAssignment = {
                    ...baseAssignment,
                    type: 'coding',
                    template: document.getElementById('assignment-code').value.trim(),
                    language: 'javascript' // Default language for assignments
                };
                
                const studentData = await this.getStudentData(studentId);
                if (!studentData.assignments) {
                    studentData.assignments = { coding: [], quiz: [] };
                }
                studentData.assignments.coding.push(codingAssignment);
                await this.saveStudentData(studentId, studentData);
                assignmentCount++;
            }

            // Create quiz assignment if enabled
            if (enableQuiz) {
                const question = document.getElementById('assignment-question').value.trim();
                const options = [
                    document.getElementById('assignment-option-text-0').value.trim(),
                    document.getElementById('assignment-option-text-1').value.trim(),
                    document.getElementById('assignment-option-text-2').value.trim(),
                    document.getElementById('assignment-option-text-3').value.trim()
                ];
                const correctAnswer = document.querySelector('input[name="assignment-correct"]:checked');
                
                if (question && options.every(opt => opt) && correctAnswer) {
                    const quizAssignment = {
                        ...baseAssignment,
                        type: 'quiz',
                        question,
                        options,
                        correctAnswer: parseInt(correctAnswer.value),
                        explanation: document.getElementById('assignment-explanation').value.trim()
                    };
                    
                    const studentData = await this.getStudentData(studentId);
                    if (!studentData.assignments) {
                        studentData.assignments = { coding: [], quiz: [] };
                    }
                    studentData.assignments.quiz.push(quizAssignment);
                    await this.saveStudentData(studentId, studentData);
                    assignmentCount++;
                } else if (enableQuiz) {
                    console.warn(`Bỏ qua quiz assignment cho ${studentId} do thiếu thông tin`);
                }
            }
        }

        // Update admin stats
        const adminData = await this.getAdminData();
        if (!adminData.systemStats) {
            adminData.systemStats = { totalStudents: 0, totalAssignments: 0, totalSubmissions: 0 };
        }
        adminData.systemStats.totalAssignments += assignmentCount;
        await this.saveAdminData(adminData);

        this.closeModal();
        
        // Refresh appropriate views
        if (this.isDailyAssignment) {
            await this.loadTodayAssignments();
        } else {
            await this.loadStudentExercises();
        }
        
        this.showSuccess(`Đã giao ${assignmentCount} bài tập cho ${selectedStudents.length} học viên`);
    }

    async loadStudentExercises() {
        if (!this.selectedStudent) {
            document.getElementById('student-exercises').innerHTML = '<p class="text-muted">Vui lòng chọn học viên</p>';
            return;
        }

        const studentData = await this.getStudentData(this.selectedStudent);
        const container = document.getElementById('student-exercises');
        
        if (!studentData) {
            container.innerHTML = '<p class="text-muted">Không tìm thấy dữ liệu học viên</p>';
            return;
        }
        
        const allAssignments = [
            ...(studentData.assignments && studentData.assignments.coding ? studentData.assignments.coding.map(a => ({...a, type: 'coding'})) : []),
            ...(studentData.assignments && studentData.assignments.quiz ? studentData.assignments.quiz.map(a => ({...a, type: 'quiz'})) : [])
        ].sort((a, b) => new Date(b.assignedAt) - new Date(a.assignedAt));

        if (!allAssignments.length) {
            container.innerHTML = '<p class="text-muted">Chưa có bài tập nào được giao</p>';
            return;
        }

        container.innerHTML = allAssignments.map(assignment => {
            const isOverdue = assignment.deadline && new Date(assignment.deadline) < new Date() && assignment.status === 'pending';
            const statusClass = isOverdue ? 'overdue' : assignment.status;
            
            return `
                <div class="exercise-assignment fade-in">
                    <div class="assignment-status ${statusClass}">
                        ${isOverdue ? 'Quá hạn' : this.getStatusText(assignment.status)}
                    </div>
                    <div class="assignment-header">
                        <div>
                            <div class="assignment-title">
                                <i class="fas fa-${assignment.type === 'coding' ? 'code' : 'question-circle'}"></i>
                                ${assignment.title}
                            </div>
                            <div class="assignment-meta">
                                <span>Giao: ${this.formatDateTime(assignment.assignedAt)}</span>
                                ${assignment.deadline ? `<span>Hạn: ${this.formatDateTime(assignment.deadline)}</span>` : ''}
                            </div>
                        </div>
                        <div class="exercise-actions">
                            <button class="btn-small btn-delete" onclick="exerciseManager.deleteAssignment('${assignment.id}', '${assignment.type}')">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                    <div class="assignment-description">
                        ${assignment.description}
                        ${assignment.optional ? '<span class="assignment-priority optional">Tùy chọn</span>' : '<span class="assignment-priority required">Bắt buộc</span>'}
                    </div>
                    ${assignment.template ? `
                        <div class="exercise-content">
                            <strong>Code mẫu:</strong>
                            ${this.highlightCode(assignment.template, assignment.language || 'javascript')}
                        </div>
                    ` : ''}
                    ${assignment.question ? `
                        <div class="exercise-content">
                            <strong>Câu hỏi:</strong>
                            <p>${assignment.question}</p>
                            <div class="quiz-options">
                                ${assignment.options.map((option, index) => `
                                    <div class="quiz-option">
                                        ${String.fromCharCode(65 + index)}. ${option}
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    ` : ''}
                    
                    ${(assignment.status === 'submitted' || assignment.status === 'graded') && (assignment.submissionContent || assignment.submissionAnswer !== undefined) ? `
                        <div class="submission-content">
                            <h4><i class="fas fa-file-alt"></i> Bài làm của học viên:</h4>
                            ${assignment.type === 'coding' ? `
                                ${this.highlightCode(assignment.submissionContent, assignment.language || 'javascript')}
                                ${assignment.submissionNotes ? `<p><strong>Ghi chú:</strong> ${assignment.submissionNotes}</p>` : ''}
                            ` : `
                                <p><strong>Đáp án đã chọn:</strong> ${String.fromCharCode(65 + assignment.submissionAnswer)} - ${assignment.options[assignment.submissionAnswer]}</p>
                                <p><strong>Đáp án đúng:</strong> ${String.fromCharCode(65 + assignment.correctAnswer)} - ${assignment.options[assignment.correctAnswer]}</p>
                                <p><strong>Kết quả:</strong> <span class="${assignment.submissionAnswer === assignment.correctAnswer ? 'text-success' : 'text-danger'}">
                                    ${assignment.submissionAnswer === assignment.correctAnswer ? 'Đúng ✓' : 'Sai ✗'}
                                </span></p>
                                ${assignment.submissionExplanation ? `<p><strong>Giải thích của học viên:</strong> ${assignment.submissionExplanation}</p>` : ''}
                            `}
                            <div class="submission-actions" style="margin-top: 1rem;">
                                ${assignment.status === 'submitted' ? `
                                    <button class="btn-primary btn-small" onclick="exerciseManager.gradeAssignment('${assignment.id}', '${assignment.type}')">
                                        <i class="fas fa-star"></i> Chấm điểm
                                    </button>
                                ` : assignment.status === 'graded' ? `
                                    <div class="graded-display">
                                        <span class="text-success"><i class="fas fa-star"></i> Đã chấm: ${assignment.grade}/10</span>
                                        <small class="text-muted">Chấm bởi: ${assignment.gradedBy} lúc ${this.formatDateTime(assignment.gradedAt)}</small>
                                        <button class="btn-secondary btn-small" onclick="exerciseManager.gradeAssignment('${assignment.id}', '${assignment.type}')">
                                            <i class="fas fa-edit"></i> Chấm lại
                                        </button>
                                    </div>
                                ` : ''}
                            </div>
                        </div>
                    ` : assignment.status === 'in-progress' ? `
                        <div class="submission-content">
                            <p class="text-muted"><i class="fas fa-clock"></i> Học viên đang làm bài...</p>
                        </div>
                    ` : ''}
                </div>
            `;
        }).join('');
        
        // Re-highlight all code blocks after DOM update
        this.highlightAllCodeBlocks();
    }

    getStatusText(status) {
        const statusMap = {
            'pending': 'Chờ làm',
            'in-progress': 'Đang làm',
            'completed': 'Hoàn thành',
            'submitted': 'Đã nộp',
            'graded': 'Đã chấm'
        };
        return statusMap[status] || status;
    }

    getAssignmentStatusText(assignment) {
        if (assignment.status === 'pending') {
            return assignment.optional ? 'Tùy chọn' : 'Chờ làm';
        } else if (assignment.status === 'in-progress') {
            return 'Đang làm';
        } else if (assignment.status === 'submitted') {
            return 'Đã nộp';
        } else if (assignment.status === 'graded') {
            return `Đã chấm (${assignment.grade}/10)`;
        }
        return 'Hoàn thành';
    }
    
    async gradeAssignment(assignmentId, type) {
        if (!this.selectedStudent) return;
        
        const studentData = await this.getStudentData(this.selectedStudent);
        if (!studentData || !studentData.assignments || !studentData.assignments[type]) {
            this.showError('Không tìm thấy dữ liệu bài tập');
            return;
        }
        
        const assignments = studentData.assignments[type];
        const assignment = assignments.find(a => a.id === assignmentId);
        
        if (!assignment) {
            this.showError('Không tìm thấy bài tập');
            return;
        }
        
        const grade = prompt('Nhập điểm (0-10):', '');
        if (grade === null) return;
        
        const numGrade = parseFloat(grade);
        if (isNaN(numGrade) || numGrade < 0 || numGrade > 10) {
            this.showError('Điểm phải là số từ 0 đến 10');
            return;
        }
        
        assignment.status = 'graded';
        assignment.grade = numGrade;
        assignment.gradedAt = new Date().toISOString();
        assignment.gradedBy = this.currentUser;
        
        await this.saveStudentData(this.selectedStudent, studentData);
        await this.loadStudentExercises();
        this.showSuccess(`Đã chấm điểm ${numGrade}/10 cho bài "${assignment.title}"`);
    }

    async deleteAssignment(assignmentId, type) {
        if (!confirm('Bạn có chắc chắn muốn xóa bài tập này?')) {
            return;
        }

        const studentData = await this.getStudentData(this.selectedStudent);
        if (!studentData || !studentData.assignments || !studentData.assignments[type]) {
            this.showError('Không tìm thấy dữ liệu bài tập');
            return;
        }
        
        studentData.assignments[type] = studentData.assignments[type].filter(a => a.id !== assignmentId);
        await this.saveStudentData(this.selectedStudent, studentData);

        await this.loadStudentExercises();
        this.showSuccess('Đã xóa bài tập');
    }

    // Load Admin Data
    async loadAdminData() {
        await this.loadStudentsList();
        await this.loadStudentSelect();
    }

    // Dashboard
    async loadDashboard() {
        if (this.userRole === 'admin') {
            await this.loadAdminDashboard();
        } else {
            await this.loadStudentDashboard();
        }
    }

    async loadAdminDashboard() {
        const adminData = await this.getAdminData();
        if (!adminData || !adminData.students) {
            // Show empty dashboard
            document.getElementById('coding-count').textContent = '0';
            document.getElementById('quiz-count').textContent = '0';
            document.getElementById('days-count').textContent = '0';
            document.getElementById('streak-count').textContent = '0';
            await this.loadAdminActivities();
            return;
        }
        
        const students = adminData.students;
        
        let totalAssignments = 0;
        let totalSubmissions = 0;
        let totalAttendance = 0;

        for (const student of students) {
            const studentData = await this.getStudentData(student.id);
            if (studentData) {
                if (studentData.assignments) {
                    totalAssignments += (studentData.assignments.coding || []).length + (studentData.assignments.quiz || []).length;
                }
                if (studentData.codingExercises) {
                    totalSubmissions += Object.values(studentData.codingExercises).reduce((acc, day) => acc + (day || []).length, 0);
                }
                if (studentData.quizExercises) {
                    totalSubmissions += Object.values(studentData.quizExercises).reduce((acc, day) => acc + (day || []).length, 0);
                }
                if (studentData.attendance) {
                    totalAttendance += studentData.attendance.length;
                }
            }
        }

        document.getElementById('coding-count').textContent = totalSubmissions;
        document.getElementById('quiz-count').textContent = totalAssignments;
        document.getElementById('days-count').textContent = students.length;
        document.getElementById('streak-count').textContent = Math.round(totalAttendance / Math.max(students.length, 1));

        await this.loadAdminActivities();
    }

    async loadStudentDashboard() {
        const userData = await this.getUserData();
        
        if (!userData) {
            document.getElementById('coding-count').textContent = '0';
            document.getElementById('quiz-count').textContent = '0';
            document.getElementById('days-count').textContent = '0';
            document.getElementById('streak-count').textContent = '0';
            await this.loadRecentActivities();
            return;
        }
        
        const codingCount = userData.codingExercises ? Object.values(userData.codingExercises).reduce((acc, day) => acc + (day || []).length, 0) : 0;
        const quizCount = userData.quizExercises ? Object.values(userData.quizExercises).reduce((acc, day) => acc + (day || []).length, 0) : 0;
        const daysCount = userData.attendance ? userData.attendance.length : 0;
        const streakCount = userData.attendance ? this.calculateStreak(userData.attendance) : 0;

        document.getElementById('coding-count').textContent = codingCount;
        document.getElementById('quiz-count').textContent = quizCount;
        document.getElementById('days-count').textContent = daysCount;
        document.getElementById('streak-count').textContent = streakCount;

        await this.loadRecentActivities();
    }

    async loadAdminActivities() {
        const container = document.getElementById('recent-activities');
        const adminData = await this.getAdminData();
        
        if (!adminData || !adminData.students) {
            container.innerHTML = '<p class="text-muted text-center">Chưa có hoạt động nào</p>';
            return;
        }
        
        // Get recent student activities
        let allActivities = [];
        for (const student of adminData.students) {
            const studentData = await this.getStudentData(student.id);
            if (studentData && studentData.activities) {
                studentData.activities.forEach(activity => {
                    allActivities.push({
                        ...activity,
                        studentName: student.name,
                        studentId: student.id
                    });
                });
            }
        }

        allActivities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        const recentActivities = allActivities.slice(0, 10);

        if (!recentActivities.length) {
            container.innerHTML = '<p class="text-muted text-center">Chưa có hoạt động nào</p>';
            return;
        }

        container.innerHTML = recentActivities.map(activity => `
            <div class="activity-item fade-in">
                <div class="activity-icon ${activity.type}">
                    <i class="fas fa-${this.getActivityIcon(activity.type)}"></i>
                </div>
                <div class="activity-info">
                    <h4>${activity.studentName}: ${activity.title}</h4>
                    <p>${activity.description} • ${this.formatDateTime(activity.timestamp)}</p>
                </div>
            </div>
        `).join('');
    }

    calculateStreak(attendance) {
        if (!attendance.length) return 0;
        
        const sortedDates = attendance.sort().reverse();
        const today = new Date().toISOString().split('T')[0];
        let streak = 0;
        let currentDate = new Date(today);

        for (let i = 0; i < sortedDates.length; i++) {
            const checkDate = currentDate.toISOString().split('T')[0];
            if (sortedDates.includes(checkDate)) {
                streak++;
                currentDate.setDate(currentDate.getDate() - 1);
            } else {
                break;
            }
        }

        return streak;
    }

    async loadRecentActivities() {
        const userData = await this.getUserData();
        const container = document.getElementById('recent-activities');
        
        if (!userData || !userData.activities || !userData.activities.length) {
            container.innerHTML = '<p class="text-muted text-center">Chưa có hoạt động nào</p>';
            return;
        }

        const recentActivities = userData.activities.slice(-10).reverse();
        container.innerHTML = recentActivities.map(activity => `
            <div class="activity-item fade-in">
                <div class="activity-icon ${activity.type}">
                    <i class="fas fa-${this.getActivityIcon(activity.type)}"></i>
                </div>
                <div class="activity-info">
                    <h4>${activity.title}</h4>
                    <p>${activity.description} • ${this.formatDateTime(activity.timestamp)}</p>
                </div>
            </div>
        `).join('');
    }

    getActivityIcon(type) {
        const icons = {
            coding: 'code',
            quiz: 'question-circle',
            checkin: 'calendar-check'
        };
        return icons[type] || 'circle';
    }

    // Daily Check-in (Student Only)
    async handleDailyCheckin() {
        if (this.userRole === 'admin') return;
        
        const userData = await this.getUserData();
        if (!userData) return;
        
        const today = new Date().toISOString().split('T')[0];
        
        if (!userData.attendance) {
            userData.attendance = [];
        }
        
        if (!userData.attendance.includes(today)) {
            userData.attendance.push(today);
            await this.addActivity('checkin', 'Điểm danh thành công', `Đã điểm danh ngày ${this.formatDate(today)}`);
            await this.saveUserData(userData);
        }
        
        await this.updateDailyCheckinButton();
        await this.loadDashboard();
    }

    async updateDailyCheckinButton() {
        if (this.userRole === 'admin') return;
        
        const userData = await this.getUserData();
        if (!userData) return;
        
        const today = new Date().toISOString().split('T')[0];
        const checkinBtn = document.getElementById('daily-checkin');
        
        if (userData.attendance && userData.attendance.includes(today)) {
            checkinBtn.classList.add('checked');
            checkinBtn.innerHTML = '<i class="fas fa-check"></i><span>Đã điểm danh</span>';
        } else {
            checkinBtn.classList.remove('checked');
            checkinBtn.innerHTML = '<i class="fas fa-calendar-check"></i><span>Điểm danh hôm nay</span>';
        }
    }

    // Tab Navigation
    async handleTabSwitch(e) {
        const tab = e.currentTarget.dataset.tab;
        await this.switchTab(tab);
    }

    async switchTab(tab) {
        // Update navigation
        document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelector(`[data-tab="${tab}"]`).classList.add('active');

        // Update content
        document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
        document.getElementById(tab).classList.add('active');

        this.currentTab = tab;

        // Load tab-specific content
        switch (tab) {
            case 'dashboard':
                await this.loadDashboard();
                break;
            case 'student-management':
                await this.loadStudentsList();
                break;
            case 'exercise-management':
                await this.loadStudentSelect();
                await this.loadStudentExercises();
                break;
            case 'coding-exercises':
                await this.loadCodingExercises();
                break;
            case 'quiz-exercises':
                await this.loadQuizExercises();
                break;
            case 'progress':
                await this.loadProgress();
                break;
            case 'daily-assignments':
                await this.loadDailyAssignments();
                break;
        }
    }

    // Daily Assignments Methods
    async loadDailyAssignments() {
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('assignment-date').value = today;
        await this.loadTodayAssignments();
    }

    async loadTodayAssignments() {
        const selectedDate = document.getElementById('assignment-date').value || new Date().toISOString().split('T')[0];
        const container = document.getElementById('today-assignments');
        
        const adminData = await this.getAdminData();
        if (!adminData || !adminData.students) {
            container.innerHTML = '<p class="text-muted text-center">Chưa có bài tập nào được giao trong ngày này</p>';
            return;
        }
        
        let todayAssignments = [];
        
        // Collect all assignments for the selected date
        for (const student of adminData.students) {
            const studentData = await this.getStudentData(student.id);
            if (studentData && studentData.assignments) {
                const allAssignments = [
                    ...(studentData.assignments.coding || []).map(a => ({...a, type: 'coding', studentName: student.name, studentId: student.id})),
                    ...(studentData.assignments.quiz || []).map(a => ({...a, type: 'quiz', studentName: student.name, studentId: student.id}))
                ];
                
                const dateAssignments = allAssignments.filter(a => 
                    a.assignedAt && a.assignedAt.split('T')[0] === selectedDate
                );
                todayAssignments = todayAssignments.concat(dateAssignments);
            }
        }

        if (!todayAssignments.length) {
            container.innerHTML = '<p class="text-muted text-center">Chưa có bài tập nào được giao trong ngày này</p>';
            return;
        }

        container.innerHTML = todayAssignments.map(assignment => `
            <div class="assignment-card fade-in">
                <div class="assignment-header">
                    <div>
                        <div class="assignment-title">
                            <i class="fas fa-${assignment.type === 'coding' ? 'code' : 'question-circle'}"></i>
                            ${assignment.title}
                        </div>
                        <div class="assignment-meta">
                            Học viên: ${assignment.studentName} (${assignment.studentId})
                        </div>
                    </div>
                    <div class="assignment-priority ${assignment.optional ? 'optional' : 'required'}">
                        ${assignment.optional ? 'Tùy chọn' : 'Bắt buộc'}
                    </div>
                </div>
                <p>${assignment.description}</p>
                ${assignment.deadline ? `<p><strong>Hạn nộp:</strong> ${this.formatDateTime(assignment.deadline)}</p>` : ''}
            </div>
        `).join('');
    }

    async handleDateChange() {
        await this.loadTodayAssignments();
    }

    openDailyAssignmentModal(type) {
        this.assignmentType = type;
        this.openAssignmentModal(type, true);
        
        if (type === 'both') {
            document.getElementById('enable-coding').checked = true;
            document.getElementById('enable-quiz').checked = true;
            this.toggleCodingContent();
            this.toggleQuizContent();
        } else if (type === 'coding') {
            document.getElementById('enable-coding').checked = true;
            this.toggleCodingContent();
        } else if (type === 'quiz') {
            document.getElementById('enable-quiz').checked = true;
            this.toggleQuizContent();
        }
    }

    // Assignment Form Methods
    toggleCodingContent() {
        const checkbox = document.getElementById('enable-coding');
        const content = document.getElementById('coding-content');
        content.style.display = checkbox.checked ? 'block' : 'none';
    }

    toggleQuizContent() {
        const checkbox = document.getElementById('enable-quiz');
        const content = document.getElementById('quiz-content');
        content.style.display = checkbox.checked ? 'block' : 'none';
    }

    selectAllStudents() {
        const checkboxes = document.querySelectorAll('#assignment-students input[type="checkbox"]');
        checkboxes.forEach(cb => cb.checked = true);
    }

    deselectAllStudents() {
        const checkboxes = document.querySelectorAll('#assignment-students input[type="checkbox"]');
        checkboxes.forEach(cb => cb.checked = false);
    }

    async populateStudentCheckboxes() {
        const container = document.getElementById('assignment-students');
        const adminData = await this.getAdminData();
        
        container.innerHTML = adminData.students.map(student => `
            <div class="student-checkbox-item">
                <input type="checkbox" id="student-${student.id}" value="${student.id}">
                <label for="student-${student.id}">${student.name} (${student.id})</label>
            </div>
        `).join('');
    }

    // Assignment Methods for Students
    async startAssignment(assignmentId, type) {
        const userData = await this.getUserData();
        const assignments = userData.assignments[type];
        const assignment = assignments.find(a => a.id === assignmentId);
        
        if (!assignment) {
            this.showError('Không tìm thấy bài tập');
            return;
        }
        
        // Update status to in-progress
        assignment.status = 'in-progress';
        assignment.startedAt = new Date().toISOString();
        
        // Update in userData and save
        const assignmentIndex = assignments.findIndex(a => a.id === assignmentId);
        if (assignmentIndex !== -1) {
            assignments[assignmentIndex] = assignment;
        }
        await this.saveUserData(userData);
        
        // Open assignment modal based on type
        if (type === 'coding') {
            this.openCodingAssignmentModal(assignment);
        } else {
            await this.openQuizAssignmentModal(assignment);
        }
        
        await this.addActivity('assignment', 'Bắt đầu bài tập', `Đã bắt đầu "${assignment.title}"`);
    }
    
    async continueAssignment(assignmentId, type) {
        const userData = await this.getUserData();
        if (!userData || !userData.assignments || !userData.assignments[type]) {
            this.showError('Không tìm thấy dữ liệu bài tập');
            return;
        }
        
        const assignments = userData.assignments[type];
        const assignment = assignments.find(a => a.id === assignmentId);
        
        if (!assignment) {
            this.showError('Không tìm thấy bài tập');
            return;
        }
        
        // Check if assignment is graded and cannot be edited
        if (assignment.status === 'graded') {
            this.showError('Bài tập đã được chấm điểm, không thể sửa đổi');
            return;
        }
        
        // Ensure status is in-progress if not already submitted
        if (assignment.status === 'pending') {
            assignment.status = 'in-progress';
            assignment.startedAt = new Date().toISOString();
            
            // Update in userData and save
            const assignmentIndex = assignments.findIndex(a => a.id === assignmentId);
            if (assignmentIndex !== -1) {
                assignments[assignmentIndex] = assignment;
                await this.saveUserData(userData);
            }
        }
        
        // For submitted assignments, revert to in-progress to allow editing
        if (assignment.status === 'submitted') {
            assignment.status = 'in-progress';
            const assignmentIndex = assignments.findIndex(a => a.id === assignmentId);
            if (assignmentIndex !== -1) {
                assignments[assignmentIndex] = assignment;
                await this.saveUserData(userData);
            }
        }
        
        // Open assignment modal with existing work
        if (type === 'coding') {
            this.openCodingAssignmentModal(assignment);
        } else {
            await this.openQuizAssignmentModal(assignment);
        }
    }
    
    async viewCodingSubmission(assignmentId) {
        const userData = await this.getUserData();
        if (!userData || !userData.assignments || !userData.assignments.coding) {
            this.showError('Không tìm thấy dữ liệu bài tập');
            return;
        }
        
        const assignment = userData.assignments.coding.find(a => a.id === assignmentId);
        
        if (!assignment) {
            this.showError('Không tìm thấy bài tập');
            return;
        }
        
        // Open assignment modal in read-only mode
        this.openCodingAssignmentModal(assignment, true); // true for readOnly mode
    }
    
    async submitAssignment(assignmentId, type) {
        const userData = await this.getUserData();
        if (!userData || !userData.assignments || !userData.assignments[type]) {
            this.showError('Không tìm thấy dữ liệu bài tập');
            return;
        }
        
        const assignments = userData.assignments[type];
        const assignment = assignments.find(a => a.id === assignmentId);
        
        if (!assignment) {
            this.showError('Không tìm thấy bài tập');
            return;
        }
        
        // Validate submission based on type
        if (type === 'coding') {
            if (!assignment.submissionContent || assignment.submissionContent.trim() === '') {
                this.showError('Vui lòng nhập code trước khi nộp bài');
                return;
            }
        } else if (type === 'quiz') {
            if (assignment.submissionAnswer === undefined || assignment.submissionAnswer === null) {
                this.showError('Vui lòng chọn đáp án trước khi nộp bài');
                return;
            }
        }
        
        // Update status to submitted
        assignment.status = 'submitted';
        assignment.submittedAt = new Date().toISOString();
        
        // Update in userData and save
        const assignmentIndex = assignments.findIndex(a => a.id === assignmentId);
        if (assignmentIndex !== -1) {
            assignments[assignmentIndex] = assignment;
        }
        await this.saveUserData(userData);
        
        // Reload the exercises view
        if (type === 'coding') {
            await this.loadCodingExercises();
        } else {
            await this.loadQuizExercises();
        }
        
        await this.addActivity('assignment', 'Nộp bài tập', `Đã nộp "${assignment.title}"`);
        this.showSuccess('Đã nộp bài thành công!');
    }
    
    async openCodingAssignmentModal(assignment, readOnly = false) {
        // Get the latest assignment data from userData
        const userData = await this.getUserData();
        if (!userData || !userData.assignments || !userData.assignments.coding) {
            this.showError('Không tìm thấy dữ liệu bài tập');
            return;
        }
        const latestAssignment = userData.assignments.coding.find(a => a.id === assignment.id) || assignment;
        
        document.getElementById('modal-overlay').classList.add('active');
        document.getElementById('coding-modal').classList.add('active');
        
        const titleText = readOnly ? `Xem bài: ${latestAssignment.title}` : `Làm bài: ${latestAssignment.title}`;
        document.getElementById('coding-modal-title').textContent = titleText;
        document.getElementById('coding-title').value = latestAssignment.title;
        document.getElementById('coding-description').value = latestAssignment.description;
        document.getElementById('coding-code').value = latestAssignment.submissionContent || latestAssignment.template || '';
        document.getElementById('coding-language').value = latestAssignment.language || 'javascript';
        document.getElementById('coding-notes').value = latestAssignment.submissionNotes || '';
        
        // Set fields to read-only for assignment mode
        document.getElementById('coding-title').disabled = true;
        document.getElementById('coding-description').disabled = true;
        
        if (readOnly) {
            // In read-only mode, disable code, language and notes fields and hide save button
            document.getElementById('coding-code').disabled = true;
            document.getElementById('coding-language').disabled = true;
            document.getElementById('coding-notes').disabled = true;
            
            // Hide the save button and show close button only
            const saveButton = document.querySelector('#coding-exercise-form button[type="submit"]');
            if (saveButton) {
                saveButton.style.display = 'none';
            }
        } else {
            // In edit mode, enable code, language and notes fields
            document.getElementById('coding-code').disabled = false;
            document.getElementById('coding-language').disabled = false;
            document.getElementById('coding-notes').disabled = false;
            
            // Show the save button
            const saveButton = document.querySelector('#coding-exercise-form button[type="submit"]');
            if (saveButton) {
                saveButton.style.display = 'inline-flex';
                saveButton.textContent = latestAssignment.status === 'submitted' ? 'Cập nhật' : 'Lưu';
            }
        }
        
        // Change form handler to save assignment
        this.currentAssignment = latestAssignment;
        this.isWorkingOnAssignment = !readOnly;
        
        // Highlight any code blocks in modal if visible
        setTimeout(() => {
            this.highlightAllCodeBlocks();
        }, 100);
    }
    
    async openQuizAssignmentModal(assignment) {
        // Get the latest assignment data from userData
        const userData = await this.getUserData();
        const latestAssignment = userData.assignments.quiz.find(a => a.id === assignment.id) || assignment;
        
        document.getElementById('modal-overlay').classList.add('active');
        document.getElementById('quiz-modal').classList.add('active');
        
        const isGraded = latestAssignment.status === 'graded';
        const titleText = isGraded ? `Xem kết quả: ${latestAssignment.title}` : `Trả lời: ${latestAssignment.title}`;
        document.getElementById('quiz-modal-title').textContent = titleText;
        
        // Set question as read-only text
        const questionField = document.getElementById('quiz-question');
        if (questionField) {
            questionField.value = latestAssignment.question;
            questionField.disabled = true;
        }
        
        // Setup options for student selection
        latestAssignment.options.forEach((option, index) => {
            const optionInput = document.getElementById(`option-text-${index}`);
            const radioInput = document.querySelector(`input[name="correct-answer"][value="${index}"]`);
            
            if (optionInput) {
                optionInput.value = option;
                optionInput.disabled = true;
            }
            
            if (radioInput) {
                // Pre-select student's previous answer if exists
                radioInput.checked = latestAssignment.submissionAnswer === index;
                
                // Disable radio buttons if graded
                radioInput.disabled = isGraded;
            }
        });
        
        // Set explanation field for student notes
        const explanationField = document.getElementById('quiz-explanation');
        if (explanationField) {
            if (isGraded && latestAssignment.explanation) {
                // Show teacher's explanation if graded
                explanationField.value = latestAssignment.explanation;
                explanationField.placeholder = 'Giải thích từ giáo viên';
                explanationField.disabled = true;
            } else {
                explanationField.value = latestAssignment.submissionExplanation || '';
                explanationField.placeholder = 'Ghi chú của bạn (tùy chọn)';
                explanationField.disabled = isGraded;
            }
        }
        
        // Show/hide save button based on graded status
        const saveButton = document.querySelector('#quiz-exercise-form button[type="submit"]');
        if (saveButton) {
            if (isGraded) {
                saveButton.style.display = 'none';
            } else {
                saveButton.style.display = 'inline-flex';
                saveButton.textContent = latestAssignment.status === 'submitted' ? 'Cập nhật' : 'Lưu';
            }
        }
        
        // Change form handler to save assignment
        this.currentAssignment = latestAssignment;
        this.isWorkingOnAssignment = !isGraded;
    }

    // Student Exercise Management (for student view)
    async loadDays() {
        const userData = await this.getUserData();
        
        if (!userData) return;
        
        // Load coding days
        const codingSelect = document.getElementById('coding-day-select');
        if (codingSelect) {
            codingSelect.innerHTML = '<option value="">-- Chọn ngày --</option>';
            if (userData.days && userData.days.coding) {
                userData.days.coding.forEach((day, index) => {
                    codingSelect.innerHTML += `<option value="${index}">${day}</option>`;
                });
            }
        }

        // Load quiz days
        const quizSelect = document.getElementById('quiz-day-select');
        if (quizSelect) {
            quizSelect.innerHTML = '<option value="">-- Chọn ngày --</option>';
            if (userData.days && userData.days.quiz) {
                userData.days.quiz.forEach((day, index) => {
                    quizSelect.innerHTML += `<option value="${index}">${day}</option>`;
                });
            }
        }
    }

    openDayModal(type) {
        this.dayModalContext = type;
        document.getElementById('modal-overlay').classList.add('active');
        document.getElementById('day-modal').classList.add('active');
        document.getElementById('day-name').focus();
    }

    async handleDaySubmit(e) {
        e.preventDefault();
        const dayName = document.getElementById('day-name').value.trim();
        
        if (!dayName) {
            this.showError('Vui lòng nhập tên ngày học');
            return;
        }

        const userData = await this.getUserData();
        if (!userData) return;
        
        if (!userData.days) {
            userData.days = { coding: [], quiz: [] };
        }
        if (!userData.days[this.dayModalContext]) {
            userData.days[this.dayModalContext] = [];
        }
        
        userData.days[this.dayModalContext].push(dayName);
        await this.saveUserData(userData);
        
        this.closeModal();
        await this.loadDays();
        await this.addActivity('day', 'Thêm ngày học mới', `Đã thêm "${dayName}" vào ${this.dayModalContext === 'coding' ? 'bài tập lập trình' : 'bài trắc nghiệm'}`);
        
        // Reset form
        document.getElementById('day-name').value = '';
    }

    async handleDayChange(e) {
        const dayIndex = e.target.value;
        const type = e.target.id.includes('coding') ? 'coding' : 'quiz';
        
        if (type === 'coding') {
            await this.loadCodingExercises();
        } else {
            await this.loadQuizExercises();
        }
    }

    // Coding Exercises (Student View)
    async loadCodingExercises() {
        const userData = await this.getUserData();
        const container = document.getElementById('coding-exercises-list');
        
        if (!container) return;

        if (!userData) {
            container.innerHTML = '<div class="empty-state"><p class="text-muted text-center"><i class="fas fa-code"></i><br>Chưa có dữ liệu</p></div>';
            return;
        }
        
        // Show all assignments for this student (always visible)
        const assignments = userData.assignments && userData.assignments.coding ? userData.assignments.coding.slice().sort((a, b) => new Date(b.assignedAt) - new Date(a.assignedAt)) : [];
        let assignmentsHTML = '';
        
        if (assignments.length > 0) {
            assignmentsHTML = `
                <div style="margin-bottom: 2rem;">
                    <h3><i class="fas fa-tasks"></i> Bài tập được giao</h3>
                    ${assignments.map(assignment => {
                        const borderColor = assignment.optional ? 'var(--success-color)' : 'var(--warning-color)';
                        const statusText = this.getAssignmentStatusText(assignment);
                        const isOverdue = assignment.deadline && new Date(assignment.deadline) < new Date() && assignment.status === 'pending';
                        
                        return `
                            <div class="exercise-card fade-in" style="border-left: 4px solid ${borderColor};">
                                <div class="exercise-header">
                                    <div>
                                        <div class="exercise-title">
                                            <i class="fas fa-code"></i>
                                            ${assignment.title}
                                        </div>
                                        <div class="exercise-meta">
                                            Giao: ${this.formatDateTime(assignment.assignedAt)}
                                            ${assignment.deadline ? ` • Hạn: ${this.formatDateTime(assignment.deadline)}` : ''}
                                        </div>
                                        <div class="assignment-types">
                                            <span class="assignment-priority ${assignment.optional ? 'optional' : 'required'}">
                                                ${assignment.optional ? '✨ Tùy chọn' : '⭐ Bắt buộc'}
                                            </span>
                                        </div>
                                    </div>
                                    <span class="status-indicator ${isOverdue ? 'overdue' : assignment.status}">
                                        ${isOverdue ? 'Quá hạn' : statusText}
                                    </span>
                                </div>
                                <p>${assignment.description}</p>
                                ${assignment.template ? `
                                    <div class="exercise-content">
                                        <strong>Code mẫu:</strong>
                                        ${this.highlightCode(assignment.template, assignment.language || 'javascript')}
                                    </div>
                                ` : ''}
                                ${assignment.submissionContent ? `
                                    <div class="exercise-content">
                                        <strong>Bài làm của bạn:</strong>
                                        ${this.highlightCode(assignment.submissionContent, assignment.language || 'javascript')}
                                        ${assignment.submissionNotes ? `
                                            <div style="margin-top: 0.75rem;">
                                                <strong>Ghi chú:</strong>
                                                <p>${assignment.submissionNotes}</p>
                                            </div>
                                        ` : ''}
                                    </div>
                                ` : ''}
                                <div class="assignment-actions">
                                    ${assignment.status === 'pending' ? `
                                        <button class="btn btn-primary" onclick="exerciseManager.startAssignment('${assignment.id}', 'coding')">
                                            <i class="fas fa-play"></i> Bắt đầu làm bài
                                        </button>
                                    ` : assignment.status === 'in-progress' ? `
                                        <button class="btn btn-warning" onclick="exerciseManager.continueAssignment('${assignment.id}', 'coding')">
                                            <i class="fas fa-edit"></i> Sửa bài
                                        </button>
                                        <button class="btn btn-success" onclick="exerciseManager.submitAssignment('${assignment.id}', 'coding')">
                                            <i class="fas fa-paper-plane"></i> Nộp bài
                                        </button>
                                    ` : assignment.status === 'submitted' ? `
                                        <div class="submitted-actions">
                                            <span class="text-success"><i class="fas fa-check"></i> Đã nộp</span>
                                            <small class="text-muted">Đang chờ chấm điểm</small>
                                            <button class="btn btn-outline btn-small" onclick="exerciseManager.continueAssignment('${assignment.id}', 'coding')">
                                                <i class="fas fa-edit"></i> Sửa lại
                                            </button>
                                        </div>
                                    ` : assignment.status === 'graded' ? `
                                        <div class="graded-info">
                                            <span class="text-success"><i class="fas fa-star"></i> Đã chấm điểm: ${assignment.grade}/10</span>
                                            <small class="text-muted">Chấm bởi: ${assignment.gradedBy || 'Giáo viên'}</small>
                                            <button class="btn btn-outline btn-small" onclick="exerciseManager.viewCodingSubmission('${assignment.id}')">
                                                <i class="fas fa-eye"></i> Xem bài làm
                                            </button>
                                        </div>
                                    ` : `
                                        <span class="text-success"><i class="fas fa-check"></i> Hoàn thành</span>
                                    `}
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            `;
        }

        // Show all personal exercises from all days
        let allExercises = [];
        if (userData.codingExercises) {
            Object.keys(userData.codingExercises).forEach(dayKey => {
                const exercises = userData.codingExercises[dayKey] || [];
                exercises.forEach((exercise, index) => {
                    allExercises.push({
                        ...exercise,
                        dayKey,
                        index
                    });
                });
            });
        }

        // Sort by timestamp (newest first)
        allExercises.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        let exercisesHTML = '';
        if (allExercises.length > 0) {
            exercisesHTML = `
                <div style="margin-bottom: 2rem;">
                    <h3><i class="fas fa-code-branch"></i> Bài tập tự tạo</h3>
                    ${allExercises.map(exercise => `
                        <div class="exercise-card fade-in">
                            <div class="exercise-header">
                                <div>
                                    <div class="exercise-title">
                                        <i class="fas fa-file-code"></i>
                                        ${exercise.title}
                                    </div>
                                    <div class="exercise-meta">Ngày tạo: ${this.formatDateTime(exercise.timestamp)}</div>
                                </div>
                                <div class="exercise-actions">
                                    <button class="btn btn-small btn-outline" onclick="exerciseManager.editCodingExercise('${exercise.dayKey}', ${exercise.index})">
                                        <i class="fas fa-edit"></i> Sửa
                                    </button>
                                    <button class="btn btn-small btn-danger" onclick="exerciseManager.deleteCodingExercise('${exercise.dayKey}', ${exercise.index})">
                                        <i class="fas fa-trash"></i> Xóa
                                    </button>
                                </div>
                            </div>
                            ${exercise.description ? `<p class="exercise-description">${exercise.description}</p>` : ''}
                            ${exercise.code ? `
                                <div class="exercise-content">
                                    <strong>Code:</strong>
                                    ${this.highlightCode(exercise.code, exercise.language || 'javascript')}
                                </div>
                            ` : ''}
                            ${exercise.notes ? `
                                <div class="exercise-content">
                                    <strong>Ghi chú:</strong>
                                    <p>${exercise.notes}</p>
                                </div>
                            ` : ''}
                        </div>
                    `).join('')}
                </div>
            `;
        }

        if (!assignments.length && !allExercises.length) {
            exercisesHTML = '<div class="empty-state"><p class="text-muted text-center"><i class="fas fa-code"></i><br>Chưa có bài tập nào. Hãy thêm bài tập đầu tiên!</p></div>';
        }

        container.innerHTML = assignmentsHTML + exercisesHTML;
        
        // Re-highlight all code blocks after DOM update
        this.highlightAllCodeBlocks();
    }

    // Removed duplicate startAssignment method

    // Continue with rest of the methods...
    openExerciseModal(type, isEdit = false) {
        const modal = type === 'coding' ? 'coding-modal' : 'quiz-modal';
        document.getElementById('modal-overlay').classList.add('active');
        document.getElementById(modal).classList.add('active');
        
        if (!isEdit) {
            this.resetExerciseForm(type);
        }
    }

    resetExerciseForm(type) {
        if (type === 'coding') {
            document.getElementById('coding-modal-title').textContent = 'Thêm Bài Tập Lập Trình';
            document.getElementById('coding-exercise-form').reset();
            // Reset language selector to default
            document.getElementById('coding-language').value = 'javascript';
            // Ensure fields are enabled for personal exercises
            document.getElementById('coding-title').disabled = false;
            document.getElementById('coding-description').disabled = false;
        } else {
            document.getElementById('quiz-modal-title').textContent = 'Thêm Câu Hỏi Trắc Nghiệm';
            document.getElementById('quiz-exercise-form').reset();
            // Ensure fields are enabled for personal exercises
            document.getElementById('quiz-question').disabled = false;
            for (let i = 0; i < 4; i++) {
                const optionInput = document.getElementById(`option-text-${i}`);
                if (optionInput) {
                    optionInput.disabled = false;
                }
            }
        }
        
        // Reset all editing and assignment flags
        this.editingExercise = null;
        this.editingType = null;
        this.isWorkingOnAssignment = false;
        this.currentAssignment = null;
    }

    async handleCodingExerciseSubmit(e) {
        e.preventDefault();
        
        // Check if working on assignment
        if (this.isWorkingOnAssignment && this.currentAssignment) {
            const assignment = this.currentAssignment;
            assignment.submissionContent = document.getElementById('coding-code').value.trim();
            assignment.language = document.getElementById('coding-language').value;
            assignment.submissionNotes = document.getElementById('coding-notes').value.trim();
            assignment.lastUpdated = new Date().toISOString();
            
            // IMPORTANT: Update the assignment in userData.assignments array
            const userData = await this.getUserData();
            const assignmentIndex = userData.assignments.coding.findIndex(a => a.id === assignment.id);
            if (assignmentIndex !== -1) {
                userData.assignments.coding[assignmentIndex] = assignment;
            }
            await this.saveUserData(userData);
            
            this.closeModal();
            await this.loadCodingExercises();
            this.showSuccess('Đã lưu bài làm!');
            
            // Reset assignment flags
            this.isWorkingOnAssignment = false;
            this.currentAssignment = null;
            return;
        }

        const exercise = {
            title: document.getElementById('coding-title').value.trim(),
            description: document.getElementById('coding-description').value.trim(),
            code: document.getElementById('coding-code').value.trim(),
            language: document.getElementById('coding-language').value,
            notes: document.getElementById('coding-notes').value.trim(),
            timestamp: new Date().toISOString()
        };

        if (!exercise.title) {
            this.showError('Vui lòng nhập tiêu đề bài tập');
            return;
        }

        const userData = await this.getUserData();
        
        // Use a default key for personal exercises - no day selection needed
        const dayKey = 'personal_exercises';
        
        if (!userData.codingExercises[dayKey]) {
            userData.codingExercises[dayKey] = [];
        }

        if (this.editingExercise !== null && this.editingDayKey) {
            // Editing existing exercise - use the original day key
            userData.codingExercises[this.editingDayKey][this.editingExercise] = exercise;
            await this.addActivity('coding', 'Cập nhật bài tập lập trình', `Đã cập nhật "${exercise.title}"`);
        } else {
            // Adding new exercise - use default key
            userData.codingExercises[dayKey].push(exercise);
            await this.addActivity('coding', 'Thêm bài tập lập trình', `Đã thêm "${exercise.title}"`);
        }

        await this.saveUserData(userData);
        this.closeModal();
        await this.loadCodingExercises();
        await this.loadDashboard();
        this.showSuccess('Đã lưu bài tập thành công!');
        
        // Reset editing state
        this.editingExercise = null;
        this.editingDayKey = null;
    }

    async editCodingExercise(dayKey, index) {
        const userData = await this.getUserData();
        if (!userData || !userData.codingExercises || !userData.codingExercises[dayKey]) return;
        
        const exercise = userData.codingExercises[dayKey][index];
        
        document.getElementById('coding-title').value = exercise.title;
        document.getElementById('coding-description').value = exercise.description || '';
        document.getElementById('coding-code').value = exercise.code || '';
        document.getElementById('coding-language').value = exercise.language || 'javascript';
        document.getElementById('coding-notes').value = exercise.notes || '';
        
        document.getElementById('coding-modal-title').textContent = 'Chỉnh Sửa Bài Tập';
        this.editingExercise = index;
        this.editingDayKey = dayKey;
        this.editingType = 'coding';
        
        this.openExerciseModal('coding', true);
    }

    async deleteCodingExercise(dayKey, index) {
        const userData = await this.getUserData();
        if (!userData || !userData.codingExercises || !userData.codingExercises[dayKey]) return;
        
        const exercise = userData.codingExercises[dayKey][index];
        
        if (confirm(`Bạn có chắc chắn muốn xóa bài tập "${exercise.title}"?`)) {
            userData.codingExercises[dayKey].splice(index, 1);
            await this.addActivity('coding', 'Xóa bài tập lập trình', `Đã xóa "${exercise.title}"`);
            await this.saveUserData(userData);
            await this.loadCodingExercises();
            await this.loadDashboard();
        }
    }

    // Quiz Exercises (Student View) - Updated for continuous learning
    async loadQuizExercises() {
        const userData = await this.getUserData();
        const container = document.getElementById('quiz-exercises-list');
        
        if (!container) return;

        if (!userData) {
            container.innerHTML = '<div class="empty-state"><p class="text-muted text-center"><i class="fas fa-question-circle"></i><br>Chưa có dữ liệu</p></div>';
            return;
        }
        
        // Show all assignments for this student (always visible)
        const assignments = userData.assignments && userData.assignments.quiz ? userData.assignments.quiz.slice().sort((a, b) => new Date(b.assignedAt) - new Date(a.assignedAt)) : [];
        let assignmentsHTML = '';
        
        if (assignments.length > 0) {
            assignmentsHTML = `
                <div style="margin-bottom: 2rem;">
                    <h3><i class="fas fa-tasks"></i> Câu hỏi được giao</h3>
                    ${assignments.map(assignment => {
                        const borderColor = assignment.optional ? 'var(--success-color)' : 'var(--warning-color)';
                        const statusText = this.getAssignmentStatusText(assignment);
                        const isOverdue = assignment.deadline && new Date(assignment.deadline) < new Date() && assignment.status === 'pending';
                        const canEdit = assignment.status !== 'graded'; // Can edit until graded
                        
                        return `
                            <div class="exercise-card fade-in" style="border-left: 4px solid ${borderColor};">
                                <div class="exercise-header">
                                    <div>
                                        <div class="exercise-title">
                                            <i class="fas fa-question-circle"></i>
                                            ${assignment.title}
                                        </div>
                                        <div class="exercise-meta">
                                            Giao: ${this.formatDateTime(assignment.assignedAt)}
                                            ${assignment.deadline ? ` • Hạn: ${this.formatDateTime(assignment.deadline)}` : ''}
                                        </div>
                                        <div class="assignment-types">
                                            <span class="assignment-priority ${assignment.optional ? 'optional' : 'required'}">
                                                ${assignment.optional ? '✨ Tùy chọn' : '⭐ Bắt buộc'}
                                            </span>
                                        </div>
                                    </div>
                                    <span class="status-indicator ${isOverdue ? 'overdue' : assignment.status}">
                                        ${isOverdue ? 'Quá hạn' : statusText}
                                    </span>
                                </div>
                                <p>${assignment.description}</p>
                                <div class="exercise-content">
                                    <strong>Câu hỏi:</strong>
                                    <p>${assignment.question}</p>
                                    <div class="quiz-options">
                                        ${assignment.options.map((option, index) => {
                                            let optionClass = 'quiz-option';
                                            let optionContent = `${String.fromCharCode(65 + index)}. ${option}`;
                                            
                                            // Show student's answer if submitted/graded
                                            if (assignment.status === 'submitted' || assignment.status === 'graded') {
                                                if (assignment.submissionAnswer === index) {
                                                    optionClass += ' student-answer';
                                                    optionContent += ' <i class="fas fa-arrow-left"></i> <small>Bạn đã chọn</small>';
                                                }
                                            }
                                            
                                            // Show correct answer if graded
                                            if (assignment.status === 'graded' && assignment.correctAnswer === index) {
                                                optionClass += ' correct-answer';
                                                optionContent += ' <i class="fas fa-check"></i> <small>Đáp án đúng</small>';
                                            }
                                            
                                            return `<div class="${optionClass}">${optionContent}</div>`;
                                        }).join('')}
                                    </div>
                                    
                                    ${assignment.status === 'graded' && assignment.explanation ? `
                                        <div class="explanation-section">
                                            <strong>Giải thích:</strong>
                                            <p>${assignment.explanation}</p>
                                        </div>
                                    ` : ''}
                                    
                                    ${assignment.submissionExplanation ? `
                                        <div class="student-notes">
                                            <strong>Ghi chú của bạn:</strong>
                                            <p>${assignment.submissionExplanation}</p>
                                        </div>
                                    ` : ''}
                                </div>
                                <div class="assignment-actions">
                                    ${assignment.status === 'pending' ? `
                                        <button class="btn btn-primary" onclick="exerciseManager.startAssignment('${assignment.id}', 'quiz')">
                                            <i class="fas fa-play"></i> Bắt đầu trả lời
                                        </button>
                                    ` : assignment.status === 'in-progress' ? `
                                        <button class="btn btn-warning" onclick="exerciseManager.continueAssignment('${assignment.id}', 'quiz')">
                                            <i class="fas fa-edit"></i> Sửa bài
                                        </button>
                                        <button class="btn btn-success" onclick="exerciseManager.submitAssignment('${assignment.id}', 'quiz')">
                                            <i class="fas fa-paper-plane"></i> Nộp bài
                                        </button>
                                    ` : assignment.status === 'submitted' ? `
                                        <div class="submitted-actions">
                                            <span class="text-success"><i class="fas fa-check"></i> Đã nộp</span>
                                            <small class="text-muted">Đang chờ chấm điểm</small>
                                            <button class="btn btn-outline btn-small" onclick="exerciseManager.continueAssignment('${assignment.id}', 'quiz')">
                                                <i class="fas fa-edit"></i> Sửa lại
                                            </button>
                                        </div>
                                    ` : assignment.status === 'graded' ? `
                                        <div class="graded-info">
                                            <span class="text-success">
                                                <i class="fas fa-star"></i> 
                                                Điểm: ${assignment.grade}/10
                                                ${assignment.submissionAnswer === assignment.correctAnswer ? ' (Đúng)' : ' (Sai)'}
                                            </span>
                                            <small class="text-muted">Chấm bởi: ${assignment.gradedBy || 'Giáo viên'}</small>
                                        </div>
                                    ` : `
                                        <span class="text-success"><i class="fas fa-check"></i> Hoàn thành</span>
                                    `}
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            `;
        }

        // Show all personal quiz exercises from all days
        let allQuizExercises = [];
        if (userData.quizExercises) {
            Object.keys(userData.quizExercises).forEach(dayKey => {
                const exercises = userData.quizExercises[dayKey] || [];
                exercises.forEach((exercise, index) => {
                    allQuizExercises.push({
                        ...exercise,
                        dayKey,
                        index
                    });
                });
            });
        }

        // Sort by timestamp (newest first)
        allQuizExercises.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        let exercisesHTML = '';
        if (allQuizExercises.length > 0) {
            exercisesHTML = `
                <div style="margin-bottom: 2rem;">
                    <h3><i class="fas fa-question-circle"></i> Câu hỏi tự tạo</h3>
                    ${allQuizExercises.map(exercise => `
                        <div class="exercise-card fade-in">
                            <div class="exercise-header">
                                <div>
                                    <div class="exercise-title">
                                        <i class="fas fa-brain"></i>
                                        ${exercise.question.substring(0, 50)}...
                                    </div>
                                    <div class="exercise-meta">Ngày tạo: ${this.formatDateTime(exercise.timestamp)}</div>
                                </div>
                                <div class="exercise-actions">
                                    <button class="btn btn-small btn-outline" onclick="exerciseManager.editQuizExercise('${exercise.dayKey}', ${exercise.index})">
                                        <i class="fas fa-edit"></i> Sửa
                                    </button>
                                    <button class="btn btn-small btn-danger" onclick="exerciseManager.deleteQuizExercise('${exercise.dayKey}', ${exercise.index})">
                                        <i class="fas fa-trash"></i> Xóa
                                    </button>
                                </div>
                            </div>
                            <div class="exercise-content">
                                <strong>Câu hỏi:</strong>
                                <p>${exercise.question}</p>
                                <div class="quiz-options">
                                    ${exercise.options.map((option, optIndex) => `
                                        <div class="quiz-option ${optIndex === exercise.correctAnswer ? 'correct-answer' : ''}">
                                            ${String.fromCharCode(65 + optIndex)}. ${option}
                                            ${optIndex === exercise.correctAnswer ? ' <i class="fas fa-check"></i>' : ''}
                                        </div>
                                    `).join('')}
                                </div>
                                ${exercise.explanation ? `
                                    <div class="explanation-section">
                                        <strong>Giải thích:</strong>
                                        <p>${exercise.explanation}</p>
                                    </div>
                                ` : ''}
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;
        }

        if (!assignments.length && !allQuizExercises.length) {
            exercisesHTML = '<div class="empty-state"><p class="text-muted text-center"><i class="fas fa-question-circle"></i><br>Chưa có câu hỏi nào. Hãy thêm câu hỏi đầu tiên!</p></div>';
        }

        container.innerHTML = assignmentsHTML + exercisesHTML;
        
        // Re-highlight all code blocks after DOM update
        this.highlightAllCodeBlocks();
    }

    async handleQuizExerciseSubmit(e) {
        e.preventDefault();
        
        // Check if working on assignment
        if (this.isWorkingOnAssignment && this.currentAssignment) {
            const assignment = this.currentAssignment;
            const selectedAnswer = document.querySelector('input[name="correct-answer"]:checked');
            
            if (!selectedAnswer) {
                this.showError('Vui lòng chọn đáp án');
                return;
            }
            
            assignment.submissionAnswer = parseInt(selectedAnswer.value);
            assignment.submissionExplanation = document.getElementById('quiz-explanation').value.trim();
            assignment.lastUpdated = new Date().toISOString();
            
            // IMPORTANT: Update the assignment in userData.assignments array
            const userData = await this.getUserData();
            const assignmentIndex = userData.assignments.quiz.findIndex(a => a.id === assignment.id);
            if (assignmentIndex !== -1) {
                userData.assignments.quiz[assignmentIndex] = assignment;
            }
            await this.saveUserData(userData);
            
            this.closeModal();
            await this.loadQuizExercises();
            this.showSuccess('Đã lưu câu trả lời!');
            
            // Reset assignment flags
            this.isWorkingOnAssignment = false;
            this.currentAssignment = null;
            return;
        }
        
        const question = document.getElementById('quiz-question').value.trim();
        const options = [
            document.getElementById('option-text-0').value.trim(),
            document.getElementById('option-text-1').value.trim(),
            document.getElementById('option-text-2').value.trim(),
            document.getElementById('option-text-3').value.trim()
        ];
        const correctAnswer = document.querySelector('input[name="correct-answer"]:checked');
        const explanation = document.getElementById('quiz-explanation').value.trim();

        if (!question) {
            this.showError('Vui lòng nhập câu hỏi');
            return;
        }

        if (options.some(option => !option)) {
            this.showError('Vui lòng nhập đầy đủ 4 đáp án');
            return;
        }

        if (!correctAnswer) {
            this.showError('Vui lòng chọn đáp án đúng');
            return;
        }

        const exercise = {
            question,
            options,
            correctAnswer: parseInt(correctAnswer.value),
            explanation,
            timestamp: new Date().toISOString()
        };

        const userData = await this.getUserData();
        
        // Use a default key for personal quiz exercises - no day selection needed
        const dayKey = 'personal_exercises';
        
        if (!userData.quizExercises[dayKey]) {
            userData.quizExercises[dayKey] = [];
        }

        if (this.editingExercise !== null && this.editingDayKey) {
            // Editing existing exercise - use the original day key
            userData.quizExercises[this.editingDayKey][this.editingExercise] = exercise;
            await this.addActivity('quiz', 'Cập nhật câu hỏi trắc nghiệm', `Đã cập nhật câu hỏi`);
        } else {
            // Adding new exercise - use default key
            userData.quizExercises[dayKey].push(exercise);
            await this.addActivity('quiz', 'Thêm câu hỏi trắc nghiệm', `Đã thêm câu hỏi mới`);
        }

        await this.saveUserData(userData);
        this.closeModal();
        await this.loadQuizExercises();
        await this.loadDashboard();
        this.showSuccess('Đã lưu câu hỏi thành công!');
        
        // Reset editing state
        this.editingExercise = null;
        this.editingDayKey = null;
    }

    async editQuizExercise(dayKey, index) {
        const userData = await this.getUserData();
        const exercise = userData.quizExercises[dayKey][index];
        
        document.getElementById('quiz-question').value = exercise.question;
        document.getElementById('option-text-0').value = exercise.options[0];
        document.getElementById('option-text-1').value = exercise.options[1];
        document.getElementById('option-text-2').value = exercise.options[2];
        document.getElementById('option-text-3').value = exercise.options[3];
        document.querySelector(`input[name="correct-answer"][value="${exercise.correctAnswer}"]`).checked = true;
        document.getElementById('quiz-explanation').value = exercise.explanation || '';
        
        document.getElementById('quiz-modal-title').textContent = 'Chỉnh Sửa Câu Hỏi';
        this.editingExercise = index;
        this.editingDayKey = dayKey;
        this.editingType = 'quiz';
        
        this.openExerciseModal('quiz', true);
    }

    async deleteQuizExercise(dayKey, index) {
        const userData = await this.getUserData();
        
        if (confirm('Bạn có chắc chắn muốn xóa câu hỏi này?')) {
            userData.quizExercises[dayKey].splice(index, 1);
            await this.addActivity('quiz', 'Xóa câu hỏi trắc nghiệm', `Đã xóa câu hỏi ${index + 1}`);
            await this.saveUserData(userData);
            await this.loadQuizExercises();
            await this.loadDashboard();
        }
    }

    // Progress Tracking
    async loadProgress() {
        if (this.userRole === 'admin') {
            await this.loadAdminProgress();
        } else {
            await this.loadStudentProgress();
        }
    }

    async loadAdminProgress() {
        await this.loadAdminStats();
        await this.loadStudentsProgress();
    }

    async loadStudentProgress() {
        await this.loadAttendanceCalendar();
        await this.loadDailyStats();
    }

    async loadAdminStats() {
        const adminData = await this.getAdminData();
        const container = document.getElementById('admin-stats');
        
        if (!container) return;

        let totalAssignments = 0;
        let totalSubmissions = 0;
        let totalAttendance = 0;

        for (const student of adminData.students) {
            const studentData = await this.getStudentData(student.id);
            if (studentData) {
                totalAssignments += studentData.assignments.coding.length + studentData.assignments.quiz.length;
                totalSubmissions += Object.values(studentData.codingExercises).reduce((acc, day) => acc + day.length, 0);
                totalSubmissions += Object.values(studentData.quizExercises).reduce((acc, day) => acc + day.length, 0);
                totalAttendance += studentData.attendance.length;
            }
        }

        container.innerHTML = `
            <div class="admin-stat-card">
                <span class="admin-stat-value">${adminData.students.length}</span>
                <span class="admin-stat-label">Học viên</span>
            </div>
            <div class="admin-stat-card">
                <span class="admin-stat-value">${totalAssignments}</span>
                <span class="admin-stat-label">Bài tập đã giao</span>
            </div>
            <div class="admin-stat-card">
                <span class="admin-stat-value">${totalSubmissions}</span>
                <span class="admin-stat-label">Bài đã nộp</span>
            </div>
            <div class="admin-stat-card">
                <span class="admin-stat-value">${Math.round(totalAttendance / Math.max(adminData.students.length, 1))}</span>
                <span class="admin-stat-label">TB điểm danh</span>
            </div>
        `;
    }

    async loadStudentsProgress() {
        const adminData = await this.getAdminData();
        const container = document.getElementById('students-progress');
        
        if (!container) return;

        const progressHTML = [];
        for (const student of adminData.students) {
            const studentData = await this.getStudentData(student.id);
            
            if (!studentData) {
                progressHTML.push(`
                    <div class="student-progress-item">
                        <div class="student-progress-info">
                            <div class="student-progress-name">${student.name}</div>
                            <div class="student-progress-id">${student.id}</div>
                        </div>
                        <div class="student-progress-stats">
                            <div class="progress-stat">
                                <span class="progress-stat-value">0</span>
                                <span class="progress-stat-label">Bài giao</span>
                            </div>
                            <div class="progress-stat">
                                <span class="progress-stat-value">0</span>
                                <span class="progress-stat-label">Đã nộp</span>
                            </div>
                            <div class="progress-stat">
                                <span class="progress-stat-value">0</span>
                                <span class="progress-stat-label">Điểm danh</span>
                            </div>
                        </div>
                    </div>
                `);
                continue;
            }
            
            const totalAssignments = studentData.assignments.coding.length + studentData.assignments.quiz.length;
            
            // Count submitted and graded assignments (actual work submitted)
            const submittedCoding = studentData.assignments.coding.filter(a => a.status === 'submitted' || a.status === 'graded').length;
            const submittedQuiz = studentData.assignments.quiz.filter(a => a.status === 'submitted' || a.status === 'graded').length;
            const totalSubmitted = submittedCoding + submittedQuiz;
            
            // Count personal exercises (self-created)
            const personalCoding = Object.values(studentData.codingExercises).reduce((acc, day) => acc + day.length, 0);
            const personalQuiz = Object.values(studentData.quizExercises).reduce((acc, day) => acc + day.length, 0);
            const totalPersonal = personalCoding + personalQuiz;
            
            const attendance = studentData.attendance.length;

            progressHTML.push(`
                <div class="student-progress-item">
                    <div class="student-progress-info">
                        <div class="student-progress-name">${student.name}</div>
                        <div class="student-progress-id">${student.id}</div>
                    </div>
                    <div class="student-progress-stats">
                        <div class="progress-stat">
                            <span class="progress-stat-value">${totalAssignments}</span>
                            <span class="progress-stat-label">Bài giao</span>
                        </div>
                        <div class="progress-stat">
                            <span class="progress-stat-value">${totalSubmitted}</span>
                            <span class="progress-stat-label">Đã nộp</span>
                        </div>
                        <div class="progress-stat">
                            <span class="progress-stat-value">${totalPersonal}</span>
                            <span class="progress-stat-label">Tự làm</span>
                        </div>
                        <div class="progress-stat">
                            <span class="progress-stat-value">${attendance}</span>
                            <span class="progress-stat-label">Điểm danh</span>
                        </div>
                    </div>
                </div>
            `);
        }
        
        container.innerHTML = progressHTML.join('');
    }

    async loadAttendanceCalendar() {
        const userData = await this.getUserData();
        const container = document.getElementById('attendance-calendar');
        
        if (!container) return;
        
        const today = new Date();
        const currentMonth = today.getMonth();
        const currentYear = today.getFullYear();
        
        // Get first day of month and number of days
        const firstDay = new Date(currentYear, currentMonth, 1);
        const lastDay = new Date(currentYear, currentMonth + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDayOfWeek = firstDay.getDay();
        
        let calendarHTML = '';
        
        // Add day headers
        const dayHeaders = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
        dayHeaders.forEach(day => {
            calendarHTML += `<div class="calendar-day" style="font-weight: bold; background: var(--text-muted); color: white;">${day}</div>`;
        });
        
        // Add empty cells for days before month starts
        for (let i = 0; i < startingDayOfWeek; i++) {
            calendarHTML += '<div class="calendar-day"></div>';
        }
        
        // Add days of month
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(currentYear, currentMonth, day);
            const dateString = date.toISOString().split('T')[0];
            const isToday = dateString === today.toISOString().split('T')[0];
            const isAttended = userData.attendance.includes(dateString);
            
            let classes = 'calendar-day';
            if (isToday) classes += ' today';
            if (isAttended) classes += ' attended';
            
            calendarHTML += `<div class="${classes}">${day}</div>`;
        }
        
        container.innerHTML = calendarHTML;
    }

    async loadDailyStats() {
        const userData = await this.getUserData();
        const container = document.getElementById('daily-stats');
        
        if (!container) return;
        
        // Calculate overall stats
        const totalCoding = Object.values(userData.codingExercises).reduce((acc, day) => acc + day.length, 0);
        const totalQuiz = Object.values(userData.quizExercises).reduce((acc, day) => acc + day.length, 0);
        const totalAssignments = userData.assignments.coding.length + userData.assignments.quiz.length;
        const completedAssignments = userData.assignments.coding.filter(a => a.status === 'submitted' || a.status === 'graded').length +
                                   userData.assignments.quiz.filter(a => a.status === 'submitted' || a.status === 'graded').length;
        const totalDays = userData.attendance.length;
        const avgPerDay = totalDays > 0 ? ((totalCoding + totalQuiz) / totalDays).toFixed(1) : 0;
        
        // Calculate this month stats
        const currentDate = new Date();
        const currentMonth = currentDate.getMonth();
        const currentYear = currentDate.getFullYear();
        
        let thisMonthCoding = 0;
        let thisMonthQuiz = 0;
        let thisMonthAttendance = 0;
        
        // Count coding exercises this month
        Object.values(userData.codingExercises).forEach(dayExercises => {
            dayExercises.forEach(exercise => {
                const exerciseDate = new Date(exercise.timestamp);
                if (exerciseDate.getMonth() === currentMonth && exerciseDate.getFullYear() === currentYear) {
                    thisMonthCoding++;
                }
            });
        });
        
        // Count quiz exercises this month
        Object.values(userData.quizExercises).forEach(dayExercises => {
            dayExercises.forEach(exercise => {
                const exerciseDate = new Date(exercise.timestamp);
                if (exerciseDate.getMonth() === currentMonth && exerciseDate.getFullYear() === currentYear) {
                    thisMonthQuiz++;
                }
            });
        });
        
        // Count attendance this month
        userData.attendance.forEach(dateString => {
            const attendanceDate = new Date(dateString);
            if (attendanceDate.getMonth() === currentMonth && attendanceDate.getFullYear() === currentYear) {
                thisMonthAttendance++;
            }
        });
        
        // Calculate today stats
        const today = new Date().toISOString().split('T')[0];
        let todayCoding = 0;
        let todayQuiz = 0;
        
        Object.values(userData.codingExercises).forEach(dayExercises => {
            dayExercises.forEach(exercise => {
                if (exercise.timestamp.split('T')[0] === today) {
                    todayCoding++;
                }
            });
        });
        
        Object.values(userData.quizExercises).forEach(dayExercises => {
            dayExercises.forEach(exercise => {
                if (exercise.timestamp.split('T')[0] === today) {
                    todayQuiz++;
                }
            });
        });
        
        const todayAttended = userData.attendance.includes(today);
        
        container.innerHTML = `
            <h4 style="color: var(--primary-color); margin-bottom: 1rem;">📊 Thống kê tổng quan</h4>
            <div class="stat-row">
                <span>Tổng bài tập code:</span>
                <strong>${totalCoding}</strong>
            </div>
            <div class="stat-row">
                <span>Tổng câu trắc nghiệm:</span>
                <strong>${totalQuiz}</strong>
            </div>
            <div class="stat-row">
                <span>Bài tập được giao:</span>
                <strong>${completedAssignments}/${totalAssignments}</strong>
            </div>
            <div class="stat-row">
                <span>Số ngày đã học:</span>
                <strong>${totalDays}</strong>
            </div>
            <div class="stat-row">
                <span>Trung bình bài/ngày:</span>
                <strong>${avgPerDay}</strong>
            </div>
            <div class="stat-row">
                <span>Chuỗi ngày liên tiếp:</span>
                <strong>${this.calculateStreak(userData.attendance)}</strong>
            </div>
            
            <h4 style="color: var(--success-color); margin: 1.5rem 0 1rem;">🗓️ Tháng này (${currentMonth + 1}/${currentYear})</h4>
            <div class="stat-row">
                <span>Bài code tháng này:</span>
                <strong>${thisMonthCoding}</strong>
            </div>
            <div class="stat-row">
                <span>Câu quiz tháng này:</span>
                <strong>${thisMonthQuiz}</strong>
            </div>
            <div class="stat-row">
                <span>Ngày học tháng này:</span>
                <strong>${thisMonthAttendance}</strong>
            </div>
            
            <h4 style="color: var(--warning-color); margin: 1.5rem 0 1rem;">📅 Hôm nay</h4>
            <div class="stat-row">
                <span>Bài code hôm nay:</span>
                <strong>${todayCoding}</strong>
            </div>
            <div class="stat-row">
                <span>Câu quiz hôm nay:</span>
                <strong>${todayQuiz}</strong>
            </div>
            <div class="stat-row">
                <span>Điểm danh hôm nay:</span>
                <strong>${todayAttended ? '✅ Đã điểm danh' : '❌ Chưa điểm danh'}</strong>
            </div>
        `;
    }

    // Modal Management
    handleModalOverlayClick(e) {
        if (e.target === document.getElementById('modal-overlay')) {
            this.closeModal();
        }
    }

    closeModal() {
        document.getElementById('modal-overlay').classList.remove('active');
        document.querySelectorAll('.modal').forEach(modal => {
            modal.classList.remove('active');
        });
        
        // Reset disabled states for form fields
        document.getElementById('coding-title').disabled = false;
        document.getElementById('coding-description').disabled = false;
        document.getElementById('coding-code').disabled = false;
        document.getElementById('coding-language').disabled = false;
        document.getElementById('coding-notes').disabled = false;
        document.getElementById('quiz-question').disabled = false;
        
        // Reset option inputs and radio buttons
        for (let i = 0; i < 4; i++) {
            const optionInput = document.getElementById(`option-text-${i}`);
            const radioInput = document.querySelector(`input[name="correct-answer"][value="${i}"]`);
            
            if (optionInput) {
                optionInput.disabled = false;
            }
            if (radioInput) {
                radioInput.disabled = false;
                radioInput.checked = false;
            }
        }
        
        // Reset explanation field
        const explanationField = document.getElementById('quiz-explanation');
        if (explanationField) {
            explanationField.disabled = false;
            explanationField.placeholder = 'Giải thích (tùy chọn)';
        }
        
        // Reset save buttons
        const codingSaveButton = document.querySelector('#coding-exercise-form button[type="submit"]');
        const quizSaveButton = document.querySelector('#quiz-exercise-form button[type="submit"]');
        
        if (codingSaveButton) {
            codingSaveButton.style.display = 'inline-flex';
            codingSaveButton.textContent = 'Lưu';
        }
        if (quizSaveButton) {
            quizSaveButton.style.display = 'inline-flex';
            quizSaveButton.textContent = 'Lưu';
        }
        
        // Reset assignment flags
        this.isWorkingOnAssignment = false;
        this.currentAssignment = null;
        
        this.editingExercise = null;
        this.editingType = null;
        this.dayModalContext = null;
        this.assignmentType = null;
    }

    // Activity Tracking
    async addActivity(type, title, description) {
        const userData = await this.getUserData();
        userData.activities.push({
            type,
            title,
            description,
            timestamp: new Date().toISOString()
        });
        
        // Keep only last 50 activities
        if (userData.activities.length > 50) {
            userData.activities = userData.activities.slice(-50);
        }
        
        await this.saveUserData(userData);
    }

    // Utility Methods
    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN');
    }

    formatDateTime(dateString) {
        const date = new Date(dateString);
        return date.toLocaleString('vi-VN');
    }

    escapeHtml(unsafe) {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    // Highlight code with Prism.js
    // Language mapping for Prism.js compatibility
    mapLanguageForPrism(language) {
        const languageMap = {
            'cpp': 'cpp',
            'c': 'c',
            'csharp': 'csharp',
            'cs': 'csharp',
            'javascript': 'javascript',
            'js': 'javascript',
            'typescript': 'typescript',
            'ts': 'typescript',
            'python': 'python',
            'py': 'python',
            'java': 'java',
            'php': 'php',
            'ruby': 'ruby',
            'rb': 'ruby',
            'go': 'go',
            'rust': 'rust',
            'kotlin': 'kotlin',
            'swift': 'swift',
            'sql': 'sql',
            'html': 'markup',
            'xml': 'markup',
            'css': 'css',
            'json': 'json',
            'yaml': 'yaml',
            'yml': 'yaml',
            'bash': 'bash',
            'sh': 'bash',
            'powershell': 'powershell',
            'ps1': 'powershell',
            'markdown': 'markdown',
            'md': 'markdown'
        };
        
        return languageMap[language.toLowerCase()] || 'javascript';
    }

    highlightCode(code, language = 'javascript') {
        if (!code || !code.trim()) {
            return '';
        }
        
        try {
            // Map language to Prism.js compatible name
            const prismLanguage = this.mapLanguageForPrism(language);
            
            // Escape HTML first
            const escapedCode = this.escapeHtml(code);
            
            // Create a code element with proper language class
            const codeElement = `<pre><code class="language-${prismLanguage}">${escapedCode}</code></pre>`;
            
            // Create a temporary container
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = codeElement;
            
            // Get the code block
            const codeBlock = tempDiv.querySelector('code');
            
            // Check if Prism is available and language is supported
            if (typeof Prism !== 'undefined') {
                // For autoloader, we need to ensure the language is loaded
                if (Prism.languages[prismLanguage]) {
                    // Language already loaded, highlight immediately
                    Prism.highlightElement(codeBlock);
                } else {
                    // Language not loaded yet, try to load it with autoloader
                    if (Prism.plugins && Prism.plugins.autoloader) {
                        // Use autoloader to load the language
                        Prism.plugins.autoloader.loadLanguages([prismLanguage], () => {
                            Prism.highlightElement(codeBlock);
                        });
                    } else {
                        // Fallback to javascript if autoloader not available
                        codeBlock.className = 'language-javascript';
                        Prism.highlightElement(codeBlock);
                    }
                }
            } else {
                // Prism not available, just return formatted code
                console.warn('Prism.js not loaded');
            }
            
            return tempDiv.innerHTML;
        } catch (error) {
            console.warn('Prism.js highlighting failed:', error);
            // Fallback to escaped HTML if Prism fails
            return `<pre><code class="language-${language}">${this.escapeHtml(code)}</code></pre>`;
        }
    }

    // Re-highlight all code blocks in the current view
    highlightAllCodeBlocks() {
        if (typeof Prism !== 'undefined') {
            // Small delay to ensure DOM is fully updated
            setTimeout(() => {
                try {
                    // Find all code blocks and highlight them individually
                    const codeBlocks = document.querySelectorAll('pre code[class*="language-"]');
                    codeBlocks.forEach(block => {
                        // Get the language from class name
                        const className = block.className;
                        const languageMatch = className.match(/language-([a-zA-Z0-9]+)/);
                        
                        if (languageMatch) {
                            const language = languageMatch[1];
                            
                            // Check if language is loaded
                            if (Prism.languages[language]) {
                                Prism.highlightElement(block);
                            } else if (Prism.plugins && Prism.plugins.autoloader) {
                                // Load language with autoloader
                                Prism.plugins.autoloader.loadLanguages([language], () => {
                                    Prism.highlightElement(block);
                                });
                            }
                        }
                    });
                    
                    // Also call highlightAll as fallback
                    Prism.highlightAll();
                    
                    // Add scroll indicators after highlighting
                    this.addScrollIndicators();
                } catch (error) {
                    console.warn('Prism.js highlightAll failed:', error);
                }
            }, 100);
        }
    }
    
    // Add scroll indicators to code blocks that can scroll
    addScrollIndicators() {
        const codeBlocks = document.querySelectorAll('pre[class*="language-"], .code-block');
        codeBlocks.forEach(block => {
            // Check if the content is scrollable
            const hasVerticalScroll = block.scrollHeight > block.clientHeight;
            const hasHorizontalScroll = block.scrollWidth > block.clientWidth;
            
            if (hasVerticalScroll || hasHorizontalScroll) {
                block.classList.add('has-scroll');
            } else {
                block.classList.remove('has-scroll');
            }
        });
    }
    
    // Initialize Prism configuration
    initializePrismConfig() {
        if (typeof Prism !== 'undefined') {
            // Configure autoloader
            if (Prism.plugins && Prism.plugins.autoloader) {
                Prism.plugins.autoloader.languages_path = 'https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/';
            }
            
            // Set manual mode to prevent automatic highlighting
            Prism.manual = true;
            
            console.log('Prism.js configured successfully');
            console.log('Available languages:', Object.keys(Prism.languages));
            
            // Add scroll indicators on window load
            window.addEventListener('load', () => {
                this.addScrollIndicators();
            });
            
            // Add scroll indicators on window resize
            window.addEventListener('resize', () => {
                this.addScrollIndicators();
            });
        }
    }
    
    // Test method for syntax highlighting
    testSyntaxHighlighting() {
        console.log('Testing syntax highlighting...');
        
        const testCases = [
            { code: 'function hello() {\n    console.log("Hello World!");\n}', language: 'javascript' },
            { code: 'def hello():\n    print("Hello World!")', language: 'python' },
            { code: '#include <iostream>\nint main() {\n    std::cout << "Hello World!" << std::endl;\n    return 0;\n}', language: 'cpp' },
            { code: 'public class Hello {\n    public static void main(String[] args) {\n        System.out.println("Hello World!");\n    }\n}', language: 'java' }
        ];
        
        testCases.forEach((test, index) => {
            console.log(`Test ${index + 1} (${test.language}):`);
            const highlighted = this.highlightCode(test.code, test.language);
            console.log('Input:', test.code);
            console.log('Output:', highlighted);
            console.log('---');
        });
    }

    showError(message) {
        alert('❌ ' + message);
    }

    showSuccess(message) {
        alert('✅ ' + message);
    }
}

// Initialize the application
let exerciseManager;
document.addEventListener('DOMContentLoaded', () => {
    exerciseManager = new ExerciseManager();
});

// Make the instance globally available for onclick handlers
window.exerciseManager = exerciseManager;
window.exerciseManager = exerciseManager;
window.exerciseManager = exerciseManager;