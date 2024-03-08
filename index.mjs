import * as LitJsSdk from "@lit-protocol/lit-node-client";
//const LitJsSdk = require('@lit-protocol/lit-node-client-nodejs');
import {ethers}  from "ethers";
import siwe from 'siwe';
import dotenv from 'dotenv';
import Irys from "@irys/sdk";
import fs from 'fs';
dotenv.config()

const chain = "mumbai";

const LayersIDAddress = "0x6d5fb651e85074be81c569336d7597365082a49c";

const accessControlConditions = [
  {
    contractAddress: LayersIDAddress,
    standardContractType: 'ERC721',
    chain,
    method: 'balanceOf',
    parameters: [
      ':userAddress'
    ],
    returnValueTest: {
      comparator: '>',
      value: '0'
    }
  }
]

const client = new LitJsSdk.LitNodeClient({
    litNetwork: 'cayenne',
    debug:false
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

    await litNodeClient.connect().catch((err) => {
      console.error('Error connecting LitNodeClient:', err);
      throw err; // Rethrow the error to propagate it to the caller
  });
  
  let nonce = litNodeClient.getLatestBlockhash();
  console.log("nonce : ",nonce)
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
    
  // expiration time in ISO 8601 format.  This is 1 days in the future, calculated in milliseconds
  const expirationTime = new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString();

  const siweMessage = new siwe.SiweMessage({
    domain,
    address: address,
    statement,
    uri: origin,
    version: '1',
    chainId: 80001,
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

async function decrypt(ciphertext, dataToEncryptHash, accessControlConditions) {
  const lit = new Lit(); 
  await lit.connect();

  const authSig = await generateAuth();

  try {
    const decryptedString = await LitJsSdk.decryptToString(  // Add 'await' here
      {
        accessControlConditions,
        ciphertext,
        dataToEncryptHash,
        authSig,
        chain: 'mumbai',
      },
      lit.litNodeClient,
    );
    return { decryptedString };
  } catch(err) {
    console.error('Error during decryption:', err);
    throw err; 
  }
}


async function encrypt(dataToEncrypt) {
  const lit = new Lit(); 
  await lit.connect();

  const authSig = await generateAuth()
  try {
    const { ciphertext, dataToEncryptHash } = await LitJsSdk.encryptString(
        {
            accessControlConditions,
            authSig,
            chain: 'mumbai',
            dataToEncrypt: dataToEncrypt,
        },
        lit.litNodeClient, // Use the litNodeClient from the Lit instance
    );

    return [
        ciphertext,
        dataToEncryptHash,
    ];
      } catch (err) {
        console.error('Error during encryption:', err);
        throw err; // Rethrow the error to propagate it to the caller
      }
}

async function getIrys() {
	const url = "https://devnet.irys.xyz";
	const providerUrl = "https://polygon-mumbai.g.alchemy.com/v2/iZDtkSlQWHXN8af_yP2u2RuhBDrKzoDH";
	const token = "matic";
 
	const irys = new Irys({
		url, // URL of the node you want to connect to
		token, // Token used for payment
		key: process.env.PRIVATE_KEY, // Private key
		config: { providerUrl }, // Optional provider URL, only required when using Devnet
	});
	return irys;
}

async function storeOnIrys(cipherText, dataToEncryptHash) {
	const irys = await getIrys();
 
	const dataToUpload = {
		cipherText: cipherText,
		dataToEncryptHash: dataToEncryptHash,
		accessControlConditions: accessControlConditions,
	};
 
	let receipt;
	try {
		const tags = [{ name: "Content-Type", value: "application/json" }];
		receipt = await irys.upload(JSON.stringify(dataToUpload), { tags: tags });
	} catch (e) {
		console.log("Error uploading data ", e);
	}
 
	return receipt?.id;
}

async function retrieveFromIrys(id) {
	const gatewayAddress = "https://gateway.irys.xyz/";
	const url = `${gatewayAddress}${id}`;
 
	try {
		const response = await fetch(url);
 
		if (!response.ok) {
			throw new Error(`Failed to retrieve data for ID: ${id}`);
		}
 
		const data = await response.json();
		return [data.cipherText, data.dataToEncryptHash, data.accessControlConditions];
	} catch (e) {
		console.log("Error retrieving data ", e);
	}
}

// async function main() {

//   const dataToEncrypt = "This is the freelancer resource and will be provided to each Id holder";


//   const ciphertext = "jWwghw//ctgHkH9JnV1YQ2k17Lf1yMoOXXVK8ltBpJEPbil67PxmkYMVx8m6LVvmJe6ysqLm0SDZJ0tBClFxsEZnlaTf2K6E/zjvnS5sZoZH7ctcZf+xYAY/dSe9vHvyz0whTuEFP6fOuNrs7ZW4Ni3I3dov8B3eISUIOyUaOd+xzmPU2QnjnnfVAHM+2pnwflmELNb4Qy8D";
//   const dataToEncryptHash = "c3593c81bec282597fbc831f1a95dcdee53ac60907b731f5f3f0b20e5b1c338e";

//   try {
//       const authSig = await generateAuth();
//       console.log('Authentication Signature:', authSig);

//       // const encryptionResult = await encrypt(dataToEncrypt);
//       // console.log('Encryption Result:', encryptionResult);

//        const decryptionResult = await decrypt(ciphertext,dataToEncryptHash,accessControlConditions);
//        console.log('Encryption Result:', decryptionResult);

//   } catch (err) {
//       console.error('Error in main function:', err);
//   }
// }



async function main() {
	const messageToEncrypt = "This is the freelancer resource and will be provided to each Id holder";
  
  const fileBuffer = fs.readFileSync("./data.json");
  const fileString = fileBuffer.toString();
	//1. Encrypt data
	const [cipherText, dataToEncryptHash] = await encrypt(fileString);
  console.log(cipherText,dataToEncryptHash)
	// 2. Store cipherText and dataToEncryptHash on Irys
	const encryptedDataID = await storeOnIrys(cipherText, dataToEncryptHash);
 
	console.log(`Data stored at https://gateway.irys.xyz/${encryptedDataID}`);
 
	// 3. Retrieve data stored on Irys
	// In real world applications, you could wait any amount of time before retrieving and decrypting

	const [cipherTextRetrieved, dataToEncryptHashRetrieved, accessControlConditions] = await retrieveFromIrys(
		encryptedDataID,
	);
	// 4. Decrypt data
	const decryptedString = await decrypt(cipherTextRetrieved, dataToEncryptHashRetrieved, accessControlConditions);
	console.log("decryptedString:", decryptedString);
}
 
main();