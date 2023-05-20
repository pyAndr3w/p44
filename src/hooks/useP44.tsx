import { useEffect, useState } from "react";
import { Cell, BOC, Address, Bit, Slice, Builder, HashmapE } from "ton3-core";

type getConfigParamResponse = {
    boc: string,
    param: number
}

const getConfigParam = async (paramId: number) => {
    
    const proxy = "https://cors-anywhere.herokuapp.com/";
    const response = await fetch(
        `${proxy}https://everspace.center/everscale/getConfigParams?number=${paramId}`,
        {
            method: 'GET',
            headers: {
                "X-API-KEY": "b17a652df5d642a6aa6e9dae4601685a",
                "Access-Control-Allow-Origin": "*",
            }
        });
    const json = await response.json() as getConfigParamResponse;
    return json;
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
        const response = await getConfigParam(44);
        const cell = BOC.from(response.boc).root[0];
        setConfig(cell);
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