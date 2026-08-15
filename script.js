console.log("JS Connected");

//task form

const task_title = document.getElementById("task-title");
const task_subject = document.getElementById("task-subject");
const task_priority = document.getElementById("task-priority");
const task_date = document.getElementById("task-date");
const add_btn = document.getElementById("add-btn");
const overdueTaskList = document.querySelector(".overdue-task-list");
const overdueTaskCount = document.querySelector("#overdue-task-count");

const task_items = document.querySelector(".task-items");
let currentEditingCard;
let currentEditingId;

const totalCount = document.getElementById("total-count");
const totalCountTask = document.querySelector(".total-count-task");
const pendingCount = document.getElementById("pending-count");
const completedCount = document.getElementById("completed-count");
const overdueCount = document.getElementById("overdue-count");

const todays_date = document.querySelector(".date");

const search = document.querySelector("#search-task");

const suggestions = document.querySelector(".suggestions");

const add_task = document.querySelector(".add-task");

const page_links = document.querySelectorAll(".sidebar-menu a");
const page = document.querySelectorAll(".page");

const task_page_cards = document.querySelector(".all-task-cards");

const filterTask = document.querySelector("#filter-option");

const sortTask = document.querySelector("#sort-option");

const monthYear = document.querySelector(".month-year");
const calendarDays = document.querySelector(".calendar-days");
const prevBtn = document.querySelector(".prev");
const nextBtn = document.querySelector(".next");
let currentDate = new Date();

const todayTaskList = document.querySelector(".today-task-list");
const todayDate = document.querySelector(".today-date");
const deadlineList = document.querySelector(".deadline-list");

const overallCompletionRate = document.querySelector(".completion-rate-percent");
const ontimeCompletionRate = document.querySelector(".on-time-completion-rate-percent");
const averageCompletionRate = document.querySelector(".average-rate");

const profileName = document.querySelector("#profile-name");
const greetingName = document.querySelector("#greeting-name");


function loadProfileName() {
    const savedName = localStorage.getItem("profileName");

    if (savedName) {
        // Show saved name
        profileName.textContent = savedName;
        greetingName.textContent = savedName;

        // Hide profile setup popup
        profileSetup.style.display = "none";
    }
    else {
        // No profile name yet
        profileName.textContent = "";
        greetingName.textContent = "";

        // Show profile setup popup
        profileSetup.style.display = "flex";
    }
}


function refreshTaskPage(){
    // Start with all tasks
    let taskArray = currentTasks.slice();

    // ---------------- FILTER ----------------
    const filterValue = filterTask.value;
    if(filterValue === "pending" || filterValue === "completed"){
        taskArray = taskArray.filter(function(task){
            return task.status === filterValue;
        });
    }
    else if(filterValue === "high" ||
            filterValue === "medium" ||
            filterValue === "low"){
        taskArray = taskArray.filter(function(task){
            return task.priority === filterValue;
        });
    }

    // ---------------- SORT ----------------
    const sortValue = sortTask.value;
    if(sortValue === "newest"){
        taskArray.sort(function(a,b){
            return b.id - a.id;
        });
    }
    else if(sortValue === "oldest"){
        taskArray.sort(function(a,b){
            return a.id - b.id;
        });
    }
    else if(sortValue === "priority"){
        const priorityOrder = {
            high:1,
            medium:2,
            low:3
        };
        taskArray.sort(function(a,b){
            return priorityOrder[a.priority] - priorityOrder[b.priority];
        });
    }
    else if(sortValue === "due-date"){
        taskArray.sort(function(a,b){
            return new Date(a.date) - new Date(b.date);
        });
    }
    displayAllTasks(taskArray);
}

filterTask.addEventListener("change", function(){
    refreshTaskPage();
});

function deleteTask(deleteButton, taskCard){
    deleteButton.addEventListener("click", function(){
        if(confirm("Are you sure you want to delete the task?")){
            const id = Number(taskCard.dataset.id);
            const index = tasks.findIndex(function(taskItem){
                return taskItem.id === id;
            });
            tasks.splice(index,1);
            currentTasks = tasks.slice();

            localStorage.setItem("tasks", JSON.stringify(tasks));
            refreshNotifications();

            displayDashboardTasks(tasks);
            displayOverdueTasks();
            refreshTaskPage();
            displayTodaySchedule();
            displayUpcomingDeadlines();
            updateStats();
            updateRecentTasks();

            updateProductivityOverview();
            updateTaskProgress();
            updatePriorityAnalysis();
            updateSubjectPerformance();
            
        }
    });
}

function editTask(editButton, taskCard, task){
    editButton.addEventListener("click", function(){
        currentEditingCard = taskCard;
        currentEditingId = Number(taskCard.dataset.id);
        task_title.value = task.title;
        task_subject.value = task.subject;
        task_priority.value = task.priority;
        task_date.value = task.date;
        // Move user to dashboard
        page_links.forEach(function(link){
            link.classList.remove("active");
        });
        document.querySelector('[data-page="dashboard"]').classList.add("active");
        page.forEach(function(item){
            item.classList.remove("active");
        });
        document.getElementById("dashboard-page").classList.add("active");
        task_title.focus();
    });
}

function completeTask(completeButton, taskCard, task){
    completeButton.addEventListener("click", function(){
        if(task.status === "pending"){
            task.status = "completed";
            task.completedAt = new Date().toISOString();
        }
        else{
            task.status = "pending";
            task.completedAt = null;
        }
        const index = tasks.findIndex(function(taskItem){
            return taskItem.id === task.id;
        });
        tasks[index] = task;
        currentTasks = tasks.slice();

        localStorage.setItem("tasks", JSON.stringify(tasks));
        refreshNotifications();

        renderNotifications();
        displayDashboardTasks(tasks);
        displayOverdueTasks();
        refreshTaskPage();
        displayTodaySchedule();
        displayUpcomingDeadlines();
        updateStats();
        updateRecentTasks();
        
        updateProductivityOverview();
        updateTaskProgress();
        updatePriorityAnalysis();
        updateSubjectPerformance();
    });
}


function createTaskCard(task) {

    const newDiv = document.createElement("div");
    newDiv.classList.add("task-item");

    newDiv.innerHTML = `
        <div class="top-item">
            <div class="task-name">${task.title}</div>
        </div>

        <div class="middle-item">
            <div class="subject"><strong>Subject:</strong> ${task.subject}</div>
            <div class="priority">Priority : ${task.priority}</div>
            <div class="task-due-date">Due Date : ${task.date}</div>

            <div class="current-status">
                <div class="status">
                    [ ${task.status.charAt(0).toUpperCase() + task.status.slice(1)} ]
                </div>
            </div>
        </div>

        <div class="bottom-item">

            <button class="edit">
                Edit <i class="fa-solid fa-pen-to-square"></i>
            </button>

            <button class="delete">
                Delete <i class="fa-solid fa-trash"></i>
            </button>

            <button class="complete">
                ${task.status === "completed"
                    ? `Undo <i class="fa-solid fa-rotate-left"></i>`
                    : `Complete <i class="fa-solid fa-circle-check"></i>`
                }
            </button>

        </div>
    `;

    // Store task id on this card
    newDiv.dataset.id = task.id;

    // Delete
    const delete_task = newDiv.querySelector(".delete");
    deleteTask(delete_task, newDiv);

    // Edit
    const edit_task = newDiv.querySelector(".edit");
    editTask(edit_task, newDiv, task);

    // Complete
    const complete_task = newDiv.querySelector(".complete");
    completeTask(complete_task, newDiv, task);

    // return card
    return newDiv;
}

