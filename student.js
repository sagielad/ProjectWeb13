// === BASIC STUDENT NAME FROM localStorage ===
const studentName = localStorage.getItem("selectedStudent") || "Student Name";
document.getElementById("studentName").textContent = studentName;

// === KEYS PER STUDENT ===
const goalsKey = "goals_" + studentName;
const summariesKey = "summaries_" + studentName;
const filesKey = "files_" + studentName;

// === SCROLL TO SECTION ===
function scrollToSection(id) {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
}

// ================= GOALS LOGIC =================
let goals = [];

function loadGoals() {
    const saved = localStorage.getItem(goalsKey);
    goals = saved ? JSON.parse(saved) : [
        { text: "Improve algebra basics", done: false },
        { text: "Finish weekly homework on time", done: false }
    ];
    renderGoals();
}

function saveGoals() {
    localStorage.setItem(goalsKey, JSON.stringify(goals));
}

function renderGoals() {
    const container = document.getElementById("goalsList");
    container.innerHTML = "";

    goals.forEach((g, index) => {
        const div = document.createElement("div");
        div.className = "goal-item";

        const left = document.createElement("div");
        left.className = "goal-left";

        const status = document.createElement("span");
        status.className = "goal-status" + (g.done ? " done" : "");
        status.textContent = g.done ? "Completed" : "Active";

        const text = document.createElement("span");
        text.textContent = g.text;
        if (g.done) {
            text.style.textDecoration = "line-through";
            text.style.color = "#6b7280";
        }

        left.appendChild(status);
        left.appendChild(text);

        const actions = document.createElement("div");
        actions.className = "goal-actions";

        const btnComplete = document.createElement("button");
        btnComplete.className = "complete";
        btnComplete.textContent = g.done ? "↺" : "✓";
        btnComplete.title = g.done ? "Mark as active" : "Mark as completed";
        btnComplete.onclick = () => toggleGoalDone(index);

        const btnDelete = document.createElement("button");
        btnDelete.className = "delete";
        btnDelete.textContent = "✕";
        btnDelete.title = "Delete goal";
        btnDelete.onclick = () => deleteGoal(index);

        actions.appendChild(btnComplete);
        actions.appendChild(btnDelete);

        div.appendChild(left);
        div.appendChild(actions);
        container.appendChild(div);
    });
}

function addGoal() {
    const input = document.getElementById("goalText");
    const text = input.value.trim();
    if (!text) return;

    goals.unshift({ text, done: false });
    input.value = "";
    saveGoals();
    renderGoals();
}

function toggleGoalDone(index) {
    goals[index].done = !goals[index].done;
    saveGoals();
    renderGoals();
}

function deleteGoal(index) {
    goals.splice(index, 1);
    saveGoals();
    renderGoals();
}

// ============== LESSON SUMMARIES HISTORY ==============
let summaries = [];

function loadSummaries() {
    const saved = localStorage.getItem(summariesKey);
    summaries = saved ? JSON.parse(saved) : [];
    renderSummaries();
}

function saveSummaries() {
    localStorage.setItem(summariesKey, JSON.stringify(summaries));
}

function renderSummaries() {
    const container = document.getElementById("historyList");
    container.innerHTML = "";

    if (summaries.length === 0) {
        const empty = document.createElement("div");
        empty.textContent = "No summaries saved yet.";
        empty.style.fontSize = "13px";
        empty.style.color = "#6b7280";
        container.appendChild(empty);
        return;
    }

    summaries
        .slice()
        .reverse()
        .forEach((s) => {
            const card = document.createElement("div");
            card.className = "history-card";

            const header = document.createElement("div");
            header.className = "history-header";
            header.innerHTML = `<span>${s.subject || "Lesson"}</span><span>${s.date || ""}</span>`;

            const meta = document.createElement("div");
            meta.className = "history-meta";
            meta.textContent = s.createdAt
                ? "Saved at: " + new Date(s.createdAt).toLocaleString()
                : "";

            const body = document.createElement("div");
            body.textContent = s.summary || "";

            card.appendChild(header);
            card.appendChild(meta);
            card.appendChild(body);
            container.appendChild(card);
        });
}

function saveLessonSummary() {
    const date = document.getElementById("lessonDate").value;
    const subject = document.getElementById("lessonSubject").value.trim();
    const summary = document.getElementById("lessonSummary").value.trim();

    if (!date || !subject || !summary) {
        alert("Please fill date, subject and summary.");
        return;
    }

    summaries.push({ date, subject, summary, createdAt: Date.now() });
    saveSummaries();
    renderSummaries();

    // נשמור גם ביומן הכללי של המורה
    saveLessonToAllLessons(date, subject, null);

    document.getElementById("lessonSummary").value = "";
}

// ============== SAVE TO TEACHER's GLOBAL SCHEDULE ==============

function saveLessonToAllLessons(date, subject, time) {
    const allLessons = JSON.parse(localStorage.getItem("all_lessons")) || [];

    const lesson = {
        student: studentName,
        date,
        time: time || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        subject,
        createdAt: Date.now()
    };

    allLessons.push(lesson);
    localStorage.setItem("all_lessons", JSON.stringify(allLessons));
}

// ============== NEXT LESSON SCHEDULER (BUTTON) ==============

function saveNextLesson() {
    const date = document.getElementById("nextLessonDate").value;
    const time = document.getElementById("nextLessonTime").value;
    const subject = document.getElementById("nextLessonSubject").value.trim();

    if (!date || !time || !subject) {
        alert("Please fill date, time and subject.");
        return;
    }

    // שמירה גם ביומן הכללי
    saveLessonToAllLessons(date, subject, time);

    // ניקוי שדה
    document.getElementById("nextLessonSubject").value = "";

    // הודעת הצלחה
    const msg = document.getElementById("lessonSavedMsg");
    if (msg) {
        msg.style.display = "visible";
        msg.style.display = "block";
        setTimeout(() => {
            msg.style.display = "none";
        }, 2000);
    }
}

// ============== FILES (UI ONLY, NO REAL UPLOAD) ==============
let files = [];

function loadFiles() {
    const saved = localStorage.getItem(filesKey);
    files = saved ? JSON.parse(saved) : [];
    renderFiles();
}

function saveFiles() {
    localStorage.setItem(filesKey, JSON.stringify(files));
}

function renderFiles() {
    const list = document.getElementById("fileList");
    list.innerHTML = "";

    if (files.length === 0) {
        list.textContent = "No files listed yet.";
        return;
    }

    files.forEach((f) => {
        const row = document.createElement("div");
        row.className = "file-item";
        row.innerHTML = `<span>${f.name}</span><span style="font-size:11px;color:#6b7280;">${f.date}</span>`;
        list.appendChild(row);
    });
}

const fileInput = document.getElementById("fileInput");
if (fileInput) {
    fileInput.addEventListener("change", (e) => {
        const file = e.target.files[0];
        if (!file) return;

        files.push({
            name: file.name,
            date: new Date().toLocaleString()
        });

        saveFiles();
        renderFiles();
        e.target.value = "";
    });
}

// ============== INIT ON LOAD ==============
loadGoals();
loadSummaries();
loadFiles();
