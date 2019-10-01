import React from "react";
import { Link } from "react-router-dom";

const Menu = ({ close, children }) => {
  return (
    <div className="welcome-scrim">
      <div id={"welcome"}>
        {children}
        <Link to="/" className="x" onClick={close}>
          <button> x</button>
        </Link>
      </div>
    </div>
  );
};
export default Menu;
