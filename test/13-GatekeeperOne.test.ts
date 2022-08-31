import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { expect } from 'chai';
import { Contract } from 'ethers';
import { ethers } from 'hardhat';

describe('GatekeeperOne', () => {
  let owner: SignerWithAddress;
  let attacker: SignerWithAddress;
  let contract: Contract;
  before(async () => {
    [owner, attacker] = await ethers.getSigners();

    const Factory = await ethers.getContractFactory('GatekeeperOne');
    contract = await Factory.connect(owner).deploy();
    await contract.deployed();
  });

  it('attack', async () => {
    const AttackerFactory = await ethers.getContractFactory(
      'GatekeeperOneAttacker'
    );
    const attackerContract = await AttackerFactory.connect(attacker).deploy(
      contract.address
    );

    const tx = await attackerContract.connect(attacker).attack();
    await tx.wait();

    expect(await contract.entrant()).to.equal(attacker.address);
  });
});