function displayDashboardTasks(taskArray = tasks){
    task_items.innerHTML = "";
    const dashboardTasks = taskArray.slice(-4).reverse();
    if(dashboardTasks.length === 0){
        task_items.innerHTML = `
            <div class="no-task">
                <h2>📝 No Tasks Yet!</h2>
                <p>Add your first task to get started.</p>
            </div>
        `;
        return;
    }
    dashboardTasks.forEach(function(task){
        const card = createTaskCard(task);
        task_items.appendChild(card);
    });
}

function displayAllTasks(taskArray = tasks){
    task_page_cards.innerHTML = "";
    console.log("Displaying", taskArray.length);
    if(taskArray.length === 0){
        const message = document.createElement("div");
        message.classList.add("no-task");
        if(tasks.length === 0){
            message.innerHTML = `
                <h2>📝 No Tasks Yet!</h2>
                <p>Click "Add Task" to create your first task.</p>
            `;
        }
        else{
            message.innerHTML = `
                <h2>🔍 No Matching Tasks Found</h2>
                <p>Try searching with a different keyword.</p>
            `;
        }
        task_page_cards.appendChild(message);
        return;
    }
    taskArray.forEach(function(task){
        console.log(task.title);
        const card = createTaskCard(task);
        task_page_cards.appendChild(card);
    });
}


function displaySuggestion(taskArray){
    suggestions.innerHTML = "";
    if(taskArray.length === 0){
        suggestions.style.display = "none";
        return;
    }
    suggestions.style.display = "block";
    const suggestion_5 = taskArray.slice(0,5);
    suggestion_5.forEach(function(task){
        const div = document.createElement("div");
        div.classList.add("suggestion-item");
        div.textContent = task.title;
        div.addEventListener("click", function () {

            search.value = task.title;
            suggestions.style.display = "none";

            const activePage = document.querySelector(".page.active");

            if(activePage.id === "dashboard-page"){
                displayDashboardTasks([task]);
            }
            else{
                displayAllTasks([task]);
            }

        });
        suggestions.appendChild(div);
    });
}



function updateStats(){
    totalCount.textContent = tasks.length;
    totalCountTask.textContent = `Total Tasks - ${tasks.length}`;

    const pendingTasks = tasks.filter(function(task){
        return task.status === "pending";
    });

    pendingCount.textContent = pendingTasks.length;
    const completedTasks = tasks.filter(function(task){
        return task.status === "completed";
    });

    completedCount.textContent = completedTasks.length;
    const today = new Date().toISOString().split("T")[0];
    const overdueTasks = tasks.filter(function(task){
        return task.date < today && task.status === "pending";
    });

    overdueCount.textContent = overdueTasks.length;
}

// Prevent selecting past dates
const dateInput = document.querySelector(".select-date");

if (dateInput) {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");

    dateInput.min = `${year}-${month}-${day}`;
}



//for reloading the info
let tasks = [];
const savedTasks = localStorage.getItem("tasks");
console.log(savedTasks);
if (savedTasks) {
    tasks = JSON.parse(savedTasks);
}

tasks.forEach(function(task) {
    if (task.status === "completed" && !task.completedAt) {
        task.completedAt = new Date().toISOString();
    }
});

localStorage.setItem("tasks", JSON.stringify(tasks));

let currentTasks = tasks.slice();
displayDashboardTasks(tasks);
displayOverdueTasks();
displayTodaySchedule();
displayUpcomingDeadlines();
refreshTaskPage();

updateProductivityOverview();
updateTaskProgress();
updatePriorityAnalysis();
updateSubjectPerformance();


const formatted_date = new Date();
todays_date.textContent = formatted_date.toDateString();
updateStats();
updateRecentTasks();


function updateRecentTasks() {

    console.log("===== RECENT TASK UPDATE =====");
    console.log("Tasks:", tasks);

    const recentTasksContainer =
        document.querySelector(".recent-tasks .tasks");

    console.log("Recent container:", recentTasksContainer);

    if (!recentTasksContainer) {
        console.error("❌ RECENT TASK CONTAINER NOT FOUND");
        return;
    }

    recentTasksContainer.innerHTML = "";

    tasks.slice(-4).reverse().forEach(function(task) {

        console.log("Adding recent task:", task.title);

        const li = document.createElement("li");
        li.textContent = task.title;

        recentTasksContainer.appendChild(li);
    });

    console.log("Recent tasks updated successfully");
}


//when the add btn is clicked
add_btn.addEventListener("click", function () {

    // Don't create a task if required fields are empty
    if (!task_title.value || !task_subject.value) {
        return;
    }

    // Don't allow past dates
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");

    const todayDate = `${year}-${month}-${day}`;

    if (task_date.value && task_date.value < todayDate) {
        alert("Please select today or a future date.");
        return;
    }

    // Create task object
    const task = {
        id: Date.now(),
        title: task_title.value,
        subject: task_subject.value,
        priority: task_priority.value,
        date: task_date.value,
        status: "pending"
    };

    // =========================
    // EDIT EXISTING TASK
    // =========================
    if(currentEditingCard){
        const index = tasks.findIndex(function(taskItem){
            return taskItem.id === currentEditingId;
        });
        task.id = currentEditingId;
        task.status = tasks[index].status;
        tasks[index] = task;
        currentEditingCard = null;
        currentEditingId = null;
    }

    // =========================
    // CREATE NEW TASK
    // =========================
    else{
        tasks.push(task);
    }
    // Save tasks
    localStorage.setItem("tasks", JSON.stringify(tasks));

    currentTasks = [...tasks];

    refreshNotifications();
    // Refresh both pages
    displayDashboardTasks(tasks);
    displayOverdueTasks();
    refreshTaskPage();
    displayTodaySchedule();
    displayUpcomingDeadlines();

    updateProductivityOverview();
    updateTaskProgress();
    updatePriorityAnalysis();
    updateSubjectPerformance();

    // Update statistics
    updateStats();
    
    updateRecentTasks();

    // Clear form
    task_title.value = "";
    task_subject.value = "";
    task_priority.value = "high";
    task_date.value = "";

    task_title.focus();
});


page_links.forEach(function(link){
    link.addEventListener("click",function(){

        console.log("NAVIGATION CODE REACHED");

        //remove active from all sidebar links
        page_links.forEach(function(item){
            item.classList.remove("active")
        })

        //mark clicked link as active
        link.classList.add("active");

        //hide all pages
        page.forEach(function(item){
            item.classList.remove("active");
        })

        //read data-page-value
        const pageName = link.dataset.page;

        //find corresponding page
        const selectedPage = document.getElementById(`${pageName}-page`);

        //show that page
        selectedPage.classList.add("active");

        if(pageName === "schedule"){
            renderCalendar();
        }
        updateRecentTasks();
        displayDashboardTasks(tasks);
        refreshTaskPage();
    })
})

