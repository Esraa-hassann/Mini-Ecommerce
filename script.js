const imageUrl = 'https://fakestoreapi.com/products';
let cart = [];
let currentPage = 1;
const itemsPerPage = 4;  
let filteredData = [];

// Fetch the data from the URL
fetch(imageUrl)
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok ' + response.statusText);
        }
        return response.json();
    })
    .then(data => {
        console.log('Fetched data:', data); // Debug: Log fetched data

        // Extract categories from the data
        const categories = [...new Set(data.map(product => product.category))];
       // categories.unshift('All Categories'); // Add "All Categories" option

        // Create a dropdown list for categories
        const categorySelect = document.getElementById('category-select');
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            option.text = category;
            categorySelect.appendChild(option);
        });

        const searchButton = document.getElementById('search-button');

        searchButton.addEventListener('click', () => {
            const searchInput = document.getElementById('search-input').value.toLowerCase();
            const categorySelect = document.getElementById('category-select').value;
            const minPrice = parseFloat(document.getElementById('min-price').value);
            const maxPrice = parseFloat(document.getElementById('max-price').value);
            const sortByPrice = document.getElementById('sort-by-price').value;

            filteredData = data;

            // Filter by search input
            if (searchInput) {
                filteredData = filteredData.filter(product => product.title.toLowerCase().includes(searchInput));
            }

            // Filter by category
            if (categorySelect !== 'All Categories') {
                filteredData = filteredData.filter(product => product.category === categorySelect);
            }

            // Filter by price range
            if (!isNaN(minPrice)) {
                filteredData = filteredData.filter(product => product.price >= minPrice);
            }
            if (!isNaN(maxPrice)) {
                filteredData = filteredData.filter(product => product.price <= maxPrice);
            }

            // Sort by price
            if (sortByPrice === 'asc') {
                filteredData.sort((a, b) => a.price - b.price);
            } else if (sortByPrice === 'desc') {
                filteredData.sort((a, b) => b.price - a.price);
            }

            currentPage = 1; // Reset to first page
            displayProducts();
        });

        // Add event listeners for pagination buttons
        document.getElementById('prev-page').addEventListener('click', () => {
            if (currentPage > 1) {
                currentPage--;
                displayProducts();
            }
        });

        document.getElementById('next-page').addEventListener('click', () => {
            if (currentPage < Math.ceil(filteredData.length / itemsPerPage)) {
                currentPage++;
                displayProducts();
            }
        });

    })
    .catch(error => {
        console.error('Error fetching the images:', error);
    });

function displayProducts() {
    const imageContainer = document.getElementById('image-container');
    imageContainer.innerHTML = '';

    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const pageData = filteredData.slice(start, end);

    pageData.forEach(product => {
        displayProduct(product);
    });

    updatePagination();
}

function displayProduct(product) {
    const imageContainer = document.getElementById('image-container');
    imageContainer.className = 'image-container';
    const productDiv = document.createElement('div');
    productDiv.className = 'product';

    const img = document.createElement('img');
    img.src = product.image;
    img.alt = product.title;
    img.width = 150;
    img.height = 150;

    const title = document.createElement('p');
    title.textContent = product.title;

    const price = document.createElement('p');
    price.textContent = `$${product.price}`;

    const addToCartButton = document.createElement('button');
    addToCartButton.textContent = 'Add to Cart';
    addToCartButton.className='apply-filters';
    addToCartButton.addEventListener('click', () => addToCart(product));

    productDiv.appendChild(img);
    productDiv.appendChild(title);
    productDiv.appendChild(price);
    productDiv.appendChild(addToCartButton);

    imageContainer.appendChild(productDiv);
}

function addToCart(product) {
    const existingItem = cart.find(item => item.id === product.id);
    if (existingItem) {
        existingItem.quantity++;
    } else {
        cart.push({ ...product, quantity: 1 });
    }
    updateCart();
}

function removeFromCart(productId) {
    const itemIndex = cart.findIndex(item => item.id === productId);
    if (itemIndex > -1) {
        const item = cart[itemIndex];
        if (item.quantity > 1) {
            item.quantity--;
        } else {
            cart.splice(itemIndex, 1);
        }
    }
    updateCart();
}

function updateCart() {
    const cartItems = document.querySelector('.cart-items');
    cartItems.innerHTML = '';

    let totalQuantity = 0;
    let totalPrice = 0;

    cart.forEach(item => {
        totalQuantity += item.quantity;
        totalPrice += item.price * item.quantity;

        const cartItemDiv = document.createElement('div');
        cartItemDiv.className = 'cart-item';

        const itemName = document.createElement('p');
        itemName.textContent = `${item.title} - $${item.price} x ${item.quantity}`;

        const removeButton = document.createElement('button');
        removeButton.textContent = 'Remove';
        removeButton.className='remove';
        removeButton.addEventListener('click', () => removeFromCart(item.id));

        cartItemDiv.appendChild(itemName);
        cartItemDiv.appendChild(removeButton);

        cartItems.appendChild(cartItemDiv);
    });

    document.querySelector('.total-quantity').textContent = totalQuantity;
    document.querySelector('.total-price').textContent = totalPrice.toFixed(2);
}

function updatePagination() {
    const pageInfo = document.getElementById('page-info');
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
}
