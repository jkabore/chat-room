import React, { useContext,useEffect,useState  } from "react";
import { UserContext } from "../../UserContext";
import { Link,useParams  } from "react-router-dom";
import Messages from './messages/messages';
import './Chat.css'; 
import Input  from "./input/Input";
import io from "socket.io-client"

let socket;

const Chat = () => {
  const { user, setUser } = useContext(UserContext);
  const[message,setMessage]=useState('')
  const[messages,setMessages]=useState([])
  const ENDPT= "localhost:5000"
  let {room_id,room_name}=useParams();  

  useEffect(()=>{
    socket= io(ENDPT);  
    return()=>{
        socket.emit('join',{name:user.name,room_id,user_id:user._id});
        socket.off();
    }
},[])
useEffect(() => {
    socket.emit('get-messages-history', room_id)
    socket.on('output-messages', messages => {
        setMessages(messages)
    })
}, [])

useEffect(()=>{
    socket.on('message',message=>{
        setMessages([...messages,message])
    })
},[messages])
  const sendMessage=(e)=>{
         e.preventDefault()
         if(message){
            console.log(message)
            socket.emit("sendMessage",message,room_id,()=>setMessage(''))
         }
  }
  return (
    <div className="outerContainer">
            <div className="container">
                <Messages messages={messages} user_id={user._id} />
                <Input
                    message={message}
                    setMessage={setMessage}
                    sendMessage={sendMessage}
                />
            </div>
        </div>
  );
};

export default Chat;
