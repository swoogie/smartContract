# Smart Contract

## Tasks

1. Describe the logic of the smart contract business model that the smart contract will implement
2. Implement the business logic described in the first step as a smart contract in Solidity language
3. Test the smart contract on the Ethereum LAN and the Ethereum test network
4. Review the performance of the smart contract using the Ethereum test network Etherscan "logs"
5. Create a decentralized Front-End application (website or mobile application) that enables communication with the smart contract
---
### Contract hosting

`remix.ethereum.org` was used to access the Smart Contract 

---
### Testing

Local testing was made using `Ganache`
Testing on an Ethereum Test Network was not feasible due to difficulties in procuring test Ether

---
### Front-end

Made with JavaScript and `Web3.js`

---
### Contract details

3 Addresses used - one for Owner(Seller), Buyer, and Courier.


> Their roles:


Buyer - Submits the order and pays for it


Owner - Sets order and delivery prices


Courier - Completes the order


> Additional functions:


All roles can access functions Check on Order and Check Invoice at any moment throughout the process




