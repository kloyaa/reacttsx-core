import { Table, Thead, Tbody, Tr, Th, Td, TableContainer, Button, Flex } from '@chakra-ui/react';
import dayjs from 'dayjs';
import { IUser } from '../interface/user.interface';

const renderUserRow = (user: IUser) => {
    return (
    <Tr key={user._id}>
        <Td>{`${user.profile.lastName}, ${user.profile.firstName}`}</Td>
        <Td>{user.profile.gender}</Td>
        <Td>{user.profile.address}</Td>
        <Td>{user.profile.contactNumber}</Td>
        <Td>{dayjs(user.createdAt).format('MMM D [at] h:mm A')}</Td>
        <Td>
        <Flex gap="2">
            {!user.profile.verified ?
            <Flex gap={"2"}>
                <Button colorScheme="red" size="xs" variant="outline" textTransform={"uppercase"}>
                Decline
                </Button>
                <Button colorScheme="orange" size="xs"  textTransform={"uppercase"}>
                Approve
                </Button>
            </Flex> :
            <Button colorScheme="red" size="xs"  textTransform={"uppercase"}>
            Revoke Account
            </Button>}
            
        </Flex>
        </Td>
    </Tr>
    );
};

export const UsersTable = ({ users }: { users: IUser[] }) => {
    return (
    <TableContainer>
        <Table variant="simple">
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
            {users.map((user: IUser) => renderUserRow(user))}
        </Tbody>
        </Table>
    </TableContainer>
    );
};

