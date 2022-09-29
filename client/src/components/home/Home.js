import React, { useContext, useEffect, useState } from "react";
import { UserContext } from "../../UserContext";
import { useNavigate } from "react-router-dom";
import RoomList from "./RoomList";
import io from "socket.io-client";

let socket;

const Home = () => {
  let navigate = useNavigate();
  const { user, setUser } = useContext(UserContext);

  const ENDPT = "localhost:5000";
  const [room, setRoom] = useState("");
  const [rooms, setRooms] = useState([]);
  useEffect(() => {
    socket = io(ENDPT);
    return () => {
      socket.emit("disconnected");
      socket.off();
    };
  }, [ENDPT]);

  useEffect(() => {
    socket.on("output-rooms", (rooms) => {
      setRooms(rooms);
    });
  }, []);

  useEffect(() => {
    socket.on("create-room", (room) => {
      setRooms([...rooms, room]);
    });
  }, [rooms]);

  const handleSubmit = (e) => {
    e.preventDefault();
    socket.emit("create-room", room);
    console.log(room);
    setRoom("");
  };
  if (!user) {
    return  navigate("/login");
  }
  return (
    <div>
      <div className="row">
        <div className="col s12 m6">
          <div className="card blue-grey darken-1">
            <div className="card-content white-text">
              <span className="card-title">
                Welcome {user ? user.name : ""}
              </span>
              <div className="row">
                <form>
                  <div className="row">
                    <div className="input-field col s12">
                      <input
                        id="room"
                        value={room}
                        onChange={(e) => setRoom(e.target.value)}
                        placeholder="Enter room name"
                        type="text"
                      />
                      <label htmlFor="room"></label>
                    </div>
                  </div>
                </form>
              </div>
              <button className="btn" onClick={handleSubmit}>
                {" "}
                Create room
              </button>
            </div>
          </div>
        </div>
        <div className="col s6 m5 offset-1">
          <RoomList rooms={rooms} />
        </div>
      </div>
    </div>
  );
};

export default Home;
