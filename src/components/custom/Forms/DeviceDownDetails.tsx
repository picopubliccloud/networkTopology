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
import useAuthStore from "../../../Store/useAuthStore";
import { useForm } from "react-hook-form";
import { DownDevice } from "../../../hooks/useAlarmData";
import apiClient from "../../../services/api-client";

interface Props {
  deviceAlarm: DownDevice;
  isOpen: boolean;
  onClose: () => void;
}

function DeviceDownDetails({ isOpen, onClose, deviceAlarm }: Props) {
  const { user } = useAuthStore();
  const column = useBreakpointValue({ base: 1, lg: 2 });
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
  } = useForm<DownDevice>({ values: { ...deviceAlarm } });

  const onFormSubmit = (data: DownDevice) => {
    data = {
      ...data,
      clear_by: user ? user.username : "Guest",
    };

    apiClient
      .patch(`/clear-device-alarm`, data)
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
            <ModalHeader bg={bottomBg}>Down Device</ModalHeader>
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
                      { label: "Alarm ID", value: deviceAlarm.alarm_id },
                      { label: "Hostname", value: deviceAlarm.name },
                      { label: "IP Address", value: deviceAlarm.ip },
                      {
                        label: "Down Since",
                        value: new Date(
                          deviceAlarm.down_since,
                        ).toLocaleString(),
                      },
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
                        <FormLabel>Alarm Status</FormLabel>
                        <Select {...register("alarm_status")}>
                          <option value="ACTIVE">Active</option>
                          <option value="CLEARED">Cleared</option>
                        </Select>
                      </FormControl>

                      <FormControl>
                        <FormLabel>Severity</FormLabel>
                        <Select {...register("severity")}>
                          <option value="CRITICAL">Critical</option>
                          <option value="MAJOR">Major</option>
                          <option value="INFO">Info</option>
                          <option value="MINOR">Minor</option>
                        </Select>
                      </FormControl>
                    </SimpleGrid>

                    <FormControl>
                      <FormLabel>Comments</FormLabel>
                      <Textarea
                        {...register("comments")}
                        placeholder="Enter comments"
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

export default DeviceDownDetails;
