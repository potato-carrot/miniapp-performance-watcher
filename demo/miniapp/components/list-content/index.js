// components/List.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {

  },

  /**
   * 组件的初始数据
   */
  data: {
    listContent: ""
  },

  lifetimes: {
    attached: function () {
      this.setData({
        listContent: "列表组件"
      })
    },
    detached: function () {
    },
  },

  attached: function () {
  },
  detached: function () {
  },

  /**
   * 组件的方法列表
   */
  methods: {

  }
})
