import { useState } from 'react';

interface LocalStorageHook<T> {
    value: T | null;
    setValue: (value: T | null) => void;
    removeValue: () => void;
}

const useLocalStorage = <T>(key: string, initialValue: T | null): LocalStorageHook<T> => {
    // Get the initial value from localStorage or use the provided initialValue
    const [storedValue, setStoredValue] = useState<T | null>(() => {
        try {
        const item = localStorage.getItem(key);
        return item ? (JSON.parse(item) as T) : initialValue;
        } catch (error: any) {
        console.error(`Error while retrieving value for key "${key}" from localStorage: ${error.message}`);
        return initialValue;
        }
    });

    // Update the storedValue in localStorage whenever the value changes
    const setValue = (value: T | null) => {
        try {
        if (value === null) {
            localStorage.removeItem(key);
        } else {
            localStorage.setItem(key, JSON.stringify(value));
        }
        setStoredValue(value);
        } catch (error: any) {
        console.error(`Error while setting value for key "${key}" in localStorage: ${error.message}`);
        }
    };

    // Function to remove the key-value pair from local storage
    const removeValue = () => {
        try {
        localStorage.removeItem(key);
        setStoredValue(null);
        } catch (error: any) {
        console.error(`Error while removing key "${key}" from localStorage: ${error.message}`);
        }
    };

    return { value: storedValue, setValue, removeValue };
};

export default useLocalStorage;
