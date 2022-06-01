import * as uuid from "uuid";

import DatabaseAssistant from "../../assistants/database/database";
import Dately from "../../utils/dately/dately";
import logger, { LogLevel } from "../../utils/logger/logger";
import { Success, Failure } from "../../utils/typescriptx/typescriptx";
import { User } from "../core/models";
import UsersManager from "../usersManager/usersManager";
import { SelfCreationFailureReason, SelfUpdationFailureReason } from "./types";

export default class SelfManager {
    static readonly shared = new SelfManager();

    async create(parameters: {
        email: String;
        name: String;
        image: String;
    }): Promise<Success<User> | Failure<SelfCreationFailureReason>> {
        const isOtherUserExists = await UsersManager.shared.existsWithEmail({
            email: parameters.email,
        });

        if (isOtherUserExists) {
            const reply = new Failure<SelfCreationFailureReason>(
                SelfCreationFailureReason.otherUserWithThatEmailAlreadyExists
            );
            return reply;
        }

        const userId = uuid.v4();
        const username = (
            parameters.email.split("@")[0] + userId.substring(0, 5)
        ).toLocaleLowerCase();

        const user: User = {
            id: userId,
            name: parameters.name,
            email: parameters.email,
            description: "",
            image: parameters.image,
            username: username,
            activityDetails: {
                tweetsCount: 0,
            },
            socialDetails: {
                followersCount: 0,
                followeesCount: 0,
            },
            creationDate: Dately.shared.now(),
            lastUpdatedDate: Dately.shared.now(),
        };

        const userDocumentRef = DatabaseAssistant.shared.userDocumentRef({
            userId: userId,
        });

        try {
            await userDocumentRef.create(user);

            const reply = new Success<User>(user);
            return reply;
        } catch (e) {
            logger(e, LogLevel.attention, [this, this.create]);

            const reply = new Failure<SelfCreationFailureReason>(
                SelfCreationFailureReason.unknown
            );
            return reply;
        }
    }

    async self(parameters: { id: String }): Promise<User | null> {
        const userDocumentRef = DatabaseAssistant.shared.userDocumentRef({
            userId: parameters.id,
        });

        const userDocument = await userDocumentRef.get();

        if (userDocument.exists) {
            const user = userDocument.data() as unknown as User;

            return user;
        }

        return null;
    }

    async update(parameters: {
        id: String;
        updates: {
            username?: String;
            name?: String;
            image?: String;
            description?: String;
        };
    }): Promise<Success<User> | Failure<SelfUpdationFailureReason>> {
        if (parameters.updates.username !== undefined) {
            const user = await UsersManager.shared.userWithUsername({
                username: parameters.updates.username,
            });

            if (user !== null && user.id !== parameters.id) {
                const reply = new Failure<SelfUpdationFailureReason>(
                    SelfUpdationFailureReason.usernameUnavailable
                );

                return reply;
            }
        }

        try {
            const updatedUser = await DatabaseAssistant.shared.transaction(
                async (transaction) => {
                    const userDocumentRef =
                        DatabaseAssistant.shared.userDocumentRef({
                            userId: parameters.id,
                        });

                    const userDocument = await transaction.get(userDocumentRef);

                    const user = userDocument.data() as unknown as User;

                    const updatedUser: User = {
                        ...user,
                        username: parameters.updates.username || user.username,
                        image: parameters.updates.image || user.image,
                        name: parameters.updates.name || user.name,
                        description:
                            parameters.updates.description || user.description,
                    };

                    transaction.update(userDocumentRef, updatedUser);

                    return Promise.resolve(updatedUser);
                }
            );

            const reply = new Success<User>(updatedUser);

            return reply;
        } catch (e) {
            logger(e, LogLevel.attention, [this, this.update]);

            const reply = new Failure<SelfUpdationFailureReason>(
                SelfUpdationFailureReason.unknown
            );

            return reply;
        }
    }
}
