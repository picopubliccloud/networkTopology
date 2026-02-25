import { useToast } from "@chakra-ui/react";
import useKeycloak from "./useKeycloak";

const useUpdateProfile = () => {
  const toast = useToast();
  const { keycloak } = useKeycloak();

  const handleChangePassword = () => {
    if (!keycloak) {
      toast({
        title: "Authentication error",
        description: "Keycloak is not initialized",
        status: "error",
      });
      return;
    }

    // Redirect to Keycloak Account Management → Change Password
    keycloak.accountManagement();
  };

  return { handleChangePassword };
};

export default useUpdateProfile;
