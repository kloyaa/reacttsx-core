import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

// Enum for HTTP methods
enum HttpMethod {
    GET = 'GET',
    POST = 'POST',
    PUT = 'PUT',
    DELETE = 'DELETE',
    PATCH = 'PATCH'
  // Add more methods as needed
}

// Interface for the dynamic headers
interface Headers {
    [key: string]: string;
}

// Create the Axios instance
const HttpClient: AxiosInstance = axios.create({
  // Default configuration for the instance
  // You can add more default configurations here if needed
});

// Utility function to send a request with dynamic headers
const sendRequest = async <T>(
    method: HttpMethod,
    url: string,
    data: any = null,
    headers: Headers = {}
): Promise<T> => {
    try {
        // Define the request configuration
        const requestConfig: AxiosRequestConfig = {
            method,
            url,
            headers,
        };

        // Use 'params' for GET requests and 'data' for other methods
        if (method === HttpMethod.GET) {
            requestConfig.params = data;
        } else {
            requestConfig.data = data;
        }

        // Make the request using the provided method, URL, data, and headers
        const response: AxiosResponse<T> = await HttpClient(requestConfig);

        return response.data;
    } catch (error) {
        console.log(error);
        // Handle errors
        throw error;
    }
};

export { HttpClient, HttpMethod, sendRequest };
