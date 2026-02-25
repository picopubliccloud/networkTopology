import Graph from "react-graph-vis";
import { useState } from "react";
// import nokiaSwitchImage from "../assets/cisco/cisco-router-1.png";
// import nokiaSwitchImage from "../assets/nokia/nokia-switch.png";
import serverImage from "../assets/server/server.png";

const options = {
  layout: {
    hierarchical: false,
    improvedLayout: false,
  },
  edges: {
    color: "#000000",
  },
  autoResize: true,
  height: "100%",
  width: "100%",
  locale: "en",
  interaction: {
    dragView: true,
    hover: true,
    hoverConnectedEdges: true,
    navigationButtons: true,
    zoomView: true,
  },
};

const GraphPlot = ({ count, data }) => {
  const nodes_list = data.map((ip) => ({
    id: ip,
    label: ip,
    font: { size: 14, color: "#FFFFFF" },
    labelHighlightBold: true,
    shape: "image",
    size: 15,
    image: serverImage,
    imagePadding: 5,
    margin: { top: 5, right: 5, bottom: 5, left: 5 },
  }));

  const [state, setState] = useState({
    counter: 5,
    graph: {
      nodes: nodes_list,

      edges: [],
    },
    events: {
      select: ({ nodes, edges }) => {
        // console.log("events area");
        // console.log("Selected nodes:");
        // console.log(nodes);
        // console.log("Selected edges:");
        // console.log(edges);
      },
    },
  });
  const { graph, events } = state;
  return (
    <div>
      <Graph
        graph={graph}
        options={options}
        events={events}
        style={{ height: "700px" }}
      />
    </div>
  );
};

export default GraphPlot;
