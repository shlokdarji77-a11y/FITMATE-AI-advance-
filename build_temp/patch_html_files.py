import os

def get_new_views_html():
    return """
        <!-- 3. Adaptive AI Coach -->
        <section id="view-student-aicoach" class="content-view">
          <div class="view-header">
            <div>
              <h2>Adaptive AI Coach</h2>
              <p>Time-aware, goal-optimized training calibrated to your actual history and coach assignments.</p>
            </div>
          </div>

          <div class="card-glass" style="margin-bottom: 1.5rem;">
            <h4 style="color: #ffffff; margin-bottom: 0.5rem;">How much time do you have today?</h4>
            <p style="color: var(--text-secondary); font-size: 0.85rem; margin-top: 0;">Select your available workout duration. The AI Coach prioritizes high-value compound exercises and adapts to your previous session accuracy.</p>
            
            <div class="time-selector-bar">
              <button class="time-pill-btn" data-coach-time="5">5 min</button>
              <button class="time-pill-btn" data-coach-time="10">10 min</button>
              <button class="time-pill-btn" data-coach-time="15">15 min</button>
              <button class="time-pill-btn" data-coach-time="20">20 min</button>
              <button class="time-pill-btn active" data-coach-time="30">30 min</button>
              <button class="time-pill-btn" data-coach-time="45">45 min</button>
              <button class="time-pill-btn" data-coach-time="60">60+ min</button>
            </div>
          </div>

          <div id="coachRecommendationContainer">
            <!-- Dynamically rendered by FitmateAICoach -->
          </div>
        </section>

        <!-- 5. 1500+ Exercise Library -->
        <section id="view-student-exerciselibrary" class="content-view">
          <div class="view-header">
            <div>
              <h2>1,500+ Exercise Library</h2>
              <p>Scientifically verified biomechanical movements across all categories, equipment, and muscle groups.</p>
            </div>
            <div id="libResultsCount" style="color: var(--accent-primary); font-size: 0.85rem; font-weight: 600;">
              Showing 1550 exercises
            </div>
          </div>

          <div class="card-glass" style="margin-bottom: 1.5rem; padding: 1.25rem;">
            <div class="library-search-container">
              <input type="text" id="libSearchInput" class="library-search-input" placeholder="Search by exercise name, muscle, or equipment (e.g. Squat, Chest, Barbell)..." />
              <select id="libEquipFilter" style="padding: 0.75rem 1rem; border-radius: 8px; background: #0c1119; color: #ffffff; border: 1px solid var(--border-medium);">
                <option value="all">All Equipment</option>
                <option value="Bodyweight">Bodyweight</option>
                <option value="Barbell">Barbell</option>
                <option value="Dumbbell">Dumbbell</option>
                <option value="Kettlebell">Kettlebell</option>
                <option value="Cable">Cable</option>
                <option value="Machine">Machine</option>
                <option value="Resistance Band">Resistance Band</option>
              </select>
              <select id="libDiffFilter" style="padding: 0.75rem 1rem; border-radius: 8px; background: #0c1119; color: #ffffff; border: 1px solid var(--border-medium);">
                <option value="all">All Difficulties</option>
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>

            <div class="library-filter-row">
              <button class="filter-chip active" data-lib-filter="all">All Categories</button>
              <button class="filter-chip" data-lib-filter="camera">📷 Camera Verified</button>
              <button class="filter-chip" data-lib-filter="favorites">★ Bookmarked Favorites</button>
              <button class="filter-chip" data-lib-filter="Chest">Chest</button>
              <button class="filter-chip" data-lib-filter="Back">Back &amp; Lats</button>
              <button class="filter-chip" data-lib-filter="Shoulders">Shoulders</button>
              <button class="filter-chip" data-lib-filter="Legs">Legs &amp; Glutes</button>
              <button class="filter-chip" data-lib-filter="Arms">Arms</button>
              <button class="filter-chip" data-lib-filter="Core">Core &amp; Abs</button>
              <button class="filter-chip" data-lib-filter="Full Body">Full Body / Cardio</button>
              <button class="filter-chip" data-lib-filter="Mobility">Mobility &amp; Warm-up</button>
              <button class="filter-chip" data-lib-filter="bodyweight">Bodyweight Only</button>
            </div>
          </div>

          <div class="exercise-grid" id="exerciseLibraryGrid">
            <!-- Dynamically rendered -->
          </div>

          <div style="margin-top: 2rem; text-align: center;">
            <button class="btn btn-secondary" id="btnLibLoadMore" style="padding: 0.75rem 2rem;">Load More Exercises</button>
          </div>
        </section>

        <!-- 6. AI Chatbot Assistant -->
        <section id="view-student-aichat" class="content-view">
          <div class="view-header">
            <div>
              <h2>AI Fitness Assistant Chat</h2>
              <p>Ask anything about customized workouts, technique cues, nutrition, recovery, or fitness plateaus.</p>
            </div>
          </div>

          <div class="chat-container">
            <div class="chat-messages-box" id="chatMessagesBox">
              <!-- Chat history rendered dynamically -->
            </div>

            <div class="chat-chips-bar">
              <button class="chat-prompt-chip" data-chat-prompt="What workout should I do today?">What workout should I do today?</button>
              <button class="chat-prompt-chip" data-chat-prompt="I only have 20 minutes.">I only have 20 minutes</button>
              <button class="chat-prompt-chip" data-chat-prompt="My knees hurt during squats, what should I check?">My knees hurt during squats</button>
              <button class="chat-prompt-chip" data-chat-prompt="How can I improve my push-ups?">How to improve push-ups?</button>
              <button class="chat-prompt-chip" data-chat-prompt="What should I eat after my workout?">Post-workout nutrition</button>
              <button class="chat-prompt-chip" data-chat-prompt="Why am I not progressing?">Why am I not progressing?</button>
              <button class="chat-prompt-chip" data-chat-prompt="I missed my workout yesterday.">I missed my workout yesterday</button>
            </div>

            <form class="chat-input-bar" id="chatForm">
              <input type="text" id="chatInput" class="chat-input" placeholder="Type your fitness question or request a workout..." autocomplete="off" />
              <button type="submit" class="btn btn-primary" id="btnSendChat">Send</button>
            </form>
          </div>
        </section>

        <!-- 7. AI Voice Assistant -->
        <section id="view-student-voiceassistant" class="content-view">
          <div class="view-header">
            <div>
              <h2>AI Voice Coach &amp; Assistant</h2>
              <p>Hands-free voice recognition and spoken responses for workout guidance and form coaching.</p>
            </div>
          </div>

          <div class="voice-assistant-card">
            <div class="voice-orb-container">
              <div class="voice-orb" id="voiceOrb" title="Click to Speak">
                <svg viewBox="0 0 24 24"><path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.91-3c-.49 0-.9.36-.98.85C16.52 14.2 14.47 16 12 16s-4.52-1.8-4.93-4.15c-.08-.49-.49-.85-.98-.85-.61 0-1.09.54-1 1.14.49 3 2.89 5.35 5.91 5.78V20c0 .55.45 1 1 1s1-.45 1-1v-2.08c3.02-.43 5.42-2.78 5.91-5.78.1-.6-.39-1.14-1-1.14z"/></svg>
              </div>
            </div>

            <div class="voice-transcript-card">
              <p class="voice-transcript-text" id="voiceTranscript">"Tap the microphone orb and say: 'Give me a 20 minute workout' or 'Start squats'"</p>
              <span class="voice-status-sub" id="voiceStatusText">Voice Assistant: Ready</span>
            </div>

            <div style="display: flex; gap: 0.75rem; flex-wrap: wrap; justify-content: center; max-width: 600px;">
              <button class="btn btn-secondary btn-sm" onclick="FitmateVoiceAssistant.handleVoiceCommand('Give me a 20 minute workout')">"Give me a 20 minute workout"</button>
              <button class="btn btn-secondary btn-sm" onclick="FitmateVoiceAssistant.handleVoiceCommand('Start squats')">"Start squats"</button>
              <button class="btn btn-secondary btn-sm" onclick="FitmateVoiceAssistant.handleVoiceCommand('How is my progress?')">"How is my progress?"</button>
              <button class="btn btn-secondary btn-sm" onclick="FitmateVoiceAssistant.handleVoiceCommand('What is my diet plan?')">"What is my diet plan?"</button>
            </div>

            <div style="margin-top: 1.5rem;">
              <button class="btn btn-primary" id="btnStartVoiceWorkout">Start Voice-Guided Workout</button>
            </div>
          </div>
        </section>

        <!-- 8. AI Diet Planner -->
        <section id="view-student-dietplanner" class="content-view">
          <div class="view-header">
            <div>
              <h2>AI Nutrition &amp; Diet Planner</h2>
              <p>Goal-calibrated, macro-balanced daily meal schedules with complete Vegetarian and Non-Vegetarian options.</p>
            </div>
            <button class="btn btn-secondary btn-sm" id="btnRegenerateDiet">Regenerate Meal Plan</button>
          </div>

          <div class="diet-type-toggle-container">
            <button class="diet-toggle-btn active veg" id="btnDietVeg">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9v-2h2v2zm0-4H9V7h2v5zm4 4h-2v-6h2v6zm0-8h-2V7h2v1z"/></svg>
              Vegetarian Diet Plan
            </button>
            <button class="diet-toggle-btn" id="btnDietNonVeg">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M18.06 22.99h1.66c.84 0 1.53-.64 1.63-1.48L23 5.05h-5V1h-1.97v4.05h-4.97l.3 2.34c1.71.47 3.31 1.32 4.27 2.26 1.44 1.42 2.43 2.89 2.43 5.29v8.05zM3.22 3.02L1.8 4.44l3.75 3.75C5.2 8.64 5 9.27 5 10c0 2.4.99 3.87 2.43 5.29.96.94 2.56 1.79 4.27 2.26l.3 2.34H7.03v2.09h1.66c.84 0 1.53-.64 1.63-1.48L11.5 5.05H6.85l-3.63-2.03z"/></svg>
              Non-Vegetarian Diet Plan
            </button>
          </div>

          <div class="macro-breakdown-grid">
            <div class="macro-card">
              <div class="macro-card-title">Daily Energy</div>
              <div class="macro-card-value mint" id="macroCaloriesVal">2,450 kcal</div>
            </div>
            <div class="macro-card">
              <div class="macro-card-title">Target Protein</div>
              <div class="macro-card-value" id="macroProteinVal" style="color: #38bdf8;">145g</div>
            </div>
            <div class="macro-card">
              <div class="macro-card-title">Carbohydrates</div>
              <div class="macro-card-value" id="macroCarbsVal" style="color: #fbbf24;">285g</div>
            </div>
            <div class="macro-card">
              <div class="macro-card-title">Healthy Fats</div>
              <div class="macro-card-value" id="macroFatVal" style="color: #f472b6;">65g</div>
            </div>
          </div>

          <div class="chat-disclaimer" style="margin-bottom: 1.5rem; font-size: 0.8rem; padding: 0.75rem 1rem;">
            <strong>Nutritional Guidance Notice:</strong> This meal plan provides general athletic conditioning nutrition for healthy active adults. It is not intended as medical nutrition therapy. Consult a clinical dietitian or physician for specific medical conditions or individual metabolic restrictions.
          </div>

          <div class="meal-timeline" id="dietPlanTimeline">
            <!-- Dynamically populated -->
          </div>
        </section>
"""

