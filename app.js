/* ============================================================
   VGEC Timetable
   app.js
   Part 1
   ============================================================ */

/* ------------------------------------------------------------
   DOM Elements
-------------------------------------------------------------*/

const timetableContainer = document.getElementById("timetableContainer");
const clockElement = document.getElementById("clock");
const todayElement = document.getElementById("today");
const liveTitle = document.getElementById("liveTitle");
const liveSubtitle = document.getElementById("liveSubtitle");
const progressBar = document.getElementById("progressBar");
const progressPercent = document.getElementById("progressPercent");
const themeBtn = document.getElementById("themeBtn");
const installBtn = document.getElementById("installBtn");

/* ------------------------------------------------------------
   Days
-------------------------------------------------------------*/

const DAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday"
];

/* ------------------------------------------------------------
   Timetable (O4 Batch)
   Update if timetable changes.
-------------------------------------------------------------*/

const timetable = {

  Monday: [

    {
      subject: "PDS",
      faculty: "DS",
      room: "F-203",
      start: "09:00",
      end: "10:00"
    },

    {
      subject: "CN",
      faculty: "HP",
      room: "F-203",
      start: "10:00",
      end: "11:00"
    },

    {
      subject: "AJP",
      faculty: "DK",
      room: "F-203",
      start: "11:30",
      end: "12:30"
    }

  ],

  Tuesday: [

  ],

  Wednesday: [

  ],

  Thursday: [

  ],

  Friday: [

    {
      subject: "ADC",
      faculty: "UNF",
      room: "F-203",
      start: "11:30",
      end: "12:30"
    },

    {
      subject: "ADC LAB",
      faculty: "VF",
      room: "F-104",
      start: "13:15",
      end: "15:15",
      lab: true
    }

  ]

};

/* ------------------------------------------------------------
   Theme
-------------------------------------------------------------*/

function loadTheme() {

  const theme = localStorage.getItem("theme") || "light";

  if (theme === "dark") {

    document.body.classList.add("dark");
    themeBtn.textContent = "☀️";

  } else {

    document.body.classList.remove("dark");
    themeBtn.textContent = "🌙";

  }

}

function toggleTheme() {

  document.body.classList.toggle("dark");

  const dark = document.body.classList.contains("dark");

  localStorage.setItem(
    "theme",
    dark ? "dark" : "light"
  );

  themeBtn.textContent = dark ? "☀️" : "🌙";

}

themeBtn.addEventListener("click", toggleTheme);

/* ------------------------------------------------------------
   Live Clock
-------------------------------------------------------------*/

function updateClock() {

  const now = new Date();

  clockElement.textContent =
    now.toLocaleTimeString("en-IN", {

      hour12: true

    });

  todayElement.textContent =
    DAYS[now.getDay()];

}

setInterval(updateClock, 1000);

/* ------------------------------------------------------------
   Time Utilities
-------------------------------------------------------------*/

function toMinutes(time) {

  const [h, m] = time.split(":").map(Number);

  return h * 60 + m;

}

function currentMinutes() {

  const now = new Date();

  return now.getHours() * 60 + now.getMinutes();

}

function percent(start, end, now) {

  return ((now - start) / (end - start)) * 100;

}

/* ------------------------------------------------------------
   Format Helpers
-------------------------------------------------------------*/

function formatTime(str) {

  const [h, m] = str.split(":").map(Number);

  const d = new Date();

  d.setHours(h);
  d.setMinutes(m);

  return d.toLocaleTimeString("en-IN", {

    hour: "numeric",
    minute: "2-digit"

  });

}

/* ------------------------------------------------------------
   Initialization
-------------------------------------------------------------*/

loadTheme();
updateClock();

/* ============================================================
   app.js
   Part 2
   Timetable Rendering + Lecture Detection
============================================================ */

/* ------------------------------------------------------------
   Templates
-------------------------------------------------------------*/

const dayTemplate = document.getElementById("dayTemplate");
const lectureTemplate = document.getElementById("lectureTemplate");

/* ------------------------------------------------------------
   Render Timetable
-------------------------------------------------------------*/

function renderTimetable() {

  timetableContainer.innerHTML = "";

  Object.keys(timetable).forEach(day => {

    const dayNode = dayTemplate.content.cloneNode(true);

    dayNode.querySelector(".day-title").textContent = day;

    const lectureList =
      dayNode.querySelector(".lecture-list");

    timetable[day].forEach(lecture => {

      const node =
        lectureTemplate.content.cloneNode(true);

      const article =
        node.querySelector(".lecture");

      node.querySelector(".subject").textContent =
        lecture.subject;

      node.querySelector(".time").textContent =
        `${formatTime(lecture.start)} - ${formatTime(lecture.end)}`;

      node.querySelector(".faculty").textContent =
        `👨‍🏫 ${lecture.faculty}`;

      node.querySelector(".room").textContent =
        `📍 ${lecture.room}`;

      const badge =
        node.querySelector(".badge");

      badge.textContent =
        lecture.lab ? "LAB" : "Lecture";

      article.classList.add(
        lecture.subject
          .toLowerCase()
          .replace(/\s/g, "")
      );

      lecture.element = article;

      lectureList.appendChild(node);

    });

    timetableContainer.appendChild(dayNode);

  });

}

