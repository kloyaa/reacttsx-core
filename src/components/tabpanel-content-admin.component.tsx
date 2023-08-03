import { Table, Tbody, Tr, Td, TableContainer, Button, Flex, Text, Tooltip, Thead, Th, useToast } from '@chakra-ui/react';
import dayjs from 'dayjs';
import { IActivity, IUser } from '../interface/user.interface';
import { useEffect, useState } from 'react';
import { IApiResponse } from '../interface/api.interface';
import { HttpMethod, sendRequest } from '../utils/http.util';
import { API_VERIFY_PROFILE } from '../const/api.const';
import { IBet } from '../interface/bet.interface';
import { currency } from '../utils/converter.util';

interface ILocalState {
    users: IUser[];
    selectedIdForApproval: null | string;
}

interface IOtpions {
    table: {
        verified: boolean,
    },
    headers: {
        authorizationToken: string
    }
}

interface IUsersTable {
    users: IUser[]; 
    options: IOtpions;
}

interface IActivityTable {
    activities: IActivity[]; 
}

interface IBetOverviewTable {
    bets: IBet[]; 
}

// Remove the useState from the renderUserRow function
const renderUserRow = (user: IUser, state: ILocalState, handleSelectIdForApproval: (id: string) => void) => {
    return <Tr key={user._id}>
        <Td>{`${user.profile.refferedBy === undefined ? "N/A" : user.profile.refferedBy}`}</Td>
        <Td>{`${user.profile.lastName}, ${user.profile.firstName}`}</Td>
        <Td>{`${user.username}`}</Td>
        <Td>{`${user.email}`}</Td>
        <Td>{user.profile.gender}</Td>
        <Td>{user.profile.address}</Td>
        <Td>{user.profile.contactNumber}</Td>
        <Td>{dayjs(user.createdAt).format('MMM D [at] h:mm A')}</Td>
        <Td>
        <Flex gap="2">
            {!user.profile.verified 
            ? <Button 
                    colorScheme="orange" 
                    size="xs"  
                    textTransform={"uppercase"}
                    isLoading={user._id === state.selectedIdForApproval}
                    onClick={() => handleSelectIdForApproval(user._id)}>
                Approve
            </Button>
            : <Tooltip hasArrow label="Coming soon!" aria-label='Coming soon!'>
                <Button type={"button"} size="xs"  textTransform={"uppercase"} disabled={true}>
                Revoke Account
                </Button>
            </Tooltip> }
            
        </Flex>
        </Td>
    </Tr>
};

const renderActivityRow = (activity: IActivity) => {
    return <Tr key={activity._id}>
            <Td>{`${activity.profile.lastName}, ${activity.profile.firstName}`}</Td>
            <Td>{`${activity.user.username}`}</Td>
            <Td>{`${activity.user.email}`}</Td>
            <Td>{activity.description}</Td>
            <Td>{dayjs(activity.createdAt).format('MMM D [at] h:mm A')}</Td>
            <Td>
        </Td>
    </Tr>
};

const renderBetRow = (bet: IBet) => {
    return <Tr key={bet._id}>
            <Td  fontWeight={"black"}>{`${bet.reference}`}</Td>
            <Td>{`${bet.type}`}</Td>
            <Td color={"orange.500"} fontWeight={"black"}>{`${bet.number}`}</Td>
            <Td>{`${bet.time}`}</Td>
            <Td>{`${bet.schedule}`}</Td>
            <Td>{currency.format(bet.amount)}</Td>
            <Td textTransform={"uppercase"} fontWeight={"black"}>{bet.rambled ? "R" : "T"}</Td>
            <Td>
        </Td>
    </Tr>
};

