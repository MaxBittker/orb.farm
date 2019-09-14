import React from "react";
import { Link } from "react-router-dom";

import { memory } from "../../crate/pkg/sandtable_bg";
import { Species } from "../../crate/pkg/sandtable";

import { height, universe, width, reset } from "../index.js";
import { snapshot, pallette } from "../render.js";
import { icos, randomIco } from "../tchotchkes";

import Menu from "./menu";
let skiplist = ["FishTail", "Bubble", "Waste", "Biofilm", "GoldFishTail"];

skiplist.push("Plant");
skiplist.push("Zoop");
skiplist.push("Nitrogen");
skiplist.push("Plastic");

window.species = Species;
let pallette_data = pallette();

function randomRadius() {
  return 4 + Math.random() * Math.random() * 12;
}
function organicRadius() {
  return `
  ${randomRadius()}px
  ${randomRadius()}px
  ${randomRadius()}px
  ${randomRadius()}px
  /
  ${randomRadius()}px
  ${randomRadius()}px
  ${randomRadius()}px
  ${randomRadius()}px
  `;
}
const OrganicButton = ({ onClick, className, children }) => {
  return (
    <button
      onClick={onClick}
      className={className}
      style={{
        borderRadius: organicRadius()
      }}
    >
      {children}
    </button>
  );
};
const ElementButton = (name, selectedElement, setElement) => {
  let elementID = Species[name];

  let color = pallette_data[elementID];
  let selected = elementID == selectedElement;

  let background = "inherit";
  return (
    <button
      className={selected ? "selected" : ""}
      key={name}
      onClick={() => {
        setElement(elementID);
      }}
      style={{
        background,
        backgroundColor: color,
        borderRadius: organicRadius(),
        filter: selected || `saturate(0.5) `
      }}
    >
      {"  "}
      {name}
      {"  "}
    </button>
  );
};

