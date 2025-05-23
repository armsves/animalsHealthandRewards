// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {SiweAuth} from "@oasisprotocol/sapphire-contracts/contracts/auth/SiweAuth.sol";

contract AnimalHealth is SiweAuth {
    struct Animal {
        string name;
        string image;
        uint256 age;
        string[] healthRecords;
    }

    // storage
    mapping(uint256 => Animal) private _animals;
    mapping(uint256 => address) public ownerOf;
    mapping(address => uint256[]) private _ownedAnimals;
    uint256 private _nextId;

    // New storage for reward addresses
    address[] private rewardAddresses;
    mapping(address => bool) private hasReceivedReward;

    constructor(string memory domain) SiweAuth(domain) {}

    /// @dev ensure caller (tx or SIWE) is owner of this animal
    modifier onlyOwner(uint256 animalId, bytes memory authToken) {
        address owner = ownerOf[animalId];
        if (msg.sender != owner && authMsgSender(authToken) != owner) {
            revert("Not Authorized");
        }
        _;
    }

    /// @notice create a new animal record
    function createAnimal(
        string calldata name,
        string calldata image,
        uint256 age
    ) external returns (uint256) {
        uint256 id = _nextId++;
        _animals[id].name = name;
        _animals[id].image = image;
        _animals[id].age = age;
        ownerOf[id] = msg.sender;

        // Add to owner's collection
        _ownedAnimals[msg.sender].push(id);

        return id;
    }

    /// @notice Add an address to the reward list
    /// @param addr The address to add to the reward list
    function addRewardAddress(address addr) external {
        require(!hasReceivedReward[addr], "Address already added to reward list");

        rewardAddresses.push(addr);
        hasReceivedReward[addr] = true;
    }

    /// @notice append a new health record
    function addHealthRecord(
        uint256 animalId,
        string calldata record,
        bytes memory authToken
    ) external onlyOwner(animalId, authToken) {
        _animals[animalId].healthRecords.push(record);
    }

    /// @notice read full animal info (private)
    function getAnimal(
        uint256 animalId,
        bytes memory authToken
    )
        external
        view
        onlyOwner(animalId, authToken)
        returns (
            string memory name,
            string memory image,
            uint256 age,
            string[] memory healthRecords
        )
    {
        Animal storage a = _animals[animalId];
        return (a.name, a.image, a.age, a.healthRecords);
    }

    /// @notice Get all animals owned by the caller or by the provided authentication token
    /// @param authToken Optional authentication token for SIWE
    /// @return Array of animal IDs owned by the caller
    function getMyAnimals(bytes memory authToken) external view returns (uint256[] memory) {
        address owner = authToken.length > 0 ? authMsgSender(authToken) : msg.sender;
        return _ownedAnimals[owner];
    }

    /// @notice Get the list of reward addresses
    /// @return Array of addresses eligible for rewards
    function getRewardAddresses() external view returns (address[] memory) {
        return rewardAddresses;
    }

    /// @notice Remove an address from the reward list after processing
    /// @param addr The address to remove
    function removeRewardAddress(address addr) external {
        require(hasReceivedReward[addr], "Address not in reward list");

        // Find and remove the address from the array
        for (uint256 i = 0; i < rewardAddresses.length; i++) {
            if (rewardAddresses[i] == addr) {
                rewardAddresses[i] = rewardAddresses[rewardAddresses.length - 1];
                rewardAddresses.pop();
                break;
            }
        }

        // Mark the address as no longer eligible for rewards
        hasReceivedReward[addr] = false;
    }
}