import axios from "axios";

const apiClient = axios.create({
    baseURL: "https://192.168.30.120:8080/api",
    timeout: 10000,
});

export default apiClient;
