import {
    Box,
    SimpleGrid,
    Stat,
    StatLabel,
    StatNumber,
    useColorModeValue,
} from '@chakra-ui/react'
import { currency } from '../utils/converter.util'

interface StatsCardProps {
    title: any
    stat: any
}

function StatsCard(props: StatsCardProps) {
    const { title, stat } = props
    return (
    <Stat
        px={{ base: 4, md: 8 }}
        py={'5'}
        shadow={'md'}
        borderColor={useColorModeValue('white', 'gray.500')}
        rounded={'lg'}
        bg={"white"}>
            <StatLabel fontWeight={'normal'}  fontSize={'sm'} color={"gray.500"} isTruncated>{title}</StatLabel>
            <StatNumber fontSize={'2xl'} fontWeight={'black'}>{stat}</StatNumber>
    </Stat>
    )
}

export default function AdminDailyTotalCard({ total, count }: { total: number, count: number}) {
    return (
        <Box maxW="7xl" pt={"5"}>
            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={{ base: 5, lg: 8 }}>
                <StatsCard title={'Daily Gross'} stat={currency.format(total)} />
                <StatsCard title={'Numbers Formulated'} stat={count} />
            </SimpleGrid>
        </Box>
    )
}