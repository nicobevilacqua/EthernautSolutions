import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { expect } from 'chai';
import { Contract } from 'ethers';
import { ethers } from 'hardhat';

const { utils } = ethers;

describe('DoubleEntryPoint', () => {
  let owner: SignerWithAddress;
  let attacker: SignerWithAddress;
  let forta: Contract;
  let cryptoVault: Contract;
  let legacyToken: Contract;
  let doubleEntryPoint: Contract;
  before(async () => {
    [owner, attacker] = await ethers.getSigners();

    const [
      FortaFactory,
      LegacyTokenFactory,
      CryptoVaultFactory,
      DoubleEntryPointFactory,
    ] = await Promise.all([
      ethers.getContractFactory('Forta'),
      ethers.getContractFactory('LegacyToken'),
      ethers.getContractFactory('CryptoVault'),
      ethers.getContractFactory('DoubleEntryPoint'),
    ]);

    forta = await FortaFactory.deploy();
    await forta.deployed();

    cryptoVault = await CryptoVaultFactory.deploy(owner.address);
    await cryptoVault.deployed();

    legacyToken = await LegacyTokenFactory.deploy();
    await legacyToken.deployed();

    let tx = await legacyToken.mint(
      cryptoVault.address,
      utils.parseEther('100')
    );
    await tx.wait();

    doubleEntryPoint = await DoubleEntryPointFactory.deploy(
      legacyToken.address,
      cryptoVault.address,
      forta.address,
      attacker.address
    );
    await doubleEntryPoint.deployed();

    tx = await cryptoVault.setUnderlying(doubleEntryPoint.address);
    await tx.wait();

    tx = await legacyToken.delegateToNewContract(doubleEntryPoint.address);
    await tx.wait();
  });

  it('attack', async () => {
    let tx;

    const DoubleEntryPointBotFactory = await ethers.getContractFactory(
      'DoubleEntryPointBot'
    );
    const detectionBot = await DoubleEntryPointBotFactory.connect(
      attacker
    ).deploy(forta.address);
    await detectionBot.deployed();

    tx = await forta.connect(attacker).setDetectionBot(detectionBot.address);
    await tx.wait();

    try {
      tx = await cryptoVault.sweepToken(legacyToken.address);
      await tx.wait();
    } catch (err: any) {
      expect(err.message).to.include('Alert has been triggered, reverting');
    }

    const cryptoVaultDoubleEntryPointBalance = await doubleEntryPoint.balanceOf(
      cryptoVault.address
    );
    expect(cryptoVaultDoubleEntryPointBalance).to.not.equal(0);
  });
});
