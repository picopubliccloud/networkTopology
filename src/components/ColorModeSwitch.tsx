import { HStack, Switch, useColorMode } from "@chakra-ui/react";

function ColorModeSwitch() {
  const { toggleColorMode, colorMode } = useColorMode();
  const handleColorModeChange = () => {
    toggleColorMode();
  };
  return (
    <HStack>
      <Switch
        colorScheme="green"
        isChecked={colorMode === "dark"}
        onChange={handleColorModeChange}
      ></Switch>
      {/* <Text>Dark Mode</Text> */}
    </HStack>
  );
}

export default ColorModeSwitch;