//for search-bar
search.addEventListener("input", function(){
    const searchText = search.value.toLowerCase();
    const filteredTasks = tasks.filter(function(task){
        return task.title.toLowerCase().includes(searchText);
    });
    if(searchText === ""){
        currentTasks = tasks.slice();
        displayDashboardTasks(tasks);
        refreshTaskPage();
        suggestions.style.display = "none";
    }
    else{
        currentTasks = filteredTasks.slice();
        displayDashboardTasks(filteredTasks);
        refreshTaskPage();
        displaySuggestion(filteredTasks);
    }
});
document.addEventListener("click", function(event){
    if(
        !search.parentElement.contains(event.target) &&
        !filterTask.contains(event.target) &&
        !sortTask.contains(event.target)
    ){
        search.value = "";
        suggestions.style.display = "none";

        displayDashboardTasks(tasks);
        refreshTaskPage();
    }
});

sortTask.addEventListener("change", function(){
    refreshTaskPage();
});


add_task.addEventListener("click", function () {
    if (window.innerWidth <= 768) {
        sidebar.classList.remove("open");
    }
    // Remove active from all sidebar links
    page_links.forEach(function(link){
        link.classList.remove("active");
    });

    // Make Dashboard link active
    document.querySelector('[data-page="dashboard"]').classList.add("active");

    // Hide all pages
    page.forEach(function(item){
        item.classList.remove("active");
    });

    // Show Dashboard page
    document.getElementById("dashboard-page").classList.add("active");

    // Focus on task title
    task_title.focus();
});