/* ------------------------------------------------------------
   Find Current Lecture
-------------------------------------------------------------*/

function currentLecture() {

  const day =
    DAYS[new Date().getDay()];

  const lectures =
    timetable[day];

  if (!lectures)
    return null;

  const now =
    currentMinutes();

  for (const lecture of lectures) {

    const start =
      toMinutes(lecture.start);

    const end =
      toMinutes(lecture.end);

    if (now >= start && now < end) {

      return lecture;

    }

  }

  return null;

}

/* ------------------------------------------------------------
   Next Lecture
-------------------------------------------------------------*/

function nextLecture() {

  const day =
    DAYS[new Date().getDay()];

  const lectures =
    timetable[day];

  if (!lectures)
    return null;

  const now =
    currentMinutes();

  for (const lecture of lectures) {

    if (toMinutes(lecture.start) > now) {

      return lecture;

    }

  }

  return null;

}

/* ------------------------------------------------------------
   Previous Lecture
-------------------------------------------------------------*/

function previousLecture() {

  const day =
    DAYS[new Date().getDay()];

  const lectures =
    timetable[day];

  if (!lectures)
    return null;

  const now =
    currentMinutes();

  let previous = null;

  lectures.forEach(lecture => {

    if (toMinutes(lecture.end) <= now) {

      previous = lecture;

    }

  });

  return previous;

}

/* ------------------------------------------------------------
   Progress
-------------------------------------------------------------*/

function updateProgress(lecture) {

  if (!lecture) {

    progressBar.style.width = "0%";

    progressPercent.textContent = "0%";

    return;

  }

  const now =
    currentMinutes();

  const start =
    toMinutes(lecture.start);

  const end =
    toMinutes(lecture.end);

  let p =
    percent(start, end, now);

  p =
    Math.min(
      100,
      Math.max(0, p)
    );

  progressBar.style.width =
    `${p}%`;

  progressPercent.textContent =
    `${Math.round(p)}%`;

}

/* ------------------------------------------------------------
   Break Detection
-------------------------------------------------------------*/

function breakMessage() {

  const day =
    DAYS[new Date().getDay()];

  const lectures =
    timetable[day];

  if (!lectures)
    return null;

  const now =
    currentMinutes();

  for (let i = 0; i < lectures.length - 1; i++) {

    const end =
      toMinutes(lectures[i].end);

    const next =
      toMinutes(lectures[i + 1].start);

    if (now >= end && now < next) {

      return {

        current: lectures[i],

        next: lectures[i + 1]

      };

    }

  }

  return null;

}

/* ------------------------------------------------------------
   Weekend Detection
-------------------------------------------------------------*/

function isWeekend() {

  const d =
    new Date().getDay();

  return d === 0 || d === 6;

}

/* ------------------------------------------------------------
   College Over
-------------------------------------------------------------*/

function collegeOver() {

  const day =
    DAYS[new Date().getDay()];

  const lectures =
    timetable[day];

  if (!lectures || lectures.length === 0)
    return true;

  const last =
    lectures[lectures.length - 1];

  return currentMinutes() >
    toMinutes(last.end);

}

/* ------------------------------------------------------------
   Highlight Cards
-------------------------------------------------------------*/

function updateHighlights() {

  Object.values(timetable)
    .flat()
    .forEach(l => {

      if (l.element) {

        l.element.classList.remove(
          "current",
          "next",
          "previous"
        );

      }

    });

  const current =
    currentLecture();

  const next =
    nextLecture();

  const previous =
    previousLecture();

  if (current && current.element)
    current.element.classList.add("current");

  if (next && next.element)
    next.element.classList.add("next");

  if (previous && previous.element)
    previous.element.classList.add("previous");

}

renderTimetable();

/* ============================================================
   app.js
   Part 3
   App Controller + PWA + Service Worker
============================================================ */

/* ------------------------------------------------------------
   Live Status Controller
-------------------------------------------------------------*/

