import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { expect } from 'chai';
import { Contract } from 'ethers';
import { ethers } from 'hardhat';

const INIT_OPCODE = '600a600c600039600a6000f3';
const RUNTIME_CODE = '602a60805260206080f3';
const CONTRACT_BYTECODE = `0x${INIT_OPCODE}${RUNTIME_CODE}`;
const ABI = ['function whatIsTheMeaningOfLife() pure returns (uint)'];

describe('MagicNumber', () => {
  let contract: Contract;
  before(async () => {
    const Factory = await ethers.getContractFactory('MagicNum');
    contract = await Factory.deploy();
    await contract.deployed();
  });

  it('attack', async () => {
    const Factory = new ethers.ContractFactory(
      ABI,
      CONTRACT_BYTECODE,
      ethers.provider.getSigner()
    );

    const solutionContract = await Factory.deploy();
    await solutionContract.deployed();

    let tx = await contract.setSolver(solutionContract.address);
    await tx.wait();

    expect(await solutionContract.whatIsTheMeaningOfLife()).to.equal(42);
  });
});
