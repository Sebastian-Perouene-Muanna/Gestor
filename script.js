document.addEventListener('DOMContentLoaded', () => {
    const productForm = document.getElementById('product-form');
    const productList = document.getElementById('products');
    const alertMessages = document.getElementById('alert-messages');
    const searchInput = document.getElementById('search-input');
    const categoryFilter = document.getElementById('category-filter');

    let products = JSON.parse(localStorage.getItem('products')) || [];
    let editIndex = -1;

    function saveProducts() {
        localStorage.setItem('products', JSON.stringify(products));
    }

    function renderProducts() {
        productList.innerHTML = '';

        // Obtiene los valores del filtro
        const searchValue = searchInput.value.toLowerCase();
        const selectedCategory = categoryFilter.value;

        // Filtra los productos según la búsqueda y la categoría
        const filteredProducts = products.filter(product => {
            const matchesSearch = product.name.toLowerCase().includes(searchValue)
                || product.code.toLowerCase().includes(searchValue);
            const matchesCategory = selectedCategory === '' 
                || product.category === selectedCategory;
            return matchesSearch && matchesCategory;
        });

        // Ordena los productos filtrados por fecha de vencimiento (ascendente)
        filteredProducts.sort((a, b) => new Date(a.expiryDate) - new Date(b.expiryDate));

        // Genera la lista
        filteredProducts.forEach((product, index) => {
            const li = document.createElement('li');
            li.innerHTML = `
                <strong>${product.name}</strong> 
                (Código: ${product.code}) 
                - Cantidad: ${product.quantity} 
                - Categoría: ${product.category}
                - Vence: ${product.expiryDate}
                <button class="btn-delete">Eliminar</button>
                <button class="btn-edit">Editar</button>
            `;

            // Botón Eliminar
            li.querySelector('.btn-delete').addEventListener('click', () => {
                const realIndex = products.findIndex(
                    (p) => p.name === product.name && p.code === product.code && p.expiryDate === product.expiryDate
                );
                deleteProduct(realIndex);
            });

            // Botón Editar
            li.querySelector('.btn-edit').addEventListener('click', () => {
                const realIndex = products.findIndex(
                    (p) => p.name === product.name && p.code === product.code && p.expiryDate === product.expiryDate
                );
                editProduct(realIndex);
            });

            // Si el producto está próximo a vencer, cambiar color de fondo
            const daysLeft = getDaysLeft(product.expiryDate);
            if (daysLeft <= 3) {
                li.style.backgroundColor = '#ffb3b3'; // Muy cerca de vencer
            } else if (daysLeft <= 30) {
                li.style.backgroundColor = '#fff0b3'; // Queda menos de un mes
            }

            productList.appendChild(li);
        });
    }

    // Añade un nuevo producto o edita uno existente
    function addProduct(product) {
        if (editIndex === -1) {
            products.push(product);
        } else {
            products[editIndex] = product;
            editIndex = -1;
        }
        saveProducts();
        renderProducts();
    }

    function deleteProduct(index) {
        products.splice(index, 1);
        saveProducts();
        renderProducts();
    }

    function editProduct(index) {
        const product = products[index];
        document.getElementById('product-name').value = product.name;
        document.getElementById('product-code').value = product.code;
        document.getElementById('product-quantity').value = product.quantity;
        document.getElementById('product-category').value = product.category;
        document.getElementById('expiry-date').value = product.expiryDate;
        editIndex = index;
    }

    function getDaysLeft(expiryDate) {
        const now = new Date();
        const exp = new Date(expiryDate);
        const diffTime = exp - now;
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }

    function checkExpiryDates() {
        const now = new Date();
        let alerts = [];

        products.forEach((product) => {
            const daysLeft = getDaysLeft(product.expiryDate);

            // Ajusta los umbrales o mensajes según tus necesidades
            if (daysLeft <= 3 && daysLeft >= 0) {
                alerts.push(`¡Atención! Quedan ${daysLeft} día(s) para que venza ${product.name}.`);
            } else if (daysLeft < 0) {
                alerts.push(`El producto ${product.name} ya está vencido (${Math.abs(daysLeft)} día(s) atrás).`);
            } else if (daysLeft === 30) {
                alerts.push(`Sugerencia de precio para ${product.name}. Queda 1 mes para su vencimiento.`);
            }
        });

        if (alerts.length > 0) {
            alertMessages.innerHTML = alerts.map(alert => `<p>${alert}</p>`).join('');
            alertMessages.style.display = 'block';
        } else {
            alertMessages.style.display = 'none';
        }
    }

    // Evento de envío del formulario
    productForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const name = document.getElementById('product-name').value;
        const code = document.getElementById('product-code').value;
        const quantity = parseInt(document.getElementById('product-quantity').value, 10);
        const category = document.getElementById('product-category').value;
        const expiryDate = document.getElementById('expiry-date').value;

        // Puedes añadir validaciones más estrictas antes de agregarlo
        addProduct({ name, code, quantity, category, expiryDate });
        productForm.reset();
    });

    // Escucha cambios en la búsqueda y en el filtro de categoría
    searchInput.addEventListener('input', renderProducts);
    categoryFilter.addEventListener('change', renderProducts);

    // Inicia la aplicación
    renderProducts();
    setInterval(checkExpiryDates, 60000); // Comprobar cada minuto

    // Para poder utilizar estas funciones globalmente si las usas en tu HTML
    window.deleteProduct = deleteProduct;
    window.editProduct = editProduct;
});
