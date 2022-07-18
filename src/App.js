import './App.css'
import React, {useState, useRef} from "react"
import { useAuthState } from 'react-firebase-hooks/auth'
import { useCollectionData } from "react-firebase-hooks/firestore"
import { db, auth,  signInWithGoogle, signOut } from "./firebase.js"
import { query, getDocs, addDoc, orderBy, limit, collection, serverTimestamp } from "firebase/firestore"
import send from "./send.png"


function App() {
  const [user] = useAuthState(auth)
  return (
    <div className="App">
      <header>
      <h1>⚛️🔥💬</h1>
        <SignOut />
      </header>
      <section>
        { user ? <ChatRoom /> : <SignIn /> }
      </section>
    </div>
  );
}

function SignIn() {
   return (
    <>
      <button className="sign-in" onClick={signInWithGoogle}>Sign in with Google</button>
     
    </>
   )
}

function SignOut() {
  return auth.currentUser && (
    <button className="sign-out" onClick={() => auth.signOut()}>Sign Out</button>
  )
}

function ChatRoom() {
   
   const [value, setValue] = useState('')
   const dummy = useRef()
   const messageRef = collection(db, "messages")
   const q = query(messageRef, orderBy("createdAt"), limit(25))
   const [messages] = useCollectionData(q, { idField: 'id' })
    console.log(messages)
   
   const sendMessage = async (e) => {
      e.preventDefault()
      const { uid, photoURL} = auth.currentUser
       console.log(messageRef)
      await addDoc(messageRef, {
         text: value,
         createdAt:  serverTimestamp(), 
         uid,
         photoURL
      })

      setValue('');
      dummy.current.scrollIntoView({ behavior: 'smooth' });
   }
   return (
    <>

      <main>
       {messages && messages.map(msg => <ChatMessage
         key={msg.id}
         message={msg}/>)}

         <span ref={dummy}></span>
      </main>
     
      <form onSubmit={sendMessage}>

       <input value={value} onChange={ e => setValue(e.target.value)} />
       <button type="submit"  disabled={!value}>
        <img src={send} alt="" />
       </button>
     </form>
      
    </>
   )
}

function ChatMessage({message}) {
   const { text, uid, photoURL} = message
   const messageClass = uid === auth.currentUser.uid ? 'sent' : 'received'
   return (
      <div className={`message ${messageClass}`}>
          <img src={photoURL || 'https://api.adorable.io/avatars/23/abott@adorable.png'} />
         <p> {text} </p>
      </div>
   )
}

export default App;
