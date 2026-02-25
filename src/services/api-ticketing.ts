import axios from "axios";
import { getKeycloak } from "./keycloak-holder";

const apiTicketing = axios.create({
    baseURL: "https://192.168.30.120:8080/api/v1/tickets",
    timeout: 20000,
});

apiTicketing.interceptors.request.use(
    async (config) => {
        const kc = getKeycloak();

        if (kc?.token) {
            // Refresh token if expiring soon
            try {
                await kc.updateToken(30);
            } catch {
                // If refresh fails, backend will return 401/403
            }

            if (kc.token) {
                config.headers = axios.AxiosHeaders.from(config.headers);
                config.headers.set("Authorization", `Bearer ${kc.token}`);
                // console.log("==> getKeycloak Token: ", `${kc.token}`)
            }
        }

        // --- DEBUG (safe logging, no sensitive data) ---
        const h = axios.AxiosHeaders.from(config.headers);
        const auth = h.get("Authorization");
        const maskedAuth =
            typeof auth === "string" && auth.startsWith("Bearer ")
                ? `Bearer ${auth.slice(7, 20)}...`
                : auth;

        console.log("[ticketing][REQ]", {
            method: config.method?.toUpperCase(),
            url: `${config.baseURL ?? ""}${config.url ?? ""}`,
            params: config.params,
            headers: {
                Authorization: maskedAuth,
            },
        });
        // --- /DEBUG ---

        return config;
    },
    (error) => Promise.reject(error)
);

export default apiTicketing;
