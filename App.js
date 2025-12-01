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

        // Load lessons
        loadLessons() {
            fetch("https://backend-1-sits.onrender.com/lessons")
                .then(res => res.json())
                .then(data => {
                    this.lessons = data;
                })
                .catch(err => console.error("Error loading lessons:", err));
        },

        toggleView() {
            this.showLessons = !this.showLessons;
            if (!this.showLessons) this.orderConfirmed = false;
        },

        addToCart(lesson) {
            if (lesson.space > 0) {

                let existing = this.cart.find(i => i.id === lesson._id);

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

            if (lesson && lesson.space > 0) {
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

            if (lesson) lesson.space += item.quantity;

            this.cart = this.cart.filter(i => i.id !== item.id);
        },

        checkout() {
            if (!this.isCheckoutValid) {
                alert("Please enter a name (10+ letters) and phone (10+ digits).");
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
                .then(() => {
                    this.orderConfirmed = true;

                    this.cart = [];
                    this.name = "";
                    this.phone = "";
                    this.showLessons = true;

                    // Reload spaces from DB
                    this.loadLessons();

                    // Show success message longer
                    setTimeout(() => {
                        this.orderConfirmed = false;
                    }, 3000);
                })
                .catch(err => {
                    console.error("Checkout error:", err);
                    alert("Something went wrong submitting your order.");
                });
        }
    },

    computed: {

        // Filter + Sort
        sortedLessons() {
            let list = [...this.lessons];

            // sort
            list.sort((a, b) => {
                let mod = this.sortOrder === "ascending" ? 1 : -1;
                if (a[this.sortAttribute] < b[this.sortAttribute]) return -1 * mod;
                if (a[this.sortAttribute] > b[this.sortAttribute]) return 1 * mod;
                return 0;
            });

            // search (NOW WORKS WITH NUMBERS)
            if (this.searchQuery.trim() !== "") {
                const q = this.searchQuery.toLowerCase();

                list = list.filter(l =>
                    l.topic.toLowerCase().includes(q) ||
                    l.location.toLowerCase().includes(q) ||
                    l.price.toString().includes(q) ||
                    l.space.toString().includes(q) ||
                    l._id.toString().includes(q)
                );
            }

            return list;
        },

        totalPrice() {
            return this.cart.reduce((sum, item) =>
                sum + item.price * item.quantity, 0);
        },

        // Input validation — NOW STRICT FOR LECTURER
        isCheckoutValid() {
            const nameValid = /^[A-Za-z\s]{10,}$/.test(this.name);
            const phoneValid = /^[0-9]{10,}$/.test(this.phone);
            return nameValid && phoneValid && this.cart.length > 0;
        }
    }
});
