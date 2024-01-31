import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
const { ipcRenderer } = window.require('electron');

const WorldContent = () => {
  const { id } = useParams();
  const [worldData, setWorldData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    ipcRenderer.send('get-world', id);
  
    ipcRenderer.once('get-world-response', (_, response) => {
      if (response.status === 'success') {
        setWorldData(response.data);
      } else {
        setError(response.message);
      }
      setLoading(false);
    });
  
    // Cleanup listener
    return () => {
      ipcRenderer.removeAllListeners('get-world-response');
    };
  }, [id]);
  
  if (loading) {
    return <div>Loading...</div>;
  }
  
  if (error) {
    return <div>Error: {error}</div>;
  }
  
  return (
    <div className="world-content">
        <div className="world-img"></div>
        <div className="world-elements">
            <h1 className="world-name">{worldData?.name}</h1>
            <h4 className="world-description">{worldData?.description}</h4>
        </div>
    </div>
  );
};

export default WorldContent;
