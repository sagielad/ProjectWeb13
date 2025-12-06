document.addEventListener("DOMContentLoaded", function () {

    //  1. LOGIN CHECK 
     //check if the user loged in
    var loggedUser = localStorage.getItem("loggedUser");
    if (!loggedUser) {
        window.location.href = "login.html";
        return;
    }

    var teacherNameSpan = document.getElementById("teacher-name");
    var teacherSubjectSpan = document.getElementById("teacher-subject");

    teacherNameSpan.textContent = " " + loggedUser;
    teacherSubjectSpan.textContent = "Mathematicד";


    //  2. STUDENTS SECTION 

    var students = [
        "Adam Cohen",
        "Noa Levi",
        "Daniel Levi",
        "Maya Levi",
        "Omer Ben David",
        "Ran Avrina",
        "רן אברינה"
    ];

    var studentsListEl = document.getElementById("students-list");
    var studentSearchInput = document.getElementById("student-search");
    var selectedStudentSpan = document.getElementById("selected-student");



    function clearStudentList(){//empty list
        studentsListEl.innerHTML = "";
    }

    function filterStudents(searchText) {//filter students by search
    var lower = searchText.toLowerCase();
    return students.filter(function(name) {
        return name.toLowerCase().includes(lower);
    });
}
        //redirected to the chosen student area
    function createStudentItem(name){
        var li = document.createElement("li");
        li.textContent = name;
        li.classList.add("student-item");
        li.addEventListener("click" ,function() {
            selectedStudentSpan.textContent = name;
            localStorage.setItem("selectedStudent", name);
            window.location.href = "student.html";
        }
    );
    return li;
    }

    function renderStudents(filterText) {
    clearStudentList();

    var matchingStudents = filterStudents(filterText);

    matchingStudents.forEach(function(studentName) {
        var li = createStudentItem(studentName);
        studentsListEl.appendChild(li);
    });
}
    renderStudents("");

    studentSearchInput.addEventListener("input", function () {
        renderStudents(studentSearchInput.value);
    });



    //  3. UPCOMING CLASSES SECTION 

    function getAllLessons() {
    let allLessons = [];

    // Loop through localStorage keys
    for (let i = 0; i < localStorage.length; i++) {
        let key = localStorage.key(i);

        // Only keys that start with "lessons_"
        if (key.startsWith("lessons_")) {
            let studentLessons = JSON.parse(localStorage.getItem(key)) || [];
            let studentName = key.replace("lessons_", "");

            // Add student name to each lesson
            studentLessons.forEach(function(lesson) {
                allLessons.push({
                    ...lesson,
                    student: studentName
                });
            });
        }
    }

    return allLessons;
}       

    function renderUpcomingLessons() {
    let lessons = getAllLessons();

    // Sort by date ascending (closest first)
    lessons.sort(function(a, b) {
        return new Date(a.date + " " + a.time) - new Date(b.date + " " + b.time);
    });

    // Only next 5
    let nextFive = lessons.slice(0, 5);

    const stack = document.getElementById("stack");
    stack.innerHTML = "";

    nextFive.forEach(function(lesson) {
        let card = document.createElement("div");
        card.className = "card";

        card.innerHTML = `
            <div class="card-header">
                <div class="title">${lesson.subject} — ${lesson.student}</div>
                <div class="arrow">📘</div>
            </div>
            <div class="card-body">
                <div class="row"><span>Date:</span> ${lesson.date}</div>
                <div class="row"><span>Time:</span> ${lesson.time}</div>
                <div class="row"><span>Student:</span> ${lesson.student}</div>
                <div class="row"><span>Subject:</span> ${lesson.subject}</div>
            </div>
        `;

        stack.appendChild(card);
    });
}
    document.addEventListener("DOMContentLoaded", function () {
    renderUpcomingLessons();
});
function loadUpcomingLessons() {
    const allLessons = JSON.parse(localStorage.getItem("all_lessons")) || [];

    // ממיין מהקרוב לרחוק
    allLessons.sort((a, b) => new Date(a.date) - new Date(b.date));

    const stack = document.getElementById("stack");
    stack.innerHTML = "";

    // רק 5 ראשונים
    allLessons.slice(0, 5).forEach(function(lesson) {

        const card = document.createElement("div");
        card.className = "card";

        card.innerHTML = `
            <div class="card-header">
                <div class="title">${lesson.subject} — ${lesson.student}</div>
                <div class="arrow">⬇️</div>
            </div>

            <div class="card-body">
                <div class="row"><span>Date:</span> ${lesson.date}</div>
                <div class="row"><span>Time:</span> ${lesson.time}</div>
                <div class="row"><span>Student:</span> ${lesson.student}</div>
                <div class="row"><span>Subject:</span> ${lesson.subject}</div>
            </div>
        `;

        // 👇 אותו event שהיה בקוד המקורי — עכשיו מחובר לדינאמי
        card.addEventListener("click", function () {

            const isOpen = card.classList.contains("open");

            document.querySelectorAll(".card").forEach(function(c) {
                c.classList.remove("open");
            });

            if (!isOpen) {
                card.classList.add("open");
            }
        });

        stack.appendChild(card);
    });
}


loadUpcomingLessons();



    // var lessons = [
    //     { date: "2025-12-22", time: "18:30", name: "Noa Perez",    },
    //     { date: "2025-12-10", time: "19:00", name: "Dana Levy",     },
    //     { date: "2025-12-12", time: "17:00", name: "Yossi Cohen",   },
    //     { date: "2025-12-14", time: "16:00", name: "Ori Mizrahi",   },
    //     { date: "2025-12-15", time: "18:00", name: "Roni Kedem",    }
    // ];

    // lessons.sort(function(a, b) {
    //     return new Date(a.date) - new Date(b.date);
    // });

    // var stack = document.getElementById("stack");

    // lessons.forEach(function(lesson) {

    //     var card = document.createElement("div");
    //     card.className = "card";

    //     card.innerHTML = '' +
    //         '<div class="card-header">' +
    //             '<div class="title">' + lesson.subject + ' — ' + lesson.name + '</div>' +
    //             '<div class="arrow">⬇️</div>' +
    //         '</div>' +
    //         '<div class="card-body">' +
    //             '<div class="row"><span>Date:</span> ' + lesson.date + '</div>' +
    //             '<div class="row"><span>Time:</span> ' + lesson.time + '</div>' +
    //             '<div class="row"><span>Student:</span> ' + lesson.name + '</div>' +
    //             '<div class="row"><span>Subject:</span> ' + lesson.subject + '</div>' +
    //         '</div>';

    //     card.addEventListener("click", function () {

    //         var isOpen = card.classList.contains("open");
    //         document.querySelectorAll(".card").forEach(function(c) {
    //             c.classList.remove("open");
    //         });

    //         if (!isOpen) {
    //             card.classList.add("open");
    //         }
    //     });

    //     stack.appendChild(card);

    // });



    // -------------------- 4. NOTES / STICKY BOARD --------------------

    var notesList = document.getElementById("notes-list");
    var noteInput = document.getElementById("new-note-input");
    var addNoteBtn = document.getElementById("add-note-btn");

    var notes = JSON.parse(localStorage.getItem("notes")) || [];


    function renderNotes() {
        notesList.innerHTML = "";

        notes.forEach(function(note, index) {

            var li = document.createElement("li");
            li.classList.add("note-item");

            li.innerHTML =
                '<button class="delete-btn" data-index="' + index + '">✖</button>' +
                '<button class="edit-btn" data-index="' + index + '">✎</button>' +
                '<div>' + note + '</div>';

            notesList.appendChild(li);
        });
    }

    renderNotes();


    addNoteBtn.addEventListener("click", function () {

        var text = noteInput.value.trim();
        if (text === "") return;

        notes.push(text);
        localStorage.setItem("notes", JSON.stringify(notes));
        noteInput.value = "";
        renderNotes();
    });


    noteInput.addEventListener("keydown", function (event) {
        if (event.key === "Enter") {
            addNoteBtn.click();
        }
    });


    notesList.addEventListener("click", function (event) {

        // DELETE NOTE
        if (event.target.classList.contains("delete-btn")) {

            var index = event.target.getAttribute("data-index");

            showConfirm("Are you sure you want to delete this note?", function(confirmDelete) {

                if (confirmDelete) {
                    notes.splice(index, 1);
                    localStorage.setItem("notes", JSON.stringify(notes));
                    renderNotes();
                }
            });
        }

        // EDIT NOTE
        if (event.target.classList.contains("edit-btn")) {

            var index = event.target.getAttribute("data-index");
            var currentText = notes[index];

            editNote(currentText, function(result) {

                if (result !== null && result !== "") {

                    notes[index] = result;
                    localStorage.setItem("notes", JSON.stringify(notes));
                    renderNotes();
                }
            });
        }
    });


    // --- Confirm Delete Modal ---
    function showConfirm(message, callback) {

        var modal = document.getElementById("confirm_modal");
        var modalText = document.getElementById("modal_text");
        var yesBtn = document.getElementById("confirm-yes");
        var noBtn = document.getElementById("confirm-no");

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


    // --- Edit Modal ---
    function editNote(currentText, callback) {

        var modal = document.getElementById("edit_modal");
        var input = document.getElementById("edit_input");
        var saveBtn = document.getElementById("edit-save");
        var cancelBtn = document.getElementById("edit-cancel");

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


    // -------------------- 5. LOGOUT --------------------

    var logoutBtn = document.getElementById("logout-btn");
    logoutBtn.addEventListener("click", function () {
        localStorage.removeItem("loggedUser");
        window.location.href = "login.html";
    });

});



// -------------------- 6. LIVE CLOCK --------------------

function updateClock() {

    var now = new Date();

    var timeString = now.toLocaleString('he-IL', {
        weekday: 'long',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
    });

    document.getElementById("current-time").textContent = timeString;
}

setInterval(updateClock, 1000);
updateClock();
