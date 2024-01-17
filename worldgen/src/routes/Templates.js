import React from 'react';
import { FaUnsplash, FaGlobe } from "react-icons/fa";
import { FaMap } from "react-icons/fa6";
import { IoMdPlanet } from "react-icons/io";
import { BsStars } from "react-icons/bs";
import { GiStarSwirl } from "react-icons/gi";
import { BsDatabase } from "react-icons/bs";



const Templates = () => {
  return (
    <div className="templates">
        <h2>Templates</h2>
        <p>Choose a template from the library to get started.</p>
        <div className="template-list">
            <a className="template">
                <div className="template-image"> </div>
                <FaMap size={30} className="template-icon"/>
                <h2 className="template-name">Peaceful Village</h2>
                <h3 className="template-tag">REGIONAL</h3>
                <p className="template-desc">A small village with shops, farms, and citizens.</p>
            </a>
            <a className="template">
                <div className="template-image"> </div>
                <FaMap size={30} className="template-icon"/>
                <h2 className="template-name">Magical Kingdom</h2>
                <h3 className="template-tag">REGIONAL</h3>
                <p className="template-desc">A fantasy world with kingdoms, factions, and magic.</p>
            </a>
            <a className="template">
                <div className="template-image"> </div>
                <FaGlobe size={30} className="template-icon"/>
                <h2 className="template-name">Post-Apocalyptic</h2>
                <h3 className="template-tag">INTERCONTINENTAL</h3>
                <p className="template-desc">A post-apocalyptic world with factions and technology.</p>
            </a>
            <a className="template">
                <div className="template-image"> </div>
                <FaGlobe size={30} className="template-icon"/>
                <h2 className="template-name">Pirate Society</h2>
                <h3 className="template-tag">INTERCONTINENTAL</h3>
                <p className="template-desc">A world of pirates and hidden treasures.</p>
            </a>
            <a className="template">
                <div className="template-image"> </div>
                <IoMdPlanet size={30} className="template-icon"/>
                <h2 className="template-name">Sol Colony</h2>
                <h3 className="template-tag">INTERPLANETARY</h3>
                <p className="template-desc">An early colony in the solar system.</p>
            </a>
            <a className="template">
                <div className="template-image"> </div>
                <IoMdPlanet size={30} className="template-icon"/>
                <h2 className="template-name">Cosmic Horror</h2>
                <h3 className="template-tag">INTERPLANETARY</h3>
                <p className="template-desc">A solar system facing a cosmic threat.</p>
            </a>
            <a className="template">
                <div className="template-image"> </div>
                <BsStars size={30} className="template-icon"/>
                <h2 className="template-name">Space Exploration</h2>
                <h3 className="template-tag">INTERSTELLAR</h3>
                <p className="template-desc">An advanced spacefaring civilization.</p>
            </a>
            <a className="template">
                <div className="template-image"> </div>
                <BsStars size={30} className="template-icon"/>
                <h2 className="template-name">Interstellar Kingdom</h2>
                <h3 className="template-tag">INTERSTELLAR</h3>
                <p className="template-desc">A large and colonial interstellar empire.</p>
            </a>
            <a className="template">
                <div className="template-image"> </div>
                <GiStarSwirl size={30} className="template-icon"/>
                <h2 className="template-name">Space Fantasy</h2>
                <h3 className="template-tag">INTERGALACTIC</h3>
                <p className="template-desc">A magical universe with countless species.</p>
            </a>
            <a className="template">
                <div className="template-image"> </div>
                <BsDatabase  size={30} className="template-icon"/>
                <h2 className="template-name">Mystical Multiverse</h2>
                <h3 className="template-tag">MULTIVERSAL</h3>
                <p className="template-desc">An ancient multiverse with cosmic mysteries.</p>
            </a>
        </div>
    </div>
  );
}

export default Templates;