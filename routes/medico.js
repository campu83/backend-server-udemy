var express = require('express');

var mdAutenticacion = require('../middlewares/autentificacion');

var app = express();

var Medico = require('../models/medico');

//Rutas

// ============================================================
// Obtener todos los medicos
// ============================================================
app.get('/', (req, res, next) => { //request, response, next

    var desde = req.query.desde || 0;
    desde = Number(desde);

    Medico.find({})
        // Con skip y limit resolvemos la paginacion.
        .skip(desde) //Con esto indicamos el numero de registros que queremos que salte
        .limit(5) //Con esto indicamos el numero de registros que queremos de vuelta
        .populate('usuario', 'nombre email')
        .populate('hospital')
        .exec((err, medicos) => {

            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error cargando medicos!',
                    errors: err
                });
            }

            Medico.count({}, (err, conteo) => {
                res.status(200).json({
                    ok: true,
                    medicos: medicos,
                    total: conteo
                });
            });

        });

});

// ============================================================
// Actualizar medico
// ============================================================
app.put('/:id', mdAutenticacion.verificaToken, (req, res) => {

    var id = req.params.id;

    var body = req.body;

    Medico.findById(id, (err, medico) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar el médico!',
                errors: err
            });
        }

        if (!medico) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El medico con el id ' + id + ' no existe',
                errors: { message: 'No existe un medico con ese ID' }
            });
        }

        medico.nombre = body.nombre;
        medico.usuario = req.usuario._id;
        medico.hospital = body.hospital;

        medico.save((err, medicoGuardado) => {

            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar el médico',
                    errors: err
                });
            }

            res.status(200).json({
                ok: true,
                medico: medicoGuardado
            });
        });
    });
});


// ============================================================
// Crear un nuevo medico
// ============================================================
app.post('/', mdAutenticacion.verificaToken, (req, res) => {

    var body = req.body;

    var medico = new Medico({
        nombre: body.nombre,
        usuario: req.usuario._id,
        hospital: body.hospital
    });

    medico.save((err, medicoGuardado) => {

        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear el médico!',
                errors: err
            });
        }

        res.status(201).json({
            ok: true,
            medico: medicoGuardado
        });

    });

});

// ============================================================
// Borrar un medico por el id
// ============================================================
app.delete('/:id', mdAutenticacion.verificaToken, (req, res) => {

    var id = req.params.id;

    Medico.findByIdAndRemove(id, (err, medicoBorrado) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar el médico!',
                errors: err
            });
        }

        if (!medicoBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'No existe un médico con ese id!',
                errors: { message: 'No existe un médico con ese id!' }
            });
        }

        res.status(200).json({
            ok: true,
            medico: medicoBorrado
        });


    });
});

module.exports = app;