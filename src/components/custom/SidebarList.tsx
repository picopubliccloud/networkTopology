import { Box, HStack, useColorModeValue } from "@chakra-ui/react";
import type { IconType } from "react-icons";
import {
  MdSpaceDashboard,
  MdHealthAndSafety,
  MdOutlineInventory,
  MdConfirmationNumber,
} from "react-icons/md";
import { TbTopologyFullHierarchy } from "react-icons/tb";
import { RiAlarmWarningFill } from "react-icons/ri";
import { FaFileWaveform } from "react-icons/fa6";
import { GrDocumentConfig } from "react-icons/gr";
import { useNavigate } from "react-router-dom";

import topology from "../../assets/dashboard/topology.png";
import syslog from "../../assets/dashboard/graylog.png";
import deviceConfigs from "../../assets/dashboard/device-configs.png";
import serverhealth from "../../assets/dashboard/server-health.png";
import alarm from "../../assets/dashboard/alarm.png";
import inventory from "../../assets/dashboard/inventory.png";
import ticket from "../../assets/dashboard/ticket.png";
import { FaCloud } from "react-icons/fa";
import openstack from "../../assets/dashboard/openstack.png";

interface SidebarStatus {
  onHover: boolean;
}

interface SidebarProps extends SidebarStatus {
  selected: string;
  onSelect: (label: string) => void;
}

interface SidebarSubItem {
  label: string;
  link: string;
}

interface SidebarItem {
  label: string;
  Icon: IconType;
  image?: string;
  subItems?: SidebarSubItem[];
  link: string;
}

interface ItemProps extends SidebarItem {
  isSelected: boolean;
  onClick: () => void;
}

const LabeledItem = ({ label, Icon, isSelected, onClick }: ItemProps) => {
  const bg = isSelected ? "blue.500" : "transparent";
  const color = isSelected ? "white" : useColorModeValue("black", "gray.100");
  const hoverBg = isSelected
    ? "blue.600"
    : useColorModeValue("gray.200", "gray.600");

  return (
    <Box
      as="li"
      onClick={onClick}
      cursor="pointer"
      bg={bg}
      color={color}
      borderRadius="0 20px 20px 0"
      _hover={{ bg: hoverBg }}
      px={2}
    >
      <HStack>
        <Box p={1} m={1}>
          <Icon size="20px" />
        </Box>
        <Box as="span" fontSize="12px" fontWeight="medium">
          {label}
        </Box>
      </HStack>
    </Box>
  );
};

const IconItem = ({ Icon, isSelected, onClick }: ItemProps) => {
  const hoverBg = useColorModeValue("gray.200", "gray.600");
  const defaultColor = useColorModeValue("black", "gray.100");

  const bg = isSelected ? "blue.500" : "transparent";
  const color = isSelected ? "white" : defaultColor;

  return (
    <Box as="li" onClick={onClick} cursor="pointer" px={2}>
      <HStack>
        <Box
          bg={bg}
          color={color}
          p={1}
          m={1}
          borderRadius="full"
          _hover={{ bg: hoverBg }}
        >
          <Icon size="20px" />
        </Box>
      </HStack>
    </Box>
  );
};

export const listItems: SidebarItem[] = [
  { label: "Dashboard", Icon: MdSpaceDashboard, link: "/dashboard" },
  {
    label: "Topology",
    Icon: TbTopologyFullHierarchy,
    image: topology,
    subItems: [
      { label: "Dhaka", link: "/topology" },
      { label: "Jessore", link: "/topology" },
      { label: "K-Lab", link: "/topology" },
      { label: "Kaliakoir", link: "/topology" },
    ],
    link: "/topology",
  },
  {
    label: "Server Health",
    Icon: MdHealthAndSafety,
    image: serverhealth,
    link: "/serverhealth",
  },
  { label: "Alarm", Icon: RiAlarmWarningFill, image: alarm, link: "/alarm" },
  {
    label: "Syslog",
    Icon: FaFileWaveform,
    image: syslog,
    link: "http://192.168.172.11:9000/dashboards/68d50ed51ff3252891698182",
  },
  {
    label: "Config",
    Icon: GrDocumentConfig,
    image: deviceConfigs,
    link: "http://192.168.30.120:8870/share/VQzQgfcW",
  },
  {
    label: "Inventory",
    Icon: MdOutlineInventory,
    image: inventory,
    link: "/inventory",
  },
  { 
    label: "OpenStack KKR", 
    Icon: FaCloud, 
    image: openstack,
    link: "/openstack-kkr" 
  },
  {
    label: "Ticket",
    Icon: MdConfirmationNumber,
    image: ticket,
    link: "/tickets",
  },
];

// Main Component:
function SidebarList({ onHover, selected, onSelect }: SidebarProps) {
  const navigate = useNavigate();
  const handleClick = (label: string, link: string) => {
    onSelect(label);

    if (link.startsWith("http")) {
      window.open(link, "_blank", "noopener,noreferrer");
    } else {
      navigate(link);
    }
  };
  return (
    <Box as="ul" py={2}>
      {listItems
        .filter((item) => !item.link.startsWith("http"))
        .map((item) =>
          onHover ? (
            <LabeledItem
              key={item.label}
              {...item}
              isSelected={selected === item.label}
              onClick={() => handleClick(item.label, item.link)}
            />
          ) : (
            <IconItem
              key={item.label}
              {...item}
              isSelected={selected === item.label}
              onClick={() => handleClick(item.label, item.link)}
            />
          ),
        )}
    </Box>
  );
}

export default SidebarList;
