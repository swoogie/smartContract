const orderItem = document.getElementById("orderitem");
const orderQuantity = document.getElementById("orderquantity");
const header2 = document.getElementById("contractaddress");
var address = "0x881aaFab46Aa685cC060470eF0136483c9D62D69";

document.addEventListener("DOMContentLoaded", async function (event) {
  web3 = new Web3("HTTP://127.0.0.1:7545");
  contract = new web3.eth.Contract(abi, address);
  await getAccounts();
  await checkIfAddr();
});



document.getElementById("revealcontractaddress").onclick = () => {
  header2.innerText = "Contract address: " + address;
  header2.style = "margin: 0px;";
  document.getElementById("revealcontractaddress").style = "display: none;";
};

// const getowneraddress = document.getElementById("getowneraddress");
// getowneraddress.onclick = async function () {
//   getowneraddress.value = await contract.methods.returnOwner().call();
// };

async function getCourierAddr(){
    const courierAddr = await contract.methods.returnCourier().call();
    return courierAddr;
}

async function getOwnerAddr(){
    const ownerAddr = await contract.methods.returnOwner().call();
    return ownerAddr;
}

const selectedAccount = document.getElementById("selectedAccount");

async function getAccounts() {
  const accounts = await window.ethereum.request({
    method: "eth_requestAccounts",
  });
  const currentAccount = accounts[0];
  const ownerAddr = await getOwnerAddr();
  const courierAddr = await getCourierAddr();

  if (ownerAddr.toLowerCase() == currentAccount) {
    selectedAccount.innerHTML = "Selected account (owner): " + currentAccount;
  } else if(courierAddr.toLowerCase()== currentAccount) {
    selectedAccount.innerHTML = "Selected account (courier): " + currentAccount;
  } else {
    selectedAccount.innerHTML = "Selected account (buyer): " + currentAccount; 
  }
  return currentAccount;
}

const sellerInterface = document.getElementById("sellerInterface");

const buyerInterface = document.getElementById("buyerInterface");

const courierInterface = document.getElementById("courierInterface");

async function checkIfAddr() {
  const curAcc = await getAccounts();
  const ownerAddr = await getOwnerAddr();
  const courierAddr = await getCourierAddr();

  // const buyerAddr = await contract.methods.getBuyer().call();
  
  // console.log(curAcc.;
  // console.log(buyerAddr);
  // console.log(ownerAddr);

  sellerInterface.style = "Display: none;";
  courierInterface.style = "Display: none;";
  buyerInterface.style = "Display: none;";

  if (courierAddr.toLowerCase() == curAcc.toLowerCase()) {
    courierInterface.style = "Display: inherit;";
  } else if (ownerAddr.toLowerCase() == curAcc.toLowerCase()) {
    sellerInterface.style = "Display: inherit;";
  } else {
    buyerInterface.style = "Display: inherit;";
  }
}

const sendOrder = document.getElementById("sendOrder");
const sendPayment = document.getElementById("sendPayment");
const confirmDelivery = document.getElementById("confirmDelivery");
confirmDelivery.onclick = async () => {
  const invoiceIndex = document.getElementById("invoiceIndex");
  const timeStamp = document.getElementById("timeStamp");
  const currentAccount = await getAccounts();

  await contract.methods
    .delivery(invoiceIndex.value, timeStamp.value)
    .send({ from: currentAccount })
    .on("transactionHash", (hash) => {
      alert("a");
    });
};
const orderPrice = document.getElementById("orderPrice");

sendOrder.onclick = async () => {
  const orderItem = document.getElementById("orderitem");
  const orderQuantity = document.getElementById("orderquantity");
  const currentAccount = await getAccounts();
  console.log(currentAccount);
  console.log(orderItem.value);
  console.log(orderQuantity.value);
  await contract.methods
    .sendOrder(orderItem.value, parseInt(orderQuantity.value))
    .send({ from: currentAccount, gas: 1500000, gasPrice: '300' })
    .on("transactionHash", (hash) => {
      //alert("a");
    });  
  var orderIndex = await contract.methods.orderIndex().call(); 
  orderPrice.innerText = "Order no. " + orderIndex + " Price: to be set"
};

sendPayment.onclick = async () => {
  const sendPayment = document.getElementById("sendToOrderId");
};

// checkIfAddr();



window.ethereum.on("accountsChanged", async function (accounts) {
  await getAccounts();
  checkIfAddr();
});

//contract.methods.sendOrder(orderItem.value, orderQuantity.value).send();
