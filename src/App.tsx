import {
  Box,
  Grid,
  GridItem,
  Link,
  Text,
  useColorMode,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import darkImage from "./assets/background-dark.png";
import lightImage from "./assets/background-light.png";

import useKeycloak from "./hooks/useKeycloak";

import Navbar from "./components/custom/Navbar";
import SecondSidebar from "./components/custom/SecondSidebar";
import ExpandButton from "./components/custom/ExpandButton";
import SidebarList, { listItems } from "./components/custom/SidebarList";
import HoverSidebar from "./components/custom/HoverSidebar";

import Dashboard from "./components/dashboard";
import ProfilePage from "./components/ProfilePage";
import Alarm from "./components/Alarm";
import ShowNodesEdges from "./components/ShowNodesEdges";
import ServerHealth from "./components/ServerHealth";
import NetworkTraffic from "./components/NetworkTraffic";
import DeviceDetails from "./components/DeviceDetails";
import InventoryForm from "./components/custom/InventoryForm";
import InventoryTable from "./components/custom/ShowInventory";
import AuthenticationMessage from "./components/AuthenticationMessage";

import OpenStackDashboard from "./components/OpenStackDashboard";
// import Login from "./components/Login";
//ticketing
import TicketingApiTest from "./components/ticketing/TicketingApiTest";
import DeviceHistory from "./components/custom/DeviceHistory";
import LinkHistory from "./components/custom/LinkHistory";
import AllDeviceHistory from "./components/custom/AllDeviceHistory";
import TicketsListPage from "./components/ticketing/TicketsListPage";
import TicketDetailsPage from "./components/ticketing/TicketDetailsPage";
import CreateTicketPage from "./components/ticketing/CreateTicketPage";
import AllLinkHistory from "./components/custom/AllLinkHistory";
import UploadTicketAttachmentsPage from "./components/ticketing/UploadTicketAttachmentsPage";

function Layout({
  children,
  selectedCity,
  onSelect,
  // FIXME: Newly added to fix the sidebar sync
  selectedSidebarItem,
  setSelectedSidebarItem,
}: {
  children: React.ReactNode;
  selectedCity: string;
  onSelect: (city: string) => void;
  // FIXME: Newly added to fix the sidebar sync
  selectedSidebarItem: string;
  setSelectedSidebarItem: (label: string) => void;
}) {
  const { colorMode } = useColorMode();
  const backgroundImage = colorMode === "dark" ? darkImage : lightImage;

  const [onSidebarHover, setSidebarHover] = useState(false);
  const [ignoreHover, setIgnoreHover] = useState(false);
  const [isExpanded, setExpanded] = useState(false);

  const selectedItem = listItems.find(
    (item) => item.label === selectedSidebarItem,
  );

  useEffect(() => {
    if (selectedItem?.subItems) {
      setExpanded(true);
      setSidebarHover(false);
      setIgnoreHover(true);
    } else {
      setExpanded(false);
      setIgnoreHover(false);
    }
  }, [selectedItem]);

  return (
    <Grid
      templateRows="50px 1fr"
      templateColumns={isExpanded ? "50px 250px 1fr" : "50px 1fr"}
      h="100vh"
    >
      <GridItem colSpan={isExpanded ? 3 : 2}>
        <Navbar />
      </GridItem>

      <GridItem bg="gray.600" />

      <HoverSidebar
        onSidebarHover={onSidebarHover}
        setSidebarHover={setSidebarHover}
        ignoreHover={ignoreHover}
        setIgnoreHover={setIgnoreHover}
      >
        {/* FIXME: */}
        <SidebarList
          onHover={onSidebarHover}
          selected={selectedSidebarItem}
          onSelect={setSelectedSidebarItem}
        />
      </HoverSidebar>

      {selectedItem?.subItems && isExpanded && (
        <GridItem zIndex={10}>
          <SecondSidebar
            items={selectedItem.subItems}
            onCollapse={() => setExpanded(false)}
            onSelectCity={onSelect}
          />
        </GridItem>
      )}

      <GridItem
        backgroundImage={backgroundImage}
        overflowX="hidden"
        overflowY="auto"
      >
        <Box w="100%" h="100%" overflow="auto">
          {children}
        </Box>
      </GridItem>

      {selectedItem?.subItems && !isExpanded && (
        <ExpandButton onExpand={() => setExpanded(true)} />
      )}
    </Grid>
  );
}

export default function App() {
  const [selectedCity, setSelectedCity] = useState("Kaliakoir");
  const { initialized, keycloak, authenticated } = useKeycloak();
  const [selectedSidebarItem, setSelectedSidebarItem] = useState<string>(
    listItems[0].label,
  );

  // Block rendering until Keycloak is ready
  if (!initialized) {
    return <div>Loading authentication...</div>;
  }

  if (!authenticated || !keycloak) {
    return <AuthenticationMessage />;
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        <Route
          path="/dashboard"
          element={
            <Layout
              selectedCity={selectedCity}
              onSelect={setSelectedCity}
              selectedSidebarItem={selectedSidebarItem}
              setSelectedSidebarItem={setSelectedSidebarItem}
            >
              <Dashboard onSelect={setSelectedSidebarItem} /> {/* FIXME: */}
            </Layout>
          }
        />

        {/* <Route path="/login" element={<Login />} /> */}

        <Route
          path="/profile"
          element={
            <Layout
              selectedCity={selectedCity}
              onSelect={setSelectedCity}
              selectedSidebarItem={selectedSidebarItem}
              setSelectedSidebarItem={setSelectedSidebarItem}
            >
              <ProfilePage />
            </Layout>
          }
        />

        <Route
          path="/alarm"
          element={
            <Layout
              selectedCity={selectedCity}
              onSelect={setSelectedCity}
              selectedSidebarItem={selectedSidebarItem}
              setSelectedSidebarItem={setSelectedSidebarItem}
            >
              <Alarm />
            </Layout>
          }
        />

        <Route
          path="/topology"
          element={
            <Layout
              selectedCity={selectedCity}
              onSelect={setSelectedCity}
              selectedSidebarItem={selectedSidebarItem}
              setSelectedSidebarItem={setSelectedSidebarItem}
            >
              <ShowNodesEdges selectedCity={selectedCity} />
            </Layout>
          }
        />

        <Route
          path="/serverhealth"
          element={
            <Layout
              selectedCity={selectedCity}
              onSelect={setSelectedCity}
              selectedSidebarItem={selectedSidebarItem}
              setSelectedSidebarItem={setSelectedSidebarItem}
            >
              <ServerHealth />
            </Layout>
          }
        />
        <Route
          path="/networktraffic"
          element={
            <Layout
              selectedCity={selectedCity}
              onSelect={setSelectedCity}
              selectedSidebarItem={selectedSidebarItem}
              setSelectedSidebarItem={setSelectedSidebarItem}
            >
              <NetworkTraffic />
            </Layout>
          }
        />

        <Route
          path="/device-details"
          element={
            <Layout
              selectedCity={selectedCity}
              onSelect={setSelectedCity}
              selectedSidebarItem={selectedSidebarItem}
              setSelectedSidebarItem={setSelectedSidebarItem}
            >
              <DeviceDetails />
            </Layout>
          }
        />

        <Route
          path="/inventory"
          element={
            <Layout
              selectedCity={selectedCity}
              onSelect={setSelectedCity}
              selectedSidebarItem={selectedSidebarItem}
              setSelectedSidebarItem={setSelectedSidebarItem}
            >
              <InventoryTable />
            </Layout>
          }
        />

        <Route
          path="/addInventory"
          element={
            <Layout
              selectedCity={selectedCity}
              onSelect={setSelectedCity}
              selectedSidebarItem={selectedSidebarItem}
              setSelectedSidebarItem={setSelectedSidebarItem}
            >
              <InventoryForm />
            </Layout>
          }
        />

        <Route
          path="/updateRecord"
          element={
            <Layout
              selectedCity={selectedCity}
              onSelect={setSelectedCity}
              selectedSidebarItem={selectedSidebarItem}
              setSelectedSidebarItem={setSelectedSidebarItem}
            >
              <InventoryForm />
            </Layout>
          }
        />

        {/* TODO: Added History page but needs to be completed. */}
        <Route
          path="/device-history"
          element={
            <Layout
              selectedCity={selectedCity}
              onSelect={setSelectedCity}
              selectedSidebarItem={selectedSidebarItem}
              setSelectedSidebarItem={setSelectedSidebarItem}
            >
              <DeviceHistory />
            </Layout>
          }
        />
        <Route
          path="/link-history"
          element={
            <Layout
              selectedCity={selectedCity}
              onSelect={setSelectedCity}
              selectedSidebarItem={selectedSidebarItem}
              setSelectedSidebarItem={setSelectedSidebarItem}
            >
              <LinkHistory />
            </Layout>
          }
        />
        <Route
          path="/all-device-alarm-history"
          element={
            <Layout
              selectedCity={selectedCity}
              onSelect={setSelectedCity}
              selectedSidebarItem={selectedSidebarItem}
              setSelectedSidebarItem={setSelectedSidebarItem}
            >
              <AllDeviceHistory />
            </Layout>
          }
        />

        <Route
          path="/all-link-alarm-history"
          element={
            <Layout
              selectedCity={selectedCity}
              onSelect={setSelectedCity}
              selectedSidebarItem={selectedSidebarItem}
              setSelectedSidebarItem={setSelectedSidebarItem}
            >
              <AllLinkHistory />
            </Layout>
          }
        />
        <Route
          path="/ticketing-test"
          element={
            <Layout
              selectedCity={selectedCity}
              onSelect={setSelectedCity}
              selectedSidebarItem={selectedSidebarItem}
              setSelectedSidebarItem={setSelectedSidebarItem}
            >
              <TicketingApiTest />
            </Layout>
          }
        />
        <Route
          path="/tickets"
          element={
            <Layout
              selectedCity={selectedCity}
              onSelect={setSelectedCity}
              selectedSidebarItem={selectedSidebarItem}
              setSelectedSidebarItem={setSelectedSidebarItem}
            >
              <TicketsListPage />
            </Layout>
          }
        />
        <Route
          path="/tickets/create"
          element={
            <Layout
              selectedCity={selectedCity}
              onSelect={setSelectedCity}
              selectedSidebarItem={selectedSidebarItem}
              setSelectedSidebarItem={setSelectedSidebarItem}
            >
              <CreateTicketPage />
            </Layout>
          }
        />
        <Route
          path="/tickets/:ticket_id/attachments/upload"
          element={
            <Layout
              selectedCity={selectedCity}
              onSelect={setSelectedCity}
              selectedSidebarItem={selectedSidebarItem}
              setSelectedSidebarItem={setSelectedSidebarItem}
            >
              <UploadTicketAttachmentsPage />
            </Layout>
          }
        />

        <Route
          path="/tickets/:ticket_id"
          element={
            <Layout
              selectedCity={selectedCity}
              onSelect={setSelectedCity}
              selectedSidebarItem={selectedSidebarItem}
              setSelectedSidebarItem={setSelectedSidebarItem}
            >
              <TicketDetailsPage />
            </Layout>
          }
        />
        <Route
          path="/openstack-kkr"
          element={
            <Layout
              selectedCity={selectedCity}
              onSelect={setSelectedCity}
              selectedSidebarItem={selectedSidebarItem}
              setSelectedSidebarItem={setSelectedSidebarItem}
            >
              <OpenStackDashboard />
            </Layout>
          }
        />

        <Route
          path="*"
          element={
            <Layout
              selectedCity={selectedCity}
              onSelect={setSelectedCity}
              selectedSidebarItem={selectedSidebarItem}
              setSelectedSidebarItem={setSelectedSidebarItem}
            >
              <div style={{ textAlign: "center", padding: "2rem" }}>
                <h1>404 - Page Not Found</h1>
                <Text>
                  <Link href="/dashboard">Go Back</Link>
                </Text>
              </div>
            </Layout>
          }
        />
      </Routes>
    </Router>
  );
}