function updateStatus() {

  // Weekend
  if (isWeekend()) {

    liveTitle.textContent = "🎉 Weekend";

    liveSubtitle.textContent =
      "No lectures scheduled.";

    progressBar.style.width = "0%";
    progressPercent.textContent = "0%";

    updateHighlights();

    return;
  }

  // College Over
  if (collegeOver()) {

    liveTitle.textContent =
      "🏫 College Over";

    liveSubtitle.textContent =
      "Have a great day!";

    progressBar.style.width = "100%";
    progressPercent.textContent = "100%";

    updateHighlights();

    return;
  }

  // Current Lecture
  const current = currentLecture();

  if (current) {

    liveTitle.textContent =
      `📚 ${current.subject}`;

    liveSubtitle.textContent =
      `${current.faculty} • ${current.room}`;

    updateProgress(current);

    updateHighlights();

    return;
  }

  // Break
  const br = breakMessage();

  if (br) {

    liveTitle.textContent = "☕ Break Time";

    liveSubtitle.textContent =
      `Next: ${br.next.subject} (${formatTime(br.next.start)})`;

    progressBar.style.width = "0%";
    progressPercent.textContent = "Break";

    updateHighlights();

    return;
  }

  // Before First Lecture
  const today = DAYS[new Date().getDay()];
  const lectures = timetable[today];

  if (lectures && lectures.length) {

    liveTitle.textContent =
      "⏰ Waiting for First Lecture";

    liveSubtitle.textContent =
      `${lectures[0].subject} starts at ${formatTime(lectures[0].start)}`;

  } else {

    liveTitle.textContent =
      "No Lectures Today";

    liveSubtitle.textContent =
      "Enjoy your day.";

  }

}

/* ------------------------------------------------------------
   Auto Refresh
-------------------------------------------------------------*/

function refreshApp() {

  updateClock();

  updateStatus();

}

refreshApp();

setInterval(refreshApp, 1000);

/* ------------------------------------------------------------
   PWA Install Prompt
-------------------------------------------------------------*/

let deferredPrompt = null;

window.addEventListener("beforeinstallprompt", (e) => {

  e.preventDefault();

  deferredPrompt = e;

  installBtn.hidden = false;

});

installBtn.addEventListener("click", async () => {

  if (!deferredPrompt) return;

  deferredPrompt.prompt();

  const result =
    await deferredPrompt.userChoice;

  if (result.outcome === "accepted") {

    console.log("PWA Installed");

  }

  installBtn.hidden = true;

  deferredPrompt = null;

});

/* ------------------------------------------------------------
   App Installed
-------------------------------------------------------------*/

window.addEventListener("appinstalled", () => {

  installBtn.hidden = true;

  console.log("Installed Successfully");

});

/* ------------------------------------------------------------
   Register Service Worker
-------------------------------------------------------------*/

if ("serviceWorker" in navigator) {

  window.addEventListener("load", () => {

    navigator.serviceWorker
      .register("service-worker.js")
      .then(() => {

        console.log("Service Worker Registered");

      })
      .catch((err) => {

        console.error(err);

      });

  });

}

/* ------------------------------------------------------------
   Minute Refresh
-------------------------------------------------------------*/

setInterval(() => {

  renderTimetable();

  updateHighlights();

}, 60000);

/* ------------------------------------------------------------
   Visibility Refresh
-------------------------------------------------------------*/

document.addEventListener("visibilitychange", () => {

  if (!document.hidden) {

    refreshApp();

  }

});

/* ------------------------------------------------------------
   Keyboard Shortcuts
-------------------------------------------------------------*/

document.addEventListener("keydown", (e) => {

  // T = Toggle Theme
  if (e.key.toLowerCase() === "t") {

    toggleTheme();

  }

  // R = Refresh
  if (e.key.toLowerCase() === "r") {

    refreshApp();

  }

});

/* ------------------------------------------------------------
   Scroll Current Lecture Into View
-------------------------------------------------------------*/

function scrollCurrentLecture() {

  const current = document.querySelector(".current");

  if (!current) return;

  current.scrollIntoView({

    behavior: "smooth",

    block: "center"

  });

}

setTimeout(scrollCurrentLecture, 800);

/* ------------------------------------------------------------
   Greeting
-------------------------------------------------------------*/

function greeting() {

  const h = new Date().getHours();

  if (h < 12) return "☀️ Good Morning";

  if (h < 17) return "🌤 Good Afternoon";

  return "🌙 Good Evening";

}

console.log(greeting());

/* ------------------------------------------------------------
   Online / Offline Detection
-------------------------------------------------------------*/

window.addEventListener("offline", () => {

  liveSubtitle.textContent =
    "⚠ Offline Mode Enabled";

});

window.addEventListener("online", () => {

  refreshApp();

});

/* ------------------------------------------------------------
   Version
-------------------------------------------------------------*/

const APP_VERSION = "1.0.0";

console.log(`VGEC Timetable v${APP_VERSION}`);

/* ------------------------------------------------------------
   End
-------------------------------------------------------------*/