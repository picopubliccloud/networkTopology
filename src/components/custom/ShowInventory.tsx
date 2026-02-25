import {
  Badge,
  Box,
  Divider,
  HStack,
  IconButton,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Spinner,
  Text,
  useColorModeValue,
  useDisclosure,
  useToast,
  VStack,
} from "@chakra-ui/react";
import { FaEdit, FaTrashAlt } from "react-icons/fa";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import React, { useState } from "react";
import { IoMdAdd } from "react-icons/io";
import { SlOptionsVertical } from "react-icons/sl";
import TableComponent, { columnRender } from "./TableComponent";
import { InventoryModel } from "../../models/InventoryModel";
// import { useInventory } from "../../hooks/useInventory";
import useAuthStore from "../../Store/authStore";
import { useInventoryStore } from "../../Store/inventoryStore";
import Dialogue from "./Dialogue";
import Pagination from "./Pagination";
import useData from "../../hooks/useData";
import useKeycloak from "../../hooks/useKeycloak";
import apiClient from "../../services/api-client";
import ExcelDownloadButton from "./ExcelDownloadButton";

const inventoryColumns: columnRender<InventoryModel>[] = [
  { label: "ID", objKey: "id" },
  { label: "Asset Type", objKey: "asset_type" },
  { label: "Asset Tag", objKey: "asset_tag" },
  { label: "Brand Model", objKey: "brand_model" },
  { label: "NIC / Line Card", objKey: "nic_line_card" },
  { label: "PSU", objKey: "psu" },
  { label: "Site", objKey: "site" },
  { label: "Rack", objKey: "rack" },
  { label: "Unit", objKey: "unit" },
  { label: "Owner", objKey: "owner" },

  // Custom render: Status with color
  {
    label: "Status",
    objKey: "status",
    render: (value) => {
      const color =
        value === "Used" ? "green" : value === "Faulty" ? "red" : "gray";

      return <Badge colorScheme={color}>{value || "-"}</Badge>;
    },
  },

  { label: "Remark", objKey: "remark" },

  { label: "Mgmt IP Address", objKey: "mgmt_ip_address" },
  { label: "Secondary IP", objKey: "secondary_ip" },
  { label: "Host Name", objKey: "host_name" },
  { label: "OS", objKey: "os" },
  { label: "OS Version", objKey: "os_version" },

  { label: "Added Date", objKey: "added_date" },

  { label: "Added By", objKey: "added_by" },

  { label: "Last Modified Date", objKey: "last_modified_date" },

  { label: "Last Modified By", objKey: "last_modified_by" },
  { label: "Removed Date", objKey: "removed_date" },
  { label: "Removed By", objKey: "removed_by" },

  {
    label: "Is Active",
    objKey: "is_active",
    render: (value) => {
      if (value == null) return "-";

      return (
        <Badge colorScheme={value ? "green" : "red"}>
          {value ? "Active" : "Inactive"}
        </Badge>
      );
    },
  },

  { label: "Purpose", objKey: "purpose" },
  { label: "Verification", objKey: "verification" },

  {
    label: "Up/Down Status",
    objKey: "up_down_status",
    render: (value) => {
      const color = value === "UP" ? "green" : "red";
      if (value == null) return "-";

      return <Badge colorScheme={color}>{value}</Badge>;
    },
  },

  { label: "Last Down Time", objKey: "last_down_time" },
  { label: "Last Up Time", objKey: "last_up_time" },
  { label: "Last Down Check Time", objKey: "last_down_check_time" },

  { label: "Total Power Supply Count", objKey: "total_power_supply_count" },
  { label: "Up Power Supply Count", objKey: "up_power_supply_count" },
  { label: "Down Power Supply Count", objKey: "down_power_supply_count" },
  {
    label: "Last Power Supply Check Time",
    objKey: "last_power_supply_check_time",
  },
];

// Format Date → "YYYY-MM-DD HH:mm:ss.SSS"

