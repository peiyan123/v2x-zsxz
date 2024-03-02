'use strict';
module.exports = {
  // 分组 针对数组对象
  groupBy(list, fn) {
    const groups = {};
    list.forEach(function(o) {
      const group = JSON.stringify(fn(o));
      groups[group] = groups[group] || [];
      groups[group].push(o);
    });
    return groups;
  },
};
