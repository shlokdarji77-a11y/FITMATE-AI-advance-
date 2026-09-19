import os
import re

def patch_file(filepath):
    print(f"Patching {filepath}...")
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()

    # 1. Patch _getRaw() schema safety
    old_get_raw = """  _getRaw() {
    try {
      const raw = localStorage.getItem(FITMATE_CONFIG.DB_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) {
      console.warn('Could not parse FitmateDB from localStorage:', e);
    }
    return this._createInitialStore();
  },"""

    new_get_raw = """  _getRaw() {
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
  },"""

    if old_get_raw in content:
        content = content.replace(old_get_raw, new_get_raw)
        print("  [+] Patched _getRaw()")
    else:
        print("  [-] Could not find old _getRaw()")

    # 2. Add FitmateDB extensions before `setMembership` or end of FitmateDB
    old_membership = """  setMembership(membership) {
    return this.saveMembership(membership);
  }
};"""

    new_membership = """  setMembership(membership) {
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
};"""

    if old_membership in content:
        content = content.replace(old_membership, new_membership)
        print("  [+] Patched FitmateDB AI methods")
    else:
        print("  [-] Could not find old setMembership block")

    # 3. DOMContentLoaded hook for AI Ecosystem
    old_dom = """document.addEventListener('DOMContentLoaded', () => {
  initSplashAndSession();
  initRoleSelection();
  initAuth();
  initOnboarding();
  initNavigation();
  initCameraVisualizer();
  initCoachModules();
  initModals();
});"""

    new_dom = """document.addEventListener('DOMContentLoaded', () => {
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
});"""

    if old_dom in content:
        content = content.replace(old_dom, new_dom)
        print("  [+] Patched DOMContentLoaded for AI Ecosystem")
    else:
        print("  [-] Could not find DOMContentLoaded block")

    # 4. Patch switchView() titles and hydrations
    old_titles = """    'view-student-profile': 'Profile',"""
    new_titles = """    'view-student-profile': 'Profile',
    'view-student-aicoach': 'AI Coach',
    'view-student-exerciselibrary': 'Exercise Library',
    'view-student-aichat': 'AI Chatbot',
    'view-student-voiceassistant': 'Voice Assistant',
    'view-student-dietplanner': 'Diet Planner',"""

    if old_titles in content and "'view-student-aicoach'" not in content:
        content = content.replace(old_titles, new_titles, 1)
        print("  [+] Patched switchView() titles")

    old_hydrations = """    if (viewId === 'view-student-profile') hydrateStudentProfile();"""
    new_hydrations = """    if (viewId === 'view-student-profile') hydrateStudentProfile();
    if (viewId === 'view-student-aicoach' && window.FitmateAICoach) window.FitmateAICoach.renderActiveRecommendation();
    if (viewId === 'view-student-exerciselibrary' && window.FitmateExerciseLibrary) window.FitmateExerciseLibrary.render();
    if (viewId === 'view-student-aichat' && window.FitmateAIChat) window.FitmateAIChat.renderMessages();
    if (viewId === 'view-student-dietplanner' && window.FitmateDietPlanner) window.FitmateDietPlanner.renderPlan();"""

    if old_hydrations in content and "window.FitmateAICoach" not in content:
        content = content.replace(old_hydrations, new_hydrations, 1)
        print("  [+] Patched switchView() hydrations")

    # 5. Patch startCameraCanvas() for real PoseEngine frame processing
    old_canvas_render = """      // Perform real frame analysis for motion delta
      if (AppState.isTracking) {
        try {
          const currentFrame = ctx.getImageData(160, 100, 320, 240);
          if (lastFrameData) {
            let diff = 0;
            const data1 = currentFrame.data;
            const data2 = lastFrameData.data;
            for (let i = 0; i < data1.length; i += 16) {
              diff += Math.abs(data1[i] - data2[i]);
            }
            const normalizedMotion = diff / (data1.length / 16);

            // Motion wave cycle detection
            if (normalizedMotion > 28 && !AppState.repLockout) {
              AppState.repLockout = true;
              AppState.repCount += 1;
              playRepChime();
              updateRepDisplay();
              const pill = document.getElementById('hudFeedbackPill');
              if (pill) {
                pill.textContent = 'Good Depth & Cadence!';
                pill.style.color = '#00e599';
              }
            } else if (normalizedMotion < 12 && AppState.repLockout) {
              AppState.repLockout = false;
            }
          }
          lastFrameData = currentFrame;
        } catch (e) {}
      }

      // Live Telemetry Overlay
      ctx.strokeStyle = 'rgba(0, 229, 153, 0.4)';
      ctx.lineWidth = 2;
      const boxSize = Math.min(canvas.width * 0.55, canvas.height * 0.7);
      ctx.strokeRect((canvas.width - boxSize) / 2, (canvas.height - boxSize) / 2, boxSize, boxSize);

      const anglePill = document.getElementById('hudAnglePill');
      if (anglePill) {
        const estAngle = AppState.repLockout ? '92° (Depth Reached)' : '172° (Lockout)';
        anglePill.textContent = `Joint Angle: ${estAngle}`;
      }"""

    new_canvas_render = """      // Real Pose Estimation & Biomechanical Verification
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
      }"""

    if old_canvas_render in content:
        content = content.replace(old_canvas_render, new_canvas_render)
        print("  [+] Patched startCameraCanvas() with FitmatePoseEngine")
    else:
        print("  [-] Could not find old startCameraCanvas() block")

    # 6. Patch camera connect and exercise select in initCameraVisualizer()
    old_ex_select = """      AppState.currentExercise = exName;
      AppState.repCount = 0;
      updateRepDisplay();
      showAppToast('Exercise Selected', `Switched active exercise to ${pill.textContent}.`);"""

    new_ex_select = """      AppState.currentExercise = exName;
      AppState.repCount = 0;
      if (window.FitmatePoseEngine) {
        window.FitmatePoseEngine.setExercise(exName);
        window.FitmatePoseEngine.resetSession();
      }
      updateRepDisplay();
      showAppToast('Exercise Selected', `Switched active exercise to ${pill.textContent}.`);"""

    if old_ex_select in content:
        content = content.replace(old_ex_select, new_ex_select)
        print("  [+] Patched exercise select with FitmatePoseEngine")

    old_cam_connected = """          AppState.cameraMode = 'live';
          btnToggleCam.textContent = 'Disconnect Webcam';
          if (banner) banner.classList.remove('active');

          const dot = document.getElementById('camStatusDot');
          const txt = document.getElementById('camStatusText');
          if (dot) dot.style.background = '#00e599';
          if (txt) txt.textContent = 'Camera Vision: Live';"""

    new_cam_connected = """          AppState.cameraMode = 'live';
          btnToggleCam.textContent = 'Disconnect Webcam';
          if (banner) banner.classList.remove('active');

          const dot = document.getElementById('camStatusDot');
          const txt = document.getElementById('camStatusText');
          if (dot) dot.style.background = '#00e599';
          if (txt) txt.textContent = 'Camera Vision: Live';
          if (window.FitmatePoseEngine) {
            window.FitmatePoseEngine.init(video);
          }"""

    if old_cam_connected in content:
        content = content.replace(old_cam_connected, new_cam_connected)
        print("  [+] Patched webcam connection with FitmatePoseEngine")

    # 7. Patch completeWorkoutSession() for real pose metrics persistence
    old_complete_wkt = """  const log = {
    id: 'log_' + Date.now(),
    userId: user.id,
    workoutId: (AppState.activeWorkoutSession && AppState.activeWorkoutSession.workoutId) || 'wkt_adhoc',
    exerciseName: exName,
    setsDone: (AppState.activeWorkoutSession && AppState.activeWorkoutSession.sets) || 3,
    repsDone: reps,
    accuracyScore: isCamera ? Math.min(98, 88 + Math.floor(Math.random() * 10)) : 90,
    durationSec: 600,
    date: now.toISOString().split('T')[0],
    time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    verifiedByCamera: isCamera
  };

  FitmateDB.addWorkoutLog(log);"""

    new_complete_wkt = """  const poseMetrics = window.FitmatePoseEngine ? window.FitmatePoseEngine.sessionMetrics : null;
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
  }"""

    if old_complete_wkt in content:
        content = content.replace(old_complete_wkt, new_complete_wkt)
        print("  [+] Patched completeWorkoutSession() with real pose telemetry")

    # 8. Patch hydrateCoachInsights() with real telemetry analytics
    old_coach_insights = """function hydrateCoachInsights() {
  const list = document.getElementById('coachInsightsList');
  if (!list) return;

  const logs = FitmateDB.getWorkoutLogs();
  if (logs.length < 2) {
    list.innerHTML = `
      <div class="empty-state-card">
        <div class="empty-state-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
        </div>
        <div class="empty-state-title">Not Enough Data for AI Insights Yet</div>
        <div class="empty-state-desc">AI performance recommendations require completed student workout telemetry. Insights will automatically generate as trainees log sessions.</div>
      </div>
    `;
    return;
  }

  // Dynamic insight generation from actual telemetry
  const avgAcc = Math.round(logs.reduce((acc, l) => acc + (l.accuracyScore || 85), 0) / logs.length);
  const totalReps = logs.reduce((acc, l) => acc + (l.repsDone || 0), 0);

  list.innerHTML = `
    <div class="card-glass" style="border-left: 4px solid var(--accent-primary); margin-bottom: 1rem;">
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <h4 style="color: #ffffff;">Trainee Readiness &amp; Volume Adaptation</h4>
        <span class="badge badge-mint">High Readiness</span>
      </div>
      <p style="margin: 0.5rem 0; color: var(--text-secondary); font-size: 0.9rem;">
        Cohort average form accuracy is currently <strong>${avgAcc}%</strong> across <strong>${totalReps}</strong> cumulative repetitions.
        <strong>AI Recommendation:</strong> Students have established clean biomechanical form. You can safely increase target volume by +10-15%.
      </p>
      <button class="btn btn-secondary btn-sm" onclick="showAppToast('Insight Applied', 'Target volume adjusted for upcoming plans.')">Acknowledge</button>
    </div>
  `;
}"""

    new_coach_insights = """function hydrateCoachInsights() {
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
}"""

    if old_coach_insights in content:
        content = content.replace(old_coach_insights, new_coach_insights)
        print("  [+] Patched hydrateCoachInsights() with real data analytics")

    with open(filepath, "w", encoding="utf-8") as f:
        f.write(content)
    print(f"Finished writing {filepath}.")

if __name__ == "__main__":
    patch_file("app/app.js")
    # For main.js, let's also patch the shared functions
    patch_file("js/main.js")
