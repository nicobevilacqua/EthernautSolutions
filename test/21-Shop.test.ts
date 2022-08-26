import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { expect } from 'chai';
import { Contract } from 'ethers';
import { ethers } from 'hardhat';

describe('Shop', () => {
  let owner: SignerWithAddress;
  let user1: SignerWithAddress;
  let user2: SignerWithAddress;
  let attacker: SignerWithAddress;
  let contract: Contract;
  before(async () => {
    [owner, user1, user2, attacker] = await ethers.getSigners();

    const Factory = await ethers.getContractFactory('Shop');
    contract = await Factory.connect(owner).deploy();
    await contract.deployed();
  });

  it('attack', async () => {
    const AttackerFactory = await ethers.getContractFactory('ShopAttacker');
    const attackerContract = await AttackerFactory.connect(attacker).deploy(contract.address);
    await attackerContract.deployed();

    const tx = await attackerContract.attack();
    await tx.wait();

    expect(await contract.isSold()).to.be.true;
    expect(await contract.price()).to.equal(0);
  });
});
