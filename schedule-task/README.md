# API
1. /pay/wx/order
2. /pay/wx/member
4. /pay/wx/order-callback
5. /pay/wx/member-callback
6. /pay/health-check

# TODO
build方法没有实现

1. PayOrder获取支付请求信息并保存到DynamoDB
2. 支付回调，更新PayOrder状态，保存到DynamoDB
3. 支付订单时，总价需要根据结算接口获得，不要从客户端获取值
4. 调用接口，需要判断用户状态，如是否登录、是否是合法用户
5. 支付家庭会员时，需要根据接口进行价格判断

## featrue
- 对微信支付的接口进行了封装，只执行支付相关功能（支付和退款）

## 项目架构
> bin               启动入口

> models            数据模型

> routes            路由

> utils             插件，本项目主要是微信支付相关组件

> config.js         配置项

> router.js         总路由，将路由从app.js中分离


## js_pay_order

tradeId                               交易ID
amount                              钱数，单位为分
user                                   交易用户信息
productDescription                  产品描述
status                                交易状态
ip                                       订单ip
tradeType                          交易类型
prepayId                            微信支付校验码
