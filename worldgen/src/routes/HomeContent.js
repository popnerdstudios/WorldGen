import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {  HiSparkles } from 'react-icons/hi2';
import { AiOutlinePlus } from "react-icons/ai";
import { FaEllipsisVertical } from "react-icons/fa6";

import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import Grow from '@mui/material/Grow';
import Paper from '@mui/material/Paper';
import Popper from '@mui/material/Popper';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import MenuList from '@mui/material/MenuList';

const { ipcRenderer } = window.require('electron');

const options = ['Create a Blank World', 'Create from a Template'];

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

  const HomeContent = () => {
    const [data, setData] = useState([]);
    const [open, setOpen] = React.useState(false);
    const [menuAnchorEl, setMenuAnchorEl] = useState({});
    const anchorRef = React.useRef(null);
    const [selectedIndex, setSelectedIndex] = React.useState(-1);

    const handleClick = () => {
        console.info(`You clicked ${options[selectedIndex]}`);
    };

    const handleMenuOpen = (event, id) => {
        setMenuAnchorEl({ ...menuAnchorEl, [id]: event.currentTarget });
    };

    const handleMenuClose = (id) => {
        setMenuAnchorEl({ ...menuAnchorEl, [id]: null });
    };

    const handleToggle = () => {
        setOpen((prevOpen) => !prevOpen);
    };

    const handleClose = (event) => {
        if (anchorRef.current && anchorRef.current.contains(event.target)) {
        return;
        }
        setOpen(false);
    };

    const handleDeleteWorld = (worldId) => {
        ipcRenderer.send('delete-world', worldId);
    
        ipcRenderer.once('delete-world-response', (_, response) => {
            if (response.status === 'success') {
                setData(data.filter(world => world.id !== response.id));
            } else {
                console.error("Error deleting world:", response.message);
            }
        });
    };

    useEffect(() => {
        ipcRenderer.send('get-worlds');

        ipcRenderer.on('get-worlds-response', (_, response) => {
            if (response.status === 'success') {
                setData(response.data);
            } else {
                console.log("ERROR");
            }
        });

        return () => {
            ipcRenderer.removeAllListeners('get-worlds-response');
        };
    }, []);

    if (data.length === 0) {
        return <HomeEmpty />;
    }

    return (
        <div className="home-main">
            <div className="home-intro">
                <div className="home-title">
                    <h2>My Worlds</h2>
                    <p>A place for all your worldbuilding projects.</p>
                </div>
                <div className="home-buttons">
                    <ButtonGroup variant="contained" ref={anchorRef} aria-label="split button">
                        <Link to="/create-world" style={{ textDecoration: 'none' }}>
                            <Button onClick={handleClick}>Create World</Button>
                        </Link>
                        <Button
                            size="small"
                            aria-controls={open ? 'split-button-menu' : undefined}
                            aria-expanded={open ? 'true' : undefined}
                            aria-label="select merge strategy"
                            aria-haspopup="menu"
                            onClick={handleToggle}
                        >
                            <ArrowDropDownIcon />
                        </Button>
                    </ButtonGroup>
                    <Popper
                        sx={{ zIndex: 1 }}
                        open={open}
                        anchorEl={anchorRef.current}
                        role={undefined}
                        transition
                        disablePortal
                    >
                        {({ TransitionProps, placement }) => (
                            <Grow
                                {...TransitionProps}
                                style={{
                                    transformOrigin:
                                        placement === 'bottom' ? 'center top' : 'center bottom',
                                }}
                            >
                                <Paper>
                                    <ClickAwayListener onClickAway={handleClose}>
                                        <MenuList id="split-button-menu" autoFocusItem>
                                            {options.map((option, index) => (
                                                <MenuItem
                                                    key={option}
                                                    selected={index === selectedIndex}
                                                    onClick={() => setOpen(false)} 
                                                    component={Link}
                                                    to={index === 0 ? '/create-world' : '/templates'} 
                                                >
                                                    {option}
                                                </MenuItem>
                                            ))}
                                        </MenuList>
                                    </ClickAwayListener>
                                </Paper>
                            </Grow>
                        )}
                    </Popper>
                </div>
            </div>
            <div className="project-list">
                <div className="project" id="project-template">
                    <p className="project-name" id="project-name-template">World</p>
                    <p className="project-size" id="project-size-template">Type</p>
                    <p className="project-desc" id="project-desc-template">Description</p>              
                </div>
                {data.map((world) => (
                    <div key={world.id} className="project">
                        <p className="project-name">{world.name}</p>
                        <p className="project-size">{world.size}</p>
                        <p className="project-desc">{world.description}</p>
                        <div  className={`project-options project-button`} onClick={(e) => handleMenuOpen(e, world.id)}>
                            <FaEllipsisVertical/>
                        </div>
                        <Menu
                            id={`project-menu-${world.id}`}
                            anchorEl={menuAnchorEl[world.id]}
                            keepMounted
                            open={Boolean(menuAnchorEl[world.id])}
                            onClose={() => handleMenuClose(world.id)}
                        >
                            <MenuItem onClick={() => {
                                handleMenuClose(world.id);
                                handleDeleteWorld(world.id);
                            }}>
                                Delete World
                            </MenuItem>
                        </Menu>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default HomeContent;
