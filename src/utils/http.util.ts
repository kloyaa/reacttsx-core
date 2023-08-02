import axios, { AxiosInstance, AxiosResponse, AxiosRequestConfig } from 'axios';

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
        // Make the request using the provided method, URL, data, and headers
        const response: AxiosResponse<T> = await HttpClient({
            method,
            url,
            data,
            headers,
        });

        return response.data;
    } catch (error) {
        console.log(error)
        // Handle errors
        throw error;
    }
};

export { HttpClient, HttpMethod, sendRequest };
