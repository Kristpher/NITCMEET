import './App.css';
import {Routes,Route} from "react-router-dom"
import Home from './pages/Home';
import Room from './pages/Room';
import First from './pages/First';
import Admin from './pages/Admin';
function App() {
  return (
    <div className="App">
      <Routes>
        <Route path='/' element={<First/>}/>
        <Route path='/create' element={<Admin/>}/>
         <Route path='/join' element={<Home/>}/>
        <Route path='/room/:roomId' element={<Room/>}/>
        <Route path='/callended' element={<h1>CALL ENDED</h1>}/>
      </Routes>
    </div>
  );
}

export default App;
