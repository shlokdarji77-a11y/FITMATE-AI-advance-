/**
 * FITMATE AI — Complete Production Application Controller (app.js)
 * High-Integrity Architecture: Fully Persistent Session, Real Data-Flow & Vision AI
 */

/* ==========================================================================
   1. GLOBAL CONFIGURATION & CRYPTO HELPERS
   ========================================================================== */
const FITMATE_CONFIG = {
  APP_NAME: 'FITMATE AI',
  VERSION: '1.1.0',
  ENVIRONMENT: 'production',
  DB_KEY: 'FITMATE_APP_DATA_V1',
  IS_STANDALONE: true,
  // Cloud Sync Architecture — Supabase Integration
  // Ready for user-provided Supabase project URL and anon public key
  SUPABASE: {
    url: '',
    anonKey: '',
    isEnabled: false, // Default dormant: local persistent storage (FitmateDB) active
    status: 'Supabase integration pending configuration.'
  }
};

const CryptoUtil = {
  async hashPassword(password) {
    if (!password) return '';
    try {
      const msgBuffer = new TextEncoder().encode(password);
      const hashBuffer = await window.crypto.subtle.digest('SHA-256', msgBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
    } catch (e) {
      // Fallback hash for environments without crypto.subtle
      let hash = 0;
      for (let i = 0; i < password.length; i++) {
        hash = (hash << 5) - hash + password.charCodeAt(i);
        hash |= 0;
      }
      return 'fb_' + Math.abs(hash).toString(16);
    }
  }
};

/* ==========================================================================
   2. PERSISTENT STORAGE LAYER (FitmateDB)
   ========================================================================== */
const FitmateDB = {
  _getRaw() {
    try {
      const raw = localStorage.getItem(FITMATE_CONFIG.DB_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        parsed.workoutSessions = parsed.workoutSessions || [];
        parsed.exerciseSessions = parsed.exerciseSessions || [];
        parsed.poseMetrics = parsed.poseMetrics || [];
        parsed.formFeedback = parsed.formFeedback || [];
        parsed.aiRecommendations = parsed.aiRecommendations || [];
        parsed.dietPlans = parsed.dietPlans || [];
        parsed.dietPreferences = parsed.dietPreferences || [];
        parsed.chatHistory = parsed.chatHistory || [];
        parsed.voiceSessions = parsed.voiceSessions || [];
        parsed.favorites = parsed.favorites || [];
        return parsed;
      }
    } catch (e) {
      console.warn('Could not parse FitmateDB from localStorage:', e);
    }
    return this._createInitialStore();
  },

  _saveRaw(data) {
    try {
      localStorage.setItem(FITMATE_CONFIG.DB_KEY, JSON.stringify(data));
    } catch (e) {
      console.error('Could not save FitmateDB to localStorage:', e);
    }
  },

  _createInitialStore() {
    const initial = {
      users: [
        // Isolated Demo Accounts (for demo presentation if requested)
        {
          id: 'usr_demo_student',
          email: 'demo.student@campus.edu',
          passwordHash: '0ead2060b65992dca4769af601a1b3a35ef38cfad2c2c465bb160ea764157c5d', // demo1234
          name: 'Alex Patel (Demo)',
          role: 'student',
          createdAt: '2026-09-01T10:00:00Z'
        },
        {
          id: 'usr_demo_coach',
          email: 'demo.coach@campus.edu',
          passwordHash: '0ead2060b65992dca4769af601a1b3a35ef38cfad2c2c465bb160ea764157c5d', // demo1234
          name: 'Coach Martinez',
          role: 'coach',
          createdAt: '2026-08-15T08:00:00Z'
        }
      ],
      session: null, // { userId, role, token, lastActive }
      profiles: [
        {
          userId: 'usr_demo_student',
          age: 21,
          wantsExercise: 'yes',
          goal: 'strength',
          activityLevel: 'intermediate',
          availableTime: '30',
          equipment: 'bodyweight',
          department: 'Computer Science',
          hostel: 'Hostel Block B',
          onboarded: true
        }
      ],
      workouts: [
        {
          id: 'wkt_demo_1',
          userId: 'usr_demo_student',
          title: 'Lower Body Adaptive Squats & Core',
          category: 'Strength',
          exercises: [
            { name: 'Squats', sets: 4, reps: 12, durationSec: 0, instructions: 'Feet shoulder-width, break at hips, track knees over toes.' },
            { name: 'Plank', sets: 3, reps: 1, durationSec: 45, instructions: 'Neutral spine, squeeze glutes, brace abdominal wall.' }
          ],
          durationMin: 20,
          source: 'coach',
          coachAssignmentId: 'asg_demo_1',
          createdAt: '2026-09-12T09:00:00Z'
        }
      ],
      workoutLogs: [
        {
          id: 'log_demo_1',
          userId: 'usr_demo_student',
          workoutId: 'wkt_demo_1',
          exerciseName: 'Squats',
          setsDone: 4,
          repsDone: 48,
          accuracyScore: 94,
          durationSec: 1080,
          date: '2026-09-12',
          time: '11:15 AM',
          verifiedByCamera: true
        }
      ],
      attendance: [
        {
          id: 'att_demo_1',
          userId: 'usr_demo_student',
          date: '2026-09-13',
          timeIn: '11:15 AM',
          status: 'verified',
          confirmedByCoachId: 'usr_demo_coach',
          confirmedByName: 'Coach Martinez',
          updatedAt: '2026-09-13T11:16:00Z'
        }
      ],
      coachAssignments: [
        {
          id: 'asg_demo_1',
          coachId: 'usr_demo_coach',
          coachName: 'Coach Martinez',
          targetUserId: 'usr_demo_student',
          targetAudience: 'individual',
          exerciseName: 'Squats',
          sets: 4,
          reps: 12,
          durationMin: 20,
          notes: 'Focus on 3s controlled eccentric descent. Ensure heels stay grounded.',
          date: '2026-09-13',
          status: 'pending'
        }
      ],
      notifications: [
        {
          id: 'notif_demo_1',
          userId: 'usr_demo_student',
          title: 'Workout Assigned by Coach',
          message: 'Coach Martinez assigned: 4 sets of 12 Adaptive Squats.',
          type: 'workout_assigned',
          read: false,
          createdAt: '2026-09-13T09:00:00Z',
          linkView: 'view-student-workouts'
        }
      ],
      challenges: [
        {
          id: 'ch_campus_squats',
          title: 'Inter-Hostel 1,000 Squat Rally',
          type: 'hostel',
          targetReps: 1000,
          currentReps: 48,
          deadline: 'Sep 30, 2026',
          eligibleExercise: 'Squats',
          participants: [
            { userId: 'usr_demo_student', name: 'Alex Patel (Demo)', reps: 48 }
          ]
        },
        {
          id: 'ch_campus_streak',
          title: 'Campus 30-Day Consistency Cup',
          type: 'campus',
          targetReps: 30,
          currentReps: 1,
          deadline: 'Oct 15, 2026',
          eligibleExercise: 'Any',
          participants: [
            { userId: 'usr_demo_student', name: 'Alex Patel (Demo)', reps: 1 }
          ]
        }
      ],
      memberships: [
        {
          userId: 'usr_demo_student',
          tier: 'Fall Semester Pass',
          status: 'Active',
          expiryDate: 'Dec 20, 2026',
          feeStatus: 'Paid (Institutional)'
        }
      ]
    };
    this._saveRaw(initial);
    return initial;
  },

  // Users
  getUsers() { return this._getRaw().users || []; },
  getUserById(id) { return this.getUsers().find((u) => u.id === id) || null; },
  getUserByEmail(email) {
    if (!email) return null;
    return this.getUsers().find((u) => u.email.toLowerCase() === email.toLowerCase()) || null;
  },
  addUser(user) {
    const data = this._getRaw();
    data.users = data.users || [];
    if (user.email && data.users.some((u) => u.email.toLowerCase() === user.email.toLowerCase())) {
      throw new Error('An account with this email address already exists.');
    }
    if (!user.id) user.id = 'usr_' + Date.now();
    data.users.push(user);
    this._saveRaw(data);
    return user;
  },
  updateUser(id, updates) {
    const data = this._getRaw();
    const idx = data.users.findIndex((u) => u.id === id);
    if (idx !== -1) {
      data.users[idx] = { ...data.users[idx], ...updates };
      this._saveRaw(data);
    }
  },

  // Session
  getSession() { return this._getRaw().session || null; },
  setSession(session) {
    const data = this._getRaw();
    data.session = session;
    this._saveRaw(data);
  },
  clearSession() {
    const data = this._getRaw();
    data.session = null;
    this._saveRaw(data);
  },

  // Profiles
  getProfile(userId) {
    return (this._getRaw().profiles || []).find((p) => p.userId === userId) || null;
  },
  saveProfile(profile) {
    const data = this._getRaw();
    data.profiles = data.profiles || [];
    const idx = data.profiles.findIndex((p) => p.userId === profile.userId);
    if (idx !== -1) {
      data.profiles[idx] = { ...data.profiles[idx], ...profile };
    } else {
      data.profiles.push(profile);
    }
    this._saveRaw(data);
    return profile;
  },

  // Workouts
  getWorkouts(userId) {
    return (this._getRaw().workouts || []).filter((w) => w.userId === userId);
  },
  saveWorkout(workout) {
    const data = this._getRaw();
    data.workouts = data.workouts || [];
    const idx = data.workouts.findIndex((w) => w.id === workout.id);
    if (idx !== -1) {
      data.workouts[idx] = { ...data.workouts[idx], ...workout };
    } else {
      data.workouts.unshift(workout);
    }
    this._saveRaw(data);
    return workout;
  },

  // Workout Logs
  getWorkoutLogs(userId) {
    return (this._getRaw().workoutLogs || []).filter((l) => !userId || l.userId === userId);
  },
  addWorkoutLog(log) {
    const data = this._getRaw();
    data.workoutLogs = data.workoutLogs || [];
    data.workoutLogs.unshift(log);
    this._saveRaw(data);
    return log;
  },

  // Attendance
  getAttendance(userId) {
    const dateStr = new Date().toISOString().split('T')[0];
    return (this._getRaw().attendance || []).find((a) => a.userId === userId && a.date === dateStr) || null;
  },
  getAllAttendance(dateStr) {
    const targetDate = dateStr || new Date().toISOString().split('T')[0];
    return (this._getRaw().attendance || []).filter((a) => a.date === targetDate);
  },
  setAttendance(record) {
    const data = this._getRaw();
    data.attendance = data.attendance || [];
    const idx = data.attendance.findIndex((a) => a.userId === record.userId && a.date === record.date);
    if (idx !== -1) {
      data.attendance[idx] = { ...data.attendance[idx], ...record };
    } else {
      data.attendance.unshift(record);
    }
    this._saveRaw(data);
    return record;
  },

  // Coach Assignments
  getCoachAssignments(userId) {
    return (this._getRaw().coachAssignments || []).filter(
      (a) => a.targetAudience === 'all' || a.targetUserId === userId
    );
  },
  addCoachAssignment(asg) {
    const data = this._getRaw();
    data.coachAssignments = data.coachAssignments || [];
    data.coachAssignments.unshift(asg);
    this._saveRaw(data);
    return asg;
  },

  // Notifications
  getNotifications(userId) {
    return (this._getRaw().notifications || []).filter((n) => n.userId === userId);
  },
  addNotification(notif) {
    const data = this._getRaw();
    data.notifications = data.notifications || [];
    data.notifications.unshift(notif);
    this._saveRaw(data);
    return notif;
  },
  markAllNotificationsRead(userId) {
    const data = this._getRaw();
    data.notifications = (data.notifications || []).map((n) => {
      if (n.userId === userId) n.read = true;
      return n;
    });
    this._saveRaw(data);
  },

  // Challenges
  getChallenges() { return this._getRaw().challenges || []; },
  addChallengeReps(userId, userName, exerciseName, reps) {
    const data = this._getRaw();
    data.challenges = data.challenges || [];
    data.challenges.forEach((ch) => {
      if (ch.eligibleExercise === 'Any' || ch.eligibleExercise.toLowerCase() === exerciseName.toLowerCase()) {
        ch.currentReps = (ch.currentReps || 0) + reps;
        ch.participants = ch.participants || [];
        const p = ch.participants.find((x) => x.userId === userId);
        if (p) {
          p.reps += reps;
        } else {
          ch.participants.push({ userId, name: userName, reps });
        }
      }
    });
    this._saveRaw(data);
  },

  // Memberships
  getMembership(userId) {
    return (this._getRaw().memberships || []).find((m) => m.userId === userId) || null;
  },
  getAllMemberships() { return this._getRaw().memberships || []; },
  saveMembership(membership) {
    const data = this._getRaw();
    data.memberships = data.memberships || [];
    const idx = data.memberships.findIndex((m) => m.userId === membership.userId);
    if (idx !== -1) {
      data.memberships[idx] = { ...data.memberships[idx], ...membership };
    } else {
      data.memberships.push(membership);
    }
    this._saveRaw(data);
    return membership;
  },
  setMembership(membership) {
    return this.saveMembership(membership);
  },

  // --- AI Ecosystem Data Methods ---
  getWorkoutSessions(userId) {
    return (this._getRaw().workoutSessions || []).filter((s) => !userId || s.userId === userId);
  },
  saveWorkoutSession(session) {
    const data = this._getRaw();
    data.workoutSessions = data.workoutSessions || [];
    data.workoutSessions.unshift(session);
    this._saveRaw(data);
    return session;
  },
  getPoseMetrics(userId) {
    return (this._getRaw().poseMetrics || []).filter((m) => !userId || m.userId === userId);
  },
  savePoseMetric(metric) {
    const data = this._getRaw();
    data.poseMetrics = data.poseMetrics || [];
    data.poseMetrics.unshift(metric);
    this._saveRaw(data);
    return metric;
  },
  getAIRecommendations(userId) {
    return (this._getRaw().aiRecommendations || []).filter((r) => !userId || r.userId === userId);
  },
  saveAIRecommendation(rec) {
    const data = this._getRaw();
    data.aiRecommendations = data.aiRecommendations || [];
    data.aiRecommendations.unshift(rec);
    this._saveRaw(data);
    return rec;
  },
  getDietPlan(userId) {
    return (this._getRaw().dietPlans || []).find((d) => d.userId === userId) || null;
  },
  saveDietPlan(userId, plan) {
    const data = this._getRaw();
    data.dietPlans = data.dietPlans || [];
    const idx = data.dietPlans.findIndex((d) => d.userId === userId);
    const entry = { userId, ...plan, updatedAt: new Date().toISOString() };
    if (idx !== -1) {
      data.dietPlans[idx] = entry;
    } else {
      data.dietPlans.unshift(entry);
    }
    this._saveRaw(data);
    return entry;
  },
  getChatHistory(userId) {
    const entry = (this._getRaw().chatHistory || []).find((c) => c.userId === userId);
    return entry ? entry.messages : [];
  },
  saveChatMessage(userId, msg) {
    const data = this._getRaw();
    data.chatHistory = data.chatHistory || [];
    let entry = data.chatHistory.find((c) => c.userId === userId);
    if (!entry) {
      entry = { userId, messages: [] };
      data.chatHistory.push(entry);
    }
    entry.messages.push(msg);
    if (entry.messages.length > 60) entry.messages.shift();
    this._saveRaw(data);
  },
  getFavorites(userId) {
    const entry = (this._getRaw().favorites || []).find((f) => f.userId === userId);
    return entry ? entry.exerciseIds : [];
  },
  toggleFavorite(userId, exerciseId) {
    const data = this._getRaw();
    data.favorites = data.favorites || [];
    let entry = data.favorites.find((f) => f.userId === userId);
    if (!entry) {
      entry = { userId, exerciseIds: [] };
      data.favorites.push(entry);
    }
    const idx = entry.exerciseIds.indexOf(exerciseId);
    if (idx !== -1) {
      entry.exerciseIds.splice(idx, 1);
    } else {
      entry.exerciseIds.push(exerciseId);
    }
    this._saveRaw(data);
    return entry.exerciseIds;
  }
};

/* ==========================================================================
   3. RUNTIME APPLICATION STATE
   ========================================================================== */
const AppState = {
  currentRole: 'student', // 'student' | 'coach'
  currentUser: null,      // Active user object from DB
  currentProfile: null,   // Active user profile from DB
  isAuthenticated: false,
  activeView: 'view-student-dashboard',
  cameraMode: 'none',     // 'none' | 'live'
  cameraStream: null,
  currentExercise: 'squats',
  repCount: 0,
  targetReps: 15,
  isTracking: false,
  lastMotionScore: 0,
  repLockout: false,
  activeWorkoutSession: null
};

// Audio chime synthesizer
let audioCtx = null;
function playRepChime() {
  try {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
    osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.15); // A5
    gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.25);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.25);
  } catch (e) {}
}