class Index extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      submissionMenuOpen: false,
      paused: false,
      ff: false,
      submitting: false,
      size: 1,
      tchotchkes: new Set(),
      dataURL: {},
      currentSubmission: null,
      selectedElement: Species.Sand
    };
    window.UI = this;
    // this.load();
  }

  componentDidUpdate(prevProps) {}
  togglePause() {
    window.paused = !this.state.paused;
    this.setState({ paused: !this.state.paused });
  }
  toggleFF() {
    window.ff = !this.state.ff;
    this.setState({ ff: !this.state.ff });
  }
  play() {
    window.paused = false;
    this.setState({ paused: false });
  }
  pause() {
    window.paused = true;
    this.setState({ paused: true });
  }

  setSize(event, size) {
    event.preventDefault();
    this.setState({
      size
    });
  }
  reset() {
    if (window.confirm("Reset?")) {
      this.play();
      this.setState({ currentSubmission: null });
      reset();
    }
  }
  menu() {
    this.pause();
    this.setState({ submissionMenuOpen: true });
  }

  closeMenu() {
    this.play();
    this.setState({ submissionMenuOpen: false });
  }
  upload() {
    console.log("saving");
    // let dataURL = snapshot(universe);
    const cells = new Uint8Array(
      memory.buffer,
      universe.cells(),
      width * height * 4
    );

    // Create canvas
    let canvas = document.createElement("canvas"),
      context = canvas.getContext("2d"),
      imgData = context.createImageData(width, height);

    canvas.height = height;
    canvas.width = width;

    // fill imgData with data from cells
    for (var i = 0; i < width * height * 4; i++) {
      if (i % 4 == 3) {
        imgData.data[i] = 255;
      } else {
        imgData.data[i] = cells[i];
      }
    }
    // put data to context at (0, 0)
    context.putImageData(imgData, 0, 0);

    let cellData = canvas.toDataURL("image/png");
    let dataString = JSON.stringify(cellData);
    try {
      localStorage.setItem("cell_data", dataString);
      localStorage.setItem("o2", universe.o2());
    } catch {
      console.log("store failed");
    }

    const sprite = new Uint8Array(
      memory.buffer,
      universe.sprite(),
      width * height * 4
    );

    // fill imgData with data from sprite
    for (var i = 0; i < width * height * 4; i++) {
      imgData.data[i] = sprite[i];
    }
    // put data to context at (0, 0)
    context.putImageData(imgData, 0, 0);

    let spriteData = canvas.toDataURL("image/png");
    let spriteDataString = JSON.stringify(spriteData);
    console.log(spriteDataString);
    try {
      localStorage.setItem("sprite_data", spriteDataString);
    } catch {
      console.log("store failed");
    }

    // this.load();
  }
  findTchotchke() {
    console.log("finding");
    this.setState(({ tchotchkes }) => {
      return { tchotchkes: tchotchkes.add(randomIco()) };
    });
  }
  load() {
    console.log("loading");

    this.findTchotchke();
    window.setInterval(() => this.findTchotchke(), 1000 * 20);

    var cellData = JSON.parse(localStorage.getItem("cell_data"));
    var spriteData = JSON.parse(localStorage.getItem("sprite_data"));

    if (!cellData) {
      console.log("no save");
      window.setInterval(() => this.upload(), 1000 * 10);

      return;
    }

    var canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    var ctx = canvas.getContext("2d");
    var img = new Image();
    img.src = cellData;
    img.onload = () => {
      ctx.drawImage(img, 0, 0);
      var imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);

      const cellsData = new Uint8Array(
        memory.buffer,
        universe.cells(),
        width * height * 4
      );

      universe.reset();

      for (var i = 0; i < width * height * 4; i++) {
        cellsData[i] = imgData.data[i];
      }
      if (localStorage.getItem("o2")) {
        let o2 = parseInt(localStorage.getItem("o2"), 10);
        universe.set_o2(o2);
      }
      window.setInterval(() => this.upload(), 1000 * 10);
    };

    var canvas2 = document.createElement("canvas");
    canvas2.width = width;
    canvas2.height = height;
    var ctx2 = canvas2.getContext("2d");

    var img2 = new Image();
    img2.src = spriteData;
    img2.onload = () => {
      ctx2.drawImage(img2, 0, 0);
      var imgData = ctx2.getImageData(0, 0, canvas2.width, canvas2.height);

      const spriteData = new Uint8Array(
        memory.buffer,
        universe.sprite(),
        width * height * 4
      );

      for (var i = 0; i < width * height * 4; i++) {
        spriteData[i] = imgData.data[i];
      }
    };
    // universe.flush_undos();
    // universe.push_undo();
    // this.pause();
  }

  render() {
    let {
      ff,
      selectedElement,
      currentSubmission,
      selectedTchotchke,
      tchotchkes
    } = this.state;
    let hash =
      currentSubmission && currentSubmission.id
        ? `#${currentSubmission.id}`
        : "";
    return (
      <React.Fragment>
        {/* <OrganicButton
          onClick={() => this.togglePause()}
          className={paused ? "selected" : ""}
        >
          {paused ? (
            <svg height="20" width="20" id="d" viewBox="0 0 300 300">
              <polygon id="play" points="0,0 , 300,150 0,300" />
            </svg>
          ) : (
            <svg height="20" width="20" id="d" viewBox="0 0 300 300">
              <polygon id="bar2" points="0,0 110,0 110,300 0,300" />
              <polygon id="bar1" points="190,0 300,0 300,300 190,300" />
            </svg>
          )} */}
        {/* </OrganicButton> */}

        <OrganicButton
          onClick={() => this.toggleFF()}
          className={ff ? "selected" : ""}
        >
          <svg height="20" width="20" id="d" viewBox="0 0 300 300">
            <polygon id="play" points="0,50 , 150,150 0,250" />
            <polygon id="play" points="150,50, 300,150 150,250" />
          </svg>
        </OrganicButton>

        <OrganicButton onClick={() => this.reset()}>Reset</OrganicButton>
        {/* <button onClick={() => this.upload()}>upload</button> */}
        {/* <button onClick={() => this.load()}>load</button> */}
        <Link
          to={{
            pathname: "/info/",
            hash
          }}
        >
          <OrganicButton>Info</OrganicButton>
        </Link>

        {/* {paused && <button onClick={() => universe.tick()}>Tick</button>} */}
        <OrganicButton
          onClick={() => {
            reset();
            universe.pop_undo();
          }}
          style={{ fontSize: 35 }}
        >
          ↜
        </OrganicButton>
        {Object.keys(Species)
          .filter(name => !skiplist.includes(name))
          .map(n =>
            ElementButton(n, selectedElement, id =>
              this.setState({ selectedElement: id })
            )
          )}
        {tchotchkes.size > 0 && (
          <span className="tchotchkes">
            {Array.from(tchotchkes).map(url => (
              <img
                onClick={() => {
                  this.setState({ selectedTchotchke: url });
                }}
                className={selectedTchotchke == url ? "selected" : ""}
                src={url}
                key={url}
              ></img>
            ))}
          </span>
        )}
      </React.Fragment>
    );
  }
}

export { Index };
