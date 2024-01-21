import './App.css';
import { AiOutlineGlobal, AiOutlineTool, AiOutlineFileText, AiOutlineSetting } from "react-icons/ai";
import { FaRegUserCircle, FaGithub } from "react-icons/fa";
import { VscChromeMinimize, VscChromeMaximize, VscChromeClose, VscWand } from "react-icons/vsc";

import { HashRouter, Link, NavLink, Route, Routes } from 'react-router-dom';

import CreateWorld from './routes/CreateWorld'; 
import HomeContent from './routes/HomeContent'; 
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
            <NavLink to="/" className="menu-item" activeClassName="active"><li><AiOutlineGlobal /><a>My Worlds</a></li></NavLink>
            <NavLink to="/templates" className="menu-item" activeClassName="active"><li><VscWand /><a>Templates</a></li></NavLink>
            <NavLink to="/tools" className="menu-item" activeClassName="active"><li><AiOutlineTool /><a>Tools</a></li></NavLink>
            <NavLink to="/documentation" className="menu-item" activeClassName="active"><li><AiOutlineFileText /><a>Documentation</a></li></NavLink>
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
            <Route exact path="/" element={<HomeContent />}/>
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
