import blackGlobe from './black_globe.svg';
import './App.css';

function App() {
  return (
    <div className="App" style={{ backgroundColor: "#fff", height: "100vh", display: "flex", justifyContent: "center", alignItems: "center" }}>
      <img src={blackGlobe} alt="black globe" />
      <h1 className="text-3xl font-bold underline text-green-400">
      Hello world!
    </h1>
    </div>
  );
}

export default App;