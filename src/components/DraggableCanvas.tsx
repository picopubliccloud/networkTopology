import { Box, Spinner, Text, Heading } from "@chakra-ui/react";
import useIps from "../hooks/useIps";
import GraphPlot from "./GraphPlot";

interface Props {
  selectedCity: string;
}

const DraggableCanvas = ({ selectedCity }: Props) => {
  const { data, count, error, isLoading } = useIps(selectedCity);
  // if (error) return null;
  if (isLoading) return <Spinner></Spinner>;

  return (
    <>
      <div
        style={{
          maxHeight: "700px",
          overflowY: "auto",
          overflowX: "auto",
          scrollbarWidth: "thin", // For Firefox
          scrollbarColor: "#7987f7 #08199e", // For Firefox
        }}
      >
        {error && <Text>{error}</Text>}
        <Box width="100%" overflow="auto" display={"block"}>
          {selectedCity && (
            <Heading as="h2" size="lg" mb={4}>
              {selectedCity} ({count})
            </Heading>
          )}
          <GraphPlot count={count} data={data}></GraphPlot>
          {/* <ul>
            {data.map((ip, index) => (
              <li key={index}>{ip}</li>
            ))}
          </ul> */}
        </Box>
      </div>
    </>
  );
};

export default DraggableCanvas;
