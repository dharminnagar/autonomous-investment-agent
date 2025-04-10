/* eslint-disable @typescript-eslint/no-explicit-any */
import { connect, spawn, createDataItemSigner, dryrun, message, result } from "@permaweb/aoconnect";

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
  console.log(instance);
  return instance;
}

export async function spawnProcess(name?: string, tags?: Tag[]) {
  // const ao = getInstance();

  const signer = createDataItemSigner(window.arweaveWallet);

  console.log(signer);

    if (!tags) {
        tags = [];
    }

    tags = name ? [...tags, { name: "Name", value: name }] : tags;
    tags = [...tags, { name: 'Authority', value: 'fcoN_xJeisVsPXA-trzVAuIiqO3ydLQxM-L4XbrQKzY' }];

    const result = await spawn({
        module: "ghSkge2sIUD_F00ym5sEimC63BDBuBrq4b5OcwxOjiw",
        scheduler: "_GQ33BkPtZrqxA84vM8Zk-N2aO0toNNu_C-l-rawrBA",
        tags,
        signer
    });

    return result;
}

export async function dryrunResult(userProcess: string, tags: { name: string; value: string }[]) {
    const res = await dryrun({
      process: userProcess,
      tags,
    }).then((res) => JSON.parse(res.Messages[0]?.Data || "[]"))
  
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