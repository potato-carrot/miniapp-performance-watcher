// components/Header.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {

  },

  lifetimes: {
    attached: function () {
      this.test()

    },
    detached: function () {
    },
  },

  /**
   * 组件的初始数据
   */
  data: {

  },

  /**
   * 组件的方法列表
   */
  methods: {
    test() {
      setTimeout(() => {
        this.setData({
          listContent: "test"
        })
      }, 3000);

    }
  }
})