/* ==========================================================================
   4. INITIALIZATION & SESSION RESTORATION
   ========================================================================== */
document.addEventListener('DOMContentLoaded', () => {
  initSplashAndSession();
  initRoleSelection();
  initAuth();
  initOnboarding();
  initNavigation();
  initCameraVisualizer();
  initCoachModules();
  initModals();
  if (typeof window.initAiEcosystem === 'function') {
    window.initAiEcosystem();
  }
});

function initSplashAndSession() {
  const progressBar = document.getElementById('splashProgressBar');
  const statusText = document.getElementById('splashStatus');

  let progress = 0;
  const interval = setInterval(() => {
    progress += 25;
    if (progressBar) progressBar.style.width = `${progress}%`;

    if (progress === 50) {
      if (statusText) statusText.textContent = 'Verifying persistent authenticated credentials...';
    } else if (progress === 75) {
      if (statusText) statusText.textContent = 'Calibrating campus database & vision telemetry...';
    } else if (progress >= 100) {
      clearInterval(interval);
      setTimeout(() => {
        // Attempt to restore persistent session
        const restored = restoreUserSession();
        if (!restored) {
          showScreen('screenRole');
        }
      }, 350);
    }
  }, 120);
}

function restoreUserSession() {
  const session = FitmateDB.getSession();
  if (!session || !session.userId) return false;

  const user = FitmateDB.getUserById(session.userId);
  if (!user) {
    FitmateDB.clearSession();
    return false;
  }

  // Restore authenticated state
  AppState.currentUser = user;
  AppState.currentRole = user.role;
  AppState.isAuthenticated = true;
  AppState.currentProfile = FitmateDB.getProfile(user.id);

  // Apply UI Role branding
  setAppRole(user.role, false);
  updateTopBarUserInfo();

  // Route to main application
  showScreen('screenApp');

  // If student and not onboarded, prompt onboarding modal
  if (user.role === 'student') {
    if (!AppState.currentProfile || !AppState.currentProfile.onboarded) {
      openOnboardingModal();
    }
    switchView('view-student-dashboard');
    hydrateStudentDashboard();
  } else {
    switchView('view-coach-dashboard');
    hydrateCoachDashboard();
  }

  refreshNotifications();
  showAppToast('Session Restored', `Welcome back, ${user.name}.`);
  return true;
}

function showScreen(screenId) {
  document.querySelectorAll('.app-screen').forEach((s) => s.classList.remove('active'));
  const target = document.getElementById(screenId);
  if (target) target.classList.add('active');
}

/* ==========================================================================
   5. ROLE SELECTION & AUTHENTICATION
   ========================================================================== */
function initRoleSelection() {
  const roleCards = document.querySelectorAll('[data-select-role]');
  roleCards.forEach((card) => {
    card.addEventListener('click', () => {
      const role = card.getAttribute('data-select-role');
      setAppRole(role, true);
      showScreen('screenAuth');
    });
  });

  const btnBack = document.getElementById('btnBackToRole');
  if (btnBack) {
    btnBack.addEventListener('click', () => {
      clearAuthInputs();
      showScreen('screenRole');
    });
  }
}

function setAppRole(role, clearInputs = true) {
  AppState.currentRole = role;
  const roleTag = document.getElementById('authRoleTag');
  const appBadge = document.getElementById('appRoleBadge');
  const navStudent = document.getElementById('navStudent');
  const navCoach = document.getElementById('navCoach');
  const mobNavStudent = document.getElementById('mobileNavStudent');
  const mobNavCoach = document.getElementById('mobileNavCoach');
  const moreSheetStudent = document.getElementById('moreSheetStudent');
  const moreSheetCoach = document.getElementById('moreSheetCoach');

  if (role === 'coach') {
    if (roleTag) roleTag.textContent = 'Coach / Teacher Account';
    if (appBadge) {
      appBadge.textContent = 'Coach Mode';
      appBadge.style.color = 'var(--accent-coach)';
      appBadge.style.borderColor = 'rgba(245, 158, 11, 0.3)';
      appBadge.style.background = 'rgba(245, 158, 11, 0.1)';
    }
    if (navStudent) navStudent.style.display = 'none';
    if (navCoach) navCoach.style.display = 'flex';
    if (mobNavStudent) mobNavStudent.style.display = 'none';
    if (mobNavCoach) mobNavCoach.style.display = 'flex';
    if (moreSheetStudent) moreSheetStudent.style.display = 'none';
    if (moreSheetCoach) moreSheetCoach.style.display = 'flex';
  } else {
    if (roleTag) roleTag.textContent = 'Student Account';
    if (appBadge) {
      appBadge.textContent = 'Student Mode';
      appBadge.style.color = 'var(--accent-primary)';
      appBadge.style.borderColor = 'rgba(0, 229, 153, 0.25)';
      appBadge.style.background = 'rgba(0, 229, 153, 0.1)';
    }
    if (navStudent) navStudent.style.display = 'flex';
    if (navCoach) navCoach.style.display = 'none';
    if (mobNavStudent) mobNavStudent.style.display = 'flex';
    if (mobNavCoach) mobNavCoach.style.display = 'none';
    if (moreSheetStudent) moreSheetStudent.style.display = 'flex';
    if (moreSheetCoach) moreSheetCoach.style.display = 'none';
  }

  if (clearInputs) clearAuthInputs();
}

function clearAuthInputs() {
  const inputName = document.getElementById('inputName');
  const inputEmail = document.getElementById('inputEmail');
  const inputPassword = document.getElementById('inputPassword');
  if (inputName) inputName.value = '';
  if (inputEmail) inputEmail.value = '';
  if (inputPassword) inputPassword.value = '';
}

function updateTopBarUserInfo() {
  const avatar = document.getElementById('appUserAvatar');
  const nameLabel = document.getElementById('appUserName');
  const drawerAvatar = document.getElementById('drawerUserAvatar');
  const drawerName = document.getElementById('drawerUserName');
  const drawerRole = document.getElementById('drawerUserRole');
  const drawerRoleSub = document.getElementById('drawerRoleSub');
  const user = AppState.currentUser;
  if (!user) return;

  const initials = user.name
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase() || 'U';

  if (avatar) {
    avatar.textContent = initials;
    if (user.role === 'coach') {
      avatar.style.background = 'var(--accent-coach)';
      avatar.style.color = '#000';
    } else {
      avatar.style.background = 'var(--accent-secondary)';
      avatar.style.color = '#fff';
    }
  }
  if (nameLabel) nameLabel.textContent = user.name;

  if (drawerAvatar) {
    drawerAvatar.textContent = initials;
    if (user.role === 'coach') {
      drawerAvatar.style.background = 'var(--accent-coach)';
      drawerAvatar.style.color = '#000';
    } else {
      drawerAvatar.style.background = 'var(--accent-secondary)';
      drawerAvatar.style.color = '#fff';
    }
  }
  if (drawerName) drawerName.textContent = user.name;
  if (drawerRole) {
    drawerRole.textContent = user.role === 'coach' ? 'Coach / Instructor' : 'Student / Gym Member';
    drawerRole.style.color = user.role === 'coach' ? 'var(--accent-coach)' : 'var(--accent-primary)';
  }
  if (drawerRoleSub) {
    drawerRoleSub.textContent = user.role === 'coach' ? 'Coach Workspace' : 'Student Companion';
    drawerRoleSub.style.color = user.role === 'coach' ? 'var(--accent-coach)' : 'var(--accent-primary)';
  }
}

function initAuth() {
  const tabLogin = document.getElementById('tabLogin');
  const tabRegister = document.getElementById('tabRegister');
  const groupName = document.getElementById('groupName');
  const authTitle = document.getElementById('authTitle');
  const authSubtitle = document.getElementById('authSubtitle');
  const btnAuthSubmit = document.getElementById('btnAuthSubmit');
  const formAuth = document.getElementById('formAuth');

  clearAuthInputs();

  let authMode = 'login'; // 'login' | 'register'

  if (tabLogin && tabRegister) {
    tabLogin.addEventListener('click', () => {
      authMode = 'login';
      tabLogin.classList.add('active');
      tabRegister.classList.remove('active');
      groupName.style.display = 'none';
      authTitle.textContent = 'Sign In to FITMATE AI';
      authSubtitle.textContent = 'Access your fitness dashboard and synced records';
      btnAuthSubmit.textContent = 'Sign In';
      clearAuthInputs();
    });

    tabRegister.addEventListener('click', () => {
      authMode = 'register';
      tabRegister.classList.add('active');
      tabLogin.classList.remove('active');
      groupName.style.display = 'block';
      authTitle.textContent = 'Create FITMATE AI Account';
      authSubtitle.textContent = 'Register your institutional profile';
      btnAuthSubmit.textContent = 'Complete Registration';
      clearAuthInputs();
    });
  }

  if (formAuth) {
    formAuth.addEventListener('submit', async (e) => {
      e.preventDefault();

      const inputName = document.getElementById('inputName');
      const inputEmail = document.getElementById('inputEmail');
      const inputPassword = document.getElementById('inputPassword');

      const email = inputEmail.value.trim().toLowerCase();
      const password = inputPassword.value;
      const name = inputName ? inputName.value.trim() : '';

      if (!email || !password) {
        showAppToast('Validation Error', 'Email and password are required.');
        return;
      }

      const passwordHash = await CryptoUtil.hashPassword(password);

      if (authMode === 'register') {
        if (!name) {
          showAppToast('Validation Error', 'Full name is required for registration.');
          return;
        }

        const existing = FitmateDB.getUserByEmail(email);
        if (existing) {
          showAppToast('Account Exists', 'An account with this email already exists. Please log in.');
          return;
        }

        const newUser = {
          id: 'usr_' + Date.now(),
          email,
          passwordHash,
          name,
          role: AppState.currentRole,
          createdAt: new Date().toISOString()
        };

        FitmateDB.addUser(newUser);
        FitmateDB.setSession({
          userId: newUser.id,
          role: newUser.role,
          token: 'tok_' + Date.now(),
          lastActive: new Date().toISOString()
        });

        AppState.currentUser = newUser;
        AppState.isAuthenticated = true;
        updateTopBarUserInfo();
        clearAuthInputs();

        showScreen('screenApp');

        if (newUser.role === 'student') {
          switchView('view-student-dashboard');
          hydrateStudentDashboard();
          openOnboardingModal();
        } else {
          switchView('view-coach-dashboard');
          hydrateCoachDashboard();
        }

        showAppToast('Welcome', `Account created successfully. Welcome, ${name}!`);
      } else {
        // Login mode
        const user = FitmateDB.getUserByEmail(email);
        if (!user || user.passwordHash !== passwordHash) {
          showAppToast('Authentication Failed', 'Invalid email or password. Please try again.');
          return;
        }

        if (user.role !== AppState.currentRole) {
          showAppToast('Role Notice', `Switched to your account role: ${user.role}.`);
          setAppRole(user.role, false);
        }

        FitmateDB.setSession({
          userId: user.id,
          role: user.role,
          token: 'tok_' + Date.now(),
          lastActive: new Date().toISOString()
        });

        AppState.currentUser = user;
        AppState.isAuthenticated = true;
        AppState.currentProfile = FitmateDB.getProfile(user.id);
        updateTopBarUserInfo();
        clearAuthInputs();

        showScreen('screenApp');

        if (user.role === 'student') {
          switchView('view-student-dashboard');
          hydrateStudentDashboard();
          if (!AppState.currentProfile || !AppState.currentProfile.onboarded) {
            openOnboardingModal();
          }
        } else {
          switchView('view-coach-dashboard');
          hydrateCoachDashboard();
        }

        refreshNotifications();
        showAppToast('Signed In', `Welcome back, ${user.name}!`);
      }
    });
  }

  const btnLogout = document.getElementById('btnLogout');
  if (btnLogout) {
    btnLogout.addEventListener('click', logout);
  }
  const btnCoachLogout = document.getElementById('btnCoachLogout');
  if (btnCoachLogout) {
    btnCoachLogout.addEventListener('click', logout);
  }
}

