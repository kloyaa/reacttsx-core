import { useEffect, useState } from 'react';
import { Tab, TabList, TabPanel, TabPanels, Tabs, Box, Flex, Stack, Select, FormControl, FormLabel, Wrap, WrapItem, Center, Text, Input, Button, Portal, PopoverContent, PopoverHeader, PopoverBody, Popover, PopoverTrigger, PopoverFooter, PopoverArrow, PopoverCloseButton, Skeleton, useToast, Icon, Tooltip } from '@chakra-ui/react'
import AdminNavbar from '../../components/navbar-admin.component'
import { useNavigate } from 'react-router-dom';
import { HttpMethod, sendRequest } from '../../utils/http.util';
import { API_CREATE_DAILY_RESULT, API_DELETE_DAILY_RESULT, API_GET_ACTIVITIES, API_GET_ALL_BETS, API_GET_DAILY_RESULTS, API_GET_PROFILES, API_VERIFY_TOKEN } from '../../const/api.const';
import { IActivity, IUser } from '../../interface/user.interface';
import useLocalStorage from '../../hooks/localstorage.hook';
import MoonLoader from "react-spinners/MoonLoader";

import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime'; // Import the relativeTime plugin to display relative time
import 'dayjs/locale/en'; // Import the English locale to display month names in English
import { IApiResponse } from '../../interface/api.interface';
import { ActivityTable, BetOverviewTable, UsersTable } from '../../components/tabpanel-content-admin.component';
import { IBet, IDailyResult } from '../../interface/bet.interface';
import { SubmitHandler, useForm } from 'react-hook-form';
import { FaPrint } from "react-icons/fa"
import AdminDailyTotalCard from '../../components/daily-total-admin.component';

dayjs.extend(relativeTime); // Extend Day.js with the relativeTime plugin
dayjs.locale('en'); // Set the locale to English

interface ILocalState {
    isVerifyingToken: boolean;
    unverifiedUsers: IUser[];
    verifiedUsers: IUser[];
    activities: IActivity[];
    dailyBets: IBet[];
    dailyResults: IDailyResult[];
    dailyResultsIsFetching: boolean;
    dailyResultIsCreating: boolean;
    selectedId: string;
    selectedDrawTime: {
        time?: string;
        game?: string;
    }
}

interface IGetTodaysBet {
    time: "10:30 AM" | "3:00 PM" | "8:00 PM" | "2:00 PM" | "5:00 PM" | "9:00 PM" ;
    game: "STL" | "3D";
}

interface IFormInput {
    drawTime: string
}

interface IFormCreateDailyResult {
    schedule: string;
    result: string;
}

