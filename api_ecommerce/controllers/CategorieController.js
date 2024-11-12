import models from '../models'; // Importa los modelos necesarios para interactuar con la base de datos
import resource from '../resources'; // Importa recursos que pueden incluir funciones auxiliares
import fs from 'fs'; // Importa el módulo 'fs' para operaciones con el sistema de archivos
import path from 'path'; // Importa el módulo 'path' para trabajar con rutas de archivos

export default {
    // Método para registrar una nueva categoría
    register: async (req, res) => {
        try {
            // Verifica si se han subido archivos
            if (req.files) {
                // Obtiene la ruta de la imagen de portada
                var img_path = req.files.portada.path;
                // Separa la ruta para obtener solo el nombre del archivo
                var name = img_path.split('\\');
                var portada_name = name[2]; // Extrae el nombre de la imagen
                req.body.imagen = portada_name; // Asigna el nombre de la imagen al cuerpo de la solicitud
            }
            // Crea una nueva categoría en la base de datos
            const categorie = await models.Categorie.create(req.body);
            // Responde con la categoría creada
            res.status(200).json(categorie);
        } catch (error) {
            // Manejo de errores en caso de que ocurra un problema
            res.status(500).send({
                message: "OCURRIO UN PROBLEMA"
            });
            console.log(error);
        }
    },

    // Método para actualizar una categoría existente
    update: async (req, res) => {
        try {
            // Verifica si se han subido archivos y si hay una nueva portada
            if (req.files && req.files.portada) {
                var img_path = req.files.portada.path; // Obtiene la ruta de la nueva imagen de portada
                var name = img_path.split('\\'); // Separa la ruta para obtener el nombre del archivo
                var portada_name = name[2]; // Extrae el nombre de la imagen
                req.body.imagen = portada_name; // Asigna el nombre de la nueva imagen al cuerpo de la solicitud
            }
            // Actualiza la categoría en la base de datos utilizando el ID proporcionado
            await models.Categorie.findByIdAndUpdate({ _id: req.body._id }, req.body);
            // Busca la categoría actualizada para enviarla en la respuesta
            let CategorieT = await models.Categorie.findOne({ _id: req.body._id });
            // Responde con un mensaje de éxito y la categoría actualizada
            res.status(200).json({
                message: "LA CATEGORIA SE HA MODIFICADO CORRECTAMENTE",
                categorie: resource.Categorie.categorie_list(CategorieT), // Utiliza una función de recurso para formatear la respuesta
            });
        } catch (error) {
            // Manejo de errores en caso de que ocurra un problema
            res.status(500).send({
                message: "OCURRIO UN PROBLEMA"
            });
            console.log(error);
        }
    },

    // Método para listar categorías que coincidan con un término de búsqueda
    list: async (req, res) => {
        try {
            var search = req.query.search; // Obtiene el término de búsqueda de los parámetros de la consulta
            // Busca categorías que coincidan con el término de búsqueda (sin importar mayúsculas/minúsculas)
            let Categories = await models.Categorie.find({
                $or: [
                    { "title": new RegExp(search, "i") }, // Busca en el título
                ]
            }).sort({ 'createdAt': -1 }); // Ordena por fecha de creación de forma descendente

            // Mapea las categorías encontradas para formatear la respuesta
            Categories = Categories.map((user) => {
                return resource.Categorie.categorie_list(user);
            });

            // Responde con la lista de categorías encontradas
            res.status(200).json({
                categories: Categories
            });
        } catch (error) {
            // Manejo de errores en caso de que ocurra un problema
            res.status(500).send({
                message: "OCURRIO UN PROBLEMA"
            });
            console.log(error);
        }
    },

    // Método para obtener la imagen de una categoría
    obtener_imagen: async (req, res) => {
        try {
            var img = req.params['img']; // Obtiene el nombre de la imagen de los parámetros de la solicitud

            // Verifica si la imagen existe en la ruta especificada
            fs.stat('./uploads/categorie/' + img, function (err) {
                if (!err) {
                    let path_img = './uploads/categorie/' + img; // Ruta de la imagen encontrada
                    res.status(200).sendFile(path.resolve(path_img)); // Envía la imagen al cliente
                } else {
                    let path_img = './uploads/default.jpg'; // Ruta de la imagen por defecto
                    res.status(200).sendFile(path.resolve(path_img)); // Envía la imagen por defecto si no se encuentra
                }
            });
        } catch (error) {
            // Manejo de errores en caso de que ocurra un problema
            res.status(500).send({
                message: "OCURRIO UN PROBLEMA"
            });
            console.log(error);
        }
    },

    // Método para eliminar una categoría
    remove: async (req, res) => {
        try {
            // Elimina la categoría con el ID proporcionado en los parámetros de la consulta
            await models.Categorie.findByIdAndDelete({ _id: req.query._id });
            // Responde confirmando la eliminación de la categoría
            res.status(200).json({
                message: "LA CATEGORIA SE ELIMINO CORRECTAMENTE",
            });
        } catch (error) {
            // Manejo de errores en caso de que ocurra un problema
            res.status(500).send({
                message: "OCURRIO UN PROBLEMA"
            });
            console.log(error);
        }
    }
}
