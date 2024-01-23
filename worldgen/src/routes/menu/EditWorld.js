import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';

const { ipcRenderer } = window.require('electron');

const EditWorld = ({ match }) => {
    const [worldName, setWorldName] = useState('');
    const [worldDescription, setWorldDescription] = useState('');
    const { id: worldId } = useParams(); 

    useEffect(() => {
        ipcRenderer.send('get-world', worldId);

        ipcRenderer.once('get-world-response', (_, response) => {
            if (response.status === 'success') {
                setWorldName(response.data.name);
                setWorldDescription(response.data.description);
            } else {
                console.log("Error fetching world data");
            }
        });
    }, [worldId]);

    const handleEdit = () => {
        const updatedWorldData = {
            id: worldId,
            name: worldName,
            description: worldDescription
        };

        ipcRenderer.send('edit-world', updatedWorldData);
        
        ipcRenderer.once('edit-world-response', (_, response) => {
            if (response.status === 'success') {
                console.log("World Updated!");
            } else {
                console.log("Error Updating World");
            }
        });
    };

    return (
        <div className="edit-world-form">
            <h1>Edit World</h1>
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

            <div className="edit-buttons">
                <Link to="/"><button className="cancel-button">Cancel</button></Link>
                <button className="edit-button" onClick={handleEdit}>Save Changes</button>
            </div>
        </div>
    );
};

export default EditWorld;
