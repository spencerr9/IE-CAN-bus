import React from "react";
import './Nav.scss'

import carLogo from '../../assets/carLogo-removebg.png'

const Nav: React.FC = () => {
    return (
        <nav className="nav">
            <div className="logo-container">
                <img src={carLogo} alt="" />
            </div>
            <div className="text-container">
                <h1>
                    Transfer Data Extraction
                </h1>
            </div>
        </nav>
    )
}

export default Nav