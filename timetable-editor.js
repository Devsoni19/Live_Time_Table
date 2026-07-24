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
    ELEMENTS.btnAddLecture.addEventListener("click", openAddModal);

    /* Cancel */

    ELEMENTS.btnCancel.addEventListener("click", closeModal);

    // Save

    ELEMENTS.btnSave.addEventListener("click", saveLecture);

    //delete

    ELEMENTS.btnDelete.addEventListener("click", deleteLecture);

}

/* ============================================================
               Open Add Modal
============================================================ */

function openAddModal() {

    isEditing = false;

    currentLecture = null;

    ELEMENTS.modalTitle.textContent =
        "Add Lecture";

    clearForm();

    ELEMENTS.btnDelete.style.display = "none";

    ELEMENTS.modal.classList.remove("hidden");

}


/* ============================================================
   Open Edit Modal
============================================================ */

function openEditModal(lecture) {

    isEditing = true;

    currentLecture = lecture.id;

    ELEMENTS.modalTitle.textContent =
        "Edit Lecture";

    ELEMENTS.subject.value =
        lecture.subject;

    ELEMENTS.faculty.value =
        lecture.faculty;

    ELEMENTS.start.value =
        lecture.start;

    ELEMENTS.end.value =
        lecture.end;

    ELEMENTS.type.value =
        lecture.type;

    ELEMENTS.btnDelete.style.display =
        "inline-flex";

    ELEMENTS.modal.classList.remove("hidden");

}


/* ============================================================
   Close Modal
============================================================ */

function closeModal() {

    ELEMENTS.modal.classList.add("hidden");

    currentLecture = null;

    isEditing = false;

}


/* ============================================================
   Clear Form
============================================================ */

function clearForm() {

    ELEMENTS.subject.value = "";

    ELEMENTS.faculty.value = "";

    ELEMENTS.start.value = "";

    ELEMENTS.end.value = "";

    ELEMENTS.type.selectedIndex = 0;

}

/* ============================================================
   Get Current Lecture
============================================================ */

function getCurrentLecture() {

    return timetable[currentDay]?.find(

        lecture => lecture.id === currentLecture

    );

}

const lecture = getCurrentLecture();

/* ============================================================
   Validate Form
============================================================ */

function validateForm() {

    if (!ELEMENTS.subject.value.trim()) {

        alert("Please enter subject.");

        ELEMENTS.subject.focus();

        return false;

    }

    if (!ELEMENTS.faculty.value.trim()) {

        alert("Please enter faculty.");

        ELEMENTS.faculty.focus();

        return false;

    }

    if (!ELEMENTS.start.value) {

        alert("Please select start time.");

        ELEMENTS.start.focus();

        return false;

    }

    if (!ELEMENTS.end.value) {

        alert("Please select end time.");

        ELEMENTS.end.focus();

        return false;

    }

    if (ELEMENTS.start.value >= ELEMENTS.end.value) {

        alert("End time must be after Start time.");

        ELEMENTS.end.focus();

        return false;

    }

    return true;

}

/* ============================================================
   Get Form Data
============================================================ */

function getFormData() {

    return {

        subject: ELEMENTS.subject.value.trim(),

        faculty: ELEMENTS.faculty.value.trim(),

        start: ELEMENTS.start.value,

        end: ELEMENTS.end.value,

        type: ELEMENTS.type.value

    };

}

/* ============================================================
   Save Lecture
============================================================ */

/* ============================================================
   Save Lecture
============================================================ */

async function saveLecture() {

    if (!validateForm()) {

        return;

    }

    const lectureData = {

        ...getFormData(),

        order: isEditing
            ? getCurrentLecture().order
            : (timetable[currentDay]?.length || 0) + 1

    };

    try {

        if (isEditing) {

            await timetableService.updateLecture(

                currentDay,

                currentLecture,

                lectureData

            );

        }

        else {

            await timetableService.addLecture(

                currentDay,

                lectureData

            );

        }

        closeModal();

    }

    catch (error) {

        console.error(error);

        alert("Failed to save lecture.");

    }

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

    console.log("Starting realtime listener...");


    unsubscribe = timetableService.listen(

        (day, lectures) => {

            console.log("Realtime Update:", day, lectures);

            timetable[day] = lectures;

            if (day === currentDay) {

                console.log("Rendering Current Day");

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

    const lectures = [...(timetable[currentDay] || [])];

    if (search) {

        lectures = lectures.filter(l => {

            const subject = (l.subject || "").toLowerCase();

            const faculty = (l.faculty || "").toLowerCase();

            return (

                subject.includes(search) ||

                faculty.includes(search)

            );

        });


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

    tr.dataset.id = lecture.id;
    tr.dataset.day = currentDay;

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
                    class="glass-btn edit-btn">

                    ✏

                </button>

                <button
                    class="glass-btn danger-btn delete-btn">

                    🗑

                </button>

            </div>

        </td>

    `;

    tr.querySelector(".edit-btn")
        .addEventListener("click", () => {

            openEditModal(lecture);

        });

    tr.querySelector(".delete-btn")
        .addEventListener("click", () => {

            currentLecture = lecture.id;

            openEditModal(lecture);


        });

    return tr;

}

async function deleteLecture() {

    if (!currentLecture) {

        return;

    }

    if (!confirm("Delete this lecture?")) {

        return;

    }

    try {

        await timetableService.deleteLecture(

            currentDay,

            currentLecture

        );

        closeModal();

    }

    catch (error) {

        console.error(error);

        alert("Unable to delete lecture.");

    }

}

/* ============================================================
   TODO (Part 2.3)
============================================================ */

/*
✓ Save Lecture
✓ Update Lecture
✓ Delete Lecture
✓ Validation
✓ Firestore CRUD
*/