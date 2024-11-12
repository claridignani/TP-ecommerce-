import models from "../models"; // Importa los modelos necesarios para interactuar con la base de datos

export default {
    // Método para registrar una nueva dirección de cliente
    register: async (req, res) => {
        try {
            // Crea una nueva dirección de cliente utilizando los datos enviados en el cuerpo de la solicitud
            const address_client = await models.AddressClient.create(req.body);
            // Responde con un mensaje de éxito y los detalles de la dirección creada
            res.status(200).json({
                message: "LA DIRECCIÓN DEL CLIENTE SE REGISTRO CORRECTAMENTE",
                address_client: address_client,
            });
        } catch (error) {
            // Manejo de errores en caso de que ocurra un problema
            console.log(error);
            res.status(500).send({
                message: "HUBO UN ERROR",
            });
        }
    },

    // Método para actualizar una dirección de cliente existente
    update: async (req, res) => {
        try {
            let data = req.body; // Obtiene los datos enviados en el cuerpo de la solicitud
            // Actualiza la dirección del cliente con el ID proporcionado
            await models.AddressClient.findByIdAndUpdate({ _id: req.body._id }, data);
            // Busca la dirección actualizada para enviarla en la respuesta
            let AddressClient = await models.AddressClient.findById({ _id: req.body._id });
            // Responde con un mensaje de éxito y los detalles de la dirección actualizada
            res.status(200).json({
                message: "LA DIRECCIÓN DEL CLIENTE SE EDITO CORRECTAMENTE",
                address_client: AddressClient,
            });
        } catch (error) {
            // Manejo de errores en caso de que ocurra un problema
            console.log(error);
            res.status(500).send({
                message: "HUBO UN ERROR",
            });
        }
    },

    // Método para listar todas las direcciones de un cliente específico
    list: async (req, res) => {
        try {
            // Busca las direcciones de cliente asociadas al usuario especificado, ordenadas por fecha de creación
            let ADDRESS_CLIENT = await models.AddressClient.find({ user: req.query.user_id }).sort({ 'createdAt': -1 });
            // Responde con la lista de direcciones encontradas
            res.status(200).json({
                address_client: ADDRESS_CLIENT
            });
        } catch (error) {
            // Manejo de errores en caso de que ocurra un problema
            console.log(error);
            res.status(500).send({
                message: "HUBO UN ERROR",
            });
        }
    },

    // Método para eliminar una dirección de cliente
    remove: async (req, res) => {
        try {
            // Elimina la dirección de cliente con el ID proporcionado en los parámetros de la solicitud
            await models.AddressClient.findByIdAndDelete({ _id: req.params._id });
            // Responde confirmando la eliminación de la dirección
            res.status(200).json({
                message: "LA DIRECCIÓN DEL CLIENTE SE ELIMINO CORRECTAMENTE",
            });
        } catch (error) {
            // Manejo de errores en caso de que ocurra un problema
            console.log(error);
            res.status(500).send({
                message: "HUBO UN ERROR",
            });
        }
    },
}
