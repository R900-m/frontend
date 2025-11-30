// app.js 
// Initial Vue setup

new Vue({
    el: "#app",
    data: {
        sitename: "After School Activities",
        showLessons: true,
        searchQuery: "",
        sortAttribute: "subject",
        sortOrder: "ascending",
        lessons: [], // FETCH from Render backend
        cart: [],
        name: "",
        phone: "",
        orderConfirmed: false
    },

    // Load lessons from your Render backend when page loads
    mounted() {
        // Fetch lessons from backend API 
        fetch("https://backend-1-sits.onrender.com/lessons")
            .then(res => res.json())
            .then(data => {
                this.lessons = data;
                console.log("Lessons loaded:", data);
            })
            .catch(err => console.error("Error loading lessons:", err));
    },

    computed: {
        // Sorting lessons by subject, location, price, etc.

        // SORT + FILTER lessons
        sortedLessons() {
            let sorted = this.lessons.slice();

            // Sorting
            sorted.sort((a, b) => {
                let modifier = this.sortOrder === "ascending" ? 1 : -1;
                if (a[this.sortAttribute] < b[this.sortAttribute]) return -1 * modifier;
                if (a[this.sortAttribute] > b[this.sortAttribute]) return 1 * modifier;
                return 0;
            });

            // SEARCH (Frontend only)
            if (this.searchQuery.trim() !== "") {
                const q = this.searchQuery.toLowerCase();
                sorted = sorted.filter(l =>
                    l.subject.toLowerCase().includes(q) ||
                    l.location.toLowerCase().includes(q)
                );
            }

            return sorted;
        },

        // Calculate total price
        totalPrice() {
            return this.cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
        },

        // Checkout validation
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
            if (lesson.space > 0) {
                let existing = this.cart.find(item => item.id === lesson._id);

                if (existing) {
                    existing.quantity++;
                } else {
                    // Convert lesson to cart item
                    this.cart.push({
                        id: lesson._id,
                        subject: lesson.subject,
                        location: lesson.location,
                        price: lesson.price,
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

            this.cart = this.cart.filter(cartItem => cartItem.id !== item.id);
        },

        // FULL CHECKOUT (POST ORDER TO BACKEND)
        checkout() {
            if (!this.isCheckoutValid) return;

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
                    console.log("Order saved:", data);

                    alert(`Thank you, ${this.name}! Your order has been submitted.`);

                    // Reset UI
                    this.orderConfirmed = true;
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
