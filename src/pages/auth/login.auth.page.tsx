import { useState } from "react";
import {
    Flex,
    Box,
    FormControl,
    FormLabel,
    Input,
    Checkbox,
    Stack,
    Button,
    Heading,
    Text,
    useColorModeValue,
    InputGroup,
    InputRightElement,
    useToast
} from '@chakra-ui/react'
import { useForm, SubmitHandler } from "react-hook-form"
import { HttpMethod, sendRequest } from "../../utils/http.util";
import { API_LOGIN } from "../../const/api.const";
import useLocalStorage from "../../hooks/localstorage.hook";
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom'
import { IApiResponse } from "../../interface/api.interface";

type Inputs = {
    username: string
    password: string
}

export default function AuthLoginPage() {
    const navigate = useNavigate();
    const toast = useToast();

    const { register, handleSubmit, reset } = useForm<Inputs>();
    const { setValue: setStoredAuthResponse, removeValue: removeStoredAuthResponse } = useLocalStorage<IApiResponse | null>('authentication_payload', null);

    const [localState, setLocalState] = useState({
        togglePassword: false,
        isLoading: false
    });

    const onLogin: SubmitHandler<Inputs> = async (data: Inputs) => {
        const { username, password } = data;
        // Send a POST request to the authentication API endpoint with dynamic headers
        try {
            setLocalState((prev) => ({ ...prev,  isLoading: true }));
            const response = await sendRequest<IApiResponse>(
                HttpMethod.POST,
                API_LOGIN, // Replace with your actual authentication API endpoint
                { username, password },
                { 'from': 'web'}, // Pass the dynamic headers here
            );
            if(response) {
                setLocalState((prev) => ({ ...prev,  isLoading: false }));
                setStoredAuthResponse(response);
                navigate("/a/dashboard", { replace: true });
            }
        } catch (error: any) {
            setLocalState((prev) => ({ ...prev,  isLoading: false }));
            toast({
                status: "error",
                colorScheme: "red",
                title: error.response.data.message|| "Something went wrong. Please try again later."
            })

            // clear
            removeStoredAuthResponse();
        }


        reset();
    };

    const handleTogglePassword = () => setLocalState((prev) => ({
        ...prev,
        togglePassword: !prev.togglePassword
    }))

    return <>
        <Flex
            minH={'100vh'}
            align={'center'}
            justify={'center'}
            bg={useColorModeValue('gray.50', 'gray.800')}>
            <Stack spacing={8} mx={'auto'} maxW={'sm'} py={6} px={6}>
            <Stack align={'center'}>
                <Heading fontSize={'4xl'} fontWeight={"black"}>Swerte Saya</Heading>
                <Text fontSize={'xs'} color={'gray.600'}>
                Sign in with your account to continue.
                </Text>
            </Stack>
            <Box
                rounded={'md'}
                bg={useColorModeValue('white', 'gray.700')}
                boxShadow={'sm'}
                p={8}
                w={"72"}>
                <form onSubmit={handleSubmit(onLogin)}>
                    <Stack spacing={4}>
                    <FormControl id="username">
                        <FormLabel>Username</FormLabel>
                        <Input 
                        type="text" 
                        size={"sm"} 
                        borderRadius={"md"} 
                        {...register("username", { required: true })}/>
                    </FormControl>
                    <FormControl id="password">
                        <FormLabel>Password</FormLabel>
                        <InputGroup size='sm'>
                            <Input
                                pr='4.5rem'
                                type={localState.togglePassword ? 'text' : 'password'}
                                placeholder='Enter password'
                                size={"sm"} borderRadius={"md"}
                                {...register("password", { required: true })}/>
                            <InputRightElement width='4.5rem'>
                                <Button h='1.25rem' size='xs' onClick={handleTogglePassword}>
                                {localState.togglePassword ? 'Hide' : 'Show'}
                                </Button>
                            </InputRightElement>
                        </InputGroup>
                    </FormControl>
                    <Stack spacing={10}>
                        <Stack
                        direction={{ base: 'column', sm: 'row' }}
                        align={'start'}
                        justify={'space-between'}>
                        <Checkbox colorScheme={"orange"}>Remember me</Checkbox>
                        </Stack>
                        <Button
                            type={"submit"}
                            color={'white'}
                            size={"sm"}
                            colorScheme={"orange"}
                            loadingText={"Authenticating user..."}
                            isLoading={localState.isLoading}>
                            Sign in
                            </Button>
                    </Stack>
                    </Stack>
                </form>
            </Box>
            </Stack>
        </Flex>
    </>
}