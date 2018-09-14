# 拉取node镜像
FROM daocloud.io/node:latest
# coder
MAINTAINER ziv ziv@yongxin.io
# 创建工作目录
RUN mkdir -p /home/app
# 指定工作目录
WORKDIR /home/app
# 将程序文件移到工作目录
COPY . /home/app
# 安装组件
# RUN npm install --registry=https://registry.npm.taobao.org
RUN npm i



# 暴露端口
EXPOSE 3000
# 启动程序
CMD npm start
