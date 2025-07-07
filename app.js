document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("unifiedForm");
  const formType = document.getElementById("formType");
  const timeFields = document.getElementById("timeFields");
  const startTime = document.getElementById("startTime");
  const endTime = document.getElementById("endTime");
  const hoursInput = document.getElementById("hours");

  // ✅ Universal hour calculation function
  function calculateHours(startTime, endTime) {
    if (!startTime || !endTime) return "";
    const start = new Date(`1970-01-01T${startTime}`);
    let end = new Date(`1970-01-01T${endTime}`);
    if (end < start) {
      end.setDate(end.getDate() + 1); // Add 1 day if crossing midnight
    }
    const diff = (end - start) / 1000 / 60 / 60;
    return diff.toFixed(2);
  }

  // ⏰ Show/hide time fields for relevant forms
  formType.addEventListener("change", () => {
    const showTime = ["Overtime Work Application", "Early Out Application Form", "Failure to Time In/Out", "Official Business Trip"].includes(formType.value);
    timeFields.style.display = showTime ? "block" : "none";
  });

  // ⏱ Auto-calculate hours on time input
  [startTime, endTime].forEach(input => {
    input.addEventListener("input", () => {
      if (startTime.value && endTime.value) {
        hoursInput.value = calculateHours(startTime.value, endTime.value);
      }
    });
  });

  // 📝 Form submission
  form.addEventListener("submit", e => {
  e.preventDefault();

  const confirmSubmit = confirm("Are you sure you want to submit this record?");
  if (!confirmSubmit) return;

  const record = {
    formType: formType.value,
    name: document.getElementById("namePosition").value.trim(),
    department: document.getElementById("assigndepartment").value.trim(),
    dateFiled: document.getElementById("dateFiled").value,
    leaveDate: document.getElementById("leaveDate").value,
    leaveType: leaveType.style.display === "block" ? leaveType.value : "",
    reason: document.getElementById("reason").value.trim(),
    timeStart: timeStart.value || "",
    timeEnd: timeEnd.value || "",
    hours: timeFields.style.display === "block" ? calculateHours(timeStart.value, timeEnd.value) : ""
  };

  fetch("https://your-backend.com/api/records", {
  method: "POST",
  headers: {
    "Content-Type": "application/json"
  },
  body: JSON.stringify(record)
})
.then(res => res.json())
.then(() => {
  Swal.fire({
    icon: "success",
    title: "Submitted!",
    text: "Record has been saved successfully.",
    showConfirmButton: false,
    timer: 1500
  });
  form.reset();
  leaveType.style.display = leaveTypeLabel.style.display = "none";
  timeFields.style.display = "none";
})
.catch(error => {
  console.error("Error saving record:", error);
  alert("Error saving record online.");
});


  form.reset();
  leaveType.style.display = leaveTypeLabel.style.display = "none";
  timeFields.style.display = "none";
});

  

  // 🔍 Search functionality
  function filterRecords() {
    const input = document.getElementById("searchInput").value.toLowerCase();
    const rows = document.querySelectorAll("#recordsTable tbody tr");

    rows.forEach(row => {
      const nameCell = row.cells[0];
      const deptCell = row.cells[1];
      const nameText = nameCell.getAttribute("data-original") || nameCell.innerText;
      const deptText = deptCell.getAttribute("data-original") || deptCell.innerText;

      if (!nameCell.getAttribute("data-original")) nameCell.setAttribute("data-original", nameText);
      if (!deptCell.getAttribute("data-original")) deptCell.setAttribute("data-original", deptText);

      const nameMatch = nameText.toLowerCase().includes(input);
      const deptMatch = deptText.toLowerCase().includes(input);

      if (nameMatch || deptMatch) {
        row.style.display = "";
        nameCell.innerHTML = nameMatch && input ? nameText.replace(new RegExp(`(${input})`, "gi"), `<mark>$1</mark>`) : nameText;
        deptCell.innerHTML = deptMatch && input ? deptText.replace(new RegExp(`(${input})`, "gi"), `<mark>$1</mark>`) : deptText;
      } else {
        row.style.display = "none";
        nameCell.innerHTML = nameText;
        deptCell.innerHTML = deptText;
      }
    });
  }

  // 📋 Form field toggles
  const leaveType = document.getElementById("leaveType");
  const leaveTypeLabel = document.querySelector('label[for="leaveType"]');
  const timeFieldsWrapper = document.getElementById("timeFieldsWrapper");

  function toggleLeaveType(selectedForm) {
    const show = selectedForm === "Application for Leave";
    leaveType.style.display = show ? "block" : "none";
    leaveTypeLabel.style.display = show ? "block" : "none";
    if (!show) leaveType.value = "";
  }

  function toggleTimeFields() {
    if (!formType || !timeFieldsWrapper) return;
    const show = ["Overtime Work Application", "Early Out Application Form", "Failure to Time In/Out", "Official Business Trip"].includes(formType.value);
    timeFieldsWrapper.style.display = show ? "block" : "none";
    if (!show) {
      if (startTime) startTime.value = "";
      if (endTime) endTime.value = "";
    }
  }

  if (formType) {
    toggleLeaveType(formType.value);
    toggleTimeFields();
    formType.addEventListener("change", function () {
      toggleLeaveType(this.value);
      toggleTimeFields();
    });
  }
});

// ✏️ Edit/delete/export utilities
function editRecord(id, key, value) {
  fetch(`https://your-backend.com/api/records/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ [key]: value })
  })
  .then(res => res.json())
  .then(() => {
    alert("Record updated!");
  })
  .catch(err => {
    console.error("Error updating:", err);
  });
}



function deleteRecord(id) {
  fetch(`https://your-backend.com/api/records/${id}`, {
    method: "DELETE"
  })
  .then(() => {
    alert("Record deleted.");
    location.reload();
  })
  .catch(err => console.error("Delete error:", err));
}


function exportToExcel() {
  fetch("https://your-backend.com/api/records")
  .then(res => res.json())
  .then(records => {
    let csv = "Name,Department,Date Filed,Leave Date,Leave Type,Reason,Time Start,Time End,Hours\n";
    records.forEach(r => {
      csv += `${r.name},${r.department},${r.dateFiled},${r.leaveDate || r.dateOfLeave},${r.leaveType},${r.reason},${r.timeStart || ""},${r.timeEnd || ""},${r.hours || ""}\n`;
    });
    const blob = new Blob([csv], { type: "text/csv" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "records.csv";
    link.click();
  })
  .catch(err => {
    console.error("Export error:", err);
    alert("Failed to export records.");
  });

  let csv = "Name,Department,Date Filed,Leave Date,Leave Type,Reason,Time Start,Time End,Hours\n";
  records.forEach(r => {
    csv += `${r.name},${r.department},${r.dateFiled},${r.leaveDate || r.dateOfLeave},${r.leaveType},${r.reason},${r.timeStart || ""},${r.timeEnd || ""},${r.hours || ""}\n`;
  });
  const blob = new Blob([csv], { type: "text/csv" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "records.csv";
  link.click();
}