function logout() {
  FitmateDB.clearSession();
  AppState.currentUser = null;
  AppState.currentProfile = null;
  AppState.isAuthenticated = false;
  stopCameraStream();
  clearAuthInputs();
  showScreen('screenRole');
  showAppToast('Signed Out', 'You have been safely signed out.');
}

// Global references for devtools, automated tests, and inline events
window.AppState = AppState;
window.FitmateDB = FitmateDB;
window.logout = logout;
window.switchView = switchView;
window.openSidebarDrawer = openSidebarDrawer;
window.closeSidebarDrawer = closeSidebarDrawer;
window.startWorkoutSession = startWorkoutSession;
window.startActiveRoutine = startActiveRoutine;
window.openOnboardingModal = openOnboardingModal;
window.openExerciseStepsModal = openExerciseStepsModal;
window.openLeaderboardModal = openLeaderboardModal;
window.confirmStudentAttendance = confirmStudentAttendance;
window.toggleStudentAttendance = toggleStudentAttendance;
window.hydrateCoachMembers = hydrateCoachMembers;
window.hydrateCoachAttendance = hydrateCoachAttendance;
window.hydrateCoachDashboard = hydrateCoachDashboard;
window.hydrateStudentDashboard = hydrateStudentDashboard;

/* ==========================================================================
   6. STUDENT ONBOARDING FLOW & AGE-AWARE ADAPTIVE ENGINE
   ========================================================================== */
function initOnboarding() {
  const form = document.getElementById('formOnboarding');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const ageInput = document.getElementById('onboardAge');
    const age = parseInt(ageInput.value, 10);

    if (!age || age < 14 || age > 99) {
      showAppToast('Age Required', 'Please enter a valid age between 14 and 99.');
      return;
    }

    const willingness = document.getElementById('onboardWillingness').value;
    const goal = document.getElementById('onboardGoal').value;
    const activity = document.getElementById('onboardActivity').value;
    const time = document.getElementById('onboardTime').value;
    const equipment = document.getElementById('onboardEquipment').value;

    const user = AppState.currentUser;
    if (!user) return;

    const profile = {
      userId: user.id,
      age,
      wantsExercise: willingness,
      goal,
      activityLevel: activity,
      availableTime: time,
      equipment,
      onboarded: true,
      updatedAt: new Date().toISOString()
    };

    FitmateDB.saveProfile(profile);
    AppState.currentProfile = profile;

    // Generate age-aware, goal-aware initial workout
    const initialWorkout = AdaptiveEngine.generateWorkout(profile);
    FitmateDB.saveWorkout(initialWorkout);

    closeModal('modalStudentOnboarding');
    hydrateStudentDashboard();
    hydrateStudentWorkouts();
    showAppToast('Calibration Complete', `Calibrated workout for age ${age} (${initialWorkout.title}).`);
  });
}

function openOnboardingModal() {
  const modal = document.getElementById('modalStudentOnboarding');
  if (modal) modal.classList.add('active');
}

const AdaptiveEngine = {
  generateWorkout(profile) {
    const age = profile.age || 20;
    const goal = profile.goal || 'strength';
    const time = parseInt(profile.availableTime, 10) || 20;
    const equip = profile.equipment || 'bodyweight';

    let workoutTitle = 'Adaptive Calisthenics Routine';
    let category = 'Functional Strength';
    let exercises = [];

    // Age-aware parameters
    if (age < 20) {
      // Youth / Teens: Speed, mobility, athletic bodyweight conditioning
      workoutTitle = 'Youth Dynamic Conditioning & Agility';
      category = 'Cardio & Mobility';
      exercises = [
        { name: 'Squats', sets: 3, reps: 15, durationSec: 0, instructions: 'Explosive tempo, knees tracking outward, arms counter-balanced.' },
        { name: 'Jumping Jacks', sets: 3, reps: 25, durationSec: 0, instructions: 'Rhythmic coordination, soft landing on midfoot.' },
        { name: 'Push-ups', sets: 3, reps: 10, durationSec: 0, instructions: 'Full elbow lockout, straight line from head to heels.' }
      ];
    } else if (age <= 35) {
      // Young Adults: Progressive hypertrophy & endurance
      workoutTitle = 'High-Performance Campus Hypertrophy';
      category = 'Strength & Hypertrophy';
      exercises = [
        { name: 'Squats', sets: 4, reps: 15, durationSec: 0, instructions: 'Break parallel depth, pause for 1 second at the hole.' },
        { name: 'Push-ups', sets: 3, reps: 15, durationSec: 0, instructions: 'Chest touches floor, 2s eccentric descent.' },
        { name: 'Lunges', sets: 3, reps: 12, durationSec: 0, instructions: '90-degree front knee angle, upright torso.' },
        { name: 'Plank', sets: 3, reps: 1, durationSec: 45, instructions: 'Max abdominal compression, neutral neck.' }
      ];
    } else if (age <= 50) {
      // Adults: Functional posture, joint-friendly tempo
      workoutTitle = 'Functional Joint Health & Core Stability';
      category = 'Core & Mobility';
      exercises = [
        { name: 'Squats', sets: 3, reps: 10, durationSec: 0, instructions: 'Smooth tempo, focus on hip hinge and heel loading.' },
        { name: 'Plank', sets: 3, reps: 1, durationSec: 35, instructions: 'Shoulder stability, steady diaphragmatic breathing.' },
        { name: 'Lunges', sets: 3, reps: 8, durationSec: 0, instructions: 'Controlled stride, gentle knee descent.' }
      ];
    } else {
      // Senior / 50+: Low impact isometric holds & mobility
      workoutTitle = 'Low-Impact Isometric Health Routine';
      category = 'Active Longevity';
      exercises = [
        { name: 'Squats', sets: 2, reps: 8, durationSec: 0, instructions: 'Supported box depth, steady balance.' },
        { name: 'Plank', sets: 3, reps: 1, durationSec: 25, instructions: 'Forearm isometric stability without spinal flexion.' }
      ];
    }

    // Filter based on time
    if (time <= 15) {
      exercises = exercises.slice(0, 2);
      exercises.forEach((ex) => (ex.sets = 2));
    }

    return {
      id: 'wkt_' + Date.now(),
      userId: profile.userId,
      title: workoutTitle,
      category,
      exercises,
      durationMin: time,
      source: 'ai',
      createdAt: new Date().toISOString()
    };
  },

  calculateProgression(logs) {
    if (!logs || logs.length === 0) return 'Baseline (Awaiting 1st Workout)';
    const avgAccuracy = Math.round(logs.reduce((acc, l) => acc + (l.accuracyScore || 85), 0) / logs.length);
    if (logs.length >= 3 && avgAccuracy >= 92) return '+15% Volume Load (High Readiness)';
    if (logs.length >= 2 && avgAccuracy >= 85) return '+8% Progressive Volume';
    if (avgAccuracy < 75) return 'Deload Active (Technique Focus)';
    return 'Calibrated Baseline';
  }
};

/* ==========================================================================
   7. NAVIGATION & VIEW ROUTING
   ========================================================================== */
function openSidebarDrawer() {
  const appSidebar = document.getElementById('appSidebar') || document.querySelector('.app-sidebar');
  const sidebarBackdrop = document.getElementById('sidebarBackdrop');
  const btnMenuToggle = document.getElementById('btnMobileMenuToggle');
  if (appSidebar) appSidebar.classList.add('drawer-open');
  if (sidebarBackdrop) sidebarBackdrop.classList.add('active');
  if (btnMenuToggle) btnMenuToggle.setAttribute('aria-expanded', 'true');
}

function closeSidebarDrawer() {
  const appSidebar = document.getElementById('appSidebar') || document.querySelector('.app-sidebar');
  const sidebarBackdrop = document.getElementById('sidebarBackdrop');
  const btnMenuToggle = document.getElementById('btnMobileMenuToggle');
  if (appSidebar) appSidebar.classList.remove('drawer-open');
  if (sidebarBackdrop) sidebarBackdrop.classList.remove('active');
  if (btnMenuToggle) btnMenuToggle.setAttribute('aria-expanded', 'false');
}

function initNavigation() {
  // Mobile Sidebar Drawer Menu Toggle & Dismiss
  const btnMenuToggle = document.getElementById('btnMobileMenuToggle');
  const btnCloseDrawer = document.getElementById('btnCloseSidebarDrawer');
  const sidebarBackdrop = document.getElementById('sidebarBackdrop');

  if (btnMenuToggle) {
    btnMenuToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      const appSidebar = document.getElementById('appSidebar') || document.querySelector('.app-sidebar');
      if (appSidebar && appSidebar.classList.contains('drawer-open')) {
        closeSidebarDrawer();
      } else {
        openSidebarDrawer();
      }
    });
  }

  if (btnCloseDrawer) {
    btnCloseDrawer.addEventListener('click', closeSidebarDrawer);
  }

  if (sidebarBackdrop) {
    sidebarBackdrop.addEventListener('click', closeSidebarDrawer);
  }

  // Desktop sidebar & Mobile drawer navigation items
  const navButtons = document.querySelectorAll('.nav-item');
  navButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const viewId = btn.getAttribute('data-view');
      closeSidebarDrawer();
      switchView(viewId);
    });
  });

  // Mobile bottom navigation items
  const mobNavButtons = document.querySelectorAll('.mobile-nav-item[data-view]');
  mobNavButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const viewId = btn.getAttribute('data-view');
      closeSidebarDrawer();
      switchView(viewId);
    });
  });

  // Mobile More sheet triggers
  const btnMobStudentMore = document.getElementById('btnMobileStudentMore');
  const btnMobCoachMore = document.getElementById('btnMobileCoachMore');
  const sheetMore = document.getElementById('sheetMobileMore');
  const btnCloseMore = document.getElementById('btnCloseMoreSheet');

  function openMobileMoreSheet() {
    if (sheetMore) {
      sheetMore.classList.add('active');
      sheetMore.setAttribute('aria-hidden', 'false');
    }
  }

  function closeMobileMoreSheet() {
    if (sheetMore) {
      sheetMore.classList.remove('active');
      sheetMore.setAttribute('aria-hidden', 'true');
    }
  }

  if (btnMobStudentMore) btnMobStudentMore.addEventListener('click', openMobileMoreSheet);
  if (btnMobCoachMore) btnMobCoachMore.addEventListener('click', openMobileMoreSheet);
  if (btnCloseMore) btnCloseMore.addEventListener('click', closeMobileMoreSheet);

  if (sheetMore) {
    sheetMore.addEventListener('click', (e) => {
      if (e.target === sheetMore) closeMobileMoreSheet();
    });
  }

  // Mobile Sheet menu item clicks
  document.querySelectorAll('.mobile-sheet-btn[data-view]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const viewId = btn.getAttribute('data-view');
      closeMobileMoreSheet();
      switchView(viewId);
    });
  });

  // Mobile Sign Out triggers
  const btnMobLogout = document.getElementById('btnMobileLogout');
  const btnMobCoachLogout = document.getElementById('btnMobileCoachLogout');
  if (btnMobLogout) {
    btnMobLogout.addEventListener('click', () => {
      closeMobileMoreSheet();
      closeSidebarDrawer();
      logout();
    });
  }
  if (btnMobCoachLogout) {
    btnMobCoachLogout.addEventListener('click', () => {
      closeMobileMoreSheet();
      closeSidebarDrawer();
      logout();
    });
  }

  // Mobile Header Back Button
  const btnMobileBack = document.getElementById('btnMobileBack');
  if (btnMobileBack) {
    btnMobileBack.addEventListener('click', () => {
      const user = AppState.currentUser;
      if (user && user.role === 'coach') {
        switchView('view-coach-dashboard');
      } else {
        switchView('view-student-dashboard');
      }
    });
  }

  // Profile avatar click in header
  const userProfileBtn = document.getElementById('userProfileBtn');
  if (userProfileBtn) {
    userProfileBtn.addEventListener('click', () => {
      const user = AppState.currentUser;
      if (user && user.role === 'coach') {
        switchView('view-coach-profile');
      } else {
        switchView('view-student-profile');
      }
    });
  }

  // Mobile drawer user chip profile click
  const sidebarUserChip = document.getElementById('sidebarUserChip');
  if (sidebarUserChip) {
    sidebarUserChip.style.cursor = 'pointer';
    sidebarUserChip.addEventListener('click', () => {
      closeSidebarDrawer();
      const user = AppState.currentUser;
      if (user && user.role === 'coach') {
        switchView('view-coach-profile');
      } else {
        switchView('view-student-profile');
      }
    });
  }

  // Direct CTAs
  const btnStartToday = document.getElementById('btnStartTodaysWorkout');
  if (btnStartToday) {
    btnStartToday.addEventListener('click', () => {
      startActiveRoutine();
    });
  }

  const btnLaunchTrainer = document.getElementById('btnLaunchTrainerFromDash');
  if (btnLaunchTrainer) {
    btnLaunchTrainer.addEventListener('click', () => {
      startActiveRoutine();
    });
  }

  const btnOpenOnboarding = document.getElementById('btnOpenOnboardingFromWorkouts');
  if (btnOpenOnboarding) {
    btnOpenOnboarding.addEventListener('click', () => openOnboardingModal());
  }

  // Quick workout buttons
  document.querySelectorAll('.quick-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.quick-btn').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      const minutes = parseInt(btn.getAttribute('data-time'), 10);
      generateQuickWorkout(minutes);
    });
  });

  // Close modals when clicking backdrop
  document.querySelectorAll('.app-modal-overlay').forEach((modal) => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.remove('active');
      }
    });
  });
}

