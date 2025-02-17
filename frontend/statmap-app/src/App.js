import blackGlobe from './black_globe.svg';
import './App.css';

function App() {
  return (
    <div className="App" style={{ backgroundColor: "#fff", height: "100vh", display: "flex", justifyContent: "center", alignItems: "center" }}>
      <img src={blackGlobe} alt="black globe" />
    </div>
  );
}

export default App;