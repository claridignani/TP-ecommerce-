import models from '../models'; // Importa los modelos de la base de datos.
import resource from '../resources'; // Importa recursos relacionados a los sliders.
import fs from 'fs'; // Importa el módulo para manejar el sistema de archivos.
import path from 'path'; // Importa el módulo para manejar rutas de archivos.

export default {
    // Función para registrar un nuevo slider.
    register: async (req, res) => {
        try {
            // Verifica si se han recibido archivos en la solicitud.
            if (req.files) {
                var img_path = req.files.portada.path; // Obtiene la ruta de la imagen subida.
                var name = img_path.split('\\'); // Divide la ruta por separadores de carpeta.
                var portada_name = name[2]; // Obtiene el nombre de la imagen.
                req.body.imagen = portada_name; // Asigna el nombre de la imagen al cuerpo de la solicitud.
            }
            // Crea un nuevo slider en la base de datos.
            const slider = await models.Slider.create(req.body);
            res.status(200).json(slider); // Responde con el slider creado.
        } catch (error) {
            res.status(500).send({
                message: "OCURRIO UN PROBLEMA" // Responde con un mensaje de error.
            });
            console.log(error); // Imprime el error en consola.
        }
    },

    // Función para actualizar un slider existente.
    update: async (req, res) => {
        try {
            // Verifica si se ha recibido un nuevo archivo para la portada.
            if (req.files && req.files.portada) {
                var img_path = req.files.portada.path; // Obtiene la ruta de la imagen subida.
                var name = img_path.split('\\'); // Divide la ruta por separadores de carpeta.
                var portada_name = name[2]; // Obtiene el nombre de la imagen.
                req.body.imagen = portada_name; // Asigna el nombre de la imagen al cuerpo de la solicitud.
            }
            // Actualiza el slider en la base de datos.
            await models.Slider.findByIdAndUpdate({_id: req.body._id}, req.body);

            // Busca el slider actualizado para devolverlo en la respuesta.
            let SliderT = await models.Slider.findOne({_id: req.body._id});
            res.status(200).json({
                message: "EL SLIDER SE HA MODIFICADO CORRECTAMENTE",
                slider: resource.Slider.slider_list(SliderT), // Utiliza un recurso para dar formato a la respuesta.
            });
        } catch (error) {
            res.status(500).send({
                message: "OCURRIO UN PROBLEMA" // Responde con un mensaje de error.
            });
            console.log(error); // Imprime el error en consola.
        }
    },

    // Función para listar todos los sliders.
    list: async (req, res) => {
        try {
            var search = req.query.search; // Obtiene el término de búsqueda de la consulta.
            // Busca sliders que coincidan con el término de búsqueda.
            let Sliders = await models.Slider.find({
                $or: [
                    {"title": new RegExp(search, "i")}, // Permite buscar por título de manera insensible a mayúsculas.
                ]
            }).sort({'createdAt': -1}); // Ordena los resultados por fecha de creación descendente.

            // Formatea cada slider utilizando el recurso correspondiente.
            Sliders = Sliders.map((user) => {
                return resource.Slider.slider_list(user);
            });

            res.status(200).json({
                sliders: Sliders // Responde con la lista de sliders.
            });
        } catch (error) {
            res.status(500).send({
                message: "OCURRIO UN PROBLEMA" // Responde con un mensaje de error.
            });
            console.log(error); // Imprime el error en consola.
        }
    },

    // Función para obtener una imagen del slider.
    obtener_imagen: async (req, res) => {
        try {
            var img = req.params['img']; // Obtiene el nombre de la imagen de los parámetros de la solicitud.

            // Verifica si la imagen existe en el sistema de archivos.
            fs.stat('./uploads/slider/' + img, function(err) {
                if (!err) {
                    let path_img = './uploads/slider/' + img; // Si existe, establece la ruta de la imagen.
                    res.status(200).sendFile(path.resolve(path_img)); // Envía la imagen como respuesta.
                } else {
                    let path_img = './uploads/default.jpg'; // Si no existe, establece la ruta de una imagen por defecto.
                    res.status(200).sendFile(path.resolve(path_img)); // Envía la imagen por defecto como respuesta.
                }
            });
        } catch (error) {
            res.status(500).send({
                message: "OCURRIO UN PROBLEMA" // Responde con un mensaje de error.
            });
            console.log(error); // Imprime el error en consola.
        }
    },

    // Función para eliminar un slider.
    remove: async (req, res) => {
        try {
            await models.Slider.findByIdAndDelete({_id: req.query._id}); // Elimina el slider por su ID.
            res.status(200).json({
                message: "EL SLIDER SE ELIMINO CORRECTAMENTE", // Responde con un mensaje de éxito.
            });
        } catch (error) {
            res.status(500).send({
                message: "OCURRIO UN PROBLEMA" // Responde con un mensaje de error.
            });
            console.log(error); // Imprime el error en consola.
        }
    }
}
