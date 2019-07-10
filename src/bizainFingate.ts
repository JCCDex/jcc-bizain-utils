import BigNumber from "bignumber.js";
import { Remote } from "jcc_jingtum_lib";
import * as jtWallet from "jcc_wallet/lib/jingtum";
import IMemo from "./model/memo";
import { isValidAmount, isValidBizainAddress, isValidBizainSecret, isValidMemo, validate } from "./validator";

export default class BizainFingate {

    private static readonly _token = "bwt";

    private _remote: Remote = null;

    private _localSign: boolean = true;

    private _server: string;

    private _fee: number = 10;

    private _currency: string = "BIZ";

    private _issuer: string = "bf42S78serP2BeSx7HGtwQR2QASYaHVqyb";

    constructor(server: string) {
        this._server = server;
    }

    public set localSign(v: boolean) {
        this._localSign = v;
    }

    public set fee(v: number) {
        this._fee = v;
    }

    public set currency(v: string) {
        this._currency = v;
    }

    public get remote(): Remote {
        return this._remote;
    }

    /**
     * validate bizain address is valid or not
     *
     * @static
     * @param {string} address
     * @returns {boolean}
     * @memberof BizainFingate
     */
    public static isValidAddress(address: string): boolean {
        return jtWallet.isValidAddress(address, BizainFingate._token);
    }

    /**
     * validate bizain secret is valid or not
     *
     * @static
     * @param {string} secret
     * @returns {boolean}
     * @memberof BizainFingate
     */
    public static isValidSecret(secret: string): boolean {
        return jtWallet.isValidSecret(secret, BizainFingate._token);
    }

    /**
     * retrive address with secret
     *
     * @static
     * @param {string} secret
     * @returns {(string | null)} return address if secret is valid
     * @memberof BizainFingate
     */
    public static getAddress(secret: string): string | null {
        return jtWallet.getAddress(secret, BizainFingate._token);
    }

    /**
     * init remote instance
     *
     * @returns {BizainFingate}
     * @memberof BizainFingate
     */
    public init(): BizainFingate {
        const _server = {
            local_sign: this._localSign,
            server: this._server,
            token: BizainFingate._token
        };
        this._remote = new Remote(_server);
        return this;
    }

    /**
     * connect to bizain websocket server
     *
     * @returns
     * @memberof BizainFingate
     */
    public async connect() {
        return new Promise((resolve, reject) => {
            this._remote.connect((error) => {
                if (error) {
                    return reject(error);
                }
                return resolve();
            });
        });
    }

    /**
     * disconnect from bizain websocket server
     *
     * @memberof BizainFingate
     */
    public disconnect() {
        this._remote.disconnect();
    }

    /**
     * request balance of currency
     *
     * @param {string} address
     * @returns {Promise<string>}
     * @memberof BizainFingate
     */
    public balanceOf(address: string): Promise<string> {
        return new Promise((resolve, reject) => {
            this._remote.requestAccountRelations({
                account: address,
                type: "trust"
            }).submit((err, results) => {
                if (err) {
                    return reject(err);
                }
                try {
                    const lines = results.lines;
                    const currencyInfo = lines.find((line) => line.currency.toUpperCase() === this._currency.toUpperCase());
                    return resolve(currencyInfo.balance);
                } catch (error) {
                    return resolve("0");
                }
            });
        });
    }

    /**
     * transfer token
     *
     * @param {string} secret bizain secret
     * @param {string} destination destination bizain address
     * @param {string} value amount
     * @param {IMemo} memo memo
     * @returns {Promise<string>} resolve hash if success
     * @memberof BizainFingate
     */
    @validate
    public async transfer(@isValidBizainSecret secret: string, @isValidBizainAddress destination: string, @isValidAmount value: string, @isValidMemo memo: IMemo): Promise<string> {
        return new Promise((resolve, reject) => {
            const address = BizainFingate.getAddress(secret);
            const tx = {
                account: address,
                amount: {
                    currency: this._currency.toUpperCase(),
                    issuer: "",
                    value: new BigNumber(value).toNumber()
                },
                to: destination
            };

            /* istanbul ignore else */
            if (tx.amount.currency !== BizainFingate._token) {
                tx.amount.issuer = this._issuer;
            }

            const transaction = this._remote.buildPaymentTx(tx);
            transaction.setTransferRate(this._fee);
            transaction.setSecret(secret);
            transaction.addMemo(JSON.stringify(memo));
            transaction.submit((error, res) => {
                if (error) {
                    return reject(error);
                }
                if (res.engine_result === "tesSUCCESS") {
                    return resolve(res.tx_json.hash);
                }
                return reject(new Error(res.engine_result_message));
            });
        });
    }
}
