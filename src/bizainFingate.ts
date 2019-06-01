
import * as jtWallet from "jcc_wallet/lib/jingtum";
import { Remote } from "jcc_jingtum_lib";
import IMemo from "./model/memo";
import { isValidAmount, isValidMemo, isValidBizainAddress, isValidBizainSecret, validate } from "./validator";

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

    public static isValidAddress(address: string): boolean {
        return jtWallet.isValidAddress(address, BizainFingate._token);
    }

    public static isValidSecret(secret: string): boolean {
        return jtWallet.isValidSecret(secret, BizainFingate._token);
    }

    public static getAddress(secret: string): string | null {
        return jtWallet.getAddress(secret, BizainFingate._token);
    }

    public init(): BizainFingate {
        const _server = {
            local_sign: this._localSign,
            token: BizainFingate._token,
            server: this._server
        };
        this._remote = new Remote(_server);
        return this;
    }

    public async connect() {
        return new Promise((resolve, reject) => {
            this._remote.connect((error) => {
                console.log(error);
                if (error) {
                    return reject(error);
                }
                return resolve();
            });
        });
    }

    public disconnect() {
        this._remote.disconnect();
    }

    @validate
    public async transfer(@isValidBizainSecret secret: string, @isValidBizainAddress destination: string, @isValidAmount value: number, @isValidMemo memo: IMemo): Promise<string> {
        return new Promise((resolve, reject) => {
            const address = BizainFingate.getAddress(secret);
            const tx = {
                account: address,
                to: destination,
                amount: {
                    currency: this._currency.toUpperCase(),
                    issuer: "",
                    value
                }
            };

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
                return resolve(res.tx_json.hash);
            });
        });
    }
}