export const UsersTable = ({ users, options }: IUsersTable) => {
    const toast = useToast();
    const [localState, setLocalState] = useState<ILocalState>({
        selectedIdForApproval: null,
        users: []
    });
    
    useEffect(() => {
        // Update localState whenever the users prop changes
        setLocalState((prev) => ({
            ...prev,
            users: users,
        }));
    }, [users]);

    const handleSelectIdForApproval = async (id: string) => {
        setLocalState((prev) => ({
            ...prev,
            selectedIdForApproval: id,
        }));

        try {
            await sendRequest<IApiResponse>(
                HttpMethod.POST,
                API_VERIFY_PROFILE,
                { "user": id, "verified": true },
                { 'from': 'web',  'Authorization': `Bearer ${options.headers.authorizationToken}` },
            );
            setLocalState((prev) => ({
                ...prev,
                selectedIdForApproval: null,
                users: prev.users.filter((user) => user._id !== id)
            }));
            toast({
                status: "success",
                colorScheme: "green",
                title: "Approved successfully!"
            })
        } catch (error: any) {
            setLocalState((prev) => ({
                ...prev,
                selectedIdForApproval: id,
            }));
            toast({
                status: "error",
                colorScheme: "red",
                title: error.response.data.message|| "Something went wrong. Please try again later."
            })
        }
    };

    return <>
        <TableContainer>
            <Table variant="simple" size={"sm"}>
                <Thead>
                    <Tr>
                        <Th>Reffered by</Th>
                        <Th>Name</Th>
                        <Th>Username</Th>
                        <Th>Email</Th>
                        <Th>Gender</Th>
                        <Th>Address</Th>
                        <Th>Contact No.</Th>
                        <Th>Date</Th>
                        <Th>Action</Th>
                    </Tr>
                </Thead>
                <Tbody>
                    {options.table.verified
                        ? localState.users?.length === 0
                        ? <Tr>
                                <Td colSpan={9} textAlign="center" p={"20"} color={"gray.500"} border={"none"}>
                                    <Text>Seems like we don't have approved accounts yet.</Text>
                                </Td>
                            </Tr>
                        : localState.users.map((user: IUser) => renderUserRow(user, localState, handleSelectIdForApproval))
                        : localState.users?.length === 0
                        ? <Tr>
                                <Td colSpan={9} textAlign="center" p={"20"} color={"gray.500"} border={"none"}>
                                    <Text>No pending accounts require your approval at this time.</Text>
                                </Td>
                            </Tr>
                        : localState.users.map((user: IUser) => renderUserRow(user, localState, handleSelectIdForApproval))}
                    </Tbody>
            </Table>
        </TableContainer>
    </>
};

export const ActivityTable = ({ activities }: IActivityTable) => {
    const [localState, setLocalState] = useState<IActivityTable>({
        activities: []
    });
    
    useEffect(() => {
        // Update localState whenever the users prop changes
        setLocalState((prev) => ({
            ...prev,
            activities
        }));
    }, [activities]);

    return <>
        <TableContainer>
            <Table variant="simple" size={"sm"}>
                <Thead>
                    <Tr>
                        <Th>Name</Th>
                        <Th>Username</Th>
                        <Th>Email</Th>
                        <Th>Description</Th>
                        <Th>Date</Th>
                    </Tr>
                </Thead>
                <Tbody>
                    { localState.activities?.length === 0
                        ? <Tr>
                                <Td colSpan={7} textAlign="center" p={"20"} color={"gray.500"} border={"none"}>
                                    <Text>Seems like we don't have approved accounts yet.</Text>
                                </Td>
                            </Tr>
                        : localState.activities.map((activity: IActivity) => renderActivityRow(activity))}
                    </Tbody>
            </Table>
        </TableContainer>
    </>
};

export const BetOverviewTable = ({ bets }: IBetOverviewTable) => {
    const [localState, setLocalState] = useState<IBetOverviewTable>({
        bets: []
    });
    
    useEffect(() => {
        // Update localState whenever the users prop changes
        setLocalState((prev) => ({
            ...prev,
            bets
        }));
    }, [bets]);

    return  <TableContainer>
    <Table variant="simple" size={"sm"} h={"10px"}>
        <Thead>
            <Tr>
                <Th>Ref</Th>
                <Th>Game</Th>
                <Th>Number</Th>
                <Th>Time</Th>
                <Th>Schedule</Th>
                <Th>Amount</Th>
                <Th>Type</Th>
            </Tr>
        </Thead>
        <Tbody>
            { localState.bets?.length === 0
                ? <Tr>
                        <Td colSpan={7} textAlign="center" p={"20"} color={"gray.500"} border={"none"}>
                            <Text>Seems like we don't have bets yet.</Text>
                        </Td>
                    </Tr>
                : localState.bets.map((bet: IBet) => renderBetRow(bet))}
            </Tbody>
    </Table>
</TableContainer>
}

