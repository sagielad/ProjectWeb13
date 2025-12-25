// Run the code only after the HTML document is fully loaded
document.addEventListener("DOMContentLoaded", function () {
   
    // ==================== 1. LOGIN CHECK ====================

    // Get the logged-in user name from localStorage
    var loggedUser = localStorage.getItem("loggedUser");

    // If no user is logged in → redirect to login page and stop execution
    if (!loggedUser) {
        window.location.href = "login.html";
        return;
    }

    // Get header elements to display teacher info
    var teacherNameSpan = document.getElementById("teacher-name");
    var teacherSubjectSpan = document.getElementById("teacher-subject");

    // Insert teacher name and subject into the header
    if (teacherNameSpan) teacherNameSpan.textContent = " " + loggedUser;
    if (teacherSubjectSpan) teacherSubjectSpan.textContent = "Mathematic";


    // ==================== 2. STUDENTS SECTION ====================

    // Key name used in localStorage to store students list
    var students_key = "students_db";

    // Array holding student names
    var students = [];

    // DOM references for students list and search input
    var studentsListEl = document.getElementById("students-list");
    var studentSearchInput = document.getElementById("student-search");

    // Load students from localStorage or initialize empty list
    function initStudentsData() {
        var stored;
        try {
            // Try to parse stored JSON string into array
            stored = JSON.parse(localStorage.getItem("students_db") || "null");
        } catch (e) {
            stored = null;
        }

        // If valid data exists → use it
        if (stored && Array.isArray(stored) && stored.length > 0) {
            students = stored;
        } 
        // Otherwise initialize empty storage
        else {
            localStorage.setItem("students_db", JSON.stringify(students));
        }
    }

    // Clear students list UI before re-rendering
    function clearStudentList() {
        if (!studentsListEl) return;
        studentsListEl.innerHTML = "";
    }

    // Filter students by search text (case-insensitive)
    function filterStudents(searchText) {
        var lower = String(searchText || "").toLowerCase();
        var out = [];

        for (var i = 0; i < students.length; i++) {
            var name = students[i];
            if (String(name).toLowerCase().indexOf(lower) !== -1) {
                out.push(name);
            }
        }
        return out;
    }

    // Connect "Add Student" button to the add function
    function initAddStudentForm() {
        const btn = document.getElementById("add-student-btn"); 
        if (!btn) return;

        btn.addEventListener("click", addStudentFromForm);
    }

    // Read add-student form, save data, and update UI
    function addStudentFromForm() {
        const nameEl = document.getElementById("new-student-name");  
        const emailEl = document.getElementById("new-student-email"); 
        const phoneEl = document.getElementById("new-student-phone"); 
        const gradeEl = document.getElementById("new-student-grade"); 

        // Read and trim input values
        const name = (nameEl?.value || "").trim();
        const email = (emailEl?.value || "").trim();
        const phone = (phoneEl?.value || "").trim();
        const grade = (gradeEl?.value || "").trim();

        // Do nothing if name is empty
        if (!name) return;

        // Add student name only if it does not already exist
        if (!studentExists(name)) {
            students.push(name);
            writeJson(students_key, students);
        }

        // Save full student profile separately
        saveStudentProfile(name, { name, email, phone, grade });

        // Re-render students list using current search filter
        renderStudents(studentSearchInput.value || "");

        // Clear input fields
        if (nameEl) nameEl.value = "";
        if (emailEl) emailEl.value = "";
        if (phoneEl) phoneEl.value = "";
        if (gradeEl) gradeEl.value = "";
    }

    // Check if student already exists (case-insensitive)
    function studentExists(name) {
        const n = name.toLowerCase();

        return students.some(function (s) {
            return String(s).toLowerCase() === n;
        });
    }

    // Save full student profile under unique key
    function saveStudentProfile(name, profile) {
        localStorage.setItem("student_profile_" + name, JSON.stringify(profile));
    }

    // Safely read JSON from localStorage
    function readJson(key, fallback) {
        try {
            const v = JSON.parse(localStorage.getItem(key));
            return v ?? fallback;
        } catch (e) {
            return fallback;
        }
    }

    // Safely write JSON to localStorage
    function writeJson(key, value) {
        localStorage.setItem(key, JSON.stringify(value));
    }

    // Create clickable <li> element for a student
    function createStudentItem(name) {
        var li = document.createElement("li");
        li.textContent = name;
        li.classList.add("student-item");

        // On click: save selected student and go to student page
        li.addEventListener("click", function () {
            localStorage.setItem("selectedStudent", name);
            window.location.href = "student.html";
        });

        return li;
    }

    // Render students list based on filter text
    function renderStudents(filterText) {
        clearStudentList();
        if (!studentsListEl) return;

        var matchingStudents = filterStudents(filterText);

        for (var i = 0; i < matchingStudents.length; i++) {
            var li = createStudentItem(matchingStudents[i]);
            studentsListEl.appendChild(li);
        }
    }

    // Initialize students data and UI
    initStudentsData();
    renderStudents("");

    // Filter students list while typing
    if (studentSearchInput) {
        studentSearchInput.addEventListener("input", function () {
            renderStudents(studentSearchInput.value);
        });
    }

    initAddStudentForm();


    // ==================== 3. UPCOMING CLASSES ====================

    // Initialize upcoming lessons section
    initUpcomingLessons();

    function initUpcomingLessons() {
        renderUpcomingLessons();
    }

    // Safely parse JSON and ensure array result
    function safeJsonParse(text, fallback) {
        try {
            var x = JSON.parse(text);
            return Array.isArray(x) ? x : fallback;
        } catch (e) {
            return fallback;
        }
    }

    // Remove duplicate lessons based on unique fields
    function dedupeLessons(lessons) {
        var seen = {};
        var out = [];

        for (var i = 0; i < lessons.length; i++) {
            var l = lessons[i] || {};
            var key =
                String(l.student || "") + "|" +
                String(l.subject || "") + "|" +
                String(l.date || "") + "|" +
                String(l.time || "");

            if (seen[key]) continue;
            seen[key] = true;
            out.push(l);
        }

        return out;
    }

    // Collect lessons from all localStorage locations
    function getAllLessonsUnified() {
        var lessons = [];

        // 1) Global lessons list
        var globalLessons = safeJsonParse(localStorage.getItem("all_lessons"), []);
        for (var a = 0; a < globalLessons.length; a++) {
            lessons.push(globalLessons[a]);
        }

        // 2) Lessons per student (keys starting with "lessons_")
        for (var i = 0; i < localStorage.length; i++) {
            var key = localStorage.key(i);
            if (!key || key.indexOf("lessons_") !== 0) continue;

            var studentName = key.replace("lessons_", "");
            var studentLessons = safeJsonParse(localStorage.getItem(key), []);

            for (var j = 0; j < studentLessons.length; j++) {
                var lesson = studentLessons[j] || {};

                // Create shallow copy of lesson
                var merged = {};
                for (var prop in lesson) {
                    if (Object.prototype.hasOwnProperty.call(lesson, prop)) {
                        merged[prop] = lesson[prop];
                    }
                }

                // Ensure student name exists
                merged.student = lesson.student || studentName;
                lessons.push(merged);
            }
        }

        return dedupeLessons(lessons);
    }

    // Convert string to integer safely
    function toInt(x) {
        var n = parseInt(x, 10);
        return isNaN(n) ? 0 : n;
    }

    // Convert lesson date & time strings into Date object
    function parseLessonDateTime(lesson) {
        if (!lesson || !lesson.date) return null;

        var dateStr = String(lesson.date).trim();
        var timeStr = lesson.time ? String(lesson.time).trim() : "00:00";

        var year, month, day;

        // DD/MM/YYYY format
        if (dateStr.indexOf("/") !== -1) {
            var parts1 = dateStr.split("/");
            if (parts1.length !== 3) return null;
            day = toInt(parts1[0]);
            month = toInt(parts1[1]);
            year = toInt(parts1[2]);
        }
        // YYYY-MM-DD format
        else if (dateStr.indexOf("-") !== -1) {
            var parts2 = dateStr.split("-");
            if (parts2.length !== 3) return null;
            year = toInt(parts2[0]);
            month = toInt(parts2[1]);
            day = toInt(parts2[2]);
        } else {
            return null;
        }

        // Parse time
        var hour = 0, minute = 0;
        if (timeStr.indexOf(":") !== -1) {
            var t = timeStr.split(":");
            hour = toInt(t[0]);
            minute = toInt(t[1]);
        }

        var d = new Date(year, month - 1, day, hour, minute);
        return isNaN(d.getTime()) ? null : d;
    }

    // Return the next 5 upcoming lessons only
    function getUpcomingFiveLessons() {
        var now = new Date();
        var all = getAllLessonsUnified();
        var upcoming = [];

        for (var i = 0; i < all.length; i++) {
            var l = all[i];
            var dt = parseLessonDateTime(l);
            if (dt && dt >= now) {
                var copy = {};
                for (var prop in l) {
                    if (Object.prototype.hasOwnProperty.call(l, prop)) {
                        copy[prop] = l[prop];
                    }
                }
                copy._dt = dt;
                upcoming.push(copy);
            }
        }

        upcoming.sort(function (a, b) {
            return a._dt - b._dt;
        });

        return upcoming.slice(0, 5);
    }

    // Render upcoming lesson cards
    function renderUpcomingLessons() {
        var stack = document.getElementById("stack");
        if (!stack) return;

        stack.innerHTML = "";

        var nextFive = getUpcomingFiveLessons();

        for (var i = 0; i < nextFive.length; i++) {
            var lesson = nextFive[i];
            var card = document.createElement("div");
            card.className = "card";

            card.innerHTML =
                '<div class="card-header">' +
                '  <div class="title">' + (lesson.subject || "") + " — " + (lesson.student || "") + '</div>' +
                '  <div class="arrow">📘</div>' +
                '</div>' +
                '<div class="card-body">' +
                '  <div class="row"><span>Date:</span> ' + (lesson.date || "") + '</div>' +
                '  <div class="row"><span>Time:</span> ' + (lesson.time || "") + '</div>' +
                '  <div class="row"><span>Student:</span> ' + (lesson.student || "") + '</div>' +
                '  <div class="row"><span>Subject:</span> ' + (lesson.subject || "") + '</div>' +
                '</div>';

            card.addEventListener("click", onUpcomingCardClick);
            stack.appendChild(card);
        }
    }

    // Toggle open/close state of lesson cards
    function onUpcomingCardClick(e) {
        var card = e.currentTarget;
        var isOpen = card.classList.contains("open");

        var cards = document.querySelectorAll(".card");
        for (var i = 0; i < cards.length; i++) {
            cards[i].classList.remove("open");
        }

        if (!isOpen) card.classList.add("open");
    }


    // ==================== 4. NOTES ====================

    // DOM references for notes section
    var notesList = document.getElementById("notes-list");
    var noteInput = document.getElementById("new-note-input");
    var addNoteBtn = document.getElementById("add-note-btn");

    // Load notes from localStorage
    var notes;
    try {
        notes = JSON.parse(localStorage.getItem("notes")) || [];
    } catch (e) {
        notes = [];
    }

    // Render notes list to the UI
    function renderNotes() {
        if (!notesList) return;

        notesList.innerHTML = "";

        for (var i = 0; i < notes.length; i++) {
            var note = notes[i];
            var li = document.createElement("li");
            li.classList.add("note-item");

            li.innerHTML =
                '<button class="delete-btn" data-index="' + i + '">✖</button>' +
                '<button class="edit-btn" data-index="' + i + '">✎</button>' +
                "<div>" + note + "</div>";

            notesList.appendChild(li);
        }
    }

    // Initial notes render
    renderNotes();

    // Add new note
    if (addNoteBtn) {
        addNoteBtn.addEventListener("click", function () {
            if (!noteInput) return;

            var text = noteInput.value.trim();
            if (text === "") return;

            notes.push(text);
            localStorage.setItem("notes", JSON.stringify(notes));
            noteInput.value = "";
            renderNotes();
        });
    }

    // Allow Enter key to add note
    if (noteInput) {
        noteInput.addEventListener("keydown", function (event) {
            if (event.key === "Enter" && addNoteBtn) {
                addNoteBtn.click();
            }
        });
    }

    // Handle delete and edit via event delegation
    if (notesList) {
        notesList.addEventListener("click", function (event) {

            // Delete note
            if (event.target.classList.contains("delete-btn")) {
                var indexDel = parseInt(event.target.getAttribute("data-index"), 10);

                showConfirm("Are you sure you want to delete this note?", function (confirmDelete) {
                    if (confirmDelete) {
                        notes.splice(indexDel, 1);
                        localStorage.setItem("notes", JSON.stringify(notes));
                        renderNotes();
                    }
                });
            }

            // Edit note
            if (event.target.classList.contains("edit-btn")) {
                var indexEdit = parseInt(event.target.getAttribute("data-index"), 10);
                var currentText = notes[indexEdit];

                editNote(currentText, function (result) {
                    if (result !== null && result !== "") {
                        notes[indexEdit] = result;
                        localStorage.setItem("notes", JSON.stringify(notes));
                        renderNotes();
                    }
                });
            }
        });
    }

    // Show confirmation modal before deleting
    function showConfirm(message, callback) {
        var modal = document.getElementById("confirm_modal");
        var modalText = document.getElementById("modal_text");
        var yesBtn = document.getElementById("confirm-yes");
        var noBtn = document.getElementById("confirm-no");

        // Fallback to browser confirm if modal is missing
        if (!modal || !modalText || !yesBtn || !noBtn) {
            callback(confirm(message));
            return;
        }

        modalText.textContent = message;
        modal.style.display = "flex";

        yesBtn.onclick = function () {
            modal.style.display = "none";
            callback(true);
        };

        noBtn.onclick = function () {
            modal.style.display = "none";
            callback(false);
        };
    }

    // Open edit modal and return edited text
    function editNote(currentText, callback) {
        var modal = document.getElementById("edit_modal");
        var input = document.getElementById("edit_input");
        var saveBtn = document.getElementById("edit-save");
        var cancelBtn = document.getElementById("edit-cancel");

        // Fallback to prompt if modal does not exist
        if (!modal || !input || !saveBtn || !cancelBtn) {
            var edited = prompt("Edit note:", currentText);
            callback(edited);
            return;
        }

        input.value = currentText;
        modal.style.display = "flex";

        saveBtn.onclick = function () {
            modal.style.display = "none";
            callback(input.value.trim());
        };

        cancelBtn.onclick = function () {
            modal.style.display = "none";
            callback(null);
        };
    }


    // ==================== 5. LOGOUT ====================

    // Clear session and redirect to login
    var logoutBtn = document.getElementById("logout-btn");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", function () {
            localStorage.removeItem("loggedUser");
            window.location.href = "login.html";
        });
    }

});


// ==================== 6. LIVE CLOCK ====================

// Update the current time in the header every second
function updateClock() {
    var now = new Date();

    var timeString = now.toLocaleString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit"
    });

    var el = document.getElementById("current-time");
    if (el) el.textContent = timeString;
}

// Start live clock updates
setInterval(updateClock, 1000);
updateClock();
