import {
  Box,
  Button,
  HStack,
  Image,
  Input,
  InputGroup,
  InputLeftElement,
  Link,
  useColorModeValue,
  Text,
  Badge,
} from "@chakra-ui/react";
import { LuSearch } from "react-icons/lu";
import logo from "../../assets/logo.png";
import { FaCircleUser } from "react-icons/fa6";
import SwithTheme from "./SwitchTheme";
import { useNavigate } from "react-router-dom";
import useKeycloak from "../../hooks/useKeycloak";

function Navbar() {
  // Custom colors for different themes:
  const inputBG = useColorModeValue("gray.100", "gray.800");
  const bgColor = useColorModeValue("white", "black"); // ensures solid background for both modes

  const navigate = useNavigate();

  // keycloak
  const { keycloak, authenticated } = useKeycloak();
  console.log("keycloak: ",keycloak)

  const handleLogin = () => {
    keycloak?.login();
  };

  const handleLogout = () => {
    keycloak?.logout();
  };

  return (
    <HStack
      position="fixed"
      top="0"
      left="0"
      right="0"
      height="50px"
      bg={bgColor}
      zIndex="1000"
      justifyContent="space-between"
      ps={2}
      pe={4}
      boxShadow="sm"
    >
      <HStack w="40%" h="100%" alignContent="center">
        <Image
          src={logo}
          w="70px"
          objectFit="cover"
          alt="PICO Public Cloud"
        />

        <Box mx={2} h="60%" w="1px" bg="gray.600" />

        <InputGroup>
          <InputLeftElement pointerEvents="none">
            <LuSearch />
          </InputLeftElement>
          <Input
            bg={inputBG}
            border="none"
            placeholder="Search..."
            _placeholder={{ fontWeight: "m" }}
          />
        </InputGroup>
      </HStack>

      <HStack w="fit-content" h="100%" alignContent="center">
        {authenticated && (
          <>
            <Text cursor="pointer" onClick={() => navigate("/profile")}>
              Hello {keycloak?.idTokenParsed?.preferred_username}
            </Text>

            <HStack spacing={2}>
              {keycloak?.realmAccess?.roles?.map((role: string) => (
                <Badge
                  key={role}
                  colorScheme="purple"
                  variant="subtle"
                  borderRadius="md"
                  px={2}
                >
                  {role}
                </Badge>
              ))}
            </HStack>

            <Button colorScheme="cyan" size="sm" onClick={handleLogout}>
              Logout
            </Button>
          </>
        )}
        <SwithTheme />
        <Link href="/profile">
          <FaCircleUser size="28px" />
        </Link>
      </HStack>
    </HStack>
  );
}

export default Navbar;
