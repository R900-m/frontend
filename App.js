new Vue({
    el: "#app",
    data: {
        sitename: "After School Activities",
        showLessons: true,
        searchQuery: "",
        sortAttribute: "subject",
        sortOrder: "ascending",

        lessons: [],   // Loaded from backend
        cart: [],
        name: "",
        phone: "",
        orderConfirmed: false
    },

    mounted() {
        // Load lessons from backend
        fetch("https://backend-1-sits.onrender.com/lessons")
            .then(res => res.json())
            .then(data => {
                this.lessons = data;
            })
            .catch(err => console.error("Error loading lessons:", err));
    },

    computed: {
        // FILTER + SORT
        sortedLessons() {
            let sorted = [...this.lessons];

            // SORT
            sorted.sort((a, b) => {
                let modifier = this.sortOrder === "ascending" ? 1 : -1;
                if (a[this.sortAttribute] < b[this.sortAttribute]) return -1 * modifier;
                if (a[this.sortAttribute] > b[this.sortAttribute]) return 1 * modifier;
                return 0;
            });

            // FILTER
            if (this.searchQuery.trim() !== "") {
                const q = this.searchQuery.toLowerCase();
                sorted = sorted.filter(l =>
                    l.subject.toLowerCase().includes(q) ||
                    l.location.toLowerCase().includes(q)
                );
            }

            return sorted;
        },

        // TOTAL PRICE
        totalPrice() {
            return this.cart.reduce((sum, item) =>
                sum + item.price * item.quantity, 0);
        },

        // CHECKOUT VALIDATION
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

        // ADD TO CART
        addToCart(lesson) {
            if (lesson.spaces > 0) {
                let existing = this.cart.find(item => item.id === lesson._id);

                if (existing) {
                    existing.quantity++;
                } else {
                    this.cart.push({
                        id: lesson._id,
                        subject: lesson.subject,
                        location: lesson.location,
                        price: lesson.price,
                        quantity: 1
                    });
                }

                lesson.spaces--;
            }
        },

        increaseQuantity(item) {
            let lesson = this.lessons.find(l => l._id === item.id);

            if (lesson.spaces > 0) {
                item.quantity++;
                lesson.spaces--;
            }
        },

        decreaseQuantity(item) {
            let lesson = this.lessons.find(l => l._id === item.id);

            if (item.quantity > 1) {
                item.quantity--;
                lesson.spaces++;
            } else {
                this.removeFromCart(item);
            }
        },

        removeFromCart(item) {
            let lesson = this.lessons.find(l => l._id === item.id);
            lesson.spaces += item.quantity;

            this.cart = this.cart.filter(i => i.id !== item.id);
        },

        // CHECKOUT ORDER
        checkout() {
            if (!this.isCheckoutValid) {
                alert("Please enter a valid name, phone number, and have at least one item.");
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
                    alert(`Thank you, ${this.name}! Your order has been submitted.`);
                    this.orderConfirmed = true;

                    // RESET UI
                    this.cart = [];
                    this.name = "";
                    this.phone = "";
                    this.showLessons = true;
                })
                .catch(err => {
                    console.error("Checkout error:", err);
                    alert("Something went wrong submitting your order.");
                });
        }
    }
});
