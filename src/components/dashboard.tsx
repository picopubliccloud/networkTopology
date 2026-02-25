import { Box, Grid, Image, Text, VStack } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import useKeycloak from "../hooks/useKeycloak";
import AuthenticationMessage from "./AuthenticationMessage";
import { listItems } from "./custom/SidebarList";

interface SidebarProps {
  // selected: string;
  onSelect: (label: string) => void;
}

const Dashboard = ({ onSelect }: SidebarProps) => {
  const navigate = useNavigate();
  const { keycloak, authenticated } = useKeycloak();

  if (!authenticated || !keycloak) {
    return <AuthenticationMessage />;
  }

  const handleClick = (label: string, route: string) => {
    onSelect(label);
    navigate(route);
  };

  return (
    <Box p={5}>
      <Grid
        templateColumns={{ base: "repeat(2, 1fr)", md: "repeat(4, 1fr)" }}
        gap={6}
      >
        {listItems
          .filter((module) => module.image)
          .map((module, index) => {
            const isExternal = module.link.startsWith("http");

            const content = (
              <VStack>
                <Image src={module.image} alt={module.label} boxSize="80px" />
                <Text fontWeight="bold">{module.label}</Text>
              </VStack>
            );

            return isExternal ? (
              <Box
                as="a"
                href={module.link}
                target="_blank"
                rel="noopener noreferrer"
                key={index}
                p={4}
                borderWidth="1px"
                borderRadius="lg"
                cursor="pointer"
                _hover={{ boxShadow: "lg", transform: "scale(1.05)" }}
              >
                {content}
              </Box>
            ) : (
              <Box
                key={index}
                p={4}
                borderWidth="1px"
                borderRadius="lg"
                cursor="pointer"
                onClick={() => {
                  // navigate(module.route);
                  handleClick(module.label, module.link);
                }}
                _hover={{ boxShadow: "lg", transform: "scale(1.05)" }}
              >
                {content}
              </Box>
            );
          })}
      </Grid>
    </Box>
  );
};

export default Dashboard;
