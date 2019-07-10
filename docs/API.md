# API of BizainFingate

```javascript

/**
 * validate bizain address is valid or not
 *
 * @static
 * @param {string} address
 * @returns {boolean}
 * @memberof BizainFingate
 */
static isValidAddress(address: string): boolean;

/**
 * validate bizain secret is valid or not
 *
 * @static
 * @param {string} secret
 * @returns {boolean}
 * @memberof BizainFingate
 */
static isValidSecret(secret: string): boolean;

/**
 * retrive address with secret
 *
 * @static
 * @param {string} secret
 * @returns {(string | null)} return address if secret is valid
 * @memberof BizainFingate
 */
static getAddress(secret: string): string | null;

/**
 * init remote instance
 *
 * @returns {BizainFingate}
 * @memberof BizainFingate
 */
init(): BizainFingate;

/**
 * connect to bizain websocket server
 *
 * @returns
 * @memberof BizainFingate
 */
connect(): Promise<unknown>;

/**
 * disconnect from bizain websocket server
 *
 * @memberof BizainFingate
 */
disconnect(): void;

/**
 * request balance of currency
 *
 * @param {string} address
 * @returns {Promise<string>}
 * @memberof BizainFingate
 */
balanceOf(address: string): Promise<string>;

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
transfer(secret: string, destination: string, value: string, memo: IMemo): Promise<string>;

```
