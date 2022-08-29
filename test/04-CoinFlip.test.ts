import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { expect } from 'chai';
import { Contract } from 'ethers';
import { ethers } from 'hardhat';

const { provider, utils } = ethers;

describe('CoinFlip', () => {
  let owner: SignerWithAddress;
  let user1: SignerWithAddress;
  let user2: SignerWithAddress;
  let attacker: SignerWithAddress;
  let contract: Contract;
  before(async () => {
    [owner, user1, user2, attacker] = await ethers.getSigners();
    const Factory = await ethers.getContractFactory('CoinFlip');
    contract = await Factory.deploy();
    await contract.deployed();
  });

  it('attack', async () => {
    const AttackFactory = await ethers.getContractFactory('CoinFlipAttacker');
    const attackerContract = await AttackFactory.connect(attacker).deploy(
      contract.address
    );
    await attackerContract.deployed();

    for (let i = 0; i < 10; i++) {
      const tx = await attackerContract.connect(attacker).attack();
      await tx.wait();
    }

    expect(await contract.consecutiveWins()).to.equal(10);
  });
});
