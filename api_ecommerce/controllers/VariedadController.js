import models from '../models'; // Importa los modelos de la base de datos.

export default {
    // Función para registrar una nueva variedad o actualizar una existente.
    register: async (req, res) => {
        try {
            let data = req.body; // Obtiene los datos del cuerpo de la solicitud.

            // Busca si ya existe una variedad con el mismo valor y producto.
            let variedad_exits = await models.Variedad.findOne({ valor: data.valor, product: data.product });
            var variedad = null; // Inicializa la variable variedad.

            if (variedad_exits) {
                // Si existe, actualiza el stock sumando el nuevo stock.
                data.stock = variedad_exits.stock + data.stock;
                await models.Variedad.findByIdAndUpdate({ _id: variedad_exits._id }, data); // Actualiza la variedad existente.
                variedad = await models.Variedad.findById({ _id: variedad_exits._id }); // Obtiene la variedad actualizada.
            } else {
                // Si no existe, crea una nueva variedad.
                variedad = await models.Variedad.create(data);
            }

            // Responde con la variedad creada o actualizada.
            res.status(200).json({
                variedad: variedad
            });
        } catch (error) {
            res.status(500).send({
                message: "OCURRIO UN PROBLEMA" // Responde con un mensaje de error.
            });
            console.log(error); // Imprime el error en consola.
        }
    },

    // Función para actualizar una variedad existente.
    update: async (req, res) => {
        try {
            let data = req.body; // Obtiene los datos del cuerpo de la solicitud.

            await models.Variedad.findByIdAndUpdate({ _id: data._id }, data); // Actualiza la variedad en la base de datos.

            // Busca la variedad actualizada y la devuelve.
            let variedad = await models.Variedad.findById({ _id: data._id });

            res.status(200).json({
                variedad: variedad // Responde con la variedad actualizada.
            });
        } catch (error) {
            res.status(500).send({
                message: "OCURRIO UN PROBLEMA" // Responde con un mensaje de error.
            });
            console.log(error); // Imprime el error en consola.
        }
    },

    // Función para eliminar una variedad.
    delete: async (req, res) => {
        try {
            let _id = req.params.id; // Obtiene el ID de la variedad desde los parámetros de la solicitud.

            await models.Variedad.findByIdAndDelete({ _id: _id }); // Elimina la variedad de la base de datos.

            res.status(200).json({
                message: "SE ELIMINO LA VARIEDAD" // Responde con un mensaje de éxito.
            });
        } catch (error) {
            res.status(500).send({
                message: "OCURRIO UN PROBLEMA" // Responde con un mensaje de error.
            });
            console.log(error); // Imprime el error en consola.
        }
    },
};
