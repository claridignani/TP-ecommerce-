import models from "../models"; // Importa los modelos de la base de datos.

export default {
    // Función para registrar una nueva reseña.
    register: async (req, res) => {
        try {
            // Crea una nueva reseña utilizando los datos del cuerpo de la solicitud.
            let review = await models.Review.create(req.body);

            // Responde con un mensaje de éxito y los detalles de la reseña creada.
            res.status(200).json({
                message: "LA RESEÑA HA SIDO REGISTRADA CORRECTAMENTE", // Mensaje de éxito.
                review: review, // Detalles de la reseña registrada.
            });
        } catch (error) {
            console.log(error); // Imprime el error en la consola para depuración.
            // Responde con un mensaje de error si ocurre algún problema.
            res.status(500).send({
                message: "OCURRIO UN ERROR", // Mensaje de error genérico.
            });
        }
    },

    // Función para actualizar una reseña existente.
    update: async (req, res) => {
        try {
            // Actualiza la reseña según el ID proporcionado en el cuerpo de la solicitud.
            await models.Review.findByIdAndUpdate({ _id: req.body._id }, req.body);

            // Busca la reseña actualizada para devolverla en la respuesta.
            let reviewD = await models.Review.findById({ _id: req.body._id });
            // Responde con un mensaje de éxito y los detalles de la reseña actualizada.
            res.status(200).json({
                message: "LA RESEÑA HA MODIFICADO CORRECTAMENTE", // Mensaje de éxito.
                review: reviewD // Detalles de la reseña modificada.
            });
        } catch (error) {
            console.log(error); // Imprime el error en la consola para depuración.
            // Responde con un mensaje de error si ocurre algún problema.
            res.status(500).send({
                message: "OCURRIO UN ERROR", // Mensaje de error genérico.
            });
        }
    },
}
