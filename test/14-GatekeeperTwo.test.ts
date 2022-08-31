import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { expect } from 'chai';
import { Contract } from 'ethers';
import { ethers } from 'hardhat';

describe('Gatekeeper', () => {
  let owner: SignerWithAddress;
  let attacker: SignerWithAddress;
  let contract: Contract;
  before(async () => {
    [owner, attacker] = await ethers.getSigners();

    const Factory = await ethers.getContractFactory('GatekeeperTwo');
    contract = await Factory.deploy();
    await contract.deployed();
  });

  it('attack', async () => {
    const AttackerFactory = await ethers.getContractFactory(
      'GatekeeperTwoAttacker'
    );
    const attackerContract = await AttackerFactory.connect(attacker).deploy(
      contract.address
    );
    await attackerContract.deployed();

    expect(await contract.entrant()).to.equal(attacker.address);
  });
});
