/* eslint-disable @typescript-eslint/no-explicit-any */
import { connect, createDataItemSigner, dryrun, message, result } from "@permaweb/aoconnect";

export type Tag = { name: string; value: string };

function getUrls() {
    return {
        mu: "https://mu.ao-testnet.xyz",
        cu: "https://cu.ao-testnet.xyz",
        gateway: "https://arweave.net",
    }
}

let instance: any;

export const getInstance = () => {
  if(!instance) {
    const { cu, mu, gateway } = getUrls();
    instance = connect({ MODE: "legacy", CU_URL: cu, MU_URL: mu, GATEWAY_URL: gateway });
  }
  return instance;
}

export async function spawnProcess(name?: string, tags?: Tag[]) {
    const ao = getInstance();

    if (!tags) {
        tags = [];
    }

    tags = name ? [...tags, { name: "Name", value: name }] : tags;
    tags = [...tags, { name: 'Authority', value: 'fcoN_xJeisVsPXA-trzVAuIiqO3ydLQxM-L4XbrQKzY' }];

    const result = await ao.spawn({
        module: "33d-3X8mpv6xYBIVB-eXMrPfH5Kzf6HiwhcvOUA10sw",
        scheduler: "_GQ33BkPtZrqxA84vM8Zk-N2aO0toNNu_C-l-rawrBA",
        tags,
        signer: createDataItemSigner(window.arweaveWallet)
    });

    return result;
}

export async function dryrunResult(userProcess: string, tags: { name: string; value: string }[]) {
    const res = await dryrun({
      process: userProcess,
      tags,
    }).then((res) => JSON.parse(res.Messages[0].Data))
  
    return res
  }
  
  export async function messageResult(userProcess: string, tags: { name: string; value: string }[], data?: string) {  
    const res = await message({
      process: userProcess,
      signer: createDataItemSigner(window.arweaveWallet),
      tags,
      data,
    })
  
    const { Messages, Spawns, Output, Error } = await result({
      message: res,
      process: userProcess,
    })
  
    console.dir({ Messages, Spawns, Output, Error }, { depth: Infinity, colors: true })
  
    return { Messages, Spawns, Output, Error }
  }