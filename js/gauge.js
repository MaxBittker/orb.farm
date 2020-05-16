import React from "react";

function pointOnCircle(d, r, delim = " ") {
  let a = (d * Math.PI) / 180;
  return `${Math.sin(a) * r}${delim}${Math.cos(a) * r} `;
}

let tickAngles = [...Array(60).keys()].map(a => (a / 60) * 360);

let ticks = tickAngles.map((angle, i) => {
  if (angle < 45 || angle > 360 - 45) {
    return null;
  }
  let r = i % 5 == 0 ? 5 : 3;

  return (
    <polyline
      stroke="black"
      key={i}
      points={`${pointOnCircle(angle, 40 + r, ",")}
${pointOnCircle(angle, 40, ",")}
  `}
    ></polyline>
  );
});
class Gauge extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      angle: 80
    };
    window.gauge = this;
  }

  render() {
    let angle = this.state.angle;
    return (
      <svg viewBox="-47 -47 94 94" className="gauge">
        <style
          dangerouslySetInnerHTML={{
            __html:
              "\n          .small {\n            font: normal 5px serif !important;\n          }\n        "
          }}
        />
        <path
          className="dial"
          fill="none"
          stroke="black"
          strokeWidth={1}
          d="M -28.28 28.28
          A 40 40, 0, 1, 1, 28.28 28.28
          "
        />
        <path
          className="dial"
          fill="red"
          opacity="0.5"
          strokeWidth={1}
          d={`M ${pointOnCircle(-45, 40)}
        A 40 40, 0, 0, 1, ${pointOnCircle(260, 40)}
        L 0,0
        Z
        `}
        ></path>
        <path
          className="dial"
          fill="red"
          opacity="0.5"
          strokeWidth={1}
          d={`M ${pointOnCircle(45, 40)}
      A 40 40, 0, 0, 0, ${pointOnCircle(100, 40)}
      L 0,0
      Z
      `}
        ></path>
        <path
          className="dial"
          fill="green"
          opacity="0.3"
          strokeWidth={1}
          d={`M ${pointOnCircle(260, 40)}
  A 40 40, 0, 0, 1, ${pointOnCircle(100, 40)}
  L 0,0
  Z
  `}
        />

        <g className="dial">
          <circle cx={0} cy={0} r={30} fill="rgb(192, 192, 192)" />
          <circle cx={0} cy={0} r={5} fill="brass" />
          <polygon
            style={{ transform: `rotate(${angle}deg)` }}
            stroke="black"
            points={`${pointOnCircle(0, 45, ",")}
${pointOnCircle(4, -25, ",")}
${pointOnCircle(-4, -25, ",")}
          `}
          />
        </g>

        {ticks}
        <g className="text-container">
          <text
            x={-24}
            y={30}
            fill="black"
            className="value-text"
            fontSize="100%"
            fontWeight="normal"
            alignmentBaseline="middle"
            dominantBaseline="central"
          >
            CO
          </text>
          <text x={-24} y={30} dx={16} dy={7} fontSize="80%">
            2
          </text>
          <text
            x={13}
            y={30}
            fill="black"
            fontSize="100%"
            fontWeight="normal"
            alignmentBaseline="middle"
            dominantBaseline="central"
          >
            O
          </text>
          <text x={13} y={30} dx={9} dy={7} fontSize="80%">
            2
          </text>
        </g>
      </svg>
    );
  }
}

export { Gauge };
