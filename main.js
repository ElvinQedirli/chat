import { initializeApp } from "https://www.gstatic.com/firebasejs/9.9.0/firebase-app.js";
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.9.0/firebase-auth.js";
import { getFirestore, collection, addDoc, query, onSnapshot, orderBy, serverTimestamp, where } from "https://www.gstatic.com/firebasejs/9.9.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAygqByGJW_kdLFrbaB4YXU-tOkLiO36I0",
  authDomain: "chat-4a156.firebaseapp.com",
  projectId: "chat-4a156",
  storageBucket: "chat-4a156.appspot.com",
  messagingSenderId: "384300109709",
  appId: "1:384300109709:web:52225cc18f6d41c222b7c4",
  measurementId: "G-78VN7EBTX5"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const userListDiv = document.querySelector('.user_list');
const messagesDiv = document.querySelector('.messages');
const messageForm = document.querySelector('.form');
const messageInput = document.querySelector('.message_input');
let currentUser = null;
let selectedUser = null;

onAuthStateChanged(auth, user => {
  if (user) {
    currentUser = user;
    loadUsers();
  } else {
    signIn();
  }
});

const signIn = async () => {
  const provider = new GoogleAuthProvider();
  await signInWithPopup(auth, provider);
};

const loadUsers = () => {
  const q = query(collection(db, "users"), where("uid", "!=", currentUser.uid));
  onSnapshot(q, snapshot => {
    userListDiv.innerHTML = "";
    snapshot.forEach(doc => {
      const user = doc.data();
      const userDiv = document.createElement('div');
      userDiv.classList.add('user');
      userDiv.textContent = user.name;
      userDiv.addEventListener('click', () => selectUser(user));
      userListDiv.appendChild(userDiv);
    });
  });
};

const selectUser = (user) => {
  selectedUser = user;
  loadMessages();
};

const loadMessages = () => {
  const q = query(collection(db, "messages"), where("from", "in", [currentUser.uid, selectedUser.uid]), where("to", "in", [currentUser.uid, selectedUser.uid]), orderBy("timestamp"));
  onSnapshot(q, snapshot => {
    messagesDiv.innerHTML = "";
    snapshot.forEach(doc => {
      const message = doc.data();
      const messageDiv = document.createElement('div');
      messageDiv.classList.add('message');
      messageDiv.textContent = `${message.from === currentUser.uid ? "You" : selectedUser.name}: ${message.text}`;
      messagesDiv.appendChild(messageDiv);
    });
  });
};

messageForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  if (messageInput.value && selectedUser) {
    await addDoc(collection(db, "messages"), {
      from: currentUser.uid,
      to: selectedUser.uid,
      text: messageInput.value,
      timestamp: serverTimestamp()
    });
    messageInput.value = "";
  }
});