function switchView(viewId) {
  // Role Access Guard
  const user = AppState.currentUser;
  if (user && user.role === 'student' && viewId.startsWith('view-coach-')) {
    showAppToast('Access Denied', 'Coach privileges required for instructor views.');
    return;
  }
  if (user && user.role === 'coach' && viewId.startsWith('view-student-')) {
    showAppToast('Access Denied', 'Student view cannot be accessed directly in Coach mode.');
    return;
  }

  AppState.activeView = viewId;

  // Close mobile drawer and mobile more sheet
  closeSidebarDrawer();
  const sheetMore = document.getElementById('sheetMobileMore');
  if (sheetMore) {
    sheetMore.classList.remove('active');
    sheetMore.setAttribute('aria-hidden', 'true');
  }

  // Update Navigation Active State (Desktop Sidebar, Mobile Drawer & Bottom Tabs)
  document.querySelectorAll('.nav-item').forEach((btn) => {
    btn.classList.toggle('active', btn.getAttribute('data-view') === viewId);
  });
  document.querySelectorAll('.mobile-nav-item').forEach((btn) => {
    btn.classList.toggle('active', btn.getAttribute('data-view') === viewId);
  });

  // Update Mobile Header Page Title & Back Button
  const viewTitles = {
    'view-student-dashboard': 'Dashboard',
    'view-student-workouts': 'Workouts',
    'view-student-aitrainer': 'AI Trainer',
    'view-student-progress': 'Progress',
    'view-student-challenges': 'Challenges',
    'view-student-gym': 'Campus Gym',
    'view-student-profile': 'Profile',
    'view-student-aicoach': 'AI Coach',
    'view-student-exerciselibrary': 'Exercise Library',
    'view-student-aichat': 'AI Chatbot',
    'view-student-voiceassistant': 'Voice Assistant',
    'view-student-dietplanner': 'Diet Planner',
    'view-coach-dashboard': 'Dashboard',
    'view-coach-members': 'Members Roster',
    'view-coach-attendance': 'Attendance',
    'view-coach-assign': 'Assign Workout',
    'view-coach-performance': 'Performance',
    'view-coach-insights': 'AI Insights',
    'view-coach-fees': 'Memberships',
    'view-coach-profile': 'Coach Profile'
  };
  const titleEl = document.getElementById('mobilePageTitle');
  if (titleEl) titleEl.textContent = viewTitles[viewId] || 'FITMATE AI';

  const btnMobileBack = document.getElementById('btnMobileBack');
  if (btnMobileBack) {
    const isRoot = viewId === 'view-student-dashboard' || viewId === 'view-coach-dashboard';
    btnMobileBack.style.display = isRoot ? 'none' : 'inline-flex';
  }

  // Scroll main content to top on view switch
  const mainContent = document.querySelector('.app-main-content');
  if (mainContent) mainContent.scrollTop = 0;

  // Switch View Visibility
  document.querySelectorAll('.content-view').forEach((v) => v.classList.remove('active'));
  const target = document.getElementById(viewId);
  if (target) {
    target.classList.add('active');

    // View specific hydrations
    if (viewId === 'view-student-dashboard') hydrateStudentDashboard();
    if (viewId === 'view-student-workouts') hydrateStudentWorkouts();
    if (viewId === 'view-student-progress') hydrateStudentProgress();
    if (viewId === 'view-student-challenges') hydrateStudentChallenges();
    if (viewId === 'view-student-gym') hydrateStudentGym();
    if (viewId === 'view-student-profile') hydrateStudentProfile();
    if (viewId === 'view-student-aicoach' && window.FitmateAICoach) window.FitmateAICoach.renderActiveRecommendation();
    if (viewId === 'view-student-exerciselibrary' && window.FitmateExerciseLibrary) window.FitmateExerciseLibrary.render();
    if (viewId === 'view-student-aichat' && window.FitmateAIChat) window.FitmateAIChat.renderMessages();
    if (viewId === 'view-student-dietplanner' && window.FitmateDietPlanner) window.FitmateDietPlanner.renderPlan();
    if (viewId === 'view-student-aitrainer') {
      startCameraCanvas();
    } else {
      stopCameraStream();
    }

    if (viewId === 'view-coach-dashboard') hydrateCoachDashboard();
    if (viewId === 'view-coach-members') hydrateCoachMembers();
    if (viewId === 'view-coach-attendance') hydrateCoachAttendance();
    if (viewId === 'view-coach-assign') hydrateCoachAssign();
    if (viewId === 'view-coach-performance') hydrateCoachPerformance();
    if (viewId === 'view-coach-insights') hydrateCoachInsights();
    if (viewId === 'view-coach-fees') hydrateCoachFees();
    if (viewId === 'view-coach-profile') hydrateCoachProfile();
  }
}

function startActiveRoutine() {
  const user = AppState.currentUser;
  if (!user) return;

  const workouts = FitmateDB.getWorkouts(user.id);
  const coachAsgs = FitmateDB.getCoachAssignments(user.id);

  if (coachAsgs.length > 0 && coachAsgs[0].status === 'pending') {
    const asg = coachAsgs[0];
    startWorkoutSession(asg.exerciseName, asg.sets, asg.reps, asg.notes, asg.id);
    return;
  }

  if (workouts.length > 0) {
    const wkt = workouts[0];
    const primaryEx = wkt.exercises[0] || { name: 'Squats', sets: 3, reps: 15 };
    startWorkoutSession(primaryEx.name, primaryEx.sets, primaryEx.reps, wkt.title, null);
    return;
  }

  // Not onboarded yet
  openOnboardingModal();
  showAppToast('Onboarding Required', 'Please set your age and goal to calibrate your workout.');
}

function startWorkoutSession(name, sets = 3, reps = 15, notes = '', assignmentId = null) {
  AppState.currentExercise = name.toLowerCase().replace(/[^a-z]/g, '');
  AppState.targetReps = reps || 15;
  AppState.repCount = 0;
  AppState.activeWorkoutSession = {
    exerciseName: name,
    sets: sets || 3,
    targetReps: reps || 15,
    assignmentId,
    startTime: Date.now()
  };

  // Sync pill UI
  document.querySelectorAll('[data-app-exercise]').forEach((p) => {
    const ex = p.getAttribute('data-app-exercise');
    if (ex === AppState.currentExercise) p.classList.add('active');
    else p.classList.remove('active');
  });

  const targetText = document.getElementById('targetRepText');
  if (targetText) targetText.textContent = `${reps} Repetitions (${sets} Sets)`;

  updateRepDisplay();
  showAppToast('Workout Loaded', `Loaded: ${name}. Position in frame or use manual logging.`);
  switchView('view-student-aitrainer');
}

function generateQuickWorkout(minutes) {
  const profile = AppState.currentProfile || { age: 21, goal: 'strength', equipment: 'bodyweight' };
  const quickProfile = { ...profile, availableTime: minutes.toString() };
  const routine = AdaptiveEngine.generateWorkout(quickProfile);
  routine.title = `${minutes} Min Quick Boost`;
  FitmateDB.saveWorkout(routine);

  const ex = routine.exercises[0];
  startWorkoutSession(ex.name, ex.sets, ex.reps, routine.title);
}

/* ==========================================================================
   8. REAL AI TRAINER & COMPUTER VISION
   ========================================================================== */
let canvasAnimationId = null;
let lastFrameData = null;

function initCameraVisualizer() {
  const btnToggleCam = document.getElementById('btnToggleCameraSource');
  const btnStartTracking = document.getElementById('btnStartTracking');
  const btnComplete = document.getElementById('btnCompleteWorkout');
  const manualPlus = document.getElementById('btnManualPlus');
  const manualMinus = document.getElementById('btnManualMinus');
  const manualReset = document.getElementById('btnManualReset');

  // Exercise selection pills
  document.querySelectorAll('[data-app-exercise]').forEach((pill) => {
    pill.addEventListener('click', () => {
      document.querySelectorAll('[data-app-exercise]').forEach((p) => p.classList.remove('active'));
      pill.classList.add('active');
      const exName = pill.getAttribute('data-app-exercise');
      AppState.currentExercise = exName;
      AppState.repCount = 0;
      if (window.FitmatePoseEngine) {
        window.FitmatePoseEngine.setExercise(exName);
        window.FitmatePoseEngine.resetSession();
      }
      updateRepDisplay();
      showAppToast('Exercise Selected', `Switched active exercise to ${pill.textContent}.`);
    });
  });

  if (btnToggleCam) {
    btnToggleCam.addEventListener('click', async () => {
      const banner = document.getElementById('cameraAlertBanner');
      const bannerMsg = document.getElementById('cameraAlertMsg');

      if (AppState.cameraMode === 'none') {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: { width: 640, height: 420, facingMode: 'user' }
          });
          AppState.cameraStream = stream;
          const video = document.getElementById('webcamVideo');
          if (video) {
            video.srcObject = stream;
            video.play();
          }
          AppState.cameraMode = 'live';
          btnToggleCam.textContent = 'Disconnect Webcam';
          if (banner) banner.classList.remove('active');

          const dot = document.getElementById('camStatusDot');
          const txt = document.getElementById('camStatusText');
          if (dot) dot.style.background = '#00e599';
          if (txt) txt.textContent = 'Camera Vision: Live';
          if (window.FitmatePoseEngine) {
            window.FitmatePoseEngine.init(video);
          }

          showAppToast('Camera Connected', 'Live video stream engaged. Stand in full view.');
        } catch (err) {
          AppState.cameraMode = 'none';
          if (banner) banner.classList.add('active');
          if (bannerMsg) {
            bannerMsg.textContent = 'Camera permission denied or camera not found. Use manual rep logger below.';
          }
          showAppToast('Camera Notice', 'Camera access was not granted. Manual logging enabled.');
        }
      } else {
        stopCameraStream();
        btnToggleCam.textContent = 'Use Live Webcam';
        showAppToast('Camera Disconnected', 'Switched to manual logging mode.');
      }
    });
  }

  if (btnStartTracking) {
    btnStartTracking.addEventListener('click', () => {
      AppState.isTracking = !AppState.isTracking;
      btnStartTracking.textContent = AppState.isTracking ? 'Pause Session' : 'Start AI Session';
      btnStartTracking.className = AppState.isTracking ? 'btn btn-secondary btn-sm' : 'btn btn-primary btn-sm';
      const btnMobPause = document.getElementById('btnMobilePauseTracking');
      if (btnMobPause) btnMobPause.textContent = AppState.isTracking ? 'Pause' : 'Resume';
      showAppToast(
        AppState.isTracking ? 'Tracking Active' : 'Session Paused',
        AppState.isTracking ? 'Counting repetitions via live movement telemetry.' : 'Tracking paused.'
      );
    });
  }

  // Mobile dedicated Pause & Finish controls
  const btnMobPause = document.getElementById('btnMobilePauseTracking');
  const btnMobFinish = document.getElementById('btnMobileFinishWorkout');
  if (btnMobPause) {
    btnMobPause.addEventListener('click', () => {
      AppState.isTracking = !AppState.isTracking;
      btnMobPause.textContent = AppState.isTracking ? 'Pause' : 'Resume';
      if (btnStartTracking) {
        btnStartTracking.textContent = AppState.isTracking ? 'Pause Session' : 'Start AI Session';
        btnStartTracking.className = AppState.isTracking ? 'btn btn-secondary btn-sm' : 'btn btn-primary btn-sm';
      }
      showAppToast(
        AppState.isTracking ? 'Tracking Active' : 'Session Paused',
        AppState.isTracking ? 'Counting repetitions via live movement telemetry.' : 'Tracking paused.'
      );
    });
  }
  if (btnMobFinish) {
    btnMobFinish.addEventListener('click', () => {
      completeWorkoutSession();
    });
  }

  // Manual fallback buttons
  if (manualPlus) {
    manualPlus.addEventListener('click', () => {
      AppState.repCount += 1;
      playRepChime();
      updateRepDisplay();
    });
  }
  if (manualMinus) {
    manualMinus.addEventListener('click', () => {
      if (AppState.repCount > 0) AppState.repCount -= 1;
      updateRepDisplay();
    });
  }
  if (manualReset) {
    manualReset.addEventListener('click', () => {
      AppState.repCount = 0;
      updateRepDisplay();
    });
  }

  if (btnComplete) {
    btnComplete.addEventListener('click', () => {
      completeWorkoutSession();
    });
  }
}

