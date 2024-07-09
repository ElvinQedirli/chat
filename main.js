import { initializeApp } from "https://www.gstatic.com/firebasejs/9.14.0/firebase-app.js";
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.14.0/firebase-auth.js";
import { getFirestore, collection, addDoc, query, onSnapshot, orderBy, serverTimestamp, where } from "https://www.gstatic.com/firebasejs/9.14.0/firebase-firestore.js";


// basqa userler mesaj gondere biilmir no:130
// const q = query(collection(db, "users"), where("uid", "!==", currentUser.uid)); bu koda bax, mebde oz adim da cixir digerlerinde yox
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
const sendBtn = document.querySelector('.send_btn');
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
    try {
        const result = await signInWithPopup(auth, provider);
        currentUser = result.user;
        await addDoc(collection(db, "users"), {
            uid: currentUser.uid,
            name: currentUser.displayName
        });
        loadUsers();
    } catch (error) {
        console.error('Giris zamani xeta:', error);
    }
};

const loadUsers = () => {
    const q = query(collection(db, "users"), where("uid", "!==", currentUser.uid));
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
    console.log('secilmis user:', selectedUser.name);
    loadMessages();
};

const loadMessages = () => {
    if (!selectedUser) return;

    console.log('secilmis userden mesajlar yuklenir:', selectedUser.name);

    const q1 = query(
        collection(db, "messages"),
        where("from", "==", currentUser.uid),
        where("to", "==", selectedUser.uid),
        orderBy("timestamp")
    );

    const q2 = query(
        collection(db, "messages"),
        where("from", "==", selectedUser.uid),
        where("to", "==", currentUser.uid),
        orderBy("timestamp")
    );

    onSnapshot(q1, snapshot => {
        console.log('secilmis userin mesajlari:', snapshot.size);
        messagesDiv.innerHTML = "";
        snapshot.forEach(doc => {
            const message = doc.data();
            const messageDiv = document.createElement('div');
            messageDiv.classList.add('message');
            messageDiv.textContent = `You: ${message.text}`;
            messagesDiv.appendChild(messageDiv);
        });
    });

    onSnapshot(q2, snapshot => {
        console.log('secilmis userden gelen mesajlar:', snapshot.size);
        snapshot.forEach(doc => {
            const message = doc.data();
            const messageDiv = document.createElement('div');
            messageDiv.classList.add('message');
            messageDiv.textContent = `${selectedUser.name}: ${message.text}`;
            messagesDiv.appendChild(messageDiv);
        });
    });
};

sendBtn.addEventListener('click', async (e) => {
    e.preventDefault();
    if (messageInput.value && selectedUser) {
        try {
            await addDoc(collection(db, "messages"), {
                from: currentUser.uid,
                to: selectedUser.uid,
                text: messageInput.value,
                timestamp: serverTimestamp()
            });
            console.log('Mesaj gonderildi:', messageInput.value);
            messageInput.value = "";
        } catch (error) {
            console.error('mesaj gonderilme zamano xeta:', error);
        }
    } else {
        console.warn('mesaj yoxdur ve ya user secilmeyib');
    }
    // console.log("sasa");

});
