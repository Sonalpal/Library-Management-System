import { auth, db } from "../firebase.js";

import {
  collection,
  getDocs,
  getDoc,
  updateDoc,
  deleteDoc,
  addDoc,
  doc,
  query,
  where,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

import {
  onAuthStateChanged,
  signOut,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

let allList = document.getElementById("allBookList");
let issuedList = document.getElementById("issuedBookList");
let availableList = document.getElementById("availBookList");

let books = [];

// ================= AUTH =================

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "../login/login.html";
  } else {
    let userRef = doc(db, "users", user.uid);
    let snap = await getDoc(userRef);

    if (!snap.exists()) {
      alert("User not found");
      return;
    }

    document.getElementById("userEmail").textContent =
      "👤 " + user.email.split("@")[0];

    loadBooks();
  }
});

// ================= LOGOUT =================

document.getElementById("logOut").addEventListener("click", async () => {
  await signOut(auth);
  window.location.href = "../login/login.html";
});

// ================= LOAD BOOKS =================

async function loadBooks() {
  books = [];

  let snapshot = await getDocs(collection(db, "books"));

  snapshot.forEach((docSnap) => {
    books.push({
      id: docSnap.id,
      ...docSnap.data(),
    });
  });

  renderBooks();
  loadIssuedBooks();
}

// ================= LOAD ISSUED =================

async function loadIssuedBooks() {
  issuedList.innerHTML = "";

  let q = query(
    collection(db, "issuedBooks"),
    where("userId", "==", auth.currentUser.uid),
  );

  let snapshot = await getDocs(q);

  if (snapshot.empty) {
    issuedList.innerHTML = "<p>No Books Issued</p>";
    return;
  }

  snapshot.forEach((docSnap) => {
    let data = docSnap.data();

    let book = {
      id: data.bookId,
      issuedDocId: docSnap.id,
      title: data.title,
      author: data.author,
      category: data.category,
      issuedCount: 1,
      duedate: data.duedate,
    };

    issuedList.appendChild(createBookItem(book, "issued"));
  });
}

// ================= RENDER =================

function renderBooks() {
  allList.innerHTML = "";
  availableList.innerHTML = "";

  books.forEach((book) => {
    allList.appendChild(createBookItem(book, "all"));

    if (book.quantity - (book.issuedCount || 0) > 0) {
      availableList.appendChild(createBookItem(book, "available"));
    }
  });

  if (!availableList.innerHTML) {
    availableList.innerHTML = "<p>No Books Available</p>";
  }
}
// ================= OVERDUE LOGIC =================

function getFineInfo(dueDateStr) {
  if (!dueDateStr) return null;

  let today = new Date();
  today.setHours(0, 0, 0, 0);

  let dueDate = new Date(dueDateStr);

  if (dueDate >= today) {
    return {
      overdue: false,
      text: "Due: " + dueDateStr,
    };
  }

  // calculate days late
  let diffMs = today - dueDate;
  let days = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  let fine = days * 5;

  return {
    overdue: true,
    text: `Overdue by ${days} days | Fine: ₹${fine}`,
  };
}

// ================= CREATE ITEM =================

function createBookItem(book, section) {
  let li = document.createElement("li");
  li.style.display = "flex";
  li.style.justifyContent = "space-between";

  let span = document.createElement("span");
  span.textContent = `${book.title} - ${book.author} (${book.category})`;

  let btn = document.createElement("button");

  // 🔁 BUTTON TEXT
  if (section === "issued") {
    btn.textContent = "Return";
  } else {
    btn.textContent = "Issue";
  }

  // ❌ Disable if not available
  if (section !== "issued" && book.quantity - (book.issuedCount || 0) <= 0) {
    btn.disabled = true;
    btn.textContent = "Unavailable";
  }

  // ================= CLICK =================

  btn.addEventListener("click", async () => {
    try {
      let bookRef = doc(db, "books", book.id);

      // 🔁 RETURN
      if (section === "issued") {
        await deleteDoc(doc(db, "issuedBooks", book.issuedDocId));

        await updateDoc(bookRef, {
          issuedCount: (book.issuedCount || 1) - 1,
        });
      }

      // 📚 ISSUE
      else {
        // ❌ Check availability
        if (book.quantity - (book.issuedCount || 0) <= 0) {
          alert("No copies available");
          return;
        }
        dateInput.style.display = "block";
        let dueDate = dateInput.value;

        // ❌ Check date selected
        console.log("outside date");
        if (!dueDate) {
          console.log("inside date");
          alert("Please select a return date");
          return;
        }

        await updateDoc(bookRef, {
          issuedCount: (book.issuedCount || 0) + 1,
        });

        await addDoc(collection(db, "issuedBooks"), {
          title: book.title,
          author: book.author,
          category: book.category,
          bookId: book.id,
          userId: auth.currentUser.uid,
          duedate: dueDate,
        });
      }

      loadBooks();
    } catch (err) {
      console.log(err);
    }
  });

  li.appendChild(span);
  // 📅 DUE DATE DISPLAY
  if (section === "issued") {
    let info = getFineInfo(book.duedate);

    let dueSpan = document.createElement("span");

    if (info) {
      dueSpan.textContent = info.text;
      dueSpan.style.marginLeft = "10px";

      // 🔴 highlight overdue
      if (info.overdue) {
        dueSpan.style.color = "red";
        dueSpan.style.fontWeight = "bold";
      } else {
        dueSpan.style.color = "#22c55e"; // green
      }
    }

    li.appendChild(dueSpan);
  }
  //date logic
  let dateInput = document.createElement("input");
  dateInput.type = "date";
  dateInput.style.marginRight = "8px";
  dateInput.style.display = "none";

  // set minimum date (today)
  let today = new Date().toISOString().split("T")[0];
  dateInput.min = today;

  // ONLY show for issue (not return)
  if (section !== "issued") {
    li.appendChild(dateInput);
  }
  li.appendChild(btn);

  return li;
}

// ================= SEARCH =================

document.getElementById("search").addEventListener("input", function () {
  let text = this.value.toLowerCase();

  document.querySelectorAll("#allBookList li").forEach((item) => {
    item.style.display = item.textContent.toLowerCase().includes(text)
      ? "flex"
      : "none";
  });
});
