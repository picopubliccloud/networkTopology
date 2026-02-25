import React from "react";
import {
  Box,
  Flex,
  Heading,
  Text,
  Button,
  VStack,
  Image,
  useColorModeValue,
  Link,
  Alert,
  AlertIcon,
} from "@chakra-ui/react";
import useKeycloak from "../hooks/useKeycloak";
import logo from "../assets/logo.png";

/**
 * Canonical hostname for the application
 */
const CANONICAL_HOST = "nms.pico.support";

/**
 * Keycloak SSL pre-trust URL
 * User must open this once to accept the self-signed certificate
 */
const KEYCLOAK_SSL_URL = "https://192.168.30.120:8443/realms/ppc/account";
const GRAFANA_SSL_URL = "https://192.168.30.120:3000";


const AuthenticationMessage: React.FC = () => {
  const { keycloak } = useKeycloak();

  /**
   * Enforce canonical hostname
   * Redirect if accessed via IP or IP:port
   */
  React.useEffect(() => {
    const { hostname, pathname, search } = window.location;

    const isIpAccess = /^\d{1,3}(\.\d{1,3}){3}$/.test(hostname);

    if (hostname !== CANONICAL_HOST && isIpAccess) {
      window.location.replace(
        `https://${CANONICAL_HOST}${pathname}${search}`
      );
    }
  }, []);

  const handleLogin = () => {
    keycloak?.login();
  };

  const bgGradient = useColorModeValue(
    "linear(to-br, teal.400, blue.500)",
    "linear(to-br, teal.600, blue.700)"
  );

  return (
    <Flex
      minH="100vh"
      align="center"
      justify="center"
      bgGradient={bgGradient}
      px={4}
    >
      <Box
        bg={useColorModeValue("white", "gray.800")}
        rounded="xl"
        shadow="lg"
        maxW={{ base: "90%", sm: "lg" }}
        w="full"
        p={10}
        textAlign="center"
      >
        <VStack spacing={6}>
          {/* Logo */}
          <Image
            src={logo}
            alt="Pico Public Cloud Infra Dashboard"
            boxSize="100px"
            objectFit="contain"
          />

          {/* Heading */}
          <Heading fontSize="3xl" color={useColorModeValue("gray.700", "white")}>
            Welcome Back
          </Heading>

          {/* SSL Certificate Notice */}
          <Alert
            status="info"
            borderRadius="lg"
            alignItems="flex-start"
            w="full"
          >
            <AlertIcon mt="2px" />
            <VStack align="start" spacing={3} w="full">
              <Text fontSize="sm" lineHeight="1.6">
                <strong>First-time login required</strong>
                <br />
                Please open the Keycloak and Grafana page once to accept the SSL certificate.
                After that, return here and click <strong>Login</strong>. You need
                to register to login.
              </Text>

              <Link
                href={KEYCLOAK_SSL_URL}
                isExternal
                color="blue.600"
                fontWeight="semibold"
                fontSize="sm"
              >
                Click here to open Keycloak
              </Link>
              <Link
                href={GRAFANA_SSL_URL}
                isExternal
                color="blue.600"
                fontWeight="semibold"
                fontSize="sm"
              >
                Click here to open Grafana 
              </Link>
              
            </VStack>
          </Alert>

          {/* Subtitle */}
          <Text fontSize="md" color={useColorModeValue("gray.500", "gray.200")}>
            Please log in to access your dashboard and manage your account.
          </Text>

          {/* Login Button */}
          <Button
            colorScheme="blue"
            size="lg"
            w="full"
            onClick={handleLogin}
            _hover={{ transform: "scale(1.05)" }}
            _active={{ transform: "scale(0.98)" }}
          >
            Login
          </Button>

          {/* Footer */}
          <Text fontSize="sm" color={useColorModeValue("gray.400", "gray.500")}>
            Powered by Pico DevOps Team
          </Text>
        </VStack>
      </Box>
    </Flex>
  );
};

export default AuthenticationMessage;
