const BizainFingate = require("../lib").default;
const chai = require("chai");
const expect = chai.expect;
const sinon = require("sinon");
const Transaction = require("jcc_jingtum_lib").Transaction;
const Request = require("jcc_jingtum_lib").Request;
const sandbox = sinon.createSandbox();

const testAddress = "bMAy4Pu8CSf5apR44HbYyLFKeC9Dbau16Q";
const testSecret = "ssySqG4BhxpngV2FjAe1SJYFD4dcm";
const testServer = "wss://test.net";
const testDestination = "bwtC9ARd3wo7Kx3gKQ49uVgcKxoAiV1iM2";

describe("test bizain fingate", function() {
  describe('test constructor', function() {
    it("create successfully", function() {
      let inst = new BizainFingate(testServer);
      expect(inst._server).to.equal(testServer);
    });
  })

  describe('test setter and getter', function() {
    let inst;
    before(() => {
      inst = new BizainFingate(testServer);
    })
    it('test property', function() {
      expect(BizainFingate._token).to.equal("bwt");
      expect(inst._localSign).to.equal(true);
      expect(inst._currency).to.equal("BIZ");
      expect(inst._fee).to.equal(10);
      expect(inst._issuer).to.equal("bf42S78serP2BeSx7HGtwQR2QASYaHVqyb");
      inst.currency = "bwt";
      inst.fee = 100;
      inst.localSign = false;
      expect(inst._localSign).to.equal(false);
      expect(inst._currency).to.equal("bwt");
      expect(inst._fee).to.equal(100);
    })
  })

  describe('test isValidAddress', function() {

    it('return true if the bizain address is valid', function() {
      let valid = BizainFingate.isValidAddress(testAddress);
      expect(valid).to.equal(true);
    })

    it('return false if the bizain address is invalid', function() {
      let valid = BizainFingate.isValidAddress(null);
      expect(valid).to.equal(false);
    })
  })

  describe('test isValidSecret', function() {

    it('return true if the bizain secret is valid', function() {
      let valid = BizainFingate.isValidSecret(testSecret);
      expect(valid).to.equal(true);
    })

    it('return false if the bizain secret is invalid', function() {
      let valid = BizainFingate.isValidSecret(null);
      expect(valid).to.equal(false);
    })
  })

  describe('test getAddress', function() {

    it('return right address if the bizain secret is valid', function() {
      let address = BizainFingate.getAddress(testSecret);
      expect(address).to.equal(testAddress);
    })

    it('return null if the bizain secret is invalid', function() {
      let address = BizainFingate.getAddress(testSecret.substring(1));
      expect(address).to.equal(null);
    })
  })

  describe('test init', function() {
    it("create instance correctly", function() {
      let inst = new BizainFingate(testServer);
      expect(inst.init() instanceof BizainFingate).to.true;
      expect(inst.remote._local_sign).to.true;
      expect(inst.remote._token).to.equal("bwt");
      expect(inst.remote._url).to.equal(testServer);
    });
  })

  describe("test connect", function() {
    it("should call once", async function() {
      let inst = new BizainFingate(testServer);
      inst.init();
      let spy = sandbox.stub(inst.remote, "connect");
      spy.yields(null);
      await inst.connect();
      expect(spy.calledOnce).to.true;
    })

    it("connect error", function(done) {
      let inst = new BizainFingate(testServer);
      inst.init();
      let spy = sandbox.stub(inst.remote, "connect");
      spy.yields(new Error("connect error"));
      inst.connect().catch(error => {
        expect(error.message).to.equal("connect error");
        done()
      });
    })
  })

  describe("test disconnect", function() {
    it("should call once", function() {
      let inst = new BizainFingate(testServer);
      inst.init();
      let spy = sandbox.stub(inst.remote, "disconnect");
      inst.disconnect();
      expect(spy.calledOnce).to.true;
    });
  });

  describe("test disconnect", function() {

    let inst;

    before(() => {
      inst = new BizainFingate(testServer);
      inst.init();
      inst.connect();
    })

    after(() => {
      inst.disconnect();
    })

    afterEach(() => {
      sandbox.restore();
    })

    it("resolve string number if request success", async function() {
      let spy = sandbox.spy(inst.remote, "requestAccountRelations");
      let stub = sandbox.stub(Request.prototype, "submit");
      stub.yields(null, {
        lines: [{
          currency: "BIZ",
          balance: "10.01"
        }]
      })
      const balance = await inst.balanceOf(testAddress);
      expect(spy.calledOnceWith({
        account: testAddress,
        type: "trust"
      })).to.true;
      expect(balance).to.equal("10.01");
    });

    it("resolve 0 if request currency is not exist", async function() {
      inst.currency = "BWT";
      let stub = sandbox.stub(Request.prototype, "submit");
      stub.yields(null, {
        lines: [{
          currency: "BIZ",
          balance: "10.01"
        }]
      })
      const balance = await inst.balanceOf(testAddress);
      expect(balance).to.equal("0");
    });

    it("reject error if request failed", function(done) {
      let stub = sandbox.stub(Request.prototype, "submit");
      stub.yields(new Error("connect error"), null);
      inst.balanceOf(testAddress).catch((error) => {
        expect(error.message).to.equal("connect error");
        done()
      });
    });
  });

  describe("test transfer", function() {
    let inst;
    before(() => {
      inst = new BizainFingate(testServer);
      inst.init();
    })
    it("throw error if the secret is invalid", function() {
      expect(() => inst.transfer("111", "111", 1, {
        jtaddress: "111"
      })).throws("111 is invalid bizain secret.")
    })

    it("throw error if the destination is invalid", function() {
      expect(() => inst.transfer(testSecret, "111", 1, {
        jtaddress: "111"
      })).throws("111 is invalid bizain address.")
    })

    it("throw error if the amount is invalid", function() {
      expect(() => inst.transfer(testSecret, testAddress, 0, {
        jtaddress: "111"
      })).throws("0 is invalid amount.")
    })

    it("throw error if the memo is invalid", function() {
      expect(() => inst.transfer(testSecret, testAddress, 1, {
        jtaddress: "111"
      })).throws("111 is invalid jingtum address in memo.")
    })

    it("throw error if transfer failed", function(done) {
      inst.currency = "BIZ";
      let spy = sandbox.stub(inst.remote, "connect");
      spy.yields(null);

      let stub = sandbox.stub(Transaction.prototype, "submit");
      stub.yields(new Error("connect error"), null);
      inst.connect().then(() => {
        inst.transfer(testSecret, testDestination, 0.1, {
          jtaddress: "jpgWGpfHz8GxqUjz5nb6ej8eZJQtiF6KhH"
        }).catch(error => {
          stub.restore();
          expect(error.message).to.equal("connect error");
          done();
          sandbox.restore();
        });
      })
    })

    it("transfer success", function(done) {
      let spy = sandbox.stub(inst.remote, "connect");
      spy.yields(null);
      let stub = sandbox.stub(Transaction.prototype, "submit");
      stub.yields(null, {
        engine_result: "tesSUCCESS",
        tx_json: {
          hash: "123456"
        }
      });
      let s = sandbox.stub(Transaction.prototype, "setSecret");
      let s1 = sandbox.spy(inst.remote, "buildPaymentTx");
      let s2 = sandbox.stub(Transaction.prototype, "setTransferRate");
      let s3 = sandbox.spy(Transaction.prototype, "addMemo");
      inst.connect().then(() => {
        inst.transfer(testSecret, testDestination, 0.1, {
          jtaddress: "jpgWGpfHz8GxqUjz5nb6ej8eZJQtiF6KhH"
        }).then(hash => {
          let args = s.getCall(0).args;
          let args1 = s1.getCall(0).args;
          let args2 = s3.getCall(0).args;
          expect(args[0]).to.equal(testSecret);
          expect(args1[0]).to.deep.equal({
            account: testAddress,
            to: testDestination,
            amount: {
              currency: "BIZ",
              issuer: "bf42S78serP2BeSx7HGtwQR2QASYaHVqyb",
              value: 0.1
            }
          });
          expect(s2.getCall(0).args[0]).to.equal(10);
          expect(args2[0]).to.equal('{"jtaddress":"jpgWGpfHz8GxqUjz5nb6ej8eZJQtiF6KhH"}');
          expect(hash).to.equal("123456");
          done();
          sandbox.restore();
        });
      })
    })

    it("transfer fail", function(done) {
      let spy = sandbox.stub(inst.remote, "connect");
      spy.yields(null);
      let stub = sandbox.stub(Transaction.prototype, "submit");
      stub.yields(null, {
        engine_result: "tecUNFUNDED_PAYMENT",
        engine_result_message: 'Insufficient STM balance to send.'
      });
      let s = sandbox.stub(Transaction.prototype, "setSecret");
      let s1 = sandbox.spy(inst.remote, "buildPaymentTx");
      let s2 = sandbox.stub(Transaction.prototype, "setTransferRate");
      let s3 = sandbox.spy(Transaction.prototype, "addMemo");
      inst.connect().then(() => {
        inst.transfer(testSecret, testDestination, 0.1, {
          jtaddress: "jpgWGpfHz8GxqUjz5nb6ej8eZJQtiF6KhH"
        }).catch(error => {
          expect(error.message).to.equal("Insufficient STM balance to send.")
          done();
          sandbox.restore();
        });
      })
    })
  })
})