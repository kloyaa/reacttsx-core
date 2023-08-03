import { Box, Button, Flex, Heading, Text } from '@chakra-ui/react'
import { CloseIcon } from '@chakra-ui/icons'
import { useNavigate } from 'react-router-dom'

export default function Error() {
    const navigate = useNavigate();
    return (
        <Flex            
            minH={'100vh'}
            align={'center'}
            justify={'center'}
            bg={"gray.50"}
            flexDirection={"column"}>
                <Box display="inline-block">
                    <Flex
                    flexDirection="column"
                    justifyContent="center"
                    alignItems="center"
                    bg={'red.500'}
                    rounded={'50px'}
                    w={'55px'}
                    h={'55px'}
                    textAlign="center">
                    <CloseIcon boxSize={'20px'} color={'white'} />
                    </Flex>
                </Box>
                <Heading as="h2" size="4xl" mt={6} mb={2}>
                    404
                </Heading>
                <Box width={"2xl"} p={"5"}>
                    <Text color={'gray.500'} textAlign={"center"} fontSize={"large"}>
                    Oops! Looks like the page you were searching for has wandered off into the digital wilderness. We apologize for the inconvenience. Please check your URL or try navigating back to our homepage. If you need any assistance, feel free to contact our friendly support team. Thank you for visiting!
                    </Text>
                </Box>
                <Button onClick={() => navigate("/")} variant={"ghost"}>Home</Button>
        </Flex>
    )
}