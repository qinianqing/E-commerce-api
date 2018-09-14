let coupon = require('./coupon');

let test = ()=>{
    coupon.init('6bac8008717948769a15be2e7def4714');

    let p = {
       	user_id: 'f382fa06fa2f40a7984d759530e836db',
       	code:'bf98e45474284883944d22f4b7cad73d',
       	order_id:'mock',
       	//weeks: 2,
    	callback:(resp)=>{
    		console.log('<<<<<<<',resp);
    	}
    };

    coupon.use.coupon(p);
};

let test_ = ()=>{
	let sku_id = '10000-sku-10000';
	console.log('spu_id',sku_id.split('-sku-')[0]);
	console.log('sku_index',sku_id.split('-sku-')[1]);
};

// test();

test_();