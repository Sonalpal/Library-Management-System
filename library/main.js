import { auth, db } from "../firebase.js";

import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

import {
  onAuthStateChanged,
  signOut,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

let TitleInput = document.getElementById("titleInput");
let AuthorInput = document.getElementById("authorInput");
let select = document.getElementById("selectInput");
let AddBtn = document.getElementById("addBtn");

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
    let userSnap = await getDoc(userRef);

    let role = userSnap.data().role;

    if (role === "admin") {
      document.getElementById("adminPage").style.display = "block";
      document.getElementById("userEmail").textContent =
        "👤 " + user.email.split("@")[0];
    }

    // document.body.style.display = "block";
    loadBooks();
  }
});

// ================= LOGOUT =================

let logoutBtn = document.getElementById("logOut");

if (logoutBtn) {
  logoutBtn.addEventListener("click", async () => {
    await signOut(auth);
    window.location.href = "../login/login.html";
  });
}

// ================= ADD BOOK =================

AddBtn.addEventListener("click", async () => {
  let title = TitleInput.value.trim();
  let author = AuthorInput.value.trim();
  let category = select.value;

  if (!title || !author) {
    alert("Fill all fields");
    return;
  }

  await addDoc(collection(db, "books"), {
    title,
    author,
    category,
    quantity: 1,
    issuedCount: 0,
  });

  TitleInput.value = "";
  AuthorInput.value = "";

  loadBooks();
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
  updateStates();
  loadIssuedBooks();
}

// ================= LOAD ISSUED =================

async function loadIssuedBooks() {
  issuedList.innerHTML = "";

  let q = query(
    collection(db, "issuedBooks"),
    where("userId", "==", auth.currentUser.uid), // ✅ FIXED FIELD NAME
  );

  let snapshot = await getDocs(q);

  if (snapshot.empty) {
    issuedList.innerHTML = "<p>No Books Issued</p>";
    return;
  }

  snapshot.forEach((docSnap) => {
    let data = docSnap.data();

    let book = {
      id: data.bookId, // ✅ book id
      issuedDocId: docSnap.id, // ✅ needed for return
      title: data.title,
      author: data.author,
      category: data.category,
      issuedCount: 1,
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

// ================= CREATE ITEM =================

function createBookItem(book, section) {
  let li = document.createElement("li");

  li.style.display = "flex";
  li.style.justifyContent = "space-between";

  let span = document.createElement("span");
  span.textContent = `${book.title} ${book.author} (${book.category})`;

  let issueBtn = document.createElement("button");

  // ❌ OLD: based on issuedCount
  // ✅ FIX: based on section
  issueBtn.textContent = section === "issued" ? "Return" : "Issue";

  issueBtn.addEventListener("click", async (e) => {
    e.stopPropagation();

    try {
      let bookRef = doc(db, "books", book.id);

      // ================= RETURN =================
      if (section === "issued") {
        // ❌ OLD: wrong query + wrong id
        // ✅ FIX: direct delete using issuedDocId

        await deleteDoc(doc(db, "issuedBooks", book.issuedDocId));

        await updateDoc(bookRef, {
          issuedCount: (book.issuedCount || 1) - 1,
        });
      }

      // ================= ISSUE =================
      else {
        if (book.quantity - (book.issuedCount || 0) <= 0) {
          alert("No copies available");
          return;
        }

        let dueDate = prompt("Enter return date (YYYY-MM-DD)");
        if (!dueDate) return;

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

  // ================= DELETE =================

  let delBtn = document.createElement("button");
  delBtn.textContent = "Delete";

  delBtn.addEventListener("click", async (e) => {
    e.stopPropagation();

    // ❌ OLD: no return
    if ((book.issuedCount || 0) > 0) {
      alert("Cannot delete issued book");
      return; // ✅ FIXED
    }

    await deleteDoc(doc(db, "books", book.id));
    loadBooks();
  });

  li.appendChild(span);
  li.appendChild(issueBtn);
  li.appendChild(delBtn);

  return li;
}

// ================= COUNTS =================

function updateStates() {
  document.getElementById("allCount").textContent = books.reduce(
    (sum, b) => sum + b.quantity,
    0,
  );

  document.getElementById("issueCount").textContent = books.reduce(
    (sum, b) => sum + (b.issuedCount || 0),
    0,
  );

  document.getElementById("availCount").textContent = books.reduce(
    (sum, b) => sum + (b.quantity - (b.issuedCount || 0)),
    0,
  );
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