function InventoryTable() {
  const [itemID, setItemID] = useState<number | null>(null);
  const [searchParams] = useSearchParams();
  const page = Number(searchParams.get("page")) || 1;
  const limit = 10;

  /* --------------------- Keycloak --------------------- */
  const { keycloak, authenticated } = useKeycloak();

  /* --------------------- Data --------------------- */
  const endpoint = `/inventory?page=${page}&limit=${limit}`;
  const { data, count, isLoading, error } = useData<InventoryModel>(endpoint, [
    page,
    limit,
  ]);

  // Formatting date fields:
  const dateFields = [
    "added_date",
    "last_modified_date",
    "removed_date",
    "last_down_time",
    "last_up_time",
    "last_down_check_time",
    "last_power_supply_check_time",
  ] as const satisfies (keyof InventoryModel)[];
  data.forEach((item: InventoryModel) => {
    dateFields.forEach((field) => {
      if (item[field]) {
        // item[field] = new Date(item[field]).toString().slice(0, 24);
        item[field] = new Date(item[field]).toLocaleString();
      }
    });
  });

  /* --------------------- Pagination Logic --------------------- */
  // const totalPages = Math.max(1, Math.ceil(inventoryCount / limit));
  const totalPages = Math.max(1, Math.ceil(count / limit));

  /* --------------------- Zustand Store --------------------- */
  const { setEditingRecord } = useInventoryStore();

  /* --------------------- Colors --------------------- */
  const bg = useColorModeValue("gray.50", "gray.900");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const cardBg = useColorModeValue("white", "gray.800");
  const textColor = useColorModeValue("gray.800", "gray.100");

  const navigate = useNavigate();

  const toast = useToast();
  // For Dialogue Box:
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = React.useRef<HTMLButtonElement | null>(null);

  if (isLoading) return <Spinner size="xl" color="red.500" />;
  if (error) return <Box color="red.500">{error}</Box>;

  const handleDelete = (id: number) => {
    apiClient
      .delete(
        `/delete-inventory/${id}?removed_by=${
          authenticated ? keycloak?.idTokenParsed?.preferred_username : "Guest"
        }`,
      )
      .then((res) => {
        toast({
          description: res.data?.message,
          status: res.data?.status,
          position: "top-right",
          duration: 5000,
          isClosable: true,
        });

        // refetch();
      })
      .catch((err) => {
        console.error(err.response.data?.error);

        toast({
          description: err.response.data?.message,
          status: err.response.data?.status,
          position: "top-right",
          duration: 5000,
          isClosable: true,
        });
      });

    navigate("/inventory");
  };

  return (
    <>
      {/* From Device Details */}
      <Box minH={"100vh"} bg={bg} p={4}>
        {/* Confirm Dialogue Box */}
        <Dialogue
          isOpen={isOpen}
          onClose={onClose}
          cancelRef={cancelRef}
          title="Delete Record"
          body="Are you sure you want to delete this record? This action cannot be undone."
          btnText="Delete"
          btnColor="red"
          onConfirm={() => {
            if (itemID != null) {
              console.log("Delete");
              handleDelete(itemID);
            }
          }}
        />

        <VStack align="start" spacing={6} w="100%">
          <Box
            w="100%"
            bg={cardBg}
            p={6}
            borderRadius="xl"
            boxShadow="md"
            border="1px solid"
            borderColor={borderColor}
          >
            <HStack mb={4}>
              <Text fontSize="lg" fontWeight="bold" color={textColor}>
                Inventory
              </Text>
              <HStack ms={"auto"} spacing={2} bg={bg} borderRadius={"full"}>
                <IconButton
                  icon={<IoMdAdd />}
                  variant={"ghost"}
                  aria-label="Add Inventory"
                  borderRadius={"full"}
                  onClick={() => {
                    setEditingRecord(null);
                    navigate("/addInventory");
                  }}
                />

                {/* <ExcelDownloadButton
                  endpoint="/inventory/download"
                  filename="inventory.xlsx"
                /> */}
              </HStack>
            </HStack>

            {/* Universal Table Component: */}
            <TableComponent
              columns={inventoryColumns}
              // data={inventory}
              data={data}
              renderActions={(row) => (
                <Menu>
                  <MenuButton
                    as={IconButton}
                    size={"sm"}
                    rounded={"full"}
                    bg={"transparent"}
                    aria-label="Options"
                    icon={<SlOptionsVertical />}
                  />
                  <MenuList>
                    {/* <MenuItem
                      icon={<FaEdit />}
                      onClick={() => {
                        setEditingRecord(row); // row === item
                        navigate("/updateRecord");
                      }}
                    >
                      Edit
                    </MenuItem> */}
                    <MenuItem
                      icon={<FaTrashAlt />}
                      onClick={() => {
                        setItemID(row.id);
                        onOpen();
                      }}
                    >
                      Delete
                    </MenuItem>
                  </MenuList>
                </Menu>
              )}
            />

            {/* Pagination below the table */}
            <Pagination
              totalPages={totalPages}
              isLoading={isLoading}
              // onPageChange={handlePageChange}
            />
          </Box>
        </VStack>
      </Box>
    </>
  );
}

export default InventoryTable;
