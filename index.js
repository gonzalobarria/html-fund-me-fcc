import { ethers } from './ethers-5.6.esm.min.js';
import { abi, contractAddress } from './constants.js';

const connectButton = document.getElementById('connectButton');
const fundButton = document.getElementById('fundButton');
const balanceButton = document.getElementById('balanceButton');
const withdrawButton = document.getElementById('withdrawButton');

connectButton.onclick = conecta;
fundButton.onclick = fund;
balanceButton.onclick = getBalance;
withdrawButton.onclick = withdraw;

async function conecta() {
  if (typeof window.ethereum !== 'undefined') {
    console.log('jjj');
    console.log('isMetaMask', window.ethereum.isMetaMask);
    await window.ethereum.request({ method: 'eth_requestAccounts' });
    connectButton.innerHTML = 'Conectado';
  } else console.log('no meta');
}

async function fund() {
  const ethAmount = '0.1';
  console.log(`Funding with ${ethAmount}...`);
  // para hacer el funding se necesita
  // provider / conección al blockchain
  // signer / wallet
  // contract - para lo que se necesita el ABI & Address

  if (typeof window.ethereum !== 'undefined') {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner(); // esta es la cuenta que está conectada al front-end

    const contract = new ethers.Contract(contractAddress, abi, signer);

    // ahora se puede comenzar a hacer transacciones como se hace en el backend

    try {
      const transactionResponse = await contract.fund({
        value: ethers.utils.parseEther(ethAmount),
      });

      await listenForTransactionMine(transactionResponse, provider);
      console.log('Done!');
    } catch (error) {
      console.log('error', error);
    }
  }
}

function listenForTransactionMine(transactionResponse, provider) {
  console.log(`Mining ${transactionResponse.hash}`);

  return new Promise((resolve, reject) => {
    provider.once(transactionResponse.hash, (transactionReceipt) => {
      console.log(
        `Completed with ${transactionReceipt.confirmations} confirmations`
      );
      resolve();
    });
  });
}

async function getBalance() {
  if (typeof window.ethereum !== 'undefined') {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const balance = await provider.getBalance(contractAddress);

    console.log(`Balance: ${ethers.utils.formatEther(balance)}`);
  }
}

async function withdraw() {
  if (typeof window.ethereum !== 'undefined') {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner(); // esta es la cuenta que está conectada al front-end

    const contract = new ethers.Contract(contractAddress, abi, signer);
    const transactionResponse = await contract.withdraw();

    await listenForTransactionMine(transactionResponse, provider);
  }
}
