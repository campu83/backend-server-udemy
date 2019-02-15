var express = require('express');

var fileUpload = require('express-fileupload');
var fs = require('fs');

var app = express();

var Usuario = require('../models/usuario');
var Medico = require('../models/medico');
var Hospital = require('../models/hospital');

// default options
app.use(fileUpload());

//Rutas
//request, response, next
app.put('/:tipo/:id', (req, res, next) => {

    var tipo = req.params.tipo;
    var id = req.params.id;

    // tipos de colección
    var tiposValidos = ['hospitales', 'medicos', 'usuarios'];
    if (tiposValidos.indexOf(tipo) < 0) {
        return res.status(400).json({
            ok: false,
            mensaje: 'Tipo de colección no es valida',
            errors: { message: 'Las colecciones validas son ' + tiposValidos.join(', ') }
        });
    }

    if (!req.files) {
        return res.status(400).json({
            ok: false,
            mensaje: 'No selecciono nada',
            errors: { message: 'Debe de seleccionar una imagen' }
        });
    }

    // Obtener nombre del archivo
    var archivo = req.files.imagen;
    var nombreCortado = archivo.name.split('.');
    var extensionArchivo = nombreCortado[nombreCortado.length - 1];

    // Solo estas extensiones de archivos aceptamos
    var extensionesValidas = ['png', 'jpg', 'gif', 'jpeg'];

    if (extensionesValidas.indexOf(extensionArchivo) < 0) {
        return res.status(400).json({
            ok: false,
            mensaje: 'Extension de archivo no válida',
            errors: { message: 'Las extensiones válidas son ' + extensionesValidas.join(', ') }
        });
    }

    // Nombre de archivo personalizado
    var nombreArchivo = `${ id }-${ new Date().getMilliseconds() }.${ extensionArchivo }`;

    // Mover el archivo del temporal a un path
    var path = `./uploads/${ tipo }/${ nombreArchivo }`;
    archivo.mv(path, err => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al mover archivo',
                errors: { message: err }
            });
        }
    });

    subirPorTipo(tipo, id, nombreArchivo, res);

});

function subirPorTipo(tipo, id, nombreArchivo, res) {
    switch (tipo) {
        case 'usuarios':
            Usuario.findById(id, (err, usuario) => {
                if (err) {
                    return res.status(400).json({
                        ok: false,
                        mensaje: 'No se encontro al usuario'
                    });
                } else if (usuario) {
                    var pathViejo = './uploads/usuarios/' + usuario.img; //Existe la imagen vieja? la elimino!
                    if (fs.existsSync(pathViejo)) {
                        fs.unlinkSync(pathViejo);
                    }

                    usuario.img = nombreArchivo;

                    usuario.save((err, usuarioActualizado) => {
                        if (err) {
                            return res.status(400).json({
                                ok: false,
                                mensaje: 'Error. No se pudo actualizar la imagen del usuario.'
                            });
                        } else {
                            return res.status(200).json({
                                ok: true,
                                mensaje: 'Imagen de usuario actualizada',
                                usuario: usuarioActualizado
                            });
                        }
                    });
                } else {
                    return res.status(400).json({
                        ok: false,
                        mensaje: 'Usuario no existe'
                    });
                }
            });
            break;
        case 'medicos':
            Medico.findById(id, (err, medico) => {
                if (err) {
                    return res.status(400).json({
                        ok: false,
                        mensaje: 'No se encontro al medico'
                    });
                } else if (medico) {
                    var pathViejo = './uploads/medicos/' + medico.img; //Existe la imagen vieja? la elimino!
                    if (fs.existsSync(pathViejo)) {
                        fs.unlinkSync(pathViejo);
                    }

                    medico.img = nombreArchivo;

                    medico.save((err, medicoActualizado) => {
                        if (err) {
                            return res.status(400).json({
                                ok: false,
                                mensaje: 'Error. No se pudo actualizar la imagen del medico.'
                            });
                        } else {
                            return res.status(200).json({
                                ok: true,
                                mensaje: 'Imagen de medico actualizada',
                                medico: medicoActualizado
                            });
                        }
                    });
                } else {
                    return res.status(400).json({
                        ok: false,
                        mensaje: 'Médico no existe'
                    });
                }
            });
            break;
        case 'hospitales':
            Hospital.findById(id, (err, hospital) => {
                if (err) {
                    return res.status(400).json({
                        ok: false,
                        mensaje: 'No se encontro al hospital'
                    });
                } else if (hospital) {
                    var pathViejo = './uploads/hospitals/' + hospital.img; //Existe la imagen vieja? la elimino!
                    if (fs.existsSync(pathViejo)) {
                        fs.unlinkSync(pathViejo);
                    }

                    hospital.img = nombreArchivo;

                    hospital.save((err, hospitalActualizado) => {
                        if (err) {
                            return res.status(400).json({
                                ok: false,
                                mensaje: 'Error. No se pudo actualizar la imagen del hospital.'
                            });
                        } else {
                            return res.status(200).json({
                                ok: true,
                                mensaje: 'Imagen de hospital actualizada',
                                hospital: hospitalActualizado
                            });
                        }
                    });
                } else {
                    return res.status(400).json({
                        ok: false,
                        mensaje: 'Hospital no existe'
                    });
                }
            });
            break;
    }
}

module.exports = app;