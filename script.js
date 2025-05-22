const add_emp_btn = document.getElementById("add-emp-btn");

const emp_form_div = document.querySelector(".employee-detail-form");
const dashboard = document.querySelector(".main");

const form = document.getElementById("details-form");

const baseURL = "http://localhost:3000/employees";

let currentEditId = null;

//add event listner
add_emp_btn.addEventListener("click", () => {
  emp_form_div.style.visibility = "visible";
  dashboard.style.visibility = "hidden";
  dashboard.style.position = "absolute";
});

//take the data of the employee and make it into an object
let emp_data = {};
document
  .getElementById("details-form")
  .addEventListener("submit", async function (e) {
    e.preventDefault();
    const form = document.getElementById("details-form");
    const formData = new FormData(form);
    emp_data = Object.fromEntries(formData);

    //regex for validation
    const patterns = {
      employeeId: /^\d+$/,
      employeeName: /^[A-Za-z\s]{2,50}$/,
      employeeEmail: /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/,
      employeeDept: /^[A-Za-z\s]{2,50}$/,
      salaryOfEmployee: /^\d+$/,
      joiningDateOfEmp: /^\d{4}-\d{2}-\d{2}$/,
    };

    for (let field in patterns) {
      if (!patterns[field].test(emp_data[field])) {
        alert(`Invalid ${field} value`);
        return;
      }
    }

    try {
      if (currentEditId) {
        await updateEmployee(currentEditId, emp_data);
        alert("Employee updated successfully");
        currentEditId = null;
      } else {
        await createEmp(emp_data);
        alert("Employee added successfully");
      }

      form.reset();
      emp_form_div.style.visibility = "hidden";
      dashboard.style.visibility = "visible";
      dashboard.style.position = "static";
      renderEmp();
    } catch (err) {
      console.log("Error: ", err);
      alert("Failed to save data");
    }
  });

//crud operations functions

//CREATE
async function createEmp(data) {
  return fetch(baseURL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  }).then((res) => res.json());
}

//GET
async function getAllEmp() {
  return fetch(baseURL).then((res) => res.json());
}

// READ
async function getEmployeeById(empId) {
  return fetch(`${baseURL}?employeeId=${empId}`)
    .then((res) => (res.ok ? res.json() : null))
    .then((data) => (data && data.length > 0 ? data[0] : null));
}

// UPDATE
async function updateEmployee(id, updatedData) {
  return fetch(`${baseURL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updatedData),
  }).then((res) => res.json());
}

// DELETE
async function deleteEmployee(id) {
  return fetch(`${baseURL}/${id}`, {
    method: "DELETE",
  }).then((res) => res.ok);
}

//render the emp in the table after every operation
function renderEmp() {
  getAllEmp().then((data) => {
    const tbody = document.querySelector("#emp-table tbody");
    tbody.innerHTML = "";
    data.forEach((emp) => {
      tbody.insertAdjacentHTML(
        "beforeend",
        `<tr data-id="${emp.id}">
           <td>${emp.employeeId}</td>
           <td>${emp.employeeName}</td>
           <td>${emp.employeeEmail}</td>
           <td>${emp.employeeDept}</td>
           <td>${emp.salaryOfEmployee}</td>
           <td>${emp.joiningDateOfEmp}</td>
           <td>
             <button class="edit-btn"><i class="fa-solid fa-pen-to-square"></i></button>
             <button class="delete-btn"><i class="fa-solid fa-trash"></i></button>
           </td>
         </tr>`
      );
    });
  });

  updateStats();
}

document.addEventListener("DOMContentLoaded", renderEmp);

//search button GET details by ID
document.getElementById("search-button").addEventListener("click", () => {
  const id = document.getElementById("search-input").value.trim();
  if (!id) return;
  // console.log(id);

  getEmployeeById(id).then((emp) => {
    if (!emp) {
      alert("Employee not found");
      return;
    }

    const tbody = document.querySelector("#emp-table tbody");
    tbody.innerHTML = ""; //clear the table and show only the ID emp.

    tbody.insertAdjacentHTML(
      "beforeend",
      `<tr data-id="${emp.id}">
           <td>${emp.employeeId}</td>
           <td>${emp.employeeName}</td>
           <td>${emp.employeeEmail}</td>
           <td>${emp.employeeDept}</td>
           <td>${emp.salaryOfEmployee}</td>
           <td>${emp.joiningDateOfEmp}</td>
           <td>
             <button class="edit-btn"><i class="fa-solid fa-pen-to-square"></i></button>
             <button class="delete-btn"><i class="fa-solid fa-trash"></i></button>
           </td>
         </tr>`
    );
  });
});

//sort button event listner
document.getElementById("sort-button").addEventListener("click", async () => {
  let obj = await getAllEmp();
  obj.sort((a, b) => Number(b.employeeId) - Number(a.employeeId));

  const tbody = document.querySelector("#emp-table tbody");
  tbody.innerHTML = "";

  obj.forEach((emp) => {
    tbody.insertAdjacentHTML(
      "beforeend",
      `<tr data-id="${emp.id}">
         <td>${emp.employeeId}</td>
         <td>${emp.employeeName}</td>
         <td>${emp.employeeEmail}</td>
         <td>${emp.employeeDept}</td>
         <td>${emp.salaryOfEmployee}</td>
         <td>${emp.joiningDateOfEmp}</td>
         <td>
           <button class="edit-btn"><i class="fa-solid fa-pen-to-square"></i></button>
           <button class="delete-btn"><i class="fa-solid fa-trash"></i></button>
         </td>
       </tr>`
    );
  });
});

//edit the entry
document.querySelector("#emp-table tbody").addEventListener("click", (e) => {
  const editBtn = e.target.closest(".edit-btn");
  const delBtn = e.target.closest(".delete-btn");

  if (editBtn) {
    const tr = editBtn.closest("tr");
    const internalId = tr.getAttribute("data-id");

    emp_form_div.style.visibility = "visible";
    dashboard.style.visibility = "hidden";
    dashboard.style.position = "absolute";

    document.getElementById("empId").value = tr.children[0].textContent;
    document.getElementById("name").value = tr.children[1].textContent;
    document.getElementById("email").value = tr.children[2].textContent;
    document.getElementById("department").value = tr.children[3].textContent;
    document.getElementById("salary").value = tr.children[4].textContent;
    document.getElementById("start-date").value = tr.children[5].textContent;

    currentEditId = internalId;
  }

  if (delBtn) {
    const tr = delBtn.closest("tr");
    const empId = tr.getAttribute("data-id");

    deleteEmployee(empId)
      .then((success) => {
        if (success) {
          alert("Employee deleted successfully");
          renderEmp();
        } else {
          alert("Failed to delete employee");
        }
      })
      .catch((err) => {
        console.log("Error: ", err);
        alert("Error deleting employee");
      });
  }
});

//application stats
async function updateStats() {
  const employees = await getAllEmp();

  const totalEmp = employees.length;
  let totalSalary = 0;
  let highestSalary = 0;

  employees.forEach((emp) => {
    const sal = Number(emp.salaryOfEmployee);
    totalSalary += sal;
    if (sal > highestSalary) highestSalary = sal;
  });

  const averageSalary = totalEmp ? (totalSalary / totalEmp).toFixed(2) : 0;

  document.querySelector("#total-emp h3").textContent = totalEmp;
  document.querySelector("#total-salary h3").textContent = `₹${totalSalary}`;
  document.querySelector(
    "#average-salary h3"
  ).textContent = `₹${averageSalary}`;
  document.querySelector(
    "#highest-salary h3"
  ).textContent = `₹${highestSalary}`;
}
