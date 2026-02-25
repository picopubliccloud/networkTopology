import { Button, HStack, Image, Text, Link } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";
import ColorModeSwitch from "./ColorModeSwitch";
import useKeycloak from "../hooks/useKeycloak";

function NavBar() {
  const navigate = useNavigate();

  const { keycloak, authenticated } = useKeycloak();

  const handleLogin = () => {
    keycloak?.login();
  };

  const handleLogout = () => {
    keycloak?.logout();
  };

  return (
    <HStack justifyContent="space-between" padding="10px">
      <Link href="/dashboard">
        <Image
          src={logo}
          htmlHeight={40}
          htmlWidth={100}
          alt="Pico Public Cloud."
        />
      </Link>
      <Text
        bgGradient="linear(to-l, #7928CA, #FF0080)"
        bgClip="text"
        fontWeight="extrabold"
        fontSize="2xl"
      >
        Pico Public Cloud
      </Text>

      <HStack spacing="4">
        <ColorModeSwitch />

        {authenticated ? (
          <>
            <Text cursor="pointer" onClick={() => navigate("/profile")}>
              User: {keycloak ? keycloak?.idTokenParsed?.preferred_username : "Guest"}
            </Text>
            <Button size="sm" colorScheme="teal" onClick={handleLogout}>
              Logout
            </Button>
          </>
        ) : (
          <Button size="sm"  colorScheme="teal" onClick={handleLogin}>
            Login
          </Button>
        )}
      </HStack>
    </HStack>
  );
}

export default NavBar;
