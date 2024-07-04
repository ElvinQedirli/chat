import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-app.js";
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.12.3/firebase-auth.js'
import { getFirestore, collection, addDoc, query, onSnapshot, orderBy, serverTimestamp, where } from 'https://www.gstatic.com/firebasejs/10.12.3/firebase-firestore.js'


const firebaseConfig = {
    apiKey: "AIzaSyArnY_Q-haLbnaIJwSOgr3p9NovVw9_wYU",
    authDomain: "chat-82f46.firebaseapp.com",
    projectId: "chat-82f46",
    storageBucket: "chat-82f46.appspot.com",
    messagingSenderId: "876618560894",
    appId: "1:876618560894:web:3d7aa767978e528656af2f"
};

const app = initializeApp(firebaseConfig)

const auth = getAuth(app)

const db = getFirestore(app)


const userList = document.querySelector('.user_list')
const chatWindow = document.querySelector('.chat_window')
const messagesDiv = document.querySelector('.messages')
const form = document.querySelector('.form')
const msgInput = document.querySelector('.message_input')

let currentUser = null;

let selectedUser = null;


onAuthStateChanged(auth, user => {
    if (user) {
        currentUser = user;
        loadUser()
    } else {
        signIn()
    }
})


const signIn = async () => {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider)
}


const loadUser = () => {
    const q = query(collection(db, 'users'), where('uid', "!=", currentUser.uid))
    onSnapshot(q, snapshot => {
        userList.innerHTML = '';
        snapshot.forEach(doc=>{
            const user = doc.data();
            const userElement = document.createElement('div')
            userElement.classList.add('user')
            userElement.textContent = user.name;
            userElement.addEventListener('click', () => selectUser(user))
        userList.appendChild(userElement)
        })
    })
}

const selectUser = (user) => {
    selectedUser = user;
    loadMessages()

}


const loadMessages = () => {
    const q = query(collection(db, 'messages'), where('from', 'in', [currentUser.uid, selectedUser.uid]), 
    where('to', 'in', [currentUser.uid, selectedUser.uid]), 
    orderBy('timestamp'));

    onSnapshot(q,snapshot=>{
messagesDiv.innerHTML = ""

snapshot.forEach(doc=>{
    const message = doc.data();
    const messageElement=document.createElement('div')
    messageElement.classList.add('message')
    messageElement.textContent=`${message.from === currentUser.uid ? 'You' : selectedUser.name}: ${message.text}`
    messagesDiv.appendChild(messageElement)
})
    })

}

form.addEventListener('submit', async(e)=>{
    e.preventDefault()
    if(msgInput.value && selectedUser){
        await addDoc(collection(db, "messages"),{
            from: currentUser.uid,
            to: selectedUser.uid,
            text:msgInput.value,
            timestamp: serverTimestamp()
        })
        msgInput.value=""
    }

    console.log('dfghjk');
})