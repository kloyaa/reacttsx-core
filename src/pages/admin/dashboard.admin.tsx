import { useEffect, useState } from 'react';
import { Tab, TabList, TabPanel, TabPanels, Tabs, Box, Flex, Select, FormControl, FormLabel, Wrap, WrapItem, Center, Text, Input, Button, Portal, PopoverContent, Popover, PopoverTrigger, PopoverArrow, Skeleton, useToast, Tooltip, Table, Tr, TableContainer, Thead, Th, Tbody, Badge } from '@chakra-ui/react'
import AdminNavbar from '../../components/navbar-admin.component'
import { useNavigate } from 'react-router-dom';
import { HttpMethod, sendRequest } from '../../utils/http.util';
import { API_CREATE_DAILY_RESULT, API_DELETE_DAILY_RESULT, API_GET_ACTIVITIES, API_GET_ALL_TRANSACTIONS, API_GET_DAILY_RESULTS, API_GET_DAILY_TOTAL, API_GET_PROFILES, API_VERIFY_TOKEN } from '../../const/api.const';
import { IActivity, IUser } from '../../interface/user.interface';
import useLocalStorage from '../../hooks/localstorage.hook';
import MoonLoader from "react-spinners/MoonLoader";
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime'; // Import the relativeTime plugin to display relative time
import 'dayjs/locale/en'; // Import the English locale to display month names in English
import { IApiResponse } from '../../interface/api.interface';
import { ActivityTable, UsersTable } from '../../components/tabpanel-content-admin.component';
import { IBet, IDailyResult } from '../../interface/bet.interface';
import { SubmitHandler, useForm } from 'react-hook-form';
import { FaPrint } from "react-icons/fa"
import AdminDailyTotalCard from '../../components/daily-total-admin.component';
import { ITransaction } from '../../interface/transaction.interface';
import { currency } from '../../utils/converter.util';

dayjs.extend(relativeTime); // Extend Day.js with the relativeTime plugin
dayjs.locale('en'); // Set the locale to English

interface ILocalState {
    isVerifyingToken: boolean;
    unverifiedUsers: IUser[];
    verifiedUsers: IUser[];
    activities: IActivity[];
    dailyTransactions: ITransaction[];
    dailyBets: IBet[];
    dailyResults: IDailyResult[];
    dailyResultsIsFetching: boolean;
    dailyResultIsCreating: boolean;
    selectedId: string;
    bet: {
        stl: number;
        swertresCount: number;
    },
    dailyTotal: {
        total: number;
        count: number;
    }
    selectedDrawTime: {
        time?: string;
        game?: string;
    }
}

interface IGetTodaysBet {
    time: "10:30 AM" | "3:00 PM" | "8:00 PM" | "2:00 PM" | "5:00 PM" | "9:00 PM" ;
    game: "STL" | "3D";
}

interface IFormCreateDailyResult {
    schedule: string;
    result: string;
    searchTerm: string;
}

