import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore, enableIndexedDbPersistence, collection, addDoc, onSnapshot, query, where } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBW5iWg5mCgbzjF9MBdR32VJi4uX2JHf0A",
  authDomain: "mcb-database-b9815.firebaseapp.com",
  projectId: "mcb-database-b9815",
  storageBucket: "mcb-database-b9815.firebasestorage.app",
  messagingSenderId: "541175340452",
  appId: "1:541175340452:web:156f7c14ef081bde633531",
  measurementId: "G-Y2DY5J84RL"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

enableIndexedDbPersistence(db).catch(err => console.warn("Persistence error", err));

const provider = new GoogleAuthProvider();
document.getElementById("loginBtn").onclick = login;
document.getElementById("loginBtn2").onclick = login;
document.getElementById("logoutBtn").onclick = () => signOut(auth);

function login() { signInWithPopup(auth, provider).catch(console.error); }

let currentUser = null;
onAuthStateChanged(auth, user => {
  currentUser = user;
  if (user) {
    document.getElementById("signedOut").style.display = "none";
    document.getElementById("appContent").style.display = "block";
    document.getElementById("loginBtn").style.display = "none";
    document.getElementById("loginBtn2").style.display = "none";
    document.getElementById("logoutBtn").style.display = "inline-block";
    document.getElementById("userName").textContent = user.displayName;
    loadData();
  } else {
    document.getElementById("signedOut").style.display = "block";
    document.getElementById("appContent").style.display = "none";
    document.getElementById("loginBtn").style.display = "inline-block";
    document.getElementById("logoutBtn").style.display = "none";
    document.getElementById("userName").textContent = "";
  }
});

document.getElementById("syncBtn").onclick = () => {
  if (currentUser) loadData();
  else alert("Please login first");
};

// Navigation
document.querySelectorAll(".dropdown-content a").forEach(link => {
  link.addEventListener("click", e => {
    e.preventDefault();
    document.querySelectorAll("main section").forEach(sec => sec.classList.remove("active"));
    document.getElementById(link.dataset.page).classList.add("active");
  });
});

// Firestore helpers
function userCol(name) {
  return collection(db, "users", currentUser.uid, name);
}

// Work Log
document.getElementById("saveLogBtn").onclick = async () => {
  const data = {
    date: document.getElementById("logDate").value,
    site: document.getElementById("logSite").value,
    notes: document.getElementById("logNotes").value,
    created: Date.now()
  };
  await addDoc(userCol("workLogs"), data);
};

onSnapshot(() => query(userCol("workLogs")), snap => {
  let html = "";
  snap.forEach(doc => {
    const d = doc.data();
    html += `<div class="panel"><b>${d.date}</b> @ ${d.site}<br>${d.notes}</div>`;
  });
  document.getElementById("logsList").innerHTML = html;
  document.getElementById("homeLogs").innerHTML = html;
});

// Job Sites
document.getElementById("saveSiteBtn").onclick = async () => {
  const data = {
    name: document.getElementById("siteName").value,
    address: document.getElementById("siteAddress").value,
    contact: document.getElementById("siteContact").value,
    notes: document.getElementById("siteNotes").value,
    created: Date.now()
  };
  await addDoc(userCol("sites"), data);
};

onSnapshot(() => query(userCol("sites")), snap => {
  let html = "";
  let selectHtml = "";
  snap.forEach(doc => {
    const d = doc.data();
    html += `<div class="panel"><b>${d.name}</b><br>${d.address}<br>${d.contact}</div>`;
    selectHtml += `<option>${d.name}</option>`;
  });
  document.getElementById("sitesList").innerHTML = html;
  document.getElementById("logSite").innerHTML = selectHtml;
});

// Tasks
document.getElementById("addTaskBtn").onclick = async () => {
  const task = document.getElementById("newTask").value.trim();
  if (task) {
    await addDoc(userCol("tasks"), { text: task, created: Date.now() });
    document.getElementById("newTask").value = "";
  }
};

onSnapshot(() => query(userCol("tasks")), snap => {
  let html = "";
  snap.forEach(doc => {
    const d = doc.data();
    html += `<div class="panel">${d.text}</div>`;
  });
  document.getElementById("tasksList").innerHTML = html;
});

// Materials
document.getElementById("addMaterialBtn").onclick = async () => {
  const name = document.getElementById("materialName").value.trim();
  const qty = document.getElementById("materialQty").value;
  if (name) {
    await addDoc(userCol("materials"), { name, qty, created: Date.now() });
    document.getElementById("materialName").value = "";
    document.getElementById("materialQty").value = "";
  }
};

onSnapshot(() => query(userCol("materials")), snap => {
  let html = "";
  snap.forEach(doc => {
    const d = doc.data();
    html += `<div class="panel">${d.qty} × ${d.name}</div>`;
  });
  document.getElementById("materialsList").innerHTML = html;
  document.getElementById("homeMaterials").innerHTML = html;
});

// Events
document.getElementById("addEventBtn").onclick = async () => {
  const title = document.getElementById("eventTitle").value.trim();
  const date = document.getElementById("eventDate").value;
  if (title) {
    await addDoc(userCol("events"), { title, date, created: Date.now() });
    document.getElementById("eventTitle").value = "";
    document.getElementById("eventDate").value = "";
  }
};

onSnapshot(() => query(userCol("events")), snap => {
  let html = "";
  snap.forEach(doc => {
    const d = doc.data();
    html += `<div class="panel"><b>${d.title}</b> on ${d.date}</div>`;
  });
  document.getElementById("eventsList").innerHTML = html;
  document.getElementById("homeEvents").innerHTML = html;
});

// Reload data after login
function loadData() {
  console.log("Syncing data…");
}
