const hre = require("hardhat");

async function main() {
  const NgoManagement = await hre.ethers.getContractFactory("NgoManagement");
  const ngoManagement = await NgoManagement.deploy();

  await ngoManagement.waitForDeployment();

  const contractAddress = await ngoManagement.getAddress();
  console.log(`NgoManagement deployed successfully to: ${contractAddress}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});