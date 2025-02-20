import blackGlobe from './black_globe.svg';
import './App.css';
import SideBar from './SideBar';
import DropMenu from './DropMenu';
import Landing from './Landing';

function App() {
  return (
    <div className="flex">
      <img className='float-left' src={blackGlobe} alt="black globe" />
      
      <Landing />
    </div>
  );
}

export default App;