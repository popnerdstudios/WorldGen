import './App.css';
import { AiOutlineGlobal, AiOutlineTool, AiOutlineFileText, AiOutlineSetting } from "react-icons/ai";
import { FaRegUserCircle, FaGithub } from "react-icons/fa";
import { VscChromeMinimize, VscChromeMaximize, VscChromeClose, VscWand } from "react-icons/vsc";

import { HashRouter, Link, NavLink, Route, Routes } from 'react-router-dom';

import HomeContent from './routes/main/HomeContent'; 
import Tools from './routes/main/Tools'; 
import Templates from './routes/main/Templates'; 
import Documentation from './routes/main/Documentation'; 

import CreateWorld from './routes/menu/CreateWorld'; 
import EditWorld from './routes/menu/EditWorld'; 

import MapGen from './routes/tools/MapGen/MapGen'; 
import ThreeJSMap from './routes/tools/MapGen/3d-map'; 


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
            <Route path="/edit-world/:id" element={<EditWorld />}/>
            <Route exact path="/tools" element={<Tools />}/>
            <Route exact path="/templates" element={<Templates />}/>
            <Route exact path="/documentation" element={<Documentation />}/>
            <Route exact path="/mapgen" element={<MapGen />}/>
            <Route exact path="/3d-map" element={<ThreeJSMap />}/>
          </Routes>
        </div>
      </div>
    </div>
    </HashRouter>
  );
}

export default App;
