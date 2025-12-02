# After School Activities – Front-End (Vue.js)

This repository contains the **Front-End** of my Full Stack Coursework project “After School Activities”. Users can browse lessons, search, sort, add items to a cart, and place an order. All lesson data and order processing come from the **Back-End API** hosted on Render.

---

## Live Back-End API
The front-end communicates with my deployed backend:

**https://backend-1-sits.onrender.com/lessons**

---

# Technologies Used

### **Front-End**
- Vue.js (CDN version)
- HTML5
- CSS3
- JavaScript (Fetch API)

### **Back-End (External Service)**
- Express.js
- MongoDB Atlas
- CORS
- Logger middleware
*(Hosted separately on Render.)*

---

# Features of This Front-End
- Loads lessons from back-end via Fetch API
- Search bar to filter lessons
- Sorting (subject, price, location, spaces)
- Add lessons to cart 
- Prevent ordering more than available spaces 
- Checkout form (name + phone validation)  
- Sends new orders to back-end  
- Updates lesson spaces after ordering  
- Responsive and user-friendly interface

---

#  How the Front-End Talks to the Back-End

### **Fetch all lessons**
```js
fetch("https://backend-1-sits.onrender.com/lessons")
  .then(res => res.json())
  .then(data => this.lessons = data);
