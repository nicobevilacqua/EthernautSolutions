import '@nomicfoundation/hardhat-toolbox';
import { config } from 'dotenv';
config();

import '@nomiclabs/hardhat-etherscan';
import 'hardhat-gas-reporter';
import 'solidity-coverage';
import 'hardhat-watcher';
import path from 'path';

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
export default {
  solidity: {
    compilers: [
      {
        version: '0.6.6',
      },
      {
        version: '0.5.0',
      },
      {
        version: '0.8.4',
        settings: {
          optimizer: {
            enabled: !!process.env.OPTIMIZER_ENABLED,
            runs: 1000,
          },
        },
      },
    ],
  },

  networks: {
    /*
    hardhat: {
      initialBaseFeePerGas: 0, // workaround from https://github.com/sc-forks/solidity-coverage/issues/652#issuecomment-896330136 . Remove when that issue is closed.
      forking: {
        enabled: !!process.env.USE_FORK,
        url: process.env.RPC_MAINNET,
        blockNumber: 13698020,
      },
    },
    */

    rinkeby: {
      url: process.env.RPC_RINKEBY || '',
      accounts:
        process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [],
    },

    goerli: {
      url: process.env.RPC_GOERLI || '',
      accounts:
        process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [],
    },

    ropsten: {
      url: process.env.RPC_ROPSTEN || '',
      accounts:
        process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [],
    },
  },

  gasReporter: {
    enabled: process.env.REPORT_GAS !== undefined,
    gasPrice: process.env.GAS_PRICE,
    coinmarketcap: process.env.CMC_KEY,
    currency: 'USD',
    outputFile: process.env.TO_FILE
      ? path.resolve(__dirname, 'gasReporterOutput.json')
      : undefined,
  },

  watcher: {
    compile: {
      tasks: ['compile'],
      files: ['./contracts'],
      verbose: true,
    },

    test: {
      tasks: [{ command: 'test', params: { testFiles: ['{path}'] } }],
      files: ['./test/**/*'],
      verbose: true,
    },
  },

  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY,
  },
};
