import { Box, HStack, useColorModeValue, VStack } from "@chakra-ui/react";
import { IoIosArrowBack } from "react-icons/io";
import { FaRegDotCircle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
interface SidebarSubItem {
  label: string;
  link: string;
}

interface Props {
  items: SidebarSubItem[];
  onCollapse: () => void;
  onSelectCity: (city: string) => void;
}

function SecondSidebar({ items, onCollapse, onSelectCity  }: Props) {
  
  const BG = useColorModeValue("gray.100", "gray.800");
  const navigate = useNavigate();
  const handleItemClick = (item: SidebarSubItem) => {
    onSelectCity(item.label);
    navigate(item.link);  
  };
  

  return (
    <>
      <VStack
        gap={0}
        h={"100%"}
        bg={BG}
        align="stretch"
        justifyContent="space-between"
      >
        {/* Sub-item list */}
        <Box as={"ul"} my={1}>
          {items.map((item) => (
            <HStack 
            key={item.label} 
            as={"li"} 
            p={2} 
            cursor={"pointer"} 
            _hover={{ bg: useColorModeValue("gray.200", "gray.700") }}
            onClick={() => handleItemClick(item)}
            >
              <FaRegDotCircle />
              <span>{item.label}</span>
            </HStack>
          ))}
        </Box>

        {/* Collapse button */}
        <HStack
          mx={4}
          py={3}
          justifyContent={"flex-end"}
          borderTop={"1px solid"}
          borderColor={useColorModeValue("gray.300", "gray.600")}
          // borderCollapse={"gray.500"}
        >
          <Box
            p={1}
            borderRadius={"full"}
            _hover={{
              bg: useColorModeValue("gray.400", "gray.200"),
              color: "black",
            }}
            cursor={"pointer"}
            onClick={onCollapse}
          >
            <IoIosArrowBack />
          </Box>
        </HStack>
      </VStack>
    </>
  );
}

export default SecondSidebar;
