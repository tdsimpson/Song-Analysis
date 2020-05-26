import React from 'react';

const Header = (props) => {
    return (
        <div className="header">
            <p className="header__title"><b>{props.title}</b></p>
            <p className="header__subtitle">{props.subtitle}</p>
        </div>
    );
}

export default Header;