import React, { useEffect, useState } from "react";

const ByeButton = ({ byeclick, id, bye }) => {
  const [clicked, setClicked] = useState(false);

  useEffect(() => {
    bye == 1 && setClicked(true);
  }, []);

  const handleClick = (id) => {
    byeclick(id);
    setClicked(!clicked);
  };

  return (
    <button
      className={`e-btn e-bye js-byeButton`}
      onClick={() => handleClick(id)}
    >
      {clicked ? "BYE" : "IN"}
    </button>
  );
};

export default ByeButton;
