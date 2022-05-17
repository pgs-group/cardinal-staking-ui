import {STAKE_POOL_ADDRESS, STAKE_POOL_IDL} from '@cardinal/staking/dist/cjs/programs/stakePool'
import {StakeEntryData} from "@cardinal/staking/src/programs/stakePool/constants";
import {useEnvironmentCtx} from "./../providers/EnvironmentProvider";
import {BorshAccountsCoder,} from '@project-serum/anchor'
import {useStakePoolData} from './useStakePoolData'
import {AccountData} from "@cardinal/common";
import {PublicKey} from '@solana/web3.js'

interface LeaderboardItemType {
    walletId: string;
    count: number;
    points: number;
}

export const useLeaderboard = async () => {
    const {connection} = useEnvironmentCtx()
    const {data: stakePool } : any = useStakePoolData()
    const parseStakedTokens = (stakedTokens: any) => {
        const stakeEntryDatas: AccountData<StakeEntryData>[] = [];
        const coder = new BorshAccountsCoder(STAKE_POOL_IDL);
        stakedTokens.forEach((account: any) => {
            try {
                const stakeEntryData: StakeEntryData = coder.decode(
                    "stakeEntry",
                    account.account.data
                );
                if (stakeEntryData) {
                    stakeEntryDatas.push({
                        ...account,
                        parsed: stakeEntryData,
                    });
                }
            } catch (e) {
                console.log("Failed to decode token manager data");
            }
        });
        return stakeEntryDatas
    }
    console.log(stakePool?.pubkey)
    const getStakedTokens = async () => {
        const stakedTokens = await connection.getProgramAccounts(
            STAKE_POOL_ADDRESS,
            {
                filters: [{memcmp: {offset: 9, bytes: ''}}],
            }
        )
        return parseStakedTokens(stakedTokens)

    }
    const getLeaderboard = async () => {
        const leaderboard : { [key: string]: LeaderboardItemType; } = {}
        const stakedTokens = await getStakedTokens()
        stakedTokens.forEach( stakedToken => {
            const walletId : string = new PublicKey(stakedToken.parsed.lastStaker).toBase58()
            const lastStakedAt : number = stakedToken.parsed.lastStakedAt.toNumber() * 1000
            const points : number = +new Date() - +new Date(lastStakedAt)

            if (!leaderboard[walletId])
                leaderboard[walletId] = {
                    count: 0,
                    points: 0,
                    walletId: walletId
                }

            // @ts-ignore
            leaderboard[walletId].count++
            // @ts-ignore
            leaderboard[walletId].points += points

        })
        return Object.values(leaderboard).sort((a: LeaderboardItemType, b: LeaderboardItemType) => {
            return b.points - a.points
        })
    }

    getLeaderboard().then( res => {
        console.log(res)
    })
    return {}
}