function AdminDashboardPage() {
    const navigate = useNavigate();
    const [localState, setLocalState] = useState<ILocalState>({
        isVerifyingToken: true,
        verifiedUsers: [],
        unverifiedUsers: [],
        activities: [],
        dailyBets: [],
        dailyResults: [],
        selectedDrawTime: {},
        selectedId: "",
        dailyResultsIsFetching: true,
        dailyResultIsCreating: false
    });

    const { value: getStoredAuthResponse, removeValue: removeStoredAuthResponse } = useLocalStorage<IApiResponse | null>('authentication_payload', null);
    const { register, handleSubmit } = useForm<IFormCreateDailyResult>()
    const toast = useToast();
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
    }

    const onGetActivities = async () => {
        const response = await sendRequest<IApiResponse>(
            HttpMethod.GET,
            API_GET_ACTIVITIES, // Replace with your actual authentication API endpoint
            {},
            { 'Authorization': `Bearer ${getStoredAuthResponse?.data}` }, // Pass the dynamic headers here
        );
        setLocalState((prev) => ({
            ...prev,
            activities: response as any
        }))
    }

    const onGetTodaysBet = async (data: IGetTodaysBet) => {
        const dateToday = new Date();
        const year = dateToday.getFullYear();
        const month = String(dateToday.getMonth() + 1).padStart(2, '0');
        const day = String(dateToday.getDate()).padStart(2, '0');

        const response = await sendRequest<IApiResponse>(
            HttpMethod.GET,
            API_GET_ALL_BETS, // Replace with your actual authentication API endpoint
            {
                "time": data.time,
                "type": data.game,
                "schedule": `${year}-${month}-${day}`
            },
            { 'Authorization': `Bearer ${getStoredAuthResponse?.data}` }, // Pass the dynamic headers here
        );
        setLocalState((prev) => ({
            ...prev,
            dailyBets: response as any
        }))

        console.log(response)
    }

    const onGetDailyResults = async () => {
        const response = await sendRequest<IApiResponse>(
            HttpMethod.GET,
            API_GET_DAILY_RESULTS, // Replace with your actual authentication API endpoint
            {},
            { 'Authorization': `Bearer ${getStoredAuthResponse?.data}` }, // Pass the dynamic headers here
        );
        setLocalState((prev) => ({
            ...prev,
            dailyResultsIsFetching: false,
            dailyResults: response as any
        }))
    }

    const onDeleteDailyResult = async (id: string) => {
        try {
            setLocalState((prev) => ({
                ...prev,
                selectedId: id
            }))
            
            await sendRequest<IApiResponse>(
                HttpMethod.DELETE,
                API_DELETE_DAILY_RESULT + `${id}`, // Replace with your actual authentication API endpoint
                {},
                { 'Authorization': `Bearer ${getStoredAuthResponse?.data}` });
            
            await onGetDailyResults();

            setLocalState((prev) => ({
                ...prev,
                selectedId: ""
            }));

            toast({
                status: "success",
                colorScheme: "green",
                title: "Success!"
            })
        } catch (error: any) {
            toast({
                status: "error",
                colorScheme: "red",
                title: error.response.data.message|| "Something went wrong. Please try again later."
            })
        }
    }

    const onCreateDailyResult = async (data: IFormCreateDailyResult) => {
        try {
            const [game, time] = data.schedule.split(",");
            const date = new Date();

            setLocalState((prev) => ({
                ...prev,
                dailyResultIsCreating: true,
            }))

            await sendRequest<IApiResponse>(
                HttpMethod.POST,
                API_CREATE_DAILY_RESULT, // Replace with your actual authentication API endpoint
                {
                    "type": game.trim(),
                    "schedule": date.toISOString().substring(0, 10), 
                    "time": time.trim(),//2:00 PM, 5:00 PM, 9:00 PM
                    "number": data.result
                },
                { 'Authorization': `Bearer ${getStoredAuthResponse?.data}` });

            await onGetDailyResults();

            toast({
                status: "success",
                colorScheme: "green",
                title: "Success!"
            })

        } catch (error: any) {
            toast({
                status: "error",
                colorScheme: "red",
                title: error.response.data.message|| "Something went wrong. Please try again later."
            })
        }
        setLocalState((prev) => ({
            ...prev,
            dailyResultIsCreating: false,
        }))
    }

    const handleSelectDrawTime: SubmitHandler<any> = async (data) => {
        const [game, time] = data.target.value.split(", ");
        setLocalState((prev) => ({
            ...prev,
            selectedDrawTime: { game, time }
        }))
        await onGetTodaysBet({ time, game });
    }

    useEffect(() => {
        onGetDailyResults();
        verifyToken();
    }, []);
    
    if (localState.isVerifyingToken) {
        return <Flex
            minH={'100vh'}
            align={'center'}
            justify={'center'}>
                <MoonLoader color={"orange"}/>
            </Flex>
    }

    return <Box 
        minH={'100vh'}
        bg={"gray.50"}>
        <AdminNavbar />
        <Box px={"20"} m={"5"}>
            <Tabs colorScheme={"orange"} size={"sm"} isLazy>
                <TabList
                    display="flex"
                    justifyContent="space-between"
                    borderBottom="1px solid"
                    borderColor="gray.200"
                    mb={4}>
                    <Box display="flex">
                        <Tab fontSize={"sm"}>Today's Bet & Results</Tab>
                        <Tab fontSize={"sm"} isDisabled>Number Analysis</Tab>
                        <Tab 
                            fontSize={"sm"}  
                            onClick={() => onGetUsers({  verified: false })}>Verification Queue</Tab>
                    </Box>
                    <Box display="flex">
                        <Tab 
                            fontSize={"sm"} 
                            onClick={() => onGetUsers({  verified: true })}>Users</Tab>
                        <Tab 
                            fontSize={"sm"} 
                            onClick={() => onGetActivities()}>Activities</Tab>
                    </Box>
                </TabList>
                <TabPanels>
                    {/* Today's Bet */}
                    <TabPanel>
                        {/* <BetOverviewTable bets={onGetTodaysBet({ time: "10:30 AM", type: "3D" })}/> */}
                        <FormControl>
                            <FormLabel>
                                {!localState.selectedDrawTime.game 
                                    ? "Select Game and Schedule"
                                    : `${localState.selectedDrawTime.game} for ${localState.selectedDrawTime.time} Draw`
                                }</FormLabel>
                            <Flex gap={"2"}>
                            <Select 
                                    bg={"white"}
                                    placeholder="Select a schedule" 
                                    onChange={(v) => handleSelectDrawTime(v)}>
                                    <optgroup label="3D">
                                        <option value="3D, 2:00 PM">2:00 PM</option>
                                        <option value="3D, 5:00 PM">5:00 PM</option>
                                        <option value="3D, 9:00 PM">9:00 PM</option>
                                    </optgroup>
                                    <optgroup label="STL">
                                        <option value="STL, 10:30 AM">10:30 AM</option>
                                        <option value="STL, 3:00 PM">3:00 PM</option>
                                        <option value="STL, 8:00 PM">8:00 PM</option>
                                    </optgroup>
                                </Select>
                                <Tooltip hasArrow label="Coming soon!" aria-label='Coming soon!'>
                                    <Button 
                                        colorScheme={"orange"} 
                                        w={"52"} 
                                        isDisabled={true}
                                        leftIcon={<FaPrint />}>Print to PDF</Button>
                                </Tooltip>
                            </Flex>
                        </FormControl>
                        <AdminDailyTotalCard />
                        <Box
                            mt={"5"}
                            borderRadius={"md"}
                            shadow={"md"}
                            bg={"white"}
                            p={"5"}>
                            <Flex>
                                <Box w={"70%"} p={"5"} maxH="500px" overflow="auto">
                                    <BetOverviewTable bets={localState.dailyBets}/>
                                </Box>
                                <Box w={"30%"} p={"5"}>
                                    <Wrap justify={"start"}>
                                        {localState?.dailyResultsIsFetching
                                            ?  <WrapItem flexDirection={"column"} gap={"2"}>
                                                    <Flex gap={"2"}>
                                                        <Skeleton height='140px' width={"140px"}  borderRadius={"md"}/>
                                                        <Skeleton height='140px' width={"140px"}  borderRadius={"md"}/>
                                                        <Skeleton height='140px' width={"140px"}  borderRadius={"md"}/>
                                                    </Flex>
                                                    <Flex gap={"2"}>
                                                        <Skeleton height='140px' width={"140px"}  borderRadius={"md"}/>
                                                            <Skeleton height='140px' width={"140px"}  borderRadius={"md"}/>
                                                            <Skeleton height='140px' width={"140px"}  borderRadius={"md"}/>
                                                    </Flex>
                                            </WrapItem>
                                            : !localState?.dailyResults.length 
                                                ? <Box 
                                                    textAlign="center" 
                                                    p={"20"} 
                                                    bg={"gray.50"} 
                                                    color={"gray.500"} 
                                                    border={"none"} 
                                                    fontSize={"sm"} 
                                                    width={"full"} 
                                                    borderRadius={"md"}>
                                                    <Center>
                                                        <Text>Looks like our daily results are empty.</Text>
                                                    </Center>
                                                </Box>  
                                                :   localState?.dailyResults.map((v) => <WrapItem key={v.time}>
                                                    <Popover>
                                                        <PopoverTrigger>
                                                        <Box 
                                                            width={"140px"}  
                                                            p={"5"} 
                                                            bg={"gray.50"} 
                                                            color={"gray.900"} 
                                                            borderRadius={"md"}
                                                            cursor={"pointer"}>
                                                            <Text fontSize={"x-small"} color={"gray.500"}>{v.schedule.toString().substring(0,10)}</Text>
                                                            <Text fontWeight={"bold"} fontSize={"xs"}>{v.type} {v.time}</Text>
                                                            <Text fontWeight={"black"} fontSize={"3xl"}>{v.number}</Text>
                                                        </Box>
                                                        </PopoverTrigger>
                                                        <Portal>
                                                            <PopoverContent p={"10"} boxShadow={"2xl"}>
                                                                <Text fontSize={"sm"}>
                                                                Deleting this entry may impact users and result accuracy. Recommended not to delete unless necessary and only before the schedule occurs.
                                                                </Text>
                                                                <PopoverArrow />
                                                                <Button 
                                                                    colorScheme={"red"} 
                                                                    size={"sm"} 
                                                                    mt={"5"} 
                                                                    isLoading={localState.selectedId === v._id}
                                                                    onClick={() => onDeleteDailyResult(v._id)}>Delete</Button>
                                                            </PopoverContent>
                                                        </Portal>
                                                    </Popover>
                                                </WrapItem>)}
                                    </Wrap>
                                    {localState.dailyResults.length >= 6 
                                        ?   <Box></Box> 
                                        :   <Box mt={"5"} bg={"gray.50"} borderRadius={"md"} p={"10"}>
                                                <form onSubmit={handleSubmit(onCreateDailyResult)}>
                                                    <Input 
                                                        type="number" 
                                                        size={"md"} 
                                                        borderRadius={"md"} 
                                                        placeholder="Result"
                                                        bg={"white"}
                                                        {...register("result", { required: true, maxLength: 3, minLength: 3 })}/>
                                                    <Select 
                                                        placeholder="Select a schedule" 
                                                        borderRadius={"md"}
                                                        mt={"2"}
                                                        bg={"white"}
                                                        colorScheme={"orange"}
                                                        {...register("schedule", { required: true })}>
                                                        <optgroup label="3D">
                                                            <option value="3D, 2:00 PM">2:00 PM</option>
                                                            <option value="3D, 5:00 PM">5:00 PM</option>
                                                            <option value="3D, 9:00 PM">9:00 PM</option>
                                                        </optgroup>
                                                        <optgroup label="STL">
                                                            <option value="STL, 10:30 AM">10:30 AM</option>
                                                            <option value="STL, 3:00 PM">3:00 PM</option>
                                                            <option value="STL, 8:00 PM">8:00 PM</option>
                                                        </optgroup>
                                                    </Select>
                                                    <Button
                                                        type={"submit"}
                                                        mt={"2"}
                                                        color={'white'}
                                                        size={"md"}
                                                        colorScheme={"orange"}
                                                        isLoading={localState.dailyResultIsCreating}>
                                                        Submit
                                                        </Button>
                                                </form>
                                    </Box>}
                                </Box>
                            </Flex>
                        </Box>
                    </TabPanel>

                    <TabPanel 
                        bg={"white"}
                        borderRadius={"md"}
                        shadow={"md"}>
                        {/* TODO */}
                    </TabPanel>

                    {/* Unverified users */}
                    <TabPanel 
                        bg={"white"}
                        borderRadius={"md"}
                        shadow={"lg"}>
                        <UsersTable 
                            users={localState?.unverifiedUsers}  
                            options={{
                                table: { verified: false },
                                headers: {
                                    authorizationToken: getStoredAuthResponse?.data  as string
                                }}}/>
                    </TabPanel>
                    
                    {/* Verified users */}
                    <TabPanel 
                        bg={"white"}
                        borderRadius={"md"}
                        shadow={"md"}>
                        <UsersTable 
                            users={localState?.verifiedUsers} 
                            options={{
                                table: { verified: true },
                                headers: {
                                    authorizationToken: getStoredAuthResponse?.data as string
                                }
                            }}/>
                    </TabPanel>
                    
                    {/* Activities */}
                    <TabPanel 
                        bg={"white"}
                        borderRadius={"md"}
                        shadow={"md"}>
                        <ActivityTable activities={localState?.activities}/>
                    </TabPanel>
                </TabPanels>
            </Tabs>
        </Box>
    </Box>
}

export default AdminDashboardPage