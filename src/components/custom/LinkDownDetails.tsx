import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Select,
  SimpleGrid,
  Textarea,
  useBreakpointValue,
  useColorModeValue,
  useToast,
  VStack,
} from "@chakra-ui/react";
import { useForm } from "react-hook-form";
import useAuthStore from "../../Store/authStore";
import axios from "axios";
import { LinkDown } from "../../hooks/useAlarmData";
import apiClient from "../../services/api-client";
// import { LinkDown } from "../../models/AlarmsModels";

interface Props {
  linkAlarm: LinkDown;
  isOpen: boolean;
  onClose: () => void;
}

function LinkDownDetails({ isOpen, onClose, linkAlarm }: Props) {
  const { user } = useAuthStore();
  const column = useBreakpointValue({ base: 1, md: 3 });
  const toast = useToast();

  const cardBg = useColorModeValue("gray.50", "gray.700");
  const bottomBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const labelColor = useColorModeValue("gray.500", "gray.400");
  const valueColor = useColorModeValue("gray.800", "gray.100");

  /* ------------------- Form ------------------- */
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LinkDown>({
    values: {
      ...linkAlarm,
    },
  });

  const onFormSubmit = (data: LinkDown) => {
    console.log("sent data: ", data);
    var submitData: LinkDown = { ...data };

    if (
      linkAlarm.alarm_status === "active" &&
      data.alarm_status === "cleared"
    ) {
      submitData = {
        ...submitData,
        clear_by: user ? user.username : "Guest",
      };
    }

    if (linkAlarm.acknowledge_date != data.acknowledge_date) {
      submitData = {
        ...submitData,
        // acknowledge_by: user ? user.username : "Guest",
      };
    }

    apiClient
      .patch(`/clear-link-status/${data.id}`, submitData)
      .then((res) => {
        toast({
          description: res.data?.message,
          status: res.data?.status,
          position: "top-right",
          duration: 5000,
          isClosable: true,
        });

        onClose(); // <-- closes the modal on data save.
      })
      .catch((err) => {
        console.log(err.message);
        toast({
          description: err.response.data?.message,
          status: err.response.data?.status,
          position: "top-right",
          duration: 5000,
          isClosable: true,
        });
      });
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        size={{ base: "md", md: "xl", lg: "6xl" }}
        scrollBehavior={"inside"}
      >
        <ModalOverlay />

        <form onSubmit={handleSubmit(onFormSubmit)}>
          <ModalContent>
            <ModalHeader bg={bottomBg}>Down Link</ModalHeader>
            <ModalCloseButton />

            <ModalBody p={0}>
              <Box bg={cardBg} overflow="hidden">
                {/* ---------- TOP: READ-ONLY DETAILS ---------- */}
                <Box
                  p={4}
                  bg={cardBg}
                  borderBottom="1px solid"
                  borderColor={borderColor}
                >
                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                    {[
                      { label: "Alarm ID", value: linkAlarm.alarm_id },
                      // { label: "Hostname", value: linkAlarm.hostname },
                      { label: "IP Address", value: linkAlarm.ipaddress },
                      {
                        label: "Interface",
                        value: linkAlarm.interface,
                      },
                      { label: "Site", value: linkAlarm.site },
                    ].map((item) => (
                      <Box
                        key={item.label}
                        bg={bottomBg}
                        p={3}
                        borderRadius="md"
                        border="1px solid"
                        borderColor={borderColor}
                      >
                        <Box fontSize="xs" color={labelColor} mb={1}>
                          {item.label}
                        </Box>
                        <Box
                          fontSize="sm"
                          fontWeight="semibold"
                          color={valueColor}
                        >
                          {item.value}
                        </Box>
                      </Box>
                    ))}
                  </SimpleGrid>
                </Box>

                {/* ---------- BOTTOM: FORM ---------- */}
                <Box p={6} bg={bottomBg}>
                  <VStack gap={4} align={"stretch"}>
                    <SimpleGrid columns={column} spacing={4}>
                      <FormControl>
                        <FormLabel>Link Status</FormLabel>
                        <Select {...register("link_status")}>
                          <option value="up">Up</option>
                          <option value="down">Down</option>
                        </Select>
                      </FormControl>

                      <FormControl>
                        <FormLabel>Alarm Status</FormLabel>
                        <Select {...register("alarm_status")}>
                          <option value="active">Active</option>
                          <option value="cleared">Cleared</option>
                        </Select>
                      </FormControl>

                      <FormControl>
                        <FormLabel>Severity</FormLabel>
                        <Select {...register("severity")}>
                          <option value="critical">Critical</option>
                          <option value="major">Major</option>
                          <option value="info">Info</option>
                          <option value="minor">Minor</option>
                        </Select>
                      </FormControl>
                    </SimpleGrid>

                    <FormControl>
                      <FormLabel>Comments</FormLabel>
                      <Textarea
                        {...register("comments")}
                        placeholder="Enter Remarks"
                      />
                    </FormControl>
                  </VStack>
                </Box>
              </Box>
            </ModalBody>

            <ModalFooter gap={4} bg={bottomBg}>
              <Button type="submit" colorScheme="teal">
                Update
              </Button>
              <Button colorScheme="blue" mr={3} onClick={onClose}>
                Close
              </Button>
            </ModalFooter>
          </ModalContent>
        </form>
      </Modal>
    </>
  );
}

export default LinkDownDetails;
