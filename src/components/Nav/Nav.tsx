import React from "react";
import './Nav.scss'

import ieLogo from '../../assets/IE_SECONDARY_LOGO_WEB-1024x285.png'

const Nav: React.FC = () => {
    return (
        <nav className="nav">
            <div className="logo-container">
                <img src={ieLogo} alt="" />
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