let create = require('./createWaQrcode');

let id = '1529993640120';
let handle = async ()=>{
    let qr = await create(id,'page/product/goodsgroup/goodsgroup');
    console.log(qr)
};

handle();