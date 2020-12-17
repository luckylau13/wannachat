import logo from './logo.svg';
import './App.css';
import React, {useEffect, useRef, useState} from 'react';
import firebase from 'firebase/app';
import 'firebase/firestore';
import 'firebase/auth';

import {useAuthState} from 'react-firebase-hooks/auth';
import {useCollectionData} from 'react-firebase-hooks/firestore';

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDM6yINT8JBx7y1fIAHcsxchA6zbwMAFME",
  authDomain: "wannachat-68f70.firebaseapp.com",
  projectId: "wannachat-68f70",
  storageBucket: "wannachat-68f70.appspot.com",
  messagingSenderId: "815910489521",
  appId: "1:815910489521:web:19d43f36e193b1aba94190",
  measurementId: "G-MVX5RC3S8M"
};

const auth = firbase.auth();
const firestore = firebase.firestore();


function App() {
  
  const [user] = useAuthState(auth);

  return (
    <div className="App">
      <SignOut />
      <section>
        {/* Shows chatroom if user is logged in
        else show signin page */}
        {user ? <ChatRoom /> : <SignIn />}
      </section>
    </div>
  );
}

function SignIn() {
  const signInWithGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider);
  }
  return (
    <div>
      <button onClick={signInWithGoogle}>Sign In With Google</button>
    </div>
  )
}
function SignOut() {
  return auth.currentUser && (
    <div>
      <button onClick={() => auth.signOut()}>Sign Out</button>
    </div>
  )
}
function ChatRoom() {
  // we will use this to scroll to bottom of chat on page-reload and after sending a message
  const dummy = useRef();
  const scrollToBottom = () => {
    dummy.current.scrollIntoView({ behavior: 'smooth' });
  }

  // getting the message and sorting them by time of creation
  const messagesRef = firestore.collection('messages');
  const query = messagesRef.orderBy('createdAt', 'asc').limitToLast(25);

  const [messages] = useCollectionData(query, {idField: 'id'});

  return (
    <div>
      <div>
        {/* we will loop over the message and return a
        ChatMessage component for each message */}
        {messages && messages.map(msg => <ChatMessage key={msg.id} message={msg} />)}
        <span ref={dummy}></span>
      </div>

      {/* Form to type and submit messages */}
      <form onSubmit={sendMessage}>
        <input value={formValue} onChange={(e) => setFormValue(e.target.value)} placeholder="Say something" />
        <button type="submit" disabled={!formValue}>send</button>
      </form>
    </div>
  )
}

const sendMessage = async (e) => {
  e.preventDefault();
  // gets name, userID and pfp of logged in user
  const { displayName, uid, photoURL } = auth.currentUser;

  await messagesRef.add({
    user: displayName,
    body: formValue,
    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    uid: uid,
    photoURL: photoURL
  })

  // resetting form value and scrolling to bottom
  setFormValue('');
  dummy.current.scrollIntoView({ behavior: 'smooth' });
}

function ChatMessage(props) {
  const { user, body, uid, photoURL, createdAt } = props.message;

    return (
      <div>
       <div>
            <img src={photoURL || 'https://i.imgur.com/rFbS5ms.png'} alt="{user}'s pfp" />
        </div>
        <div>
            <p>{user}</p>
            <p>{body}</p>
       </div>
      </div>
      
  )
}

export default App;
