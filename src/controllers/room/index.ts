import { Response, NextFunction } from 'express';
import { RoomService } from '../../services/room';
import { ApiResponse, AuthenticatedRequest } from '../../types/common.types';
import { CreateRoomInput, JoinRoomInput } from '../../types/room.types';

export class RoomController {
  static async create(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await RoomService.createRoom(req.user!.id, req.body as CreateRoomInput);
      res.status(201).json({
        success: true,
        message: 'Room created successfully',
        data: result,
      } as ApiResponse);
    } catch (error) {
      next(error);
    }
  }

  static async join(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { code } = req.body as JoinRoomInput;
      const result = await RoomService.joinRoom(req.user!.id, code);
      res.status(200).json({
        success: true,
        message: 'Joined room successfully',
        data: result,
      } as ApiResponse);
    } catch (error) {
      next(error);
    }
  }

  static async getDetails(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const result = await RoomService.getRoomDetails(req.params.code);
      res.status(200).json({
        success: true,
        message: 'Room details retrieved',
        data: result,
      } as ApiResponse);
    } catch (error) {
      next(error);
    }
  }

  static async leave(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      await RoomService.leaveRoom(req.user!.id, req.params.id);
      res.status(200).json({
        success: true,
        message: 'Left room successfully',
      } as ApiResponse);
    } catch (error) {
      next(error);
    }
  }

  static async kick(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      await RoomService.kickUser(req.user!.id, req.params.roomId, req.params.userId);
      res.status(200).json({
        success: true,
        message: 'User kicked successfully',
      } as ApiResponse);
    } catch (error) {
      next(error);
    }
  }

  static async close(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      await RoomService.closeRoom(req.user!.id, req.params.id);
      res.status(200).json({
        success: true,
        message: 'Room closed successfully',
      } as ApiResponse);
    } catch (error) {
      next(error);
    }
  }
}