function renderCalendar() {

    // Clear old calendar
    calendarDays.innerHTML = "";

    // Current month and year
    const month = currentDate.getMonth();
    const year = currentDate.getFullYear();

    // Month names
    const monthNames = [
        "January", "February", "March", "April",
        "May", "June", "July", "August",
        "September", "October", "November", "December"
    ];

    // Update month heading
    monthYear.textContent = `${monthNames[month]} ${year}`;

    // First day of the month
    const firstDay = new Date(year, month, 1).getDay();

    // Last date of the month
    const lastDate = new Date(year, month + 1, 0).getDate();

    // Empty boxes before the first day
    for(let i = 0; i < firstDay; i++){

        const empty = document.createElement("div");
        empty.classList.add("empty");

        calendarDays.appendChild(empty);
    }

    // Create date boxes
    for(let day = 1; day <= lastDate; day++){

        const dayBox = document.createElement("div");
        dayBox.classList.add("day");

        // Date number
        const dateNumber = document.createElement("span");
        dateNumber.classList.add("date-number");
        dateNumber.textContent = day;

        dayBox.appendChild(dateNumber);

        // Format date as YYYY-MM-DD
        const fullDate =
            `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

        // Get ALL tasks for this date
        const dateTasks = tasks.filter(function(task){
            return task.date === fullDate;
        });

        // If there are tasks
        if(dateTasks.length > 0){

            // Container for priority dots
            const dotsContainer = document.createElement("div");
            dotsContainer.classList.add("task-dots");

            // Create one dot for each task
            dateTasks.forEach(function(task){

                const dot = document.createElement("span");

                // Completed task → green tick
                if(task.status === "completed"){
                    dot.classList.add("task-dot", "completed");
                    dot.innerHTML = '<i class="fa-solid fa-check"></i>';
                }

                // Pending task → priority dot
                else{
                    dot.classList.add("task-dot");

                    if(task.priority === "high"){
                        dot.classList.add("high");
                    }
                    else if(task.priority === "medium"){
                        dot.classList.add("medium");
                    }
                    else{
                        dot.classList.add("low");
                    }
                }

                dotsContainer.appendChild(dot);
            });

            dayBox.appendChild(dotsContainer);

            // Task count
            const taskCount = document.createElement("span");
            taskCount.classList.add("task-count");

            taskCount.textContent =
                dateTasks.length === 1
                    ? "1 task"
                    : `${dateTasks.length} tasks`;

            dayBox.appendChild(taskCount);
        }

        calendarDays.appendChild(dayBox);
    }
}

prevBtn.addEventListener("click", function(){
    currentDate.setMonth(currentDate.getMonth() - 1);
    renderCalendar();
});
nextBtn.addEventListener("click", function(){
    currentDate.setMonth(currentDate.getMonth() + 1);
    renderCalendar();
});


function displayTodaySchedule() {
    // Clear previous tasks
    todayTaskList.innerHTML = "";

    // Today's date for comparison (YYYY-MM-DD)
    const today = new Date().toISOString().split("T")[0];

    // Today's date for display
    todayDate.textContent = new Date().toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric"
    });

    // Get today's tasks
    const todaysTasks = tasks.filter(function(task){
        return task.date === today;
    });

    // If no tasks
    if(todaysTasks.length === 0){
        todayTaskList.innerHTML = `
            <div class="no-task">
                🎉 No tasks scheduled for today!
            </div>
        `;
        return;
    }
    // Display today's tasks
    todaysTasks.forEach(function(task){
        console.log(today);
        console.log(task.date);
        const div = document.createElement("div");
        div.classList.add("today-task");
        div.innerHTML = `
            <div class="today-task-header">
                <div class="today-task-title">${task.title}</div>
                <div class="today-task-subject">
                    Subject : ${task.subject}
                </div>
            </div>

            <div class="today-task-footer">
                <span class="priority ${task.priority}">
                    ${task.priority.toUpperCase()} PRIORITY
                </span>

                <span class="status ${task.status}">
                    ${task.status.toUpperCase()}
                </span>
            </div>
        `;
        todayTaskList.appendChild(div);
    });
}


function displayUpcomingDeadlines(){
    // Clear old data
    deadlineList.innerHTML = "";

    // Today's date
    const today = new Date().toISOString().split("T")[0];

    // Filter upcoming pending tasks
    const upcomingTasks = tasks.filter(function(task){
        return task.date > today && task.status === "pending";
    });

    // Sort by nearest date
    upcomingTasks.sort(function(a, b){
        return new Date(a.date) - new Date(b.date);
    });

    // Show only next 5 deadlines
    const nextFive = upcomingTasks.slice(0, 5);

    // No upcoming tasks
    if(nextFive.length === 0){
        deadlineList.innerHTML = `
            <div class="no-task">
                🎉 No upcoming deadlines!
            </div>
        `;
        return;
    }
    // Display deadlines
    nextFive.forEach(function(task){
        const div = document.createElement("div");
        div.classList.add("deadline-item");
        div.innerHTML = `
            <div class="deadline-left">
                <div class="deadline-title">${task.title}</div>
                <div class="deadline-date">
                    📅 ${new Date(task.date).toLocaleDateString("en-GB",{
                        day:"numeric",
                        month:"long"
                    })}
                </div>
            </div>
            <div class="deadline-right">
                <span class="deadline-priority ${task.priority}">
                    ${task.priority.toUpperCase()}
                </span>
            </div>
        `;
        deadlineList.appendChild(div);
    });
}


function displayOverdueTasks() {
    // Clear old overdue tasks
    overdueTaskList.innerHTML = "";

    // Get today's date in YYYY-MM-DD format
    const today = new Date().toISOString().split("T")[0];

    // Find tasks whose due date has passed
    // and which are still pending
    const overdueTasks = tasks.filter(function(task) {
        return task.date < today && task.status === "pending";
    });

    // Update overdue count
    overdueTaskCount.textContent =
        `${overdueTasks.length} Overdue`;

    // If there are no overdue tasks
    if (overdueTasks.length === 0) {
        overdueTaskList.innerHTML = `
            <div class="no-task">
                ✓ No overdue tasks. You're all caught up!
            </div>
        `;
        return;
    }

    // Display every overdue task
    overdueTasks.forEach(function(task) {
        const div = document.createElement("div");
        div.classList.add("overdue-task");
        div.innerHTML = `
            <div class="overdue-task-info">

                <div class="overdue-task-title">
                    ${task.title}
                </div>

                <div class="overdue-task-date">
                    Due: ${new Date(task.date).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "long",
                        year: "numeric"
                    })}
                </div>
            </div>

            <div class="overdue-task-actions">
                <span class="overdue-priority ${task.priority}">
                    ${task.priority.toUpperCase()}
                </span>

                <button class="reschedule-btn" data-id="${task.id}">
                    <i class="fa-solid fa-calendar-days"></i>
                    Reschedule
                </button>

                <button class="overdue-complete-btn" data-id="${task.id}">
                    <i class="fa-solid fa-check"></i>
                    Complete
                </button>

            </div>
        `;
        overdueTaskList.appendChild(div);

        const completeBtn = div.querySelector(".overdue-complete-btn");
        const rescheduleBtn = div.querySelector(".reschedule-btn");

        // COMPLETE OVERDUE TASK
        completeBtn.addEventListener("click", function(){

            const id = Number(completeBtn.dataset.id);

            const taskIndex = tasks.findIndex(function(taskItem){
                return taskItem.id === id;
            });

            if(taskIndex === -1){
                return;
            }

            // Mark task as completed
            tasks[taskIndex].status = "completed";
            tasks[taskIndex].completedAt = new Date().toISOString();

            // Save updated tasks
            localStorage.setItem("tasks", JSON.stringify(tasks));

            refreshNotifications();

            // Refresh UI
            displayOverdueTasks();
            displayDashboardTasks(tasks);
            refreshTaskPage();
            displayTodaySchedule();
            displayUpcomingDeadlines();
            updateStats();
            updateRecentTasks();

            // Refresh Analytics
            updateProductivityOverview();
            updateTaskProgress();
        });


        // RESCHEDULE OVERDUE TASK
        rescheduleBtn.addEventListener("click", function(){
            const id = Number(rescheduleBtn.dataset.id);
            const task = tasks.find(function(taskItem){
                return taskItem.id === id;
            });
            const newDate = prompt(
                "Enter new due date (YYYY-MM-DD):",
                task.date
            );
            if(!newDate){
                return;
            }
            task.date = newDate;
            if (task.dueDate) {
                task.dueDate = newDate;
            }
            
            localStorage.setItem("tasks", JSON.stringify(tasks));

            currentTasks = tasks.slice();

            refreshNotifications();

            displayOverdueTasks();
            displayDashboardTasks(tasks);
            refreshTaskPage();
            displayTodaySchedule();
            displayUpcomingDeadlines();
            updateStats();
            updateRecentTasks();

            // Refresh Analytics
            updateProductivityOverview();
            updateTaskProgress();
            updatePriorityAnalysis();
            updateSubjectPerformance();
        });

    });
}


function updateProductivityOverview() {

    // =========================
    // 1. OVERALL COMPLETION RATE
    // =========================

    if (tasks.length === 0) {
        overallCompletionRate.textContent = "0%";
        ontimeCompletionRate.textContent = "0%";
        averageCompletionRate.textContent = "0";
        return;
    }

    const completedTasks = tasks.filter(function(task) {
        return task.status === "completed";
    });

    const completedTaskCount = completedTasks.length;

    const completionRate = Math.round(
        (completedTaskCount / tasks.length) * 100
    );

    overallCompletionRate.textContent = completionRate + "%";

    // =========================
    // 2. ON-TIME COMPLETION RATE
    // =========================

    if (completedTaskCount === 0) {
        ontimeCompletionRate.textContent = "0%";
    }
    else {

        const onTimeTasks = completedTasks.filter(function(task) {

            // Old tasks may not have completedAt
            if (!task.completedAt || !task.date) {
                return false;
            }

            // Convert both to YYYY-MM-DD
            const completedDate =
                new Date(task.completedAt).toISOString().split("T")[0];

            return completedDate <= task.date;
        });

        const onTimeRate = Math.round(
            (onTimeTasks.length / completedTaskCount) * 100
        );

        ontimeCompletionRate.textContent = onTimeRate + "%";
    }


    // =========================
    // 3. AVERAGE TASKS / DAY
    // =========================

    const averageTasks = Math.round(
        completedTaskCount / 7 * 10
    ) / 10;

    averageCompletionRate.textContent = averageTasks;
}

function updateTaskProgress(){
    const today = new Date();
    const last7Days = [];

    // Create last 7 days
    for(let i = 6; i >= 0; i--){
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        const dateString = date.toISOString().split("T")[0];
        last7Days.push({
            date: dateString,
            completed: 0
        });
    }

    // Count completed tasks for each day
    tasks.forEach(function(task){
        if(task.status !== "completed" || !task.completedAt){
            return;
        }

        const completedDate = new Date(task.completedAt).toISOString().split("T")[0];

        last7Days.forEach(function(day){

            if(day.date === completedDate){
                day.completed++;
            }
        });
    });

    // Clear previous chart
    const chartArea = document.querySelector(".chart-area");
    chartArea.innerHTML = "";

    // Find maximum value for chart height
    const maxCompleted = Math.max(
        ...last7Days.map(function(day){
            return day.completed;
        }),
        1
    );
    // Create bars
    last7Days.forEach(function(day){

        const barContainer = document.createElement("div");
        barContainer.classList.add("progress-bar-container");

        const bar = document.createElement("div");
        bar.classList.add("progress-bar");

        const height =
            (day.completed / maxCompleted) * 100;

        bar.style.height = `${height}%`;

        const count = document.createElement("span");
        count.classList.add("progress-count");
        count.textContent = day.completed;

        const dateLabel = document.createElement("span");
        dateLabel.classList.add("progress-date");

        dateLabel.textContent =
            new Date(day.date).toLocaleDateString("en-US", {
                weekday: "short"
            });

        barContainer.appendChild(count);
        barContainer.appendChild(bar);
        barContainer.appendChild(dateLabel);
        chartArea.appendChild(barContainer);
    });

    // Find best day
    let bestDay = last7Days[0];
    last7Days.forEach(function(day){
        if(day.completed > bestDay.completed){
            bestDay = day;
        }
    });

    const bestDayElement =
        document.querySelector(".best-day strong");

    if(bestDay.completed === 0){
        bestDayElement.textContent = "No completed tasks yet";
    }
    else{
        bestDayElement.textContent =
            `${new Date(bestDay.date).toLocaleDateString("en-US", {
                weekday: "long"
            })} (${bestDay.completed} tasks)`;
    }

    // Calculate trend
    const firstHalf =
        last7Days.slice(0, 3)
        .reduce(function(total, day){
            return total + day.completed;
        }, 0);

    const secondHalf =
        last7Days.slice(4)
        .reduce(function(total, day){
            return total + day.completed;
        }, 0);

    const trendElement =
        document.querySelector(".progress-trend strong");

    if(secondHalf > firstHalf){
        trendElement.textContent = "↑ Improving";
    }
    else if(secondHalf < firstHalf){
        trendElement.textContent = "↓ Needs attention";
    }
    else{
        trendElement.textContent = "→ Stable";
    }
}


function updatePriorityAnalysis(){
    const priorityDonut = document.querySelector(".priority-donut");
    const priorityTotal = document.querySelector(".priority-total");

    const highCount = document.querySelector(".high-count");
    const mediumCount = document.querySelector(".medium-count");
    const lowCount = document.querySelector(".low-count");

    const mostCommonPriority = document.querySelector(".most-common-priority");

    // Count priorities
    const high = tasks.filter(function(task){
        return task.priority === "high";
    }).length;

    const medium = tasks.filter(function(task){
        return task.priority === "medium";
    }).length;

    const low = tasks.filter(function(task){
        return task.priority === "low";
    }).length;

    const total = tasks.length;
    // Update total
    priorityTotal.textContent = total;

    // Update counts
    highCount.textContent = high;
    mediumCount.textContent = medium;
    lowCount.textContent = low;

    // No tasks
    if(total === 0){
        priorityDonut.style.background =
            "conic-gradient(#334155 0% 100%)";
        mostCommonPriority.textContent = "No data yet";
        return;
    }

    // Calculate percentages
    const highPercent = (high / total) * 100;
    const mediumPercent = (medium / total) * 100;
    const lowPercent = (low / total) * 100;

    // Create donut chart
    priorityDonut.style.background = `
        conic-gradient(
            #ef4444 0% ${highPercent}%,
            #f59e0b ${highPercent}% ${highPercent + mediumPercent}%,
            #22c55e ${highPercent + mediumPercent}% 100%
        )
    `; // Find most common priority
    let commonPriority = "High Priority";
    let highestCount = high;

    if(medium > highestCount){
        commonPriority = "Medium Priority";
        highestCount = medium;
    }
    if(low > highestCount){
        commonPriority = "Low Priority";
    }
    mostCommonPriority.textContent = commonPriority;
}


function updateSubjectPerformance() {

    const subjectData = {};

    tasks.forEach(function(task) {

        // Normalize subject name for grouping
        const subjectKey = task.subject.trim().toLowerCase();

        // Create a display name like "Maths"
        const subjectName =
            subjectKey.charAt(0).toUpperCase() + subjectKey.slice(1);

        // Create subject entry if it doesn't exist
        if (!subjectData[subjectKey]) {
            subjectData[subjectKey] = {
                name: subjectName,
                total: 0,
                completed: 0
            };
        }

        // Count task
        subjectData[subjectKey].total++;

        // Count completed task
        if (task.status === "completed") {
            subjectData[subjectKey].completed++;
        }
    });


    const subjectChart = document.querySelector(".subject-chart");

    if (!subjectChart) {
        return;
    }

    subjectChart.innerHTML = "";


    // No tasks
    if (Object.keys(subjectData).length === 0) {

        subjectChart.innerHTML = `
            <div class="no-data">
                No subject data yet
            </div>
        `;

        return;
    }


    let bestSubject = null;
    let bestPercentage = -1;


    Object.values(subjectData).forEach(function(subject) {

        const percentage =
            subject.total === 0
                ? 0
                : Math.round(
                    (subject.completed / subject.total) * 100
                );


        // Find best subject
        if (percentage > bestPercentage) {
            bestPercentage = percentage;
            bestSubject = subject.name;
        }


        // Create subject row
        const row = document.createElement("div");

        row.className = "subject-row";

        row.innerHTML = `
            <div class="subject-name">
                ${subject.name}
            </div>

            <div class="subject-progress">
                <div
                    class="subject-progress-fill"
                    style="width:${percentage}%"
                ></div>
            </div>

            <div class="subject-percentage">
                ${percentage}%
            </div>
        `;

        subjectChart.appendChild(row);
    });


    // Update best subject
    const bestSubjectName =
        document.querySelector(".best-subject-name");

    if (bestSubjectName) {

        bestSubjectName.textContent =
            bestSubject || "No data yet";
    }
}


console.log("PROFILE JS STARTED");

const profileSetup = document.getElementById("profile-setup");
const profileNameInput = profileSetup ? profileSetup.querySelector("#profile-name-input") : null;
const saveProfileBtn = document.getElementById("save-profile-btn");

console.log("Popup:", profileSetup);
console.log("Input:", profileNameInput);
console.log("Button:", saveProfileBtn);

if (saveProfileBtn) {
    saveProfileBtn.addEventListener("click", function () {
        console.log("BUTTON CLICKED");
        const name = profileNameInput.value.trim();
        console.log("Entered name:", name);
        if (name === "") {
            alert("Please enter your name");
            return;
        }
        localStorage.setItem("profileName", name);
        profileName.textContent = name;
        greetingName.textContent = name;
        profileSetup.style.display = "none";
        console.log("Profile saved:", name);
    });
}

loadProfileName();

// =========================
// CHANGE PROFILE NAME FROM SETTINGS
// =========================

const settingsProfileNameInput =
    document.getElementById("profile-name-input");

const saveProfileNameBtn =
    document.getElementById("save-profile-name");


// Load existing profile name into Settings
function loadSettingsProfileName() {

    const savedName = localStorage.getItem("profileName");

    if (savedName && settingsProfileNameInput) {
        settingsProfileNameInput.value = savedName;
    }
}

loadSettingsProfileName();


// Save changed profile name
if (saveProfileNameBtn) {
    saveProfileNameBtn.addEventListener("click", function () {

        const newName = settingsProfileNameInput.value.trim();

        // Don't allow empty name
        if (newName === "") {
            alert("Please enter your name");
            return;
        }

        // Save new name
        localStorage.setItem("profileName", newName);

        // Update profile name everywhere
        profileName.textContent = newName;
        greetingName.textContent = newName;

        alert("Profile name updated successfully!");
    });
}


// ============================================================
//                 NOTIFICATION SYSTEM
// ============================================================

// ---------- HTML ELEMENTS ----------

const notificationBell = document.getElementById("notif");
const notificationCount = document.getElementById("notification-count");
const notificationPanel = document.getElementById("notification-panel");
const notificationList = document.getElementById("notification-list");
const clearNotificationsBtn = document.getElementById("clear-notifications");

// Settings toggles
const notificationToggle = document.getElementById("notification-toggle");
const deadlineAlertToggle = document.getElementById("deadline-alert-toggle");
const dailyProgressToggle = document.getElementById("daily-progress-toggle");
const dailyStreakToggle = document.getElementById("daily-streak-toggle");


// ============================================================
//                 NOTIFICATION DATA
// ============================================================

let notifications =
    JSON.parse(localStorage.getItem("taskflowNotifications")) || [];


// ============================================================
//                 NOTIFICATION REFRESH WRAPPER
// ============================================================

function refreshNotifications() {
    checkDeadlineNotifications();
    checkDailyProgressNotification();
    checkDailyStreakNotification();
}


// ============================================================
//                 GET TASKS
// ============================================================

function getTasksForNotifications() {
    try {
        if (Array.isArray(window.tasks)) {
            return window.tasks;
        }
        const savedTasks = localStorage.getItem("tasks");
        if (savedTasks) {
            const parsedTasks = JSON.parse(savedTasks);
            if (Array.isArray(parsedTasks)) {
                return parsedTasks;
            }
        }
    } catch (error) {
        console.error("Could not read tasks:", error);
    }
    return [];
}


// ============================================================
//                 SAVE NOTIFICATIONS
// ============================================================

function saveNotifications() {
    localStorage.setItem(
        "taskflowNotifications",
        JSON.stringify(notifications)
    );

}

// ============================================================
//                 CREATE NOTIFICATION
// ============================================================

function createNotification(title, message, type) {

    // Master notification switch
    if (!notificationToggle || !notificationToggle.checked) {
        return;
    }

    // Check whether this type is enabled

    if (type === "deadline" &&
        (!deadlineAlertToggle || !deadlineAlertToggle.checked)) {
        return;
    }

    if (type === "progress" &&
        (!dailyProgressToggle || !dailyProgressToggle.checked)) {
        return;
    }

    if (type === "streak" &&
        (!dailyStreakToggle || !dailyStreakToggle.checked)) {
        return;
    }

    const notification = {
        id: Date.now(),
        title: title,
        message: message,
        type: type,
        time: new Date().toISOString(),
        read: false
    };

    notifications.unshift(notification);
    saveNotifications();
    renderNotifications();
}


// ============================================================
//                 RENDER NOTIFICATIONS
// ============================================================

function renderNotifications() {

    if(!notificationList || !notificationCount) {
        return;
    }


    notificationList.innerHTML = "";


    // No notifications
    if (notifications.length === 0) {

        notificationList.innerHTML = `
            <div class="no-notifications">
                <i class="fa-regular fa-bell-slash"></i>
                <p>No notifications</p>
            </div>
        `;

        notificationCount.textContent = "0";

        notificationCount.style.display = "none";

        return;
    }


    // Count unread notifications

    const unreadCount = notifications.filter(
        notification => !notification.read
    ).length;


    notificationCount.textContent = unreadCount;

    notificationCount.style.display =
        unreadCount > 0 ? "flex" : "none";


    // Create notification elements

    notifications.forEach(notification => {

        const notificationItem =
            document.createElement("div");

        notificationItem.classList.add(
            "notification-item"
        );


        if (!notification.read) {

            notificationItem.classList.add("unread");

        }

        // Choose icon

        let icon = "fa-bell";

        if (notification.type === "deadline") {
            icon = "fa-clock";
        }

        if (notification.type === "progress") {
            icon = "fa-chart-line";
        }

        if (notification.type === "streak") {
            icon = "fa-fire";
        }


        // Format time

        const notificationTime =
            formatNotificationTime(notification.time);


        notificationItem.innerHTML = `

            <div class="notification-icon">

                <i class="fa-solid ${icon}"></i>

            </div>

            <div class="notification-content">

                <strong>
                    ${notification.title}
                </strong>

                <p>
                    ${notification.message}
                </p>

                <small>
                    ${notificationTime}
                </small>

            </div>

            <button
                class="notification-delete"
                data-id="${notification.id}"
            >
                <i class="fa-solid fa-xmark"></i>
            </button>

        `;

        // Mark notification as read

        notificationItem.addEventListener(
            "click",
            function (event) {
                if (
                    event.target.closest(
                        ".notification-delete"
                    )
                ) {
                    return;
                }

                notification.read = true;
                saveNotifications();
                renderNotifications();
            }
        );


        notificationList.appendChild(
            notificationItem
        );

    });

}


// ============================================================
//                 FORMAT NOTIFICATION TIME
// ============================================================

function formatNotificationTime(time) {

    const notificationDate =
        new Date(time);

    const now =
        new Date();

    const difference =
        now - notificationDate;

    const seconds =
        Math.floor(difference / 1000);

    const minutes =
        Math.floor(seconds / 60);

    const hours =
        Math.floor(minutes / 60);

    const days =
        Math.floor(hours / 24);

    if (seconds < 60) {
        return "Just now";
    }

    if (minutes < 60) {
        return `${minutes} min ago`;
    }
    if (hours < 24) {
        return `${hours} hr ago`;
    }
    if (days === 1) {
        return "Yesterday";
    }
    return `${days} days ago`;

}

// ============================================================
//                 DELETE ONE NOTIFICATION
// ============================================================

notificationList?.addEventListener(
    "click",
    function (event) {
        const deleteButton =
            event.target.closest(
                ".notification-delete"
            );

        if (!deleteButton) {
            return;
        }

        const id =
            Number(deleteButton.dataset.id);

        notifications =
            notifications.filter(
                notification =>
                    notification.id !== id
            );
        saveNotifications();
        renderNotifications();

    }
);

// ============================================================
//                 CLEAR ALL NOTIFICATIONS
// ============================================================

clearNotificationsBtn?.addEventListener(
    "click",
    function () {
        notifications = [];
        saveNotifications();
        renderNotifications();
    }
);

// ============================================================
//                 OPEN / CLOSE PANEL
// ============================================================

notificationBell?.addEventListener(
    "click",
    function (event) {
        event.stopPropagation();
        notificationPanel.classList.toggle(
            "show"
        );
    }
);

// Clicking inside panel shouldn't close it
notificationPanel?.addEventListener(
    "click",
    function (event) {
        event.stopPropagation();
    }
);

// Clicking anywhere else closes panel
document.addEventListener(
    "click",
    function () {
        notificationPanel?.classList.remove(
            "show"
        );
    }
);


// =============1. DEADLINE NOTIFICATIONS=====================

function checkDeadlineNotifications() {
    if (
        !notificationToggle?.checked ||
        !deadlineAlertToggle?.checked
    ) {
        return;
    }

    const taskList =
        getTasksForNotifications();

    if (!taskList.length) {
        return;
    }

    const today =
        new Date();

    today.setHours(
        0, 0, 0, 0
    );

    taskList.forEach(task => {

        // Ignore completed tasks

        if (
            task.status === "completed" ||
            task.completed === true
        ) {
            return;
        }

        if (!task.dueDate && !task.date) {
            return;
        }

        const taskDateString =
            task.dueDate || task.date;

        const dueDate =
            new Date(taskDateString);

        dueDate.setHours(
            0, 0, 0, 0
        );

        // Difference in days
        const difference =
            Math.floor(
                (dueDate - today) /
                (1000 * 60 * 60 * 24)
            );

        // Create unique ID so same notification
        // isn't repeatedly created
        const notificationKey =
            `deadline-${task.id || task.title}-${taskDateString}`;
        const alreadyExists =
            notifications.some(
                notification =>
                    notification.key === notificationKey
            );

        if (alreadyExists) {
            return;
        }

        // ---------- OVERDUE ----------
        if (difference < 0) {
            const daysOverdue =
                Math.abs(difference);

            const notification = {
                id: Date.now() + Math.random(),
                key: notificationKey,
                title: "Task Overdue",
                message:
                    `"${task.title}" is overdue by ${daysOverdue} day${daysOverdue > 1 ? "s" : ""}.`,
                type: "deadline",
                time: new Date().toISOString(),
                read: false
            };

            notifications.unshift(
                notification
            );
        }

        // ---------- DUE TODAY ----------

        else if (difference === 0) {
            const notification = {
                id: Date.now() + Math.random(),
                key: notificationKey,
                title: "Task Due Today",
                message:
                    `"${task.title}" is due today. Don't forget to complete it!`,
                type: "deadline",
                time: new Date().toISOString(),
                read: false
            };
            notifications.unshift(
                notification
            );
        }

        // ---------- DUE TOMORROW ----------
        else if (difference === 1) {
            const notification = {
                id: Date.now() + Math.random(),
                key: notificationKey,
                title: "Deadline Tomorrow",
                message:
                    `"${task.title}" is due tomorrow.`,
                type: "deadline",
                time: new Date().toISOString(),
                read: false
            };

            notifications.unshift(
                notification
            );
        }
    });

    saveNotifications();
    renderNotifications();
}


