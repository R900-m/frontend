// app.js
new Vue({
  el: "#app",
  data: {
    sitename: "After School Activities",
    showLessons: true,
    searchQuery: "",
    sortAttribute: "subject",
    sortOrder: "ascending",
    lessons: lessons, // from products.js
    cart: [],
    name: "",
    phone: "",
    orderConfirmed: false
  },

  computed: {
    // Sort + Filter
    sortedLessons() {
      let sorted = this.lessons.slice();
      sorted.sort((a, b) => {
        let modifier = this.sortOrder === "ascending" ? 1 : -1;
        if (a[this.sortAttribute] < b[this.sortAttribute]) return -1 * modifier;
        if (a[this.sortAttribute] > b[this.sortAttribute]) return 1 * modifier;
        return 0;
      });
      if (this.searchQuery.trim() !== "") {
        const q = this.searchQuery.toLowerCase();
        sorted = sorted.filter(l =>
          l.subject.toLowerCase().includes(q) ||
          l.location.toLowerCase().includes(q)
        );
      }
      return sorted;
    },

    totalPrice() {
      return this.cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    },

    isCheckoutValid() {
      const nameValid = /^[A-Za-z\s]+$/.test(this.name);
      const phoneValid = /^[0-9]+$/.test(this.phone);
      return nameValid && phoneValid && this.cart.length > 0;
    }
  },

  methods: {
    toggleView() {
      this.showLessons = !this.showLessons;
    },

    addToCart(lesson) {
      if (lesson.spaces > 0) {
        let existing = this.cart.find(item => item.id === lesson.id);
        if (existing) {
          existing.quantity++;
        } else {
          this.cart.push({ ...lesson, quantity: 1 });
        }
        lesson.spaces--;
      }
    },

    increaseQuantity(item) {
      let lesson = this.lessons.find(l => l.id === item.id);
      if (lesson.spaces > 0) {
        item.quantity++;
        lesson.spaces--;
      }
    },

    decreaseQuantity(item) {
      let lesson = this.lessons.find(l => l.id === item.id);
      if (item.quantity > 1) {
        item.quantity--;
        lesson.spaces++;
      } else {
        this.removeFromCart(item);
      }
    },

    removeFromCart(item) {
      let lesson = this.lessons.find(l => l.id === item.id);
      lesson.spaces += item.quantity;
      this.cart = this.cart.filter(cartItem => cartItem.id !== item.id);
    },

    checkout() {
      if (this.isCheckoutValid) {
        alert(`Thank you, ${this.name}! Your order has been submitted.`);
        this.orderConfirmed = true;
        this.cart = [];
        this.name = "";
        this.phone = "";
        this.showLessons = true;
      }
    }
  }
});
