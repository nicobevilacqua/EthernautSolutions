import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { expect } from 'chai';
import { Contract } from 'ethers';
import { ethers } from 'hardhat';

const { provider, utils } = ethers;

describe('GoodSamaritan', () => {
  let attacker: SignerWithAddress;
  let owner: SignerWithAddress;
  let coin: Contract;
  let wallet: Contract;
  let target: Contract;
  before(async () => {
    [attacker, owner] = await ethers.getSigners();
    const TargetFactory = await ethers.getContractFactory('GoodSamaritan');
    target = await TargetFactory.connect(owner).deploy();
    await target.deployed();
  });

  it('attack', async () => {
    const [CoinFactory, WalletFactory, GoodSamaritanAttackerFactory] =
      await Promise.all([
        ethers.getContractFactory('Coin'),
        ethers.getContractFactory('Wallet'),
        ethers.getContractFactory('GoodSamaritanAttacker'),
      ]);

    const walletAddress = await target.wallet();
    const coinAddress = await target.coin();

    coin = CoinFactory.attach(coinAddress);
    wallet = WalletFactory.attach(walletAddress);

    const attackerContract = await GoodSamaritanAttackerFactory.deploy(
      target.address
    );
    await attackerContract.deployed();

    const tx = await attackerContract.attack();
    await tx.wait();

    const walletBalance = await coin.balances(walletAddress);
    console.log(walletBalance);
    expect(walletBalance.toNumber()).to.equal(0);
  });
});
