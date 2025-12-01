new Vue({
    el: "#app",
    data: {
        sitename: "After School Activities",
        showLessons: true,
        searchQuery: "",
        sortAttribute: "topic",
        sortOrder: "ascending",

        lessons: [],  
        cart: [],
        name: "",
        phone: "",
        orderConfirmed: false
    },

    mounted() {
        this.loadLessons();
    },

    methods: {

        loadLessons() {
            fetch("https://backend-1-sits.onrender.com/lessons")
                .then(res => res.json())
                .then(data => {
                    this.lessons = data;
                });
        },

        toggleView() {
            this.showLessons = !this.showLessons;
        },

        addToCart(lesson) {
            if (lesson.space > 0) {

                let existing = this.cart.find(item => item.id === lesson._id);

                if (existing) {
                    existing.quantity++;
                } else {
                    this.cart.push({
                        id: lesson._id,
                        topic: lesson.topic,
                        location: lesson.location,
                        price: lesson.price,
                        image: lesson.image,
                        quantity: 1
                    });
                }

                lesson.space--;
            }
        },

        increaseQuantity(item) {
            let lesson = this.lessons.find(l => l._id === item.id);
            if (lesson.space > 0) {
                item.quantity++;
                lesson.space--;
            }
        },

        decreaseQuantity(item) {
            let lesson = this.lessons.find(l => l._id === item.id);
            if (item.quantity > 1) {
                item.quantity--;
                lesson.space++;
            } else {
                this.removeFromCart(item);
            }
        },

        removeFromCart(item) {
            let lesson = this.lessons.find(l => l._id === item.id);
            lesson.space += item.quantity;
            this.cart = this.cart.filter(i => i.id !== item.id);
        },

        checkout() {
            if (!this.isCheckoutValid) {
                alert("Please enter valid details.");
                return;
            }

            const order = {
                name: this.name,
                phone: this.phone,
                items: this.cart.map(item => ({
                    lessonId: item.id,
                    spaces: item.quantity
                }))
            };

            fetch("https://backend-1-sits.onrender.com/orders", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(order)
            })
                .then(res => res.json())
                .then(data => {
                    this.orderConfirmed = true;

                    // Reset UI
                    this.cart = [];
                    this.name = "";
                    this.phone = "";
                    this.showLessons = true;

                    // Reload updated spaces
                    this.loadLessons();
                });
        }
    },

    computed: {
        sortedLessons() {
            let sorted = [...this.lessons];
            let mod = this.sortOrder === "ascending" ? 1 : -1;

            sorted.sort((a, b) => {
                if (a[this.sortAttribute] < b[this.sortAttribute]) return -1 * mod;
                if (a[this.sortAttribute] > b[this.sortAttribute]) return 1 * mod;
                return 0;
            });

            if (this.searchQuery.trim() !== "") {
                const q = this.searchQuery.toLowerCase();
                sorted = sorted.filter(l =>
                    l.topic.toLowerCase().includes(q) ||
                    l.location.toLowerCase().includes(q)
                );
            }

            return sorted;
        },

        totalPrice() {
            return this.cart.reduce((sum, item) =>
                sum + item.price * item.quantity, 0);
        },

        isCheckoutValid() {
            const nameValid = /^[A-Za-z\s]{2,}$/.test(this.name);
            const phoneValid = /^[0-9]{10,}$/.test(this.phone);
            return nameValid && phoneValid && this.cart.length > 0;
        }
    }
});
