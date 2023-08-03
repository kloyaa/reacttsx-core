import {
    Box,
    Flex,
    HStack,
    IconButton,
    Button,
    Menu,
    MenuButton,
    MenuList,
    MenuItem,
    MenuDivider,
    useDisclosure,
    useColorModeValue,
    Stack,
    Tooltip,
} from '@chakra-ui/react'
import { FaCog } from "react-icons/fa";
import { HamburgerIcon, CloseIcon } from '@chakra-ui/icons'
import useLocalStorage from '../hooks/localstorage.hook';
import { useNavigate } from 'react-router-dom';
import { IApiResponse } from '../interface/api.interface';

interface Props {
    children: React.ReactNode
}

const Links = ['Generate Statements', 'Account Management', "System"]

const NavLink = (props: Props) => {
    const { children } = props

    return (
    <Box
        px={2}
        py={1}
        rounded={'md'}
        fontSize={"sm"}
        cursor={"pointer"}
        color={"gray.300"}>
        <Tooltip hasArrow label="Coming soon!" aria-label='Coming soon!'>
            {children}
        </Tooltip>
    </Box>
    )
}

export default function AdminNavbar() {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const navigate = useNavigate();
    const { removeValue: removeStoredAuthResponse } = useLocalStorage<IApiResponse | null>('authentication_payload', null);

    const onSignOut = () => {
        removeStoredAuthResponse();
        navigate("/", { replace: true });
    }

    return (
    <>
        <Box bg={useColorModeValue('gray.100', 'gray.900')} px={4}>
        <Flex h={12} alignItems={'center'} justifyContent={'space-between'}>
            <IconButton
            size={'md'}
            icon={isOpen ? <CloseIcon /> : <HamburgerIcon />}
            aria-label={'Open Menu'}
            display={{ md: 'none' }}
            onClick={isOpen ? onClose : onOpen}
            />
            <HStack spacing={8} alignItems={'center'}>
            <Box fontWeight={"black"}>Swerte Saya</Box>
            <HStack as={'nav'} spacing={4} display={{ base: 'none', md: 'flex' }}>
                {Links.map((link) => (
                <NavLink key={link}>{link}</NavLink>
                ))}
            </HStack>
            </HStack>
            <Flex alignItems={'center'}>
            <Menu>
                <MenuButton
                    as={Button}
                    rounded={'full'}
                    cursor={'pointer'}
                    variant={"unstyled"}
                    minW={0}>
                    <FaCog />
                </MenuButton>
                <MenuList>
                <MenuItem>Maintenance mode</MenuItem>
                <MenuItem>Change Password</MenuItem>
                <MenuDivider />
                <MenuItem onClick={() => onSignOut()}>Sign out</MenuItem>
                </MenuList>
            </Menu>
            </Flex>
        </Flex>

        {isOpen ? (
            <Box pb={4} display={{ md: 'none' }}>
            <Stack as={'nav'} spacing={4}>
                {Links.map((link) => (
                <NavLink key={link}>{link}</NavLink>
                ))}
            </Stack>
            </Box>
        ) : null}
        </Box>
    </>
    )
}