// =============2. DAILY PROGRESS NOTIFICATION=================

function checkDailyProgressNotification() {
    if (
        !notificationToggle?.checked ||
        !dailyProgressToggle?.checked
    ) {
        return;
    }
    const today =
        new Date()
            .toISOString()
            .split("T")[0];

    const progressKey =
        `daily-progress-${today}`;

    // Already generated today
    if (
        localStorage.getItem(
            "lastDailyProgressNotification"
        ) === today
    ) {
        return;
    }

    const taskList =
        getTasksForNotifications();

    if (!taskList.length) {
        return;
    }

    const total =
        taskList.length;

    const completed =
        taskList.filter(task =>
            task.status === "completed" ||
            task.completed === true
        ).length;

    const pending =
        total - completed;

    const completionRate =
        total > 0
            ? Math.round(
                (completed / total) * 100
            )
            : 0;

    const notification = {
        id: Date.now(),
        key: progressKey,
        title: "Daily Progress",
        message:
            `You have completed ${completed} of ${total} tasks today. Overall completion: ${completionRate}%. ${pending} task${pending !== 1 ? "s" : ""} still pending.`,
        type: "progress",
        time: new Date().toISOString(),
        read: false
    };

    notifications.unshift(
        notification
    );

    localStorage.setItem(
        "lastDailyProgressNotification",
        today
    );

    saveNotifications();
    renderNotifications();
}

