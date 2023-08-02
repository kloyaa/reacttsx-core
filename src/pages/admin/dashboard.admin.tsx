import { useEffect, useState } from 'react';
import { Tab, TabList, TabPanel, TabPanels, Tabs, Box, TableContainer, Table, TableCaption, Thead, Tr, Th, Tbody, Td, Button, Flex,} from '@chakra-ui/react'
import AdminNavbar from '../../components/navbar-admin.component'
import { useNavigate } from 'react-router-dom';
import { HttpMethod, sendRequest } from '../../utils/http.util';
import { API_GET_PROFILES, API_VERIFY_TOKEN } from '../../const/api.const';
import useLocalStorage from '../../hooks/localstorage.hook';
import { IUser } from '../../interface/user.interface';

import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime'; // Import the relativeTime plugin to display relative time
import 'dayjs/locale/en'; // Import the English locale to display month names in English

dayjs.extend(relativeTime); // Extend Day.js with the relativeTime plugin
dayjs.locale('en'); // Set the locale to English

interface ILocalState {
    isVerifyingToken: boolean;
    unverifiedUsers: IUser[];
    verifiedUsers: IUser[];
}

function AdminDashboardPage() {
    const navigate = useNavigate();
    const [localState, setLocalState] = useState<ILocalState>({
        isVerifyingToken: true,
        verifiedUsers: [],
        unverifiedUsers: []
    });

    const { value: getStoredAuthResponse, removeValue: removeStoredAuthResponse } = useLocalStorage<IApiResponse | null>('authentication_payload', null);

      // Function to verify the token before rendering the page
    const verifyToken = async () => {
        try {
            // Check if the token is stored in local storage
            if (!getStoredAuthResponse) {
                // If the token is not present, navigate to the home page
                navigate('/', { replace: true });
                return;
            }

            // Validate the token with your server's "url/token/validate" endpoint
            await sendRequest<IApiResponse>(
                HttpMethod.POST,
                API_VERIFY_TOKEN, // Replace with your actual authentication API endpoint
                { token: getStoredAuthResponse.data },
                { 'from': 'web'}, // Pass the dynamic headers here
            );

            setLocalState((prev) => ({
                ...prev,
                isVerifyingToken: false
            }))

            // Assuming your server responds with a JSON object containing a "valid" property
            return true;
        } catch (error: any) {
            console.error('Error while verifying the token:', error.message);
            // Handle any errors that occur during the token validation process
            // For example, you might want to navigate to the home page or show an error message to the user
            removeStoredAuthResponse();
            navigate('/', { replace: true });
        }
    };

    const onGetUsers = async ({ verified }: { verified: boolean }) => {
        const response = await sendRequest<IApiResponse>(
            HttpMethod.GET,
            API_GET_PROFILES, // Replace with your actual authentication API endpoint
            { verified  },
            { 'Authorization': `Bearer ${getStoredAuthResponse?.data}` }, // Pass the dynamic headers here
        );
        if(verified) {
            setLocalState((prev) => ({
                ...prev,
                verifiedUsers: response as any
            }))
        } else {
            setLocalState((prev) => ({
                ...prev,
                unverifiedUsers: response as any
            }))
        }

        console.log(response)
    }


    useEffect(() => {
        verifyToken();
    }, []);
    
    if (localState.isVerifyingToken) {
        // Show a loading indicator or splash screen while token validation is in progress
        return <div>Loading...</div>;
    }

    return <Box 
        minH={'100vh'}
        bg={"gray.50"}>
        <AdminNavbar />
        <Box px={"20"} m={"20"}>
            <Tabs colorScheme={"orange"} size={"sm"} isLazy>
                <TabList
                    display="flex"
                    justifyContent="space-between"
                    borderBottom="1px solid"
                    borderColor="gray.200"
                    mb={4}>
                    <Box display="flex">
                        <Tab fontSize={"sm"}>Bet Overview</Tab>
                        <Tab fontSize={"sm"}>Daily Summary & Results</Tab>
                        <Tab fontSize={"sm"}>Number Bet Analysis</Tab>
                        <Tab 
                            fontSize={"sm"}  
                            onClick={() => onGetUsers({  verified: false })}>Verification Queue</Tab>
                    </Box>
                    <Box display="flex">
                        <Tab 
                            fontSize={"sm"} 
                            onClick={() => onGetUsers({  verified: true })}>Users</Tab>
                    </Box>
                </TabList>
                <TabPanels>
                    {/* initially mounted */}
                    <TabPanel 
                        bg={"white"}
                        borderRadius={"md"}
                        shadow={"md"}>
                        <p>1!</p>
                    </TabPanel>
                    {/* initially not mounted */}
                    <TabPanel 
                        bg={"white"}
                        borderRadius={"md"}
                        shadow={"md"}>
                        <p>2!</p>
                    </TabPanel>
                    <TabPanel 
                        bg={"white"}
                        borderRadius={"md"}
                        shadow={"md"}>
                        <p>3!</p>
                    </TabPanel>
                    <TabPanel 
                        bg={"white"}
                        borderRadius={"md"}
                        shadow={"lg"}>
                        <TableContainer>
                            <Table variant='simple'>
                                <Thead>
                                    <Tr>
                                        <Th>Name</Th>
                                        <Th>Gender</Th>
                                        <Th>Address</Th>
                                        <Th>Contact No.</Th>
                                        <Th>Date</Th>
                                        <Th>Action</Th>
                                    </Tr>
                                </Thead>
                                <Tbody>
                                    {localState?.unverifiedUsers.map((value: IUser) => <Tr key={value._id}>
                                        <Td>{value.profile.lastName}, {value.profile.firstName}</Td>
                                        <Td>{value.profile.gender}</Td>
                                        <Td>{value.profile.address}</Td>
                                        <Td>{value.profile.contactNumber}</Td>
                                        <Td>{dayjs(value.createdAt).format('MMM D [at] h:mm A')}</Td>
                                        <Td>
                                            <Flex gap={"2"}>
                                                <Button colorScheme={"red"} size={"sm"} variant={"outline"}>Decline</Button>
                                                <Button colorScheme={"orange"} size={"sm"}>Approve</Button>
                                            </Flex>
                                        </Td>
                                    </Tr>
                                    )}
                                </Tbody>
                            </Table>
                        </TableContainer>
                    </TabPanel>
                    <TabPanel 
                        bg={"white"}
                        borderRadius={"md"}
                        shadow={"md"}>
                        <TableContainer>
                            <Table variant='simple'>
                                <Thead>
                                    <Tr>
                                        <Th>Name</Th>
                                        <Th>Gender</Th>
                                        <Th>Address</Th>
                                        <Th>Contact No.</Th>
                                        <Th>Date</Th>
                                        <Th>Action</Th>
                                    </Tr>
                                </Thead>
                                <Tbody>
                                    {localState?.verifiedUsers.map((value: IUser) => <Tr key={value._id}>
                                        <Td>{value.profile.lastName}, {value.profile.firstName}</Td>
                                        <Td>{value.profile.gender}</Td>
                                        <Td>{value.profile.address}</Td>
                                        <Td>{value.profile.contactNumber}</Td>
                                        <Td>{dayjs(value.createdAt).format('MMM D [at] h:mm A')}</Td>
                                        <Td>
                                            <Flex gap={"2"}>
                                                <Button colorScheme={"red"} size={"sm"}>Revoke</Button>
                                            </Flex>
                                        </Td>
                                    </Tr>
                                    )}
                                </Tbody>
                            </Table>
                        </TableContainer>
                    </TabPanel>
                </TabPanels>
            </Tabs>
        </Box>
    </Box>
}

export default AdminDashboardPage