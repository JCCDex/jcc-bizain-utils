# jcc-bizain-utils

Toolkit of crossing chain from [Bizain chain](http://www.bizain.org/) to [SWTC chain](http://www.swtc.top/#/)

![npm](https://img.shields.io/npm/v/jcc-bizain-utils.svg)
[![Build Status](https://travis-ci.com/JCCDex/jcc-bizain-utils.svg?branch=master)](https://travis-ci.com/JCCDex/jcc-bizain-utils)
[![Coverage Status](https://coveralls.io/repos/github/JCCDex/jcc-bizain-utils/badge.svg?branch=master)](https://coveralls.io/github/JCCDex/jcc-bizain-utils?branch=master)
[![Dependencies](https://img.shields.io/david/JCCDex/jcc-bizain-utils.svg?style=flat-square)](https://david-dm.org/JCCDex/jcc-bizain-utils)
[![DevDependencies](https://img.shields.io/david/dev/JCCDex/jcc-bizain-utils.svg?style=flat-square)](https://david-dm.org/JCCDex/jcc-bizain-utils?type=dev)
[![npm downloads](https://img.shields.io/npm/dm/jcc-bizain-utils.svg)](http://npm-stat.com/charts.html?package=jcc-bizain-utils)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](http://makeapullrequest.com)

## Description

Transfer token automatically from [BIZAIN](http://www.bizain.org/) chain to [SWTC](http://www.swtc.top/#/) chain. Support BIZ token.

e.g. you transfer 1 `BIZ` to [Bizain Fingate](https://bizain.net/bc/explorer/#!/wallet/bwtC9ARd3wo7Kx3gKQ49uVgcKxoAiV1iM2) from your bizain address if success, the contract will automatically transfer 1 `JBIZ` to your swtc address from [Jingtum Fingate](https://swtcscan.jccdex.cn/#/wallet/?wallet=jDu7umDxKxeaHoj7eNdUn8YsGWTHZSuEGL) in a few minutes.

## Installtion

```shell
npm install jcc-bizain-utils
```

## Usage

```javascript
// demo
import BizainFingate from "jcc-bizain-utils";

const testWebsocketServer = "";

const instance = new BizainFingate(testWebsocketServer);

const testSecret = "ssySqG4BhxpngV2FjAe1SJYFD4dcm";

// Don't change it. The fingate address is it for now.
const destination = "bwtC9ARd3wo7Kx3gKQ49uVgcKxoAiV1iM2";

const testMemo = {
    jtaddress: "jpgWGpfHz8GxqUjz5nb6ej8eZJQtiF6KhH"
}

const amount = "1";

try {
    instance.init()
    await instance.connect()
    const hash = await instance.transfer(testSecret, destination, amount, testMemo);
    console.log(hash);
} catch (error) {
    console.log(error);
} finally {
    instance.disconnect();
}
```
