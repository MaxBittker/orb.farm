import React from "react";

const Info = () => {
  return (
    <div className="Info">
      <h1>A sealed ecosystem simulation </h1>
      <p>
        Created by <a href="https://maxbittker.com">max bittker</a>
        Work in progress!
      </p>
      <p>
        Source code:{" "}
        <a href="https://github.com/MaxBittker/jar">
          github.com/maxbittker/jar
        </a>
      </p>
      <p>
        Based on <a href="htts://sandspiel.club">sandspiel.club</a>
      </p>{" "}
      <p>
        <img src="https://i.pinimg.com/originals/79/94/0d/79940dd994fb3e901af4265493515d00.jpg" />
      </p>
      background shader: forked from{" "}
      <a href="https://www.shadertoy.com/view/tdSXzD">
        "The sun, the sky and the clouds"
      </a>{" "}
      by stilltravelling
    </div>
  );
};

export default Info;
