import {
    SessionKeyAccessListType,
    SessionKeyPermissionsBuilder,
    SessionKeyPlugin,
    SessionKeySigner,
    sessionKeyPluginActions,
    createMultiOwnerModularAccount,
    multiOwnerPluginActions,
    pluginManagerActions,
    accountLoupeActions
  } from "@alchemy/aa-accounts";
import { createModularAccountAlchemyClient } from "@alchemy/aa-alchemy";
import { LocalAccountSigner, polygonMumbai, createSmartAccountClient, Address, type Hex } from "@alchemy/aa-core";
import dotenv from 'dotenv';
import {ethers} from 'ethers';
import { RpcTransactionRequest, http } from "viem";
import { encodeFunctionData,keccak256 } from "viem";

dotenv.config()
const chain = polygonMumbai;
const contractAddress = "0x290e44595D15fe09c7A31B25349a6ef3546aC2A5";
const abi =  [
{
  "inputs": [],
  "stateMutability": "nonpayable",
  "type": "constructor"
},
{
  "inputs": [],
  "name": "InvalidShortString",
  "type": "error"
},
{
  "inputs": [
    {
      "internalType": "string",
      "name": "str",
      "type": "string"
    }
  ],
  "name": "StringTooLong",
  "type": "error"
},
{
  "anonymous": false,
  "inputs": [],
  "name": "EIP712DomainChanged",
  "type": "event"
},
{
  "anonymous": false,
  "inputs": [
    {
      "indexed": false,
      "internalType": "string",
      "name": "cid",
      "type": "string"
    },
    {
      "indexed": true,
      "internalType": "address",
      "name": "sender",
      "type": "address"
    },
    {
      "indexed": false,
      "internalType": "address[]",
      "name": "walletAddresses",
      "type": "address[]"
    },
    {
      "indexed": false,
      "internalType": "uint256",
      "name": "timestamp",
      "type": "uint256"
    }
  ],
  "name": "Hired",
  "type": "event"
},
{
  "anonymous": false,
  "inputs": [
    {
      "indexed": false,
      "internalType": "string",
      "name": "cid",
      "type": "string"
    },
    {
      "indexed": true,
      "internalType": "address",
      "name": "clientWalletAddress",
      "type": "address"
    },
    {
      "indexed": false,
      "internalType": "uint256",
      "name": "timestamp",
      "type": "uint256"
    }
  ],
  "name": "JobPosted",
  "type": "event"
},
{
  "inputs": [
    {
      "internalType": "string",
      "name": "",
      "type": "string"
    }
  ],
  "name": "_cids",
  "outputs": [
    {
      "internalType": "bool",
      "name": "",
      "type": "bool"
    }
  ],
  "stateMutability": "view",
  "type": "function"
},
{
  "inputs": [],
  "name": "eip712Domain",
  "outputs": [
    {
      "internalType": "bytes1",
      "name": "fields",
      "type": "bytes1"
    },
    {
      "internalType": "string",
      "name": "name",
      "type": "string"
    },
    {
      "internalType": "string",
      "name": "version",
      "type": "string"
    },
    {
      "internalType": "uint256",
      "name": "chainId",
      "type": "uint256"
    },
    {
      "internalType": "address",
      "name": "verifyingContract",
      "type": "address"
    },
    {
      "internalType": "bytes32",
      "name": "salt",
      "type": "bytes32"
    },
    {
      "internalType": "uint256[]",
      "name": "extensions",
      "type": "uint256[]"
    }
  ],
  "stateMutability": "view",
  "type": "function"
},
{
  "inputs": [
    {
      "internalType": "address",
      "name": "walletAddress",
      "type": "address"
    }
  ],
  "name": "getNonce",
  "outputs": [
    {
      "internalType": "uint256",
      "name": "",
      "type": "uint256"
    }
  ],
  "stateMutability": "view",
  "type": "function"
},
{
  "inputs": [
    {
      "components": [
        {
          "internalType": "string",
          "name": "cid",
          "type": "string"
        },
        {
          "internalType": "address",
          "name": "client",
          "type": "address"
        },
        {
          "internalType": "address[]",
          "name": "freelancers",
          "type": "address[]"
        },
        {
          "internalType": "uint256",
          "name": "clientNonce",
          "type": "uint256"
        },
        {
          "internalType": "uint256[]",
          "name": "freelancerNonces",
          "type": "uint256[]"
        }
      ],
      "internalType": "struct JobBoard.ClientHireInfo",
      "name": "clientHireInfo",
      "type": "tuple"
    },
    {
      "internalType": "bytes",
      "name": "clientSignature",
      "type": "bytes"
    },
    {
      "internalType": "bytes[]",
      "name": "freelancerSignatures",
      "type": "bytes[]"
    }
  ],
  "name": "hire",
  "outputs": [],
  "stateMutability": "nonpayable",
  "type": "function"
},
{
  "inputs": [],
  "name": "merkleRoot",
  "outputs": [
    {
      "internalType": "bytes32",
      "name": "",
      "type": "bytes32"
    }
  ],
  "stateMutability": "view",
  "type": "function"
},
{
  "inputs": [
    {
      "internalType": "address",
      "name": "",
      "type": "address"
    }
  ],
  "name": "nonces",
  "outputs": [
    {
      "internalType": "uint256",
      "name": "",
      "type": "uint256"
    }
  ],
  "stateMutability": "view",
  "type": "function"
},
{
  "inputs": [
    {
      "components": [
        {
          "internalType": "string",
          "name": "cid",
          "type": "string"
        },
        {
          "internalType": "uint256",
          "name": "nonce",
          "type": "uint256"
        },
        {
          "internalType": "address",
          "name": "owner",
          "type": "address"
        }
      ],
      "internalType": "struct JobBoard.JobInfo",
      "name": "jobInfo",
      "type": "tuple"
    },
    {
      "internalType": "bytes",
      "name": "signature",
      "type": "bytes"
    }
  ],
  "name": "postJob",
  "outputs": [],
  "stateMutability": "nonpayable",
  "type": "function"
}
]

