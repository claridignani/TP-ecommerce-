import models from '../models'
import resource from '../resources'

export default {
    // Método para listar los carritos de compra de un usuario específico
    list: async (req, res) => {
        try {
            // Obtiene el ID del usuario desde los parámetros de la consulta
            let user_id = req.query.user_id;
            // Busca los carritos de compra asociados al usuario y hace un 'populate' para obtener detalles de 'variedad' y 'product'
            let CARTS = await models.Cart.find({
                user: user_id,
            }).populate("variedad").populate({
                path: "product",
                populate: {
                    path: "categorie"
                },
            });

            // Mapea los carritos de compra para darles un formato específico usando 'resource'
            CARTS = CARTS.map((cart) => {
                return resource.Cart.cart_list(cart);
            });

            // Responde con los carritos de compra encontrados
            res.status(200).json({
                carts: CARTS,
            })
        } catch (error) {
            // Manejo de errores en caso de que ocurra un problema
            res.status(500).send({
                message: "OCURRIO UN ERROR",
            });
            console.log(error);
        }
    },
    
    // Método para registrar un nuevo carrito de compra
    register: async (req, res) => {
        try {
            let data = req.body;

            // Validación: verifica si el producto ya existe en el carrito
            if (data.variedad) {
                let valid_cart = await models.Cart.findOne({
                    user: data.user,
                    variedad: data.variedad,
                    product: data.product,
                });
                if (valid_cart) {
                    res.status(200).json({
                        message: 403,
                        message_text: "EL PRODUCTO CON LA VARIEDAD YA EXISTE EN EL CARRITO DE COMPRA",
                    });
                    return; // Termina la ejecución si el producto ya existe
                }
            } else {
                let valid_cart = await models.Cart.findOne({
                    user: data.user,
                    product: data.product,
                });
                if (valid_cart) {
                    res.status(200).json({
                        message: 403,
                        message_text: "EL PRODUCTO YA EXISTE EN EL CARRITO DE COMPRA",
                    });
                    return; // Termina la ejecución si el producto ya existe
                }
            }

            // Validación: verifica si hay suficiente stock disponible
            if (data.variedad) {
                let valid_variedad = await models.Variedad.findOne({
                    id_: data.variedad,
                });
                if (valid_variedad.stock < data.cantidad) {
                    res.status(200).json({
                        message: 403,
                        message_text: "EL STOCK NO ESTA DISPONIBLE"
                    });
                    return; // Termina la ejecución si no hay stock disponible
                }
            } else {
                let valid_product = await models.Product.findOne({
                    _id: data.product,
                });
                if (valid_product.stock < data.cantidad) {
                    res.status(200).json({
                        message: 403,
                        message_text: "EL STOCK NO ESTA DISPONIBLE"
                    });
                    return; // Termina la ejecución si no hay stock disponible
                }
            }
            
            // Crea un nuevo carrito con los datos proporcionados
            let CART = await models.Cart.create(data);
            
            // Busca el carrito recién creado y lo puebla con los detalles necesarios
            let NEW_CART = await models.Cart.findById({_id: CART._id}).populate("variedad").populate({
                path: "product",
                populate: {
                    path: "categorie"
                },
            });
            // Responde con el carrito creado
            res.status(200).json({
                cart: resource.Cart.cart_list(NEW_CART),
                message_text: "EL CARRITO SE REGISTRO CON EXITO",
            })
        } catch (error) {
            // Manejo de errores en caso de que ocurra un problema
            res.status(500).send({
                message: "OCURRIO UN ERROR",
            });
            console.log(error);
        }
    },
    
    // Método para actualizar un carrito de compra existente
    update: async (req, res) => {
        try {
            let data = req.body;

            // Validación: verifica si hay suficiente stock disponible
            if (data.variedad) {
                let valid_variedad = await models.Variedad.findOne({
                    id_: data.variedad,
                });
                if (valid_variedad.stock < data.cantidad) {
                    res.status(200).json({
                        message: 403,
                        message_text: "EL STOCK NO ESTA DISPONIBLE"
                    });
                    return; // Termina la ejecución si no hay stock disponible
                }
            } else {
                let valid_product = await models.Product.findOne({
                    _id: data.product,
                });
                if (valid_product.stock < data.cantidad) {
                    res.status(200).json({
                        message: 403,
                        message_text: "EL STOCK NO ESTA DISPONIBLE"
                    });
                    return; // Termina la ejecución si no hay stock disponible
                }
            }
            
            // Actualiza el carrito de compra con los nuevos datos
            let CART = await models.Cart.findByIdAndUpdate({_id: data._id}, data);
            
            // Busca el carrito actualizado y lo puebla con los detalles necesarios
            let NEW_CART = await models.Cart.findById({_id: CART._id}).populate("variedad").populate({
                path: "product",
                populate: {
                    path: "categorie"
                },
            });
            // Responde con el carrito actualizado
            res.status(200).json({
                cart: resource.Cart.cart_list(NEW_CART),
                message_text: "EL CARRITO SE ACTUALIZO CON EXITO",
            })
        } catch (error) {
            // Manejo de errores en caso de que ocurra un problema
            res.status(500).send({
                message: "OCURRIO UN ERROR",
            });
            console.log(error);
        }
    },
    
    // Método para eliminar un carrito de compra
    delete: async (req, res) => {
        try {
            let _id = req.params.id; // Obtiene el ID del carrito a eliminar
            let CART = await models.Cart.findByIdAndDelete({_id: _id}); // Elimina el carrito

            // Responde confirmando la eliminación del carrito
            res.status(200).json({
                message_text: "EL CARRITO SE ELIMINO CORRECTAMENTE",
            });
        } catch (error) {
            // Manejo de errores en caso de que ocurra un problema
            res.status(500).send({
                message: "OCURRIO UN ERROR",
            });
            console.log(error);
        }
    },
    
    // Método para aplicar un cupón a un carrito de compra
    applyCupon: async (req, res) => {
        try {
            let data = req.body;

            // Validación: verifica si el cupón existe
            let CUPON = await models.Cupone.findOne({
                code: data.code,
            })
            if (!CUPON) {
                res.status(200).json({
                    message: 403,
                    message_text: "EL CUPON INGRESADO NO EXISTE, DIGITE OTRO NUEVAMENTE"
                });
                return; // Termina la ejecución si el cupón no existe
            }

            // Obtiene todos los carritos del usuario para aplicar el cupón
            let carts = await models.Cart.find({user: data.user_id}).populate("product");
            console.log(carts);
            let products = [];
            let categories = [];

            // Prepara listas de productos y categorías para la aplicación del cupón
            CUPON.products.forEach((product) => {
                products.push(product._id);
            });
            CUPON.categories.forEach((categorie) => {
                categories.push(categorie._id);
            });
            console.log(products);
            console.log(categories);
            
            // Recorre los carritos para aplicar el cupón donde corresponda
            for (const cart of carts) {
                // Verifica si el producto está en la lista de productos del cupón
                if (products.length > 0) {
                    if (products.includes(cart.product._id + "")) {
                        let subtotal = 0;
                        let total = 0;
                        // Calcula el nuevo subtotal y total según el tipo de descuento
                        if (CUPON.type_discount == 1) { // Porcentaje
                            subtotal = cart.price_unitario - cart.price_unitario * (CUPON.discount * 0.01);
                        } else { // Por moneda
                            subtotal = cart.price_unitario - CUPON.discount;
                        }
                        total = subtotal * cart.cantidad;

                        // Actualiza el carrito con los nuevos valores
                        await models.Cart.findByIdAndUpdate({_id: cart._id}, {
                            subtotal: subtotal,
                            total: total,
                            type_discount: CUPON.type_discount,
                            discount: CUPON.discount,
                            code_cupon: CUPON.code,
                        });
                    }
                }

                // Verifica si la categoría del producto está en la lista de categorías del cupón
                if (categories.length > 0) {
                    if (categories.includes(cart.product.categorie + "")) {
                        let subtotal = 0;
                        let total = 0;
                        // Calcula el nuevo subtotal y total según el tipo de descuento
                        if (CUPON.type_discount == 1) { // Porcentaje
                            subtotal = cart.price_unitario - cart.price_unitario * (CUPON.discount * 0.01);
                        } else { // Por moneda
                            subtotal = cart.price_unitario - CUPON.discount;
                        }
                        total = subtotal * cart.cantidad;

                        // Actualiza el carrito con los nuevos valores
                        await models.Cart.findByIdAndUpdate({_id: cart._id}, {
                            subtotal: subtotal,
                            total: total,
                            type_discount: CUPON.type_discount,
                            discount: CUPON.discount,
                            code_cupon: CUPON.code,
                        });
                    }
                }
            }

            // Responde confirmando la aplicación del cupón
            res.status(200).json({
                message_text: "EL CUPON SE APLICO CORRECTAMENTE",
            });
        } catch (error) {
            // Manejo de errores en caso de que ocurra un problema
            res.status(500).send({
                message: "OCURRIO UN ERROR",
            });
            console.log(error);
        }
    },
}