def patch_html(filepath, is_standalone=True):
    print(f"Patching {filepath}...")
    with open(filepath, "r", encoding="utf-8") as f:
        html = f.read()

    css_path = "ai-ecosystem.css?v=2.2.0" if is_standalone else "css/ai-ecosystem.css?v=2.2.0"
    css_tag = f'  <link rel="stylesheet" href="{css_path}">\n'

    # 1. Insert CSS in <head>
    if css_path not in html:
        if '</head>' in html:
            html = html.replace('</head>', f'{css_tag}</head>', 1)
            print("  [+] Added ai-ecosystem.css link in <head>")

    # 2. Update Student Navigation Menu
    old_nav_student = """        <!-- Student Nav Menu -->
        <nav class="sidebar-nav" id="navStudent">
          <button class="nav-item active" data-view="view-student-dashboard">
            <svg viewBox="0 0 24 24"><path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/></svg>
            <span>Dashboard</span>
          </button>
          <button class="nav-item" data-view="view-student-workouts">
            <svg viewBox="0 0 24 24"><path d="M20.57 14.86L22 13.43 20.57 12 17 15.57 8.43 7 12 3.43 10.57 2 9.14 3.43 7.71 2 5.57 4.14 4.14 2.71 2.71 4.14l1.43 1.43L2 7.71l1.43 1.43L2 10.57 3.43 12 7 8.43 15.57 17 12 20.57 13.43 22l1.43-1.43L16.29 22l2.14-2.14 1.43 1.43 1.43-1.43-1.43-1.43L22 16.29z"/></svg>
            <span>Workouts</span>
          </button>
          <button class="nav-item" data-view="view-student-aitrainer">
            <svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>
            <span>AI Trainer</span>
          </button>
          <button class="nav-item" data-view="view-student-progress">
            <svg viewBox="0 0 24 24"><path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z"/></svg>
            <span>Progress</span>
          </button>
          <button class="nav-item" data-view="view-student-challenges">
            <svg viewBox="0 0 24 24"><path d="M19 5h-2V3H7v2H5c-1.1 0-2 .9-2 2v1c0 2.55 1.92 4.63 4.39 4.94.63 1.5 1.98 2.63 3.61 2.96V19H7v2h10v-2h-4v-3.1c1.63-.33 2.98-1.46 3.61-2.96C19.08 12.63 21 10.55 21 8V7c0-1.1-.9-2-2-2z"/></svg>
            <span>Challenges</span>
          </button>
          <button class="nav-item" data-view="view-student-gym">
            <svg viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
            <span>Campus Gym</span>
          </button>
          <button class="nav-item" data-view="view-student-profile">
            <svg viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
            <span>Profile</span>
          </button>
        </nav>"""

    new_nav_student = """        <!-- Student Nav Menu -->
        <nav class="sidebar-nav" id="navStudent">
          <button class="nav-item active" data-view="view-student-dashboard">
            <svg viewBox="0 0 24 24"><path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/></svg>
            <span>Dashboard</span>
          </button>
          <button class="nav-item" data-view="view-student-workouts">
            <svg viewBox="0 0 24 24"><path d="M20.57 14.86L22 13.43 20.57 12 17 15.57 8.43 7 12 3.43 10.57 2 9.14 3.43 7.71 2 5.57 4.14 4.14 2.71 2.71 4.14l1.43 1.43L2 7.71l1.43 1.43L2 10.57 3.43 12 7 8.43 15.57 17 12 20.57 13.43 22l1.43-1.43L16.29 22l2.14-2.14 1.43 1.43 1.43-1.43-1.43-1.43L22 16.29z"/></svg>
            <span>Workouts</span>
          </button>
          <button class="nav-item" data-view="view-student-aicoach">
            <svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>
            <span>AI Coach</span>
          </button>
          <button class="nav-item" data-view="view-student-aitrainer">
            <svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>
            <span>AI Trainer</span>
          </button>
          <button class="nav-item" data-view="view-student-exerciselibrary">
            <svg viewBox="0 0 24 24"><path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H8V4h12v12z"/></svg>
            <span>Exercise Library</span>
          </button>
          <button class="nav-item" data-view="view-student-aichat">
            <svg viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 9h12v2H6V9zm8 5H6v-2h8v2zm4-6H6V6h12v2z"/></svg>
            <span>AI Chat</span>
          </button>
          <button class="nav-item" data-view="view-student-voiceassistant">
            <svg viewBox="0 0 24 24"><path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.91-3c-.49 0-.9.36-.98.85C16.52 14.2 14.47 16 12 16s-4.52-1.8-4.93-4.15c-.08-.49-.49-.85-.98-.85-.61 0-1.09.54-1 1.14.49 3 2.89 5.35 5.91 5.78V20c0 .55.45 1 1 1s1-.45 1-1v-2.08c3.02-.43 5.42-2.78 5.91-5.78.1-.6-.39-1.14-1-1.14z"/></svg>
            <span>Voice Assistant</span>
          </button>
          <button class="nav-item" data-view="view-student-dietplanner">
            <svg viewBox="0 0 24 24"><path d="M11 9H9V2H7v7H5V2H3v7c0 2.12 1.66 3.84 3.75 3.97V22h2.5v-9.03C11.34 12.84 13 11.12 13 9V2h-2v7zm5-3v8h2.5v8H21V2c-2.76 0-5 2.24-5 4z"/></svg>
            <span>Diet Planner</span>
          </button>
          <button class="nav-item" data-view="view-student-progress">
            <svg viewBox="0 0 24 24"><path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z"/></svg>
            <span>Progress</span>
          </button>
          <button class="nav-item" data-view="view-student-challenges">
            <svg viewBox="0 0 24 24"><path d="M19 5h-2V3H7v2H5c-1.1 0-2 .9-2 2v1c0 2.55 1.92 4.63 4.39 4.94.63 1.5 1.98 2.63 3.61 2.96V19H7v2h10v-2h-4v-3.1c1.63-.33 2.98-1.46 3.61-2.96C19.08 12.63 21 10.55 21 8V7c0-1.1-.9-2-2-2z"/></svg>
            <span>Challenges</span>
          </button>
          <button class="nav-item" data-view="view-student-gym">
            <svg viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
            <span>Campus Gym</span>
          </button>
          <button class="nav-item" data-view="view-student-profile">
            <svg viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
            <span>Profile</span>
          </button>
        </nav>"""

    if old_nav_student in html:
        html = html.replace(old_nav_student, new_nav_student)
        print("  [+] Patched navStudent with all 13 sections")
    else:
        print("  [-] Could not find old navStudent")

    # 3. Update Mobile Bottom Navigation bar
    old_mob_tabs = """        <button class="mobile-nav-item" data-view="view-student-progress" id="mobTabStudentProgress">
          <svg viewBox="0 0 24 24"><path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z"/></svg>
          <span>Progress</span>
        </button>"""

    new_mob_tabs = """        <button class="mobile-nav-item" data-view="view-student-aicoach" id="mobTabStudentCoach">
          <svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>
          <span>AI Coach</span>
        </button>"""

    if old_mob_tabs in html:
        html = html.replace(old_mob_tabs, new_mob_tabs)
        print("  [+] Patched mobile bottom tabs to include AI Coach")

    # 4. Update Mobile More Sheet
    old_sheet = """        <!-- Student More Menu Items -->
        <div class="mobile-sheet-content" id="moreSheetStudent">
          <button class="mobile-sheet-btn" data-view="view-student-challenges">
            <svg viewBox="0 0 24 24"><path d="M19 5h-2V3H7v2H5c-1.1 0-2 .9-2 2v1c0 2.55 1.92 4.63 4.39 4.94.63 1.5 1.98 2.63 3.61 2.96V19H7v2h10v-2h-4v-3.1c1.63-.33 2.98-1.46 3.61-2.96C19.08 12.63 21 10.55 21 8V7c0-1.1-.9-2-2-2z"/></svg>
            <div class="mobile-sheet-btn-text">
              <strong>Campus Challenges</strong>
              <span>Inter-hostel rallies &amp; rankings</span>
            </div>
          </button>"""

    new_sheet = """        <!-- Student More Menu Items -->
        <div class="mobile-sheet-content" id="moreSheetStudent">
          <button class="mobile-sheet-btn" data-view="view-student-exerciselibrary">
            <svg viewBox="0 0 24 24"><path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H8V4h12v12z"/></svg>
            <div class="mobile-sheet-btn-text">
              <strong>1500+ Exercise Library</strong>
              <span>Biomechanical movements &amp; filters</span>
            </div>
          </button>
          <button class="mobile-sheet-btn" data-view="view-student-aichat">
            <svg viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 9h12v2H6V9zm8 5H6v-2h8v2zm4-6H6V6h12v2z"/></svg>
            <div class="mobile-sheet-btn-text">
              <strong>AI Chatbot Assistant</strong>
              <span>Ask fitness &amp; technique questions</span>
            </div>
          </button>
          <button class="mobile-sheet-btn" data-view="view-student-voiceassistant">
            <svg viewBox="0 0 24 24"><path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.91-3c-.49 0-.9.36-.98.85C16.52 14.2 14.47 16 12 16s-4.52-1.8-4.93-4.15c-.08-.49-.49-.85-.98-.85-.61 0-1.09.54-1 1.14.49 3 2.89 5.35 5.91 5.78V20c0 .55.45 1 1 1s1-.45 1-1v-2.08c3.02-.43 5.42-2.78 5.91-5.78.1-.6-.39-1.14-1-1.14z"/></svg>
            <div class="mobile-sheet-btn-text">
              <strong>Voice Coach &amp; Assistant</strong>
              <span>Hands-free voice recognition &amp; audio</span>
            </div>
          </button>
          <button class="mobile-sheet-btn" data-view="view-student-dietplanner">
            <svg viewBox="0 0 24 24"><path d="M11 9H9V2H7v7H5V2H3v7c0 2.12 1.66 3.84 3.75 3.97V22h2.5v-9.03C11.34 12.84 13 11.12 13 9V2h-2v7zm5-3v8h2.5v8H21V2c-2.76 0-5 2.24-5 4z"/></svg>
            <div class="mobile-sheet-btn-text">
              <strong>AI Diet &amp; Nutrition</strong>
              <span>Vegetarian &amp; Non-Veg macro plans</span>
            </div>
          </button>
          <button class="mobile-sheet-btn" data-view="view-student-progress">
            <svg viewBox="0 0 24 24"><path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z"/></svg>
            <div class="mobile-sheet-btn-text">
              <strong>Performance History</strong>
              <span>Volume, consistency &amp; form telemetry</span>
            </div>
          </button>
          <button class="mobile-sheet-btn" data-view="view-student-challenges">
            <svg viewBox="0 0 24 24"><path d="M19 5h-2V3H7v2H5c-1.1 0-2 .9-2 2v1c0 2.55 1.92 4.63 4.39 4.94.63 1.5 1.98 2.63 3.61 2.96V19H7v2h10v-2h-4v-3.1c1.63-.33 2.98-1.46 3.61-2.96C19.08 12.63 21 10.55 21 8V7c0-1.1-.9-2-2-2z"/></svg>
            <div class="mobile-sheet-btn-text">
              <strong>Campus Challenges</strong>
              <span>Inter-hostel rallies &amp; rankings</span>
            </div>
          </button>"""

    if old_sheet in html:
        html = html.replace(old_sheet, new_sheet)
        print("  [+] Patched mobile more sheet with new AI items")

    # 5. Upgrade view-student-aitrainer with Side Tips Panel
    old_viewport = """          <div class="camera-trainer-layout">
            <!-- Video & Telemetry Canvas -->
            <div class="camera-viewport">
              <video id="webcamVideo" autoplay playsinline muted style="display: none;"></video>
              <canvas id="cameraCanvas" width="640" height="420"></canvas>

              <div class="camera-hud-overlay">
                <div class="hud-tag">
                  <span class="status-dot" id="camStatusDot"></span>
                  <span id="camStatusText">Camera: Ready</span>
                </div>
                <div class="hud-angle-pill" id="hudAnglePill">Flexion: 180°</div>
              </div>

              <div class="camera-hud-bottom">
                <div class="hud-rep-box">
                  <div class="hud-rep-title">COMPLETED REPS</div>
                  <div class="hud-rep-num" id="hudRepCount">0</div>
                </div>
                <div class="hud-feedback-pill" id="hudFeedbackPill">Ready: Position in Frame</div>
              </div>
            </div>"""

    new_viewport = """          <div class="trainer-stage-container" style="margin-bottom: 1.25rem;">
            <!-- Video & Telemetry Canvas -->
            <div class="camera-viewport">
              <video id="webcamVideo" autoplay playsinline muted style="display: none;"></video>
              <canvas id="cameraCanvas" width="640" height="420"></canvas>

              <div class="camera-hud-overlay">
                <div class="hud-tag">
                  <span class="status-dot" id="camStatusDot"></span>
                  <span id="camStatusText">Camera: Ready</span>
                </div>
                <div class="hud-angle-pill" id="hudAnglePill">Joint Angle: 180°</div>
              </div>

              <div class="camera-hud-bottom">
                <div class="hud-rep-box">
                  <div class="hud-rep-title">COMPLETED REPS</div>
                  <div class="hud-rep-num" id="hudRepCount">0</div>
                </div>
                <div class="hud-feedback-pill" id="hudFeedbackPill">Ready: Position in Frame</div>
              </div>
            </div>

            <!-- Dynamic Side Tips Panel (FORM CHECK) -->
            <div class="side-tips-panel" id="sideTipsPanel">
              <div class="side-tips-header">
                <div class="side-tips-title">
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="#00e599"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
                  FORM CHECK
                </div>
                <span class="ai-badge ai-badge-mint" id="poseQualityBadge">Automated Vision</span>
              </div>

              <!-- Real-time dynamic corrections -->
              <div class="live-correction-box" id="sideTipsList">
                <div class="correction-item alert-neutral">
                  <span>✓ Stand in clear view of camera to engage automated form verification.</span>
                </div>
              </div>

              <!-- Rep Validation Breakdown -->
              <div class="rep-breakdown-row">
                <div>
                  <div class="rep-stat-label">Valid</div>
                  <div class="rep-stat-val mint" id="sideTipsValidReps">0</div>
                </div>
                <div>
                  <div class="rep-stat-label">Invalid</div>
                  <div class="rep-stat-val red" id="sideTipsInvalidReps">0</div>
                </div>
                <div>
                  <div class="rep-stat-label">Accuracy</div>
                  <div class="rep-stat-val cyan" id="sideTipsAccuracy">100%</div>
                </div>
              </div>

              <!-- Voice Audio Feedback Toggle -->
              <div style="display: flex; justify-content: space-between; align-items: center; padding-top: 0.5rem; border-top: 1px solid var(--border-subtle);">
                <span style="font-size: 0.8rem; color: var(--text-secondary);">Voice Coaching Cues</span>
                <input type="checkbox" id="chkVoiceFeedback" checked style="accent-color: var(--accent-primary); width: 16px; height: 16px;" />
              </div>
            </div>
          </div>

          <div class="camera-trainer-layout">"""

    if old_viewport in html:
        html = html.replace(old_viewport, new_viewport)
        print("  [+] Patched AI Trainer with dynamic Side Tips Panel")

    # 6. Insert new views after view-student-aitrainer
    end_trainer = '</section>\n\n        <!-- 4. Student Progress -->'
    if end_trainer in html and 'id="view-student-aicoach"' not in html:
        new_views = get_new_views_html()
        html = html.replace(end_trainer, f'</section>\n{new_views}\n\n        <!-- 4. Student Progress -->')
        print("  [+] Inserted 5 new AI Ecosystem views")

    # 7. Add Script tags before app.js / main.js
    scripts_to_add = """  <!-- MediaPipe Computer Vision (Local + CDN fallback) -->
  <script src="{vendor_prefix}vendor/camera_utils.js"></script>
  <script src="{vendor_prefix}vendor/pose.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils@0.3.1675466862/camera_utils.js" crossorigin="anonymous"></script>
  <script src="https://cdn.jsdelivr.net/npm/@mediapipe/pose@0.5.1675469404/pose.js" crossorigin="anonymous"></script>

  <!-- 1500+ Exercise Library Database -->
  <script src="{script_prefix}exercises-data.js?v=2.2.0"></script>

  <!-- Advanced AI Ecosystem Engine -->
  <script src="{script_prefix}ai-ecosystem.js?v=2.2.0"></script>
"""
    vendor_prefix = "" if is_standalone else "js/"
    script_prefix = "" if is_standalone else "js/"
    formatted_scripts = scripts_to_add.format(vendor_prefix=vendor_prefix, script_prefix=script_prefix)

    main_script_tag = '<script src="app.js?v=2.2.0"></script>' if is_standalone else '<script src="js/main.js?v=2.2.0"></script>'
    if 'ai-ecosystem.js' not in html:
        if main_script_tag in html:
            html = html.replace(main_script_tag, f'{formatted_scripts}  {main_script_tag}')
            print("  [+] Added AI script tags before main script")

    with open(filepath, "w", encoding="utf-8") as f:
        f.write(html)
    print(f"Finished writing {filepath}.")

if __name__ == "__main__":
    patch_html("app/index.html", is_standalone=True)
    patch_html("index.html", is_standalone=False)