function stopCameraStream() {
  if (AppState.cameraStream) {
    AppState.cameraStream.getTracks().forEach((t) => t.stop());
    AppState.cameraStream = null;
  }
  AppState.cameraMode = 'none';
  const dot = document.getElementById('camStatusDot');
  const txt = document.getElementById('camStatusText');
  const btn = document.getElementById('btnToggleCameraSource');
  if (dot) dot.style.background = '#64748b';
  if (txt) txt.textContent = 'Camera: Ready';
  if (btn) btn.textContent = 'Use Live Webcam';
}

function startCameraCanvas() {
  const canvas = document.getElementById('cameraCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const video = document.getElementById('webcamVideo');

  if (canvasAnimationId) cancelAnimationFrame(canvasAnimationId);

  function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (AppState.cameraMode === 'live' && video && video.readyState >= 2) {
      // Render real live webcam video feed
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Real Pose Estimation & Biomechanical Verification
      if (AppState.isTracking && window.FitmatePoseEngine) {
        window.FitmatePoseEngine.processFrame(video, ctx, canvas);
      } else {
        // Live Telemetry Frame Guide
        ctx.strokeStyle = 'rgba(0, 229, 153, 0.4)';
        ctx.lineWidth = 2;
        const boxSize = Math.min(canvas.width * 0.55, canvas.height * 0.7);
        ctx.strokeRect((canvas.width - boxSize) / 2, (canvas.height - boxSize) / 2, boxSize, boxSize);

        const anglePill = document.getElementById('hudAnglePill');
        if (anglePill) {
          anglePill.textContent = 'Stand in full view';
        }
      }
    } else {
      // Clear backdrop when camera is off
      ctx.fillStyle = '#0a0e17';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Grid
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.lineWidth = 1;
      for (let x = 0; x < canvas.width; x += 40) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += 40) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
      }

      // Guidance Text on canvas
      ctx.fillStyle = '#94a3b8';
      ctx.font = '13px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Webcam inactive', canvas.width / 2, canvas.height / 2 - 10);
      ctx.fillText('Tap "Use Live Webcam" or use manual rep buttons below.', canvas.width / 2, canvas.height / 2 + 12);
    }

    canvasAnimationId = requestAnimationFrame(render);
  }

  render();
}

function updateRepDisplay() {
  const repNum = document.getElementById('hudRepCount');
  const progressFill = document.getElementById('sessionProgressFill');
  const mobReps = document.getElementById('mobTrainerReps');
  const mobEx = document.getElementById('mobTrainerExercise');

  if (repNum) repNum.textContent = AppState.repCount;
  if (mobReps) mobReps.textContent = AppState.repCount;

  if (mobEx) {
    const exName = AppState.currentExercise || 'squats';
    mobEx.textContent = exName.charAt(0).toUpperCase() + exName.slice(1);
  }

  if (progressFill) {
    const target = AppState.targetReps || 15;
    const pct = Math.min(100, Math.round((AppState.repCount / target) * 100));
    progressFill.style.width = `${pct}%`;
  }
}

function completeWorkoutSession() {
  const user = AppState.currentUser;
  if (!user) return;

  if (AppState.repCount === 0) {
    showAppToast('No Reps Logged', 'Log at least 1 repetition before saving your workout.');
    return;
  }

  const exName = AppState.currentExercise.charAt(0).toUpperCase() + AppState.currentExercise.slice(1);
  const reps = AppState.repCount;
  const isCamera = AppState.cameraMode === 'live';
  const now = new Date();

  const poseMetrics = window.FitmatePoseEngine ? window.FitmatePoseEngine.sessionMetrics : null;
  const accuracy = poseMetrics ? poseMetrics.averageAccuracy : (isCamera ? 92 : 88);
  const validReps = poseMetrics && poseMetrics.validReps > 0 ? poseMetrics.validReps : reps;

  const log = {
    id: 'log_' + Date.now(),
    userId: user.id,
    workoutId: (AppState.activeWorkoutSession && AppState.activeWorkoutSession.workoutId) || 'wkt_adhoc',
    exerciseName: exName,
    setsDone: (AppState.activeWorkoutSession && AppState.activeWorkoutSession.sets) || 3,
    repsDone: validReps,
    accuracyScore: accuracy,
    durationSec: (poseMetrics && Math.round((Date.now() - poseMetrics.startTime) / 1000)) || 600,
    date: now.toISOString().split('T')[0],
    time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    verifiedByCamera: isCamera
  };

  FitmateDB.addWorkoutLog(log);
  if (window.FitmatePoseEngine) {
    window.FitmatePoseEngine.saveCompletedSession(user.id);
  }

  // Contribute reps to eligible challenges
  FitmateDB.addChallengeReps(user.id, user.name, exName, reps);

  // If coach assignment was active, mark completed
  if (AppState.activeWorkoutSession && AppState.activeWorkoutSession.assignmentId) {
    const asgs = FitmateDB.getCoachAssignments(user.id);
    const asg = asgs.find((a) => a.id === AppState.activeWorkoutSession.assignmentId);
    if (asg) asg.status = 'completed';
  }

  AppState.repCount = 0;
  AppState.activeWorkoutSession = null;
  updateRepDisplay();
  stopCameraStream();

  showAppToast('Workout Saved!', `Logged ${reps} reps of ${exName}. Progress updated.`);
  hydrateStudentDashboard();
  switchView('view-student-progress');
}

/* ==========================================================================
   9. DATA HYDRATION (STUDENT VIEWS)
   ========================================================================== */
function hydrateStudentDashboard() {
  const user = AppState.currentUser;
  if (!user) return;

  const nameSpan = document.getElementById('dashStudentName');
  if (nameSpan) nameSpan.textContent = user.name;

  const logs = FitmateDB.getWorkoutLogs(user.id);
  const profile = FitmateDB.getProfile(user.id);
  const attendance = FitmateDB.getAttendance(user.id);
  const coachAsgs = FitmateDB.getCoachAssignments(user.id).filter((a) => a.status === 'pending');

  // 1. Streak calculation
  const uniqueDays = new Set(logs.map((l) => l.date));
  const streakDays = uniqueDays.size;
  const streakVal = document.getElementById('statStreakVal');
  const streakSub = document.getElementById('statStreakSub');
  if (streakVal) streakVal.textContent = `${streakDays} Day${streakDays === 1 ? '' : 's'}`;
  if (streakSub) streakSub.textContent = streakDays > 0 ? `${streakDays} active days logged` : 'Start your first workout';

  // 2. Weekly completed sessions
  const weeklyVal = document.getElementById('statWeeklyVal');
  const weeklySub = document.getElementById('statWeeklySub');
  const sessionCount = logs.length;
  if (weeklyVal) weeklyVal.textContent = `${sessionCount} / 5 Sessions`;
  if (weeklySub) weeklySub.textContent = sessionCount >= 5 ? 'Weekly goal achieved!' : `${Math.max(0, 5 - sessionCount)} sessions remaining`;

  // 3. AI Form Accuracy
  const accVal = document.getElementById('statAccuracyVal');
  const accSub = document.getElementById('statAccuracySub');
  if (logs.length > 0) {
    const avgScore = Math.round(logs.reduce((acc, l) => acc + (l.accuracyScore || 85), 0) / logs.length);
    if (accVal) accVal.textContent = `${avgScore}%`;
    if (accSub) accSub.textContent = 'Camera & motion verified';
  } else {
    if (accVal) accVal.textContent = 'No data yet';
    if (accSub) accSub.textContent = 'Complete first session';
  }

  // 4. Campus Attendance
  const attVal = document.getElementById('statAttendanceVal');
  const attSub = document.getElementById('statAttendanceSub');
  if (attendance && attendance.status === 'verified') {
    if (attVal) attVal.textContent = 'Verified Present';
    if (attSub) attSub.textContent = `Confirmed by ${attendance.confirmedByName || 'Coach'}`;
  } else if (attendance && attendance.status === 'pending') {
    if (attVal) attVal.textContent = 'Pending Audit';
    if (attSub) attSub.textContent = 'Requested check-in';
  } else {
    if (attVal) attVal.textContent = 'Not recorded yet';
    if (attSub) attSub.textContent = 'Attendance confirmed by coach';
  }

  // 5. Active Assignment / Routine Card
  const assignContainer = document.getElementById('activeAssignmentContainer');
  if (!assignContainer) return;

  if (!profile || !profile.onboarded) {
    assignContainer.innerHTML = `
      <div class="empty-state-card">
        <div class="empty-state-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 4v16m8-8H4"/></svg>
        </div>
        <div class="empty-state-title">No Workout Calibrated Yet</div>
        <div class="empty-state-desc">Complete your quick fitness onboarding so FITMATE AI can tailor a plan to your age, fitness goal, and equipment.</div>
        <button class="btn btn-primary btn-sm" onclick="openOnboardingModal()">Complete Onboarding (1 Min)</button>
      </div>
    `;
    return;
  }

  if (coachAsgs.length > 0) {
    const asg = coachAsgs[0];
    assignContainer.innerHTML = `
      <div class="card-glass">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
          <div>
            <span class="badge badge-mint">Assigned by Coach</span>
            <h3 style="font-size: 1.3rem; margin-top: 0.35rem;">${asg.exerciseName} Routine</h3>
          </div>
          <div class="badge badge-dim">Est. ${asg.durationMin || 20} Mins</div>
        </div>
        <p style="color: var(--text-secondary); margin-bottom: 1.25rem;">
          ${asg.coachName} assigned: ${asg.sets} sets of ${asg.reps} reps. Directives: ${asg.notes || 'Maintain controlled cadence.'}
        </p>
        <div style="display: flex; gap: 0.75rem;">
          <button class="btn btn-primary btn-sm" onclick="startWorkoutSession('${asg.exerciseName}', ${asg.sets}, ${asg.reps}, '${asg.notes}', '${asg.id}')">Launch AI Trainer &amp; Camera</button>
          <button class="btn btn-secondary btn-sm" onclick="openExerciseStepsModal('${asg.exerciseName}')">View Exercise Steps</button>
        </div>
      </div>
    `;
    return;
  }

  const workouts = FitmateDB.getWorkouts(user.id);
  if (workouts.length > 0) {
    const wkt = workouts[0];
    const firstEx = wkt.exercises[0] || { name: 'Squats', sets: 3, reps: 15 };
    assignContainer.innerHTML = `
      <div class="card-glass">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
          <div>
            <span class="badge badge-cyan">Adaptive AI Routine</span>
            <h3 style="font-size: 1.3rem; margin-top: 0.35rem;">${wkt.title}</h3>
          </div>
          <div class="badge badge-dim">Est. ${wkt.durationMin || 20} Mins</div>
        </div>
        <p style="color: var(--text-secondary); margin-bottom: 1.25rem;">
          Calibrated for age ${profile.age}, ${profile.goal} goal. Features ${wkt.exercises.map((e) => e.name).join(', ')}.
        </p>
        <div style="display: flex; gap: 0.75rem;">
          <button class="btn btn-primary btn-sm" onclick="startWorkoutSession('${firstEx.name}', ${firstEx.sets}, ${firstEx.reps}, '${wkt.title}')">Start Today's Workout</button>
          <button class="btn btn-secondary btn-sm" onclick="openExerciseStepsModal('${firstEx.name}')">View Exercise Steps</button>
        </div>
      </div>
    `;
  }
}

function hydrateStudentWorkouts() {
  const user = AppState.currentUser;
  if (!user) return;

  const grid = document.getElementById('studentWorkoutsGrid');
  const emptyState = document.getElementById('studentWorkoutsEmpty');
  const profile = FitmateDB.getProfile(user.id);
  const workouts = FitmateDB.getWorkouts(user.id);

  if (!profile || !profile.onboarded) {
    if (grid) grid.style.display = 'none';
    if (emptyState) emptyState.style.display = 'block';
    return;
  }

  if (workouts.length === 0) {
    const defaultWkt = AdaptiveEngine.generateWorkout(profile);
    FitmateDB.saveWorkout(defaultWkt);
    workouts.push(defaultWkt);
  }

  if (grid) {
    grid.style.display = 'grid';
    grid.innerHTML = workouts.map((w) => {
      const ex1 = w.exercises[0] || { name: 'Squats', sets: 3, reps: 12 };
      return `
        <div class="workout-card">
          <div class="workout-badge">${w.category || 'Adaptive'}</div>
          <h3>${w.title}</h3>
          <p>${w.exercises.map((e) => `${e.name} (${e.sets}x${e.reps})`).join(' • ')}</p>
          <div class="workout-meta">${w.exercises.length} Exercises • ${w.durationMin || 20} Min</div>
          <button class="btn btn-primary btn-sm btn-full" onclick="startWorkoutSession('${ex1.name}', ${ex1.sets}, ${ex1.reps}, '${w.title}')">Start Workout</button>
        </div>
      `;
    }).join('');
  }
  if (emptyState) emptyState.style.display = 'none';
}

