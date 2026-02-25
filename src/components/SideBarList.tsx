import {
  ListItem,
  List,
  Button,
  Spinner,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Text,
  Collapse,
  Link,
} from "@chakra-ui/react";
import { ChevronDownIcon, ChevronUpIcon } from "@chakra-ui/icons";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import useSideBarItems from "../hooks/useSideBarItems";

interface Props {
  onSelect: (city: string) => void;
  selectedCity: string | null;
}

const SideBarList = ({ selectedCity, onSelect }: Props) => {
  const { data, error, isLoading } = useSideBarItems();
  const [activeSection, setActiveSection] = useState<string | null>(null);

  const toggleSection = (section: string) => {
    setActiveSection((prev) => (prev === section ? null : section));
  };

  const location = useLocation();

  useEffect(() => {
    // console.log("==> location.pathname: ", location.pathname);
    if (location.pathname === "/topology") {
      setActiveSection("topology");
    }
  }, [location]);

  const zones = data?.map((zone) => `${zone.districtsByZone} (${zone.count})`);

  zones?.sort((a, b) => {
    const zoneA = a.split(" (")[0].trim();
    const zoneB = b.split(" (")[0].trim();
    return zoneA.localeCompare(zoneB);
  });

  return (
    <div
      style={{
        maxHeight: "700px",
        overflowY: "auto",
        scrollbarWidth: "thin",
        scrollbarColor: "#7987f7 #08199e",
      }}
    >
      {isLoading && (
        <Spinner
          thickness="4px"
          speed="0.65s"
          emptyColor="gray.200"
          color="blue.500"
          size="sm"
        />
      )}
      {error && (
        <Alert status="error">
          <AlertIcon />
          <AlertTitle>Error!</AlertTitle>
          <AlertDescription>
            <Text>{error}</Text>
          </AlertDescription>
        </Alert>
      )}

      <List padding={1}>
        <ListItem
          border="0px"
          padding={2}
          _hover={{ color: "blue" }}
          color={activeSection === "dashboard" ? "blue" : ""}
          onClick={() => toggleSection("dashboard")}
        >
          <Link href="/dashboard">Dashboard</Link>
        </ListItem>

        <ListItem
          border="0px"
          padding={2}
          _hover={{ color: "blue" }}
          cursor="pointer"
        >
          <Button
            variant="link"
            rightIcon={
              activeSection === "topology" ? (
                <ChevronDownIcon />
              ) : (
                <ChevronUpIcon />
              )
            }
            _hover={{ color: "blue" }}
            color={activeSection === "topology" ? "blue" : ""}
            onClick={() => {
              toggleSection("topology");
              // window.location.href = "/topology";
            }}
          >
            Topology
          </Button>
        </ListItem>

        <Collapse in={activeSection === "topology"}>
          {zones?.map((city, index) => (
            <ListItem
              key={index}
              border="0px"
              _hover={{ color: "blue" }}
              padding={1}
              ml={4}
            >
              <Button
                leftIcon={
                  city.split("(")[0] === selectedCity ? (
                    <ChevronDownIcon />
                  ) : (
                    <ChevronUpIcon />
                  )
                }
                fontWeight={
                  city.split("(")[0] === selectedCity ? "bold" : "normal"
                }
                onClick={() => {
                  onSelect(city.split("(")[0]);
                  if (location.pathname != "/topology") {
                    window.location.href = "/topology";
                  }
                }}
                variant="link"
                _hover={{ color: "blue" }}
                color={city.split("(")[0] === selectedCity ? "blue" : ""}
              >
                {city}
              </Button>
            </ListItem>
          ))}
        </Collapse>

        <ListItem
          border="0px"
          padding={2}
          _hover={{ color: "blue" }}
          color={activeSection === "serverhealth" ? "blue" : ""}
          onClick={() => toggleSection("serverhealth")}
        >
          <Link href="/serverhealth">Server Health</Link>
        </ListItem>
      </List>
    </div>
  );
};

export default SideBarList;
