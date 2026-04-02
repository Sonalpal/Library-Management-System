
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
getAuth
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import {getFirestore} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// 🔥 PASTE YOUR FIREBASE CONFIG HERE
const firebaseConfig = {
apiKey: "AIzaSyCyyJyb_J5VYsZUqNNTP1dez4wqgzxdmYI",
authDomain: "library-management-syste-b1539.firebaseapp.com",
projectId: "library-management-syste-b1539"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
export {auth,db};
