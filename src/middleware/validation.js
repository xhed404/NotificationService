const Joi = require('joi');

const schemas = {
  sendEmail: Joi.object({
    to: Joi.string().email().required(),
    subject: Joi.string().min(1).max(200),
    html: Joi.string(),
    text: Joi.string(),
    template: Joi.string().valid('welcome', 'passwordReset', 'notification'),
    data: Joi.object().when('template', {
      is: Joi.exist(),
      then: Joi.required(),
      otherwise: Joi.optional()
    }),
    from: Joi.string().email(),
    attachments: Joi.array().items(
      Joi.object({
        filename: Joi.string().required(),
        content: Joi.string().base64().required()
      })
    )
  }).xor('template', 'subject'),

  sendBulk: Joi.object({
    recipients: Joi.array().items(
      Joi.object({
        to: Joi.string().email().required(),
        data: Joi.object()
      })
    ).min(1).max(1000).required(),
    template: Joi.string().required(),
    delay: Joi.number().integer().min(0).default(0)
  }),

  jobStatus: Joi.object({
    jobId: Joi.string().required()
  })
};

const validate = (schemaName) => {
  return (req, res, next) => {
    const schema = schemas[schemaName];
    if (!schema) {
      return res.status(500).json({ error: `Unknown schema: ${schemaName}` });
    }

    const { error, value } = schema.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        error: 'Validation failed',
        details: error.details.map(d => d.message)
      });
    }

    req.validatedBody = value;
    next();
  };
};

module.exports = { validate };
