import React, {useEffect, useState, useRef} from 'react';
import './App.css';

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, query, orderBy, limit, serverTimestamp, addDoc } from'firebase/firestore';
import { getAuth, GoogleAuthProvider, signInWithPopup  } from "firebase/auth";

import {useAuthState} from 'react-firebase-hooks/auth';
import { useCollection, useCollectionData } from 'react-firebase-hooks/firestore';

import { getAnalytics } from "firebase/analytics";

// firebase.initializeApp({})
const firebaseConfig = {
  apiKey: "AIzaSyD8sS7zJyBVAfDlkT_YtkTG7oT6KV5JUj4",
  authDomain: "chatapp-8140a.firebaseapp.com",
  projectId: "chatapp-8140a",
  storageBucket: "chatapp-8140a.appspot.com",
  messagingSenderId: "772120803467",
  appId: "1:772120803467:web:527df30b00021bff5abc8e",
  measurementId: "G-30MZH1512N"
};
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);
function App() {
  const [user] = useAuthState(auth);

  return (
    <div className="App">
      <header className="App-header">

      </header>

      <section>
        {user ? <Chatroom /> : <SignIn/>}

      </section>
    </div>
  );
}

function SignIn() {
  const SignInWithGoogle = () => {
    const provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider);

  }
  return (
    <button onClick = {SignInWithGoogle}>Sign in with Google</button>
  )
}

function SignOut(){
  return auth.currentUser &&  (
    <button onClick = {() => auth.signOut()}>Sign Out</button>
  );
}

function Chatroom() {

  const dummy = useRef();
  // reference a firestore collection
  const messagesRef = collection(db, "messages");// firestore.collection('messages');
  // query documents in a collection
  const q = query(messagesRef,orderBy('createdAt'),limit(25));

  const [messages] = useCollectionData(q, {idField: 'id'});
  const [formValue, setFormValue] = useState('');
  const sendMessage = async(e) => {
    e.preventDefault();
    const {uid, photoURL} = auth.currentUser;
    await addDoc(messagesRef,{
      text: formValue,
      createdAt: serverTimestamp(),
      uid,
      photoURL
    })
    setFormValue('');
    dummy.current.scrollIntoView({behavior:'smooth'});
  }
  return (
    <>
      <div>
        {messages && messages.map(msg => <ChatMessage key = {msg.id} message = {msg} />)}
        <div ref={dummy}></div>
      
      </div>
      <form onSubmit={sendMessage}>
          <input value={formValue} onChange={(e) => setFormValue(e.target.value)} />
          <button type="submit">✈️</button>
      </form>

    </>
  )

}

function ChatMessage(props) {
  const {text, uid, photoURL} = props.message;
  const messageClass = uid == auth.currentUser.uid ? 'sent' : 'received';
  return (
    <div className={'message ${messageClass}'}>
      <img src={photoURL} />
      <p>{text}</p>

    </div>
  )
}

export default App;
