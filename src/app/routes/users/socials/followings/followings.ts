import { Router, Request, Response } from "express";
import Joi from "joi";
import { NoResourceRouteFailure, UnimplementedRouteFailure } from "../../../../core/types";
import paginated from "../../../../middlewares/paginated/paginated";
import { GroundZero, soldier } from "../../../../middlewares/soldier/soldier";

const followings = Router({
    mergeParams: true
});

followings.get(
    "/",
    paginated(),
    async (req: Request, res: Response) => {
        const response = new UnimplementedRouteFailure();

        res
            .status(UnimplementedRouteFailure.statusCode)
            .json(response);
    },
);

followings.post(
    "/",
    soldier({
        schema: Joi.object({
            userId: Joi.string().required(),
        }),
        groundZero: GroundZero.body,
    }),
    async (req: Request, res: Response) => {
        const response = new UnimplementedRouteFailure();

        res
            .status(UnimplementedRouteFailure.statusCode)
            .json(response);
    },
);

followings.delete(
    "/:userId",
    soldier({
        schema: Joi.object({
            userId: Joi.string().required(),
        }),
        groundZero: GroundZero.parameters,
    }),
    async (req: Request, res: Response) => {
        const response = new UnimplementedRouteFailure();

        res
            .status(UnimplementedRouteFailure.statusCode)
            .json(response);
    }
)

export = followings;