
const employeeList = [
  "Noll Jeffrey", "Pawlyshyn Alice T.", "Gaquer Maurice J.", "Mahan Michael L.",
  "Pruitt Thummond D.", "Stillwell Shawn P.", "Kiewra Andrew J.",
  "Cunningham Christopher", "Vallecillo Nicholas", "Kube Joseph A.",
  "Bodnarchuk Keith", "Haggas Neil", "Kaufmann Eugene", "Manno Kevin"
];
const container = document.getElementById("entryContainer");

function createDropdown() {
  return '<label>Employee Name</label><select class="name" required>' +
    '<option value="">Select a name</option>' +
    employeeList.map(n => `<option value="${n}">${n}</option>`).join("") +
    '</select>';
}

function createTierInput() {
  return `
    <div class="tier">
      <label>Hours</label>
      <input type="number" step="0.01" class="hours" required />
      <label>Multiplier</label>
      <select class="multiplier" required>
        <option value="1">1x</option>
        <option value="1.5">1.5x</option>
        <option value="2">2x</option>
      </select>
    </div>
  `;
}

function addEmployeeEntry() {
  const div = document.createElement("div");
  div.className = "employee-set";
  div.innerHTML = `
    ${createDropdown()}
    <div class="tiers">${createTierInput()}</div>
    <button type="button" onclick="addTier(this)">+ Add More Hours</button>
    <label><input type="checkbox" class="phone" /> Phone</label>
    <label>Notes</label>
    <input type="text" class="notes" />
  `;
  container.appendChild(div);
}

function addTier(button) {
  const parent = button.parentElement.querySelector(".tiers");
  parent.insertAdjacentHTML("beforeend", createTierInput());
}

function undoLastSubmission() {
  fetch("https://script.google.com/macros/s/AKfycbyfawmqbnX05ZaRT2rlbfP-mYsGvePAD_sUTAvi3d1QaQ0riF-sx6866P6VJ1dPPo49dg/exec", {
    method: "POST",
    contentType: "application/json",
    body: JSON.stringify([{ type: "undo" }])
  })
  .then(r => r.text())
  .then(alert)
  .catch(err => alert("Undo failed."));
}

document.getElementById("overtimeForm").addEventListener("submit", function(e) {
  e.preventDefault();
  const entries = [];
  const today = new Date().toISOString().split("T")[0];
  document.querySelectorAll(".employee-set").forEach(set => {
    const names = [set.querySelector(".name").value];
    const phone = set.querySelector(".phone").checked;
    const notes = set.querySelector(".notes").value;
    const tiers = Array.from(set.querySelectorAll(".tier")).map(t => ({
      hours: t.querySelector(".hours").value,
      multiplier: t.querySelector(".multiplier").value
    })).filter(t => t.hours && t.multiplier);
    const ste = tiers.reduce((sum, t) => sum + parseFloat(t.hours) * parseFloat(t.multiplier), 0);
    entries.push({ names, phone, notes, tiers, date: today, subtract: false, ste });
  });

  const summary = entries.map(e => 
    `${e.names.join(", ")}\n` +
    e.tiers.map(t => `${t.hours} hrs @ ${t.multiplier}x`).join("\n") + `\n` +
    `Total STE: ${e.phone ? "Phone" : e.ste.toFixed(2)}\nNotes: ${e.notes || "-"}` 
  ).join("\n---\n");

  if (confirm("Confirm submission:\n\n" + summary)) {
    fetch("https://script.google.com/macros/s/AKfycbyfawmqbnX05ZaRT2rlbfP-mYsGvePAD_sUTAvi3d1QaQ0riF-sx6866P6VJ1dPPo49dg/exec", {
      method: "POST",
      contentType: "application/json",
      body: JSON.stringify(entries.map(e => ({
        names: e.names,
        date: e.date,
        phone: e.phone,
        notes: e.notes,
        subtract: false,
        tiers: e.tiers
      })))
    })
    .then(r => r.text())
    .then(msg => {
      alert(msg);
      container.innerHTML = "";
      addEmployeeEntry();
    })
    .catch(err => alert("Submission failed."));
  }
});

document.addEventListener("DOMContentLoaded", () => {
  setTimeout(addEmployeeEntry, 50);
});
