import type { ReactNode } from "react";
import { Box, useColorModeValue } from "@chakra-ui/react";

interface Props {
  onSidebarHover: boolean;
  setSidebarHover: (value: boolean) => void;
  ignoreHover: boolean;
  setIgnoreHover: (variable: boolean) => void;
  children: ReactNode;
}

function HoverSidebar({
  children,
  onSidebarHover,
  setSidebarHover,
  ignoreHover,
  setIgnoreHover,
}: Props) {
  const bg = useColorModeValue("white", "black");
  return (
    <>
      <Box
        position="fixed"
        top="50"
        left="0"
        bg={bg}
        borderRight="1px solid"
        borderColor="gray.500"
        h="100vh"
        w={onSidebarHover ? "250px" : "50px"}
        transition="width 0.3s"
        zIndex={10} // keep it under the header
        onMouseEnter={() => {
          if (!ignoreHover) setSidebarHover(true);
        }}
        onMouseLeave={() => {
          setSidebarHover(false);
          setIgnoreHover(false);
        }}
      >
        {children}
      </Box>
    </>
  );
}

export default HoverSidebar;