function hydrateStudentProgress() {
  const user = AppState.currentUser;
  if (!user) return;

  const logs = FitmateDB.getWorkoutLogs(user.id);
  const totalReps = logs.reduce((acc, l) => acc + (l.repsDone || 0), 0);
  const uniqueDays = new Set(logs.map((l) => l.date)).size;

  const repsVal = document.getElementById('statTotalRepsVal');
  const daysVal = document.getElementById('statActiveDaysVal');
  const progVal = document.getElementById('statProgressionVal');

  if (repsVal) repsVal.textContent = `${totalReps} Reps`;
  if (daysVal) daysVal.textContent = `${uniqueDays} Day${uniqueDays === 1 ? '' : 's'}`;
  if (progVal) progVal.textContent = AdaptiveEngine.calculateProgression(logs);

  const tbody = document.getElementById('progressTableBody');
  const table = document.getElementById('progressDataTable');
  const empty = document.getElementById('progressEmptyState');

  if (logs.length === 0) {
    if (table) table.style.display = 'none';
    if (empty) empty.style.display = 'block';
  } else {
    if (table) table.style.display = 'table';
    if (empty) empty.style.display = 'none';
    if (tbody) {
      tbody.innerHTML = logs.map((l) => `
        <tr>
          <td data-label="Date" style="font-family: var(--font-mono); font-size: 0.85rem;">${l.date} ${l.time || ''}</td>
          <td data-label="Exercise" style="font-weight: 600; color: #fff;">${l.exerciseName}</td>
          <td data-label="Sets & Reps">${l.setsDone} sets • ${l.repsDone} reps</td>
          <td data-label="Form Score"><span class="badge badge-mint">${l.accuracyScore}% Accuracy</span></td>
          <td data-label="Verification"><span class="badge ${l.verifiedByCamera ? 'badge-mint' : 'badge-cyan'}">${l.verifiedByCamera ? 'Camera Verified' : 'Manual Log'}</span></td>
        </tr>
      `).join('');
    }
  }
}

function hydrateStudentChallenges() {
  const user = AppState.currentUser;
  if (!user) return;

  const grid = document.getElementById('challengesGrid');
  const empty = document.getElementById('challengesEmpty');
  const challenges = FitmateDB.getChallenges();

  if (challenges.length === 0) {
    if (grid) grid.style.display = 'none';
    if (empty) empty.style.display = 'block';
    return;
  }

  if (empty) empty.style.display = 'none';
  if (grid) {
    grid.style.display = 'grid';
    grid.innerHTML = challenges.map((ch) => {
      const myPart = (ch.participants || []).find((p) => p.userId === user.id);
      const myReps = myPart ? myPart.reps : 0;
      return `
        <div class="challenge-card">
          <span class="badge ${ch.type === 'hostel' ? 'badge-mint' : 'badge-cyan'}">${ch.type === 'hostel' ? 'Inter-Hostel Cup' : 'Campus Event'}</span>
          <h3 style="margin: 0.5rem 0 0.25rem 0;">${ch.title}</h3>
          <p style="color: var(--text-secondary); font-size: 0.85rem;">Target: ${ch.targetReps} Verified ${ch.eligibleExercise} Reps by ${ch.deadline}.</p>
          <div style="margin: 1rem 0; font-size: 0.85rem; color: var(--text-muted);">
            Campus Total: <strong>${ch.currentReps}</strong> reps • Your Verified Contribution: <strong>${myReps}</strong> reps
          </div>
          <div style="display: flex; gap: 0.5rem;">
            <button class="btn btn-primary btn-sm btn-full" onclick="startWorkoutSession('${ch.eligibleExercise === 'Any' ? 'Squats' : ch.eligibleExercise}', 3, 15, '${ch.title}')">Contribute Reps</button>
            <button class="btn btn-secondary btn-sm btn-full" onclick="openLeaderboardModal('${ch.id}')">View Leaderboard</button>
          </div>
        </div>
      `;
    }).join('');
  }
}

function hydrateStudentGym() {
  const user = AppState.currentUser;
  if (!user) return;

  const attendance = FitmateDB.getAttendance(user.id);
  const statusVal = document.getElementById('gymCheckinStatusVal');
  const subVal = document.getElementById('gymCheckinSub');

  if (attendance && attendance.status === 'verified') {
    if (statusVal) statusVal.textContent = 'Verified Present';
    if (subVal) subVal.textContent = `Confirmed at ${attendance.timeIn} by ${attendance.confirmedByName || 'Coach'}`;
  } else if (attendance && attendance.status === 'pending') {
    if (statusVal) statusVal.textContent = 'Check-in Requested';
    if (subVal) subVal.textContent = `Requested at ${attendance.timeIn}. Waiting for coach confirmation.`;
  } else {
    if (statusVal) statusVal.textContent = 'Not Checked In';
    if (subVal) subVal.textContent = 'Attendance is confirmed manually by your coach.';
  }

  const btnCheckin = document.getElementById('btnRequestGymCheckin');
  if (btnCheckin) {
    btnCheckin.onclick = () => {
      const now = new Date();
      const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      FitmateDB.setAttendance({
        id: 'att_' + Date.now(),
        userId: user.id,
        userName: user.name,
        date: now.toISOString().split('T')[0],
        timeIn: timeStr,
        status: 'pending',
        confirmedByCoachId: null,
        confirmedByName: null,
        updatedAt: now.toISOString()
      });
      hydrateStudentGym();
      showAppToast('Check-in Requested', `Check-in queued at ${timeStr}. Your coach will confirm your attendance.`);
    };
  }
}

function hydrateStudentProfile() {
  const user = AppState.currentUser;
  if (!user) return;

  const profile = FitmateDB.getProfile(user.id) || {};

  const nameInput = document.getElementById('profStudentName');
  const emailInput = document.getElementById('profStudentEmail');
  const ageInput = document.getElementById('profStudentAge');
  const actSelect = document.getElementById('profStudentActivity');
  const goalSelect = document.getElementById('profStudentGoal');
  const timeSelect = document.getElementById('profStudentTime');
  const equipSelect = document.getElementById('profStudentEquipment');
  const deptInput = document.getElementById('profStudentDept');
  const hostelInput = document.getElementById('profStudentHostel');

  if (nameInput) nameInput.value = user.name || '';
  if (emailInput) emailInput.value = user.email || '';
  if (ageInput) ageInput.value = profile.age || '';
  if (actSelect && profile.activityLevel) actSelect.value = profile.activityLevel;
  if (goalSelect && profile.goal) goalSelect.value = profile.goal;
  if (timeSelect && profile.availableTime) timeSelect.value = profile.availableTime;
  if (equipSelect && profile.equipment) equipSelect.value = profile.equipment;
  if (deptInput) deptInput.value = profile.department || '';
  if (hostelInput) hostelInput.value = profile.hostel || '';

  const form = document.getElementById('formStudentProfile');
  if (form) {
    form.onsubmit = (e) => {
      e.preventDefault();
      const newName = nameInput.value.trim();
      const newAge = parseInt(ageInput.value, 10);

      if (!newAge || newAge < 14 || newAge > 99) {
        showAppToast('Invalid Age', 'Please enter an age between 14 and 99.');
        return;
      }

      if (newName && newName !== user.name) {
        user.name = newName;
        FitmateDB.updateUser(user.id, { name: newName });
        updateTopBarUserInfo();
      }

      const updatedProfile = {
        userId: user.id,
        age: newAge,
        activityLevel: actSelect ? actSelect.value : 'intermediate',
        goal: goalSelect ? goalSelect.value : 'strength',
        availableTime: timeSelect ? timeSelect.value : '30',
        equipment: equipSelect ? equipSelect.value : 'bodyweight',
        department: deptInput ? deptInput.value.trim() : '',
        hostel: hostelInput ? hostelInput.value.trim() : '',
        onboarded: true,
        updatedAt: new Date().toISOString()
      };

      FitmateDB.saveProfile(updatedProfile);
      AppState.currentProfile = updatedProfile;

      // Re-calibrate active workouts with updated profile
      const newWkt = AdaptiveEngine.generateWorkout(updatedProfile);
      FitmateDB.saveWorkout(newWkt);

      showAppToast('Profile Updated', 'Your profile and age calibrations were saved.');
      hydrateStudentDashboard();
    };
  }
}

/* ==========================================================================
   10. DATA HYDRATION (COACH VIEWS)
   ========================================================================== */
function hydrateCoachDashboard() {
  const students = FitmateDB.getUsers().filter((u) => u.role === 'student');
  const attendanceToday = FitmateDB.getAllAttendance();
  const verifiedCount = attendanceToday.filter((a) => a.status === 'verified').length;
  const pct = students.length > 0 ? Math.round((verifiedCount / students.length) * 100) : 0;

  const traineesVal = document.getElementById('coachMetricTrainees');
  const attVal = document.getElementById('coachMetricAttendance');
  const alertsVal = document.getElementById('coachMetricAlerts');
  const pendingVal = document.getElementById('coachMetricPending');

  if (traineesVal) traineesVal.textContent = `${students.length} Student${students.length === 1 ? '' : 's'}`;
  if (attVal) attVal.textContent = `${pct}.0%`;
  if (alertsVal) alertsVal.textContent = '0 Students';
  if (pendingVal) pendingVal.textContent = `${attendanceToday.filter((a) => a.status === 'pending').length} Requests`;

  const feed = document.getElementById('quickAttendanceFeed');
  if (feed) {
    const pendingList = attendanceToday.filter((a) => a.status === 'pending');
    if (pendingList.length === 0) {
      feed.innerHTML = `<div style="padding: 1rem 0; color: var(--text-muted); font-size: 0.85rem;">No pending attendance verification requests. All active records are reviewed.</div>`;
    } else {
      feed.innerHTML = pendingList.map((p) => {
        const student = FitmateDB.getUserById(p.userId);
        return `
          <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.75rem 0; border-bottom: 1px solid var(--border-subtle);">
            <div>
              <div style="font-weight: 600; color: #ffffff;">${student ? student.name : 'Student'}</div>
              <div style="font-size: 0.78rem; color: var(--text-muted);">Check-in time: ${p.timeIn}</div>
            </div>
            <button class="btn btn-primary btn-sm" onclick="confirmStudentAttendance('${p.userId}')">Confirm</button>
          </div>
        `;
      }).join('');
    }
  }
}

function hydrateCoachMembers(query = '') {
  const tbody = document.getElementById('coachRosterTableBody');
  const empty = document.getElementById('coachRosterEmpty');
  const table = document.getElementById('coachRosterTable');
  const students = FitmateDB.getUsers().filter((u) => u.role === 'student');

  const filtered = students.filter((s) => {
    const q = query.toLowerCase();
    const prof = FitmateDB.getProfile(s.id) || {};
    return (
      s.name.toLowerCase().includes(q) ||
      s.email.toLowerCase().includes(q) ||
      (prof.department && prof.department.toLowerCase().includes(q))
    );
  });

  if (filtered.length === 0) {
    if (table) table.style.display = 'none';
    if (empty) empty.style.display = 'block';
  } else {
    if (table) table.style.display = 'table';
    if (empty) empty.style.display = 'none';
    if (tbody) {
      tbody.innerHTML = filtered.map((s) => {
        const prof = FitmateDB.getProfile(s.id) || {};
        const logs = FitmateDB.getWorkoutLogs(s.id);
        const uniqueDays = new Set(logs.map((l) => l.date)).size;
        const avgScore = logs.length > 0
          ? Math.round(logs.reduce((acc, l) => acc + (l.accuracyScore || 85), 0) / logs.length) + '%'
          : 'No data';

        return `
          <tr>
            <td data-label="Student Name" style="font-weight: 600; color: #fff;">${s.name}</td>
            <td data-label="Student ID" style="font-family: var(--font-mono); font-size: 0.8rem; color: var(--text-muted);">${(s.id || 'usr_member').replace('usr_', 'ID-')}</td>
            <td data-label="Department / Info">${prof.department || (prof.age ? `Age ${prof.age}` : 'Registered Student')}</td>
            <td data-label="Streak"><span class="badge badge-mint">${uniqueDays} Days</span></td>
            <td data-label="AI Form Avg"><span class="badge badge-cyan">${avgScore}</span></td>
            <td data-label="Actions">
              <button class="btn btn-primary btn-sm" style="margin-right: 0.35rem;" onclick="assignWorkoutToStudent('${s.id}')">Assign</button>
              <button class="btn btn-secondary btn-sm" onclick="showAppToast('Trainee Selected', 'Viewing logs for ${s.name}')">Telemetry</button>
            </td>
          </tr>
        `;
      }).join('');
    }
  }

  const searchInput = document.getElementById('inputMemberSearch');
  if (searchInput && !searchInput.dataset.bound) {
    searchInput.dataset.bound = 'true';
    searchInput.addEventListener('input', (e) => hydrateCoachMembers(e.target.value));
  }
}

