import './App.css';
import { AiOutlineGlobal, AiOutlineTool, AiOutlineFileText, AiOutlineSetting } from "react-icons/ai";
import { FaRegUserCircle, FaGithub } from "react-icons/fa";
import { VscChromeMinimize, VscChromeMaximize, VscChromeClose, VscWand } from "react-icons/vsc";

import { HashRouter, Link, Route, Routes } from 'react-router-dom';

import CreateWorld from './routes/CreateWorld'; 
import HomeEmpty from './routes/HomeContent'; 
import Tools from './routes/Tools'; 
import Templates from './routes/Templates'; 
import Documentation from './routes/Documentation'; 



const ipcRenderer = window.require("electron").ipcRenderer;


function App() {
  return (
    <HashRouter>
    <div className="App">

      <div className="title-bar">
        <h1>WorldGen</h1>
        <div className="title-bar-btns">
          <button id="min-btn"><VscChromeMinimize /></button>
          <button id="max-btn"><VscChromeMaximize /></button>
          <button id="close-btn"><VscChromeClose /></button>
        </div>
      </div>

      <div className="App-content">
        <nav className="App-menu">
          <ul>
            <Link to="/"><li><AiOutlineGlobal /><a>My Worlds</a></li></Link>
            <Link to="/templates"><li><VscWand /><a>Templates</a></li></Link>
            <Link to="/tools"><li><AiOutlineTool /><a>Tools</a></li></Link>
            <Link to="/documentation"><li><AiOutlineFileText /><a>Documentation</a></li></Link>
          </ul>
          <div className="lower-menu">
            <div className="lower-menu-buttons">
              <FaGithub size={17} className="lower-left-button"/>
              <div className="spacer"></div>
              <button><FaRegUserCircle size={16}/></button>
              <button><AiOutlineSetting size={17}/></button>
            </div>
          </div>
        </nav>

        <header className="App-header">
        </header>

        <div className="home-container" id="home-container">
          <Routes>
            <Route exact path="/" element={<HomeEmpty />}/>
            <Route exact path="/create-world" element={<CreateWorld />}/>
            <Route exact path="/tools" element={<Tools />}/>
            <Route exact path="/templates" element={<Templates />}/>
            <Route exact path="/documentation" element={<Documentation />}/>
          </Routes>
        </div>
      </div>
    </div>
    </HashRouter>
  );
}

export default App;
