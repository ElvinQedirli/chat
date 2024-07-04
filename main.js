
    import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-app.js";
    import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.12.3/firebase-auth.js'
    import { getFirestore, collection, addDoc, query, onSnapshot, orderBy, serverTimestamp, where } from 'https://www.gstatic.com/firebasejs/10.12.3/firebase-firestore.js'


const firebaseConfig = {
    apiKey: "AIzaSyAygqByGJW_kdLFrbaB4YXU-tOkLiO36I0",
    authDomain: "chat-4a156.firebaseapp.com",
    projectId: "chat-4a156",
    storageBucket: "chat-4a156.appspot.com",
    messagingSenderId: "384300109709",
    appId: "1:384300109709:web:52225cc18f6d41c222b7c4",
    measurementId: "G-78VN7EBTX5"
};

const app = initializeApp(firebaseConfig)
const auth = getAuth(app)
const db = getFirestore(app)


const userList = document.querySelector('.user_list');
const chatWindow = document.querySelector('.chat_window');
const messagesDiv = document.querySelector('.messages');
const form = document.querySelector('.form');
const msgInput = document.querySelector('.message_input');

let currentUser = null;
let selectedUser = null;

onAuthStateChanged(auth, async user => {
  if (user) {
    currentUser = user;
    await checkAndAddUser(currentUser);
    loadUsers();
  } else {
    signIn();
  }
});

const signIn = async () => {
  const provider = new GoogleAuthProvider();
  try {
    await signInWithPopup(auth, provider);
  } catch (error) {
    console.error('hesab xetasi', error);
  }
};

const checkAndAddUser = async (user) => {
  const userRef = collection(db, "users");
  const q = query(userRef, where("uid", "==", user.uid));
  const querySnapshot = await onSnapshot(q, snapshot => {
    if (snapshot.empty) {
      addDoc(userRef, {
        uid: user.uid,
        name: user.displayName,
        email: user.email
      });
    }
  });
};

const loadUsers = () => {
  const q = query(collection(db, "users"), where('uid', "!=", currentUser.uid));
  onSnapshot(q, snapshot => {
    userList.innerHTML = '';
    if (snapshot.empty) {
      console.log("Kullanıcı bulunamadı.");
      return;
    }
    snapshot.forEach(doc => {
      const user = doc.data();
      const userElement = document.createElement('div');
      userElement.classList.add('user');
      userElement.textContent = user.name;
      userElement.addEventListener('click', () => selectUser(user));
      userList.appendChild(userElement);
    });
  });
};

const selectUser = (user) => {
  selectedUser = user;
  loadMessages();
};

const loadMessages = () => {
  const q = query(
    collection(db, 'messages'),
    where('from', 'in', [currentUser.uid, selectedUser.uid]),
    where('to', 'in', [currentUser.uid, selectedUser.uid]),
    orderBy('timestamp')
  );

  onSnapshot(q, snapshot => {
    messagesDiv.innerHTML = "";
    snapshot.forEach(doc => {
      const message = doc.data();
      const messageElement = document.createElement('div');
      messageElement.classList.add('message');
      messageElement.textContent = `${message.from === currentUser.uid ? 'You' : selectedUser.name}: ${message.text}`;
      messagesDiv.appendChild(messageElement);
    });
  });
};

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  if (msgInput.value && selectedUser) {
    try {
      await addDoc(collection(db, "messages"), {
        from: currentUser.uid,
        to: selectedUser.uid,
        text: msgInput.value,
        timestamp: serverTimestamp()
      });
      msgInput.value = "";
    } catch (error) {
      console.error('gonderme xetasi', error);
    }
  }
});