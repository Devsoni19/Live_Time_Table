/**
 * VGEC Timetable - ICT Semester 5 (O4 Batch)
 * Production-Quality Progressive Web App Logic
 * 
 * Features:
 * - Live Clock & Date Update
 * - Current Lecture Detection with dynamic progress bar
 * - Upcoming and previous lecture visual dimming/highlighting
 * - Break/Recess and Weekend detection
 * - Offline PWA lifecycle events (caching, updating)
 * - Accessibility controls, custom scrollbars, print stylesheets
 * - Confetti celebration at Friday college completion
 */

(function () {
  'use strict';

  // ==========================================
  // 1. DOM Elements & Constants
  // ==========================================
  const ELEMENTS = {
    loadingScreen: document.getElementById("loadingScreen"),
    clock: document.getElementById("clock"),
    currentDate: document.getElementById("currentDate"),
    networkStatus: document.getElementById("networkStatus"),
    themeBtn: document.getElementById("themeBtn"),
    notifBtn: document.getElementById("notifBtn"),
    installBtn: document.getElementById("installBtn"),
    adminBtn: document.getElementById("adminBtn"),

    // Status Tracker
    trackerBadge: document.getElementById("trackerBadge"),
    liveTitle: document.getElementById("liveTitle"),
    liveSubtitle: document.getElementById("liveSubtitle"),
    progressBar: document.getElementById("progressBar"),
    progressPercent: document.getElementById("progressPercent"),
    timeElapsed: document.getElementById("timeElapsed"),
    timeRemaining: document.getElementById("timeRemaining"),

    // Search & Views
    searchInput: document.getElementById("searchInput"),
    btnDailyView: document.getElementById("btnDailyView"),
    btnWeeklyView: document.getElementById("btnWeeklyView"),
    previewContent: document.getElementById("previewContent"),
    timetableContainer: document.getElementById("timetableContainer"),

    // Announcements & Admin
    announcementsPanel: document.getElementById("announcementsPanel"),
    announcementsCount: document.getElementById("announcementsCount"),
    announcementsContainer: document.getElementById("announcementsContainer"),
    adminModal: document.getElementById("adminModal"),
    modalCloseBtn: document.getElementById("modalCloseBtn"),
    adminLoginView: document.getElementById("adminLoginView"),
    adminDashboardView: document.getElementById("adminDashboardView"),
    loginForm: document.getElementById("loginForm"),
    adminPassword: document.getElementById("adminPassword"),
    announcementForm: document.getElementById("announcementForm"),
    announcementType: document.getElementById("announcementType"),
    announcementDate: document.getElementById("announcementDate"),
    announcementTitle: document.getElementById("announcementTitle"),
    announcementDesc: document.getElementById("announcementDesc"),
    adminAnnouncementsList: document.getElementById("adminAnnouncementsList"),
    btnAdminLogout: document.getElementById("btnAdminLogout"),
    btnExportAnnouncements: document.getElementById("btnExportAnnouncements"),
    btnImportAnnouncements: document.getElementById("btnImportAnnouncements"),
    importFile: document.getElementById("importFile"),

    // Templates
    dayTemplate: document.getElementById("dayTemplate"),
    lectureTemplate: document.getElementById("lectureTemplate"),
    announcementCardTemplate: document.getElementById("announcementCardTemplate"),
    confettiContainer: document.getElementById("confettiContainer")
  };

  const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const APP_VERSION = "1.1.0";
  const SUBJECT_ALIASES = {
    CN: ["Computer Networks"],
    PDS: ["Python for Data Science"],
    ADC: ["Analog Digital Communication", "Analog & Digital Communication", "Analog and Digital Communication"],
    AJP: ["Advanced Java Programming"],
    SAS: ["Signals Systems", "Signals & Systems"],
    MOPEC: ["MOPEC"]
  };

  // ==========================================
  // 2. Timetable Data (O4 Batch Only)
  // ==========================================
  const TIMETABLE = {
    "Monday": [
      { subject: "CN", faculty: "JKN", start: "10:30", end: "11:30", type: "Lecture" },
      { subject: "PDS", faculty: "KBC", start: "11:30", end: "12:30", type: "Lecture" },
      { subject: "MOPEC", faculty: "-", start: "13:15", end: "14:15", type: "Lecture" },
      { subject: "SAS", faculty: "ARA", start: "15:30", end: "17:30", type: "Lab" }
    ],
    "Tuesday": [
      { subject: "PDS", faculty: "KBC", start: "10:30", end: "11:30", type: "Lecture" },
      { subject: "CN", faculty: "JKN", start: "11:30", end: "12:30", type: "Lecture" },
      { subject: "MOPEC", faculty: "-", start: "13:15", end: "14:15", type: "Lecture" },
      { subject: "AJP", faculty: "ARA", start: "15:30", end: "17:30", type: "Lab" }
    ],
    "Wednesday": [
      { subject: "ADC", faculty: "VF", start: "10:30", end: "11:30", type: "Lecture" },
      { subject: "AJP", faculty: "ZBM", start: "11:30", end: "12:30", type: "Lecture" },
      { subject: "MOPEC", faculty: "-", start: "13:15", end: "14:15", type: "Lecture" },
      { subject: "CN", faculty: "KBC", start: "15:30", end: "17:30", type: "Lecture" }
    ],
    "Thursday": [
      { subject: "AJP", faculty: "VF", start: "10:30", end: "11:30", type: "Lecture" },
      { subject: "ADC", faculty: "UNF", start: "11:30", end: "12:30", type: "Lecture" },
      { subject: "PDS", faculty: "KBC", start: "13:15", end: "14:15", type: "Lecture" }
      // Thursday 03:30 - 05:30 slot remains completely blank for O4
    ],
    "Friday": [
      { subject: "SAS", faculty: "ARA", start: "10:30", end: "11:30", type: "Lecture" },
      { subject: "ADC", faculty: "UNF", start: "11:30", end: "12:30", type: "Lecture" },
      { subject: "ADC", faculty: "VF", start: "13:15", end: "15:15", type: "Lab" }
    ]
  };

  // State flags
  let activeTheme = "light";
  let activeView = "daily"; // 'daily' or 'weekly'
  let notificationsEnabled = false;
  let notifiedForNextLecture = false;
  let deferredInstallPrompt = null;
  let collapsedDays = JSON.parse(localStorage.getItem("collapsedDays") || "{}");

  // Announcements & Admin Panel State
  let isAdminLoggedIn = false;
  let announcements = [];
  const DEFAULT_ANNOUNCEMENTS = [];
  //   {
  //     id: "ann-default-1",
  //     type: "exam-mid",
  //     title: "Mid-Term Examinations",
  //     date: "2026-09-07",
  //     desc: "Mid-semester internal examinations cover Units 1-3. Detailed timetable is available on the departmental notice board."
  //   },
  //   {
  //     id: "ann-default-2",
  //     type: "assignment",
  //     title: "Python for Data Science Assignment 2",
  //     date: "2026-08-14",
  //     desc: "Submit Jupyter notebooks containing solutions to exercises 5-8 on Google Classroom."
  //   },
  //   {
  //     id: "ann-default-3",
  //     type: "exam-final",
  //     title: "GTU Winter 2026 Theory Exam",
  //     date: "2026-11-20",
  //     desc: "Final external university exams are expected to commence tentatively in late November. Keep checking official GTU portal."
  //   }
  // ];
  // ==========================================
  // 3. Time Utilities
  // ==========================================

  /**
   * Converts a time string "HH:MM" (24h) to minutes since midnight
   * @param {string} timeStr 
   * @returns {number}
   */
  function toMinutes(timeStr) {
    const parts = timeStr.split(":");
    return parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
  }

  /**
   * Formats 24h string "HH:MM" into readable 12h format "HH:MM AM/PM"
   * @param {string} timeStr 
   * @returns {string}
   */
  function formatTime12h(timeStr) {
    const [hours, minutes] = timeStr.split(":").map(Number);
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const h12 = hours % 12 === 0 ? 12 : hours % 12;
    const mStr = minutes.toString().padStart(2, '0');
    return `${h12}:${mStr} ${ampm}`;
  }

  function normalizeText(value) {
    return String(value || "")
      .toLowerCase()
      .replace(/&/g, " and ")
      .replace(/[^a-z0-9]+/g, " ")
      .trim()
      .replace(/\s+/g, " ");
  }

  function matchesSearchTerm(value, query) {
    const normalizedValue = normalizeText(value);
    const normalizedQuery = normalizeText(query);
    if (!normalizedQuery) return false;

    if (normalizedValue.includes(normalizedQuery)) return true;

    const compactValue = normalizedValue.replace(/\s+/g, "");
    const compactQuery = normalizedQuery.replace(/\s+/g, "");
    return compactValue.includes(compactQuery);
  }

  function matchesSubjectSearch(subject, query) {
    if (matchesSearchTerm(subject, query)) return true;

    const aliases = SUBJECT_ALIASES[subject] || [];
    return aliases.some(alias => matchesSearchTerm(alias, query));
  }

  function setPreviewVisibility(isSearching) {
    if (!ELEMENTS.previewContent?.parentElement) return;

    const panel = ELEMENTS.previewContent.closest(".preview-panel");
    if (!panel) return;

    panel.style.display = isSearching ? "none" : "";
  }

  /**
   * Calculates difference in minutes between two "HH:MM" time strings
   * @param {string} start 
   * @param {string} end 
   * @returns {number}
   */
  function timeDiffMinutes(start, end) {
    return toMinutes(end) - toMinutes(start);
  }

  /**
   * Returns current local time in minutes since midnight
   * @returns {number}
   */
  function currentMinutes() {
    const now = new Date();
    return now.getHours() * 60 + now.getMinutes();
  }

  // ==========================================
  // 4. Rendering Timetable Grid
  // ==========================================

  /**
   * Initial layout build of the weekly timetable
   */
  function buildTimetable() {
    ELEMENTS.timetableContainer.innerHTML = "";

    Object.keys(TIMETABLE).forEach(day => {
      const dayNode = ELEMENTS.dayTemplate.content.cloneNode(true);
      const daySection = dayNode.querySelector(".day-card");
      daySection.setAttribute("data-day", day);

      // Expand/Collapse header
      const header = daySection.querySelector(".day-card-header");
      const title = daySection.querySelector(".day-title");
      title.textContent = day;

      // Restore collapsed states
      if (collapsedDays[day]) {
        daySection.classList.add("collapsed");
      }

      header.addEventListener("click", () => {
        daySection.classList.toggle("collapsed");
        collapsedDays[day] = daySection.classList.contains("collapsed");
        localStorage.setItem("collapsedDays", JSON.stringify(collapsedDays));
      });

      const lectureList = daySection.querySelector(".lecture-list");
      const lectures = TIMETABLE[day];

      if (lectures.length === 0) {
        // Free day placeholder
        const emptyState = document.createElement("div");
        emptyState.className = "empty-day-state";
        emptyState.innerHTML = `
          <span class="empty-icon">☕</span>
          <h4>No Scheduled Classes</h4>
          <p>Enjoy your free day!</p>
        `;
        lectureList.appendChild(emptyState);
      } else {
        lectures.forEach((lec, index) => {
          const lecNode = ELEMENTS.lectureTemplate.content.cloneNode(true);
          const article = lecNode.querySelector(".lecture-item");

          // Unique identification for DOM tracking
          article.id = `lecture-${day.toLowerCase()}-${index}`;

          // Class mappings for specific styling
          article.classList.add(`${lec.subject.toLowerCase()}-subject`);
          if (lec.type === "Lab") {
            article.classList.add("lab-subject");
          }

          // Inject details
          lecNode.querySelector(".start-time").textContent = formatTime12h(lec.start);
          lecNode.querySelector(".end-time").textContent = formatTime12h(lec.end);
          lecNode.querySelector(".lecture-subject").textContent = lec.subject;
          lecNode.querySelector(".lecture-type-badge").textContent = lec.type;
          lecNode.querySelector(".faculty-name").textContent = lec.faculty;

          // Save node reference to lecture object for fast mutations
          lec.domElement = article;

          lectureList.appendChild(lecNode);
        });
      }

      ELEMENTS.timetableContainer.appendChild(dayNode);
    });

    // Update active view layout styles
    updateViewMode();
  }

  // ==========================================
  // 5. Tracking & Lecture Status Core
  // ==========================================

  /**
   * Scans timetable to update current, next, and previous lectures,
   * progress bars, and status information.
   */
  function trackLiveSchedule() {
    const now = new Date();
    const currentDay = DAYS[now.getDay()];
    const currentMin = currentMinutes();

    // Reset status indicators
    ELEMENTS.trackerBadge.style.display = "inline-block";
    ELEMENTS.trackerBadge.className = "tracker-badge";

    // Check for Weekend
    if (now.getDay() === 0 || now.getDay() === 6) {
      updateStatusDisplay({
        badge: "WEEKEND",
        badgeClass: "weekend",
        title: "🎉 No Classes Today",
        subtitle: "Have a wonderful weekend!",
        progress: 0,
        showProgress: false
      });
      clearAllHighlights();
      return;
    }

    const todayLectures = TIMETABLE[currentDay] || [];

    // Check if college has no classes today (unlikely for weekdays, but safe fallback)
    if (todayLectures.length === 0) {
      updateStatusDisplay({
        badge: "NO CLASSES",
        badgeClass: "weekend",
        title: "🌴 Free Day Today",
        subtitle: "No lectures scheduled for " + currentDay,
        progress: 0,
        showProgress: false
      });
      clearAllHighlights();
      return;
    }

    const firstLec = todayLectures[0];
    const lastLec = todayLectures[todayLectures.length - 1];

    // Case 1: Before First Lecture
    if (currentMin < toMinutes(firstLec.start)) {
      const waitTime = toMinutes(firstLec.start) - currentMin;
      updateStatusDisplay({
        badge: "PRE-COLLEGE",
        badgeClass: "next",
        title: `⏰ Waiting for College`,
        subtitle: `First class starts in ${waitTime} min (${firstLec.subject})`,
        progress: 0,
        showProgress: false
      });
      highlightLectures(currentDay, null, firstLec);
      checkNotificationAlert(firstLec, waitTime);
      return;
    }

    // Case 2: After College is Over
    if (currentMin >= toMinutes(lastLec.end)) {
      updateStatusDisplay({
        badge: "COLLEGE OVER",
        badgeClass: "weekend",
        title: "🏫 College Over for Today",
        subtitle: "All lectures finished. See you tomorrow!",
        progress: 100,
        showProgress: true
      });
      highlightLectures(currentDay, null, null);

      // Friday Celebration Check: Ends at 3:15 PM (15:15)
      // Confetti will trigger if it's Friday and within 30 minutes of college ending
      if (currentDay === "Friday" && currentMin >= 915 && currentMin < 945) {
        triggerConfettiCelebration();
      }
      return;
    }

    // Scan classes to find active lecture or break
    let activeLec = null;
    let upcomingLec = null;
    let prevLec = null;
    let insideBreak = false;
    let breakNextLec = null;

    for (let i = 0; i < todayLectures.length; i++) {
      const lec = todayLectures[i];
      const startMin = toMinutes(lec.start);
      const endMin = toMinutes(lec.end);

      if (currentMin >= startMin && currentMin < endMin) {
        activeLec = lec;
        upcomingLec = todayLectures[i + 1] || null;
        break;
      }

      if (currentMin < startMin) {
        // Since list is sorted, first one we see in future is the next lecture
        breakNextLec = lec;
        prevLec = todayLectures[i - 1] || null;
        insideBreak = true;
        break;
      }
    }

    // Case 3: Inside a Lecture
    if (activeLec) {
      const startMin = toMinutes(activeLec.start);
      const endMin = toMinutes(activeLec.end);
      const elapsed = currentMin - startMin;
      const duration = endMin - startMin;
      const remaining = endMin - currentMin;
      const percentage = Math.floor((elapsed / duration) * 100);

      updateStatusDisplay({
        badge: "LIVE NOW",
        badgeClass: "live",
        title: `📚 ${activeLec.subject} (${activeLec.type})`,
        subtitle: `Faculty: ${activeLec.faculty} • Ends at ${formatTime12h(activeLec.end)}`,
        progress: percentage,
        showProgress: true,
        elapsedText: `${elapsed}m elapsed`,
        remainingText: `${remaining}m remaining`
      });

      highlightLectures(currentDay, activeLec, upcomingLec);

      // Notification Alert: Notify 5 mins before next lecture starts
      if (upcomingLec && remaining <= 5) {
        checkNotificationAlert(upcomingLec, remaining);
      }

      // Auto Scroll current lecture into view
      scrollLectureIntoView(activeLec);
      return;
    }

    // Case 4: Inside a Recess/Break
    if (insideBreak && breakNextLec) {
      const breakEndsMin = toMinutes(breakNextLec.start);
      const timeRemaining = breakEndsMin - currentMin;

      updateStatusDisplay({
        badge: "BREAK TIME",
        badgeClass: "next",
        title: "☕ RECESS / BREAK",
        subtitle: `Next lecture (${breakNextLec.subject}) starts in ${timeRemaining} minutes`,
        progress: 0,
        showProgress: false
      });

      highlightLectures(currentDay, null, breakNextLec);
      checkNotificationAlert(breakNextLec, timeRemaining);
    }
  }

  /**
   * Generic handler to render state changes on the Live Status block
   */
  function updateStatusDisplay(data) {
    ELEMENTS.trackerBadge.textContent = data.badge;
    ELEMENTS.trackerBadge.classList.add(data.badgeClass);
    ELEMENTS.liveTitle.textContent = data.title;
    ELEMENTS.liveSubtitle.textContent = data.subtitle;

    if (data.showProgress) {
      ELEMENTS.progressBar.style.width = `${data.progress}%`;
      ELEMENTS.progressBar.setAttribute("aria-valuenow", data.progress);
      ELEMENTS.progressPercent.textContent = `${data.progress}%`;
      ELEMENTS.progressBar.style.display = "block";
      document.getElementById("progressBarContainer").style.display = "block";
      ELEMENTS.timeElapsed.textContent = data.elapsedText || "";
      ELEMENTS.timeRemaining.textContent = data.remainingText || "";
      document.getElementById("trackerFooter").style.display = "flex";
    } else {
      ELEMENTS.progressBar.style.width = "0%";
      ELEMENTS.progressBar.setAttribute("aria-valuenow", 0);
      ELEMENTS.progressPercent.textContent = "";
      document.getElementById("progressBarContainer").style.display = "none";
      document.getElementById("trackerFooter").style.display = "none";
    }
  }

  /**
   * Resets all highlighted styles across all day cards
   */
  function clearAllHighlights() {
    Object.keys(TIMETABLE).forEach(day => {
      TIMETABLE[day].forEach(lec => {
        if (lec.domElement) {
          lec.domElement.classList.remove("current", "next", "previous");
        }
      });
    });
  }

  /**
   * Toggles styling for current, next, and previous lectures.
   */
  function highlightLectures(currentDay, activeLec, upcomingLec) {
    Object.keys(TIMETABLE).forEach(day => {
      const isToday = day === currentDay;
      const lectures = TIMETABLE[day];

      lectures.forEach(lec => {
        if (!lec.domElement) return;

        // Clear existing states
        lec.domElement.classList.remove("current", "next", "previous");

        if (isToday) {
          if (activeLec && lec === activeLec) {
            lec.domElement.classList.add("current");
          } else if (upcomingLec && lec === upcomingLec) {
            lec.domElement.classList.add("next");
          } else if (activeLec && toMinutes(lec.end) <= toMinutes(activeLec.start)) {
            // Lecture is fully complete
            lec.domElement.classList.add("previous");
          } else if (!activeLec && upcomingLec && toMinutes(lec.end) <= toMinutes(upcomingLec.start)) {
            // During a break, mark past ones as previous
            lec.domElement.classList.add("previous");
          }
        }
      });
    });
  }

  /**
   * Automatically scroll the active lecture card into screen center
   */
  let lastScrolledLec = null;
  function scrollLectureIntoView(lecture) {
    if (lecture === lastScrolledLec) return;
    lastScrolledLec = lecture;

    setTimeout(() => {
      if (lecture.domElement) {
        lecture.domElement.scrollIntoView({
          behavior: "smooth",
          block: "center"
        });
      }
    }, 1000);
  }

  // ==========================================
  // 6. View Controls & Toggles
  // ==========================================

  /**
   * Synchronizes Weekly vs Daily layouts in grid
   */
  function updateViewMode() {
    const grid = ELEMENTS.timetableContainer;
    const now = new Date();
    const currentDay = DAYS[now.getDay()];

    // Determine target day for Daily View:
    // If it's a weekday, show today. If weekend, fallback to Monday.
    const isWkEnd = now.getDay() === 0 || now.getDay() === 6;
    const targetDay = isWkEnd ? "Monday" : currentDay;

    if (activeView === "daily") {
      grid.classList.add("daily-active");

      // Toggle card visibility
      const dayCards = grid.querySelectorAll(".day-card");
      dayCards.forEach(card => {
        const cardDay = card.getAttribute("data-day");
        if (cardDay === targetDay) {
          card.classList.add("today-active");
          // Daily view card should not be collapsed for convenience
          card.classList.remove("collapsed");
        } else {
          card.classList.remove("today-active");
        }
      });

      ELEMENTS.btnDailyView.classList.add("active");
      ELEMENTS.btnDailyView.setAttribute("aria-selected", "true");
      ELEMENTS.btnWeeklyView.classList.remove("active");
      ELEMENTS.btnWeeklyView.setAttribute("aria-selected", "false");
    } else {
      grid.classList.remove("daily-active");

      const dayCards = grid.querySelectorAll(".day-card");
      dayCards.forEach(card => {
        card.classList.remove("today-active");

        // Restore collapse states
        const cardDay = card.getAttribute("data-day");
        if (collapsedDays[cardDay]) {
          card.classList.add("collapsed");
        } else {
          card.classList.remove("collapsed");
        }
      });

      ELEMENTS.btnWeeklyView.classList.add("active");
      ELEMENTS.btnWeeklyView.setAttribute("aria-selected", "true");
      ELEMENTS.btnDailyView.classList.remove("active");
      ELEMENTS.btnDailyView.setAttribute("aria-selected", "false");
    }
  }

  // ==========================================
  // 7. Preview & Schedule Summary Card
  // ==========================================

  /**
   * Generates tomorrow preview card summary
   */
  function updateTomorrowPreview() {
    const now = new Date();
    const todayIndex = now.getDay();

    // Tomorrow logic (wrapping weekends)
    let tomorrowIndex = todayIndex + 1;
    if (tomorrowIndex > 6) tomorrowIndex = 0; // Wrap to Sunday

    const tomorrowDay = DAYS[tomorrowIndex];
    const tomorrowLectures = TIMETABLE[tomorrowDay] || [];

    const container = ELEMENTS.previewContent;
    container.innerHTML = "";

    const isWkEnd = tomorrowIndex === 0 || tomorrowIndex === 6;

    if (isWkEnd) {
      container.innerHTML = `
        <div class="empty-day-state" style="padding: 10px;">
          <p>💤 Tomorrow is the weekend. Rest up!</p>
        </div>
      `;
      return;
    }

    if (tomorrowLectures.length === 0) {
      container.innerHTML = `
        <div class="empty-day-state" style="padding: 10px;">
          <p>🌴 No classes scheduled for tomorrow.</p>
        </div>
      `;
      return;
    }

    tomorrowLectures.forEach(lec => {
      const item = document.createElement("div");
      item.className = "preview-item";

      // Subject border accent
      item.style.borderLeftColor = `var(--${lec.subject.toLowerCase()}-color)`;

      item.innerHTML = `
        <div class="preview-item-left">
          <span class="preview-subject">${lec.subject} (${lec.type})</span>
          <span class="preview-meta">👨‍🏫 ${lec.faculty}</span>
        </div>
        <span class="preview-time">${formatTime12h(lec.start)}</span>
      `;
      container.appendChild(item);
    });
  }

  // ==========================================
  // 8. Search / Filter Core
  // ==========================================

  /**
   * Filters all visible days/lectures dynamically
   */
  function filterLectures() {
    const query = ELEMENTS.searchInput.value.trim().toLowerCase();
    const isSearching = query !== "";
    setPreviewVisibility(isSearching);

    if (query === "") {
      // Clear filters
      Object.keys(TIMETABLE).forEach(day => {
        const dayCard = ELEMENTS.timetableContainer.querySelector(`.day-card[data-day="${day}"]`);
        if (dayCard) {
          dayCard.classList.remove("filtered-out");
          const items = dayCard.querySelectorAll(".lecture-item");
          items.forEach(it => it.classList.remove("filtered-out"));
        }
      });
      // Restore view mode displays
      updateViewMode();
      return;
    }

    // Search query active - evaluate day-by-day
    Object.keys(TIMETABLE).forEach(day => {
      const dayCard = ELEMENTS.timetableContainer.querySelector(`.day-card[data-day="${day}"]`);
      if (!dayCard) return;

      const lectures = TIMETABLE[day];
      let matchCount = 0;

      lectures.forEach((lec, index) => {
        const itemDom = dayCard.querySelector(`#lecture-${day.toLowerCase()}-${index}`);
        if (!itemDom) return;

        const subjectMatch = matchesSubjectSearch(lec.subject, query);
        const facultyMatch = matchesSearchTerm(lec.faculty, query);

        if (subjectMatch || facultyMatch) {
          itemDom.classList.remove("filtered-out");
          matchCount++;
        } else {
          itemDom.classList.add("filtered-out");
        }
      });

      // If no lectures match on a day, hide that day entirely
      if (matchCount === 0 && lectures.length > 0) {
        dayCard.classList.add("filtered-out");
      } else {
        dayCard.classList.remove("filtered-out");

        // Force expand card so user can see search results
        dayCard.classList.remove("collapsed");
      }
    });

    // In daily view, if search query is active, let all cards display, overrides single card focus
    if (activeView === "daily") {
      const dayCards = ELEMENTS.timetableContainer.querySelectorAll(".day-card");
      dayCards.forEach(card => {
        if (!card.classList.contains("filtered-out")) {
          card.classList.add("today-active");
        }
      });
    }
  }

  // ==========================================
  // 9. Interactive Effects (Ripple, Theme, Confetti)
  // ==========================================

  /**
   * Attaches Win11/Material-style ripple animation to buttons
   */
  function initRippleEffect() {
    document.addEventListener("click", function (e) {
      const target = e.target.closest(".glass-btn, .toggle-btn, .floating-install-btn");
      if (!target) return;

      const rect = target.getBoundingClientRect();
      const ripple = document.createElement("span");

      const size = Math.max(rect.width, rect.height);
      const x = e.clientX - rect.left - size / 2;
      const y = e.clientY - rect.top - size / 2;

      // Add ripple styling attributes
      ripple.style.width = ripple.style.height = `${size}px`;
      ripple.style.left = `${x}px`;
      ripple.style.top = `${y}px`;
      ripple.className = "btn-ripple";

      // Clear any older ripples in the button
      const old = target.querySelector(".btn-ripple");
      if (old) old.remove();

      target.appendChild(ripple);

      // Auto remove after animation completes
      setTimeout(() => ripple.remove(), 600);
    });
  }

  /**
   * Dynamic Theme management (Light vs Dark)
   */
  function initTheme() {
    const cachedTheme = localStorage.getItem("theme");
    // Default to OS Preference if no cache
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

    activeTheme = cachedTheme || (prefersDark ? "dark" : "light");

    if (activeTheme === "dark") {
      document.body.classList.add("dark");
      ELEMENTS.themeBtn.textContent = "☀️";
    } else {
      document.body.classList.remove("dark");
      ELEMENTS.themeBtn.textContent = "🌙";
    }
  }

  function toggleTheme() {
    if (activeTheme === "light") {
      activeTheme = "dark";
      document.body.classList.add("dark");
      ELEMENTS.themeBtn.textContent = "☀️";
    } else {
      activeTheme = "light";
      document.body.classList.remove("dark");
      ELEMENTS.themeBtn.textContent = "🌙";
    }
    localStorage.setItem("theme", activeTheme);
  }

  /**
   * Vanilla JS Falling Confetti (completely offline, self-contained)
   */
  let confettiTriggered = false;
  function triggerConfettiCelebration() {
    if (confettiTriggered) return;
    confettiTriggered = true;

    const container = ELEMENTS.confettiContainer;
    container.innerHTML = "";

    const colors = ["#ef4444", "#3b82f6", "#10b981", "#eab308", "#a855f7", "#ec4899", "#f97316"];
    const count = 75;

    for (let i = 0; i < count; i++) {
      const piece = document.createElement("div");
      piece.className = "confetti";

      // Random coordinates and animations
      piece.style.left = `${Math.random() * 100}vw`;
      piece.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      piece.style.width = `${Math.random() * 10 + 6}px`;
      piece.style.height = piece.style.width;

      // Animation timing
      piece.style.animationDelay = `${Math.random() * 0.8}s`;
      piece.style.animationDuration = `${Math.random() * 2 + 1.5}s`;

      // Custom rotation angle
      piece.style.transform = `rotate(${Math.random() * 360}deg)`;

      container.appendChild(piece);
    }

    // Allow re-triggering next day
    setTimeout(() => {
      container.innerHTML = "";
      confettiTriggered = false;
    }, 6000);
  }

  // ==========================================
  // 10. Web Notification Engine
  // ==========================================

  function initNotifications() {
    if (!("Notification" in window)) {
      ELEMENTS.notifBtn.style.display = "none";
      return;
    }

    if (Notification.permission === "granted") {
      notificationsEnabled = true;
      ELEMENTS.notifBtn.textContent = "🔕";
      ELEMENTS.notifBtn.title = "Disable Lecture Alerts";
    } else if (Notification.permission === "denied") {
      ELEMENTS.notifBtn.style.opacity = "0.5";
    }

    ELEMENTS.notifBtn.addEventListener("click", () => {
      if (notificationsEnabled) {
        notificationsEnabled = false;
        ELEMENTS.notifBtn.textContent = "🔔";
        ELEMENTS.notifBtn.title = "Enable Lecture Alerts";
        alert("Notifications disabled.");
      } else {
        Notification.requestPermission().then(permission => {
          if (permission === "granted") {
            notificationsEnabled = true;
            ELEMENTS.notifBtn.textContent = "🔕";
            ELEMENTS.notifBtn.title = "Disable Lecture Alerts";

            // Send test notification
            new Notification("VGEC Timetable Alerts", {
              body: "You'll be alerted 5 minutes before your lectures start!",
              icon: "icons/icon-192.png"
            });
          }
        });
      }
    });
  }

  /**
   * Fires a system notification if criteria met
   */
  function checkNotificationAlert(nextLecture, minutesRemaining) {
    if (!notificationsEnabled || notifiedForNextLecture) return;

    // Send only if exactly 5 minutes remaining
    if (minutesRemaining === 5) {
      notifiedForNextLecture = true;

      new Notification(`Next Class Starting Soon!`, {
        body: `${nextLecture.subject} starts in 5 minutes with ${nextLecture.faculty}.`,
        icon: "icons/icon-192.png",
        vibrate: [200, 100, 200]
      });

      // Clear lock in 60s once minute changes
      setTimeout(() => {
        notifiedForNextLecture = false;
      }, 60000);
    }
  }

  // ==========================================
  // 11. PWA Engine (Install, Service Worker)
  // ==========================================

  /**
   * Initialises PWA installer hooks
   */
  function initPWAPrompts() {
    window.addEventListener("beforeinstallprompt", (e) => {
      // Prevent automatic banner display
      e.preventDefault();
      deferredInstallPrompt = e;

      // Expose floating action button
      ELEMENTS.installBtn.classList.remove("hidden");
    });

    ELEMENTS.installBtn.addEventListener("click", async () => {
      if (!deferredInstallPrompt) {
        console.warn("Installation prompt is not available. Please ensure you are serving the page via HTTPS/localhost, your browser supports PWAs, and the app is not already installed.");
        alert("PWA installation is not available. This can happen if:\n1. The app is already installed.\n2. You are using the 'file://' protocol directly.\n3. Your browser/mode (like incognito) does not support installation.");
        return;
      }

      try {
        // Trigger the browser's install prompt
        await deferredInstallPrompt.prompt();

        // Wait for the user to respond to the prompt
        const { outcome } = await deferredInstallPrompt.userChoice;
        console.log(`User installation choice: ${outcome}`);

        if (outcome === "accepted") {
          ELEMENTS.installBtn.classList.add("hidden");
          deferredInstallPrompt = null;
        }
      } catch (err) {
        console.error("PWA Installation prompt failed:", err);
        alert("Failed to open install dialog: " + err.message);
      }
    });

    window.addEventListener("appinstalled", () => {
      ELEMENTS.installBtn.classList.add("hidden");
      console.log("VGEC Timetable added to home screen.");
    });
  }

  /**
   * Registers offline Service Worker
   */
  function registerServiceWorker() {
    if (!("serviceWorker" in navigator)) return;

    window.addEventListener("load", () => {
      navigator.serviceWorker.register("service-worker.js")
        .then(reg => {
          console.log("Service Worker registered successfully with scope: ", reg.scope);

          // Check for app updates
          reg.addEventListener("updatefound", () => {
            const newWorker = reg.installing;
            newWorker.addEventListener("statechange", () => {
              if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
                // Asset update discovered
                if (confirm("New update available! Refresh to load the latest timetable?")) {
                  window.location.reload();
                }
              }
            });
          });
        })
        .catch(err => {
          console.error("Service Worker registration failed: ", err);
        });
    });
  }

  /**
   * Monitor online/offline states
   */
  function initNetworkEvents() {
    const badge = ELEMENTS.networkStatus;

    window.addEventListener("online", () => {
      badge.className = "network-badge online";
      badge.querySelector(".status-text").textContent = "Online";
      trackLiveSchedule();
    });

    window.addEventListener("offline", () => {
      badge.className = "network-badge offline";
      badge.querySelector(".status-text").textContent = "Offline Mode";
    });

    // Initial check
    if (!navigator.onLine) {
      badge.className = "network-badge offline";
      badge.querySelector(".status-text").textContent = "Offline Mode";
    }
  }

  // ==========================================
  // 11.5. Announcements & Admin Engine
  // ==========================================

  /**
   * Initializes announcements from LocalStorage or default fallback
   */
  function initAnnouncements() {
    const cached = localStorage.getItem("vgec_announcements");
    if (cached) {
      try {
        announcements = JSON.parse(cached);
      } catch (err) {
        console.error("Failed to parse cached announcements:", err);
        announcements = [...DEFAULT_ANNOUNCEMENTS];
      }
    } else {
      announcements = [...DEFAULT_ANNOUNCEMENTS];
      localStorage.setItem("vgec_announcements", JSON.stringify(announcements));
    }
    renderAnnouncements();
  }

  /**
   * Renders active announcements in the PWA dashboard carousel
   */
  function renderAnnouncements() {
    const container = ELEMENTS.announcementsContainer;
    container.innerHTML = "";

    const todayStr = new Date().toISOString().split("T")[0];
    const todayTime = new Date(todayStr).getTime();

    // Filter announcements: only show active ones (date >= today)
    const activeAnnouncements = announcements.filter(ann => {
      const annTime = new Date(ann.date).getTime();
      return annTime >= todayTime;
    });

    // Sort active announcements by date ascending (closest first)
    activeAnnouncements.sort((a, b) => new Date(a.date) - new Date(b.date));

    if (activeAnnouncements.length === 0) {
      ELEMENTS.announcementsPanel.classList.add("hidden");
      ELEMENTS.announcementsCount.textContent = "0 Active";
      return;
    }

    ELEMENTS.announcementsPanel.classList.remove("hidden");
    ELEMENTS.announcementsCount.textContent = `${activeAnnouncements.length} Active`;

    // Render cards using template
    activeAnnouncements.forEach(ann => {
      const cardNode = ELEMENTS.announcementCardTemplate.content.cloneNode(true);
      const card = cardNode.querySelector(".announcement-card");

      // Setup card type borders
      card.classList.add(ann.type);

      // Title & Description
      cardNode.querySelector(".announcement-title-text").textContent = ann.title;
      cardNode.querySelector(".announcement-desc-text").textContent = ann.desc || "";

      // Type Badge Name
      let typeLabel = "Notice";
      if (ann.type === "exam-mid") typeLabel = "Mid-Term Exam";
      else if (ann.type === "exam-final") typeLabel = "Final Exam";
      else if (ann.type === "assignment") typeLabel = "Assignment";
      cardNode.querySelector(".announcement-type-badge").textContent = typeLabel;

      // Countdown Calculation
      const annDate = new Date(ann.date);
      const annTime = new Date(ann.date + 'T00:00:00').getTime();
      const currTime = new Date(todayStr + 'T00:00:00').getTime();

      const diffMs = annTime - currTime;
      const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

      let countdownText = "";
      if (diffDays === 0) {
        countdownText = "🔴 Today";
      } else if (diffDays === 1) {
        countdownText = "🟠 Tomorrow";
      } else {
        countdownText = `⏳ In ${diffDays} days`;
      }
      cardNode.querySelector(".announcement-countdown").textContent = countdownText;

      // Footer date display
      const formattedDate = annDate.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric"
      });
      cardNode.querySelector(".announcement-date").textContent = `📅 ${formattedDate}`;

      container.appendChild(cardNode);
    });
  }

  /**
   * Renders all announcements (including expired ones) in the Admin list view
   */
  function renderAdminAnnouncementsList() {
    const listContainer = ELEMENTS.adminAnnouncementsList;
    listContainer.innerHTML = "";

    if (announcements.length === 0) {
      listContainer.innerHTML = `<p class="modal-desc" style="text-align:center;">No announcements registered.</p>`;
      return;
    }

    // Sort announcements by date (closest/past to future)
    const sorted = [...announcements].sort((a, b) => new Date(a.date) - new Date(b.date));

    sorted.forEach(ann => {
      const item = document.createElement("div");
      item.className = "admin-list-item";

      const formattedDate = new Date(ann.date).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short"
      });

      item.innerHTML = `
        <div class="admin-item-title-box">
          <span class="admin-item-title">${ann.title}</span>
          <span class="admin-item-date">(${formattedDate})</span>
        </div>
        <button class="delete-btn" data-id="${ann.id}" title="Delete Announcement">🗑</button>
      `;

      // Attach delete click
      item.querySelector(".delete-btn").addEventListener("click", (e) => {
        const id = e.target.getAttribute("data-id");
        deleteAnnouncement(id);
      });

      listContainer.appendChild(item);
    });
  }

  /**
   * Adds a new announcement to the local store
   */
  function handleAddAnnouncement() {
    const type = ELEMENTS.announcementType.value;
    const date = ELEMENTS.announcementDate.value;
    const title = ELEMENTS.announcementTitle.value.trim();
    const desc = ELEMENTS.announcementDesc.value.trim();

    if (!title || !date) {
      alert("Please fill in both the Title and the Date fields.");
      return;
    }

    const newAnn = {
      id: "ann-" + Date.now().toString(),
      type,
      title,
      date,
      desc
    };

    announcements.push(newAnn);
    saveAnnouncements();

    // Reset Form fields
    ELEMENTS.announcementTitle.value = "";
    ELEMENTS.announcementDesc.value = "";
    ELEMENTS.announcementDate.value = "";
  }

  /**
   * Deletes an announcement by ID
   */
  function deleteAnnouncement(id) {
    if (confirm("Are you sure you want to delete this announcement?")) {
      announcements = announcements.filter(ann => ann.id !== id);
      saveAnnouncements();
    }
  }

  /**
   * Save announcements array to LocalStorage and refresh renders
   */
  function saveAnnouncements() {
    localStorage.setItem("vgec_announcements", JSON.stringify(announcements));
    renderAnnouncements();
    renderAdminAnnouncementsList();
  }

  // ==========================================
  // Admin Overlay Control Functions
  // ==========================================

  function openAdminModal() {
    ELEMENTS.adminModal.classList.remove("hidden");
    if (isAdminLoggedIn) {
      ELEMENTS.adminLoginView.classList.add("hidden");
      ELEMENTS.adminDashboardView.classList.remove("hidden");
      renderAdminAnnouncementsList();
    } else {
      ELEMENTS.adminLoginView.classList.remove("hidden");
      ELEMENTS.adminDashboardView.classList.add("hidden");
      ELEMENTS.adminPassword.value = "";
      ELEMENTS.adminPassword.focus();
    }
  }

  function closeAdminModal() {
    ELEMENTS.adminModal.classList.add("hidden");
  }

  function adminLogin(password) {
    if (password === "adminvgec") {
      isAdminLoggedIn = true;
      ELEMENTS.adminLoginView.classList.add("hidden");
      ELEMENTS.adminDashboardView.classList.remove("hidden");
      renderAdminAnnouncementsList();
    } else {
      alert("Incorrect password! Use the official administrator credentials.");
      ELEMENTS.adminPassword.value = "";
      ELEMENTS.adminPassword.focus();
    }
  }

  function adminLogout() {
    isAdminLoggedIn = false;
    ELEMENTS.adminLoginView.classList.remove("hidden");
    ELEMENTS.adminDashboardView.classList.add("hidden");
    ELEMENTS.adminPassword.value = "";
  }

  /**
   * Export announcements to a downloadable JSON file
   */
  function exportAnnouncements() {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(announcements, null, 2));
    const dlAnchorElem = document.createElement('a');
    dlAnchorElem.setAttribute("href", dataStr);
    dlAnchorElem.setAttribute("download", "vgec_announcements.json");
    dlAnchorElem.click();
  }

  /**
   * Import announcements from an uploaded JSON file
   */
  function importAnnouncements(file) {
    const reader = new FileReader();
    reader.onload = function (e) {
      try {
        const imported = JSON.parse(e.target.result);
        if (Array.isArray(imported)) {
          // Quick validation checks on items
          const isValid = imported.every(item => item.id && item.type && item.title && item.date);
          if (isValid) {
            announcements = imported;
            saveAnnouncements();
            alert("Announcements configuration imported successfully!");
          } else {
            alert("Error: File contains invalid structure. Make sure all items have an id, type, title, and date.");
          }
        } else {
          alert("Error: Imported file must contain a JSON array of announcements.");
        }
      } catch (err) {
        alert("Failed to parse JSON file: " + err.message);
      }
    };
    reader.readAsText(file);
  }

  // ==========================================
  // 12. Clock & Date Tick Engine
  // ==========================================

  function updateClockDisplay() {
    const now = new Date();

    // Formatting: clock - HH:MM:SS AM/PM
    ELEMENTS.clock.textContent = now.toLocaleTimeString("en-IN", {
      hour12: true,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });

    // Date representation
    ELEMENTS.currentDate.textContent = now.toLocaleDateString("en-IN", {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  // ==========================================
  // 13. Event Listeners & Bootstrapping
  // ==========================================

  function setupEventListeners() {
    // Theme Switch
    ELEMENTS.themeBtn.addEventListener("click", toggleTheme);

    // Keyboard Shortcuts
    document.addEventListener("keydown", (e) => {
      // Toggle theme with 'T' (case-insensitive)
      if (e.key.toLowerCase() === 't' && document.activeElement !== ELEMENTS.searchInput) {
        toggleTheme();
      }
    });

    // View Toggles
    ELEMENTS.btnDailyView.addEventListener("click", () => {
      activeView = "daily";
      updateViewMode();
    });

    ELEMENTS.btnWeeklyView.addEventListener("click", () => {
      activeView = "weekly";
      updateViewMode();
    });

    // Search Trigger
    ELEMENTS.searchInput.addEventListener("input", filterLectures);

    // Refresh on screen focus
    document.addEventListener("visibilitychange", () => {
      if (!document.hidden) {
        updateClockDisplay();
        trackLiveSchedule();
        updateTomorrowPreview();
        renderAnnouncements();
      }
    });

    // Admin Panel Listeners
    ELEMENTS.adminBtn.addEventListener("click", openAdminModal);
    ELEMENTS.modalCloseBtn.addEventListener("click", closeAdminModal);
    ELEMENTS.loginForm.addEventListener("submit", (e) => {
      e.preventDefault();
      adminLogin(ELEMENTS.adminPassword.value);
    });
    ELEMENTS.btnAdminLogout.addEventListener("click", adminLogout);
    ELEMENTS.announcementForm.addEventListener("submit", (e) => {
      e.preventDefault();
      handleAddAnnouncement();
    });
    ELEMENTS.btnExportAnnouncements.addEventListener("click", exportAnnouncements);
    ELEMENTS.btnImportAnnouncements.addEventListener("click", () => ELEMENTS.importFile.click());
    ELEMENTS.importFile.addEventListener("change", (e) => {
      if (e.target.files.length) {
        importAnnouncements(e.target.files[0]);
      }
    });

    // Click outside modal to close
    window.addEventListener("click", (e) => {
      if (e.target === ELEMENTS.adminModal) {
        closeAdminModal();
      }
    });
  }

  /**
   * Main setup sequence
   */
  function initializeApp() {
    // 1. Sync Theme System
    initTheme();

    // 2. Render base layout
    buildTimetable();

    // 3. Render initial status info
    updateClockDisplay();
    trackLiveSchedule();
    updateTomorrowPreview();

    // 3.5. Load Announcements
    initAnnouncements();

    // 4. Setup listeners
    setupEventListeners();
    initRippleEffect();
    initNotifications();
    initNetworkEvents();
    initPWAPrompts();

    // 5. Fire Service Worker
    registerServiceWorker();

    // 6. Timers
    // Refresh clock every second for ticking effect
    setInterval(() => {
      updateClockDisplay();
      trackLiveSchedule();
    }, 1000);

    // Refresh tomorrow's view every hour
    setInterval(updateTomorrowPreview, 3600000);

    // Clear loaders
    setTimeout(() => {
      ELEMENTS.loadingScreen.classList.add("fade-out");
    }, 450);

    console.log(`VGEC Timetable PWA v${APP_VERSION} initialized successfully.`);
  }

  // Start app!
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initializeApp);
  } else {
    initializeApp();
  }

})();
