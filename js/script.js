$(document).ready(function() {

    // ĐĂNG KÝ
    if ($("#registerForm").length) {
        $("#registerForm").submit(function(e) {
            e.preventDefault();

            const username = $("#registerUsername").val().trim();
            const email = $("#registerEmail").val().trim();
            const password = $("#registerPassword").val();
            const confirm = $("#registerConfirmPassword").val();

            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

            if (!username || !email || !password || !confirm) {
                return alert("Vui lòng điền đầy đủ các trường.");
            }

            if (!emailRegex.test(email)) {
                return alert("Email không hợp lệ.");
            }

            if (password.length < 6) {
                return alert("Mật khẩu phải từ 6 ký tự trở lên.");
            }

            if (password !== confirm) {
                return alert("Xác nhận mật khẩu không khớp.");
            }

            let users = JSON.parse(localStorage.getItem("users")) || [];
            if (users.some(u => u.username === username)) {
                return alert("Tên người dùng đã tồn tại.");
            }

            users.push({ username, email, password });
            localStorage.setItem("users", JSON.stringify(users));

            $("#registerForm").hide();
            $("#user-name").text(username);
            $("#user-email").text(email);
            $("#success-message").show();
        });
    }

    // ĐĂNG NHẬP
    if ($("#loginForm").length) {
        $("#loginForm").submit(function(e) {
            e.preventDefault();

            const username = $("#loginUsername").val().trim();
            const password = $("#loginPassword").val();

            const users = JSON.parse(localStorage.getItem("users")) || [];
            const user = users.find(u => u.username === username && u.password === password);

            if (!user) {
                return alert("Tên người dùng hoặc mật khẩu không đúng!");
            }

            localStorage.setItem("currentUser", JSON.stringify(user));
            alert("Đăng nhập thành công!");
            window.location.href = "index.html";
        });
    }

    // HIỂN THỊ DANH SÁCH SẢN PHẨM
    if ($("#product-list").length) {
        const products = JSON.parse(localStorage.getItem("products")) || [];
        const listContainer = $("#product-list");

        products.forEach(p => {
            const html = `
                <div class="col-md-3 mb-4">
                    <div class="card h-100">
                        <img src="${p.image}" class="card-img-top" alt="${p.name}">
                        <div class="card-body">
                            <h5 class="card-title">${p.name}</h5>
                            <p class="card-text text-success fw-bold">${p.price.toLocaleString()} VND</p>
                            <button class="btn btn-sm btn-success w-100 add-to-cart" data-id="${p.id}" data-name="${p.name}" data-price="${p.price}" data-image="${p.image}">Thêm vào giỏ</button>
                            <button class="btn btn-outline-success w-100 view-detail" data-id="${p.id}">Xem Chi Tiết</button>
                        </div>
                    </div>
                </div>
            `;
            listContainer.append(html);
        });
    }

    // XEM CHI TIẾT SẢN PHẨM
    $(document).on("click", ".view-detail", function() {
        const productId = $(this).data("id");
        const products = JSON.parse(localStorage.getItem("products")) || [];
        const product = products.find(p => p.id === productId);

        if (product) {
            $("#productImage").attr("src", product.image);
            $("#productName").text(product.name);
            $("#productPrice").text(`${product.price.toLocaleString()} VND`);
            $("#productDescription").text(product.description);
            $(".add-to-cart").data("id", product.id).data("name", product.name).data("price", product.price).data("image", product.image);
            $("#productDetailModal").modal("show");
        }
    });

    // THÊM VÀO GIỎ
    $(document).on("click", ".add-to-cart", function() {
        const productId = $(this).data("id");
        const productName = $(this).data("name");
        const productPrice = $(this).data("price");
        const productImage = $(this).data("image");

        const cart = JSON.parse(localStorage.getItem("cart")) || [];
        const found = cart.find(item => item.id === productId);

        if (found) {
            found.quantity += 1;
        } else {
            cart.push({ id: productId, name: productName, price: productPrice, image: productImage, quantity: 1 });
        }

        localStorage.setItem("cart", JSON.stringify(cart));
        alert(`Sản phẩm ${productName} đã được thêm vào giỏ.`);
    });

    // GIỎ HÀNG
    if ($("#cart-items").length) {
        const cart = JSON.parse(localStorage.getItem("cart")) || [];
        const container = $("#cart-items");
        let total = 0;

        if (cart.length === 0) {
            container.html("<p>Giỏ hàng đang trống.</p>");
        } else {
            cart.forEach(item => {
                const itemTotal = item.quantity * item.price;
                total += itemTotal;
                container.append(`
                    <tr>
                        <td>${item.name}</td>
                        <td>${item.price.toLocaleString()} VND</td>
                        <td>${item.quantity}</td>
                        <td>${itemTotal.toLocaleString()} VND</td>
                    </tr>
                `);
            });
            $("#cart-total").text(`${total.toLocaleString()} VND`);
        }
    }

    // XÁC NHẬN THANH TOÁN
    if ($("#checkoutForm").length) {
        $("#checkoutForm").submit(function(e) {
            e.preventDefault();

            const name = $("#name").val().trim();
            const phone = $("#phone").val().trim();
            const address = $("#address").val().trim();

            if (!name || !phone || !address) {
                return alert("Vui lòng nhập đầy đủ thông tin giao hàng.");
            }

            const order = {
                name,
                phone,
                address,
                cart: JSON.parse(localStorage.getItem("cart")),
                date: new Date().toLocaleString()
            };

            localStorage.setItem("orderConfirm", JSON.stringify(order));
            localStorage.removeItem("cart");
            window.location.href = "confirmation.html";
        });
    }

    // XÁC NHẬN ĐƠN HÀNG
    if ($("#confirm-info").length) {
        const order = JSON.parse(localStorage.getItem("orderConfirm"));
        if (order) {
            $("#confirm-name").text(order.name);
            $("#confirm-phone").text(order.phone);
            $("#confirm-address").text(order.address);
            $("#confirm-date").text(order.date);
        }
    }

    // HOÁ ĐƠN
    if ($("#invoice-table").length) {
        const order = JSON.parse(localStorage.getItem("orderConfirm"));
        const table = $("#invoice-table tbody");
        let total = 0;

        if (order && order.cart) {
            order.cart.forEach(item => {
                const line = item.price * item.quantity;
                total += line;
                table.append(`
                    <tr>
                        <td>${item.name}</td>
                        <td>${item.quantity}</td>
                        <td>${item.price.toLocaleString()} VND</td>
                        <td>${line.toLocaleString()} VND</td>
                    </tr>
                `);
            });

            $("#invoice-name").text(order.name);
            $("#invoice-phone").text(order.phone);
            $("#invoice-address").text(order.address);
            $("#invoice-total").text(total.toLocaleString() + " VND");
        }
    }

    // TRANG GIỎ HÀNG CHI TIẾT
    if ($("#cartTable").length) {
        function loadCart() {
            let cart = JSON.parse(localStorage.getItem("cart")) || [];
            let total = 0;
            let tbody = $("#cartTable tbody");
            tbody.empty();

            if (cart.length === 0) {
                tbody.append(`<tr><td colspan="5" class="text-center">Giỏ hàng của bạn đang trống</td></tr>`);
            }

            cart.forEach((item, index) => {
                let itemTotal = item.price * item.quantity;
                total += itemTotal;

                tbody.append(`
                    <tr>
                        <td><img src="${item.image}" width="80" height="80" class="img-thumbnail" /></td>
                        <td>${item.name}</td>
                        <td>${item.price.toLocaleString()} VND</td>
                        <td>
                            <button class="btn btn-outline-danger btn-sm decrease-btn" data-id="${item.id}">-</button>
                            <span class="quantity mx-2">${item.quantity}</span>
                            <button class="btn btn-outline-success btn-sm increase-btn" data-id="${item.id}">+</button>
                        </td>
                        <td>${itemTotal.toLocaleString()} VND</td>
                    </tr>
                `);
            });

            $("#cartTotal").text(total.toLocaleString() + " VND");
        }

        $(document).on("click", ".decrease-btn", function() {
            const id = $(this).data("id");
            const cart = JSON.parse(localStorage.getItem("cart")) || [];
            const item = cart.find(p => p.id === id);

            if (item && item.quantity > 1) {
                item.quantity -= 1;
                localStorage.setItem("cart", JSON.stringify(cart));
                loadCart();
            }
        });

        $(document).on("click", ".increase-btn", function() {
            const id = $(this).data("id");
            const cart = JSON.parse(localStorage.getItem("cart")) || [];
            const item = cart.find(p => p.id === id);

            if (item) {
                item.quantity += 1;
                localStorage.setItem("cart", JSON.stringify(cart));
                loadCart();
            }
        });

        $("#checkout-btn").click(function() {
            let cart = JSON.parse(localStorage.getItem("cart")) || [];
            if (cart.length === 0) {
                alert("Giỏ hàng trống! Vui lòng thêm sản phẩm.");
            } else {
                window.location.href = "checkout.html";
            }
        });
        $(document).ready(function() {
            // Lấy dữ liệu giỏ hàng từ localStorage
            const cart = JSON.parse(localStorage.getItem('cart')) || [];

            // Kiểm tra nếu giỏ hàng trống
            if (cart.length === 0) {
                $('#cartTable tbody').html('<tr><td colspan="5" class="text-center">Giỏ hàng của bạn đang trống.</td></tr>');
                $('#cartTotal').text('0₫');
            } else {
                // Duyệt qua danh sách giỏ hàng để tạo bảng sản phẩm
                let total = 0;
                cart.forEach(item => {
                    const priceNumber = parseFloat(item.price.replace(/[^0-9.-]+/g, ""));
                    const itemTotal = priceNumber * item.quantity;
                    total += itemTotal;

                    $('#cartTable tbody').append(`
                        <tr>
                            <td><img src="${item.image}" alt="${item.name}" width="60"></td>
                            <td>${item.name}</td>
                            <td>${item.price}</td>
                            <td>
                                <button class="btn btn-outline-danger btn-sm decrease-btn" data-id="${item.id}">-</button>
                                <span class="quantity">${item.quantity}</span>
                                <button class="btn btn-outline-success btn-sm increase-btn" data-id="${item.id}">+</button>
                            </td>
                            <td>${itemTotal.toLocaleString()} VND</td>
                        </tr>
                    `);
                });

                // Hiển thị tổng tiền
                $('#cartTotal').text(total.toLocaleString() + ' VND');
            }

            // Xử lý thay đổi số lượng sản phẩm
            $(document).on('click', '.decrease-btn', function() {
                const id = $(this).data('id');
                const cart = JSON.parse(localStorage.getItem('cart')) || [];
                const item = cart.find(p => p.id === id);

                if (item && item.quantity > 1) {
                    item.quantity -= 1;
                    localStorage.setItem('cart', JSON.stringify(cart));
                    location.reload();
                }
            });

            $(document).on('click', '.increase-btn', function() {
                const id = $(this).data('id');
                const cart = JSON.parse(localStorage.getItem('cart')) || [];
                const item = cart.find(p => p.id === id);

                if (item) {
                    item.quantity += 1;
                    localStorage.setItem('cart', JSON.stringify(cart));
                    location.reload();
                }
            });

            // Xử lý thanh toán
            $('#checkout-btn').click(function() {
                if (cart.length === 0) {
                    alert("Giỏ hàng của bạn hiện tại trống. Vui lòng thêm sản phẩm.");
                } else {
                    // Chuyển hướng thanh toán, bạn có thể thay đổi để phù hợp với quy trình thanh toán của bạn
                    window.location.href = 'checkout.html';
                    $('#cartTotal').text(total.toLocaleString() + ' VND');
                }

                // Xử lý tăng số lượng
                $(document).on('click', '.increase-btn', function() {
                    const id = $(this).data('id');
                    let cart = JSON.parse(localStorage.getItem('cart')) || [];
                    const product = cart.find(p => p.id === id);
                    if (product) {
                        product.quantity += 1;
                        localStorage.setItem('cart', JSON.stringify(cart));
                        location.reload(); // Tải lại để cập nhật bảng
                    }
                });

                // Xử lý giảm số lượng
                $(document).on('click', '.decrease-btn', function() {
                    const id = $(this).data('id');
                    let cart = JSON.parse(localStorage.getItem('cart')) || [];
                    const product = cart.find(p => p.id === id);
                    if (product) {
                        product.quantity -= 1;
                        if (product.quantity <= 0) {
                            cart = cart.filter(p => p.id !== id); // Xoá sản phẩm nếu số lượng <= 0
                        }
                        localStorage.setItem('cart', JSON.stringify(cart));
                        location.reload();
                    }
                });

                // Xử lý nút thanh toán
                $('#checkout-btn').click(function() {
                    if (cart.length === 0) {
                        alert('Giỏ hàng trống!');
                        return;
                    }
                    window.location.href = 'checkout.html'; // Điều hướng tới trang thanh toán
                });
            });
        });
        loadCart();
    }
});