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
                <h2 className="template-name">Dungeons & Dragons</h2>
                <h3 className="template-tag">REGIONAL</h3>
                <p className="template-desc">A fantasy world with factions, monsters and magic.</p>
            </a>
            <a className="template">
                <div className="template-image"> </div>
                <FaGlobe size={30} className="template-icon"/>
                <h2 className="template-name">World Racing</h2>
                <h3 className="template-tag">INTERCONTINENTAL</h3>
                <p className="template-desc">A worldwide racing tournament.</p>
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
                <BsStars size={30} className="template-icon"/>
                <h2 className="template-name">Star Exploration</h2>
                <h3 className="template-tag">INTERSTELLAR</h3>
                <p className="template-desc">An advanced spacefaring civilization.</p>
            </a>
            <a className="template">
                <div className="template-image"> </div>
                <GiStarSwirl size={30} className="template-icon"/>
                <h2 className="template-name">Space Fantasy</h2>
                <h3 className="template-tag">INTERGALACTIC</h3>
                <p className="template-desc">A mystical universe with ancient mysteries.</p>
            </a>
            <a className="template">
                <div className="template-image"> </div>
                <BsDatabase  size={30} className="template-icon"/>
                <h2 className="template-name">Superhero</h2>
                <h3 className="template-tag">MULTIVERSAL</h3>
                <p className="template-desc">A multiversal superhero saga.</p>
            </a>
        </div>
    </div>
  );
}

export default Templates;