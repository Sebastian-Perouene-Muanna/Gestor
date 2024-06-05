document.addEventListener('DOMContentLoaded', () => {
    const productForm = document.getElementById('product-form');
    const productList = document.getElementById('products');
    const alertMessages = document.getElementById('alert-messages');
    const products = JSON.parse(localStorage.getItem('products')) || [];
    let editIndex = -1;

    function saveProducts() {
        localStorage.setItem('products', JSON.stringify(products));
    }

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
        document.getElementById('expiry-date').value = product.expiryDate;
        editIndex = index;
    }

    function renderProducts() {
        productList.innerHTML = '';
        products.forEach((product, index) => {
            const li = document.createElement('li');
            li.innerHTML = `
                ${product.name} - ${product.code} - ${product.expiryDate}
                <button onclick="deleteProduct(${index})">Eliminar</button>
                <button onclick="editProduct(${index})">Editar</button>
            `;
            productList.appendChild(li);
        });
    }

    productForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const name = document.getElementById('product-name').value;
        const code = document.getElementById('product-code').value;
        const expiryDate = document.getElementById('expiry-date').value;
        addProduct({ name, code, expiryDate });
        productForm.reset();
    });

    function checkExpiryDates() {
        const now = new Date();
        let alerts = [];
        products.forEach((product) => {
            const expiryDate = new Date(product.expiryDate);
            const diffTime = expiryDate - now;
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            if (diffDays === 30) {
                alerts.push(`Sugerencia de precio para ${product.name}. Queda menos de un mes para su vencimiento.`);
            } else if (diffDays === 3) {
                alerts.push(`Alerta para retirar ${product.name}. Quedan menos de 3 días para su vencimiento.`);
            }
        });

        if (alerts.length > 0) {
            alertMessages.innerHTML = alerts.map(alert => `<p>${alert}</p>`).join('');
            alertMessages.style.display = 'block';
        } else {
            alertMessages.style.display = 'none';
        }
    }

    setInterval(checkExpiryDates, 60000); // Comprobar cada 24 horas

    renderProducts();
    window.deleteProduct = deleteProduct; // Hacer las funciones accesibles globalmente
    window.editProduct = editProduct;
});
