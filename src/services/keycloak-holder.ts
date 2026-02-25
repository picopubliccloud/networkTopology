import Keycloak from "keycloak-js";

let keycloak: Keycloak | null = null;

export const setKeycloak = (kc: Keycloak) => {
    keycloak = kc;
};

export const getKeycloak = () => keycloak;
