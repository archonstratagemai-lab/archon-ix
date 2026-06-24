import { ethers } from "hardhat";
import "dotenv/config";

/**
 * Deploy the ArchonMembership NFT to the selected network and output the address
 * in a format that can be pasted directly into `.env` as
 * `VITE_ALCHEMY_CONTRACT_ADDRESS=0x...`.
 */
async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying ArchonMembership with account", deployer.address);

  const Membership = await ethers.getContractFactory("ArchonMembership");
  const membership = await Membership.deploy();
  await membership.waitForDeployment();

  const address = await membership.getAddress();
  console.log(`\nVITE_ALCHEMY_CONTRACT_ADDRESS=${address}\n`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
