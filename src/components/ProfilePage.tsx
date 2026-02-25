import {
  Avatar,
  Box,
  Button,
  Card,
  CardBody,
  Divider,
  Flex,
  Heading,
  Icon,
  Stack,
  Text,
  VStack,
  useColorModeValue,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import {
  FaUser,
  FaEnvelope,
  FaUserShield,
  FaCalendarAlt,
  FaSignOutAlt,
  FaLock,
} from "react-icons/fa";
import useUpdateProfile from "../hooks/useUpdateProfile";
import useKeycloak from "../hooks/useKeycloak";

const ProfilePage = () => {
  const navigate = useNavigate();
  const { handleChangePassword } = useUpdateProfile();
  const { keycloak } = useKeycloak();

  if (!keycloak || !keycloak.tokenParsed) return null;

  const token = keycloak.tokenParsed as any;

  const user = {
    firstName: token.given_name,
    lastName: token.family_name,
    username: token.preferred_username,
    email: token.email,
    roles: token.realm_access?.roles || [],
    createdAt: token.iat ? new Date(token.iat * 1000) : null,
    lastLogin: token.auth_time
      ? new Date(token.auth_time * 1000)
      : null,
  };

  const cardBg = useColorModeValue("white", "gray.800");
  const textColor = useColorModeValue("gray.700", "gray.300");
  const headingColor = useColorModeValue("gray.900", "white");
  const borderColor = useColorModeValue("gray.200", "gray.600");

  return (
    <Flex
      justify="center"
      align="center"
      minH="100vh"
      bg={useColorModeValue("gray.50", "gray.900")}
      p={4}
    >
      <Card
        maxW="450px"
        w="full"
        boxShadow="lg"
        borderRadius="lg"
        p={6}
        bg={cardBg}
        border="1px solid"
        borderColor={borderColor}
      >
        <CardBody>
          <VStack spacing={4} align="center">
            <Avatar
              size="xl"
              name={`${user.firstName} ${user.lastName}`}
            />

            <Heading size="lg" color={headingColor}>
              {user.firstName} {user.lastName}
            </Heading>

            <Text fontSize="md" color={textColor}>
              @{user.username}
            </Text>

            <Divider />

            <Box w="full">
              <Stack spacing={3}>
                <Flex align="center">
                  <Icon as={FaUser} color="teal.400" />
                  <Text ml={2} color={textColor}>
                    First Name: {user.firstName}
                  </Text>
                </Flex>

                <Flex align="center">
                  <Icon as={FaUser} color="teal.400" />
                  <Text ml={2} color={textColor}>
                    Last Name: {user.lastName}
                  </Text>
                </Flex>

                <Flex align="center">
                  <Icon as={FaEnvelope} color="teal.400" />
                  <Text ml={2} color={textColor}>
                    Email: {user.email}
                  </Text>
                </Flex>

                <Flex align="center">
                  <Icon as={FaUserShield} color="teal.400" />
                  <Text ml={2} color={textColor}>
                    Roles: {user.roles.join(", ")}
                  </Text>
                </Flex>

                <Flex align="center">
                  <Icon as={FaCalendarAlt} color="teal.400" />
                  <Text ml={2} color={textColor}>
                    Joined:{" "}
                    {user.createdAt
                      ? user.createdAt.toLocaleDateString()
                      : "N/A"}
                  </Text>
                </Flex>

                <Flex align="center">
                  <Icon as={FaCalendarAlt} color="teal.400" />
                  <Text ml={2} color={textColor}>
                    Last Login:{" "}
                    {user.lastLogin
                      ? user.lastLogin.toLocaleString()
                      : "N/A"}
                  </Text>
                </Flex>
              </Stack>
            </Box>

            <Divider />

            <Button
              leftIcon={<FaLock />}
              colorScheme="teal"
              w="full"
              onClick={handleChangePassword}
            >
              Change Password
            </Button>

            <Button
              leftIcon={<FaSignOutAlt />}
              variant="outline"
              w="full"
              onClick={() => navigate("/")}
            >
              Back to Home
            </Button>
          </VStack>
        </CardBody>
      </Card>
    </Flex>
  );
};

export default ProfilePage;
