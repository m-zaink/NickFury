import {
    Request,
    Response,
    Router
} from "express";
import Joi from "joi";
import { TokensManager } from "../../../managers/tokensManager/tokensManager";
import { AuthProvider } from "../../../managers/tokensManager/types";
import { Failure } from "../../../utils/typescriptx/typescriptx";
import {
    IncorrectArgumentsRouteFailure,
    InternalRouteFailure,
    NoContentRouteSuccess,
    OkRouteSuccess,
    UnimplementedRouteFailure
} from "../../core/types";
import { gatekeeper } from "../../middlewares/gatekeeper/gatekeeper";
import {
    GroundZero,
    soldier
} from "../../middlewares/soldier/soldier";

const tokens = Router({
    mergeParams: true
});

tokens.post(
    "/",
    soldier({
        schema: Joi.object({
            credentials: Joi.object({
                token: Joi.string().required(),
                provider: Joi.string().valid(
                    AuthProvider.apple.valueOf(),
                    AuthProvider.google.valueOf()
                ).required(),
            }).required(),
            details: Joi.object({
                name: Joi.string().required(),
                email: Joi.string().email().required(),
                image: Joi.string().uri().required()
            }).required(),
        }),
        groundZero: GroundZero.body,
    }),
    async (req: Request, res: Response) => {
        const parameters: {
            credentials: {
                token: String;
                provider: String;
            },
            details: {
                name: String;
                email: String;
                image: String;
            }
        } = req.body;

        const tokenCreationResult = await TokensManager.shared.createAccessToken({
            credentials: {
                token: parameters.credentials.token,
                provider: parameters.credentials.provider
            },
            details: {
                name: parameters.details.name,
                email: parameters.details.email,
                image: parameters.details.image
            }
        });


        if (tokenCreationResult instanceof Failure) {
            const response = new InternalRouteFailure();

            res
                .status(InternalRouteFailure.statusCode)
                .json(response);
        } else {
            const response = new OkRouteSuccess(tokenCreationResult.data);

            res
                .status(OkRouteSuccess.statusCode)
                .json(response);
        }
    },
);


tokens.delete(
    "/",
    gatekeeper(),
    async (req: Request, res: Response) => {
        const authorization = req.headers.authorization;

        if (authorization !== undefined) {
            const accessToken = authorization.substring(7);

            const tokenDeletionResult = await TokensManager.shared.deleteAccessToken({
                accessToken: accessToken
            });

            if (tokenDeletionResult instanceof Failure) {
                const response = new UnimplementedRouteFailure();

                res
                    .status(UnimplementedRouteFailure.statusCode)
                    .json(response);
            } else {
                const response = new NoContentRouteSuccess();

                res
                    .status(NoContentRouteSuccess.statusCode)
                    .json(response);
            }
        } else {
            const response = new IncorrectArgumentsRouteFailure();

            res
                .status(IncorrectArgumentsRouteFailure.statusCode)
                .json(response);
        }
    },
);

export = tokens;