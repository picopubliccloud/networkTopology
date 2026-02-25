import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Select,
  SimpleGrid,
  Text,
  Textarea,
  useBreakpointValue,
  useColorModeValue,
  useToast,
  VStack,
} from "@chakra-ui/react";
import { useForm } from "react-hook-form";
import axios from "axios";
import { useNavigate } from "react-router-dom";

import { InventoryModel, InventorySchema } from "../../models/InventoryModel";
import useAuthStore from "../../Store/authStore";
import { zodResolver } from "../../../node_modules/@hookform/resolvers/zod";
import { useInventoryStore } from "../../Store/inventoryStore";
import useKeycloak from "../../hooks/useKeycloak";
import apiClient from "../../services/api-client";

function InventoryForm() {
  /* --------------------- Zustand Store --------------------- */
  const { editingRecord, setEditingRecord } = useInventoryStore();
  const isEditMode = !!editingRecord;

  /* --------------------- Keycloak --------------------- */
  const { keycloak, authenticated } = useKeycloak();

  /* --------------------- For UI --------------------- */
  const toast = useToast();
  const bg = useColorModeValue("gray.50", "gray.900");
  const formBG = useColorModeValue("white", "gray.800");

  /* --------------------- For Form --------------------- */
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<InventoryModel>({
    defaultValues: isEditMode
      ? {
          ...editingRecord,
          site: editingRecord.site || "Kaliakoir",
          status: editingRecord.status || "Used",
          is_active: editingRecord.is_active ? "Active" : "Inactive",
          up_down_status: editingRecord.up_down_status || "UP",
          last_modified_by: authenticated
            ? keycloak?.idTokenParsed?.preferred_username
            : "Guest",
        }
      : {
          site: "Kaliakoir",
          status: "Used",
          added_by: authenticated
            ? keycloak?.idTokenParsed?.preferred_username
            : "Guest",
          is_active: "Active",
          up_down_status: "UP",
        },

    resolver: zodResolver(InventorySchema),
    mode: "onChange",
  });
  const navigate = useNavigate();

  const columns = useBreakpointValue({ base: 1, md: 2, lg: 3 });

  const onFormSubmit = (data: InventoryModel) => {
    const cleanedData = {
      ...data,
      id: Number(data.id) || null,
      asset_type: data.asset_type || null,
      asset_tag: data.asset_tag || null,
      brand_model: data.brand_model || null,
      nic_line_card: data.nic_line_card || null,
      psu: data.psu || null,
      site: data.site || null,
      rack: data.rack || null,
      unit: data.unit || null,
      owner: data.owner || null,
      status: data.status || null,
      remark: data.remark || null,
      mgmt_ip_address:
        data.mgmt_ip_address?.trim() === "" ? null : data.mgmt_ip_address,
      secondary_ip: data.secondary_ip?.trim() === "" ? null : data.secondary_ip,
      host_name: data.host_name || null,
      os: data.os || null,
      os_version: data.os_version || null,
      added_date: data.added_date
        ? new Date(data.added_date).toISOString()
        : null,
      added_by: data.added_by || null,
      last_modified_date: data.last_modified_date
        ? new Date(data.last_modified_date).toISOString()
        : null,
      last_modified_by: data.last_modified_by,
      removed_date: data.removed_date
        ? new Date(data.removed_date).toISOString()
        : null,
      removed_by: data.removed_by,
      is_active: data.is_active === "Active",
      purpose: data.purpose || null,
      verification: data.verification || null,
      up_down_status: data.up_down_status || null,

      last_down_time: data.last_down_time
        ? new Date(data.last_down_time).toISOString()
        : null,
      last_up_time: data.last_up_time
        ? new Date(data.last_up_time).toISOString()
        : null,
      last_down_check_time: data.last_down_check_time
        ? new Date(data.last_down_check_time).toISOString()
        : null,

      total_power_supply_count: data.total_power_supply_count || null,
      up_power_supply_count: data.up_power_supply_count || null,
      down_power_supply_count: data.down_power_supply_count || null,

      last_power_supply_check_time: data.last_power_supply_check_time
        ? new Date(data.last_power_supply_check_time).toISOString()
        : null,
    };

    const url = isEditMode
      ? `/update-inventory/${cleanedData.id}`
      : `/add-inventory`;

    const method = isEditMode ? "patch" : "post";

    apiClient({ method, url, data: cleanedData })
      .then((res) => {
        toast({
          description: res.data?.message,
          status: res.data?.status,
          position: "top-right",
          duration: 5000,
          isClosable: true,
        });
        setEditingRecord(null);
        console.log({ "Form Data": cleanedData });
        navigate("/inventory");
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
      <Box minH={"100vh"} p={4} bg={bg}>
        <Box
          // minH={"100%"}
          maxW="90%"
          mx="auto"
          mt={8}
          p={6}
          boxShadow="md"
          borderRadius="xl"
          bg={formBG}
        >
          <Heading as="h2" size="lg" mb={6} textAlign={"center"}>
            {isEditMode ? "Update InventoryForm" : "Add InventoryForm"}
          </Heading>
          <form onSubmit={handleSubmit(onFormSubmit)}>
            <VStack spacing={4} align={"stretch"}>
              <SimpleGrid columns={columns} spacing={4}>
                <FormControl>
                  <FormLabel>ID</FormLabel>
                  <Input
                    type="number"
                    {...register("id", { valueAsNumber: true })}
                    placeholder="Enter Asset ID"
                    isDisabled={isEditMode}
                  />

                  {errors.id && <Text color={"red"}>{errors.id.message}</Text>}
                </FormControl>

                <FormControl>
                  <FormLabel>Asset Type</FormLabel>
                  <Input
                    {...register("asset_type")}
                    placeholder="Enter Asset Type"
                  />
                  {errors.asset_type && (
                    <Text color={"red"}>{errors.asset_type.message}</Text>
                  )}
                </FormControl>

                <FormControl>
                  <FormLabel>Asset Tag</FormLabel>
                  <Input
                    {...register("asset_tag")}
                    placeholder="Enter Asset Tag"
                  />

                  {errors.asset_tag && (
                    <Text color={"red"}>{errors.asset_tag.message}</Text>
                  )}
                </FormControl>

                <FormControl>
                  <FormLabel>Brand Model</FormLabel>
                  <Input
                    {...register("brand_model")}
                    placeholder="Enter Brand Model"
                  />

                  {errors.brand_model && (
                    <Text color={"red"}>{errors.brand_model.message}</Text>
                  )}
                </FormControl>

                <FormControl>
                  <FormLabel>NIC Line Card</FormLabel>
                  <Input
                    {...register("nic_line_card")}
                    placeholder="Enter NIC Line Card"
                  />

                  {errors.nic_line_card && (
                    <Text color={"red"}>{errors.nic_line_card.message}</Text>
                  )}
                </FormControl>

                <FormControl>
                  <FormLabel>PSU</FormLabel>
                  <Input {...register("psu")} placeholder="Enter PSU" />

                  {errors.psu && (
                    <Text color={"red"}>{errors.psu.message}</Text>
                  )}
                </FormControl>

                <FormControl>
                  <FormLabel>Site</FormLabel>
                  <Select {...register("site")}>
                    <option value="Kaliakoir">Kaliakoir</option>
                    <option value="Jessore">Jessore</option>
                    <option value="NMC">NMC</option>
                  </Select>
                </FormControl>

                <FormControl>
                  <FormLabel>Rack</FormLabel>
                  <Input {...register("rack")} placeholder="Enter Rack" />

                  {errors.rack && (
                    <Text color={"red"}>{errors.rack.message}</Text>
                  )}
                </FormControl>

                <FormControl>
                  <FormLabel>Unit</FormLabel>
                  <Input {...register("unit")} placeholder="Enter Unit" />

                  {errors.unit && (
                    <Text color={"red"}>{errors.unit.message}</Text>
                  )}
                </FormControl>

                <FormControl>
                  <FormLabel>Owner</FormLabel>
                  <Input {...register("owner")} placeholder="Enter Owner" />

                  {errors.owner && (
                    <Text color={"red"}>{errors.owner.message}</Text>
                  )}
                </FormControl>

                <FormControl>
                  <FormLabel>Mgmt IP Address</FormLabel>
                  <Input
                    {...register("mgmt_ip_address")}
                    placeholder="Enter Mgmt IP Address"
                  />

                  {errors.mgmt_ip_address && (
                    <Text color={"red"}>{errors.mgmt_ip_address.message}</Text>
                  )}
                </FormControl>

                <FormControl>
                  <FormLabel>Secondary IP Address</FormLabel>
                  <Input
                    {...register("secondary_ip")}
                    placeholder="Enter Secondary IP Address"
                  />

                  {errors.secondary_ip && (
                    <Text color={"red"}>{errors.secondary_ip.message}</Text>
                  )}
                </FormControl>

                <FormControl>
                  <FormLabel>Hostname</FormLabel>
                  <Input
                    {...register("host_name")}
                    placeholder="Enter Hostname"
                  />

                  {errors.host_name && (
                    <Text color={"red"}>{errors.host_name.message}</Text>
                  )}
                </FormControl>

                <FormControl>
                  <FormLabel>Operating System</FormLabel>
                  <Input
                    {...register("os")}
                    placeholder="Enter Operating System"
                  />

                  {errors.os && <Text color={"red"}>{errors.os.message}</Text>}
                </FormControl>

                <FormControl>
                  <FormLabel>OS Version</FormLabel>
                  <Input
                    {...register("os_version")}
                    placeholder="Enter OS Version"
                  />

                  {errors.os_version && (
                    <Text color={"red"}>{errors.os_version.message}</Text>
                  )}
                </FormControl>

                {/* Put Added Date, Added By, Last Modified Date, Last Modified By, removed date, removed by,  */}

                <FormControl>
                  <FormLabel>Is Active</FormLabel>
                  <Select {...register("is_active")}>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </Select>
                </FormControl>

                <FormControl>
                  <FormLabel>Purpose</FormLabel>
                  <Input {...register("purpose")} placeholder="Enter Purpose" />

                  {errors.purpose && (
                    <Text color={"red"}>{errors.purpose.message}</Text>
                  )}
                </FormControl>

                <FormControl>
                  <FormLabel>Verification</FormLabel>
                  <Input
                    {...register("verification")}
                    placeholder="Enter Verification"
                  />

                  {errors.verification && (
                    <Text color={"red"}>{errors.verification.message}</Text>
                  )}
                </FormControl>
              </SimpleGrid>

              {!isEditMode && (
                <>
                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                    <FormControl>
                      <FormLabel>Up-Down Status</FormLabel>
                      <Select {...register("up_down_status")}>
                        <option value="UP">UP</option>
                        <option value="DOWN">DOWN</option>
                      </Select>
                    </FormControl>

                    {/* Last down time, Last up time, last down check time */}

                    <FormControl>
                      <FormLabel>Total Power Supply</FormLabel>
                      <Input
                        {...register("total_power_supply_count")}
                        type="number"
                        placeholder="Enter Total Power Supply"
                      />

                      {errors.total_power_supply_count && (
                        <Text color={"red"}>
                          {errors.total_power_supply_count.message}
                        </Text>
                      )}
                    </FormControl>

                    <FormControl>
                      <FormLabel>UP Power Supply Count</FormLabel>
                      <Input
                        {...register("up_power_supply_count")}
                        type="number"
                        placeholder="Enter UP Power Supply Count"
                      />

                      {errors.up_power_supply_count && (
                        <Text color={"red"}>
                          {errors.up_power_supply_count.message}
                        </Text>
                      )}
                    </FormControl>

                    <FormControl>
                      <FormLabel>DOWN Power Supply Count</FormLabel>
                      <Input
                        {...register("down_power_supply_count")}
                        type="number"
                        placeholder="Enter DOWN Power Supply Count"
                      />

                      {errors.down_power_supply_count && (
                        <Text color={"red"}>
                          {errors.down_power_supply_count.message}
                        </Text>
                      )}
                    </FormControl>
                  </SimpleGrid>
                </>
              )}

              <FormControl>
                <FormLabel>Remarks</FormLabel>
                <Textarea {...register("remark")} placeholder="Enter Remarks" />

                {errors.remark && (
                  <Text color={"red"}>{errors.remark.message}</Text>
                )}
              </FormControl>

              {/* Last Power Supply Check Time */}

              <Button type="submit" colorScheme="teal">
                {isEditMode ? "Update" : "Add"}
              </Button>
            </VStack>
          </form>
        </Box>
      </Box>
    </>
  );
}
export default InventoryForm;
