/**
 * Created by alykoshin on 31.01.16.
 */

//const config = require('../')('/root/1');
const config = require('../')('config', {throwNoDir:true});

console.log(config);
