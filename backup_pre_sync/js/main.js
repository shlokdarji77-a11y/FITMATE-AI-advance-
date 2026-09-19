/**
 * FITMATE AI — Official Download Portal
 * Main Interactive Logic & Download Controller
 */

document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initMobileMenu();
  initDownloadHandlers();
  initComputerVisionDemo();
  initAdaptiveAiDemo();
  initChecksumModal();
  initPhase2Modal();
  initScrollAnimations();
});

/* --------------------------------------------------------------------------
   1. NAVBAR & SCROLL BEHAVIOR
   -------------------------------------------------------------------------- */
function initNavbar() {
  const navbar = document.getElementById('navbar');
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('section[id]');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 30) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }

    // Active Section Tracking
    let current = '';
    const scrollPos = window.scrollY + 120;

    sections.forEach((section) => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      if (scrollPos >= top && scrollPos < top + height) {
        current = section.getAttribute('id');
      }
    });

    navLinks.forEach((link) => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${current}`) {
        link.classList.add('active');
      }
    });
  }, { passive: true });
}

/* --------------------------------------------------------------------------
   2. MOBILE MENU DRAWER
   -------------------------------------------------------------------------- */
function initMobileMenu() {
  const toggle = document.getElementById('mobileMenuToggle');
  const drawer = document.getElementById('mobileDrawer');
  const mobileLinks = document.querySelectorAll('.mobile-nav-link');

  if (!toggle || !drawer) return;

  const toggleMenu = () => {
    const isOpen = drawer.classList.toggle('open');
    toggle.setAttribute('aria-expanded', isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
  };

  const closeMenu = () => {
    drawer.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  };

  toggle.addEventListener('click', toggleMenu);

  mobileLinks.forEach((link) => {
    link.addEventListener('click', closeMenu);
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && drawer.classList.contains('open')) {
      closeMenu();
    }
  });
}

/* --------------------------------------------------------------------------
   3. DOWNLOAD HANDLING & FEEDBACK TOASTS
   -------------------------------------------------------------------------- */
function initDownloadHandlers() {
  const downloadButtons = document.querySelectorAll('[data-download-platform]');

  downloadButtons.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      const platform = btn.getAttribute('data-download-platform');
      const filename = platform === 'android' ? 'FITMATE-AI.apk' : 'FITMATE-AI-Setup.exe';
      const isWindows = platform === 'windows';

      // Provide immediate toast feedback with installation guidance
      showToast(
        `Downloading ${filename}`,
        isWindows
          ? 'Download initiated. Run FITMATE-AI-Setup.exe once finished to install on your PC.'
          : 'Download initiated. Open FITMATE-AI.apk on your Android device to install.',
        6000
      );
    });
  });
}

function showToast(title, message, duration = 5000) {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `
    <div class="toast-icon">
      <svg viewBox="0 0 24 24"><path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z"/></svg>
    </div>
    <div class="toast-content">
      <h5>${title}</h5>
      <p>${message}</p>
    </div>
  `;

  container.appendChild(toast);

  // Trigger entrance animation
  requestAnimationFrame(() => {
    toast.classList.add('show');
  });

  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => {
      if (toast.parentNode) toast.parentNode.removeChild(toast);
    }, 300);
  }, duration);
}

/* --------------------------------------------------------------------------
   4. COMPUTER VISION INTERACTIVE SIMULATOR
   -------------------------------------------------------------------------- */
const EXERCISE_PRESETS = {
  squats: {
    name: 'Squats',
    repText: 'Rep 12 / 15',
    angleText: 'Knee Angle: 92° (Optimal Depth)',
    feedbackText: 'Depth: Excellent • Torso: Stable',
    badgeClass: 'mint',
    skeleton: {
      head: { cx: 200, cy: 70 },
      chest: { cx: 200, cy: 110 },
      leftShoulder: { cx: 175, cy: 115 },
      rightShoulder: { cx: 225, cy: 115 },
      hip: { cx: 200, cy: 180 },
      leftKnee: { cx: 165, cy: 230 },
      rightKnee: { cx: 235, cy: 230 },
      leftAnkle: { cx: 170, cy: 285 },
      rightAnkle: { cx: 230, cy: 285 }
    }
  },
  pushups: {
    name: 'Push-ups',
    repText: 'Rep 18 / 20',
    angleText: 'Elbow Angle: 88° (Chest Clear)',
    feedbackText: 'Full Extension • Core: Locked',
    badgeClass: 'mint',
    skeleton: {
      head: { cx: 120, cy: 170 },
      chest: { cx: 155, cy: 180 },
      leftShoulder: { cx: 150, cy: 175 },
      rightShoulder: { cx: 160, cy: 185 },
      hip: { cx: 230, cy: 190 },
      leftKnee: { cx: 280, cy: 200 },
      rightKnee: { cx: 290, cy: 205 },
      leftAnkle: { cx: 330, cy: 215 },
      rightAnkle: { cx: 335, cy: 220 }
    }
  },
  lunges: {
    name: 'Lunges',
    repText: 'Rep 10 / 12 (Left Leg)',
    angleText: 'Front Knee: 90° • Hip Aligned',
    feedbackText: 'Stride Length: Optimal',
    badgeClass: 'mint',
    skeleton: {
      head: { cx: 195, cy: 65 },
      chest: { cx: 195, cy: 105 },
      leftShoulder: { cx: 180, cy: 110 },
      rightShoulder: { cx: 210, cy: 110 },
      hip: { cx: 195, cy: 175 },
      leftKnee: { cx: 155, cy: 235 },
      rightKnee: { cx: 245, cy: 240 },
      leftAnkle: { cx: 155, cy: 290 },
      rightAnkle: { cx: 275, cy: 285 }
    }
  },
  jumpingjacks: {
    name: 'Jumping Jacks',
    repText: 'Rep 25 / 30',
    angleText: 'Arm Abduction: 172° • Wide Stance',
    feedbackText: 'Cadence: 1.2s / Rep • High Energy',
    badgeClass: 'mint',
    skeleton: {
      head: { cx: 200, cy: 60 },
      chest: { cx: 200, cy: 105 },
      leftShoulder: { cx: 160, cy: 95 },
      rightShoulder: { cx: 240, cy: 95 },
      hip: { cx: 200, cy: 170 },
      leftKnee: { cx: 150, cy: 230 },
      rightKnee: { cx: 250, cy: 230 },
      leftAnkle: { cx: 130, cy: 290 },
      rightAnkle: { cx: 270, cy: 290 }
    }
  },
  plank: {
    name: 'Plank',
    repText: 'Hold 00:45 / 01:00',
    angleText: 'Spine Alignment: 179° (Neutral)',
    feedbackText: 'Pelvic Position: Solid Hold',
    badgeClass: 'cyan',
    skeleton: {
      head: { cx: 110, cy: 200 },
      chest: { cx: 145, cy: 200 },
      leftShoulder: { cx: 140, cy: 195 },
      rightShoulder: { cx: 150, cy: 205 },
      hip: { cx: 235, cy: 195 },
      leftKnee: { cx: 295, cy: 195 },
      rightKnee: { cx: 300, cy: 200 },
      leftAnkle: { cx: 350, cy: 195 },
      rightAnkle: { cx: 355, cy: 200 }
    }
  }
};

function initComputerVisionDemo() {
  const buttons = document.querySelectorAll('[data-cv-exercise]');
  const repDisplay = document.getElementById('cvRepCounter');
  const angleDisplay = document.getElementById('cvAngleMetric');
  const feedbackDisplay = document.getElementById('cvFeedbackPill');

  // SVG Elements
  const head = document.getElementById('skelHead');
  const boneTorso = document.getElementById('skelTorso');
  const boneLeftThigh = document.getElementById('skelLeftThigh');
  const boneRightThigh = document.getElementById('skelRightThigh');
  const boneLeftShin = document.getElementById('skelLeftShin');
  const boneRightShin = document.getElementById('skelRightShin');
  const nodeHip = document.getElementById('skelNodeHip');
  const nodeLeftKnee = document.getElementById('skelNodeLeftKnee');
  const nodeRightKnee = document.getElementById('skelNodeRightKnee');
  const nodeLeftAnkle = document.getElementById('skelNodeLeftAnkle');
  const nodeRightAnkle = document.getElementById('skelNodeRightAnkle');

  buttons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const exerciseKey = btn.getAttribute('data-cv-exercise');
      const data = EXERCISE_PRESETS[exerciseKey];
      if (!data) return;

      // Update button active state
      buttons.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');

      // Update text readouts
      if (repDisplay) repDisplay.textContent = data.repText;
      if (angleDisplay) angleDisplay.textContent = data.angleText;
      if (feedbackDisplay) {
        feedbackDisplay.textContent = data.feedbackText;
      }

      // Update Skeleton Pose Nodes & Bones
      const s = data.skeleton;
      if (head) {
        head.setAttribute('cx', s.head.cx);
        head.setAttribute('cy', s.head.cy);
      }
      if (boneTorso) {
        boneTorso.setAttribute('x1', s.chest.cx);
        boneTorso.setAttribute('y1', s.chest.cy);
        boneTorso.setAttribute('x2', s.hip.cx);
        boneTorso.setAttribute('y2', s.hip.cy);
      }
      if (nodeHip) {
        nodeHip.setAttribute('cx', s.hip.cx);
        nodeHip.setAttribute('cy', s.hip.cy);
      }
      if (boneLeftThigh) {
        boneLeftThigh.setAttribute('x1', s.hip.cx);
        boneLeftThigh.setAttribute('y1', s.hip.cy);
        boneLeftThigh.setAttribute('x2', s.leftKnee.cx);
        boneLeftThigh.setAttribute('y2', s.leftKnee.cy);
      }
      if (nodeLeftKnee) {
        nodeLeftKnee.setAttribute('cx', s.leftKnee.cx);
        nodeLeftKnee.setAttribute('cy', s.leftKnee.cy);
      }
      if (boneLeftShin) {
        boneLeftShin.setAttribute('x1', s.leftKnee.cx);
        boneLeftShin.setAttribute('y1', s.leftKnee.cy);
        boneLeftShin.setAttribute('x2', s.leftAnkle.cx);
        boneLeftShin.setAttribute('y2', s.leftAnkle.cy);
      }
      if (nodeLeftAnkle) {
        nodeLeftAnkle.setAttribute('cx', s.leftAnkle.cx);
        nodeLeftAnkle.setAttribute('cy', s.leftAnkle.cy);
      }
      if (boneRightThigh) {
        boneRightThigh.setAttribute('x1', s.hip.cx);
        boneRightThigh.setAttribute('y1', s.hip.cy);
        boneRightThigh.setAttribute('x2', s.rightKnee.cx);
        boneRightThigh.setAttribute('y2', s.rightKnee.cy);
      }
      if (nodeRightKnee) {
        nodeRightKnee.setAttribute('cx', s.rightKnee.cx);
        nodeRightKnee.setAttribute('cy', s.rightKnee.cy);
      }
      if (boneRightShin) {
        boneRightShin.setAttribute('x1', s.rightKnee.cx);
        boneRightShin.setAttribute('y1', s.rightKnee.cy);
        boneRightShin.setAttribute('x2', s.rightAnkle.cx);
        boneRightShin.setAttribute('y2', s.rightAnkle.cy);
      }
      if (nodeRightAnkle) {
        nodeRightAnkle.setAttribute('cx', s.rightAnkle.cx);
        nodeRightAnkle.setAttribute('cy', s.rightAnkle.cy);
      }
    });
  });
}

/* --------------------------------------------------------------------------
   5. ADAPTIVE AI INTERACTIVE DEMO TOGGLE
   -------------------------------------------------------------------------- */
const ADAPTIVE_SCENARIOS = {
  easy: {
    prevText: 'Squats — Easy',
    prevDetail: 'Target: 3x12 completed with zero fatigue (RPE 5-6)',
    aiText: 'Strong performance detected',
    aiDetail: 'Movement cadence rapid, velocity smooth, reserve capacity high.',
    nextText: 'Difficulty increased',
    nextDetail: 'Next plan adds +2 reps per set, adds 3s eccentric pauses, or advances progression.'
  },
  difficult: {
    prevText: 'Push-ups — Difficult',
    prevDetail: 'Target: Failed on rep 8 of set 3 with form degradation (RPE 9.5)',
    aiText: 'Form fatigue detected',
    aiDetail: 'Deceleration in final reps, core sagging detected by CV telemetry.',
    nextText: 'Difficulty adjusted',
    nextDetail: 'Next plan recalibrates volume -15%, increases rest intervals +30s to ensure recovery.'
  }
};

function initAdaptiveAiDemo() {
  const pills = document.querySelectorAll('[data-adaptive-mode]');
  const prevTitle = document.getElementById('adaptivePrevTitle');
  const prevDetail = document.getElementById('adaptivePrevDetail');
  const aiTitle = document.getElementById('adaptiveAiTitle');
  const aiDetail = document.getElementById('adaptiveAiDetail');
  const nextTitle = document.getElementById('adaptiveNextTitle');
  const nextDetail = document.getElementById('adaptiveNextDetail');

  pills.forEach((pill) => {
    pill.addEventListener('click', () => {
      const mode = pill.getAttribute('data-adaptive-mode');
      const data = ADAPTIVE_SCENARIOS[mode];
      if (!data) return;

      pills.forEach((p) => p.classList.remove('active'));
      pill.classList.add('active');

      if (prevTitle) prevTitle.textContent = data.prevText;
      if (prevDetail) prevDetail.textContent = data.prevDetail;
      if (aiTitle) aiTitle.textContent = data.aiText;
      if (aiDetail) aiDetail.textContent = data.aiDetail;
      if (nextTitle) nextTitle.textContent = data.nextText;
      if (nextDetail) nextDetail.textContent = data.nextDetail;
    });
  });
}

/* --------------------------------------------------------------------------
   6. CHECKSUM & RELEASE VERIFICATION MODAL
   -------------------------------------------------------------------------- */
function initChecksumModal() {
  const openTriggers = document.querySelectorAll('[data-open-checksum]');
  const modal = document.getElementById('checksumModal');
  const closeBtn = document.getElementById('closeChecksumModal');
  const copyBtns = document.querySelectorAll('[data-copy-hash]');

  if (!modal) return;

  const openModal = (e) => {
    e.preventDefault();
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    modal.classList.remove('open');
    document.body.style.overflow = '';
  };

  openTriggers.forEach((btn) => btn.addEventListener('click', openModal));
  if (closeBtn) closeBtn.addEventListener('click', closeModal);

  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('open')) closeModal();
  });

  copyBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-copy-hash');
      const targetEl = document.getElementById(targetId);
      if (targetEl) {
        navigator.clipboard.writeText(targetEl.textContent.trim()).then(() => {
          showToast('Hash Copied', 'SHA-256 checksum copied to clipboard.');
        });
      }
    });
  });
}

/* --------------------------------------------------------------------------
   7. PHASE 2 NOTIFICATION MODAL
   -------------------------------------------------------------------------- */
function initPhase2Modal() {
  const triggers = document.querySelectorAll('[data-open-phase2]');
  const modal = document.getElementById('phase2Modal');
  const closeBtn = document.getElementById('closePhase2Modal');
  const form = document.getElementById('phase2NotifyForm');

  if (!modal) return;

  const openModal = (e) => {
    e.preventDefault();
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    modal.classList.remove('open');
    document.body.style.overflow = '';
  };

  triggers.forEach((btn) => btn.addEventListener('click', openModal));
  if (closeBtn) closeBtn.addEventListener('click', closeModal);

  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const emailInput = document.getElementById('phase2Email');
      const email = emailInput ? emailInput.value : '';
      if (email) {
        localStorage.setItem('fitmate_phase2_interest', email);
        closeModal();
        showToast(
          'Notification Saved',
          `We will email ${email} the moment FITMATE AI for iOS and macOS launches.`
        );
        if (emailInput) emailInput.value = '';
      }
    });
  }
}

/* --------------------------------------------------------------------------
   8. SCROLL ANIMATIONS (INTERSECTION OBSERVER)
   -------------------------------------------------------------------------- */
function initScrollAnimations() {
  const fadeElements = document.querySelectorAll('.fade-in-section');
  if (!('IntersectionObserver' in window)) {
    fadeElements.forEach((el) => el.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          obs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1 }
  );

  fadeElements.forEach((el) => observer.observe(el));
}
