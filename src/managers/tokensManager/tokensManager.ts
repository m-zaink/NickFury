import DatabaseAssistant from "../../assistants/database/database";
import { Success, Failure, Empty } from "../../utils/typescriptx/typescriptx";
import UsersManager from "../usersManager/usersManager";
import {
    TokenCreationFailureReason,
    TokenDeletionFailureReason,
} from "./types";
import * as uuid from "uuid";
import { Session } from "../core/models";
import Dately from "../../utils/dately/dately";
import Tokenizer from "../../utils/tokenizer/tokenizer";
import SelfManager from "../selfManager/selfManager";
import logger, { LogLevel } from "../../utils/logger/logger";
import StreamAssistant from "../../assistants/stream/stream";
import { Credentials } from "../core/types";

export default class TokensManager {
    static readonly shared = new TokensManager();

    private constructor() {}

    async validateAccessToken(parameters: {
        accessToken: String;
    }): Promise<Session | null> {
        const session = Tokenizer.shared.decode<Session>({
            token: parameters.accessToken,
        });

        if (session !== null) {
            const sessionDocumentRef =
                DatabaseAssistant.shared.sessionDocumentRef({
                    userId: session.userId,
                    sessionId: session.id,
                });

            try {
                const sessionDocument = await sessionDocumentRef.get();

                if (sessionDocument.exists) {
                    return session;
                }

                return null;
            } catch (e) {
                logger(e, LogLevel.attention, [this, this.validateAccessToken]);

                return null;
            }
        }

        return null;
    }

    async createAccessToken(parameters: {
        credentials: {
            token: String;
            provider: String;
        };
        details: {
            name: String;
            email: String;
            image: String;
        };
    }): Promise<Success<Credentials> | Failure<TokenCreationFailureReason>> {
        // TODO: Validate token from credentials

        const user = await UsersManager.shared.userWithEmail({
            email: parameters.details.email,
        });

        const sessionId = uuid.v4();
        let session: Session;

        if (user !== null) {
            session = {
                id: sessionId,
                userId: user.id,
                creationDate: Dately.shared.now(),
            };
        } else {
            const selfCreation = await SelfManager.shared.create({
                email: parameters.details.email,
                image: parameters.details.image,
                name: parameters.details.name,
            });

            if (selfCreation instanceof Failure) {
                const reply = new Failure<TokenCreationFailureReason>(
                    TokenCreationFailureReason.unknown
                );

                return reply;
            }

            session = {
                id: sessionId,
                userId: selfCreation.data.id,
                creationDate: Dately.shared.now(),
            };
        }

        const sessionDocumentRef = DatabaseAssistant.shared.sessionDocumentRef({
            userId: session.userId,
            sessionId: session.id,
        });

        try {
            await sessionDocumentRef.create(session);

            const accessToken = Tokenizer.shared.encode<Session>({
                payload: session,
            });

            const timelineFeedFollowResult =
                await StreamAssistant.shared.timelineFeed.follow({
                    followerUserId: session.userId,
                    followeeUserId: session.userId,
                });

            if (timelineFeedFollowResult instanceof Failure) {
                const reply = new Failure<TokenCreationFailureReason>(
                    TokenCreationFailureReason.unknown
                );

                return reply;
            }

            const reply = new Success<Credentials>({
                accessToken: accessToken,
            });
            return reply;
        } catch (e) {
            logger(e, LogLevel.attention, [this, this.createAccessToken]);

            const reply = new Failure<TokenCreationFailureReason>(
                TokenCreationFailureReason.unknown
            );

            return reply;
        }
    }

    async deleteAccessToken(parameters: {
        accessToken: String;
    }): Promise<Success<Empty> | Failure<TokenDeletionFailureReason>> {
        const session = Tokenizer.shared.decode<Session>({
            token: parameters.accessToken,
        });

        if (session !== null) {
            const sessionDocumentRef =
                DatabaseAssistant.shared.sessionDocumentRef({
                    userId: session.userId,
                    sessionId: session.id,
                });

            try {
                await sessionDocumentRef.delete();

                const reply = new Success<Empty>({});
                return reply;
            } catch (e) {
                logger(e, LogLevel.attention, [this, this.deleteAccessToken]);

                const reply = new Failure<TokenDeletionFailureReason>(
                    TokenDeletionFailureReason.unknown
                );
                return reply;
            }
        }

        const reply = new Failure<TokenDeletionFailureReason>(
            TokenDeletionFailureReason.unknown
        );

        return reply;
    }
}
