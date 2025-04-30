import hre from "hardhat";

/**
 * Increases the blockchain time by the specified number of seconds
 * @param seconds Number of seconds to increase time by
 */
export async function increaseTime(seconds: bigint): Promise<void> {
  await hre.network.provider.send("evm_increaseTime", [seconds]);
  await hre.network.provider.send("evm_mine", []);
}

/**
 * Gets the current block timestamp
 * @returns Current block timestamp
 */
export async function getCurrentTime(): Promise<bigint> {
  const blockNumber = await hre.network.provider.send("eth_blockNumber", []);
  const block = await hre.network.provider.send("eth_getBlockByNumber", [blockNumber, false]);
  return BigInt(block.timestamp);
}

/**
 * Sets the blockchain time to a specific timestamp
 * @param timestamp The timestamp to set
 */
export async function setTime(timestamp: bigint): Promise<void> {
  await hre.network.provider.send("evm_setNextBlockTimestamp", [timestamp]);
  await hre.network.provider.send("evm_mine", []);
}

/**
 * Mines a new block
 */
export async function mineBlock(): Promise<void> {
  await hre.network.provider.send("evm_mine", []);
}

/**
 * Mines multiple blocks
 * @param count Number of blocks to mine
 */
export async function mineBlocks(count: number): Promise<void> {
  for (let i = 0; i < count; i++) {
    await mineBlock();
  }
}

/**
 * Advances time and mines a new block
 * @param time Time to advance in seconds
 */
export async function advanceTimeAndBlock(time: bigint): Promise<void> {
  await increaseTime(time);
  await mineBlock();
}