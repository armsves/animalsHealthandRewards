import { ethers } from "ethers";

async function main() {
    // Contract address and ABI
    const contractAddress = "0x3D61f0A272eC69d65F5CFF097212079aaFDe8267";
    const abi = [
        "function safeTransferFrom(address from, address to, uint256 id, uint256 amount, bytes data) external",
    ];

    // Input parameters
    const from = "0xd00bcA46fc35DEC572fa7a56E2DB16C618878629";
    const to = "0x784e0c78a38db6a192fa43eaa2631d8e40b22a5e";
    const id = "686819437023061324518356517447903753229147712094";
    const amount = ethers.parseEther("1"); // 1 token (in wei)
    const data = "0x";

    // Read private key from environment variable
    const privateKey = process.env.PRIVATE_KEY;
    if (!privateKey) {
        throw new Error("PRIVATE_KEY is not set in the environment variables");
    }

    // Connect to Ethereum network (e.g., Infura or Alchemy)
    const provider = new ethers.JsonRpcProvider("https://rpc.aboutcircles.com ");
    const wallet = new ethers.Wallet(privateKey, provider);

    // Connect to the contract
    const contract = new ethers.Contract(contractAddress, abi, wallet);

    // Call the safeTransferFrom function
    try {
        const tx = await contract.safeTransferFrom(from, to, id, amount, data);
        console.log("Transaction sent:", tx.hash);

        // Wait for the transaction to be mined
        const receipt = await tx.wait();
        console.log("Transaction receipt:", receipt); // Log the entire receipt

        if (receipt && receipt.hash) { // Use `hash` instead of `transactionHash`
            console.log("Transaction mined:", receipt.hash);
        } else {
            console.log("Transaction mined, but no hash found in receipt.");
        }
    } catch (error) {
        console.error("Error:", error);
    }
}

main().catch((error) => {
    console.error("Script failed:", error);
    process.exit(1);
});