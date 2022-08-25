import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { expect } from 'chai';
import { Contract } from 'ethers';
import { ethers } from 'hardhat';

const { provider } = ethers;

describe('Force', () => {
  let owner: SignerWithAddress;
  let attacker: SignerWithAddress;
  let contract: Contract;
  before(async () => {
    const Factory = await ethers.getContractFactory('Force');
    contract = await Factory.deploy();
    await contract.deployed();

    [owner, attacker] = await ethers.getSigners();
  });

  it('attack', async () => {
    const AttackFactory = await ethers.getContractFactory('Kamikaze');
    const attackerContract = await AttackFactory.connect(attacker).deploy(contract.address, {
      value: 1,
    });
    await attackerContract.deployed();

    let tx = await attackerContract.seppuku();
    await tx.wait();

    const balance = await provider.getBalance(contract.address);
    expect(balance.gt(0)).to.equal(true);
  });
});
