import React from 'react';
import { Link } from 'react-router-dom';
import {  HiSparkles } from 'react-icons/hi2';
import { AiOutlinePlus } from "react-icons/ai";


const HomeEmpty = () => {
  return (
    <div className="home-empty">
      <h1>Create a new world.</h1>
      <h2>How would you like to start?</h2>
      <div className="home-empty-options">
        <Link to="/create-world" className="home-option">
          <div className="home-empty-add" id="add-empty">
            <AiOutlinePlus size={40} />
          </div>
          <h1>Blank World</h1>
          <p>Start from scratch</p>
        </Link>
        <Link to="/templates" className="home-option">
          <div className="home-empty-add" id="add-from-template">
            <HiSparkles size={40} />
          </div>
          <h1>Use a template</h1>
          <p>Choose from the library</p>
        </Link>
      </div>
    </div>
  );
}

export default HomeEmpty;
