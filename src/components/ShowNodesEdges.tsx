import { Box, Heading } from "@chakra-ui/react";
import useNodeEdge from "../hooks/useNodeEdge";
import PlotShowNodesEdges from "./PlotShowNodesEdges";

interface Props {
  selectedCity: string;
}

const ShowNodesEdges = ({ selectedCity }: Props) => {
  const { data, count, error, isLoading } = useNodeEdge(selectedCity);

  return (
    <>
      <div
        style={{
          height: "100%",
          // maxHeight: "700px",
          // overflowY: "auto",
          // overflowX: "auto",
          //scrollbarWidth: "thin", // For Firefox
          //scrollbarColor: "#7987f7 #08199e", // For Firefox
        }}
      >
        {/* {error && <Text>{error}</Text>} overflow="auto" */} 
        <Box width="100%"  display={"block"}>
          {selectedCity && (
            <Heading as="h4" size="md" mb={2}>
              {selectedCity} ({count})
            </Heading>
          )}
          <PlotShowNodesEdges
            data={data}
            count={count}
            error={error}
            isLoading={isLoading}
          ></PlotShowNodesEdges>
        </Box>
      </div>
    </>
  );
};

export default ShowNodesEdges;
