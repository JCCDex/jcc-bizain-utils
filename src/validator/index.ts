import BigNumber from "bignumber.js";
import * as jtWallet from "jcc_wallet/lib/jingtum";

const router = Symbol();
const checkBizainAddressKey = Symbol();
const checkMemoKey = Symbol();
const checkBizainSecretKey = Symbol();
const checkAmountKey = Symbol();

const setTarget = (target: any, name: string, index: number, key: symbol) => {
    target[router] = target[router] || {};
    target[router][name] = target[router][name] || {};
    target[router][name].params = target[router][name].params || [];
    target[router][name].params[index] = key;
};

export const isValidBizainAddress = (target: any, name: string, index: number) => {
    setTarget(target, name, index, checkBizainAddressKey);
};

export const isValidBizainSecret = (target: any, name: string, index: number) => {
    setTarget(target, name, index, checkBizainSecretKey);
};

export const isValidMemo = (target: any, name: string, index: number) => {
    setTarget(target, name, index, checkMemoKey);
};

export const isValidAmount = (target: any, name: string, index: number) => {
    setTarget(target, name, index, checkAmountKey);
};

export const validate = (target: any, name: string, descriptor: PropertyDescriptor) => {
    const method = descriptor.value;

    descriptor.value = function () {
        const params = target[router][name].params;
        /* istanbul ignore else */
        if (Array.isArray(params)) {
            const length = params.length;
            for (let index = 0; index < length; index++) {
                const element = params[index];
                const value = arguments[index];
                switch (element) {
                    case checkBizainAddressKey:
                        if (!jtWallet.isValidAddress(value, "bwt")) {
                            throw new Error(`${value} is invalid bizain address.`);
                        }
                        break;
                    case checkBizainSecretKey:
                        if (!jtWallet.isValidSecret(value, "bwt")) {
                            throw new Error(`${value} is invalid bizain secret.`);
                        }
                        break;
                    case checkAmountKey:
                        const bn = new BigNumber(value);
                        if (!BigNumber.isBigNumber(bn) || !bn.isGreaterThan(0)) {
                            throw new Error(`${value} is invalid amount.`);
                        }
                        break;
                    case checkMemoKey:
                        if (!jtWallet.isValidAddress(value.jtaddress)) {
                            throw new Error(`${value.jtaddress} is invalid jingtum address in memo.`);
                        }
                        break;
                    /* istanbul ignore next */
                    default:
                        break;
                }
            }
        }
        return method.apply(this, arguments);
    };
};
