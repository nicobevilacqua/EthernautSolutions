import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { expect } from 'chai';
import { Contract, utils } from 'ethers';
import { ethers } from 'hardhat';

const { provider } = ethers;

describe('Elevator', () => {
  let owner: SignerWithAddress;
  let user1: SignerWithAddress;
  let user2: SignerWithAddress;
  let attacker: SignerWithAddress;
  let contract: Contract;
  before(async () => {
    [owner, user1, user2, attacker] = await ethers.getSigners();

    const Factory = await ethers.getContractFactory('GatekeeperTwo');
    contract = await Factory.deploy();
    await contract.deployed();
  });

  it('attack', async () => {
    const AttackerFactory = await ethers.getContractFactory('GatekeeperTwoAttacker');
    const attackerContract = await AttackerFactory.connect(attacker).deploy(contract.address);
    await attackerContract.deployed();

    expect(await contract.entrant()).to.equal(attacker.address);
  });
});
