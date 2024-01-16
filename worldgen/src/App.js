import './App.css';
import { AiOutlineGlobal, AiOutlinePlus, AiOutlineTool, AiOutlineFileText, AiOutlineSetting } from "react-icons/ai";
import { FaRegUserCircle, FaGithub } from "react-icons/fa";
import { HiSparkles } from "react-icons/hi2";
import { VscChromeMinimize, VscChromeMaximize, VscChromeClose, VscWand } from "react-icons/vsc";


const ipcRenderer = window.require("electron").ipcRenderer;

function App() {
  return (
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
            <li><AiOutlineGlobal /><a href="#home">My Worlds</a></li>
            <li><AiOutlineTool /><a href="#tools">Tools</a></li>
            <li><VscWand /><a href="#templates">Templates</a></li>
            <li><AiOutlineFileText /><a href="#documentation">Documentation</a></li>
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

        <div className="home-container">
          <div className="home-empty">
            <h1>Create a new world.</h1>
            <h2>How would you like to start?</h2>
            <div className="home-empty-options">
              <div className="home-option">
                <div className="home-empty-add" id="add-empty">
                  <AiOutlinePlus  size={40} />
                </div>
                <h1>Blank World</h1>
                <p>Start from scratch</p>
              </div>
              <div className="home-option">
                <div className="home-empty-add" id="add-from-template">
                  <HiSparkles  size={40} />
                </div>
                <h1>Use a template</h1>
                <p>Choose from library</p>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}

export default App;