// The private key of your EOA that will be the signer to connect with the Modular Account
// Our recommendation is to store the private key in an environment variable
const P_KEY = `0x${process.env.PRIVATE_KEY}` as Hex;
const signer = LocalAccountSigner.privateKeyToAccountSigner(P_KEY);
console.log(signer)
const apiKey = `${process.env.ALCHEMY}`;

//const sessionKeySigner = new SessionKeySigner();
// Create a smart account client to send user operations from your smart account
// const provider = (await createModularAccountAlchemyClient({
//   // get your Alchemy API key at https://dashboard.alchemy.com
//   apiKey: process.env.ALCHEMY,
//   chain,
//   signer,
// })
// ).extend(sessionKeyPluginActions);
//const sessionKeySigner = new SessionKeySigner();
const newkey = `0x${process.env.PRIVATE_KEY_1}` as Hex;
const sessionKeySigner = LocalAccountSigner.privateKeyToAccountSigner(newkey);
console.log("season key address : ",await sessionKeySigner.getAddress());


const smartAccountClient = await createModularAccountAlchemyClient({
  apiKey,
  chain,
  signer,
})

const decoratedClient = smartAccountClient
    .extend(multiOwnerPluginActions)
    .extend(pluginManagerActions)
    .extend(accountLoupeActions)
    .extend(sessionKeyPluginActions);



// 1. check if the plugin is installed
const isPluginInstalled = await decoratedClient
.getInstalledPlugins({})
// This checks using the default address for the chain, but you can always pass in your own plugin address here as an override
.then((x) => x.includes(SessionKeyPlugin.meta.addresses[chain.id]));

console.log("IsPluginInstalled : ",isPluginInstalled)
// 2. if the plugin is not installed, then install it and set up the session key
if (!isPluginInstalled) {
console.log("plugin isn't installalled")
// lets create an initial permission set for the session key giving it an eth spend limit
const initialPermissions = new SessionKeyPermissionsBuilder()
  .setNativeTokenSpendLimit({
    spendLimit: 1000000n,
  })
  // this will allow the session key plugin to interact with all addresses
  .setContractAccessControlType(SessionKeyAccessListType.ALLOW_ALL_ACCESS)
  .setTimeRange({
    validFrom: Math.floor(Date.now() / 1000),
    // valid for 1 hour
    validUntil: Math.floor(Date.now() / 1000) + 60 * 60,
  });
  

const { hash } = await decoratedClient.installSessionKeyPlugin({
  // 1st arg is the initial set of session keys
  // 2nd arg is the tags for the session keys
  // 3rd arg is the initial set of permissions
  args: [
    [await sessionKeySigner.getAddress()],
    [keccak256(new TextEncoder().encode("session-key-tag"))],
    [initialPermissions.encode()],
  ],
});

 await decoratedClient.waitForUserOperationTransaction({ hash });
}
const address = decoratedClient.getAddress();
console.log("The Return value is : ",address)
//console.log("New Client : ",decoratedClient.getAddress())
// 3. set up a client that's using our session key
const sessionKeyClient = (
await createModularAccountAlchemyClient({
  chain,
  signer: sessionKeySigner,
  apiKey: `${process.env.ALCHEMY}`,
  // this is important because it tells the client to use our previously deployed account
  accountAddress: decoratedClient.getAddress(),
})
).extend(sessionKeyPluginActions);



