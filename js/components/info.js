import React from "react";
import daphniaImg from "../../assets/daphniaAlpha.gif";

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
            <Link to="/">
              <button aria-label="Minimize"></button>
            </Link>
            <button aria-label="Maximize"></button>
            <Link to="/">
              <button aria-label="Close"> </button>
            </Link>
          </div>
        </div>
        <div className="window-body ">
          {/* <li>A sealed ecosystem simulation </li> */}

          <ul className="tree-view info-body">
            <li>
              <h4> Welcome to orb.farm!</h4>
              <ul>
                <li>
                  {" "}
                  This is a virtual ecosystem where different species of
                  creature can live, grow and die as part of a self-contained
                  food chain.
                </li>
                <li>
                  Please:
                  <ul>
                    <li>Play</li>
                    <li>Experiment</li>
                    <li>& Observe</li>
                  </ul>
                </li>
                <li>
                  <details>
                    <summary>Elements</summary>
                    <ul>
                      <li>
                        <details>
                          <summary>Inert</summary>

                          <ul>
                            <li>
                              <summary>Clear:</summary>

                              <ul>
                                <li>"Air" element, used to erase things.</li>
                              </ul>
                            </li>
                            <li>
                              <summary>Glass:</summary>

                              <ul>
                                <li>Lets in light, biologically inert.</li>
                              </ul>
                            </li>
                            <li>
                              <summary>Sand:</summary>

                              <ul>
                                <li>
                                  Important nutrient vector for plants. Grass
                                  must grow in this.
                                </li>
                              </ul>
                            </li>
                            <li>
                              <summary>Stone:</summary>

                              <ul>
                                <li>Draw archways and castle. Aquascaping!</li>
                              </ul>
                            </li>
                            <li>
                              <summary>Wood:</summary>

                              <ul>
                                <li>
                                  Driftwood adds natural decorative flare and
                                  provides a place for fish to hide. It also
                                  blocks light.
                                </li>
                              </ul>
                            </li>
                            <li>
                              <summary>Water:</summary>

                              <ul>
                                <li>
                                  A classic. Doesn't get better than this.
                                </li>
                              </ul>
                            </li>
                          </ul>
                        </details>
                      </li>
                      <li>
                        <details>
                          <summary>Autotrophs</summary>
                          <ul>
                            <li>
                              <summary>Algae:</summary>

                              <ul>
                                <li>
                                  Photosynthesizes sunlight & carbon dioxide to
                                  produce nutrients and oxygen. Life of the
                                  party!
                                </li>
                              </ul>
                            </li>

                            <li>
                              <summary>Grass:</summary>

                              <ul>
                                <li>
                                  Grows into eel grass, which is a source of
                                  food and oxygen. Needs to pull nitrogen from
                                  sand in order to grow.
                                </li>
                              </ul>
                            </li>
                          </ul>
                        </details>
                      </li>
                      <li>
                        <details>
                          <summary>Herbivores</summary>

                          <ul>
                            <li>
                              <summary>Daphnia:</summary>

                              <ul>
                                <li>
                                  Also know as water fleas, these freshwater
                                  zooplankton are a key species in the
                                  ecosystem. They feed on algae, and lay eggs
                                  which can lay dormant for a long time! More
                                  active at night.
                                </li>
                              </ul>
                            </li>
                          </ul>
                        </details>
                      </li>
                      <li>
                        <details>
                          <summary>Carnivores</summary>

                          <ul>
                            <li>
                              <summary>Fish:</summary>

                              <ul>
                                <li>
                                  They feed mostly on daphnia but will also eat
                                  on the biofilm that grows on plants. I can't
                                  tell what they're thinking.
                                </li>

                                <li>
                                  <summary>Goldfish:</summary>

                                  <ul>
                                    <li>
                                      Loyal but simple minded. Breathes oxygen
                                    </li>
                                  </ul>
                                </li>
                              </ul>
                            </li>
                          </ul>
                        </details>
                      </li>
                      <li>
                        <details>
                          <summary>Decomposers</summary>

                          <ul>
                            <li>
                              <li>Bacteria:</li>

                              <ul>
                                <li>
                                  Aerobically breaks down waste into nitrogen.
                                  Decomposers are very important parts to a
                                  functioning ecosystem. Blows bubbles when
                                  happy.
                                </li>
                              </ul>
                            </li>
                          </ul>
                        </details>
                      </li>
                    </ul>
                  </details>
                </li>
                <li>
                  <details>
                    <summary>Diagram</summary>

                    <img src="https://camo.githubusercontent.com/93105325a463894a90f70acf42eb79761f85567e/68747470733a2f2f75706c6f61642e77696b696d656469612e6f72672f77696b6970656469612f636f6d6d6f6e732f7468756d622f642f64642f466f6f6457656253696d706c652e6a70672f37323170782d466f6f6457656253696d706c652e6a7067" />
                  </details>
                </li>
                <li>
                  <details open>
                    <summary>Background</summary>
                    <ul>
                      <li>
                        Created by{" "}
                        <a href="https://maxbittker.com">max bittker</a>
                      </li>
                      <li>
                        Source code & Bug reports:{" "}
                        <a href="https://github.com/MaxBittker/orb.farm">
                          Repo
                        </a>
                      </li>

                      <li>
                        <details open>
                          <summary>Credits & Appreciations</summary>
                          <ul>
                            <li>
                              Daphnia Pixel Art:
                              <ul>
                                <li>
                                  <a href="https://twitter.com/aconfuseddragon">
                                    @aconfuseddragon
                                  </a>
                                </li>
                              </ul>
                            </li>
                            <li>
                              Background Art:
                              <ul>
                                <li>
                                  <a href="https://www.shadertoy.com/view/tdSXzD">
                                    "The sun, the sky and the clouds"
                                  </a>{" "}
                                  by stilltravelling
                                </li>
                              </ul>
                            </li>

                            <li>
                              CSS Framework:
                              <ul>
                                <li>
                                  <a href="https://jdan.github.io/98.css/">
                                    98.css{" "}
                                  </a>{" "}
                                  by{" "}
                                  <a href="https://jordanscales.com">
                                    Jordan Scales
                                  </a>{" "}
                                  & Contributors
                                </li>
                              </ul>
                            </li>
                          </ul>
                        </details>
                      </li>
                      <li>
                        <details>
                          <summary>See Also</summary>
                          <ul>
                            <li>
                              {" "}
                              Inspiration:
                              <ul>
                                <li>
                                  <a href="https://www.youtube.com/watch?v=3OG5jyRGhLg">
                                    Life in Jars
                                  </a>{" "}
                                  Youtube Channel
                                </li>
                              </ul>
                            </li>
                            <li>
                              {" "}
                              Sibling Game:
                              <ul>
                                <li>
                                  <a href="https://sandspiel.club">
                                    sandspiel.club
                                  </a>
                                </li>
                              </ul>
                            </li>
                            <li>
                              Paper I wrote in college 5 years before I built
                              this:
                              <ul>
                                <li>
                                  <a href="/assets/2014.pdf">Jar.pdf</a>
                                </li>
                              </ul>
                            </li>
                          </ul>
                        </details>
                      </li>
                    </ul>
                  </details>
                </li>
              </ul>
            </li>
          </ul>
          <img alt="Daphnia" src={daphniaImg} style={{ height: "150px" }}></img>

          <img
            alt="Daphnia"
            src={daphniaImg}
            style={{ height: "150px", float: "right", transform: "scaleX(-1)" }}
          ></img>
        </div>
      </div>
    </div>
  );
};

export default Info;