// =============3. DAILY STREAK NOTIFICATION================

function checkDailyStreakNotification() {
    if (
        !notificationToggle?.checked ||
        !dailyStreakToggle?.checked
    ) {
        return;
    }

    const today =
        new Date()
            .toISOString()
            .split("T")[0];

    // Don't create it more than once a day
    if (
        localStorage.getItem(
            "lastDailyStreakNotification"
        ) === today
    ) {
        return;
    }

    const taskList =
        getTasksForNotifications();

    if (!taskList.length) {
        return;
    }

    const completedToday =
        taskList.some(task => {
            if (
                task.status !== "completed" &&
                task.completed !== true
            ) {
                return false;
            }

            if (!task.completedAt) {
                return false;
            }

            return task.completedAt
                .startsWith(today);
        });

    if (completedToday) {
        const notification = {
            id: Date.now(),
            key:
                `streak-${today}`,
            title:
                "Daily Streak 🔥",
            message:
                "Great job! You completed a task today. Keep your streak going!",
            type:
                "streak",
            time:
                new Date().toISOString(),
            read:
                false
        };

        notifications.unshift(
            notification
        );

        localStorage.setItem(
            "lastDailyStreakNotification",
            today
        );

        saveNotifications();
        renderNotifications();
    }
}


// =============SETTINGS TOGGLE EVENT LISTENERS==================

