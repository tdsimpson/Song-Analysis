import React from 'react';

const Header = (props) => {
    return (
        <div className="header">
            <h1 className="header__title">{props.title}</h1>
            <p className="header__subtitle">{props.subtitle}</p>
        </div>
    );
}

export default Header;