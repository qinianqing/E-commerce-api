// author by ziv

const utils = {
	ascending:(list) => {
		if (list.length) {
			// 按index属性，正向排序
			const sortFun = (a,b) => {
				return a.index-b.index
			};
			return list.sort(sortFun)
		}else{
			return 'need an array'
		}
	},
	decending:(list) => {
		if (list.length) {
			// 按index属性，倒序排列
			const sortFun = (a,b) => {
				return b.index-a.index
			};
			return list.sort(sortFun)
		}else{
			return 'need an array'
		}
	}
};

module.exports = utils;