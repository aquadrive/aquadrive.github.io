// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDVkj8iGmcdQAyirS_QPxedQpTQGwYghIc",
  authDomain: "aquadrive-6e5b9.firebaseapp.com",
  projectId: "aquadrive-6e5b9",
  storageBucket: "aquadrive-6e5b9.appspot.com",
  messagingSenderId: "340196943954",
  appId: "1:340196943954:web:5e78cd01fac288a1bed78b",
  measurementId: "G-E8G7BXKWME",
};

// Initialize Firebase app
firebase.initializeApp(firebaseConfig);

// Access Firestore through the firebase object
const db = firebase.firestore();

let editStatus = false;
let editTaskId = null; // Variable to store the ID of the task being edited

// Function to save a task to Firestore
const saveTask = async (title, description) => {
  if (!editStatus) {
    // Adding a new task
    await db.collection("tasks").doc().set({
      title,
      description,
    });
  } else {
    // Updating an existing task
    await db.collection("tasks").doc(editTaskId).update({
      title,
      description,
    });
    // Reset edit status and task ID
    editStatus = false;
    editTaskId = null;
    // Reset button text
    taskForm["btn-task-form"].innerText = "Save";
  }
};

// Function to get all tasks from Firestore
const getTasks = async () => {
  const querySnapshot = await db.collection("tasks").get();
  const tasks = [];
  querySnapshot.forEach((doc) => {
    tasks.push({ id: doc.id, ...doc.data() });
  });
  return tasks;
};

// Function to get a single task by ID from Firestore
const getTask = async (id) => {
  const doc = await db.collection("tasks").doc(id).get();
  if (doc.exists) {
    return { id: doc.id, ...doc.data() };
  } else {
    console.log("No such document!");
    return null;
  }
};

// Function to delete a task from Firestore
const deleteTask = async (id) => {
  await db.collection("tasks").doc(id).delete();
};

// Function to render tasks in the container
const renderTasks = async () => {
  const tasks = await getTasks();
  const taskContainer = document.getElementById("tasks-container");
  taskContainer.innerHTML = ""; // Clear the container before rendering tasks
  tasks.forEach((task) => {
    taskContainer.innerHTML += `
            <div class="card card-body mt-2 border-primary">
                <h3 class="h5">${task.title}</h3>
                <p>${task.description}</p>
                <div>
                    <button class="btn btn-primary btn-delete" data-id="${task.id}">Delete</button>
                    <button class="btn btn-secondary btn-edit" data-id="${task.id}">Edit</button>
                </div>
            </div>`;
  });

  // Selecting delete and edit buttons after rendering tasks
  const btnsDelete = document.querySelectorAll(".btn-delete");
  btnsDelete.forEach((btn) => {
    btn.addEventListener("click", async (e) => {
      const taskId = e.target.dataset.id;
      await deleteTask(taskId);
      renderTasks(); // Re-render tasks after deletion
    });
  });

  const btnsEdit = document.querySelectorAll(".btn-edit");
  btnsEdit.forEach((btn) => {
    btn.addEventListener("click", async (e) => {
      const taskId = e.target.dataset.id;
      const task = await getTask(taskId);
      console.log(task);
      // Here you can add logic to open an edit form or perform other edit actions
      if (task) {
        // Set edit status and task ID
        editStatus = true;
        editTaskId = task.id;
        // Update button text
        taskForm["btn-task-form"].innerText = "Update";
        // Fill form fields with task details
        taskForm["task-title"].value = task.title;
        taskForm["task-description"].value = task.description;
      }
    });
  });
};

// Load and render tasks on page load
window.addEventListener("DOMContentLoaded", () => {
  renderTasks();
});

// Accessing the task form
const taskForm = document.getElementById("task-form");

// Adding an event listener for form submission
taskForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  // Getting values from the form
  const title = taskForm["task-title"].value;
  const description = taskForm["task-description"].value;

  // Saving the task to Firestore
  await saveTask(title, description);

  // Clearing the form and focusing the title field
  taskForm.reset();
  taskForm["task-title"].focus();

  // Rendering the updated tasks
  renderTasks();
});

