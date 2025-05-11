import { ethers } from "ethers";

async function main() {
    // Contract addresses and ABIs
    const animalHealthAddress = "0x9Fe8bf017C062CAe35638c67EB985Ce216753403"; // AnimalHealth contract (localnet)
    const tokenContractAddress = "0x3D61f0A272eC69d65F5CFF097212079aaFDe8267"; // Token contract (public RPC)

    const animalHealthAbi = [
        "function getRewardAddresses() external view returns (address[])",
        "function removeRewardAddress(address addr) external",
    ];

    const tokenAbi = [
        "function safeTransferFrom(address from, address to, uint256 id, uint256 amount, bytes data) external",
    ];

    // Input parameters for the token transfer
    const from = "0xd00bcA46fc35DEC572fa7a56E2DB16C618878629";
    const id = "686819437023061324518356517447903753229147712094";
    const amount = ethers.parseEther("1"); // 1 token (in wei)
    const data = "0x";

    // Read private key from environment variable
    const privateKey = process.env.PRIVATE_KEY;
    if (!privateKey) {
        throw new Error("PRIVATE_KEY is not set in the environment variables");
    }

    // Connect to the Sapphire localnet for AnimalHealth contract
    const localProvider = new ethers.JsonRpcProvider("https://testnet.sapphire.oasis.io");
    const localWallet = new ethers.Wallet(privateKey, localProvider);
    const animalHealthContract = new ethers.Contract(animalHealthAddress, animalHealthAbi, localWallet);

    // Connect to the public RPC for the token contract
    const publicProvider = new ethers.JsonRpcProvider("https://rpc.aboutcircles.com");
    const publicWallet = new ethers.Wallet(privateKey, publicProvider);
    const tokenContract = new ethers.Contract(tokenContractAddress, tokenAbi, publicWallet);

    // Function to process rewards sequentially
    async function processRewards() {
        try {
            // Fetch reward addresses from the AnimalHealth contract
            const rewardAddresses: string[] = await animalHealthContract.getRewardAddresses();
            console.log("Reward addresses:", rewardAddresses);

            for (const to of rewardAddresses) {
                console.log(`Processing reward for address: ${to}`);

                // Attempt to send the reward
                try {
                    const tx = await tokenContract.safeTransferFrom(from, to, id, amount, data);
                    console.log(`Transaction sent to ${to}:`, tx.hash);

                    // Wait for the transaction to be mined
                    const receipt = await tx.wait();
                    console.log(`Transaction mined for ${to}:`, receipt.transactionHash);
                } catch (transferError) {
                    console.error(`Failed to send reward to ${to}:`, transferError);
                }

                // Attempt to remove the address from the reward list
                try {
                    console.log(`Attempting to remove address ${to} from reward list...`);
                    const removeTx = await animalHealthContract.removeRewardAddress(to);
                    console.log(`Remove transaction sent for ${to}:`, removeTx.hash);

                    // Wait for the removal transaction to be mined
                    const removeReceipt = await removeTx.wait();
                    console.log(`Address removed from reward list: ${to}`);
                } catch (removeError) {
                    console.error(`Failed to remove address ${to} from reward list:`, removeError);
                }
            }
        } catch (error) {
            console.error("Error processing rewards:", error);
        }
    }

    // Run the processRewards function every 20 seconds
    setInterval(async () => {
        console.log("Checking for reward addresses...");
        await processRewards();
    }, 20000); // 20 seconds
}

main().catch((error) => {
    console.error("Script failed:", error);
    process.exit(1);
});