let create = require('./createWaQrcode');

let id = '1001';
let handle = async ()=>{
    let qr = await create(id,'page/promote/co-branded-card/co-branded-card');
    console.log(qr)
};

handle();