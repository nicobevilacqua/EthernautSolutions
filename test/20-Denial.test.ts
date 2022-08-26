import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { expect } from 'chai';
import { Contract } from 'ethers';
import { ethers } from 'hardhat';

const { provider, utils } = ethers;

describe('Denial', () => {
  let owner: SignerWithAddress;
  let user1: SignerWithAddress;
  let user2: SignerWithAddress;
  let attacker: SignerWithAddress;
  let contract: Contract;
  before(async () => {
    [owner, user1, user2, attacker] = await ethers.getSigners();

    const Factory = await ethers.getContractFactory('Denial');
    contract = await Factory.connect(owner).deploy();
    await contract.deployed();

    let tx = await owner.sendTransaction({
      to: contract.address,
      value: utils.parseEther('100'),
    });
    await tx.wait();

    // let tx = await contract.setWithdrawPartner(attacker.address);
    // await tx.wait();

    // tx = await contract.withdraw();
    // await tx.wait();
  });

  it('attack', async () => {
    expect(true).to.equal(false);
  });
});
