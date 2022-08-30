import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { expect } from 'chai';
import { Contract } from 'ethers';
import { ethers } from 'hardhat';

const { provider, utils } = ethers;

describe('Dex', () => {
  let owner: SignerWithAddress;
  let user1: SignerWithAddress;
  let user2: SignerWithAddress;
  let attacker: SignerWithAddress;
  let token1: Contract;
  let token2: Contract;
  let dex: Contract;
  before(async () => {
    [owner, user1, user2, attacker] = await ethers.getSigners();

    // Create Dex
    const [TokenFactory, DexFactory] = await Promise.all([
      ethers.getContractFactory('SwappableToken'),
      ethers.getContractFactory('Dex'),
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

    // Send 10 tokens to attacker
    const [tx1, tx2] = await Promise.all([
      token1.connect(owner).transfer(attacker.address, utils.parseEther('10')),
      token2.connect(owner).transfer(attacker.address, utils.parseEther('10')),
    ]);

    await Promise.all([tx1.wait(), tx2.wait()]);
  });

  function connectedDex() {
    return dex.connect(attacker);
  }

  it('attack', async () => {
    let tx;
    tx = await connectedDex().approve(dex.address, utils.parseEther('10'));
    await tx.wait();

    tx = await connectedDex().swap(
      token2.address,
      token1.address,
      utils.parseEther('10')
    );
    tx.wait();

    console.log(utils.formatEther(await token1.balanceOf(attacker.address)));
    console.log(utils.formatEther(await token2.balanceOf(attacker.address)));

    expect(true).to.equal(false);
  });
});
