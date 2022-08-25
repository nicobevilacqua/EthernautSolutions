import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { expect } from 'chai';
import { Contract } from 'ethers';
import { ethers } from 'hardhat';

describe('Elevator', () => {
  let owner: SignerWithAddress;
  let user1: SignerWithAddress;
  let user2: SignerWithAddress;
  let attacker: SignerWithAddress;
  let contract: Contract;
  before(async () => {
    [owner, user1, user2, attacker] = await ethers.getSigners();

    const Factory = await ethers.getContractFactory('Elevator');
    contract = await Factory.deploy();
    await contract.deployed();
  });

  it('attack', async () => {
    const AttackerFactory = await ethers.getContractFactory('ElevatorAttacker');
    const attackerContract = await AttackerFactory.deploy(contract.address);

    const tx = await attackerContract.attack();
    await tx.wait();

    expect(await contract.top()).to.equal(true);
  });
});
