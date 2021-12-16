// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

contract Deal {
  address payable public owner;
  address public buyerAddr;
  address payable public courier;

  constructor(address _buyerAddr, address payable _courier){
    owner = payable(msg.sender);
    buyerAddr = _buyerAddr;
    courier = _courier;
  }

  struct Buyer {
    address addr;
    string name;
    bool init;
  }

  struct Shipment {
    address payer;
    uint price;
    uint safepay;
    uint date;
    uint real_date;
    bool init;
  }

  struct Order {
    string goods;
    uint quantity;
    uint number;
    uint price;
    uint safepay;
    Shipment shipment;
    bool init;
  }

  struct Invoice {
    uint orderno;
    uint number;
    bool init;
  }

  mapping (uint => Order) orders;
  mapping (uint => Invoice) invoices;

  uint public orderIndex;
  uint invoiceIndex;

  event BuyerRegistered(address buyer, string name);

  event OrderSent(address buyer, string goods, uint quantity, uint orderno);

  event PriceSent(address buyer, uint orderno, uint price, int8 ttype);

  event SafepaySent(address buyer, uint orderno, uint value, uint now);

  event InvoiceSent(address buyer, uint invoiceno, uint orderno, uint delivery_date, address courier);

  event OrderDelivered(address buyer, uint invoiceno, uint orderno, uint real_delivey_date, address courier);

  function sendOrder(string memory goods, uint quantity) payable public{
    require(msg.sender == buyerAddr, "only buyers can send orders");

    orderIndex++;

    orders[orderIndex] = Order(goods, quantity, orderIndex, 0, 0, Shipment(address(0), 0, 0, 0, 0, false), true);

    emit OrderSent(msg.sender, goods, quantity, orderIndex);
  }

  function queryOrder(uint number) view public returns (address buyer, string memory goods, uint quantity, uint price, uint safepay, uint delivery_price, uint delivery_safepay) {
    
    require(orders[number].init, "invalid order id");

    return(buyerAddr, orders[number].goods, orders[number].quantity, orders[number].price, orders[number].safepay, orders[number].shipment.price, orders[number].shipment.safepay);
  }

  function returnOwner() view public returns (address payable){
    return owner;
  }

  function getBuyer() view public returns (address){
    return buyerAddr;
  }

  function returnCourier() view public returns (address payable){
    return courier;
  }

  function sendPrice(uint orderno, uint price, int8 ttype) payable public {
  
    require(msg.sender == owner, "only the owner can send prices");

    require(orders[orderno].init, "invalid order id");

    ///  1=order
    ///  2=shipment
    require(ttype == 1 || ttype == 2, "invalid type must be either 1 for order or 2 for shipping");

    if(ttype == 1){
      orders[orderno].price = price;
    } else {
      orders[orderno].shipment.price = price;
      orders[orderno].shipment.init  = true;
    }

    emit PriceSent(buyerAddr, orderno, price, ttype);
  }

  function sendSafepay(uint orderno) payable public {

    require(orders[orderno].init, "invalid order id");

    require(buyerAddr == msg.sender, "must be buyer");

    require((orders[orderno].price + orders[orderno].shipment.price) == msg.value, "msg.value does not match");

    orders[orderno].shipment.safepay = msg.value - orders[orderno].price;
    orders[orderno].safepay = msg.value - orders[orderno].shipment.safepay;

    emit SafepaySent(msg.sender, orderno, msg.value, block.timestamp);
  }

  function sendInvoice(uint orderno, uint delivery_date) payable public {

    require(orders[orderno].init, "invalid order id");

    require(owner == msg.sender, "only the owner can send invoices");

    invoiceIndex++;

    invoices[invoiceIndex] = Invoice(orderno, invoiceIndex, true);

    orders[orderno].shipment.date    = delivery_date;

    emit InvoiceSent(buyerAddr, invoiceIndex, orderno, delivery_date, courier);
  }

  function getInvoice(uint invoiceno) view public returns (address, uint, uint, address payable){
  
    require(invoices[invoiceno].init, "invalid invoice id");

    Invoice storage _invoice = invoices[invoiceno];
    Order storage _order = orders[_invoice.orderno];

    return (buyerAddr, _order.number, _order.shipment.date, courier);
  }

  function delivery(uint invoiceno, uint timestamp) payable public {

    /// require(invoices[invoiceno].init, "invalid invoice id");

    Invoice storage _invoice = invoices[invoiceno];
    Order storage _order     = orders[_invoice.orderno];

    /// require(_order.shipment.courier == msg.sender, "only the courier can finish delivery");

    emit OrderDelivered(buyerAddr, invoiceno, _order.number, timestamp, courier);

    /// Payout
    owner.transfer(_order.safepay);

    courier.transfer(_order.shipment.safepay);

  }
}