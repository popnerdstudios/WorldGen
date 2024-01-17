import React from 'react';
import { FaUnsplash } from "react-icons/fa";
import { PiPaintBrushHouseholdBold } from "react-icons/pi";
import { RiGameFill } from "react-icons/ri";
import { IoIosMic } from "react-icons/io";


const Tools = () => {
  return (
    <div className="tools">
        <h2>Tools</h2>
        <p>A collection of free built-in and online worldbuilding tools.</p>
        <div className="tool-list">
            <a className="tool" href="https://unsplash.com/" target="_blank">
                <div className="tool-image" id="free-assets-img"></div>
                <FaUnsplash size={30} className="tool-icon"/>
                <h2 className="tool-name">Unsplash</h2>
                <h3 className="tool-tag" id="free-assets">FREE ASSETS</h3>
                <p>A website for free stock photos</p>
            </a>
            <a className="tool" href="https://opengameart.org/" target="_blank">
                <div className="tool-image" id="free-assets-img"></div>
                <RiGameFill  size={30} className="tool-icon"/>
                <h2 className="tool-name">OpenGameArt</h2>
                <h3 className="tool-tag" id="free-assets">FREE ASSETS</h3>
                <p>A website for free game art/assets.</p>
            </a>
            <a className="tool" href="https://www.midjourney.com/" target="_blank">
                <div className="tool-image" id="ai-tools-img"></div>
                <PiPaintBrushHouseholdBold  size={30} className="tool-icon"/>
                <h2 className="tool-name">Midjourney</h2>
                <h3 className="tool-tag" id="ai-tools">AI TOOLS</h3>
                <p>An AI tool to generate art.</p>
            </a>
            <a className="tool" href="https://elevenlabs.io/" target="_blank">
                <div className="tool-image" id="ai-tools-img"></div>
                <IoIosMic size={30} className="tool-icon"/>
                <h2 className="tool-name">ElevenLabs</h2>
                <h3 className="tool-tag" id="ai-tools">AI TOOLS</h3>
                <p>An AI tool to generate lifelike speech.</p>
            </a>
        </div>
    </div>
  );
}

export default Tools;