function AdminDashboardPage() {
    const navigate = useNavigate();
    const [localState, setLocalState] = useState<ILocalState>({
        isVerifyingToken: true,
        verifiedUsers: [],
        unverifiedUsers: [],
        activities: [],
        dailyTransactions: [],
        dailyBets: [],
        dailyResults: [],
        selectedDrawTime: {},
        selectedId: "",
        dailyResultsIsFetching: true,
        dailyResultIsCreating: false,
        bet: {
            stl: 0,
            swertresCount: 0
        },
        dailyTotal: {
            count: 0,
            total: 0
        }
    });
    const [searchResults, setSearchResults] = useState<IUser[]>([]);

    const { value: getStoredAuthResponse, removeValue: removeStoredAuthResponse } = useLocalStorage<IApiResponse | null>('authentication_payload', null);
    const { register, handleSubmit, watch } = useForm<IFormCreateDailyResult>()
    const searchTerm = watch('searchTerm', '');

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

    const onGetTodaysTransaction = async () => {
        const dateToday = new Date();
        const year = dateToday.getFullYear();
        const month = String(dateToday.getMonth() + 1).padStart(2, '0');
        const day = String(dateToday.getDate()).padStart(2, '0');

        const response = await sendRequest<IApiResponse>(
            HttpMethod.GET,
            API_GET_ALL_TRANSACTIONS, // Replace with your actual authentication API endpoint
            { "schedule": `${year}-${month}-${'07'}` },
            { 'Authorization': `Bearer ${getStoredAuthResponse?.data}` }, // Pass the dynamic headers here
        );
        
        const result: any[] = response as unknown as any;

        let total = 0;
        let stlCount = 0;
        let swertresCount = 0;
        for (const transaction of result) {
            for (const content of transaction.content) {
                if(content.type === "3D") {
                    swertresCount += 1;
                }
                if(content.type === "STL") {
                    stlCount += 1;
                }
                total += content.amount;
            }
        }

        setLocalState((prev) => ({
            ...prev,
            bet: {
                stl: stlCount,
                swertresCount: swertresCount
            },
            dailyTotal:  {
                total,
                count: 0
            },
            dailyTransactions: response as any
        }))

        console.log(response);
    }

    const onGetDailyResults = async () => {
        const response = await sendRequest<IApiResponse>(
            HttpMethod.GET,
            API_GET_DAILY_RESULTS, // Replace with your actual authentication API endpoint
            {},
            { 'Authorization': `Bearer ${getStoredAuthResponse?.data}` }, // Pass the dynamic headers here
        );
        await onGetDailyTotal();
        setLocalState((prev) => ({
            ...prev,
            dailyResultsIsFetching: false,
            dailyResults: response as any
        }))
    }

    const onGetDailyTotal = async () => {
        const date = new Date();
        const response = await sendRequest<IApiResponse>(
            HttpMethod.GET,
            API_GET_DAILY_TOTAL, // Replace with your actual authentication API endpoint
            { schedule: date.toISOString().substring(0, 10)},
            { 'Authorization': `Bearer ${getStoredAuthResponse?.data}` }, // Pass the dynamic headers here
        );
        setLocalState((prev) => ({
            ...prev,
            dailyTotal: response as any
        }))

        console.log({ schedule: date.toISOString().substring(0, 10) })
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
        if(data.target.value === "") {
            return await onGetTodaysTransaction();
        }
        const [game, time] = data.target.value.split(", ");
        const dateToday = new Date();
        const year = dateToday.getFullYear();
        const month = String(dateToday.getMonth() + 1).padStart(2, '0');

        const response = await sendRequest<IApiResponse>(
            HttpMethod.GET,
            API_GET_ALL_TRANSACTIONS, // Replace with your actual authentication API endpoint
            { 
                "schedule": `${year}-${month}-${'07'}`,
                "game": game,
                "time": time
            },
            { 'Authorization': `Bearer ${getStoredAuthResponse?.data}` }, // Pass the dynamic headers here
        );

        const result: any[] = response as unknown as any;

        let total = 0;
        let stlCount = 0;
        let swertresCount = 0;
        for (const transaction of result) {
            for (const content of transaction.content) {
                if(content.type === "3D") {
                    swertresCount += 1;
                }
                if(content.type === "STL") {
                    stlCount += 1;
                }
                total += content.amount;
            }
        }

        setLocalState((prev) => ({
            ...prev,
            bet: {
                stl: stlCount,
                swertresCount: swertresCount
            },
            dailyTotal:  {
                total,
                count: 0
            },
            dailyTransactions: response as any
        }))
    }

    useEffect(() => {
        onGetTodaysTransaction();
        onGetDailyResults();
        verifyToken();
    }, []);
    
    useEffect(() => {
        const filteredUsers = localState.unverifiedUsers.filter(
            (user) =>
                user.profile.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.profile.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.profile.refferedBy.toLowerCase().includes(searchTerm.toLowerCase())
        );
    
        setSearchResults(filteredUsers);

        console.log("re-rendered")
    }, [watch("searchTerm")]);

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
                                    placeholder="Select all draw" 
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
                        <AdminDailyTotalCard 
                            swertresCount={localState.bet.swertresCount}
                            stlCount={localState.bet.stl}
                            total={localState.dailyTotal.total}/>
                        <Box
                            mt={"5"}
                            borderRadius={"md"}
                            shadow={"md"}
                            bg={"white"}
                            p={"5"}>
                            <Flex>
                                <Box w={"70%"} p={"5"} maxH="500px" overflow="auto">
                                    {/* <BetOverviewTable bets={localState.dailyBets}/> */}
                                    <TableContainer>
                                        <Table variant='striped' size={"sm"}>
                                            <Thead >
                                                <Tr>
                                                    <Th>Teller</Th>
                                                    <Th>Number</Th>
                                                    <Th>Game</Th>
                                                    <Th>Draw Time</Th>
                                                    <Th>Type</Th>
                                                    <Th>Amount</Th>
                                                    <Th>Transaction Time</Th>
                                                </Tr>
                                            </Thead>
                                            <Tbody>
                                                {localState.dailyTransactions.map((v) => {
                                                        return v.content.map((content, index) => {
                                                            const combinationType = content.rambled ? "R" : "T";
                                                            return <Tr key={v._id + `${index}`}>
                                                                <td>
                                                                    <Text textTransform={"capitalize"}>{v.profile.firstName}</Text>
                                                                </td>
                                                                <td>
                                                                    <Text fontWeight={"black"}>{content.number}</Text>
                                                                </td>
                                                                <td>{content.type}</td>
                                                                <td>{content.time}</td>
                                                                <td>
                                                                    {combinationType === "T" 
                                                                        ? <Badge colorScheme={"blackAlpha"} w={"90px"} textAlign={"center"}>TARGET</Badge> 
                                                                        : <Badge colorScheme={"orange"} w={"90px"} textAlign={"center"}>RAMBLED</Badge>}
                                                                </td>
                                                                <td >{currency.format(content.amount)}</td>
                                                                <td>{dayjs(v.createdAt).format("h:mm A")}</td>
                                                            </Tr>
                                                        })
                                                })}
                                            </Tbody>
                                        </Table>
                                    </TableContainer>
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

                            <Box p={"5"} maxH="80vh" overflow="auto">
                            <Box my={"5"}>
                                <Input
                                    {...register('searchTerm')}
                                        type="text"
                                        placeholder="Search by referrer, first or last name"/>
                            </Box>

                            <UsersTable 
                                users={searchResults.length != 0? searchResults :  localState?.unverifiedUsers}  
                                options={{
                                    table: { verified: false },
                                    headers: {
                                        authorizationToken: getStoredAuthResponse?.data  as string
                                    }}}/>
                            </Box>
                    </TabPanel>
                    
                    {/* Verified users */}
                    <TabPanel 
                        bg={"white"}
                        borderRadius={"md"}
                        shadow={"md"}>
                            <Box p={"5"} maxH="80vh" overflow="auto">
                                <UsersTable 
                                    users={localState?.verifiedUsers} 
                                    options={{
                                        table: { verified: true },
                                        headers: {
                                            authorizationToken: getStoredAuthResponse?.data as string
                                        }
                                    }}/>
                            </Box>
                    </TabPanel>
                    
                    {/* Activities */}
                    <TabPanel 
                        bg={"white"}
                        borderRadius={"md"}
                        shadow={"md"}>
                            <Box  p={"5"} maxH="80vh" overflow="auto">
                                <ActivityTable activities={localState?.activities}/>
                            </Box>
                    </TabPanel>
                </TabPanels>
            </Tabs>
        </Box>
    </Box>
}

export default AdminDashboardPage