// Master notification toggle
notificationToggle?.addEventListener(
    "change",
    function () {
        localStorage.setItem(
            "notificationsEnabled",
            this.checked
        );

        // If turned OFF
        if (!this.checked) {
            notificationPanel?.classList.remove(
                "show"
            );
        }

        // If turned ON
        else {
            refreshNotifications();
        }
    }
);

// Deadline alerts

deadlineAlertToggle?.addEventListener("change", function () {
        localStorage.setItem(
            "deadlineAlertsEnabled",
            this.checked
        );

        if (this.checked) {
            checkDeadlineNotifications();
        }
    }
);

// Daily progress
dailyProgressToggle?.addEventListener("change", function () {
        localStorage.setItem(
            "dailyProgressEnabled",
            this.checked
        );

        if (this.checked) {
            checkDailyProgressNotification();
        }
    }
);

// Daily streak

dailyStreakToggle?.addEventListener("change", function () {
        localStorage.setItem(
            "dailyStreakEnabled",
            this.checked
        );

        if (this.checked) {
            checkDailyStreakNotification();
        }
    }
);

// ================ LOAD SETTINGS====================
function loadNotificationSettings() {
    const master =
        localStorage.getItem(
            "notificationsEnabled"
        );

    const deadline =
        localStorage.getItem(
            "deadlineAlertsEnabled"
        );

    const progress =
        localStorage.getItem(
            "dailyProgressEnabled"
        );

    const streak =
        localStorage.getItem(
            "dailyStreakEnabled"
        );

    // Default values
    if (notificationToggle) {
        notificationToggle.checked =
            master === null
                ? true
                : master === "true";
    }
    if (deadlineAlertToggle) {
        deadlineAlertToggle.checked =
            deadline === null
                ? true
                : deadline === "true";
    }
    if (dailyProgressToggle) {
        dailyProgressToggle.checked =
            progress === null
                ? true
                : progress === "true";
    }
    if (dailyStreakToggle) {
        dailyStreakToggle.checked =
            streak === null
                ? true
                : streak === "true";
    }
}

// ================INITIALIZE NOTIFICATIONS===================
function initializeNotifications() {
    loadNotificationSettings();
    renderNotifications();
    refreshNotifications();
}
// Run after HTML loads
initializeNotifications();

// =================TASK PREFERENCES=====================

// Default values
const DEFAULT_TASK_PREFERENCES = {
    priority: "high",
    filter: "all",
    sort: "newest"
};

// -----------GET SAVED TASK PREFERENCES-------------------
function getTaskPreferences() {
    const saved = localStorage.getItem("taskPreferences");
    if (saved) {
        return JSON.parse(saved);
    }

    return {
        ...DEFAULT_TASK_PREFERENCES
    };
}