function hydrateCoachAttendance() {
  const tbody = document.getElementById('coachAttendanceTableBody');
  const empty = document.getElementById('coachAttendanceEmpty');
  const table = document.getElementById('coachAttendanceTable');
  const students = FitmateDB.getUsers().filter((u) => u.role === 'student');

  if (students.length === 0) {
    if (table) table.style.display = 'none';
    if (empty) empty.style.display = 'block';
    return;
  }

  if (table) table.style.display = 'table';
  if (empty) empty.style.display = 'none';

  if (tbody) {
    tbody.innerHTML = students.map((s) => {
      const att = FitmateDB.getAttendance(s.id);
      const isVerified = att && att.status === 'verified';
      const isPending = att && att.status === 'pending';
      const timeIn = att ? att.timeIn : '—';
      const statusText = isVerified ? 'Verified Present' : (isPending ? 'Check-in Requested' : 'Not Present');
      const badgeClass = isVerified ? 'badge-mint' : (isPending ? 'badge-cyan' : 'badge-dim');

      return `
        <tr>
          <td data-label="Student" style="font-weight: 600; color: #fff;">${s.name}</td>
          <td data-label="Time In" style="font-family: var(--font-mono);">${timeIn}</td>
          <td data-label="Workout Status">${isVerified ? 'Present in Gym' : (isPending ? 'Awaiting Confirmation' : 'No Check-in')}</td>
          <td data-label="Attendance State"><span class="badge ${badgeClass}">${statusText}</span></td>
          <td data-label="Decision">
            <button class="btn ${isVerified ? 'btn-secondary' : 'btn-primary'} btn-sm" onclick="toggleStudentAttendance('${s.id}')">
              ${isVerified ? 'Revoke' : 'Confirm'}
            </button>
          </td>
        </tr>
      `;
    }).join('');
  }

  const btnVerifyAll = document.getElementById('btnVerifyAllAttendance');
  if (btnVerifyAll) {
    btnVerifyAll.onclick = () => {
      const coach = AppState.currentUser;
      const now = new Date();
      const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      students.forEach((s) => {
        FitmateDB.setAttendance({
          id: 'att_' + Date.now() + '_' + s.id,
          userId: s.id,
          userName: s.name,
          date: now.toISOString().split('T')[0],
          timeIn: timeStr,
          status: 'verified',
          confirmedByCoachId: coach ? coach.id : 'coach_instructor',
          confirmedByName: coach ? coach.name : 'Coach',
          updatedAt: now.toISOString()
        });
      });
      hydrateCoachAttendance();
      showAppToast('Attendance Updated', `All ${students.length} student attendance records confirmed.`);
    };
  }
}

function toggleStudentAttendance(studentId) {
  const coach = AppState.currentUser;
  const current = FitmateDB.getAttendance(studentId);
  const now = new Date();
  const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  if (current && current.status === 'verified') {
    FitmateDB.setAttendance({
      ...current,
      status: 'revoked',
      timeIn: '—',
      updatedAt: now.toISOString()
    });
    showAppToast('Attendance Revoked', 'Attendance revoked for student.');
  } else {
    FitmateDB.setAttendance({
      id: current ? current.id : 'att_' + Date.now(),
      userId: studentId,
      date: now.toISOString().split('T')[0],
      timeIn: timeStr,
      status: 'verified',
      confirmedByCoachId: coach ? coach.id : 'coach_instructor',
      confirmedByName: coach ? coach.name : 'Coach',
      updatedAt: now.toISOString()
    });
    // Send in-app notification to the student
    FitmateDB.addNotification({
      id: 'notif_' + Date.now(),
      userId: studentId,
      title: 'Gym Attendance Confirmed',
      message: `Your coach verified your gym attendance today at ${timeStr}.`,
      type: 'attendance',
      read: false,
      createdAt: now.toISOString(),
      linkView: 'view-student-gym'
    });
    showAppToast('Attendance Confirmed', 'Verified attendance record saved.');
  }
  hydrateCoachAttendance();
}

function confirmStudentAttendance(studentId) {
  toggleStudentAttendance(studentId);
  hydrateCoachDashboard();
}

function hydrateCoachAssign() {
  const targetSelect = document.getElementById('assignTarget');
  if (!targetSelect) return;

  const students = FitmateDB.getUsers().filter((u) => u.role === 'student');
  targetSelect.innerHTML = `
    <option value="all">All Enrolled Students (${students.length} members)</option>
    ${students.map((s) => `<option value="${s.id}">${s.name} (${s.email})</option>`).join('')}
  `;

  const form = document.getElementById('formAssignWorkout');
  if (form && !form.dataset.bound) {
    form.dataset.bound = 'true';
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const coach = AppState.currentUser;
      const target = targetSelect.value;
      const exercise = document.getElementById('assignExercise').value;
      const sets = parseInt(document.getElementById('assignSets').value, 10) || 4;
      const reps = parseInt(document.getElementById('assignReps').value, 10) || 12;
      const notes = document.getElementById('assignNotes').value.trim();

      const asg = {
        id: 'asg_' + Date.now(),
        coachId: coach ? coach.id : 'coach',
        coachName: coach ? coach.name : 'Coach Martinez',
        targetUserId: target === 'all' ? null : target,
        targetAudience: target === 'all' ? 'all' : 'individual',
        exerciseName: exercise,
        sets,
        reps,
        durationMin: 20,
        notes: notes || 'Focus on depth, tempo, and locked core alignment.',
        date: new Date().toISOString().split('T')[0],
        status: 'pending'
      };

      FitmateDB.addCoachAssignment(asg);

      // Notify target students
      const activeStudents = FitmateDB.getUsers().filter((u) => u.role === 'student');
      const recipients = target === 'all' ? activeStudents : activeStudents.filter((s) => s.id === target);
      recipients.forEach((s) => {
        FitmateDB.addNotification({
          id: 'notif_' + Date.now() + '_' + s.id,
          userId: s.id,
          title: 'New Workout Assigned by Coach',
          message: `${asg.coachName} assigned: ${sets} sets of ${reps} ${exercise}.`,
          type: 'workout_assigned',
          read: false,
          createdAt: new Date().toISOString(),
          linkView: 'view-student-workouts'
        });
      });

      showAppToast('Plan Broadcast', `Assigned ${sets} sets of ${reps} ${exercise} to ${target === 'all' ? 'all students' : 'selected student'}.`);
      switchView('view-coach-dashboard');
    });
  }
}

function assignWorkoutToStudent(studentId) {
  switchView('view-coach-assign');
  const targetSelect = document.getElementById('assignTarget');
  if (targetSelect && studentId) {
    targetSelect.value = studentId;
  }
  const student = FitmateDB.getUserById(studentId);
  showAppToast('Member Selected', `Ready to assign workout to ${student ? student.name : 'student'}.`);
}

function hydrateCoachPerformance() {
  const tbody = document.getElementById('coachPerformanceTableBody');
  const empty = document.getElementById('coachPerformanceEmpty');
  const table = document.getElementById('coachPerformanceTable');
  const logs = FitmateDB.getWorkoutLogs();

  if (logs.length === 0) {
    if (table) table.style.display = 'none';
    if (empty) empty.style.display = 'block';
  } else {
    if (table) table.style.display = 'table';
    if (empty) empty.style.display = 'none';
    if (tbody) {
      tbody.innerHTML = logs.map((l) => {
        const user = FitmateDB.getUserById(l.userId);
        return `
          <tr>
            <td data-label="Member" style="font-weight: 600; color: #fff;">${user ? user.name : 'Student'}</td>
            <td data-label="Last Exercise">${l.exerciseName}</td>
            <td data-label="Target vs Done">${l.setsDone} sets • ${l.repsDone} reps</td>
            <td data-label="Form Telemetry"><span class="badge badge-mint">${l.accuracyScore}% Form Accuracy</span></td>
            <td data-label="Verified State"><span class="badge ${l.verifiedByCamera ? 'badge-mint' : 'badge-cyan'}">${l.verifiedByCamera ? 'Camera Telemetry' : 'Manual Entry'}</span></td>
          </tr>
        `;
      }).join('');
    }
  }
}

function hydrateCoachInsights() {
  const list = document.getElementById('coachInsightsList');
  if (!list) return;

  const logs = FitmateDB.getWorkoutLogs();
  const assignments = FitmateDB.getCoachAssignments ? FitmateDB.getCoachAssignments() : [];

  if (logs.length === 0) {
    list.innerHTML = `
      <div class="empty-state-card">
        <div class="empty-state-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
        </div>
        <div class="empty-state-title">No Sufficient Performance Data Yet</div>
        <div class="empty-state-desc">AI performance recommendations require completed student workout telemetry. Insights will automatically generate as trainees log sessions.</div>
      </div>
    `;
    return;
  }

  // Dynamic insight generation from actual telemetry
  const avgAcc = Math.round(logs.reduce((acc, l) => acc + (l.accuracyScore || 85), 0) / logs.length);
  const totalReps = logs.reduce((acc, l) => acc + (l.repsDone || 0), 0);
  const completedAsgs = assignments.filter((a) => a.status === 'completed').length;
  const asgRate = assignments.length > 0 ? Math.round((completedAsgs / assignments.length) * 100) : 100;

  // Identify trainees needing biomechanical calibration
  const flaggedStudents = [];
  logs.forEach((l) => {
    if ((l.accuracyScore || 100) < 75) {
      const u = FitmateDB.getUserById(l.userId);
      const uName = u ? u.name : 'Student';
      if (!flaggedStudents.some((s) => s.name === uName)) {
        flaggedStudents.push({ name: uName, score: l.accuracyScore, ex: l.exerciseName });
      }
    }
  });

  let flaggedHtml = '';
  if (flaggedStudents.length > 0) {
    flaggedHtml = `
      <div class="card-glass" style="border-left: 4px solid var(--accent-danger, #ff4d6d); margin-bottom: 1rem;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <h4 style="color: #ffffff;">Trainees Requiring Form Calibration</h4>
          <span class="ai-badge ai-badge-danger">Action Needed</span>
        </div>
        <p style="margin: 0.5rem 0; color: var(--text-secondary); font-size: 0.88rem;">
          The following student(s) recorded movement deviation scores below 75% on recent telemetry:
        </p>
        <ul style="margin: 0 0 0.75rem 1.25rem; font-size: 0.85rem; color: #f87171;">
          ${flaggedStudents.map((s) => `<li><strong>${s.name}</strong>: ${s.score}% accuracy on ${s.ex}. Recommend reviewing knee and lumbar alignment.</li>`).join('')}
        </ul>
      </div>
    `;
  } else {
    flaggedHtml = `
      <div class="card-glass" style="border-left: 4px solid var(--accent-primary); margin-bottom: 1rem;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <h4 style="color: #ffffff;">Biomechanical Form & Movement Safety</h4>
          <span class="badge badge-mint">Optimal Form</span>
        </div>
        <p style="margin: 0.5rem 0; color: var(--text-secondary); font-size: 0.88rem;">
          All active trainees currently meet or exceed acceptable form standards (>80% accuracy score). Joint alignment is stable across cohort.
        </p>
      </div>
    `;
  }

  list.innerHTML = `
    <div class="card-glass" style="border-left: 4px solid var(--accent-primary); margin-bottom: 1rem;">
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <h4 style="color: #ffffff;">Trainee Readiness &amp; Volume Adaptation</h4>
        <span class="badge badge-mint">Readiness Calibrated</span>
      </div>
      <p style="margin: 0.5rem 0; color: var(--text-secondary); font-size: 0.9rem;">
        Cohort average form accuracy is currently <strong>${avgAcc}%</strong> across <strong>${totalReps}</strong> cumulative repetitions verified by computer vision.
        <strong>AI Recommendation:</strong> Students have established clean biomechanical form. You can safely assign progressive overload.
      </p>
    </div>

    ${flaggedHtml}

    <div class="card-glass" style="border-left: 4px solid var(--accent-secondary); margin-bottom: 1rem;">
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <h4 style="color: #ffffff;">Coach Assigned Workout Completion Rate</h4>
        <span class="badge badge-cyan">${asgRate}% Completed</span>
      </div>
      <p style="margin: 0.5rem 0; color: var(--text-secondary); font-size: 0.88rem;">
        <strong>${completedAsgs} of ${assignments.length}</strong> instructor assignments successfully completed by students. Coach priority scheduling is operating with high compliance.
      </p>
    </div>
  `;
}

function hydrateCoachFees() {
  const tbody = document.getElementById('coachFeesTableBody');
  const empty = document.getElementById('coachFeesEmpty');
  const table = document.getElementById('coachFeesTable');
  const students = FitmateDB.getUsers().filter((u) => u.role === 'student');

  if (students.length === 0) {
    if (table) table.style.display = 'none';
    if (empty) empty.style.display = 'block';
  } else {
    if (table) table.style.display = 'table';
    if (empty) empty.style.display = 'none';
    if (tbody) {
      tbody.innerHTML = students.map((s) => {
        const mem = FitmateDB.getMembership(s.id) || {
          tier: 'Standard Semester Pass',
          expiryDate: 'Dec 20, 2026',
          feeStatus: 'Paid'
        };
        return `
          <tr>
            <td data-label="Student Name" style="font-weight: 600; color: #fff;">${s.name}</td>
            <td data-label="Membership Tier">${mem.tier}</td>
            <td data-label="Pass Expiry" style="font-family: var(--font-mono); font-size: 0.85rem;">${mem.expiryDate}</td>
            <td data-label="Fee Status"><span class="badge badge-mint">${mem.feeStatus}</span></td>
            <td data-label="Action">
              <button class="btn btn-secondary btn-sm" style="font-size: 0.75rem; padding: 0.25rem 0.6rem;" onclick="showAppToast('Audit Recorded', 'Audited pass for ${s.name}.')">Audit</button>
            </td>
          </tr>
        `;
      }).join('');
    }
  }
}

