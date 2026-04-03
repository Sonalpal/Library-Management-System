import { auth, db } from "../firebase.js";

import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

import {
  onAuthStateChanged,
  signOut,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

let titleInput = document.getElementById("titleInput");
let authorInput = document.getElementById("authorInput");
let categoryInput = document.getElementById("categoryInput");
let addBtn = document.getElementById("addBtn");
let bookList = document.getElementById("bookList");

// ================= AUTH =================

onAuthStateChanged(auth, (user) => {
  if (!user) {
    window.location.href = "../login/login.html";
  } else {
    document.getElementById("adminEmail").textContent = user.email;
    document.body.style.display = "block";
    loadBooks();
  }
});

// ================= LOGOUT =================

document.getElementById("logoutBtn").addEventListener("click", async () => {
  await signOut(auth);
  window.location.href = "../login/login.html";
});

// ================= ADD BOOK =================

addBtn.addEventListener("click", async () => {
  let title = titleInput.value.trim();
  let author = authorInput.value.trim();
  let category = categoryInput.value;

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

  titleInput.value = "";
  authorInput.value = "";

  loadBooks();
});

// ================= LOAD =================

async function loadBooks() {
  bookList.innerHTML = "";

  let snapshot = await getDocs(collection(db, "books"));

  snapshot.forEach((docSnap) => {
    let book = { id: docSnap.id, ...docSnap.data() };
    bookList.appendChild(createBookItem(book));
  });
}

// ================= CREATE ITEM =================

function createBookItem(book) {
  let li = document.createElement("li");

  let text = document.createElement("span");
  text.textContent = `${book.title} - ${book.author} (${book.category}) | Qty: ${book.quantity}`;

  let btnGroup = document.createElement("div");
  btnGroup.classList.add("btn-group");

  // ➕ Increase Quantity
  let plus = document.createElement("button");
  plus.textContent = "+";
  plus.classList.add("qty");

  plus.addEventListener("click", async () => {
    let ref = doc(db, "books", book.id);
    await updateDoc(ref, { quantity: book.quantity + 1 });
    loadBooks();
  });

  // ➖ Decrease Quantity
  let minus = document.createElement("button");
  minus.textContent = "-";
  minus.classList.add("qty");

  minus.addEventListener("click", async () => {
    if (book.quantity <= book.issuedCount) {
      alert("Cannot reduce. Books issued!");
      return;
    }

    let ref = doc(db, "books", book.id);
    await updateDoc(ref, { quantity: book.quantity - 1 });
    loadBooks();
  });

  // ✏️ EDIT
  let edit = document.createElement("button");
  edit.textContent = "Edit";
  edit.classList.add("edit");

  edit.addEventListener("click", async () => {
    let newTitle = prompt("Edit title", book.title);
    let newAuthor = prompt("Edit author", book.author);

    if (!newTitle || !newAuthor) return;

    let ref = doc(db, "books", book.id);
    await updateDoc(ref, {
      title: newTitle,
      author: newAuthor,
    });

    loadBooks();
  });

  // 🗑 DELETE
  let del = document.createElement("button");
  del.textContent = "Delete";
  del.classList.add("delete");

  del.addEventListener("click", async () => {
    if (book.issuedCount > 0) {
      alert("Cannot delete issued book");
      return;
    }

    await deleteDoc(doc(db, "books", book.id));
    loadBooks();
  });

  btnGroup.appendChild(plus);
  btnGroup.appendChild(minus);
  btnGroup.appendChild(edit);
  btnGroup.appendChild(del);

  li.appendChild(text);
  li.appendChild(btnGroup);

  return li;
}