// -------------SAVE TASK PREFERENCES------------------


function saveTaskPreferences(preferences) {

    localStorage.setItem(
        "taskPreferences",
        JSON.stringify(preferences)
    );
}


// ----------LOAD TASK PREFERENCES INTO SETTINGS----------------------

function loadTaskPreferences() {

    const preferences = getTaskPreferences();

    const defaultPriority =
        document.getElementById("default-priority");

    const defaultFilter =
        document.getElementById("default-filter");

    const defaultSort =
        document.getElementById("default-sort");


    if (defaultPriority) {
        defaultPriority.value = preferences.priority;
    }

    if (defaultFilter) {
        defaultFilter.value = preferences.filter;
    }

    if (defaultSort) {
        defaultSort.value = preferences.sort;
    }
}

// --------------APPLY SAVED PREFERENCES TO TASK PAGE-------------------

function applyTaskPreferences() {
    const preferences = getTaskPreferences();
    const filterOption =
        document.getElementById("filter-option");

    const sortOption =
        document.getElementById("sort-option");

    // Apply saved filter
    if (filterOption) {
        filterOption.value = preferences.filter;
    }

    // Apply saved sort
    if (sortOption) {
        sortOption.value = preferences.sort;
    }

    // Apply default priority to Quick Add Task
    const taskPriority =
        document.getElementById("task-priority");

    if (taskPriority) {
        taskPriority.value = preferences.priority;
    }

    // Trigger event listeners
    if (filterOption) {
        filterOption.dispatchEvent(new Event("change"));
    }

    if (sortOption) {
        sortOption.dispatchEvent(new Event("change"));
    }
}

// -------------- SETTINGS → CHANGE DEFAULT PRIORITY --------------
const defaultPriority =
    document.getElementById("default-priority");

if (defaultPriority) {
    defaultPriority.addEventListener("change", function () {
        const preferences = getTaskPreferences();
        preferences.priority = this.value;
        saveTaskPreferences(preferences);

        // Immediately apply it to Quick Add Task
        const taskPriority =
            document.getElementById("task-priority");

        if (taskPriority) {
            taskPriority.value = this.value;
        }
    });
}

// --------------- SETTINGS → CHANGE DEFAULT FILTER --------------------

const defaultFilter =
    document.getElementById("default-filter");

if (defaultFilter) {
    defaultFilter.addEventListener("change", function () {
        const preferences = getTaskPreferences();
        preferences.filter = this.value;
        saveTaskPreferences(preferences);

        // Immediately change My Tasks filter
        const filterOption =
            document.getElementById("filter-option");

        if (filterOption) {
            filterOption.value = this.value;
            filterOption.dispatchEvent(
                new Event("change")
            );
        }
    });
}


// ---------------- SETTINGS → CHANGE DEFAULT SORT ------------------

const defaultSort =
    document.getElementById("default-sort");

if (defaultSort) {
    defaultSort.addEventListener("change", function () {
        const preferences = getTaskPreferences();
        preferences.sort = this.value;
        saveTaskPreferences(preferences);

        // Immediately change My Tasks sorting
        const sortOption =
            document.getElementById("sort-option");

        if (sortOption) {
            sortOption.value = this.value;
            sortOption.dispatchEvent(
                new Event("change")
            );
        }
    });
}

// ----------------- LOAD SETTINGS WHEN PAGE LOADS ---------------------- 

document.addEventListener("DOMContentLoaded", function () {
    loadTaskPreferences();
    applyTaskPreferences();
});


// =============== DATA & ACCOUNT ==============

// ------------------ 1. CLEAR ALL TASKS -------------------

const clearTasksBtn = document.getElementById("clear-tasks");

if (clearTasksBtn) {

    clearTasksBtn.addEventListener("click", function () {

        const confirmClear = confirm(
            "Are you sure you want to clear all tasks? This action cannot be undone."
        );

        if (!confirmClear) {
            return;
        }

        // 1. Clear tasks from memory
        tasks = [];
        currentTasks = [];

        // 2. Clear tasks from localStorage
        localStorage.setItem("tasks", JSON.stringify(tasks));

        // 3. Refresh every task-related section
        displayDashboardTasks(tasks);
        displayOverdueTasks();
        refreshTaskPage();
        displayTodaySchedule();
        displayUpcomingDeadlines();

        // 4. Refresh statistics
        updateStats();

        // 5. Refresh Recent Tasks
        updateRecentTasks();

        // 6. Refresh analytics
        updateProductivityOverview();
        updateTaskProgress();
        updatePriorityAnalysis();
        updateSubjectPerformance();

        // 7. Refresh notifications
        refreshNotifications();

        alert("All tasks have been cleared.");

    });

}

// ----------2. RESET SETTINGS--------


const resetSettingsBtn =
    document.getElementById("reset-settings");

if (resetSettingsBtn) {
    resetSettingsBtn.addEventListener("click", function () {
        const confirmReset = confirm(
            "Are you sure you want to reset all settings to their default values?"
        );

        if (!confirmReset) {
            return;
        }

        // Default settings
        const defaultSettings = {
            priority: "high",
            filter: "all",
            sort: "newest"

        };

        // Save default settings
        localStorage.setItem(
            "taskPreferences",
            JSON.stringify(defaultSettings)
        );

        // Update settings page
        const defaultPriority =
            document.getElementById("default-priority");

        const defaultFilter =
            document.getElementById("default-filter");

        const defaultSort =
            document.getElementById("default-sort");

        if (defaultPriority) {
            defaultPriority.value = "high";
        }

        if (defaultFilter) {
            defaultFilter.value = "all";
        }

        if (defaultSort) {
            defaultSort.value = "newest";
        }

        // Update Quick Add Task priority
        const taskPriority =
            document.getElementById("task-priority");

        if (taskPriority) {
            taskPriority.value = "high";
        }

        // Update My Tasks filter
        const filterOption =
            document.getElementById("filter-option");

        if (filterOption) {
            filterOption.value = "all";
            filterOption.dispatchEvent(
                new Event("change")
            );
        }

        // Update My Tasks sort
        const sortOption =
            document.getElementById("sort-option");

        if (sortOption) {
            sortOption.value = "newest";
            sortOption.dispatchEvent(
                new Event("change")
            );
        }

        alert("Settings have been reset to default.");
    });
}

//RESPONSIVE

const profile = document.querySelector(".profile");
const profileIcon = document.querySelector(".profile > i");
const closeProfile = document.querySelector(".profile-close");

profileIcon.addEventListener("click", (event) => {
    event.stopPropagation();

    profile.classList.add("show");

    console.log("Profile opened");
});

closeProfile.addEventListener("click", (event) => {
    event.stopPropagation();

    profile.classList.remove("show");
});

const hamburger = document.querySelector("#hamburger");
const sidebar = document.querySelector(".sidebar");

hamburger.addEventListener("click", () => {
    sidebar.classList.toggle("open");
});

page_links.forEach(link => {
    link.addEventListener("click", () => {
        sidebar.classList.remove("open");
    });
});

