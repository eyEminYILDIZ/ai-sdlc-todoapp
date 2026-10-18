import axios, { AxiosInstance } from "axios";

const createApiClient = (): AxiosInstance => {
    return axios.create({
        baseURL: 'http://localhost:5000',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        }
    });
}

export const ApiClient = createApiClient();
