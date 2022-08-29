import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { expect } from 'chai';
import { Contract } from 'ethers';
import { ethers } from 'hardhat';

const { provider, utils } = ethers;

describe('Telephone', () => {
  let owner: SignerWithAddress;
  let user1: SignerWithAddress;
  let user2: SignerWithAddress;
  let attacker: SignerWithAddress;
  let contract: Contract;
  before(async () => {
    [owner, user1, user2, attacker] = await ethers.getSigners();
    const Factory = await ethers.getContractFactory('Telephone');
    contract = await Factory.deploy();
    await contract.deployed();
  });

  it('attack', async () => {
    const AttackerFactory = await ethers.getContractFactory(
      'TelephoneAttacker'
    );
    const attackerContract = await AttackerFactory.connect(attacker).deploy(
      contract.address
    );
    await attackerContract.deployed();

    const tx = await attackerContract.connect(attacker).attack();
    await tx.wait();

    expect(await contract.owner()).to.equal(attacker.address);
  });
});
