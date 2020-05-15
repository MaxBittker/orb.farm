import React from "react";
// import daphniaImg from "../../assets/daphnia.gif";
import bubblebig from "../../assets/bubblebig.png";
import bubblemed from "../../assets/bubblemed.png";
import bubblesmall from "../../assets/bubblesmall.png";
import { Link } from "react-router-dom";

const Info = () => {
  return (
    <div className="welcome-scrim">
      <div className="Info window">
        <div className="title-bar">
          <div className="title-bar-text">Information</div>
          <div className="title-bar-controls">
            <button aria-label="Minimize"></button>
            <button aria-label="Maximize"></button>
            <Link to="/">
              <button aria-label="Close"> </button>
            </Link>
          </div>
        </div>
        <div className="window-body">
          <h1>A sealed ecosystem simulation </h1>
          <hr></hr>
          <hr></hr>
          <p>
            Welcome to orb.farm! This is a virtual ecosystem where different
            species of creature can live, grow and die as part of a
            self-contained food chain. Please play, explore, and observe!
          </p>
          <hr></hr>
          <p>
            Created by <a href="https://maxbittker.com">max bittker</a>
          </p>
          <p>
            Source code & Bug reports:{" "}
            <a href="https://github.com/MaxBittker/jar">
              github.com/maxbittker/jar
            </a>
          </p>
          <p>
            See also: <a href="https://sandspiel.club">sandspiel.club</a>
          </p>{" "}
          <hr></hr>
          <hr></hr>
          <div className="species-info">
            <span>
              <h1>Air:</h1>
              <p>Mostly used to erase things.</p>
              <hr></hr>
            </span>
            <span>
              <h1>Glass:</h1>
              <p>Lets in light, seals in flavor.</p>
              <hr></hr>
            </span>
            <span>
              <h1>Sand:</h1>
              <p>Important nutrient vector for plants. Plant seeds in this.</p>
              <hr></hr>
            </span>
            <span>
              <h1>Stone:</h1>
              <p>Draw archways and castle. Aquascaping is a noble cause.</p>
              <hr></hr>
            </span>
            <span>
              <h1>Wood:</h1>
              <p>
                Driftwood adds natural decorative flare and provides a place for
                fish to hide.
              </p>
            </span>
            <hr></hr>
            <span>
              <h1>Water:</h1>
              <p>A classic. Doesn't get better than this.</p>
              <hr></hr>
            </span>
            <span>
              <h1>Algae:</h1>
              <p>
                Photosynthesizes sunlight to produce nutrients and oxygen. Life
                of the party!
              </p>
            </span>
            <hr></hr>
            <span>
              <h1>Daphnia:</h1>
              <p>
                Also know as water fleas, these freshwater zooplankton are
                important parts of the ecosystem. They feed on algae and lay
                eggs! More active at night.
              </p>
              <hr></hr>
            </span>

            <span>
              <h1>Seed:</h1>
              <p>
                Grows into eel grass, which is a source of food and oxygen.
                Needs to pull nutrients from sand in order to grow!
              </p>
              <hr></hr>
            </span>

            <span>
              <h1>Bacteria:</h1>
              <p>
                Helps break down waste into fertilizer. Decomposers are very
                important parts to a functioning ecosystem. Blows bubbles when
                happy.
              </p>
              <hr></hr>
            </span>

            <span>
              <h1>Fish:</h1>
              <p>
                They feed mostly on daphnia but will also feed on the biofilm
                that grows on plants. I can't tell what they're thinking.
              </p>
              <hr></hr>
            </span>

            <span>
              <h1>Gold Fish:</h1>
              <p>Loyal but simple minded.</p>
            </span>
          </div>
          <hr></hr>
          <h1> Credits:</h1>
          <p>
            Daphnia Art:{" "}
            <a href="https://twitter.com/aconfuseddragon">aconfuseddragon</a>
          </p>
          <p>
            Background Art:
            <a href="https://www.shadertoy.com/view/tdSXzD">
              "The sun, the sky and the clouds"
            </a>{" "}
            by stilltravelling
          </p>
          <p>
            <img src="https://camo.githubusercontent.com/93105325a463894a90f70acf42eb79761f85567e/68747470733a2f2f75706c6f61642e77696b696d656469612e6f72672f77696b6970656469612f636f6d6d6f6e732f7468756d622f642f64642f466f6f6457656253696d706c652e6a70672f37323170782d466f6f6457656253696d706c652e6a7067" />
          </p>
        </div>
      </div>
    </div>
  );
};

export default Info;
