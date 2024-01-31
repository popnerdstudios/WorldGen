import React from 'react';
import { Link } from 'react-router-dom';

import { FaUnsplash } from "react-icons/fa";
import { PiPaintBrushHouseholdBold } from "react-icons/pi";
import { RiGameFill } from "react-icons/ri";
import { IoIosMic } from "react-icons/io";


const Tools = () => {
  return (
    <div className="tools">
        <h2>Tools</h2>
        <p>A collection of built-in and online worldbuilding tools.</p>
        <div className="tool-list">
            <Link to="/MapGen" className="tool">
                <div className="tool-image" id="free-assets-img"></div>
                <RiGameFill size={30} className="tool-icon"/>
                <h2 className="tool-name">MapGen</h2>
                <h3 className="tool-tag" id="free-assets">BUILT-IN TOOLS</h3>
                <p>Click here to interact with the canvas component.</p>
            </Link>
        </div>
    </div>
  );
}

export default Tools;