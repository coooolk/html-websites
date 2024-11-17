document.getElementById("addTaskBtn").addEventListener("click", function() {
     const taskInput = document.getElementById("taskInput");
     const taskText = taskInput.value.trim();
 
     if (taskText === "") {
         alert("Task cannot be empty!");
         return;
     }
 
     const taskList = document.getElementById("taskList");
 
     const listItem = document.createElement("li");
     listItem.innerText = taskText;
 
     // Mark task as completed when clicked
     listItem.addEventListener("click", function() {
         listItem.classList.toggle("completed");
     });
 
     // Create delete button
     const deleteBtn = document.createElement("button");
     deleteBtn.innerText = "Delete";
     deleteBtn.classList.add("delete-btn");
     deleteBtn.addEventListener("click", function() {
         taskList.removeChild(listItem);
     });
 
     listItem.appendChild(deleteBtn);
     taskList.appendChild(listItem);
 
     taskInput.value = ""; // Clear the input field
 });
 