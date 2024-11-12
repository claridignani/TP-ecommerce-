import models from "../models"; // Importa los modelos necesarios para interactuar con la base de datos

export default {
    // Método para registrar un nuevo cupón
    register: async (req, res) => {
        try {
            let data = req.body; // Obtiene los datos del cuerpo de la solicitud

            // Verifica si ya existe un cupón con el mismo código
            let exits_cupone = await models.Cupone.findOne({ code: data.code });

            if (exits_cupone) {
                // Si el código ya existe, responde con un mensaje de error
                res.status(200).json({
                    message: 403,
                    message_text: "EL CODIGO DEL CUPON YA EXISTE"
                });
                return; // Termina la ejecución del método
            }

            // Crea un nuevo cupón en la base de datos
            let cupone = await models.Cupone.create(data);

            // Responde confirmando que el cupón fue registrado correctamente
            res.status(200).json({
                message: 200,
                message_text: "EL CUPON REGISTRO CORRECTAMENTE",
                cupone: cupone // Devuelve el cupón creado
            });

        } catch (error) {
            // Manejo de errores en caso de que ocurra un problema
            res.status(500).send({
                message: "OCURRIO UN ERROR",
            });
        }
    },

    // Método para actualizar un cupón existente
    update: async (req, res) => {
        try {
            let data = req.body; // Obtiene los datos del cuerpo de la solicitud

            // Verifica si ya existe otro cupón con el mismo código, excluyendo el cupón que se está actualizando
            let exits_cupone = await models.Cupone.findOne({ code: data.code, _id: { $ne: data._id } });

            if (exits_cupone) {
                // Si el código ya existe, responde con un mensaje de error
                res.status(200).json({
                    message: 403,
                    message_text: "EL CODIGO DEL CUPON YA EXISTE"
                });
                return; // Termina la ejecución del método
            }

            // Actualiza el cupón en la base de datos utilizando el ID proporcionado
            let cupone = await models.Cupone.findByIdAndUpdate({ _id: data._id }, data);
            
            // Busca el cupón actualizado para enviar en la respuesta
            let cuponeT = await models.Cupone.findById({ _id: data._id });

            // Responde con un mensaje de éxito y el cupón actualizado
            res.status(200).json({
                message: 200,
                message_text: "EL CUPON SE ACTUALIZO CORRECTAMENTE",
                cupone: cuponeT, // Devuelve el cupón actualizado
            });

        } catch (error) {
            // Manejo de errores en caso de que ocurra un problema
            res.status(500).send({
                message: "OCURRIO UN ERROR",
            });
        }
    },

    // Método para eliminar un cupón
    delete: async (req, res) => {
        try {
            let _id = req.query._id; // Obtiene el ID del cupón de los parámetros de la consulta

            // Elimina el cupón de la base de datos
            await models.Cupone.findByIdAndDelete({ _id: _id });

            // Responde confirmando la eliminación del cupón
            res.status(200).json({
                message: 200,
                message_text: "EL CUPON SE ELIMINO CORRECTAMENTE",
            });

        } catch (error) {
            // Manejo de errores en caso de que ocurra un problema
            res.status(500).send({
                message: "OCURRIO UN ERROR",
            });
        }
    },

    // Método para listar cupones según un término de búsqueda
    list: async (req, res) => {
        try {
            let search = req.query.search; // Obtiene el término de búsqueda de los parámetros de la consulta

            // Busca cupones que coincidan con el término de búsqueda (sin importar mayúsculas/minúsculas)
            let cupones = await models.Cupone.find({
                $or: [
                    { "code": new RegExp(search, "i") }, // Busca en el código del cupón
                ]
            }).sort({ 'createdAt': -1 }); // Ordena por fecha de creación de forma descendente

            // Responde con la lista de cupones encontrados
            res.status(200).json({
                message: 200,
                cupones: cupones, // Devuelve la lista de cupones
            });

        } catch (error) {
            // Manejo de errores en caso de que ocurra un problema
            res.status(500).send({
                message: "OCURRIO UN ERROR",
            });
        }
    },

    // Método para mostrar un cupón específico
    show: async (req, res) => {
        try {
            let cupone_id = req.query.cupone_id; // Obtiene el ID del cupón de los parámetros de la consulta

            // Busca el cupón en la base de datos
            let cupon = await models.Cupone.findOne({ _id: cupone_id });

            // Responde con el cupón encontrado
            res.status(200).json({
                message: 200,
                cupon: cupon, // Devuelve el cupón encontrado
            });

        } catch (error) {
            // Manejo de errores en caso de que ocurra un problema
            res.status(500).send({
                message: "OCURRIO UN ERROR",
            });
        }
    },

    // Método para obtener configuración de productos y categorías
    config: async (req, res) => {
        try {
            // Busca productos que estén activos (estado 2)
            let Products = await models.Product.find({ state: 2 });
            // Busca categorías que estén disponibles (estado 1)
            let Categories = await models.Categorie.find({ state: 1 });

            // Responde con la configuración obtenida
            res.status(200).json({
                message: 200,
                products: Products, // Devuelve la lista de productos
                categories: Categories, // Devuelve la lista de categorías
            });

        } catch (error) {
            // Manejo de errores en caso de que ocurra un problema
            res.status(500).send({
                message: "OCURRIO UN ERROR",
            });
        }
    },
}
