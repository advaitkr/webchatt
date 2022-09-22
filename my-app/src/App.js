import React,{useEffect} from 'react';
import {BrowserRouter as Router,Route,Routes} from 'react-router-dom';
import IntroductionPage from './introductionPage/introductionPage';
import JoinRoomPage from './JoinRoomPage/JoinRoomPage';
import RoomPage from './RoomPage/RoomPage';
import { connectWithSocketIOServer } from "./utils/wss"
import './App.css';
function App() {
   useEffect(()=>{
    connectWithSocketIOServer()
   },[])

  return (
    <Router>
    <Routes>
    <Route exact path='/' element={<IntroductionPage />} />
    <Route path='/Join-Room' element={<JoinRoomPage />} />
    <Route path='/room' element={<RoomPage />} />
    </Routes>
  </Router>
  );
  
  /*return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
      </Routes>
    </Router>
  );*/

}

export default App;
