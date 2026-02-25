import Graph from "react-graph-vis";
import { useState, useEffect } from "react";
// import ciscoRouterImage from "../assets/cisco/cisco-router-1-min.png";
import nokiaSwitchImage from "../assets/nokia/nokia-switch.png";
import RouterImage from "../assets/huawei/huawei-router.png";
import DdosImage from "../assets/server/fortidos.png";
import FwImage from "../assets/server/FortiGate-Next-Generation-Firewall.png";

import SpineImage from "../assets/nokia/nokia-switch.png";
import serverImage from "../assets/server/server.png";
import oobImage from "../assets/oob-switch.png";

import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Center,
  useColorMode,
} from "@chakra-ui/react";

import { Text, Spinner } from "@chakra-ui/react";
import uuid from "react-uuid";
import { NodeEdgeResponse } from "../hooks/useNodeEdge";

interface Props {
  data: NodeEdgeResponse;
  count: Number;
  error: string;
  isLoading: boolean;
}

const PlotShowNodesEdges = ({ data, count, error, isLoading }: Props) => {
  const options = {
    nodes: {
      borderWidth: 1,
      brokenImage: undefined,
      shapeProperties: {
        interpolation: false, // 'true' for intensive zooming
      },
    },
    
    layout: {
      randomSeed: 1,
      hierarchical: {
        enabled: true,
        direction: "UD", // up Down
        levelSeparation: 200, // Space between levels
        nodeSpacing: 150, // Space between nodes
        sortMethod: "directed", // Organize nodes based on edges
        treeSpacing: 150,
        blockShifting: true,
        edgeMinimization: true,
        parentCentralization: true,
        shakeTowards: "leaves",
      },
      improvedLayout: true,
    },
    edges: {
      color: { color: "#000000", hover: "#23FF00", highlight: "#23FF00" },
      arrows: "to",
      dashes: false,
      smooth: true,
      width: 1.5,
      scaling: {
        label: true,
      },
      selfReference: { size: 20, renderBehindTheNode: true },
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
      keyboard: true,
      dragNodes: true,
      tooltipDelay: 300,
    },
    physics: {
      enabled: true,
      barnesHut: {
        theta: 0.5,
        gravitationalConstant: -200,
        centralGravity: 0.3,
        springLength: 95,
        springConstant: 0.04,
        damping: 0.09,
        avoidOverlap: 1,
      },
      hierarchicalRepulsion: {
        centralGravity: 0.0,
        springLength: 300,
        springConstant: 0.01,
        nodeDistance: 200,
        damping: 0.09,
        avoidOverlap: 1,
      },
      solver: "hierarchicalRepulsion",
    },
  };

  //console.log(data);

  const [state, setState] = useState({
    counter: 0,
    graph: {
      nodes: [],
      edges: [],
    },
    events: {
      // select: ({ nodes, edges }) => {},
    },
  });
  const { colorMode } = useColorMode();
  const [nodeTitleColor, setNodeTitleColor] = useState(
    colorMode === "dark" ? "#FFFFFF" : "#000000"
  );
  useEffect(() => {
    // Update nodeTitleColor when colorMode changes
    setNodeTitleColor(colorMode === "dark" ? "#FFFFFF" : "#000000");
  }, [colorMode]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const uniqueNodes = data.reduce((acc, curr) => {
          curr.nodes.forEach((node) => {
            if (node.ip && node.ip !== "") {
              const existingNode = acc.find((item) => item.ip === node.ip);
              if (!existingNode) {
                acc.push({ ip: node.ip, hostname: node.hostname });
              }
            }
          });
          return acc;
        }, []);

        // console.log("data: ", data);
        const uniqueEdges = data.reduce((acc, curr) => {
          curr.edges.forEach((edge) => {
            // console.log(edge);
            if (edge.local_ipaddress && edge.neighbor_ipaddress !== "") {
              const existingEdge = acc.find(
                (item) =>
                  item.local_ipaddress === edge.local_ipaddress &&
                  item.neighbor_ipaddress === edge.neighbor_ipaddress &&
                  item.local_intf === edge.local_intf &&
                  item.neighbor_intf === edge.neighbor_intf
              );
              if (!existingEdge) {
                // console.log("==> pushed: ",edge)
                acc.push({
                  local_ipaddress: edge.local_ipaddress,
                  neighbor_ipaddress: edge.neighbor_ipaddress,
                  local_intf: edge.local_intf,
                  neighbor_intf: edge.neighbor_intf,
                  description: edge.description,
                });
              }
            }
          });
          return acc;
        }, []);
        // const nodes_list = uniqueNodes.map((node) => ({
        //   id: node.ip,
        //   label: node.ip + "\n\n" + node.hostname,
        //   title: node.hostname,
        //   font: { size: 14, color: nodeTitleColor },
        //   labelHighlightBold: true,
        //   shape: "image",
        //   size: 35,
        //   image: node.ip.startsWith("192.168.16.") ? nokiaSwitchImage : serverImage,
        //   imagePadding: 5,
        //   margin: { top: 5, right: 5, bottom: 5, left: 5 },
        // }));
        // console.log('==> uniqueNodes: ',uniqueNodes);
        const nodes_list = uniqueNodes.map((node) => {
          let nodeLevel;
          let nodeImage;

          if (node.ip.startsWith("192.168.255.247") || node.ip.startsWith("192.168.255.248") || node.ip.startsWith("192.168.255.249") ) {
            nodeLevel = -5; //Top layer for ISP
            nodeImage = RouterImage;
          }else if (node.ip.startsWith("192.168.16.240") || node.ip.startsWith("192.168.16.241") || node.ip.startsWith("192.168.17.240") || node.ip.startsWith("192.168.17.241")) {
            nodeLevel = -4; //Top layer for SROS
            nodeImage = RouterImage;
          }else if (node.hostname.startsWith("FortiDDoS-1500E-01") || node.hostname.startsWith("FortiDDoS-1500E-02") || node.hostname.startsWith("JSR-FortiDDoS-1500E-01") || node.hostname.startsWith("JSR-FortiDDoS-1500E-02")) {
            nodeLevel = -3; //Top layer for DDos
            nodeImage = DdosImage;
          }else if (node.ip.startsWith("192.168.255.255") || node.ip.startsWith("192.168.255.253") || node.ip.startsWith("103.179.63.26") || node.ip.startsWith("103.179.63.27")) {
            nodeLevel = -2; //Top layer for FW
            nodeImage = FwImage;
          }else if (node.ip.startsWith("192.168.16.101") || node.ip.startsWith("192.168.16.102") || node.ip.startsWith("192.168.17.218") || node.ip.startsWith("192.168.17.220")) {
            nodeLevel = -1; //Top layer for Bleaf
            nodeImage = nokiaSwitchImage;
          }else if (node.ip.startsWith("192.168.16.103") || node.ip.startsWith("192.168.16.104") || node.ip.startsWith("192.168.17.103") || node.ip.startsWith("192.168.17.104")) {
            nodeLevel = 0; //Top layer for spines
            nodeImage = SpineImage;
          } else if (node.ip.startsWith("192.168.16.2") || node.ip.startsWith("192.168.17.2")) {
            nodeLevel = 4; // Middle layer for leaves
            nodeImage = nokiaSwitchImage;
          } else if (
            node.ip.startsWith("192.168.16.15") ||
            node.ip.startsWith("192.168.17.15") ||
            node.ip.startsWith("172.30.0.100") ||
            node.ip.startsWith("172.30.0.101")
          ) {
            nodeLevel = 8; // OOB layer for leaves
            nodeImage = oobImage;
          } else {
            nodeLevel = 6; // Bottom layer for servers
            nodeImage = serverImage;
          }
          if (node.ip.startsWith("192.168.16.250") || node.ip.startsWith("192.168.17.250")) {
            nodeLevel = 10; // last layer for OOB AGG
            nodeImage = oobImage;
          }

          return {
            id: node.ip,
            label: node.ip + "\n\n" + node.hostname,
            title: node.hostname,
            font: { size: 14, color: nodeTitleColor },
            labelHighlightBold: true,
            shape: "image",
            size: 35,
            image: nodeImage,
            imagePadding: 5,
            margin: { top: 5, right: 5, bottom: 5, left: 5 },
            level: nodeLevel, // Assign level based on IP
          };
        });
        // console.log("uniqueEdges: ", uniqueEdges);

        // const edges_list = uniqueEdges.map((edge) => ({
        //   from: edge.local_ipaddress,
        //   to: edge.neighbor_ipaddress,
        //   title:
        //     edge.local_ipaddress +
        //     " " +
        //     edge.local_intf +
        //     "<-->" +
        //     edge.neighbor_ipaddress +
        //     " " +
        //     edge.neighbor_intf +
        //     "\n" +
        //     edge.description,
        // }));
        // console.log("edges_list: ", edges_list);

        // Step 1: Count how many edges exist between each node pair
        const edgeCountMap = new Map<string, number>();

        uniqueEdges.forEach((edge) => {
          const key = `${edge.local_ipaddress}->${edge.neighbor_ipaddress}`;
          edgeCountMap.set(key, (edgeCountMap.get(key) || 0) + 1);
        });

        // // Step 2: Create edge list with conditional smooth setting
        // const edges_list = uniqueEdges.map((edge, index) => {
        //   const key = `${edge.local_ipaddress}->${edge.neighbor_ipaddress}`;
        //   const edgeCount = edgeCountMap.get(key) || 0;
        //   const hasMultipleEdges = edgeCount > 1;

        //   return {
        //     from: edge.local_ipaddress,
        //     to: edge.neighbor_ipaddress,
        //     title:
        //       edge.local_ipaddress +
        //       " " +
        //       edge.local_intf +
        //       "<-->" +
        //       edge.neighbor_ipaddress +
        //       " " +
        //       edge.neighbor_intf +
        //       "\n" +
        //       edge.description,
        //     id: `${edge.local_ipaddress}-${edge.local_intf}-${edge.neighbor_ipaddress}-${edge.neighbor_intf}-${index}`,
        //     smooth: hasMultipleEdges
        //       ? {
        //           enabled: true,
        //           type: "curvedCW",
        //           roundness: 0.05+ index * 0.005, // Vary roundness for better separation
        //         }
        //       : false,
        //   };
        // });
        const edgeGroups = new Map<string, any[]>();

        // Group edges between the same node pairs
        uniqueEdges.forEach((edge) => {
          const key = `${edge.local_ipaddress}->${edge.neighbor_ipaddress}`;
          if (!edgeGroups.has(key)) {
            edgeGroups.set(key, []);
          }
          edgeGroups.get(key).push(edge);
        });
        
        const edges_list: any[] = [];
        
        edgeGroups.forEach((group, key) => {
          group.forEach((edge, idx) => {
            const hasMultiple = group.length > 1;
        
            edges_list.push({
              from: edge.local_ipaddress,
              to: edge.neighbor_ipaddress,
              title:
                edge.local_ipaddress +
                " " +
                edge.local_intf +
                " <--> " +
                edge.neighbor_ipaddress +
                " " +
                edge.neighbor_intf +
                "\n" +
                edge.description,
              id: `${edge.local_ipaddress}-${edge.local_intf}-${edge.neighbor_ipaddress}-${edge.neighbor_intf}-${idx}`,
              smooth: hasMultiple
                ? {
                    enabled: true,
                    type: "straightCross",
                    roundness: (idx - (group.length - 1) / 2) * 1.8, // offset left/right
                  }
                : false,
            });
          });
        });




        setState((prevState) => ({
          ...prevState,
          counter: nodes_list.length,
          graph: {
            nodes: nodes_list,
            edges: edges_list,
          },
        }));
      } catch (error) {
        console.error("Error fetching data: ", error);
      }
    };

    fetchData();
  }, [data, nodeTitleColor]);

  const { graph, events } = state;

  const graphStyle = {
    height: "80vh",
  };

  return (
    <div>
      {isLoading && (
        <>
          <Center>
            <Spinner
              thickness="4px"
              speed="0.65s"
              emptyColor="gray.200"
              color="blue.500"
              size="xl"
            ></Spinner>
          </Center>
        </>
      )}

      {error && (
        <Alert status="error">
          <AlertIcon />
          <AlertTitle>Error!</AlertTitle>
          <AlertDescription>
            <Text>{error}</Text>
          </AlertDescription>
        </Alert>
      )}
      
      <div style={graphStyle}>
      <Text>Last Update: 17th May 2025</Text>
        <Graph
          key={uuid()}
          graph={graph}
          options={options}
          events={events}
          //style={{ height: "100vh" }}
        />
      </div>
    </div>
  );
};

export default PlotShowNodesEdges;
