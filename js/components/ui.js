import React from "react";
import { Link } from "react-router-dom";

import { memory } from "../../crate/pkg/sandtable_bg";
import { Species } from "../../crate/pkg/sandtable";

import { height, universe, width, reset } from "../index.js";
import { snapshot, pallette } from "../render.js";

import Menu from "./menu";
let skiplist = ["Plant", "FishTail", "Bubble", "Waste", "Nitrogen"];
window.species = Species;
let pallette_data = pallette();

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
        filter: selected || `saturate(0.5) `
      }}
    >
      {"  "}
      {name}
      {"  "}
    </button>
  );
};

let sizeMap = [2, 3, 4];

class Index extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      submissionMenuOpen: false,
      paused: false,
      ff: false,
      submitting: false,
      size: 1,
      dataURL: {},
      currentSubmission: null,
      selectedElement: Species.Water
    };
    window.UI = this;

    this.load();
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
    let dataURL = snapshot(universe);
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

    this.pause();
    this.setState({
      data: { dataURL, cells: cellData },
      submissionMenuOpen: true
    });
  }

  load() {
    let { location } = this.props;
    let id = location.hash.replace(/#/, "");
    if (id === "") {
      return;
    }

    if (this.state.currentSubmission && this.state.currentSubmission.id == id) {
      return;
    }

    fetch(functions._url(`api/creations/${id}`), {
      method: "GET",
      headers: {
        "Content-Type": "application/json"
      }
    })
      .then(res => res.json())
      .then(data => {
        storage
          .refFromURL(
            `gs://sandtable-8d0f7.appspot.com/creations/${data.id}.data.png`
          )
          .getDownloadURL()
          .then(dlurl => {
            fetch(dlurl, {
              method: "GET"
            })
              .then(res => res.blob())
              .then(blob => {
                // console.log(response);
                this.setState({ currentSubmission: { id, data } });

                var url = URL.createObjectURL(blob);
                var img = new Image();
                img.src = url;
                img.onload = () => {
                  var canvas = document.createElement("canvas");
                  canvas.width = width;
                  canvas.height = height;
                  var ctx = canvas.getContext("2d");
                  ctx.drawImage(img, 0, 0);
                  var imgData = ctx.getImageData(
                    0,
                    0,
                    canvas.width,
                    canvas.height
                  );

                  const cellsData = new Uint8Array(
                    memory.buffer,
                    universe.cells(),
                    width * height * 4
                  );

                  reset();

                  for (var i = 0; i < width * height * 4; i++) {
                    cellsData[i] = imgData.data[i];
                  }
                  universe.flush_undos();
                  universe.push_undo();
                  this.pause();
                };
              })
              .catch(error => console.error("Error:", error));
          });
      })
      .catch(error => {
        console.error("Error:", error);
      });
  }

  render() {
    let { size, paused, ff, selectedElement, currentSubmission } = this.state;
    let hash =
      currentSubmission && currentSubmission.id
        ? `#${currentSubmission.id}`
        : "";
    return (
      <React.Fragment>
        <button
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
          )}
        </button>

        <button
          onClick={() => this.toggleFF()}
          className={ff ? "selected" : ""}
        >
          <svg height="20" width="20" id="d" viewBox="0 0 300 300">
            <polygon id="play" points="0,50 , 150,150 0,250" />
            <polygon id="play" points="150,50, 300,150 150,250" />
          </svg>
        </button>

        <button onClick={() => this.reset()}>Reset</button>
        <Link
          to={{
            pathname: "/info/",
            hash
          }}
        >
          <button>Info</button>
        </Link>

        {/* {paused && <button onClick={() => universe.tick()}>Tick</button>} */}
        <span className="sizes">
          {sizeMap.map((v, i) => (
            <button
              key={i}
              className={i == size ? "selected" : ""}
              onClick={e => this.setSize(e, i)}
              style={{
                padding: "0px",
                borderRadius: [
                  ["25px", 0, 0, "25px"],
                  [0, 0, 0, 0],
                  [0, "25px", "25px", 0]
                ][i].join(" ")
              }}
            >
              <svg height="23" width="23" id="d" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r={2 + v * 5} />
              </svg>
            </button>
          ))}
        </span>
        <button
          onClick={() => {
            reset();
            universe.pop_undo();
          }}
          style={{ fontSize: 35 }}
        >
          ↜
        </button>
        {Object.keys(Species)
          .filter(name => !skiplist.includes(name))
          .map(n =>
            ElementButton(n, selectedElement, id =>
              this.setState({ selectedElement: id })
            )
          )}

        {this.state.currentSubmission && (
          <div className="submission-title">
            <button onClick={() => this.incScore()}>
              +♡{this.state.currentSubmission.data.score}{" "}
            </button>
            {this.state.currentSubmission.data.title}
          </div>
        )}

        {this.state.submissionMenuOpen && (
          <Menu close={() => this.closeMenu()}>
            <h4>Share your creation with the people!</h4>
            <img src={this.state.data.dataURL} className="submissionImg" />
            <div style={{ display: "flex" }}>
              <input
                placeholder="title"
                onChange={e => this.setState({ title: e.target.value })}
              />
              <button
                disabled={this.state.submitting}
                onClick={() => this.submit()}
              >
                Submit
              </button>
            </div>
          </Menu>
        )}
      </React.Fragment>
    );
  }
}

export { sizeMap, Index };
