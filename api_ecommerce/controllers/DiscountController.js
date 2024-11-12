import models from "../models"

export default {
    // Función para registrar un nuevo descuento
    register: async(req, res) => {
        try {
            let data = req.body; // Captura los datos del cuerpo de la solicitud
            var filter_a = []; // Filtros para buscar descuentos que empiezan en el rango de fechas
            var filter_b = []; // Filtros para buscar descuentos que terminan en el rango de fechas

            // Verifica el tipo de segmento para determinar cómo filtrar
            if (data.type_segment == 1) {
                filter_a.push({
                    "products": { $elemMatch: { _id: { $in: data.product_s } } }
                });
                filter_b.push({
                    "products": { $elemMatch: { _id: { $in: data.product_s } } }
                });
            } else {
                filter_a.push({
                    "categories": { $elemMatch: { _id: { $in: data.categorie_s } } }
                });
                filter_b.push({
                    "categories": { $elemMatch: { _id: { $in: data.categorie_s } } }
                });
            }

            // Añade filtros por tipo de campaña y rango de fechas
            filter_a.push({
                type_campaign: data.type_campaign,
                start_date_num: { $gte: data.start_date_num, $lte: data.end_date_num }
            });
            filter_b.push({
                type_campaign: data.type_campaign,
                end_date_num: { $gte: data.start_date_num, $lte: data.end_date_num }
            });

            // Comprueba si ya existe un descuento con las fechas proporcionadas
            let exits_start_date = await models.Discount.find({ $and: filter_a });
            let exits_end_date = await models.Discount.find({ $and: filter_b });

            if (exits_start_date.length > 0 || exits_end_date.length > 0) {
                res.status(200).json({
                    message: 403,
                    message_text: "EL DESCUENTO NO SE PUEDE PROGRAMAR ELIMINAR ALGUNAS OPCIONES"
                });
                return; // Sale de la función si hay conflictos
            }

            // Crea un nuevo descuento si no hay conflictos
            let discount = await models.Discount.create(data);

            res.status(200).json({
                message: 200,
                message_text: "EL DESCUENTO SE REGISTRO CORRECTAMENTE",
                discount: discount
            });

        } catch (error) {
            console.log(error); // Registra el error en la consola
            res.status(500).send({
                message: "OCURRIO UN ERROR",
            });
        }
    },

    // Función para actualizar un descuento existente
    update: async(req, res) => {
        try {
            let data = req.body; // Captura los datos del cuerpo de la solicitud
            var filter_a = []; // Filtros para buscar descuentos que empiezan en el rango de fechas
            var filter_b = []; // Filtros para buscar descuentos que terminan en el rango de fechas

            // Verifica el tipo de segmento para determinar cómo filtrar
            if (data.type_segment == 1) {
                filter_a.push({
                    "products": { $elemMatch: { _id: { $in: data.product_s } } }
                });
                filter_b.push({
                    "products": { $elemMatch: { _id: { $in: data.product_s } } }
                });
            } else {
                filter_a.push({
                    "categories": { $elemMatch: { _id: { $in: data.categorie_s } } }
                });
                filter_b.push({
                    "categories": { $elemMatch: { _id: { $in: data.categorie_s } } }
                });
            }

            // Añade filtros por tipo de campaña y rango de fechas, excluyendo el ID del descuento que se está actualizando
            filter_a.push({
                type_campaign: data.type_campaign,
                _id: { $ne: data._id },
                start_date_num: { $gte: data.start_date_num, $lte: data.end_date_num }
            });
            filter_b.push({
                type_campaign: data.type_campaign,
                _id: { $ne: data._id },
                end_date_num: { $gte: data.start_date_num, $lte: data.end_date_num }
            });

            // Comprueba si ya existe un descuento con las fechas proporcionadas
            let exits_start_date = await models.Discount.find({ $and: filter_a });
            let exits_end_date = await models.Discount.find({ $and: filter_b });

            if (exits_start_date.length > 0 || exits_end_date.length > 0) {
                res.status(200).json({
                    message: 403,
                    message_text: "EL DESCUENTO NO SE PUEDE PROGRAMAR ELIMINAR ALGUNAS OPCIONES"
                });
                return; // Sale de la función si hay conflictos
            }

            // Actualiza el descuento si no hay conflictos
            let discount = await models.Discount.findByIdAndUpdate({ _id: data._id }, data);

            res.status(200).json({
                message: 200,
                message_text: "EL DESCUENTO SE REGISTRO CORRECTAMENTE",
                discount: discount
            });

        } catch (error) {
            res.status(500).send({
                message: "OCURRIO UN ERROR",
            });
        }
    },

    // Función para eliminar un descuento
    delete: async(req, res) => {
        try {
            let _id = req.query._id; // Captura el ID del descuento a eliminar

            await models.Discount.findByIdAndDelete({ _id: _id }); // Elimina el descuento

            res.status(200).json({
                message: 200,
                message_text: "EL DESCUENTO SE ELIMINO CORRECTAMENTE",
            });

        } catch (error) {
            res.status(500).send({
                message: "OCURRIO UN ERROR",
            });
        }
    },

    // Función para listar todos los descuentos
    list: async(req, res) => {
        try {
            // let search = req.query.search; // Comentar si no se utiliza

            let discounts = await models.Discount.find().sort({ 'createdAt': -1 }); // Obtiene todos los descuentos ordenados por fecha de creación

            res.status(200).json({
                message: 200,
                discounts: discounts,
            });

        } catch (error) {
            res.status(500).send({
                message: "OCURRIO UN ERROR",
            });
        }
    },

    // Función para mostrar un descuento específico
    show: async(req, res) => {
        try {
            let discount_id = req.query.discount_id; // Captura el ID del descuento a mostrar

            let discount = await models.Discount.findOne({ _id: discount_id }); // Busca el descuento por ID

            res.status(200).json({
                message: 200,
                discount: discount,
            });

        } catch (error) {
            res.status(500).send({
                message: "OCURRIO UN ERROR",
            });
        }
    },

    // Función para obtener configuración de productos y categorías
    config: async(req, res) => {
        try {
            let Products = await models.Product.find({ state: 2 }); // Obtiene productos activos
            let Categories = await models.Categorie.find({ state: 1 }); // Obtiene categorías activas

            res.status(200).json({
                message: 200,
                products: Products,
                categories: Categories,
            });

        } catch (error) {
            res.status(500).send({
                message: "OCURRIO UN ERROR",
            });
        }
    },
}
