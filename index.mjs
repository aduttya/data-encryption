import * as LitJsSdk from "@lit-protocol/lit-node-client";
//const LitJsSdk = require('@lit-protocol/lit-node-client-nodejs');
import {ethers}  from "ethers";
import siwe from 'siwe';
import dotenv from 'dotenv';

dotenv.config()


//type ChainType = "mumbai" | "ethereum" | "polygon" | "fantom" | "xdai" | "bsc" | "arbitrum" | "avalanche" | "fuji" | "harmony" | "goerli" | "cronos" | "optimism" | "celo" | "aurora" | "eluvio"; // Add more chains as needed

const chain = "mumbai";

// interface ReturnValueTest {
//   comparator: string;
//   value: string;
// }

// interface AccessControlConditions {
//   contractAddress: string;
//   standardContractType: string;
//   chain: ChainType;
//   method: string;
//   parameters: string[];
//   returnValueTest: ReturnValueTest;
// }

const client = new LitJsSdk.LitNodeClient({
    litNetwork: 'cayenne',
});


class Lit {
   litNodeClient

  async connect() {
    await client.connect()
    this.litNodeClient = client
  }
}

export default new Lit()
async function generateAuth() {
  // Initialize LitNodeClient
  const litNodeClient = new LitJsSdk.LitNodeClientNodeJs({
        alertWhenUnauthorized: false,
        litNetwork: 'cayenne',
    });
  await litNodeClient.connect();

  let nonce = litNodeClient.getLatestBlockhash();

  // Initialize the signer
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY);
  console.log("Address : ",wallet.address)

  const address = ethers.getAddress(await wallet.getAddress());
  console.log("Address : ",wallet.address)

  // Craft the SIWE message
  const domain = 'localhost';
  const origin = 'https://localhost/login';
  const statement =
    'This is a test statement.  You can put anything you want here.';
    
  // expiration time in ISO 8601 format.  This is 7 days in the future, calculated in milliseconds
  const expirationTime = new Date(
    Date.now() + 1000 * 60 * 60 * 24 * 7 * 10000
  ).toISOString();
  
  const siweMessage = new siwe.SiweMessage({
    domain,
    address: address,
    statement,
    uri: origin,
    version: '1',
    chainId: 1,
    nonce,
    expirationTime,
  });
  const messageToSign = siweMessage.prepareMessage();
  
  // Sign the message and format the authSig
  const signature = await wallet.signMessage(messageToSign);

  const authSig = {
    sig: signature,
    derivedVia: 'web3.eth.personal.sign',
    signedMessage: messageToSign,
    address: address,
  };

  console.log(authSig);
  return authSig
}

const accessControlConditions = [
  {
    contractAddress: "",
    standardContractType: "",
    chain: "ethereum", // Make sure this matches one of the string literals in ChainType
    method: "eth_getBalance",
    parameters: [":userAddress", "latest"],
    returnValueTest: {
      comparator: ">=",
      value: "1000000000000", // 0.000001 ETH
    },
  },
];


async function encrypt() {
  const lit = new Lit(); 
  await lit.connect();

  const authSig = await generateAuth()
  const { ciphertext, dataToEncryptHash } = await LitJsSdk.encryptString(
      {
          accessControlConditions,
          authSig,
          chain: 'ethereum',
          dataToEncrypt: 'this is a secret message',
      },
      lit.litNodeClient, // Use the litNodeClient from the Lit instance
  );

  return {
      ciphertext,
      dataToEncryptHash,
  };
}

async function main(){

    const authSig = await generateAuth()
    console.log(authSig)

    await encrypt()

}


main()