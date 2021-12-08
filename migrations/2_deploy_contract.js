var ChoresList = artifacts.require("./ChoresList.sol");

module.exports = function (deployer) {
  deployer.deploy(ChoresList);
};
