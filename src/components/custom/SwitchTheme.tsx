import { Box, useColorMode, useColorModeValue } from "@chakra-ui/react";
import { MdSunny } from "react-icons/md";
import { BsFillMoonStarsFill } from "react-icons/bs";

function SwithTheme() {
  const { colorMode, toggleColorMode } = useColorMode();
  const bg = useColorModeValue("gray.200", "gray.700");
  return (
    <header>
      <Box
        p={2}
        _hover={{ bg: bg }}
        borderRadius={"full"}
        cursor={"pointer"}
        fontSize={20}
        onClick={toggleColorMode}
      >
        {colorMode === "light" ? <BsFillMoonStarsFill /> : <MdSunny />}
      </Box>
    </header>
  );
}

export default SwithTheme;
