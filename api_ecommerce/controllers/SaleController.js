import models from '../models'; // Importa los modelos de la base de datos.

import fs from 'fs'; // Importa el módulo para manejar el sistema de archivos.
import handlebars from 'handlebars'; // Importa Handlebars para el manejo de plantillas HTML.
import ejs from 'ejs'; // Importa EJS para renderizar plantillas.
import nodemailer from 'nodemailer'; // Importa Nodemailer para enviar correos electrónicos.
import smtpTransport from 'nodemailer-smtp-transport'; // Importa el transporte SMTP de Nodemailer.

async function send_email(sale_id) {
    try {
        // Función para leer un archivo HTML.
        var readHTMLFile = function(path, callback) {
            fs.readFile(path, {encoding: 'utf-8'}, function (err, html) {
                if (err) {
                    throw err; // Lanza un error si no se puede leer el archivo.
                    callback(err);
                } else {
                    callback(null, html); // Devuelve el HTML leído si no hay errores.
                }
            });
        };  
        
        // Busca la orden de venta por su ID y hace populate del usuario asociado.
        let Order = await models.Sale.findById({_id: sale_id}).populate("user");
        // Busca los detalles de la venta asociada a la orden.
        let OrderDetail = await models.SaleDetail.find({sale: Order._id}).populate("product").populate("variedad");
        // Busca la dirección de la venta.
        let AddressSale = await models.SaleAddress.findOne({sale: Order._id});
        
        // Configura el transportador de correo utilizando Gmail.
        var transporter = nodemailer.createTransport(smtpTransport({
            service: 'gmail',
            host: 'smtp.gmail.com',
            auth: {
                user: 'belutomas2003@gmail.com',
                pass: 'nrrvkifxijeptxpw' // Nota: No se recomienda incluir contraseñas en el código.
            }
        }));

        // Lee el archivo HTML para el correo.
        readHTMLFile(process.cwd() + '/mails/email_sale.html', (err, html) => {
            // Modifica la imagen del producto para incluir la URL del backend.
            OrderDetail.map((detail) => {
                detail.product.imgs = process.env.URL_BACKEND + '/api/products/uploads/product/' + detail.product.portada;
                return detail;
            });

            // Renderiza el HTML del correo con los detalles de la orden.
            let rest_html = ejs.render(html, {order: Order, address_sale: AddressSale, order_detail: OrderDetail});
    
            var template = handlebars.compile(rest_html);
            var htmlToSend = template({op: true}); // Genera el HTML final para enviar.
    
            // Configura las opciones del correo.
            var mailOptions = {
                from: 'belutomas2003@gmail.com',
                to: Order.user.email, // Dirección de correo del usuario.
                subject: 'Finaliza tu compra ' + Order._id, // Asunto del correo.
                html: htmlToSend // Contenido del correo en HTML.
            };
          
            // Envía el correo.
            transporter.sendMail(mailOptions, function(error, info) {
                if (!error) {
                    console.log('Email sent: ' + info.response); // Imprime en consola la respuesta del envío.
                }
            });
        });
        
        // Respuesta comentada (no se envía actualmente).
        // res.status(200).json({
        //     message: "EL CORREO SE ENVIO CORRECTAMENTE",
        // });
    } catch (error) {
        console.log(error); // Imprime el error en consola si ocurre un problema.
        // Respuesta comentada (no se envía actualmente).
        // res.status(500).send({
        //     menssage:"OCURRIO UN ERROR",
        // });
    }
}

export default {
    // Función para registrar una nueva venta.
    register: async (req, res) => {
        try {
            let sale_data = req.body.sale; // Obtiene los datos de la venta del cuerpo de la solicitud.
            let sale_address_data = req.body.sale_address; // Obtiene los datos de la dirección.

            // Crea la venta y obtiene la orden.
            let SALE = await models.Sale.create(sale_data);

            sale_address_data.sale = SALE._id; // Asocia la dirección a la venta.
            // Crea la dirección de la venta.
            let SALE_ADDRESS = await models.SaleAddress.create(sale_address_data);

            // Busca los artículos en el carrito del usuario.
            let CARTS = await models.Cart.find({user: SALE.user});
            
            // Itera sobre cada carrito y actualiza el stock de los productos.
            for (let CART of CARTS) {
                CART = CART.toObject(); // Convierte el carrito a un objeto.
                CART.sale = SALE._id; // Asocia la venta al carrito.
                
                // Descuento de inventario.
                if (CART.variedad) { // Si hay variedad (productos múltiples).
                    let VARIEDAD = await models.Variedad.findById({_id: CART.variedad});
                    let new_stock = VARIEDAD.stock - CART.cantidad; // Calcula el nuevo stock.

                    await models.Variedad.findByIdAndUpdate({_id: CART.variedad}, {
                        stock: new_stock,
                    });
                } else { // Si es un producto unitario.
                    let PRODUCT = await models.Product.findById({_id: CART.product});
                    let new_stock = PRODUCT.stock - CART.cantidad; // Calcula el nuevo stock.

                    await models.Product.findByIdAndUpdate({_id: CART.product}, {
                        stock: new_stock,
                    });
                }
                
                // Crea los detalles de la venta.
                await models.SaleDetail.create(CART);
                // Elimina el carrito una vez procesado.
                await models.Cart.findByIdAndDelete({_id: CART._id});
            }

            // Envía el correo de confirmación de la venta.
            await send_email(SALE._id);

            // Responde con un mensaje de éxito.
            res.status(200).json({
                message: "LA ORDEN DE GENERO CORRECTAMENTE",
            });
        } catch (error) {
            console.log(error); // Imprime el error en consola si ocurre un problema.
            // Responde con un mensaje de error si ocurre algún problema.
            res.status(500).send({
                message: "HUBO UN ERROR",
            });
        }
    },
}
