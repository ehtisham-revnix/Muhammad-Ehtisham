function openProductDetails(productId) {
        const produuctArr = document.querySelectorAll(".product-popup-wrapper .product-item");
        produuctArr.forEach(item => {
            if(productId === Number(item.getAttribute('data-product-id'))) {
            item.style.display = 'block';
            item.parentNode.style.display = 'block';
            document.querySelector("body").style.overflow = 'hidden';
            const url = new URL(window.location.href);
            url.searchParams.delete('color');
            url.searchParams.delete('size');
            window.history.pushState({}, '', url.toString());
        }else {
        }
        });
    }

    function closePopUp(element) {
        element.parentNode.style.display = 'none';
        document.querySelector(".product-popup-wrapper").style.display = 'none';
        document.querySelector("body").style.overflow = 'unset';
        const url = new URL(window.location.href);
        url.searchParams.delete('color');
        url.searchParams.delete('size');
        window.history.pushState({}, '', url.toString());
        const buttons = document.querySelectorAll(".variant-color > button");
        buttons.forEach(button => {
                button.classList.remove('btn-active');
        });

        const selects = document.querySelectorAll('.variant-size select');
        selects.forEach(select => {
            select.selectedIndex = 0;
        });
    }

    function selectColorVar(colorVar) {
        const url = new URL(window.location.href);
        url.searchParams.set('color', colorVar.getAttribute('data-color'));
        window.history.pushState({}, '', url.toString());
        const buttons = document.querySelectorAll(".variant-color > button");
        buttons.forEach(button => {
            button.classList.remove('btn-active');
        });
        colorVar.classList.add('btn-active');
    }
    function selectSizeVar(sizeVar) {
        const url = new URL(window.location.href);
        url.searchParams.set('size', sizeVar.value);
         window.history.pushState({}, '', url.toString());
    }


    async function addToCart(productHandle, quantity) {
    const urlParams = new URLSearchParams(window.location.search);
    const size = urlParams.get('size');
    const color = urlParams.get('color');

    let variantId = null;
    let extraVariantId = 41524010451019;
    await fetch(window.Shopify.routes.root + `products/${productHandle}.js`)
        .then(response => response.json())
        .then(product => {
            const variants = product.variants;
            if (size && color) {
                const match = variants.find(v => 
                    v.option1 === size &&
                    v.option2 === color &&
                    v.available
                );
                if (match) {
                    variantId = match.id;
                    return;
                }
            }

            if (!size && color) {
                const match = variants.find(v => 
                    v.option2 === color &&
                    v.available
                );
                if (match) {
                    variantId = match.id;
                    return;
                }
            }

            if (size && !color) {
                const match = variants.find(v => 
                    v.option1 === size &&
                    v.available
                );
                if (match) {
                    variantId = match.id;
                    return;
                }
            }

            const firstAvailable = variants.find(v => v.available);
            if (firstAvailable) {
                variantId = firstAvailable.id;
            }
        });


        let formData = {}
        if(size === 'M' && color === "Black"){
            formData = {
                'items': [
                    {
                    'id': variantId,
                    'quantity': quantity
                    },
                    {
                    'id': extraVariantId,
                    'quantity': quantity
                    }
                ]
            };
        }
        else if(!size || !color ){
            formData = {
                'items': [
                    {
                    'id': variantId,
                    'quantity': quantity
                    }
                ]
            };
        }
        else if(size && !color) {
                formData = {
                    'items': [{
                    'id': variantId,
                    'quantity': quantity
                    }]
                };
            }
            else if(!size && color) {
                formData = {
                    'items': [{
                    'id': variantId,
                    'quantity': quantity
                    }]
                };
            }
        else {
                formData = {
                    'items': [{
                    'id': variantId,
                    'quantity': quantity
                    }]
                };
            }

            fetch(window.Shopify.routes.root + 'cart/add.js', {
                method: 'POST',
                headers: {
                'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            })
            .then(response => {
                const popups = document.querySelectorAll(".product-popup-wrapper .product-item");
                popups.forEach(item => {
                    item.style.display = 'none';
                });
                const confirmationBox = document.querySelector(".confirmation-box");
                confirmationBox.style.display = 'block';
                confirmationBox.innerHTML = `<div class="confirmation-message"> Product added to cart successfully! <img src="https://cdn.shopify.com/s/files/1/0618/9108/4363/files/success-green-check-mark-icon.png?v=1749735466"/> </div>`;
                setTimeout(() => {
                    document.querySelector("body").style.overflow = 'unset';
                    confirmationBox.style.display = 'none';
                    document.querySelector(".product-popup-wrapper").style.display = 'none';
                    const buttons = document.querySelectorAll(".variant-color > button");
                    buttons.forEach(button => {
                        button.classList.remove('btn-active');
                    });
                    const selects = document.querySelectorAll('.variant-size select');
                    selects.forEach(select => {
                        select.selectedIndex = 0;
                    });
                    const url = new URL(window.location.href);
                        url.searchParams.delete('color');
                        url.searchParams.delete('size');
                        window.history.pushState({}, '', url.toString());
                    }, 3000);

                return response.json();
            })
            .catch((error) => {
                console.error('Error:', error);
            });
    }
