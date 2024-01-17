import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Slider from '@mui/material/Slider';
import Typography from '@mui/material/Typography';

const options = ['Regional', 'Intercontinental', 'Interplanetary', 'Interstellar', 'Intergalactic', 'Multiversal'];
const option_desc = ['Your story takes place within a continent/region (eg. Stardew Valley, Lord of the Rings, etc.)', 'Your story takes place across many continents. (eg. Indiana Jones, Uncharted, etc.)', 'Your story takes place within a star system. (eg. The Martian, The Expanse, Destiny, etc.)', 'Your story takes place within a single galaxy. (eg. Star Wars, The Foundation, Mass Effect, etc.)', 'Your story takes place across many galaxies. (eg. Stargate, No Mans Sky, Elite Dangerous, etc.)', 'Your story takes place across universes. (eg. Marvel Comics, His Dark Materials, etc.)'];

const CreateWorld = () => {
    const [sliderValue, setSliderValue] = useState(0);
    const [worldName, setWorldName] = useState('');
    const [worldDescription, setWorldDescription] = useState('');
  
    const handleChange = (_, newValue) => {
      setSliderValue(newValue);
    };
  
    return (
      <div className="create-world-form">
        <h1>Create New World</h1>
        <div className="world-name-select">
          <h2>World Name:</h2>
          <input
            type="text"
            placeholder="Enter world name"
            value={worldName}
            onChange={(e) => setWorldName(e.target.value)}
          />
          <h2>World Description:</h2>
          <textarea
            placeholder="Enter world description"
            value={worldDescription}
            onChange={(e) => setWorldDescription(e.target.value)}
          />
        </div>
        <div className="world-slider">
          <h2 id="slider-label">World Size:</h2>
          <Slider
            className="slider-control"
            value={sliderValue}
            onChange={handleChange}
            valueLabelDisplay="auto"
            valueLabelFormat={(index) => options[index]}
            aria-labelledby="slider-label"
            step={1}
            marks
            min={0}
            max={5}
          />
          <Typography>
            {options[sliderValue] + "; " + option_desc[sliderValue]}
          </Typography>
        </div>

        <div class="create-buttons">
            <Link to="/"><button class="cancel-button">Cancel</button></Link>
            <button class="create-button">Create</button>
        </div>
      </div>
    );
  };
  
  export default CreateWorld;