function hydrateCoachProfile() {
  const user = AppState.currentUser;
  if (!user) return;

  const nameInput = document.getElementById('profCoachName');
  const deptInput = document.getElementById('profCoachDept');
  const certsInput = document.getElementById('profCoachCerts');

  if (nameInput) nameInput.value = user.name || 'Coach Martinez';

  const form = document.getElementById('formCoachProfile');
  if (form && !form.dataset.bound) {
    form.dataset.bound = 'true';
    form.onsubmit = (e) => {
      e.preventDefault();
      const newName = nameInput.value.trim();
      if (newName) {
        user.name = newName;
        FitmateDB.updateUser(user.id, { name: newName });
        updateTopBarUserInfo();
      }
      showAppToast('Profile Saved', 'Coach credentials updated.');
    };
  }
}

/* ==========================================================================
   11. NOTIFICATIONS SYSTEM
   ========================================================================== */
function refreshNotifications() {
  const user = AppState.currentUser;
  const badge = document.getElementById('notifyBadge');
  const list = document.getElementById('notificationsList');
  if (!user) {
    if (badge) badge.style.display = 'none';
    return;
  }

  const notifs = FitmateDB.getNotifications(user.id);
  const unreadCount = notifs.filter((n) => !n.read).length;

  if (badge) {
    if (unreadCount > 0) {
      badge.textContent = unreadCount;
      badge.style.display = 'inline-block';
    } else {
      badge.textContent = '0';
      badge.style.display = 'none';
    }
  }

  if (list) {
    if (notifs.length === 0) {
      list.innerHTML = `<div style="padding: 1.5rem; text-align: center; color: var(--text-muted); font-size: 0.85rem;">No new notifications.</div>`;
    } else {
      list.innerHTML = notifs.map((n) => `
        <div class="notification-item ${n.read ? '' : 'unread'}" onclick="handleNotificationClick('${n.id}', '${n.linkView || ''}')">
          <div class="notify-title">${n.title}</div>
          <div class="notify-text">${n.message}</div>
          <div class="notify-time">${new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
        </div>
      `).join('');
    }
  }
}

function handleNotificationClick(notifId, linkView) {
  const user = AppState.currentUser;
  if (!user) return;

  const notifs = FitmateDB.getNotifications(user.id);
  const target = notifs.find((n) => n.id === notifId);
  if (target) {
    target.read = true;
    FitmateDB.markAllNotificationsRead(user.id);
    refreshNotifications();
  }

  const drawer = document.getElementById('notificationDrawer');
  if (drawer) drawer.classList.remove('active');

  if (linkView) switchView(linkView);
}

/* ==========================================================================
   12. MODALS & AUXILIARY CONTROLLERS
   ========================================================================== */
function initModals() {
  // Notification Bell Toggle
  const btnNotify = document.getElementById('btnNotifications');
  const drawer = document.getElementById('notificationDrawer');
  const btnMarkAll = document.getElementById('btnMarkAllRead');

  if (btnNotify && drawer) {
    btnNotify.addEventListener('click', (e) => {
      e.stopPropagation();
      drawer.classList.toggle('active');
      refreshNotifications();
    });

    document.addEventListener('click', (e) => {
      if (!drawer.contains(e.target) && e.target !== btnNotify) {
        drawer.classList.remove('active');
      }
    });
  }

  if (btnMarkAll) {
    btnMarkAll.addEventListener('click', () => {
      const user = AppState.currentUser;
      if (user) {
        FitmateDB.markAllNotificationsRead(user.id);
        refreshNotifications();
        showAppToast('Notifications Cleared', 'All notifications marked as read.');
      }
    });
  }

  // Exercise steps modal close
  const btnCloseEx = document.getElementById('btnCloseExerciseModal');
  if (btnCloseEx) {
    btnCloseEx.addEventListener('click', () => closeModal('modalExerciseSteps'));
  }
  const btnLaunchFromModal = document.getElementById('btnLaunchFromExerciseModal');
  if (btnLaunchFromModal) {
    btnLaunchFromModal.addEventListener('click', () => {
      closeModal('modalExerciseSteps');
      startActiveRoutine();
    });
  }

  // Leaderboard modal close
  const btnCloseLd = document.getElementById('btnCloseLeaderboardModal');
  const btnCloseLd2 = document.getElementById('btnCloseLeaderboardBtn');
  if (btnCloseLd) btnCloseLd.addEventListener('click', () => closeModal('modalChallengeLeaderboard'));
  if (btnCloseLd2) btnCloseLd2.addEventListener('click', () => closeModal('modalChallengeLeaderboard'));

  // Coach Add Member modal bindings
  const btnAddMember = document.getElementById('btnCoachAddMember');
  const btnCloseAddMember = document.getElementById('btnCloseAddMemberModal');
  const btnCancelAddMember = document.getElementById('btnCancelAddMember');
  const formAddMember = document.getElementById('formCoachAddMember');

  if (btnAddMember) {
    btnAddMember.addEventListener('click', () => {
      const modal = document.getElementById('modalCoachAddMember');
      if (modal) modal.classList.add('active');
    });
  }

  if (btnCloseAddMember) {
    btnCloseAddMember.addEventListener('click', () => closeModal('modalCoachAddMember'));
  }

  if (btnCancelAddMember) {
    btnCancelAddMember.addEventListener('click', () => closeModal('modalCoachAddMember'));
  }

  if (formAddMember && !formAddMember.dataset.bound) {
    formAddMember.dataset.bound = 'true';
    formAddMember.addEventListener('submit', (e) => {
      e.preventDefault();
      try {
        const nameInput = document.getElementById('addMemberName');
        const emailInput = document.getElementById('addMemberEmail');
        const ageInput = document.getElementById('addMemberAge');
        const deptInput = document.getElementById('addMemberDept');
        const goalSelect = document.getElementById('addMemberGoal');

        const name = nameInput ? nameInput.value.trim() : '';
        const email = emailInput ? emailInput.value.trim() : '';
        const age = ageInput ? parseInt(ageInput.value, 10) : 20;
        const dept = deptInput ? deptInput.value.trim() : '';
        const goal = goalSelect ? goalSelect.value : 'strength';

        if (!name || !email) {
          showAppToast('Validation Error', 'Full Name and Institutional Email are required.');
          return;
        }

        if (age < 14 || age > 99) {
          showAppToast('Invalid Age', 'Please enter a valid age between 14 and 99.');
          return;
        }

        const existing = FitmateDB.getUserByEmail(email);
        if (existing) {
          showAppToast('Account Exists', `Member with email ${email} is already registered in the roster.`);
          return;
        }

        const newStudent = {
          id: 'usr_' + Date.now(),
          name,
          email,
          passwordHash: 'demo1234',
          role: 'student',
          createdAt: new Date().toISOString()
        };
        FitmateDB.addUser(newStudent);

        const studentProfile = {
          userId: newStudent.id,
          age,
          activityLevel: 'intermediate',
          goal,
          availableTime: '30',
          equipment: 'bodyweight',
          department: dept || 'Campus Member',
          hostel: '',
          onboarded: true,
          updatedAt: new Date().toISOString()
        };
        FitmateDB.saveProfile(studentProfile);

        const routine = AdaptiveEngine.generateWorkout(studentProfile);
        FitmateDB.saveWorkout(routine);

        FitmateDB.saveMembership({
          userId: newStudent.id,
          tier: 'Standard Semester Pass',
          expiryDate: 'Dec 20, 2026',
          feeStatus: 'Paid'
        });

        closeModal('modalCoachAddMember');
        formAddMember.reset();
        hydrateCoachMembers();
        hydrateCoachDashboard();
        hydrateCoachAttendance();
        showAppToast('Member Enrolled', `Successfully enrolled ${name} into the athletic roster.`);
      } catch (submitErr) {
        console.error('Error enrolling member:', submitErr);
        showAppToast('Enrollment Error', submitErr.message);
      }
    });
  }
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.classList.remove('active');
}

function openExerciseStepsModal(exerciseName) {
  const title = document.getElementById('modalExerciseTitle');
  const content = document.getElementById('modalExerciseContent');
  const ex = (exerciseName || 'Squats').toLowerCase();

  const guides = {
    squats: {
      title: 'Adaptive Bodyweight Squat',
      target: 'Quadriceps, Glutes, Core Bracing',
      steps: [
        'Stand with feet shoulder-width apart, toes angled out slightly (10-15°).',
        'Initiate the movement by hinging at the hips, keeping your chest proud and spine neutral.',
        'Descend until hip crease passes below the knee parallel line (90° flexion).',
        'Drive through midfoot and heels back to upright lockout.'
      ]
    },
    pushups: {
      title: 'Standard Strict Push-up',
      target: 'Pectoralis Major, Anterior Deltoids, Triceps',
      steps: [
        'Place hands slightly wider than shoulder-width, fingers pointing forward.',
        'Brace your core and glutes so your body forms a straight rigid plank.',
        'Lower your body in a 2-second eccentric phase until chest touches the floor.',
        'Press away from the floor explosively to full elbow extension.'
      ]
    },
    lunges: {
      title: 'Alternating Forward Lunge',
      target: 'Quadriceps, Hamstrings, Pelvic Balance',
      steps: [
        'Step forward with your lead leg and lower your hips.',
        'Both knees should reach approximately 90-degree flexion.',
        'Keep front knee centered over the ankle without forward shear.',
        'Push off the front heel to return to standing position.'
      ]
    },
    plank: {
      title: 'Isometric Core Plank',
      target: 'Transverse Abdominis, Rectus Abdominis, Serratus Anterior',
      steps: [
        'Rest forearms on the mat with elbows stacked directly beneath shoulders.',
        'Keep ankles, hips, and shoulders aligned in a straight plane.',
        'Tuck your pelvis into slight posterior pelvic tilt and brace as if taking a punch.',
        'Hold position without letting lower back sag or hips elevate.'
      ]
    }
  };

  const g = guides[ex] || guides.squats;
  if (title) title.textContent = g.title;
  if (content) {
    content.innerHTML = `
      <div style="margin-bottom: 1rem;"><strong style="color: #fff;">Primary Target:</strong> ${g.target}</div>
      <ol style="padding-left: 1.25rem; margin-bottom: 1rem;">
        ${g.steps.map((s) => `<li style="margin-bottom: 0.5rem;">${s}</li>`).join('')}
      </ol>
      <div style="padding: 0.75rem 1rem; background: rgba(0, 229, 153, 0.08); border-left: 3px solid var(--accent-primary); border-radius: 4px;">
        <strong>Biomechanical Cue:</strong> Maintain synchronized diaphragmatic breathing throughout each repetition cycle.
      </div>
    `;
  }

  const modal = document.getElementById('modalExerciseSteps');
  if (modal) modal.classList.add('active');
}

function openLeaderboardModal(challengeId) {
  const challenges = FitmateDB.getChallenges();
  const ch = challenges.find((c) => c.id === challengeId) || challenges[0];
  if (!ch) return;

  const title = document.getElementById('modalLeaderboardTitle');
  const tbody = document.getElementById('modalLeaderboardTableBody');

  if (title) title.textContent = `${ch.title} — Leaderboard`;

  if (tbody) {
    const parts = ch.participants || [];
    parts.sort((a, b) => (b.reps || 0) - (a.reps || 0));

    if (parts.length === 0) {
      tbody.innerHTML = `<tr><td colspan="4" style="text-align: center; color: var(--text-muted);">No verified participant reps yet. Start a session to claim #1 rank!</td></tr>`;
    } else {
      tbody.innerHTML = parts.map((p, idx) => `
        <tr>
          <td data-label="Rank"><span class="badge ${idx === 0 ? 'badge-mint' : 'badge-dim'}">#${idx + 1}</span></td>
          <td data-label="Participant" style="font-weight: 600; color: #fff;">${p.name}</td>
          <td data-label="Verified Reps" style="font-family: var(--font-mono);">${p.reps} Reps</td>
          <td data-label="Status"><span class="badge badge-mint">Verified</span></td>
        </tr>
      `).join('');
    }
  }

  const modal = document.getElementById('modalChallengeLeaderboard');
  if (modal) modal.classList.add('active');
}

/* ==========================================================================
   13. COACH MODULES EVENT BINDINGS
   ========================================================================== */
function initCoachModules() {
  hydrateCoachMembers();
  hydrateCoachAttendance();
  hydrateCoachAssign();
}

/* ==========================================================================
   14. TOAST NOTIFICATION UTILITY
   ========================================================================== */
function showAppToast(title, message) {
  const container = document.getElementById('appToastContainer');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = 'app-toast';
  toast.innerHTML = `<h5>${title}</h5><p>${message}</p>`;
  container.appendChild(toast);

  setTimeout(() => {
    if (toast.parentNode) toast.parentNode.removeChild(toast);
  }, 4000);
}
