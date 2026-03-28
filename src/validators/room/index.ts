import Joi from 'joi';
import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '../../types/common.types';

const createRoomSchema: Joi.ObjectSchema = Joi.object({
  name: Joi.string().required().min(3).max(50),
  maxParticipants: Joi.number().integer().min(2).max(50).default(10),
});

const joinRoomSchema: Joi.ObjectSchema = Joi.object({
  code: Joi.string().required().length(6).uppercase(),
});

const validate = (schema: Joi.ObjectSchema, property: 'body' | 'query' | 'params' = 'body') => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { error, value } = schema.validate(req[property], { abortEarly: false });
    if (error) {
      res.status(422).json({
        success: false,
        message: 'Validation error',
        errors: error.details.map((d) => d.message),
      } as ApiResponse);
      return;
    }
    req[property] = value;
    next();
  };
};

export const createRoomValidator = validate(createRoomSchema, 'body');
export const joinRoomValidator = validate(joinRoomSchema, 'body');
