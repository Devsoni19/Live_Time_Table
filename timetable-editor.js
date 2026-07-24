import {
    auth,
    onAuthStateChanged,
    signOut
} from "./firebase.js";

import timetableService from "./timetableService.js";

const ADMIN_EMAIL = "sdev.19072003@gmail.com";

console.log("Editor JS Loaded");

onAuthStateChanged(auth, async (user) => {

    console.log("Auth callback fired");

    if (!user) {

        window.location.replace("index.html");

        return;

    }

    if (
        user.email.toLowerCase().trim() !==
        ADMIN_EMAIL.toLowerCase().trim()
    ) {

        await signOut(auth);

        window.location.replace("index.html");

        return;

    }

    console.log("✅ Admin Verified");

    await initializeEditor();

});

/* ============================================================
   DOM Elements
============================================================ */

const ELEMENTS = {

    btnBack: document.getElementById("btnBack"),

    btnAddLecture: document.getElementById("btnAddLecture"),

    search: document.getElementById("searchLecture"),

    tableBody: document.getElementById("lectureTableBody"),

    dayTabs: document.querySelectorAll(".day-tab"),

    modal: document.getElementById("lectureModal"),

    modalTitle: document.getElementById("modalTitle"),

    subject: document.getElementById("subject"),

    faculty: document.getElementById("faculty"),

    start: document.getElementById("start"),

    end: document.getElementById("end"),

    type: document.getElementById("type"),

    btnSave: document.getElementById("btnSave"),

    btnDelete: document.getElementById("btnDelete"),

    btnCancel: document.getElementById("btnCancel")

};

/* ============================================================
   Variables
============================================================ */

let timetable = {};

let currentDay = "Monday";

let unsubscribe = null;

let currentLecture = null;

let isEditing = false;


/* ============================================================
   Initialize Editor
============================================================ */

async function initializeEditor() {

    console.log("Initializing editor...");

    setupEventListeners();

    await loadTimetable();

    startRealtimeListener();

}


/* ============================================================
   Event Listeners
============================================================ */

function setupEventListeners() {

    ELEMENTS.btnBack.addEventListener("click", () => {

        window.location.href = "index.html";

    });

    ELEMENTS.search.addEventListener("input", renderCurrentDay);

    ELEMENTS.dayTabs.forEach(tab => {

        tab.addEventListener("click", () => {

            ELEMENTS.dayTabs.forEach(t =>
                t.classList.remove("active")
            );

            tab.classList.add("active");

            currentDay = tab.dataset.day;

            renderCurrentDay();

        });

    });

}

/* ============================================================
   Load Timetable
============================================================ */

async function loadTimetable() {

    try {

        timetable =
            await timetableService.getAllTimetable();

        console.log(timetable);

        renderCurrentDay();

    }

    catch (err) {

        console.error(err);

        alert("Unable to load timetable.");

    }

}

/* ============================================================
   Live Firestore Listener
============================================================ */

function startRealtimeListener() {

    unsubscribe = timetableService.listen(

        (day, lectures) => {

            timetable[day] = lectures;

            if (day === currentDay) {

                renderCurrentDay();

            }

        }

    );

}

/* ============================================================
   Render Table
============================================================ */

function renderCurrentDay() {

    ELEMENTS.tableBody.innerHTML = "";

    const search =
        ELEMENTS.search.value
            .trim()
            .toLowerCase();

    let lectures =
        timetable[currentDay] || [];

    if (search) {

        lectures = lectures.filter(l =>

            l.subject.toLowerCase().includes(search) ||

            l.faculty.toLowerCase().includes(search)

        );

    }

    if (!lectures.length) {

        ELEMENTS.tableBody.innerHTML = `

        <tr>

            <td colspan="7">

                No lectures found.

            </td>

        </tr>

        `;

        return;

    }

    lectures.forEach((lecture, index) => {

        ELEMENTS.tableBody.appendChild(

            createLectureRow(

                lecture,

                index + 1

            )

        );

    });

}

function createLectureRow(lecture, index) {

    const tr = document.createElement("tr");

    tr.innerHTML = `

        <td>${index}</td>

        <td>${lecture.subject}</td>

        <td>${lecture.faculty}</td>

        <td>${lecture.start}</td>

        <td>${lecture.end}</td>

        <td>${lecture.type}</td>

        <td>

            <div class="action-buttons">

                <button
                    class="glass-btn edit-btn"
                    data-id="${lecture.id}">

                    ✏

                </button>

                <button
                    class="glass-btn danger-btn delete-btn"
                    data-id="${lecture.id}">

                    🗑

                </button>

            </div>

        </td>

    `;

    return tr;

}