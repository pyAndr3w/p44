import { log } from "console";
import { useEffect, useState } from "react";
import { Cell, BOC, Address, Bit, Slice, Builder, HashmapE, Hashmap } from "ton3-core";


type getAccountDataResponse = {
    "data": {
        "blockchain": {
            "account": {
                "info": {
                    "data": string
                }
            }
        }
    }
}


const getAccountData = async (address: Address): Promise<Cell> => {
    const query = `
        query {
            blockchain {
                account(address: "${address.toString('raw')}") {
                    info {
                        data
                    }
                }
            }
        }
    `;

    const response = await fetch(
        "https://mainnet.evercloud.dev/fc5b8eb8cac649908ce13df2077bf51e/graphql",
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ query: query })
        });

    const json = await response.json() as getAccountDataResponse;
    return BOC.from(json.data.blockchain.account.info.data).root[0];
}


const getConfigParams = async (): Promise<{[key:number]: Cell}> => {
    const configContractData = await getAccountData(new Address("-1:5555555555555555555555555555555555555555555555555555555555555555"));
    const deserializers = {
        key: (k: Bit[]): number => { 
            return new Builder().storeBits(k).cell().slice().loadUint(32);
        },
        value: (v: Cell) => v,
    };
    const parsed: [number, Cell][] = [...Hashmap.parse(32, configContractData.refs[0].slice(), { deserializers })];
    return parsed.reduce((acc, [k, v]) => ({...acc, [k]: v}), {});
}


const getConfigParam = async (paramId: number) => {
    const params = await getConfigParams();
    return params[paramId];
}


const parseP44 = (data: Cell): Address[] => {
    const deserializers = {
        key: (k: Bit[]): Address => { 
            const ds = Slice.parse(new Builder().storeBits(k).cell());
            const wc = ds.loadInt(32);
            const addr = ds.loadBigUint(256);
            return new Builder().storeUint(0b100, 3).storeInt(wc, 8).storeUint(addr, 256).cell().slice().loadAddress() as Address;
        },
        value: (v: Cell): Bit => v.slice().bits[0],
    };
    const parsed: [Address, Bit][] = [...HashmapE.parse(288, data.refs[0].slice(), { deserializers })];
    return parsed.map(([k, _]) => k);
}


export default () => {
    const [config, setConfig] = useState<null | Cell>(null);
    const [p44, setP44] = useState<Address[]>([]);

    const updateConfig = async () => {
        const param = await getConfigParam(44);
        setConfig(param);
    };

    const updateP44 = async () => {
        if (!config) return;
        setP44(parseP44(config));
    };

    useEffect(() => {
        updateConfig();
    }, []);

    useEffect(() => {
        updateP44();
    }, [config]);

    return p44;
}