// // 4. send a user operation using the session key
// const result = await sessionKeyClient.executeWithSessionKey({
//   args: [
//     [{ target: "0x1234", value: 1n, data: "0x" }],
//     await sessionKeySigner.getAddress(),
//   ],
// });

// const provider = new ethers.providers.JsonRpcProvider('https://polygon-mumbai.g.alchemy.com/v2/iZDtkSlQWHXN8af_yP2u2RuhBDrKzoDH'); // Change the URL to match your network
// const wallet = new ethers.Wallet('70856362378e1715d0f1eff7b4eaf1a849db7fd52beec033275ab99b97e64be1', provider); // Replace YOUR_PRIVATE_KEY with your actual private key
// async function signEIP712(domain, types, message) {
//   return await wallet._signTypedData(domain, types, message);
// }
// const contract = new ethers.Contract(contractAddress, abi, wallet);

(async()=>{

console.log("New Client : ",decoratedClient.getAddress())

const result = await sessionKeyClient.executeWithSessionKey({
  args: [
    [{ target: "0x", value: 1n, data: "0x" }],
    await sessionKeySigner.getAddress(),
  ],
});
console.log(result)
console.log("Smart Account Address: ", decoratedClient.getAddress());


})()
// (async () => {
//     // Fund your account address with ETH to send for the user operations
//     // (e.g. Get Sepolia ETH at https://sepoliafaucet.com)
//     console.log("Smart Account Address: ", decoratedClient.getAddress());


// sign typed data

  // const jobInfo = {
  //   cid: "This is the test with SWC",
  //   nonce: await contract.getNonce(wallet.address),
  //   owner: wallet.address,
  // };

  // const domain = {
  //   name: 'JobBoard',
  //   version: '1',
  //   chainId: await wallet.getChainId(),
  //   verifyingContract: contractAddress,
  // };

  // const types = {
  //   JobInfo: [
  //       { name: 'cid', type: 'string' },
  //       { name: 'nonce', type: 'uint256' },
  //       { name: 'owner', type: 'address' },
  //   ],
  // };



//   const transferABI = [
//     {
//       "constant": false,
//       "inputs": [
//         {
//           "name": "_to",
//           "type": "address"
//         },
//         {
//           "name": "_value",
//           "type": "uint256"
//         }
//       ],
//       "name": "transfer",
//       "outputs": [
//         {
//           "name": "",
//           "type": "bool"
//         }
//       ],
//       "payable": false,
//       "stateMutability": "nonpayable",
//       "type": "function"
//     }
//   ]

//  // const signature = await signEIP712(domain, types, jobInfo);

//     const uoCallData = encodeFunctionData({
//       abi: transferABI,
//       functionName: "transfer",
//       args: ["0x725b35D35eDE4157ebE5a57613609d40C4DB6aB7",'2000000'],
//     });
     
//     const uo = await decoratedClient.sendUserOperation({
//       uo: {
//         target: "0x9999f7Fea5938fD3b1E26A12c3f2fb024e194f97",
//         data: uoCallData,
//       },
//     });
  
//     const txHash = await decoratedClient.waitForUserOperationTransaction(uo);
  
//     console.log(txHash);
  
//     // const hash = `0x${'a1ea93ae9883a46fca830b99da5b374c9d7aec45254b2e4918fe163e3b470dcd'}`;
//     // const receipt = await provider.getUserOperationReceipt(hash);
//   //   // console.log(receipt);
  

//   //   const myAddress = "0xbE9c3578964C0FB32Da4DE76b73D5D289D0f54c4" as Address;
//   //   const valueInWei = BigInt(ethers.utils.parseUnits("0.005", "ether").toString());

//   //   const { hash: uoHash } = await smartAccountClient.sendUserOperation({
//   //   uo: {
//   //     target: myAddress, // The desired target contract address
//   //     value: 0n,
//   //     data:'0x' // (Optional) value to send the target contract address
//   //   },
//   // });

//   // console.log("UserOperation Hash: ", uoHash); // Log the user operation hash

//   // // Wait for the user operation to be mined
//   // const txHash = await smartAccountClient.waitForUserOperationTransaction({
//   //   hash: uoHash,
//   // });

//   //  console.log("Transaction Hash: ", txHash); // Log the transaction hash
// })();

